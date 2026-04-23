import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outputRoot = path.join(root, 'docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass');
const newRoot = path.join(outputRoot, 'new');
const recordsPath = path.join(outputRoot, 'recapture-records.json');
const baseUrl = process.env.RECRUIT_FRONTEND_URL ?? 'http://127.0.0.1:5173';

const hcAdminAccess = {
  isAuthenticated: true,
  organizationType: 'hc',
  isAdmin: true,
  isSysAdmin: false,
  pivotEntitlements: ['seeCandidates', 'jobRequisition'],
  subscriptionCapabilities: ['calendarIntegration', 'formsDocs', 'surveys', 'customFields', 'candidateTags', 'reviewRequests', 'interviewFeedback', 'inbox', 'rejectionReason'],
  rolloutFlags: ['customFieldsBeta'],
};

const finnUuid = '11111111-1111-4111-8111-111111111111';
const diegoUuid = '22222222-2222-4222-8222-222222222222';
const candidateRows = [
  {
    id: 6,
    uuid: finnUuid,
    first_name: 'Finn',
    last_name: 'ApiSeed',
    email: 'api-seed-6-api-seed-1776817888-62113@example.test',
    city_name: 'Dublin, Ireland',
    status: 'rejected',
    source: 'Indeed',
    job_id: 'job-13',
    hiring_flow_step_id: 'rejected',
  },
  {
    id: 5,
    uuid: '33333333-3333-4333-8333-333333333333',
    first_name: 'Eva',
    last_name: 'ApiSeed',
    email: 'api-seed-5-api-seed-1776817888-62113@example.test',
    city_name: 'Dublin, Ireland',
    status: 'screening',
    source: 'Indeed',
    job_id: 'job-13',
    hiring_flow_step_id: 'screening',
  },
  {
    id: 4,
    uuid: diegoUuid,
    first_name: 'Diego',
    last_name: 'ApiSeed',
    email: 'api-seed-4-api-seed-1776817888-62113@example.test',
    city_name: 'Dublin, Ireland',
    status: 'shortlisted',
    source: 'Direct CV upload',
    job_id: 'job-13',
    hiring_flow_step_id: 'shortlisted',
  },
  {
    id: 3,
    uuid: '44444444-4444-4444-8444-444444444444',
    first_name: 'Cara',
    last_name: 'ApiSeed',
    email: 'api-seed-3-api-seed-1776817888-62113@example.test',
    city_name: 'Dublin, Ireland',
    status: 'screening',
    source: 'Indeed',
    job_id: 'job-13',
    hiring_flow_step_id: 'screening',
  },
  {
    id: 7,
    uuid: '77777777-7777-4777-8777-777777777777',
    first_name: 'Cara',
    last_name: 'ApiSeed',
    email: 'api-seed-3-api-seed-1776817888-62113@example.test',
    city_name: 'Dublin, Ireland',
    status: 'screening',
    source: 'Indeed',
    job_id: 'job-13',
    hiring_flow_step_id: 'screening',
  },
  {
    id: 2,
    uuid: '55555555-5555-4555-8555-555555555555',
    first_name: 'Ben',
    last_name: 'ApiSeed',
    email: 'api-seed-2-api-seed-1776817888-62113@example.test',
    city_name: 'Dublin, Ireland',
    status: 'screening',
    source: 'Indeed',
    job_id: 'job-13',
    hiring_flow_step_id: 'screening',
  },
  {
    id: 8,
    uuid: '88888888-8888-4888-8888-888888888888',
    first_name: 'Ben',
    last_name: 'ApiSeed',
    email: 'api-seed-2-api-seed-1776817888-62113@example.test',
    city_name: 'Dublin, Ireland',
    status: 'screening',
    source: 'Indeed',
    job_id: 'job-13',
    hiring_flow_step_id: 'screening',
  },
  {
    id: 1,
    uuid: '66666666-6666-4666-8666-666666666666',
    first_name: 'Ava',
    last_name: 'ApiSeed',
    email: 'api-seed-1-api-seed-1776817888-62113@example.test',
    city_name: 'Dublin, Ireland',
    status: 'screening',
    source: 'Indeed',
    job_id: 'job-13',
    hiring_flow_step_id: 'screening',
  },
];

