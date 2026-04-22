import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const baseURL = process.env.V4_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5173';
const outDir = path.join(root, 'docs/visual-evidence-assets/v4/interactive-2026-04-22/current');
const manifestPath = path.join(root, 'docs/visual-evidence-assets/v4/interactive-2026-04-22/interactive-capture-manifest.json');

const accessContextOverrideStorageKey = 'recruit.accessContextOverride';
const localAuthSessionStorageKey = 'recruit.localAuthSession';
const hcAdminAccess = {
  isAuthenticated: true,
  organizationType: 'hc',
  isAdmin: true,
  isSysAdmin: false,
  pivotEntitlements: ['seeCandidates', 'jobRequisition', 'seeFavorites', 'recruiters'],
  subscriptionCapabilities: [
    'calendarIntegration',
    'formsDocs',
    'surveys',
    'customFields',
    'candidateTags',
    'reviewRequests',
    'interviewFeedback',
    'inbox',
    'rejectionReason',
  ],
  rolloutFlags: ['customFieldsBeta'],
};
const hcAdminBillingHiddenAccess = {
  ...hcAdminAccess,
  rolloutFlags: ['customFieldsBeta', 'billingHidden'],
};
const hcUserAccess = {
  ...hcAdminAccess,
  isAdmin: false,
};
const raAdminAccess = {
  isAuthenticated: true,
  organizationType: 'ra',
  isAdmin: true,
  isSysAdmin: false,
  pivotEntitlements: ['seeFavorites', 'recruiters'],
  subscriptionCapabilities: ['inbox'],
  rolloutFlags: [],
};
const accessProfiles = {
  hcAdmin: hcAdminAccess,
  hcAdminBillingHidden: hcAdminBillingHiddenAccess,
  hcUser: hcUserAccess,
  raAdmin: raAdminAccess,
};

async function newPage(browser, profile = 'hcAdmin') {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const access = accessProfiles[profile] ?? hcAdminAccess;
  await context.addInitScript(
    ([key, sessionKey, value]) => {
      window.localStorage.setItem(key, JSON.stringify(value));
      window.localStorage.setItem(sessionKey, JSON.stringify({ version: 1, accessContext: value, landingTarget: '/dashboard' }));
    },
    [accessContextOverrideStorageKey, localAuthSessionStorageKey, access],
  );
  const page = await context.newPage();
  return { context, page };
}

async function capture(page, records, name, route, note) {
  const file = `${name}-1440x900.png`;
  const output = path.join(outDir, file);
  await page.screenshot({ path: output, fullPage: false });
  records.push({
    name,
    route,
    url: page.url().replace(baseURL, ''),
    screenshot: `visual-evidence-assets/v4/interactive-2026-04-22/current/${file}`,
    status: 'captured',
    note,
  });
}

async function runPageFlow(browser, records, route, steps, profile = 'hcAdmin') {
  const { context, page } = await newPage(browser, profile);
  try {
    await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
    await steps(page, records);
  } finally {
    await context.close();
  }
}

async function captureRoute(browser, records, name, route, note, profile = 'hcAdmin') {
  await runPageFlow(browser, records, route, async (page) => {
    await capture(page, records, name, route, note);
  }, profile);
}

async function clickAndWait(page, testId) {
  await page.getByTestId(testId).click();
  await page.waitForTimeout(100);
}

async function checkAndWait(page, testId, checked = true) {
  const locator = page.getByTestId(testId);
  if ((await locator.isChecked()) !== checked) {
    await locator.setChecked(checked);
  }
  await page.waitForTimeout(100);
}

