import { screen } from '@testing-library/react';
import { DashboardPage } from './dashboard-page';
import { renderWithProviders } from '../../testing/render';
import type { AccessContext } from '../../lib/access-control';

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

describe('DashboardPage', () => {
  it('renders SysAdmin platform mode through the dashboard route', () => {
    window.history.pushState({}, '', '/dashboard');
    renderWithProviders(<DashboardPage />, { accessContext: sysadminAccess });

    expect(screen.getByRole('heading', { name: 'Platform administration' })).toBeVisible();
    expect(screen.getByText(/SysAdmin platform entry uses/)).toBeVisible();
    expect(screen.getByTestId('dashboard-reentry-state')).toHaveTextContent('platform-landing');
  });

  it('preserves recruiter-core dashboard content for HC users with operational state', () => {
    window.history.pushState({}, '', '/dashboard');
    renderWithProviders(<DashboardPage />, { accessContext: hcAccess });

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Platform administration' })).not.toBeInTheDocument();
    expect(screen.getByTestId('dashboard-source-health')).toHaveTextContent('ready');
    expect(screen.getByTestId('dashboard-inbox-state')).toHaveTextContent('ready');
  });

  it('renders notification fallback with safe action and target refresh intent', () => {
    window.history.pushState({}, '', '/dashboard?reason=stale-target&fallbackTarget=/inbox&sourceHealth=stale');
    renderWithProviders(<DashboardPage />, { accessContext: hcAccess });

    expect(screen.getByTestId('dashboard-reentry-state')).toHaveTextContent('stale-target');
    expect(screen.getByTestId('dashboard-fallback-target')).toHaveAttribute('href', '/inbox');
    expect(screen.getByTestId('dashboard-refresh-required')).toHaveTextContent('true');
    expect(screen.getByTestId('dashboard-action-refresh-retry-dashboard')).toHaveTextContent('dashboard');
  });
});
