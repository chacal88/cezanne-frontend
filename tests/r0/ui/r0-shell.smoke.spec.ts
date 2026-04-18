import {expect, test} from '@playwright/test';

test('notifications resolve registered candidate destinations and allow notification-driven entry', async ({page}) => {
    await page.goto('/notifications');

    await expect(page.getByRole('heading', {name: 'Notifications'})).toBeVisible();
    await expect(page.getByTestId('notification-status-n-1')).toContainText('Ready to navigate.');
    await expect(page.getByTestId('notification-status-n-2')).toContainText('Ready to navigate.');

    await page.getByTestId('notification-link-n-1').click();
    await expect(page).toHaveURL(/\/candidate\/candidate-123\/job-456\/screening\/2\/remote\/interview-1\?entry=notification/);
    await expect(page.getByRole('heading', {name: 'Candidate hub'})).toBeVisible();
    await expect(page.getByTestId('candidate-detail-entry')).toHaveText('notification');
});

test('inbox renders the accepted conversation search param', async ({page}) => {
    await page.goto('/inbox?conversation=conversation-123');

    await expect(page.getByRole('heading', {name: 'Inbox'})).toBeVisible();
    await expect(page.getByTestId('inbox-active-conversation')).toHaveText('conversation-123');
});

test('careers/application settings routes preserve direct entry and list-editor continuity', async ({page}) => {
    await page.goto('/settings/careers-page');
    await expect(page.getByRole('heading', {name: 'Careers page settings'})).toBeVisible();

    await page.goto('/settings/application-page/company-1/questions/fields');
    await expect(page.getByRole('heading', {name: 'Application page settings'})).toBeVisible();
    await expect(page.getByTestId('application-page-section')).toHaveText('questions');
    await expect(page.getByTestId('application-page-subsection')).toHaveText('fields');

    await page.goto('/settings/job-listings?tab=draft&brand=acme');
    await expect(page.getByRole('heading', {name: 'Job listings settings'})).toBeVisible();
    await expect(page.getByTestId('job-listings-tab')).toHaveText('draft');
    await expect(page.getByTestId('job-listings-brand')).toHaveText('acme');

    await page.getByTestId('job-listings-edit-link-listing-1').click();
    await expect(page.getByRole('heading', {name: 'Edit listing'})).toBeVisible();
    await expect(page.getByTestId('job-listing-editor-brand')).toHaveText('acme');
    await page.getByTestId('job-listing-editor-cancel-link').click();
    await expect(page).toHaveURL(/\/settings\/job-listings\?tab=draft&brand=acme$/);
});

test('jobs list restores URL-owned state', async ({page}) => {
    await page.goto('/jobs/open?page=2&search=engineer&asAdmin=true&label=remote');

    await expect(page.getByRole('heading', {name: 'Jobs'})).toBeVisible();
    await expect(page.getByTestId('jobs-list-scope')).toHaveText('open');
    await expect(page.getByTestId('jobs-list-search')).toHaveText('engineer');
    await expect(page.getByTestId('jobs-list-page')).toHaveText('2');
    await expect(page.getByTestId('jobs-list-as-admin')).toHaveText('true');
    await expect(page.getByTestId('jobs-list-label')).toHaveText('remote');
});

test('job authoring keeps explicit resetWorkflow handling', async ({page}) => {
    await page.goto('/jobs/manage/job-123?resetWorkflow=true');

    await expect(page.getByRole('heading', {name: 'Edit job'})).toBeVisible();
    await expect(page.getByTestId('job-authoring-mode')).toHaveText('edit');
    await expect(page.getByTestId('job-authoring-reset-workflow')).toHaveText('true');
    await expect(page.getByTestId('job-authoring-branching')).toHaveText('requisition-aware');
});

