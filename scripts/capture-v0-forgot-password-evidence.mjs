import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const currentBaseUrl = process.env.V0_CURRENT_BASE_URL ?? 'http://127.0.0.1:5173';
const legacyBaseUrl = process.env.V0_LEGACY_BASE_URL ?? 'http://127.0.0.1:4000';
const captureDate = process.env.V0_CAPTURE_DATE ?? '2026-04-23';
const outputRoot = path.join(root, 'docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23');
const manifestPath = path.join(outputRoot, 'capture-manifest.json');
const viewport = { width: 1440, height: 900 };

const seededEmail = 'kauemsc@gmail.com';
const unknownEmail = 'forgot-password-unknown@example.invalid';
const failureEmail = 'forgot-password-failure@example.invalid';

const targets = [
  { app: 'legacy', baseUrl: legacyBaseUrl, outputDir: 'legacy' },
  { app: 'current', baseUrl: currentBaseUrl, outputDir: 'current' },
];

const outcomes = [
  { name: 'mail-sent', email: seededEmail, msg: 'mail_sent' },
  { name: 'mail-not-found', email: unknownEmail, msg: 'mail_not_found' },
  { name: 'mail-error', email: failureEmail, msg: 'mail_error' },
];

async function newPage(browser) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  return { context, page };
}

async function gotoForgot(page, baseUrl) {
  await page.goto(`${baseUrl}/forgot-password`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.locator('body').waitFor({ state: 'visible', timeout: 10000 });
}

async function fillEmail(page, email) {
  const emailInput = page.locator('input[type="email"], input#email, input[placeholder*="Email" i]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(email);
}

async function clickSubmit(page) {
  const submit = page.locator('button[type="submit"], input[type="submit"]').first();
  await submit.waitFor({ state: 'visible', timeout: 10000 });
  await submit.click();
}

async function waitForIntercept(getValue, timeoutMs = 2500) {
  const startedAt = Date.now();
  while (!getValue() && Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function screenshot(page, target, fileName) {
  const filePath = path.join(outputRoot, target.outputDir, fileName);
  await page.screenshot({ path: filePath, fullPage: false });
  return path.relative(root, filePath);
}

async function captureReady(browser, target) {
  const { context, page } = await newPage(browser);
  try {
    await gotoForgot(page, target.baseUrl);
    const screenshotPath = await screenshot(page, target, `${target.app}-forgot-password-ready-1440x900.png`);
    return record(target, 'ready', target.baseUrl, page.url(), screenshotPath, 'route-open', null);
  } finally {
    await context.close();
  }
}

async function captureSubmitting(browser, target) {
  const { context, page } = await newPage(browser);
  let intercepted = false;
  try {
    await page.route('**/*forgot-password**', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        intercepted = true;
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ msg: 'mail_sent' }) });
        return;
      }
      await route.continue();
    });
    await gotoForgot(page, target.baseUrl);
    await fillEmail(page, seededEmail);
    await clickSubmit(page);
    await waitForIntercept(() => intercepted);
    await page.waitForTimeout(250);
    const screenshotPath = await screenshot(page, target, `${target.app}-forgot-password-submitting-1440x900.png`);
    return record(target, 'submitting', target.baseUrl, page.url(), screenshotPath, 'mocked-pending-post', { emailKind: 'seeded', intercepted });
  } finally {
    await context.close();
  }
}

async function captureOutcome(browser, target, outcome) {
  const { context, page } = await newPage(browser);
  let intercepted = false;
  try {
    await page.route('**/*forgot-password**', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        intercepted = true;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ msg: outcome.msg }) });
        return;
      }
      await route.continue();
    });
    await gotoForgot(page, target.baseUrl);
    await fillEmail(page, outcome.email);
    await clickSubmit(page);
    await waitForIntercept(() => intercepted);
    await page.waitForTimeout(outcome.msg === 'mail_sent' ? 1000 : 900);
    const screenshotPath = await screenshot(page, target, `${target.app}-forgot-password-${outcome.name}-1440x900.png`);
    return record(target, outcome.name, target.baseUrl, page.url(), screenshotPath, `mocked-${outcome.msg}`, {
      emailKind: outcome.email === seededEmail ? 'seeded' : 'synthetic-non-sensitive',
      intercepted,
    });
  } finally {
    await context.close();
  }
}

function record(target, state, baseUrl, finalUrl, screenshotPath, trigger, data) {
  return {
    app: target.app,
    route: '/forgot-password',
    url: `${baseUrl}/forgot-password`,
    finalUrl,
    viewport,
    state,
    trigger,
    data,
    screenshot: screenshotPath,
    status: 'captured',
  };
}

await mkdir(path.join(outputRoot, 'legacy'), { recursive: true });
await mkdir(path.join(outputRoot, 'current'), { recursive: true });

const browser = await chromium.launch({ headless: true });
const records = [];

try {
  for (const target of targets) {
    records.push(await captureReady(browser, target));
  }

  for (const target of targets) {
    records.push(await captureSubmitting(browser, target));
  }

  for (const outcome of outcomes) {
    for (const target of targets) {
      records.push(await captureOutcome(browser, target, outcome));
    }
  }
} finally {
  await browser.close();
}

await writeFile(manifestPath, `${JSON.stringify({
  captureDate,
  viewport,
  currentBaseUrl,
  legacyBaseUrl,
  route: '/forgot-password',
  totalRecords: records.length,
  records,
  securityExclusions: [
    'no passwords',
    'no auth tokens',
    'no reset tokens',
    'no provider payloads',
    'no signed URLs',
  ],
}, null, 2)}\n`);

console.log(`Captured ${records.length} /forgot-password screenshots.`);
console.log(path.relative(root, manifestPath));
