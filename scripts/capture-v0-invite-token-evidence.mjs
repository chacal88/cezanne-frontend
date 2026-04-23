import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const currentBaseUrl = process.env.V0_CURRENT_BASE_URL ?? 'http://localhost:5173';
const legacyBaseUrl = process.env.V0_LEGACY_BASE_URL ?? 'http://127.0.0.1:4000';
const captureDate = process.env.V0_CAPTURE_DATE ?? '2026-04-23';
const outputRoot = path.join(root, 'docs/visual-evidence-assets/v0/invite-token-same-run-2026-04-23');
const manifestPath = path.join(outputRoot, 'capture-manifest.json');
const viewport = { width: 1440, height: 900 };

const currentStates = [
  { state: 'missing', route: '/users/invite-token', trigger: 'route-open-without-token' },
  { state: 'ready-continuation', route: '/users/invite-token?token=visual-invite-token', trigger: 'route-open-with-synthetic-token' },
  { state: 'invalid', route: '/users/invite-token?token=visual-invite-token&visualState=invalid', trigger: 'current-visual-state-invalid' },
  { state: 'expired', route: '/users/invite-token?token=visual-invite-token&visualState=expired', trigger: 'current-visual-state-expired' },
  { state: 'failure', route: '/users/invite-token?token=visual-invite-token&visualState=failure', trigger: 'current-visual-state-failure' },
  { state: 'success-terminal', route: '/users/invite-token?token=visual-invite-token&visualState=success', trigger: 'current-visual-state-success' },
  { state: 'retry', route: '/users/invite-token?token=visual-invite-token&visualState=retry', trigger: 'current-visual-state-retry' },
  { state: 'pending-approval', route: '/users/invite-token?token=visual-invite-token&visualState=pending-approval', trigger: 'current-visual-state-pending-approval' },
  { state: 'bootstrap-failure', route: '/users/invite-token?token=visual-invite-token&visualState=bootstrap-failure', trigger: 'current-visual-state-bootstrap-failure' },
];

const legacyReferences = [
  { state: 'public-path-missing-token', route: '/users/invite-token', trigger: 'legacy-public-route-probe' },
  { state: 'public-path-with-query-token', route: '/users/invite-token?token=visual-invite-token', trigger: 'legacy-public-route-probe-with-query-token' },
];

async function newPage(browser) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  return { context, page };
}

async function capture(browser, target, item) {
  const { context, page } = await newPage(browser);
  try {
    await page.goto(`${target.baseUrl}${item.route}`, { waitUntil: 'commit', timeout: 20000 });
    await page.locator('html').waitFor({ state: 'attached', timeout: 10000 });
    await page.waitForTimeout(target.app === 'legacy' ? 1400 : 900);

    const filePath = path.join(outputRoot, target.outputDir, `${target.app}-invite-token-${item.state}-1440x900.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    return {
      app: target.app,
      family: 'invite-token',
      route: sanitizeRoute(item.route),
      url: `${target.baseUrl}${sanitizeRoute(item.route)}`,
      finalUrl: sanitizeRoute(page.url()),
      viewport,
      state: item.state,
      trigger: item.trigger,
      data: {
        tokenKind: item.route.includes('token=') ? 'synthetic-query-token' : undefined,
        fixtureNotes: target.app === 'legacy'
          ? 'Legacy source has authenticated admin users.invite-token modal at /users/invite-token, not a confirmed public invite acceptance route.'
          : 'Current route uses shared token-state model; final invite continuation payload is backend/product blocked.',
      },
      screenshot: path.relative(root, filePath),
      status: target.app === 'legacy' ? 'reference-only-nonmatching' : 'captured',
    };
  } finally {
    await context.close();
  }
}

function sanitizeRoute(route) {
  return route.replace(/token=[^&]+/g, 'token=<synthetic-redacted>');
}

await mkdir(path.join(outputRoot, 'legacy'), { recursive: true });
await mkdir(path.join(outputRoot, 'current'), { recursive: true });

const browser = await chromium.launch({ headless: true });
const records = [];

try {
  for (const item of currentStates) {
    records.push(await capture(browser, { app: 'current', baseUrl: currentBaseUrl, outputDir: 'current' }, item));
  }
  for (const item of legacyReferences) {
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
    'Captures cover current-app /users/invite-token missing, ready/continuation, invalid, expired, failure, success terminal, retry, pending approval, and bootstrap-failure states.',
    'Legacy source inspection on 2026-04-23 found users.invite-token as an authenticated admin modal under /users, backed by HiringCompany/RecruitmentAgency invite-token lookup and clipboard copy.',
    'The legacy /users/invite-token probes are reference-only nonmatching captures; they must not be treated as public invite acceptance parity evidence.',
    'Replacement approval remains blocked until backend/product confirms whether /users/invite-token is canonical, an alias, or current-only, and until Figma/parity evidence exists.',
  ],
  securityExclusions: [
    'no raw passwords',
    'no raw invitation tokens',
    'no auth tokens',
    'no provider payloads',
    'no signed URLs',
    'no tenant-sensitive identifiers',
  ],
}, null, 2)}\n`);

console.log(`Captured ${records.length} V0 invite-token same-run screenshots.`);
console.log(path.relative(root, manifestPath));