test('job detail and task routes preserve section and explicit parent return', async ({page}) => {
    await page.goto('/job/job-123?section=candidates');

    await expect(page.getByRole('heading', {name: 'Job hub'})).toBeVisible();
    await expect(page.getByTestId('job-detail-section')).toHaveText('candidates');

    await page.getByTestId('job-open-schedule-link').click();
    await expect(page.getByTestId('job-task-parent')).toHaveText('/job/job-123?section=candidates');
    await page.getByTestId('job-task-close-link').click();
    await expect(page).toHaveURL(/\/job\/job-123\?section=candidates$/);
});

test('candidate detail preserves contextual direct entry and visible parent refresh after actions', async ({page}) => {
    await page.goto('/candidate/candidate-123/job-456/screening/2/remote/interview-1?entry=direct');

    await expect(page.getByRole('heading', {name: 'Candidate hub'})).toBeVisible();
    await expect(page.getByTestId('candidate-detail-entry')).toHaveText('direct');
    await expect(page.getByTestId('candidate-detail-job')).toHaveText('job-456');
    await expect(page.getByTestId('candidate-detail-sequence-state')).toHaveText('available');

    await page.getByTestId('candidate-open-offer-link').click();
    await expect(page.getByTestId('candidate-task-parent')).toHaveText('/candidate/candidate-123/job-456/screening/2/remote/interview-1');
    await page.getByTestId('candidate-task-complete-link').click();

    await expect(page).toHaveURL(/\/candidate\/candidate-123\/job-456\/screening\/2\/remote\/interview-1/);
    await expect(page.getByTestId('candidate-detail-last-action')).toHaveText('offer completed');
    await expect(page.getByTestId('candidate-contracts-state')).toHaveText('sent');
});

test('user profile closes back to dashboard', async ({page}) => {
    await page.goto('/user-profile');

    await expect(page.getByRole('heading', {name: 'User profile'})).toBeVisible();
    await page.getByTestId('user-profile-close-link').click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', {name: 'Dashboard'})).toBeVisible();
});

test('public token and access-denied routes render', async ({page}) => {
    await page.goto('/confirm-registration/example-token');
    await expect(page.getByRole('heading', {name: 'Confirm registration'})).toBeVisible();

    await page.goto('/access-denied');
    await expect(page.getByRole('heading', {name: 'Access denied'})).toBeVisible();
});


test('public shared job supports direct entry and application launch', async ({page}) => {
    await page.goto('/shared/product-designer/valid-token/email');

    await expect(page.getByRole('heading', {name: 'Shared job'})).toBeVisible();
    await expect(page.getByTestId('shared-job-title')).toHaveText('Product Designer role');

    await page.getByTestId('shared-job-apply-link').click();
    await expect(page).toHaveURL(/\/product-designer\/application\/valid-token\/email$/);
    await expect(page.getByRole('heading', {name: 'Public application'})).toBeVisible();
});

test('public token states remain visible for expired routes', async ({page}) => {
    await page.goto('/shared/product-designer/expired-token/email');

    await expect(page.getByRole('heading', {name: 'Expired link'})).toBeVisible();
    await expect(page.getByTestId('shared-job-token-state')).toHaveText('expired');
});

test('public application keeps completion stable on reload', async ({page}) => {
    await page.goto('/product-designer/application/valid-token/email');

    await page.getByTestId('public-application-first-name').fill('Alex');
    await page.getByTestId('public-application-email').fill('alex@example.com');
    await page.getByTestId('public-application-submit-button').click();

    await expect(page.getByRole('heading', {name: 'Application complete'})).toBeVisible();
    await expect(page.getByTestId('public-application-completion')).toHaveText('Application submitted successfully.');

    await page.reload();
    await expect(page.getByTestId('public-application-completion')).toHaveText('Application submitted successfully.');
});