const captureRecords = [
  {
    id: finnUuid,
    cvId: '6',
    name: 'Finn ApiSeed',
    stage: 'Rejected',
    headline: 'CV received 9 hours ago from Indeed',
    email: 'api-seed-6-api-seed-1776817888-62113@example.test',
    phone: '+353 1 555 06',
    location: 'Dublin, Ireland',
    lastAction: 'CV received 9 hours ago',
    comments: ['Legacy comments baseline'],
    tags: [],
    conversationId: `candidate-${finnUuid}`,
    formsCount: 0,
    formsStatus: 'not-started',
    candidateOwnedDocuments: 0,
    contractsCount: 0,
    contractsStatus: 'not-started',
    interviewsCount: 0,
    interviewsStatus: 'not-started',
    surveysCount: 0,
    surveysStatus: 'not-started',
    customFields: [
      { label: 'Job', value: 'API Seed Pipeline api-seed-1776817888-62113' },
      { label: 'Source', value: 'Indeed' },
      { label: 'Total score', value: '-' },
    ],
    cvVersion: 1,
    previewPath: '/assets/api-seed-finn-cv-v1.pdf',
    downloadPath: '/assets/api-seed-finn-cv-v1.pdf?download=1',
    updatedAt: '2026-04-22T09:00:00Z',
  },
  {
    id: diegoUuid,
    cvId: '4',
    name: 'Diego ApiSeed',
    stage: 'Shortlisted',
    headline: 'CV received 9 hours ago from Direct CV upload',
    email: 'api-seed-4-api-seed-1776817888-62113@example.test',
    phone: '+353 1 555 04',
    location: 'Dublin, Ireland',
    lastAction: 'CV received 9 hours ago',
    comments: ['Legacy comments baseline'],
    tags: [],
    conversationId: `candidate-${diegoUuid}`,
    formsCount: 0,
    formsStatus: 'not-started',
    candidateOwnedDocuments: 0,
    contractsCount: 0,
    contractsStatus: 'not-started',
    interviewsCount: 0,
    interviewsStatus: 'not-started',
    surveysCount: 0,
    surveysStatus: 'not-started',
    customFields: [
      { label: 'Job', value: 'API Seed Pipeline api-seed-1776817888-62113' },
      { label: 'Source', value: 'Direct CV upload' },
      { label: 'Total score', value: '-' },
    ],
    cvVersion: 1,
    previewPath: '/assets/api-seed-diego-cv-v1.pdf',
    downloadPath: '/assets/api-seed-diego-cv-v1.pdf?download=1',
    updatedAt: '2026-04-22T09:00:00Z',
  },
];

function sessionPayload() {
  return JSON.stringify({
    version: 1,
    accessContext: hcAdminAccess,
    landingTarget: '/dashboard',
    token: 'v2-parity-recapture-token',
  });
}

async function installHarness(page) {
  await page.route('**/v2/cv?**', async (route) => {
    const url = new URL(route.request().url());
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';
    const rows = search
      ? candidateRows.filter((row) =>
          `${row.first_name} ${row.last_name} ${row.email} ${row.city_name}`.toLowerCase().includes(search),
        )
      : candidateRows;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: rows,
        current_page: Number(url.searchParams.get('page') ?? 1),
        per_page: 16,
        total: rows.length,
        from: rows.length ? 1 : 0,
        to: rows.length,
      }),
    });
  });

  await page.route('**/graphql', async (route) => {
    const postData = route.request().postDataJSON();
    const requestedUuid = postData?.variables?.candidateUuid;
    const candidateRecord = requestedUuid === diegoUuid ? captureRecords[1] : captureRecords[0];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          monolith: {
            candidate: [{
              id: candidateRecord.cvId,
              uuid: candidateRecord.id,
              status: candidateRecord.stage.toLowerCase(),
              fullName: candidateRecord.name,
              email: candidateRecord.email,
              phone: candidateRecord.phone,
              sourceName: candidateRecord.customFields[1].value,
              updatedAt: '2026-04-22T10:00:00Z',
              totalScore: null,
              hiringFlowStep: { id: candidateRecord.stage.toLowerCase(), name: candidateRecord.stage },
              location: { cityFullName: candidateRecord.location },
              tags: [],
              job: { id: 'job-13', title: 'API Seed Pipeline api-seed-1776817888-62113' },
              file: { url: candidateRecord.downloadPath },
              forms: [],
              documents: [],
              interviewForms: [],
            }],
            candidateComments: [{ message: 'Legacy comments baseline' }],
          },
        },
      }),
    });
  });

  await page.addInitScript(({ session, records }) => {
    window.localStorage.setItem('recruit.localAuthSession', session);
    window.localStorage.setItem('oc_loginServiceToken', 'v2-parity-recapture-token');
    window.sessionStorage.setItem('candidate-store-v1', JSON.stringify(records));
  }, { session: sessionPayload(), records: captureRecords });
}