async function fillAndWait(page, testId, value) {
  await page.getByTestId(testId).fill(value);
  await page.waitForTimeout(100);
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const records = [];

try {
  const settingsFlows = [
    {
      route: '/templates',
      prefix: 'settings-templates',
      failureToggle: 'templates-simulate-failure',
      saveButton: 'templates-save-button',
      retryButton: 'templates-retry-button',
      mutationState: 'templates-mutation-state',
      successEdit: ['templates-title-0', 'Updated interview template'],
    },
    {
      route: '/settings/hiring-flow',
      prefix: 'settings-hiring-flow',
      failureToggle: 'hiring-flow-simulate-failure',
      saveButton: 'hiring-flow-save-button',
      retryButton: 'hiring-flow-retry-button',
      mutationState: 'hiring-flow-mutation-state',
      successEdit: ['hiring-flow-workflow-name', 'Updated hiring workflow'],
    },
    {
      route: '/settings/custom-fields',
      prefix: 'settings-custom-fields',
      failureToggle: 'custom-fields-simulate-failure',
      saveButton: 'custom-fields-save-button',
      retryButton: 'custom-fields-retry-button',
      mutationState: 'custom-fields-mutation-state',
      successEdit: ['custom-fields-label-0', 'Updated candidate field'],
    },
    {
      route: '/reject-reasons',
      prefix: 'settings-reject-reasons',
      failureToggle: 'reject-reasons-simulate-failure',
      saveButton: 'reject-reasons-save-button',
      retryButton: 'reject-reasons-retry-button',
      mutationState: 'reject-reasons-mutation-state',
      successEdit: ['reject-reasons-label-0', 'Updated rejection reason'],
    },
  ];

  for (const flow of settingsFlows) {
    await runPageFlow(browser, records, flow.route, async (page) => {
      await checkAndWait(page, flow.failureToggle, true);
      await clickAndWait(page, flow.saveButton);
      await page.getByTestId(flow.mutationState).waitFor({ state: 'visible' });
      await capture(page, records, `${flow.prefix}-save-failed`, flow.route, 'Simulated recoverable save failure with retry control.');

      await checkAndWait(page, flow.failureToggle, false);
      await fillAndWait(page, flow.successEdit[0], flow.successEdit[1]);
      await clickAndWait(page, flow.retryButton);
      await capture(page, records, `${flow.prefix}-retry-saved`, flow.route, 'Retry after clearing simulated failure reaches saved state.');
    });
  }

  await runPageFlow(browser, records, '/settings/forms-docs', async (page) => {
    await checkAndWait(page, 'forms-docs-simulate-empty', true);
    await capture(page, records, 'settings-forms-docs-empty', '/settings/forms-docs', 'Simulated empty forms/docs controls state.');
    await checkAndWait(page, 'forms-docs-simulate-empty', false);
    await checkAndWait(page, 'forms-docs-simulate-stale', true);
    await capture(page, records, 'settings-forms-docs-stale', '/settings/forms-docs', 'Simulated stale downstream forms/docs state.');
    await checkAndWait(page, 'forms-docs-simulate-stale', false);
    await checkAndWait(page, 'forms-docs-simulate-degraded', true);
    await capture(page, records, 'settings-forms-docs-degraded', '/settings/forms-docs', 'Simulated degraded downstream forms/docs state.');
    await checkAndWait(page, 'forms-docs-simulate-degraded', false);
    await checkAndWait(page, 'forms-docs-simulate-unavailable', true);
    await capture(page, records, 'settings-forms-docs-unavailable', '/settings/forms-docs', 'Simulated unavailable backend contract state.');
    await checkAndWait(page, 'forms-docs-simulate-unavailable', false);
    await checkAndWait(page, 'forms-docs-simulate-failure', true);
    await clickAndWait(page, 'forms-docs-save-button');
    await capture(page, records, 'settings-forms-docs-save-failed', '/settings/forms-docs', 'Simulated recoverable forms/docs save failure.');
    await checkAndWait(page, 'forms-docs-simulate-failure', false);
    await clickAndWait(page, 'forms-docs-retry-button');
    await capture(page, records, 'settings-forms-docs-retry-saved', '/settings/forms-docs', 'Retry after clearing simulated forms/docs failure reaches saved state.');
  });

  await runPageFlow(browser, records, '/settings/api-endpoints', async (page) => {
    await fillAndWait(page, 'api-endpoints-url', 'http://not-secure.example.test');
    await capture(page, records, 'settings-api-endpoints-validation-error', '/settings/api-endpoints', 'HTTPS validation error before save.');
    await fillAndWait(page, 'api-endpoints-url', 'https://api.example.test/recruit');
    await checkAndWait(page, 'api-endpoints-simulate-failure', true);
    await clickAndWait(page, 'api-endpoints-save-button');
    await capture(page, records, 'settings-api-endpoints-save-error', '/settings/api-endpoints', 'Simulated API endpoints save failure.');
    await checkAndWait(page, 'api-endpoints-simulate-failure', false);
    await clickAndWait(page, 'api-endpoints-save-button');
    await capture(page, records, 'settings-api-endpoints-saved', '/settings/api-endpoints', 'API endpoints saved state with secret-safe fields.');
  });

  await runPageFlow(browser, records, '/settings/job-listings/edit?new=true&brand=acme', async (page) => {
    await clickAndWait(page, 'job-listing-editor-save-button');
    await capture(page, records, 'settings-job-listing-editor-saved', '/settings/job-listings/edit?new=true&brand=acme', 'Job listing editor save workflow completed against local fixture.');
    await clickAndWait(page, 'job-listing-editor-publish-button');
    await capture(page, records, 'settings-job-listing-editor-published', '/settings/job-listings/edit?new=true&brand=acme', 'Job listing publish workflow completed against local fixture.');
  });

  const integrationFlows = [
    ['/integrations/google-calendar', 'integrations-google-calendar'],
    ['/integrations/workday', 'integrations-workday'],
    ['/integrations/lever', 'integrations-lever'],
    ['/integrations/custom-provider', 'integrations-custom-provider'],
  ];

  for (const [route, prefix] of integrationFlows) {
    await runPageFlow(browser, records, route, async (page) => {
      await clickAndWait(page, 'integration-provider-save-invalid');
      await capture(page, records, `${prefix}-invalid-save`, route, 'Invalid provider configuration save outcome.');
      await clickAndWait(page, 'integration-provider-save');
      await capture(page, records, `${prefix}-saved`, route, 'Provider configuration save outcome.');
      await clickAndWait(page, 'integration-provider-auth');
      await capture(page, records, `${prefix}-auth-action`, route, 'Provider auth/connect/reauthorize action outcome.');
      await clickAndWait(page, 'integration-provider-diagnostics');
      await capture(page, records, `${prefix}-diagnostics`, route, 'Provider diagnostics action outcome.');
    });
  }

  const reportCommandFlows = [
    ['/report/jobs', 'reports-jobs'],
    ['/report/jobs?result=stale', 'reports-jobs-stale'],
    ['/report/jobs?result=partial', 'reports-jobs-partial'],
    ['/report/diversity', 'reports-diversity'],
  ];

  for (const [route, prefix] of reportCommandFlows) {
    await runPageFlow(browser, records, route, async (page) => {
      if (await page.getByTestId('report-export-button').isEnabled()) {
        await clickAndWait(page, 'report-export-button');
        await capture(page, records, `${prefix}-export-command`, route, 'Report export command outcome.');
      } else {
        await capture(page, records, `${prefix}-export-blocked`, route, 'Report export command blocked by result state.');
      }
      if (await page.getByTestId('report-schedule-button').isEnabled()) {
        await clickAndWait(page, 'report-schedule-button');
        await capture(page, records, `${prefix}-schedule-command`, route, 'Report schedule command outcome.');
      } else {
        await capture(page, records, `${prefix}-schedule-blocked`, route, 'Report schedule command blocked or unsupported.');
      }
    });
  }

  const directRouteCaptures = [
    // Billing overview fixtures
    ['billing-overview-loading', '/billing?fixture=loading', 'Billing overview loading fixture.', 'hcAdmin'],
    ['billing-overview-empty', '/billing?fixture=empty', 'Billing overview empty fixture.', 'hcAdmin'],
    ['billing-overview-denied', '/billing?fixture=denied', 'Billing overview denied/hidden commercial fixture.', 'hcAdmin'],
    ['billing-overview-unavailable', '/billing?fixture=unavailable', 'Billing overview unavailable fixture.', 'hcAdmin'],
    ['billing-overview-stale', '/billing?fixture=stale', 'Billing overview stale refresh-required fixture.', 'hcAdmin'],
    ['billing-overview-degraded', '/billing?fixture=degraded', 'Billing overview degraded fixture.', 'hcAdmin'],
    ['billing-overview-pending-change', '/billing?fixture=pending-change', 'Billing overview pending subscription change fixture.', 'hcAdmin'],

    // Billing upgrade states
    ['billing-upgrade-same-plan', '/billing/upgrade?currentPlan=growth&targetPlan=growth', 'Upgrade same-plan blocked state.', 'hcAdmin'],
    ['billing-upgrade-card-blocked', '/billing/upgrade?targetPlan=enterprise&readyCard=false', 'Upgrade card-blocked state with add-card target.', 'hcAdmin'],
    ['billing-upgrade-submitted', '/billing/upgrade?state=submitted', 'Upgrade submitted/pending state.', 'hcAdmin'],
    ['billing-upgrade-success', '/billing/upgrade?state=success', 'Upgrade success state.', 'hcAdmin'],
    ['billing-upgrade-failure', '/billing/upgrade?state=failure&targetPlan=enterprise', 'Upgrade failure state.', 'hcAdmin'],
    ['billing-upgrade-retry', '/billing/upgrade?state=retry&targetPlan=enterprise', 'Upgrade retry state preserving selected plan.', 'hcAdmin'],
    ['billing-upgrade-challenge-required', '/billing/upgrade?state=challenge-required', 'Upgrade provider challenge-required state.', 'hcAdmin'],
    ['billing-upgrade-stale', '/billing/upgrade?state=stale', 'Upgrade stale blocked state.', 'hcAdmin'],
    ['billing-upgrade-degraded', '/billing/upgrade?state=degraded', 'Upgrade degraded blocked state.', 'hcAdmin'],
    ['billing-upgrade-unavailable', '/billing/upgrade?state=unavailable', 'Upgrade unavailable blocked state.', 'hcAdmin'],

    // Billing SMS states
    ['billing-sms-inactive', '/billing/sms?state=inactive', 'SMS inactive state.', 'hcAdmin'],
    ['billing-sms-trial', '/billing/sms?state=trial', 'SMS trial state.', 'hcAdmin'],
    ['billing-sms-active', '/billing/sms?state=active', 'SMS active state below warning threshold.', 'hcAdmin'],
    ['billing-sms-suspended', '/billing/sms?state=suspended', 'SMS suspended state.', 'hcAdmin'],
    ['billing-sms-card-blocked', '/billing/sms?state=inactive&readyCard=false', 'SMS card-blocked activation state.', 'hcAdmin'],
    ['billing-sms-pending', '/billing/sms?state=pending', 'SMS pending change state.', 'hcAdmin'],
    ['billing-sms-success', '/billing/sms?state=success', 'SMS success state.', 'hcAdmin'],
    ['billing-sms-partial-success', '/billing/sms?state=partial-success', 'SMS partial success state.', 'hcAdmin'],
    ['billing-sms-failed', '/billing/sms?state=failed', 'SMS failed state.', 'hcAdmin'],
    ['billing-sms-retry', '/billing/sms?state=retry', 'SMS retry state.', 'hcAdmin'],
    ['billing-sms-stale', '/billing/sms?state=stale', 'SMS stale state.', 'hcAdmin'],
    ['billing-sms-degraded', '/billing/sms?state=degraded', 'SMS degraded state.', 'hcAdmin'],
    ['billing-sms-denied', '/billing/sms?state=denied', 'SMS denied state.', 'hcAdmin'],
    ['billing-sms-unavailable', '/billing/sms?state=unavailable', 'SMS unavailable state.', 'hcAdmin'],

    // Billing card states not covered in baseline
    ['billing-card-backup', '/billing/card/card-backup', 'Backup card ready state.', 'hcAdmin'],
    ['billing-card-missing', '/billing/card/card-missing', 'Missing card detail state.', 'hcAdmin'],
    ['billing-card-pending', '/billing/card/card-pending', 'Card pending confirmation state.', 'hcAdmin'],

    // Provider workflow states via route-local fixture query
    ['integrations-google-calendar-auth-pending', '/integrations/google-calendar?workflow=auth-pending', 'Provider auth pending state.', 'hcAdmin'],
    ['integrations-google-calendar-auth-failed', '/integrations/google-calendar?workflow=auth-failed', 'Provider auth failed state.', 'hcAdmin'],
    ['integrations-google-calendar-diagnostics-passed', '/integrations/google-calendar?workflow=diagnostics-passed', 'Provider diagnostics passed state.', 'hcAdmin'],
    ['integrations-google-calendar-diagnostics-failed', '/integrations/google-calendar?workflow=diagnostics-failed', 'Provider diagnostics failed state.', 'hcAdmin'],
    ['integrations-google-calendar-diagnostics-logs-ready', '/integrations/google-calendar?workflow=diagnostics-logs-ready', 'Provider diagnostics logs-ready safe summary state.', 'hcAdmin'],
    ['integrations-workday-auth-failed', '/integrations/workday?workflow=auth-failed', 'Provider reauthorization failed state.', 'hcAdmin'],
    ['integrations-lever-diagnostics-failed', '/integrations/lever?workflow=diagnostics-failed', 'Degraded provider diagnostics failed state.', 'hcAdmin'],

    // Report command state variants exposed by route query
    ['reports-jobs-command-failed', '/report/jobs?command=failed', 'Report command failed state from route query.', 'hcAdmin'],
    ['reports-jobs-command-retryable', '/report/jobs?command=retryable', 'Report command retryable state from route query.', 'hcAdmin'],

    // Team state variants
    ['team-index-empty', '/team?state=empty', 'Team empty state.', 'hcAdmin'],
    ['team-index-stale', '/team?state=stale', 'Team stale state.', 'hcAdmin'],
    ['team-index-unavailable', '/team?state=unavailable', 'Team unavailable state.', 'hcAdmin'],
    ['team-index-refresh-required', '/team?state=refresh-required', 'Team refresh-required state.', 'hcAdmin'],
    ['team-recruiters-hidden-filter', '/team/recruiters?filter=hidden', 'Recruiter visibility hidden filter.', 'hcAdmin'],
    ['team-recruiters-stale-hidden', '/team/recruiters?state=stale&filter=hidden', 'Recruiter visibility stale hidden-filter state.', 'hcAdmin'],
    ['team-recruiters-refresh-required', '/team/recruiters?state=refresh-required', 'Recruiter visibility refresh-required state.', 'hcAdmin'],
    ['team-invite-unavailable', '/users/invite?state=unavailable', 'Invite management unavailable state.', 'hcAdmin'],

    // Favorites and marketplace states
    ['favorites-index-empty', '/favorites?state=empty', 'Favorites empty state.', 'hcAdmin'],
    ['favorites-index-unavailable', '/favorites?state=unavailable', 'Favorites unavailable state.', 'hcAdmin'],
    ['marketplace-assigned-empty', '/jobmarket/assigned?state=empty', 'Marketplace assigned empty state.', 'raAdmin'],

    // Representative denied/fallback states
    ['denied-settings-templates-hc-user', '/templates', 'Settings denied fallback for non-admin HC user where subsection requires admin/feature access.', 'hcUser'],
    ['denied-integrations-hc-user', '/integrations', 'Integrations denied-to-dashboard fallback for non-admin HC user.', 'hcUser'],
    ['denied-reports-hc-user', '/report/jobs', 'Reports denied-to-index/dashboard fallback for non-admin HC user.', 'hcUser'],
    ['denied-billing-hidden', '/billing', 'Billing hidden rollout denied fallback.', 'hcAdminBillingHidden'],
    ['denied-marketplace-hc-admin', '/jobmarket/fill', 'Marketplace denied fallback for HC admin outside RA scope.', 'hcAdmin'],
  ];

  for (const [name, route, note, profile] of directRouteCaptures) {
    await captureRoute(browser, records, name, route, note, profile);
  }
} finally {
  await browser.close();
}

await writeFile(
  manifestPath,
  JSON.stringify(
    {
      captureDate: '2026-04-22',
      viewport: '1440x900',
      baseURL,
      mode: 'interactive-safe-fixture',
      records,
    },
    null,
    2,
  ),
);

console.log(`captured ${records.length} interactive V4 screenshots`);
console.log(`manifest ${manifestPath}`);
