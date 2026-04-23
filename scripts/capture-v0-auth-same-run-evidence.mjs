import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const currentBaseUrl = process.env.V0_CURRENT_BASE_URL ?? 'http://127.0.0.1:5173';
const legacyBaseUrl = process.env.V0_LEGACY_BASE_URL ?? 'http://127.0.0.1:4000';
const captureDate = process.env.V0_CAPTURE_DATE ?? '2026-04-23';
const outputRoot = path.join(root, 'docs/visual-evidence-assets/v0/auth-same-run-2026-04-23');
const manifestPath = path.join(outputRoot, 'capture-manifest.json');
const viewport = { width: 1440, height: 900 };

const seededEmail = 'kauemsc@gmail.com';
const invalidEmail = 'auth-invalid@example.invalid';
const syntheticPassword = 'visual-evidence-password';

const appTargets = [
  { app: 'legacy', baseUrl: legacyBaseUrl, outputDir: 'legacy' },
  { app: 'current', baseUrl: currentBaseUrl, outputDir: 'current' },
];

const loginOutcomes = [
  { state: 'invalid-credentials', error: 'invalid credentials', trigger: 'mocked-invalid-login' },
  { state: 'two-factor-required', error: '2fa code required', trigger: 'mocked-2fa-required' },
  { state: 'two-factor-failed', error: '2fa code failed', trigger: 'mocked-2fa-failed' },
  { state: 'sso-mandatory', error: 'cezanne-sso-mandatory', trigger: 'mocked-sso-mandatory' },
  { state: 'activation-required', error: 'need to be activated', trigger: 'mocked-activation-required' },
  { state: 'setup-required', error: 'setup required', trigger: 'mocked-setup-required' },
];

const resetOutcomes = [
  { state: 'invalid-token', validTokenMsg: 'token_not_found', trigger: 'mocked-token-not-found' },
  { state: 'expired-token', submitMsg: 'token_expired', trigger: 'mocked-token-expired' },
  { state: 'success', submitMsg: 'token_accepted', trigger: 'mocked-token-accepted' },
  { state: 'failure', submitMsg: 'token_invalid', trigger: 'mocked-token-invalid' },
];

async function newPage(browser) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  return { context, page };
}

async function gotoRoute(page, baseUrl, route) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'commit', timeout: 20000 });
  await page.locator('html').waitFor({ state: 'attached', timeout: 10000 });
  await page.waitForTimeout(300);
}

async function screenshot(page, target, fileName) {
  const filePath = path.join(outputRoot, target.outputDir, fileName);
  await page.screenshot({ path: filePath, fullPage: false });
  return path.relative(root, filePath);
}

async function fillLogin(page, email = seededEmail) {
  await page.locator('input[type="email"], input#email, [data-testid="auth-login-email"]').first().fill(email);
  await page.locator('input[type="password"], input#password, [data-testid="auth-login-password"]').first().fill(syntheticPassword);
}

async function clickLogin(page) {
  await page.locator('button[type="submit"], input[type="submit"], [data-testid="auth-login-submit"]').first().click();
}

async function installLoginMock(page, target, outcome) {
  await page.route('**/*/login', async (route) => {
    const request = route.request();
    if (request.method() !== 'POST') return route.continue();
    if (outcome.state === 'submitting') {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'invalid credentials' }) });
    }
    if (outcome.state === 'redirecting') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'visual-evidence-login-token' }) });
    }
    return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: outcome.error }) });
  });

  if (target.app === 'current') {
    await page.route('**/authenticate', async (route) => {
      if (outcome.state === 'bootstrap-failure') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: authUserFixture() }) });
    });
    await page.route('**/graphql', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(authGraphqlFixture()) }));
  }
}

async function captureLoginReady(browser, target) {
  const { context, page } = await newPage(browser);
  try {
    await gotoRoute(page, target.baseUrl, '/');
    return record(target, 'login', 'ready', '/', target.baseUrl, page.url(), await screenshot(page, target, `${target.app}-login-ready-1440x900.png`), 'route-open', null);
  } finally {
    await context.close();
  }
}