test('public survey supports direct entry and stable completion', async ({page}) => {
    await page.goto('/surveys/valid-survey/job-1/cv-1');

    await page.getByTestId('public-survey-answer').fill('I enjoy collaborative product work.');
    await page.getByTestId('public-survey-submit-button').click();

    await expect(page.getByRole('heading', {name: 'Survey complete'})).toBeVisible();
    await expect(page.getByTestId('public-survey-completion')).toHaveText('Survey completed successfully.');

    await page.reload();
    await expect(page.getByTestId('public-survey-completion')).toHaveText('Survey completed successfully.');
});


test('requisition approval supports direct entry and stable approved completion', async ({page}) => {
    await page.goto('/job-requisition-approval?token=valid-token');

    await expect(page.getByRole('heading', {name: 'Requisition approval'})).toBeVisible();
    await expect(page.getByTestId('requisition-approval-workflow-state')).toHaveText('awaiting-decision');

    await page.getByTestId('requisition-approval-approve-button').click();
    await expect(page.getByRole('heading', {name: 'Requisition approved'})).toBeVisible();
    await expect(page.getByTestId('requisition-approval-terminal-state')).toHaveText('approved');

    await page.reload();
    await expect(page.getByTestId('requisition-approval-terminal-state')).toHaveText('approved');
});

test('requisition approval keeps reject validation recoverable and stable after success', async ({page}) => {
    await page.goto('/job-requisition-approval?token=reject-comment-token');

    await page.getByTestId('requisition-approval-reject-button').click();
    await expect(page.getByTestId('requisition-approval-error')).toHaveText('Add a rejection comment before rejecting this requisition.');

    await page.getByTestId('requisition-approval-comment').fill('Budget is not approved.');
    await page.getByTestId('requisition-approval-reject-button').click();
    await expect(page.getByRole('heading', {name: 'Requisition rejected'})).toBeVisible();
    await expect(page.getByTestId('requisition-approval-terminal-state')).toHaveText('rejected');

    await page.reload();
    await expect(page.getByTestId('requisition-approval-terminal-state')).toHaveText('rejected');
});

test('requisition approval shows token-state and workflow-drift recovery outcomes', async ({page}) => {
    await page.goto('/job-requisition-approval?token=expired-token');
    await expect(page.getByRole('heading', {name: 'Expired link'})).toBeVisible();
    await expect(page.getByTestId('requisition-approval-token-state')).toHaveText('expired');

    await page.goto('/job-requisition-approval?token=drift-on-submit-token');
    await page.getByTestId('requisition-approval-approve-button').click();
    await expect(page.getByRole('heading', {name: 'Approval no longer actionable'})).toBeVisible();
    await expect(page.getByTestId('requisition-approval-workflow-drift')).toHaveText('workflow-drift');
});

test('external interview request supports terminal accept outcomes and refresh stability', async ({page}) => {
    await page.goto('/interview-request/schedule-1/valid-token');

    await expect(page.getByRole('heading', {name: 'Interview request'})).toBeVisible();
    await expect(page.getByTestId('interview-request-participant')).toBeVisible();
    await page.getByTestId('interview-request-accept-button').click();

    await expect(page.getByRole('heading', {name: 'Interview request complete'})).toBeVisible();
    await expect(page.getByTestId('interview-request-completion')).toHaveText('Interview request accepted.');

    await page.reload();
    await expect(page.getByTestId('interview-request-completion')).toHaveText('Interview request accepted.');
});

test('external review candidate keeps retry behavior and terminal submission state', async ({page}) => {
    await page.goto('/review-candidate/valid-review');

    await expect(page.getByRole('heading', {name: 'Candidate review'})).toBeVisible();
    await page.getByTestId('review-candidate-score').fill('4');
    await page.getByTestId('review-candidate-summary').fill('submit-fail summary');
    await page.getByTestId('review-candidate-submit-button').click();
    await expect(page.getByTestId('review-candidate-error')).toHaveText('Candidate review submission failed. Try again.');

    await page.getByTestId('review-candidate-summary').fill('Strong communication and preparation.');
    await page.getByTestId('review-candidate-submit-button').click();
    await expect(page.getByRole('heading', {name: 'Candidate review submitted'})).toBeVisible();

    await page.reload();
    await expect(page.getByTestId('review-candidate-completion')).toHaveText('Candidate review submitted successfully.');
});

