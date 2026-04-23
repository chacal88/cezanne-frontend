import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const currentBaseUrl = process.env.V0_CURRENT_BASE_URL ?? 'http://localhost:5173';
const legacyBaseUrl = process.env.V0_LEGACY_BASE_URL ?? 'http://127.0.0.1:4000';
const captureDate = process.env.V0_CAPTURE_DATE ?? '2026-04-23';
const outputRoot = path.join(root, 'docs/visual-evidence-assets/v0/register-same-run-2026-04-23');
const manifestPath = path.join(outputRoot, 'capture-manifest.json');
const viewport = { width: 1440, height: 900 };

const appTargets = [
  { app: 'legacy', baseUrl: legacyBaseUrl, outputDir: 'legacy' },
  { app: 'current', baseUrl: currentBaseUrl, outputDir: 'current' },
];

const states = [
  { routeKind: 'public', state: 'ready', trigger: 'route-open' },
  { routeKind: 'public', state: 'validation', trigger: 'empty-submit-validation' },
  { routeKind: 'public', state: 'submitting', trigger: 'mocked-pending-public-registration' },
  { routeKind: 'public', state: 'success', trigger: 'mocked-public-registration-success' },
  { routeKind: 'public', state: 'failure', trigger: 'mocked-public-registration-failure' },
  { routeKind: 'token', state: 'ready', route: '/register/visual-register-token', trigger: 'mocked-invite-token-valid' },
  { routeKind: 'token', state: 'validation', route: '/register/visual-register-token', trigger: 'empty-submit-validation' },
  { routeKind: 'token', state: 'submitting', route: '/register/visual-register-token', trigger: 'mocked-pending-invite-registration' },
  { routeKind: 'token', state: 'success', route: '/register/visual-register-token', trigger: 'mocked-invite-registration-success' },
  { routeKind: 'token', state: 'failure', route: '/register/visual-register-token', trigger: 'mocked-invite-registration-failure' },
];

async function newPage(browser) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  return { context, page };
}

async function installMocks(page, target, state) {
  await page.route('**/invitation**', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(invitationReadyFixture()) });
    }
    if (state.state === 'submitting') await new Promise((resolve) => setTimeout(resolve, 1800));
    const body = state.state === 'failure' ? { msg: 'token_invalid' } : { msg: 'ok' };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.route('**/hiring_company**', async (route) => {
    const request = route.request();
    if (request.method() !== 'POST') return route.continue();
    if (state.state === 'submitting') await new Promise((resolve) => setTimeout(resolve, 1800));
    if (state.state === 'failure') return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'registration_failed' }) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ register: 'ok', company: { uuid: 'visual-company' } }) });
  });

  await page.route('**/recruitment_agency**', async (route) => {
    const request = route.request();
    if (request.method() !== 'POST') return route.continue();
    if (state.state === 'submitting') await new Promise((resolve) => setTimeout(resolve, 1800));
    if (state.state === 'failure') return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'registration_failed' }) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ register: 'ok', company: { uuid: 'visual-company' } }) });
  });

  if (target.app === 'current' && state.state === 'submitting') {
    await page.route('**/register/null**', async (route) => route.continue());
  }
}

