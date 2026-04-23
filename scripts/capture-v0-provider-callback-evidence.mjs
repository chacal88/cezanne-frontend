import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const currentBaseUrl = process.env.V0_CURRENT_BASE_URL ?? 'http://localhost:5173';
const legacyBaseUrl = process.env.V0_LEGACY_BASE_URL ?? 'http://127.0.0.1:4000';
const captureDate = process.env.V0_CAPTURE_DATE ?? '2026-04-23';
const outputRoot = path.join(root, 'docs/visual-evidence-assets/v0/provider-callback-same-run-2026-04-23');
const manifestPath = path.join(outputRoot, 'capture-manifest.json');
const viewport = { width: 1440, height: 900 };

const currentStates = [
  { family: 'cezanne-launch', state: 'launch', route: '/auth/cezanne/visual-tenant?visualState=launch', trigger: 'current-visual-state-launch' },
  { family: 'cezanne-launch', state: 'missing-tenant', route: '/auth/cezanne', trigger: 'current-route-missing-tenant' },
  { family: 'cezanne-callback', state: 'missing-code', route: '/auth/cezanne/callback?visualState=missing-code', trigger: 'current-visual-state-missing-code' },
  { family: 'cezanne-callback', state: 'provider-error', route: '/auth/cezanne/callback?visualState=provider-error', trigger: 'current-visual-state-provider-error' },
  { family: 'cezanne-callback', state: 'exchanging', route: '/auth/cezanne/callback?visualState=exchanging', trigger: 'current-visual-state-exchanging' },
  { family: 'cezanne-callback', state: 'exchange-failure', route: '/auth/cezanne/callback?visualState=exchange-failure', trigger: 'current-visual-state-exchange-failure' },
  { family: 'cezanne-callback', state: 'bootstrap-failure', route: '/auth/cezanne/callback?visualState=bootstrap-failure', trigger: 'current-visual-state-bootstrap-failure' },
  { family: 'cezanne-callback', state: 'success-redirect', route: '/auth/cezanne/callback?visualState=success-redirect', trigger: 'current-visual-state-success-redirect' },
  { family: 'saml-launch', state: 'launch', route: '/auth/saml?visualState=launch', trigger: 'current-visual-state-launch' },
  { family: 'saml-callback', state: 'missing-code', route: '/auth/saml?visualState=missing-code', trigger: 'current-visual-state-missing-code' },
  { family: 'saml-callback', state: 'provider-error', route: '/auth/saml?visualState=provider-error', trigger: 'current-visual-state-provider-error' },
  { family: 'saml-callback', state: 'exchanging', route: '/auth/saml?visualState=exchanging', trigger: 'current-visual-state-exchanging' },
  { family: 'saml-callback', state: 'exchange-failure', route: '/auth/saml?visualState=exchange-failure', trigger: 'current-visual-state-exchange-failure' },
  { family: 'saml-callback', state: 'bootstrap-failure', route: '/auth/saml?visualState=bootstrap-failure', trigger: 'current-visual-state-bootstrap-failure' },
  { family: 'saml-callback', state: 'success-redirect', route: '/auth/saml?visualState=success-redirect', trigger: 'current-visual-state-success-redirect' },
];

const legacyStates = [
  { family: 'cezanne-launch', state: 'launch', route: '/auth/cezanne/visual-tenant', trigger: 'legacy-launch-route' },
  { family: 'cezanne-callback', state: 'missing-code', route: '/auth/cezanne/callback', trigger: 'legacy-callback-missing-code-probe' },
  { family: 'cezanne-callback', state: 'provider-error', route: '/auth/cezanne/callback?code=visual-provider-error-code', trigger: 'mocked-legacy-provider-error' },
  { family: 'cezanne-callback', state: 'exchanging', route: '/auth/cezanne/callback?code=visual-exchanging-code', trigger: 'mocked-legacy-pending-exchange' },
  { family: 'cezanne-callback', state: 'exchange-failure', route: '/auth/cezanne/callback?code=visual-exchange-failure-code', trigger: 'mocked-legacy-exchange-failure' },
  { family: 'cezanne-callback', state: 'success-redirect', route: '/auth/cezanne/callback?code=visual-success-code', trigger: 'mocked-legacy-success-redirect' },
  { family: 'saml-launch', state: 'launch', route: '/auth/saml', trigger: 'legacy-launch-route' },
  { family: 'saml-callback', state: 'missing-code', route: '/auth/saml', trigger: 'legacy-route-missing-code' },
  { family: 'saml-callback', state: 'provider-error', route: '/auth/saml?error=Visual%20provider%20error', trigger: 'legacy-provider-error-query' },
  { family: 'saml-callback', state: 'exchanging', route: '/auth/saml?code=visual-exchanging-code', trigger: 'mocked-legacy-pending-exchange' },
  { family: 'saml-callback', state: 'exchange-failure', route: '/auth/saml?code=visual-exchange-failure-code', trigger: 'mocked-legacy-exchange-failure' },
  { family: 'saml-callback', state: 'success-redirect', route: '/auth/saml?code=visual-success-code', trigger: 'mocked-legacy-success-redirect' },
];