async function captureLoginFilled(browser, target) {
  const { context, page } = await newPage(browser);
  try {
    await gotoRoute(page, target.baseUrl, '/');
    await fillLogin(page);
    return record(target, 'login', 'filled', '/', target.baseUrl, page.url(), await screenshot(page, target, `${target.app}-login-filled-1440x900.png`), 'synthetic-fill', { emailKind: 'seeded', passwordKind: 'synthetic-hidden' });
  } finally {
    await context.close();
  }
}

async function captureLoginOutcome(browser, target, outcome) {
  const { context, page } = await newPage(browser);
  try {
    if (target.app === 'current' && ['bootstrap-failure', 'redirecting'].includes(outcome.state)) {
      await gotoRoute(page, target.baseUrl, `/?visualState=${outcome.state}`);
      return record(target, 'login', outcome.state, `/?visualState=${outcome.state}`, target.baseUrl, page.url(), await screenshot(page, target, `${target.app}-login-${outcome.state}-1440x900.png`), 'current-visual-state-hook', null);
    }

    await installLoginMock(page, target, outcome);
    await gotoRoute(page, target.baseUrl, '/');
    await fillLogin(page, outcome.state === 'invalid-credentials' ? invalidEmail : seededEmail);
    await clickLogin(page);
    await page.waitForTimeout(outcome.state === 'submitting' ? 300 : 900);
    return record(target, 'login', outcome.state, '/', target.baseUrl, page.url(), await screenshot(page, target, `${target.app}-login-${outcome.state}-1440x900.png`), outcome.trigger, { emailKind: outcome.state === 'invalid-credentials' ? 'synthetic-non-sensitive' : 'seeded', passwordKind: 'synthetic-hidden' });
  } finally {
    await context.close();
  }
}

async function installResetMocks(page, outcome = {}) {
  await page.route('**/*valid-token**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ msg: outcome.validTokenMsg ?? 'token_valid' }) });
  });
  await page.route('**/*reset-password**', async (route) => {
    const request = route.request();
    if (request.method() !== 'POST') return route.continue();
    if (outcome.state === 'submitting') {
      await new Promise((resolve) => setTimeout(resolve, 1800));
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ msg: outcome.submitMsg ?? 'token_accepted' }) });
  });
}

async function fillReset(page, confirmation = syntheticPassword) {
  const inputs = page.locator('input[type="password"]');
  await inputs.nth(0).fill(syntheticPassword);
  await inputs.nth(1).fill(confirmation);
}

async function clickReset(page) {
  await page.locator('button[type="submit"], input[type="submit"]').first().click();
}

async function captureResetReady(browser, target) {
  const { context, page } = await newPage(browser);
  try {
    await installResetMocks(page, { state: 'validating' });
    await gotoRoute(page, target.baseUrl, '/reset-password/visual-reset-token');
    return record(target, 'reset-password', 'validating-ready', '/reset-password/visual-reset-token', target.baseUrl, page.url(), await screenshot(page, target, `${target.app}-reset-password-validating-ready-1440x900.png`), 'mocked-valid-token-check', { tokenKind: 'synthetic-route-token' });
  } finally {
    await context.close();
  }
}

async function captureResetMismatch(browser, target) {
  const { context, page } = await newPage(browser);
  try {
    await installResetMocks(page, { state: 'mismatch' });
    await gotoRoute(page, target.baseUrl, '/reset-password/visual-reset-token');
    await fillReset(page, `${syntheticPassword}-mismatch`);
    await clickReset(page);
    await page.waitForTimeout(600);
    return record(target, 'reset-password', 'password-mismatch', '/reset-password/visual-reset-token', target.baseUrl, page.url(), await screenshot(page, target, `${target.app}-reset-password-password-mismatch-1440x900.png`), 'synthetic-mismatched-passwords', { tokenKind: 'synthetic-route-token', passwordKind: 'synthetic-hidden' });
  } finally {
    await context.close();
  }
}

async function captureResetOutcome(browser, target, outcome) {
  const { context, page } = await newPage(browser);
  try {
    await installResetMocks(page, outcome);
    await gotoRoute(page, target.baseUrl, '/reset-password/visual-reset-token');
    if (outcome.validTokenMsg === 'token_not_found') {
      await page.waitForTimeout(900);
    } else {
      await fillReset(page);
      await clickReset(page);
      await page.waitForTimeout(outcome.state === 'submitting' ? 300 : 1000);
    }
    return record(target, 'reset-password', outcome.state, '/reset-password/visual-reset-token', target.baseUrl, page.url(), await screenshot(page, target, `${target.app}-reset-password-${outcome.state}-1440x900.png`), outcome.trigger, { tokenKind: 'synthetic-route-token', passwordKind: outcome.validTokenMsg ? undefined : 'synthetic-hidden' });
  } finally {
    await context.close();
  }
}

