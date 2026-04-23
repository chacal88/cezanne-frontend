import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const baseURL = process.env.V5_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5173';
const evidenceRoot = path.join(root, 'docs/visual-evidence-assets/v5/state-hooks-2026-04-23');
const currentRoot = path.join(evidenceRoot, 'current');
const manifestPath = path.join(evidenceRoot, 'v5-state-hooks-manifest.json');

const viewport = { width: 1440, height: 900 };
const accessContextOverrideStorageKey = 'recruit.accessContextOverride';
const localAuthSessionStorageKey = 'recruit.localAuthSession';

const sysadminAccess = {
  isAuthenticated: true,
  organizationType: 'none',
  isAdmin: true,
  isSysAdmin: true,
  pivotEntitlements: [],
  subscriptionCapabilities: [],
  rolloutFlags: [],
};

const records = [
  ...stateRoutes('platform-users-list', '/users?page=2&search=platform&hiringCompanyId=hc-1&recruitmentAgencyId=ra-1', [
    'ready',
    'loading',
    'empty',
    'error',
    'denied',
  ], 'Platform users list fixture states with URL filters preserved.'),
  ...stateRoutes('platform-user-create', '/users/new?search=platform', [
    'editing',
    'saving',
    'success',
    'cancelled',
    'error',
    'permission-denied',
  ], 'Platform user create lifecycle states with list return context.'),
  ...stateRoutes('platform-user-detail', '/users/user-123?returnTo=/users%3Fpage%3D2%26search%3Dplatform', [
    'ready',
    'loading',
    'not-found',
    'stale',
    'permission-denied',
  ], 'Platform user detail states with sanitized parent return.'),
  ...stateRoutes('platform-user-edit', '/users/edit/user-123?returnTo=/users/user-123', [
    'editing',
    'saving',
    'success',
    'cancelled',
    'error',
    'permission-denied',
  ], 'Platform user edit lifecycle states with cancel/success target.'),
  ...stateRoutes('favorite-requests-queue', '/favorites-request', [
    'pending',
    'resolved',
    'rejected',
    'stale',
    'inaccessible',
    'empty',
    'error',
    'action-failure',
  ], 'Platform favorite-request queue states, retry exposure, and org-flow separation.'),
  ...stateRoutes('favorite-request-detail', '/favorites-request/request-123', [
    'pending',
    'resolved',
    'rejected',
    'stale',
    'inaccessible',
    'empty',
    'error',
    'action-failure',
  ], 'Platform favorite-request detail states with approve/reject/reopen readiness.'),
  ...masterDataRoutes('hiring-company', '/hiring-companies', '/hiring-companies/company-123', '/hiring-companies/edit/company-123', 'Hiring company master-data'),
  ...masterDataRoutes('recruitment-agency', '/recruitment-agencies', '/recruitment-agencies/agency-123', '/recruitment-agencies/edit/agency-123', 'Recruitment agency master-data'),
  ...masterDataRoutes('subscription', '/subscriptions', '/subscriptions/subscription-123', null, 'Platform subscription master-data'),
  ...stateRoutes('hiring-company-subscription', '/hiring-company/company-123/subscription', [
    'ready',
    'loading',
    'denied',
    'not-found',
    'stale',
    'mutation-blocked',
    'mutation-success',
    'mutation-error',
  ], 'Company subscription route-vs-mutation capability and refresh-target states.'),
  ...taxonomyRoutes('sector-list', '/sectors', 'Sector list taxonomy'),
  ...taxonomyRoutes('sector-detail', '/sectors/sector-123', 'Sector detail taxonomy'),
  ...taxonomyRoutes('subsector-list', '/sectors/sector-123/subsectors', 'Sector-scoped subsector list taxonomy'),
  ...taxonomyRoutes('subsector-detail', '/subsectors/subsector-123?sectorId=sector-123', 'Subsector detail taxonomy with sector parent context'),
];

function stateRoutes(prefix, route, states, note) {
  return states.map((state) => ({
    name: `${prefix}-${state}`,
    route: appendFixtureState(route, state),
    family: prefix,
    fixtureState: state,
    note,
  }));
}

function masterDataRoutes(entity, listRoute, detailRoute, editRoute, label) {
  const list = stateRoutes(`${entity}-list`, listRoute, ['ready', 'loading', 'empty', 'error', 'denied'], `${label} list states.`);
  const detail = stateRoutes(`${entity}-detail`, detailRoute, ['ready', 'loading', 'not-found', 'stale', 'denied'], `${label} detail states.`);
  const edit = editRoute
    ? stateRoutes(`${entity}-edit`, editRoute, ['editing', 'saving', 'success', 'cancelled', 'error', 'denied'], `${label} edit lifecycle states.`)
    : [];
  return [...list, ...detail, ...edit];
}

function taxonomyRoutes(prefix, route, label) {
  return stateRoutes(prefix, route, [
    'ready',
    'loading',
    'empty',
    'error',
    'denied',
    'not-found',
    'stale',
    'mutation-success',
    'mutation-error',
  ], `${label} fixture states.`);
}

function appendFixtureState(route, state) {
  const separator = route.includes('?') ? '&' : '?';
  return `${route}${separator}fixtureState=${encodeURIComponent(state)}`;
}

async function newPage(browser) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await context.addInitScript(
    ([overrideKey, sessionKey, access]) => {
      window.localStorage.setItem(overrideKey, JSON.stringify(access));
      window.localStorage.setItem(sessionKey, JSON.stringify({
        version: 1,
        accessContext: access,
        landingTarget: '/dashboard',
        token: 'v5-state-evidence-token',
      }));
    },
    [accessContextOverrideStorageKey, localAuthSessionStorageKey, sysadminAccess],
  );
  const page = await context.newPage();
  return { context, page };
}

async function captureRoute(browser, record) {
  const { context, page } = await newPage(browser);
  try {
    await page.goto(`${baseURL}${record.route}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.getByRole('heading', { level: 1 }).first().waitFor({ state: 'visible', timeout: 10000 });
    const fileName = `greenfield-v5-${record.name}-1440x900.png`;
    await page.screenshot({ path: path.join(currentRoot, fileName), fullPage: false });
    return {
      fileName,
      route: record.route,
      finalUrl: page.url().replace(baseURL, ''),
      family: record.family,
      fixtureState: record.fixtureState,
      status: 200,
      context: 'sysadmin',
      note: record.note,
    };
  } finally {
    await context.close();
  }
}

await mkdir(currentRoot, { recursive: true });
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
    'dev-only token label only',
    'no tenant raw payloads',
    'no payment provider payloads',
    'no platform diagnostics',
  ],
}, null, 2)}\n`);

console.log(`Captured ${captured.length} V5 state-hook screenshots.`);
console.log(path.relative(root, manifestPath));