test('external interview feedback supports direct entry, submission, and expired token states', async ({page}) => {
    await page.goto('/interview-feedback/valid-feedback');

    await expect(page.getByRole('heading', {name: 'Interview feedback'})).toBeVisible();
    await page.getByTestId('interview-feedback-score').fill('5');
    await page.getByTestId('interview-feedback-summary').fill('Clear technical depth and collaboration.');
    await page.getByTestId('interview-feedback-submit-button').click();

    await expect(page.getByRole('heading', {name: 'Interview feedback submitted'})).toBeVisible();
    await expect(page.getByTestId('interview-feedback-completion')).toHaveText('Interview feedback submitted successfully.');

    await page.goto('/interview-request/schedule-1/expired-token');
    await expect(page.getByRole('heading', {name: 'Expired link'})).toBeVisible();
    await expect(page.getByTestId('external-interview-request-token-state')).toHaveText('expired');
});

test('integration CV callback supports direct entry, retry, and stable completion', async ({page}) => {
    await page.goto('/integration/cv/conflict-token');

    await expect(page.getByRole('heading', {name: 'Integration CV callback'})).toBeVisible();
    await page.getByTestId('integration-cv-submit-button').click();
    await expect(page.getByTestId('integration-cv-error')).toHaveText('The selected interview slot is no longer available.');

    await page.goto('/integration/cv/valid-token');
    await page.getByTestId('integration-cv-submit-button').click();
    await expect(page.getByRole('heading', {name: 'Integration CV callback complete'})).toBeVisible();
    await expect(page.getByTestId('integration-cv-completion')).toHaveText('Interview slot confirmed successfully.');

    await page.reload();
    await expect(page.getByTestId('integration-cv-completion')).toHaveText('Interview slot confirmed successfully.');
});

test('integration forms callback supports sequential completion with recoverable upload failure', async ({page}) => {
    await page.goto('/integration/forms/valid-token');

    await expect(page.getByRole('heading', {name: 'Requested forms and documents'})).toBeVisible();
    await page.getByTestId('integration-forms-answer').fill('Passport attached.');
    await page.getByTestId('integration-forms-file-name').fill('upload-fail.pdf');
    await page.getByTestId('integration-forms-submit-button').click();
    await expect(page.getByTestId('integration-forms-error')).toHaveText('Binary upload failed. Try again.');

    await page.getByTestId('integration-forms-file-name').fill('passport.pdf');
    await page.getByTestId('integration-forms-submit-button').click();
    await expect(page.getByTestId('integration-forms-current-step')).toHaveText('Availability notes');

    await page.getByTestId('integration-forms-answer').fill('Available next week.');
    await page.getByTestId('integration-forms-submit-button').click();
    await expect(page.getByRole('heading', {name: 'Requested forms/documents complete'})).toBeVisible();
    await expect(page.getByTestId('integration-forms-completion')).toHaveText('Requested forms/documents submitted successfully.');

    await page.reload();
    await expect(page.getByTestId('integration-forms-completion')).toHaveText('Requested forms/documents submitted successfully.');
});

test('integration job callback supports normalized direct entry and expired token states', async ({page}) => {
    await page.goto('/integration/job/valid-token');
    await expect(page.getByRole('heading', {name: 'Integration job callback'})).toBeVisible();
    await expect(page.getByTestId('integration-job-title')).toHaveText('Product Designer');

    await page.goto('/integration/job/expired-token');
    await expect(page.getByRole('heading', {name: 'Expired link'})).toBeVisible();
    await expect(page.getByTestId('integration-job-token-state')).toHaveText('expired');
});