async function captureSessionLoss(browser, target) {
  const { context, page } = await newPage(browser);
  try {
    await gotoRoute(page, target.baseUrl, '/session-lost');
    return record(target, 'session-loss', 'session-expired', '/session-lost', target.baseUrl, page.url(), await screenshot(page, target, `${target.app}-session-lost-1440x900.png`), target.app === 'current' ? 'route-open-session-loss' : 'legacy-route-probe', null);
  } finally {
    await context.close();
  }
}

function record(target, family, state, route, baseUrl, finalUrl, screenshotPath, trigger, data) {
  return {
    app: target.app,
    family,
    route,
    url: `${baseUrl}${route}`,
    finalUrl,
    viewport,
    state,
    trigger,
    data,
    screenshot: screenshotPath,
    status: 'captured',
  };
}

function authUserFixture() {
  return {
    id: 1,
    first_name: 'Visual',
    hiring_companies: [{ pivot: { is_admin: 1, candidates: 1, favorites: 1 }, current_subscription: { contracts: 1 } }],
    featureFlags: { customFieldsBeta: true },
  };
}

function authGraphqlFixture() {
  return {
    data: {
      monolith: {
        auth: { firstName: 'Visual', calendarIntegration: { status: 'connected' } },
        featureFlags: { customFieldsBeta: true },
        userSettingsUiSession: 'visual-evidence',
      },
      billing: { currentSubscriptionUsage: { smsIncluded: 0, hidden: false } },
    },
  };
}

await mkdir(path.join(outputRoot, 'legacy'), { recursive: true });
await mkdir(path.join(outputRoot, 'current'), { recursive: true });

const browser = await chromium.launch({ headless: true });
const records = [];

try {
  for (const target of appTargets) records.push(await captureLoginReady(browser, target));
  for (const target of appTargets) records.push(await captureLoginFilled(browser, target));

  for (const outcome of [
    { state: 'submitting', error: 'invalid credentials', trigger: 'mocked-pending-login' },
    ...loginOutcomes,
    { state: 'bootstrap-failure', trigger: 'current-bootstrap-failure-hook' },
    { state: 'redirecting', trigger: 'current-redirecting-hook' },
  ]) {
    for (const target of appTargets) {
      if (target.app === 'legacy' && ['bootstrap-failure', 'redirecting'].includes(outcome.state)) continue;
      records.push(await captureLoginOutcome(browser, target, outcome));
    }
  }

  for (const target of appTargets) records.push(await captureResetReady(browser, target));
  for (const target of appTargets) records.push(await captureResetMismatch(browser, target));
  for (const outcome of [
    ...resetOutcomes,
    { state: 'submitting', submitMsg: 'token_accepted', trigger: 'mocked-pending-reset-post' },
  ]) {
    for (const target of appTargets) records.push(await captureResetOutcome(browser, target, outcome));
  }

  for (const target of appTargets) records.push(await captureSessionLoss(browser, target));
} finally {
  await browser.close();
}

await writeFile(manifestPath, `${JSON.stringify({
  captureDate,
  viewport,
  currentBaseUrl,
  legacyBaseUrl,
  totalRecords: records.length,
  records,
  notes: [
    'Legacy bootstrap-failure and redirecting login states were not captured because the legacy flow immediately hands off after token set and requires broader authenticated app mocking.',
    'Legacy /session-lost is a route probe only; the legacy app has no confirmed standalone session-lost route matching current /session-lost.',
  ],
  securityExclusions: [
    'no raw passwords',
    'no auth tokens',
    'no reset tokens',
    'no provider payloads',
    'no signed URLs',
    'no tenant-sensitive identifiers',
  ],
}, null, 2)}\n`);

console.log(`Captured ${records.length} V0 auth same-run screenshots.`);
console.log(path.relative(root, manifestPath));