async function captureState(browser, target, state) {
  const { context, page } = await newPage(browser);
  const routePath = routeFor(target, state);
  try {
    await installMocks(page, target, state);
    await page.goto(`${target.baseUrl}${routePath}`, { waitUntil: 'commit', timeout: 20000 });
    await page.locator('html').waitFor({ state: 'attached', timeout: 10000 });
    await page.waitForTimeout(700);

    if (state.state === 'validation') {
      await triggerValidation(page, target);
      await page.waitForTimeout(500);
    }

    if (['submitting', 'success', 'failure'].includes(state.state)) {
      await fillRegisterForm(page, target, state.routeKind);
      await submitRegister(page, target);
      await page.waitForTimeout(state.state === 'submitting' ? 350 : 1400);
    }

    if (target.app === 'legacy' && state.state === 'submitting') {
      await forceLegacyLoading(page);
    }

    const filePath = path.join(outputRoot, target.outputDir, `${target.app}-register-${state.routeKind}-${state.state}-1440x900.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    return {
      app: target.app,
      family: 'register',
      routeKind: state.routeKind,
      route: routePath,
      url: `${target.baseUrl}${routePath}`,
      finalUrl: page.url(),
      viewport,
      state: state.state,
      trigger: state.trigger,
      data: {
        tokenKind: state.routeKind === 'token' ? 'synthetic-route-token' : undefined,
        emailKind: ['submitting', 'success', 'failure'].includes(state.state) ? 'synthetic-non-sensitive' : undefined,
        passwordKind: ['submitting', 'success', 'failure'].includes(state.state) ? 'synthetic-hidden' : undefined,
        fixtureNotes: fixtureNotes(target, state),
      },
      screenshot: path.relative(root, filePath),
      status: 'captured',
    };
  } finally {
    await context.close();
  }
}

function routeFor(target, state) {
  if (state.route) return state.route;
  if (state.routeKind === 'public' && target.app === 'legacy') return '/register/hiring-company';
  return '/register/null';
}

async function triggerValidation(page, target) {
  if (target.app === 'legacy') {
    await enableLegacySubmit(page);
    await page.locator('button[type="submit"], input[type="submit"]').first().click({ force: true }).catch(() => {});
    return;
  }
  await page.locator('button[type="submit"]').first().click().catch(() => {});
}

async function fillRegisterForm(page, target, routeKind) {
  if (target.app === 'legacy') return fillLegacyRegister(page, routeKind);
  await page.locator('input[placeholder="Company name"]').fill('Visual Evidence Company').catch(() => {});
  await page.locator('input[placeholder="First name"]').fill('Visual').catch(() => {});
  await page.locator('input[placeholder="Last name"]').fill('Evidence').catch(() => {});
  await page.locator('input[type="email"]').fill('visual-register@example.invalid').catch(() => {});
  await page.locator('input[type="password"]').nth(0).fill('VisualEvidence123!').catch(() => {});
  await page.locator('input[type="password"]').nth(1).fill('VisualEvidence123!').catch(() => {});
}

async function fillLegacyRegister(page, routeKind) {
  if (routeKind === 'public') {
    await page.locator('#name').fill('Visual Evidence Company').catch(() => {});
  }
  await page.locator('input[id="user.first_name"]').fill('Visual').catch(() => {});
  await page.locator('input[id="user.last_name"]').fill('Evidence').catch(() => {});
  await page.locator('input[id="user.email"]').fill('visual-register@example.invalid').catch(() => {});
  await page.locator('input[id="user.password"]').fill('VisualEvidence123!').catch(() => {});
  await page.locator('input[id="user.password_confirmation"]').evaluate((input) => input.removeAttribute('disabled')).catch(() => {});
  await page.locator('input[id="user.password_confirmation"]').fill('VisualEvidence123!').catch(() => {});
  await page.locator('#terms-and-conditions').check({ force: true }).catch(() => {});
  await page.locator('#privacy-policy').check({ force: true }).catch(() => {});
  await page.evaluate(() => {
    const appRoot = document.querySelector('[ng-app], body');
    const angularInstance = window.angular;
    if (!angularInstance || !appRoot) return;
    const scope = angularInstance.element(appRoot).scope?.() ?? angularInstance.element(document.body).scope?.();
    const childHead = scope?.$$childHead;
    const vm = childHead?.vm ?? scope?.vm;
    if (vm) {
      vm.register = vm.register || {};
      vm.register.user = vm.register.user || {};
      vm.register.name = vm.register.name || 'Visual Evidence Company';
      vm.register.recaptcha = 'visual-recaptcha-token';
      vm.terms = true;
      vm.policy = true;
      vm.loading = false;
      scope.$applyAsync?.();
    }
  }).catch(() => {});
  await enableLegacySubmit(page);
}

async function enableLegacySubmit(page) {
  await page.locator('button[type="submit"], input[type="submit"]').first().evaluate((button) => button.removeAttribute('disabled')).catch(() => {});
}

async function submitRegister(page, target) {
  if (target.app === 'legacy') await enableLegacySubmit(page);
  await page.locator('button[type="submit"], input[type="submit"]').first().click({ force: target.app === 'legacy' }).catch(() => {});
}

async function forceLegacyLoading(page) {
  await page.evaluate(() => {
    const angularInstance = window.angular;
    if (!angularInstance) return;
    const scope = angularInstance.element(document.body).scope?.();
    const vm = scope?.$$childHead?.vm ?? scope?.vm;
    if (vm) {
      vm.loading = true;
      scope.$applyAsync?.();
    }
  }).catch(() => {});
}

function invitationReadyFixture() {
  return {
    msg: 'token_valid',
    type_company: 'hiringCompany',
    user: {
      first_name: 'Invited',
      last_name: 'User',
      email: 'invited-register@example.invalid',
    },
    company: {
      name: 'Visual Evidence Company',
      logo: '',
    },
  };
}

function fixtureNotes(target, state) {
  if (target.app === 'legacy' && state.state === 'submitting') return 'legacy loading state forced after submit because recaptcha/form-dealer blocks deterministic API submission in visual capture';
  if (target.app === 'legacy' && state.routeKind === 'token') return 'legacy token route uses mocked invitation token_valid resolver';
  if (target.app === 'current' && state.routeKind === 'token') return 'current token route does not prefetch invitation details; token is submitted with the form';
  return undefined;
}

await mkdir(path.join(outputRoot, 'legacy'), { recursive: true });
await mkdir(path.join(outputRoot, 'current'), { recursive: true });

const browser = await chromium.launch({ headless: true });
const records = [];

try {
  for (const state of states) {
    for (const target of appTargets) records.push(await captureState(browser, target, state));
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
    'Captures cover public /register/null and token /register/:token ready, validation, submitting, success, and failure states.',
    'Legacy public registration is captured at /register/hiring-company because /register/null is treated as a literal invitation token by the legacy route resolver.',
    'Legacy public registration includes recaptcha/form-dealer behavior; deterministic submitting capture uses a local visual loading probe and is not replacement approval evidence.',
    'Current token registration does not prefetch invitation payload; final invite continuation field parity remains blocked until backend/schema evidence is complete.',
  ],
  securityExclusions: [
    'no raw passwords',
    'no raw registration tokens',
    'no raw invitation tokens',
    'no auth tokens',
    'no provider payloads',
    'no signed URLs',
    'no tenant-sensitive identifiers',
  ],
}, null, 2)}\n`);

console.log(`Captured ${records.length} V0 register same-run screenshots.`);
console.log(path.relative(root, manifestPath));