async function newPage(browser) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  return { context, page };
}

async function installMocks(page, item) {
  await page.route('**/login/cezanne/callback**', async (route) => {
    if (item.state === 'exchanging') await new Promise((resolve) => setTimeout(resolve, 1800));
    if (item.state === 'provider-error' || item.state === 'exchange-failure' || item.state === 'missing-code') {
      return route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ error: 'visual-provider-error' }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'visual-provider-token' }) });
  });

  await page.route('**/login/saml/callback**', async (route) => {
    if (item.state === 'exchanging') await new Promise((resolve) => setTimeout(resolve, 1800));
    if (item.state === 'provider-error' || item.state === 'exchange-failure') {
      return route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ error: 'visual-provider-error' }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'visual-provider-token' }) });
  });

  await page.route('**/authenticate', async (route) => {
    if (item.state === 'bootstrap-failure') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: authUserFixture() }) });
  });
  await page.route('**/graphql', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(authGraphqlFixture()) }));
}

async function capture(browser, target, item) {
  const { context, page } = await newPage(browser);
  try {
    await installMocks(page, item);
    await page.goto(`${target.baseUrl}${item.route}`, { waitUntil: 'commit', timeout: 20000 });
    await page.locator('html').waitFor({ state: 'attached', timeout: 10000 });
    await page.waitForTimeout(item.state === 'exchanging' ? 350 : 1300);

    const safeState = item.state.replace(/[^a-z0-9-]/gi, '-');
    const filePath = path.join(outputRoot, target.outputDir, `${target.app}-${item.family}-${safeState}-1440x900.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    return {
      app: target.app,
      family: item.family,
      route: sanitizeRoute(item.route),
      url: `${target.baseUrl}${sanitizeRoute(item.route)}`,
      finalUrl: sanitizeFinalUrl(page.url()),
      viewport,
      state: item.state,
      trigger: item.trigger,
      data: {
        callbackCodeKind: item.route.includes('code=') ? 'synthetic-query-code-redacted' : undefined,
        providerErrorKind: item.route.includes('error=') ? 'synthetic-query-error-redacted' : undefined,
        tokenKind: ['success-redirect', 'exchanging'].includes(item.state) ? 'synthetic-hidden' : undefined,
        fixtureNotes: target.app === 'legacy'
          ? legacyFixtureNote(item)
          : 'Current capture uses deterministic provider visual states; callback codes/tokens are not stored.',
      },
      screenshot: path.relative(root, filePath),
      status: statusFor(target, item),
    };
  } finally {
    await context.close();
  }
}

function statusFor(target, item) {
  if (target.app === 'legacy' && item.family === 'cezanne-callback') return 'reference-only-resolver-redirect';
  if (target.app === 'legacy' && item.state === 'exchanging') return 'reference-only-pending-probe';
  return 'captured';
}

function sanitizeRoute(route) {
  return route
    .replace(/code=[^&]+/g, 'code=<synthetic-redacted>')
    .replace(/error=[^&]+/g, 'error=<synthetic-redacted>');
}

function sanitizeFinalUrl(url) {
  return url
    .replace(/code=[^&]+/g, 'code=<synthetic-redacted>')
    .replace(/error=[^&]+/g, 'error=<synthetic-redacted>');
}

function legacyFixtureNote(item) {
  if (item.family === 'cezanne-callback') return 'Legacy Cezanne callback is a resolver that exchanges code and redirects home/dashboard; visible frame is a reference probe, not a route-local callback screen.';
  if (item.family === 'saml-callback') return 'Legacy SAML callback shares the SAML launch template and modal/error resolver behavior.';
  return 'Legacy provider launch reference.';
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
  for (const item of currentStates) {
    records.push(await capture(browser, { app: 'current', baseUrl: currentBaseUrl, outputDir: 'current' }, item));
  }
  for (const item of legacyStates) {
    records.push(await capture(browser, { app: 'legacy', baseUrl: legacyBaseUrl, outputDir: 'legacy' }, item));
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
    'Captures cover Cezanne and SAML launch/callback missing tenant/code, provider error, exchanging, exchange failure, bootstrap failure where current-app supported, and success redirect states.',
    'Current callback captures use deterministic visual states to avoid persisting raw provider codes or tokens.',
    'Legacy Cezanne callback is resolver/redirect behavior with no stable route-local callback screen; those records are reference probes.',
    'Legacy SAML callback shares the launch template plus resolver/modal behavior; those records are useful visual references but not final replacement approval.',
  ],
  securityExclusions: [
    'no raw passwords',
    'no raw auth codes',
    'no raw auth tokens',
    'no raw provider payloads',
    'no signed URLs',
    'no tenant-sensitive identifiers',
  ],
}, null, 2)}\n`);

console.log(`Captured ${records.length} V0 provider callback same-run screenshots.`);
console.log(path.relative(root, manifestPath));