async function capture(page, records, name, note) {
  const file = `${name}.png`;
  const absolutePath = path.join(newRoot, file);
  await page.screenshot({ path: absolutePath, fullPage: false });
  records.push({
    name,
    route: new URL(page.url()).pathname + new URL(page.url()).search,
    path: path.relative(root, absolutePath),
    note,
    status: 'captured',
  });
}

async function waitForReady(page, testId) {
  await page.getByTestId(testId).waitFor({ state: 'visible', timeout: 10000 });
}

async function main() {
  await fs.mkdir(newRoot, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await installHarness(page);
  const records = [];

  await page.goto(`${baseUrl}/candidates-database`);
  await waitForReady(page, 'candidate-database-composition');
  await capture(page, records, '01-database-ready-density-pass', 'Candidate database after saved filter/list and density parity pass.');

  await page.getByTestId('candidate-database-add-new-button').click();
  await capture(page, records, '02-database-add-new-menu-density-pass', 'Add new menu after compact database sidebar pass.');

  await page.goto(`${baseUrl}/candidates-database`);
  await waitForReady(page, 'candidate-database-composition');
  await page.getByTestId('candidate-filter-menu-button').click();
  await capture(page, records, '03-database-saved-filter-menu-density-pass', 'Saved filter kebab menu with comparable filter entries.');

  await page.goto(`${baseUrl}/candidates-database`);
  await waitForReady(page, 'candidate-database-composition');
  await page.getByTestId('candidate-list-menu-button').click();
  await capture(page, records, '04-database-saved-list-menu-density-pass', 'Saved list kebab menu with comparable list entries.');

  await page.goto(`${baseUrl}/candidates-database`);
  await waitForReady(page, 'candidate-database-composition');
  await page.locator('tbody input[type="checkbox"]').first().check();
  await page.getByTestId('candidate-database-selected-toolbar').waitFor({ state: 'visible' });
  await page.getByTestId('candidate-database-bulk-actions-enabled').click();
  await page.getByTestId('candidate-database-bulk-menu').waitFor({ state: 'visible' });
  await capture(page, records, '05-database-row-selected-bulk-enabled', 'First row selected with legacy-style bulk action toolbar and dropdown visible.');

  await page.goto(`${baseUrl}/candidates-database`);
  await waitForReady(page, 'candidate-database-composition');
  await page.getByTestId('candidate-add-column-button').click();
  await page.getByTestId('candidate-add-column-menu').waitFor({ state: 'visible' });
  await capture(page, records, '06-database-add-column-menu-parity-pass', 'Add column menu with selectable legacy-style column options.');

  await page.goto(`${baseUrl}/candidates-database?query=no-parity-match`);
  await waitForReady(page, 'candidate-database-composition');
  await page.getByText('No candidates found').waitFor({ state: 'visible' });
  await capture(page, records, '07-database-search-no-match', 'No-match search state with route-owned query preserved.');

  await Promise.all([
    page.waitForURL('**/candidates-database'),
    page.getByTestId('candidate-database-clear-filters-link').click(),
  ]);
  await waitForReady(page, 'candidate-database-composition');
  await page.locator('tbody input[type="checkbox"]').first().waitFor({ state: 'visible' });
  await capture(page, records, '08-database-reset-default-after-search', 'Reset to default returns from no-match search to the default candidate list.');

  await page.goto(`${baseUrl}/candidates-database?tags=denied`);
  await waitForReady(page, 'candidate-database-composition');
  await page.getByTestId('candidate-database-visible-state').waitFor({ state: 'visible' });
  await capture(page, records, '09-database-denied-state', 'Candidate database denied state made visible for parity coverage.');

  await page.goto(`${baseUrl}/candidates-database?tags=stale`);
  await waitForReady(page, 'candidate-database-composition');
  await page.getByTestId('candidate-database-visible-state').waitFor({ state: 'visible' });
  await capture(page, records, '09b-database-stale-state', 'Candidate database stale state made visible for parity coverage.');

  await page.goto(`${baseUrl}/candidates-database?tags=unavailable`);
  await waitForReady(page, 'candidate-database-composition');
  await page.getByTestId('candidate-database-visible-state').waitFor({ state: 'visible' });
  await capture(page, records, '09c-database-unavailable-state', 'Candidate database unavailable state made visible for parity coverage.');

  await page.goto(`${baseUrl}/candidate/${finnUuid}/job-13/rejected/2/remote/interview-1?entry=job`);
  await waitForReady(page, 'candidate-detail-composition');
  await capture(page, records, '10-detail-ready-after-parity-pass', 'Candidate detail ready state after legacy action modal entry pass.');

  await page.goto(`${baseUrl}/candidate/${diegoUuid}/job-13/shortlisted/1/remote/interview-1?entry=job`);
  await waitForReady(page, 'candidate-detail-composition');
  await page.getByTestId('candidate-more-actions-button').click();
  await capture(page, records, '11-detail-more-actions-after-parity-pass', 'Candidate detail More actions menu after adding legacy modal entries.');

  await page.getByTestId('candidate-open-email-modal').click();
  await page.getByTestId('candidate-email-legacy-modal').waitFor({ state: 'visible' });
  await capture(page, records, '12-detail-email-candidate-modal', 'Legacy-style Email candidate modal entry.');

  await page.goto(`${baseUrl}/candidate/${diegoUuid}/job-13/shortlisted/1/remote/interview-1?entry=job`);
  await waitForReady(page, 'candidate-detail-composition');
  await page.getByTestId('candidate-more-actions-button').click();
  await page.getByTestId('candidate-open-review-request-modal').click();
  await page.getByTestId('candidate-review-legacy-modal').waitFor({ state: 'visible' });
  await capture(page, records, '13-detail-send-to-hiring-manager-modal', 'Legacy-style Send to hiring manager modal entry.');

  await page.getByLabel('Close candidate action').click();
  await page.getByTestId('candidate-more-actions-button').click();
  await page.getByTestId('candidate-open-move-job-modal').click();
  await page.getByTestId('candidate-move-legacy-modal').waitFor({ state: 'visible' });
  await capture(page, records, '14-detail-move-job-modal', 'Legacy-style Move to a different job modal entry.');

  await page.getByLabel('Close candidate action').click();
  await page.getByTestId('candidate-tab-interview').click();
  await page.getByTestId('candidate-open-score-now-modal').click();
  await page.getByTestId('candidate-score-legacy-modal').waitFor({ state: 'visible' });
  await capture(page, records, '15-detail-score-now-modal', 'Legacy-style Score now modal entry.');

  await page.goto(`${baseUrl}/candidate/${diegoUuid}/job-13/shortlisted/1/remote/interview-1?entry=job`);
  await waitForReady(page, 'candidate-detail-composition');
  await page.getByTestId('candidate-upload-cv-button').click();
  await capture(page, records, '16-detail-upload-new-cv-success', 'Upload new CV control and success state from the legacy CV tab area.');

  await page.goto(`${baseUrl}/candidate/${diegoUuid}/job-13/shortlisted/1/remote/interview-1?entry=job&fixtureAction=review-request&fixtureActionState=blocked`);
  await waitForReady(page, 'candidate-detail-composition');
  await page.getByTestId('candidate-review-legacy-modal').waitFor({ state: 'visible' });
  await capture(page, records, '17-detail-review-request-blocked-hook', 'Deterministic review-request blocked fixtureAction state.');

  await page.goto(`${baseUrl}/candidate/${diegoUuid}/job-13/shortlisted/1/remote/interview-1?entry=job&fixtureAction=move&fixtureActionState=parent-refresh-required`);
  await waitForReady(page, 'candidate-detail-composition');
  await page.getByTestId('candidate-move-legacy-modal').waitFor({ state: 'visible' });
  await capture(page, records, '18-detail-move-parent-refresh-hook', 'Deterministic move-job parent-refresh fixtureAction state.');

  await page.goto(`${baseUrl}/candidate/${diegoUuid}/job-13/shortlisted/1/remote/interview-1?entry=job&fixtureAction=hire&fixtureActionState=succeeded`);
  await waitForReady(page, 'candidate-detail-composition');
  await page.getByTestId('candidate-hire-legacy-modal').waitFor({ state: 'visible' });
  await capture(page, records, '19-detail-hire-success-hook', 'Deterministic hire succeeded fixtureAction state.');

  await page.goto(`${baseUrl}/candidate/${diegoUuid}/job-13/shortlisted/1/remote/interview-1?entry=job&fixtureAction=unhire&fixtureActionState=terminal`);
  await waitForReady(page, 'candidate-detail-composition');
  await page.getByTestId('candidate-unhire-legacy-modal').waitFor({ state: 'visible' });
  await capture(page, records, '20-detail-unhire-terminal-hook', 'Deterministic unhire terminal fixtureAction state.');

  await page.goto(`${baseUrl}/candidate/candidate-denied/job-13/shortlisted/1/remote/interview-1?entry=job`);
  await waitForReady(page, 'candidate-detail-composition');
  await page.getByTestId('candidate-detail-visible-state').waitFor({ state: 'visible' });
  await capture(page, records, '21-detail-denied-state', 'Candidate detail denied state made visible for parity coverage.');

  await page.goto(`${baseUrl}/candidate/candidate-stale/job-13/stale/stale/remote/interview-1?entry=job`);
  await waitForReady(page, 'candidate-detail-composition');
  await page.getByTestId('candidate-detail-visible-state').waitFor({ state: 'visible' });
  await capture(page, records, '22-detail-stale-state', 'Candidate detail stale-context state made visible for parity coverage.');

  await page.goto(`${baseUrl}/candidate/candidate-unavailable/job-13/shortlisted/1/remote/interview-1?entry=job`);
  await waitForReady(page, 'candidate-detail-composition');
  await page.getByTestId('candidate-detail-visible-state').waitFor({ state: 'visible' });
  await capture(page, records, '23-detail-unavailable-state', 'Candidate detail unavailable state made visible for parity coverage.');

  await page.goto(`${baseUrl}/candidate/${diegoUuid}/job-13/shortlisted/1/remote/interview-1/cv/4/schedule`);
  await waitForReady(page, 'candidate-task-composition');
  await capture(page, records, '30-action-schedule-modal-route', 'Route-owned Schedule task rendered as a modal surface over candidate profile.');

  await page.goto(`${baseUrl}/candidate/${diegoUuid}/job-13/shortlisted/1/remote/interview-1/cv/4/offer`);
  await waitForReady(page, 'candidate-task-composition');
  await capture(page, records, '31-action-offer-modal-route', 'Route-owned Offer task rendered as a modal surface over candidate profile.');

  await page.goto(`${baseUrl}/candidate/${diegoUuid}/job-13/shortlisted/1/remote/interview-1/cv-reject/4`);
  await waitForReady(page, 'candidate-task-composition');
  await capture(page, records, '32-action-reject-modal-route', 'Route-owned Reject task rendered as a modal surface over candidate profile.');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/candidates-database`);
  await waitForReady(page, 'candidate-database-composition');
  await capture(page, records, '40-mobile-database-ready', 'Mobile-width current database ready frame for coverage only.');

  await page.goto(`${baseUrl}/candidate/${diegoUuid}/job-13/shortlisted/1/remote/interview-1?entry=job`);
  await waitForReady(page, 'candidate-detail-composition');
  await capture(page, records, '41-mobile-detail-ready', 'Mobile-width current candidate detail ready frame for coverage only.');

  await fs.writeFile(recordsPath, `${JSON.stringify({
    captureDate: '2026-04-22',
    viewport: '1440x900',
    viewports: ['1440x900', '390x844'],
    baseUrl,
    sessionStorage: 'recruit.localAuthSession',
    records,
  }, null, 2)}\n`);
  await browser.close();
  console.log(`captured ${records.length} V2 parity-pass screenshots`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
