import { expect, test } from '@playwright/test';

test('notifications show an R0-safe fallback for unresolved destinations', async ({ page }) => {
  await page.goto('/notifications');

  await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
  await expect(page.getByTestId('notification-status-n-1')).toContainText('not registered in R0 yet');
  await expect(page.getByTestId('notification-status-n-1')).toContainText('/access-denied');
  await expect(page.getByTestId('notification-status-n-2')).toContainText('not registered in R0 yet');
  await expect(page.getByTestId('notification-status-n-2')).toContainText('/access-denied');
});

test('inbox renders the accepted conversation search param', async ({ page }) => {
  await page.goto('/inbox?conversation=conversation-123');

  await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();
  await expect(page.getByTestId('inbox-active-conversation')).toHaveText('conversation-123');
});

test('user profile closes back to dashboard', async ({ page }) => {
  await page.goto('/user-profile');

  await expect(page.getByRole('heading', { name: 'User profile' })).toBeVisible();
  await page.getByTestId('user-profile-close-link').click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('public token and access-denied routes render', async ({ page }) => {
  await page.goto('/confirm-registration/example-token');
  await expect(page.getByRole('heading', { name: 'Confirm registration' })).toBeVisible();

  await page.goto('/access-denied');
  await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible();
});
