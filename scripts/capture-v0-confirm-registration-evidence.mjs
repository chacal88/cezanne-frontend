import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const currentBaseUrl = process.env.V0_CURRENT_BASE_URL ?? 'http://localhost:5173';
const legacyBaseUrl = process.env.V0_LEGACY_BASE_URL ?? 'http://127.0.0.1:4000';
const captureDate = process.env.V0_CAPTURE_DATE ?? '2026-04-23';
const outputRoot = path.join(root, 'docs/visual-evidence-assets/v0/confirm-registration-same-run-2026-04-23');
const manifestPath = path.join(outputRoot, 'capture-manifest.json');
const viewport = { width: 1440, height: 900 };
const routePath = '/confirm-registration/visual-confirm-token';

const appTargets = [
  { app: 'legacy', baseUrl: legacyBaseUrl, outputDir: 'legacy' },
  { app: 'current', baseUrl: currentBaseUrl, outputDir: 'current' },
];

const outcomes = [
  { state: 'invalid-token', response: { msg: 'token_invalid' }, trigger: 'mocked-confirm-token-invalid' },
  { state: 'valid-session-ready', response: { msg: 'token_valid', token: 'visual-evidence-confirm-session-token', user: authUserFixture() }, trigger: 'mocked-confirm-token-valid-session' },
  { state: 'pending-approval', response: { msg: 'approval_pending', is_hiring_company: true }, trigger: 'mocked-confirm-approval-pending' },
  { state: 'bootstrap-failure', response: { msg: 'token_valid', token: 'visual-evidence-confirm-session-token', user: authUserFixture() }, trigger: 'mocked-confirm-bootstrap-failure' },
];

async function newPage(browser) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  return { context, page };
}

async function installMocks(page, target, outcome) {
  const firstAccessResponse = target.app === 'legacy' && outcome.state === 'bootstrap-failure'
    ? { msg: 'bootstrap_failed' }
    : outcome.response;

  await page.route('**/user/first-access**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(firstAccessResponse) });
  });
  await page.route('**/authenticate', async (route) => {
    if (outcome.state === 'bootstrap-failure') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: authUserFixture() }) });
  });
  await page.route('**/graphql', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(authGraphqlFixture()) }));
}

async function captureOutcome(browser, target, outcome) {
  const { context, page } = await newPage(browser);
  try {
    await installMocks(page, target, outcome);
    await page.goto(`${target.baseUrl}${routePath}`, { waitUntil: 'commit', timeout: 20000 });
    await page.locator('html').waitFor({ state: 'attached', timeout: 10000 });
    await page.waitForTimeout(outcome.state === 'valid-session-ready' ? 1800 : 1300);
    const filePath = path.join(outputRoot, target.outputDir, `${target.app}-confirm-registration-${outcome.state}-1440x900.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    return {
      app: target.app,
      family: 'confirm-registration',
      route: routePath,
      url: `${target.baseUrl}${routePath}`,
      finalUrl: page.url(),
      viewport,
      state: outcome.state,
      trigger: outcome.trigger,
      data: {
        tokenKind: 'synthetic-route-token',
        responseKind: outcome.response.msg,
        sessionTokenKind: outcome.response.token ? 'synthetic-hidden' : undefined,
      },
      screenshot: path.relative(root, filePath),
      status: 'captured',
    };
  } finally {
    await context.close();
  }
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
  for (const outcome of outcomes) {
    for (const target of appTargets) records.push(await captureOutcome(browser, target, outcome));
  }
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
    'Captures use the approved 2026-04-23 confirm-registration continuation decision.',
    'Legacy bootstrap-failure is a route fallback probe because the legacy route has no distinct bootstrap_failed branch.',
    'Replacement approval remains blocked until matched Figma frames and final parity review exist.',
  ],
  securityExclusions: [
    'no raw passwords',
    'no raw auth tokens',
    'no raw registration tokens',
    'no provider payloads',
    'no signed URLs',
    'no tenant-sensitive identifiers',
  ],
}, null, 2)}\n`);

console.log(`Captured ${records.length} V0 confirm-registration same-run screenshots.`);
console.log(path.relative(root, manifestPath));
