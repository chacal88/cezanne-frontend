import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardPage } from './dashboard-page';
import { renderWithProviders } from '../../testing/render';
import type { AccessContext } from '../../lib/access-control';
import type { DashboardApiAdapter } from './api';
import type { DashboardOverview } from './dashboard-state';

const sysadminAccess: AccessContext = {
  isAuthenticated: true,
  organizationType: 'none',
  isAdmin: true,
  isSysAdmin: true,
  pivotEntitlements: [],
  subscriptionCapabilities: [],
  rolloutFlags: [],
};

const hcAccess: AccessContext = {
  isAuthenticated: true,
  organizationType: 'hc',
  isAdmin: true,
  isSysAdmin: false,
  pivotEntitlements: [],
  subscriptionCapabilities: ['inbox'],
  rolloutFlags: [],
};

const overview: DashboardOverview = {
  liveJobsUuids: ['job-1', 'job-2'],
  liveJobsCount: 2,
  liveCvsCount: 14,
  liveInterviewsScheduledCount: 3,
  users: [{ uuid: 'user-1', firstName: 'Ada', lastName: 'Lovelace' }],
  auth: { firstName: 'Ada', occupopEmailConfirmed: true },
  calendarIntegrationState: 'ready',
  notificationCount: 3,
  inboxConversationCount: 2,
};

function adapter(result: DashboardOverview | Error): DashboardApiAdapter {
  return {
    contract: 'api',
    loadOverview: async () => {
      if (result instanceof Error) throw result;
      return result;
    },
  };
}

describe('DashboardPage', () => {
  it('renders SysAdmin platform mode through the dashboard route', () => {
    window.history.pushState({}, '', '/dashboard');
    renderWithProviders(<DashboardPage adapter={adapter(overview)} />, { accessContext: sysadminAccess });

    expect(screen.getByRole('heading', { name: 'Platform administration' })).toBeVisible();
    expect(screen.getByText(/SysAdmin platform entry uses/)).toBeVisible();
    expect(screen.getByTestId('dashboard-reentry-state')).toHaveTextContent('platform-landing');
  });



  it('does not show fixture counts while the API overview is loading', () => {
    window.history.pushState({}, '', '/dashboard');
    const pendingAdapter: DashboardApiAdapter = { contract: 'api', loadOverview: () => new Promise(() => undefined) };
    renderWithProviders(<DashboardPage adapter={pendingAdapter} />, { accessContext: hcAccess });

    expect(screen.getByTestId('dashboard-load-state')).toHaveTextContent('loading');
    expect(screen.getByTestId('dashboard-card-jobs')).not.toHaveTextContent(/\d/);
    expect(screen.getByTestId('dashboard-card-candidates')).not.toHaveTextContent(/\d/);
    expect(screen.getByTestId('dashboard-card-interviews')).not.toHaveTextContent(/\d/);
  });

  it('renders recruiter-core dashboard cards from the API overview', async () => {
    window.history.pushState({}, '', '/dashboard');
    renderWithProviders(<DashboardPage adapter={adapter(overview)} />, { accessContext: hcAccess });

    expect(await screen.findByText(/Welcome back, Ada/)).toBeVisible();
    expect(screen.getByTestId('dashboard-card-jobs')).toHaveTextContent('2');
    expect(screen.getByTestId('dashboard-card-candidates')).toHaveTextContent('14');
    expect(screen.getByTestId('dashboard-card-interviews')).toHaveTextContent('3');
    expect(screen.getByTestId('dashboard-source-health')).toHaveTextContent('ready');
    expect(screen.getByTestId('dashboard-inbox-state')).toHaveTextContent('ready');
    expect(screen.getByTestId('dashboard-adapter-contract')).toHaveTextContent('api');
  });

  it('renders notification fallback with safe action and target refresh intent', async () => {
    window.history.pushState({}, '', '/dashboard?reason=stale-target&fallbackTarget=/inbox&sourceHealth=stale');
    renderWithProviders(<DashboardPage adapter={adapter(overview)} />, { accessContext: hcAccess });

    expect(await screen.findByTestId('dashboard-reentry-state')).toHaveTextContent('stale-target');
    expect(screen.getByTestId('dashboard-fallback-target')).toHaveAttribute('href', '/inbox');
    expect(screen.getByTestId('dashboard-refresh-required')).toHaveTextContent('true');
    expect(screen.getByTestId('dashboard-action-refresh-retry-dashboard')).toHaveTextContent('dashboard');
  });

  it('degrades safely when the dashboard aggregate cannot load', async () => {
    window.history.pushState({}, '', '/dashboard');
    renderWithProviders(<DashboardPage adapter={adapter(new Error('offline'))} />, { accessContext: hcAccess });

    expect(await screen.findByTestId('dashboard-load-state')).toHaveTextContent('degraded');
    expect(screen.getByTestId('dashboard-source-health')).toHaveTextContent('degraded');
    expect(screen.getByTestId('dashboard-card-jobs')).toBeVisible();
  });
});
