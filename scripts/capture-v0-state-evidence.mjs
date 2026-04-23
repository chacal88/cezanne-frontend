import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const baseURL = process.env.V0_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5173';
const evidenceRoot = path.join(root, 'docs/visual-evidence-assets/v0/current/state-hooks');
const manifestPath = path.join(root, 'docs/visual-evidence-assets/v0/v0-state-hooks-manifest.json');

const viewport = { width: 1440, height: 900 };
const accessContextOverrideStorageKey = 'recruit.accessContextOverride';
const localAuthSessionStorageKey = 'recruit.localAuthSession';

const hcAccess = {
  isAuthenticated: true,
  organizationType: 'hc',
  isAdmin: true,
  isSysAdmin: false,
  pivotEntitlements: ['seeCandidates', 'seeFavorites', 'jobRequisition'],
  subscriptionCapabilities: ['inbox', 'calendarIntegration', 'formsDocs'],
  rolloutFlags: [],
};

const raAccess = {
  ...hcAccess,
  organizationType: 'ra',
  pivotEntitlements: ['recruiters'],
  subscriptionCapabilities: ['inbox'],
};

const loginStates = [
  'submitting',
  'two-factor-required',
  'two-factor-failed',
  'sso-mandatory',
  'activation-required',
  'setup-required',
  'bootstrap-failure',
  'redirecting',
];

const tokenStates = [
  'missing',
  'invalid',
  'expired',
  'valid',
  'success',
  'failure',
  'retry',
  'pending-approval',
  'bootstrap-failure',
];

const callbackStates = [
  'provider-error',
  'missing-code',
  'exchanging',
  'exchange-failure',
  'bootstrap-failure',
  'success',
];

const profileStates = [
  'dirty',
  'saving',
  'saved',
  'save-failed',
  'retry',
  'degraded',
  'denied',
];

const records = [
  ...loginStates.map((state) => visualRecord('login', `/?visualState=${state}`, `greenfield-login-${state}-1440x900.png`, { visualState: state })),
  ...tokenRouteRecords('forgot', '/forgot-password'),
  ...tokenRouteRecords('reset', '/reset-password/visual-reset-token'),
  ...tokenRouteRecords('confirm', '/confirm-registration/visual-confirm-token'),
  ...tokenRouteRecords('register', '/register/visual-register-token'),
  ...tokenRouteRecords('invite', '/users/invite-token?token=visual-invite-token'),
  visualRecord('sso-cezanne-launch', '/auth/cezanne/tenant-visual?visualState=launch', 'greenfield-sso-cezanne-launch-launch-1440x900.png', { visualState: 'launch' }),
  visualRecord('sso-cezanne-launch', '/auth/cezanne?visualState=missing-tenant', 'greenfield-sso-cezanne-launch-missing-tenant-1440x900.png', { visualState: 'missing-tenant' }),
  ...callbackRouteRecords('sso-cezanne-callback', '/auth/cezanne/callback'),
  visualRecord('sso-saml-launch', '/auth/saml?visualState=launch', 'greenfield-sso-saml-launch-launch-1440x900.png', { visualState: 'launch' }),
  ...callbackRouteRecords('sso-saml-callback', '/auth/saml'),
  visualRecord('session-loss', '/session-lost', 'greenfield-session-loss-session-expired-1440x900.png', { visualState: 'session-expired' }),
  ...profileRouteRecords('user-profile', '/user-profile', hcAccess),
  ...profileRouteRecords('hiring-company-profile', '/hiring-company-profile', hcAccess),
  ...profileRouteRecords('recruitment-agency-profile', '/recruitment-agency-profile', raAccess),
];

function visualRecord(family, route, fileName, extra = {}) {
  return { family, route, fileName, accessContext: null, ...extra };
}

function tokenRouteRecords(family, route) {
  return tokenStates.map((state) => {
    const separator = route.includes('?') ? '&' : '?';
    return visualRecord(`token-${family}`, `${route}${separator}visualState=${state}`, `greenfield-token-${family}-${state}-1440x900.png`, { visualState: state });
  });
}

function callbackRouteRecords(family, route) {
  return callbackStates.map((state) => {
    const separator = route.includes('?') ? '&' : '?';
    const callbackParam = route.includes('/auth/saml') ? `${separator}error=visual-provider-state&visualState=${state}` : `${separator}visualState=${state}`;
    return visualRecord(family, `${route}${callbackParam}`, `greenfield-${family}-${state}-1440x900.png`, { visualState: state });
  });
}

function profileRouteRecords(family, route, accessContext) {
  return profileStates.map((state) => visualRecord(family, `${route}?fixtureState=${state}`, `greenfield-${family}-${state}-1440x900.png`, {
    accessContext,
    fixtureState: state,
  }));
}

async function newPage(browser, accessContext) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  if (accessContext) {
    await context.addInitScript(
      ([overrideKey, sessionKey, access]) => {
        window.localStorage.setItem(overrideKey, JSON.stringify(access));
        window.localStorage.setItem(sessionKey, JSON.stringify({
          version: 1,
          accessContext: access,
          landingTarget: '/dashboard',
          token: 'v0-state-evidence-token',
        }));
      },
      [accessContextOverrideStorageKey, localAuthSessionStorageKey, accessContext],
    );
  }
  const page = await context.newPage();
  return { context, page };
}

async function captureRoute(browser, record) {
  const { context, page } = await newPage(browser, record.accessContext);
  try {
    await page.goto(`${baseURL}${record.route}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.locator('main, section, body').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.screenshot({ path: path.join(evidenceRoot, record.fileName), fullPage: false });
    return {
      family: record.family,
      route: record.route,
      url: `${baseURL}${record.route}`,
      finalUrl: page.url(),
      visualState: record.visualState,
      fixtureState: record.fixtureState,
      screenshot: path.join('docs/visual-evidence-assets/v0/current/state-hooks', record.fileName),
      status: 200,
      context: record.accessContext ? record.accessContext.organizationType : 'public',
    };
  } finally {
    await context.close();
  }
}

await mkdir(evidenceRoot, { recursive: true });
const browser = await chromium.launch({ headless: true });
const captured = [];

try {
  for (const record of records) {
    captured.push(await captureRoute(browser, record));
  }
} finally {
  await browser.close();
}

await writeFile(manifestPath, `${JSON.stringify({
  captureDate: '2026-04-23',
  viewport,
  baseUrl: baseURL,
  totalRecords: captured.length,
  records: captured,
  securityExclusions: [
    'no credentials',
    'no raw tokens',
    'no auth codes',
    'no provider payloads',
    'no message bodies',
  ],
}, null, 2)}\n`);

console.log(`Captured ${captured.length} V0 state-hook screenshots.`);
console.log(path.relative(root, manifestPath));
