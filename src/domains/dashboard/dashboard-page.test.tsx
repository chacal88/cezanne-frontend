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
  subscriptionCapabilities: [],
  rolloutFlags: [],
};

describe('DashboardPage', () => {
  it('renders SysAdmin platform mode through the dashboard route', () => {
    renderWithProviders(<DashboardPage />, { accessContext: sysadminAccess });

    expect(screen.getByRole('heading', { name: 'Platform administration' })).toBeVisible();
    expect(screen.getByText(/SysAdmin platform entry uses/)).toBeVisible();
  });

  it('preserves recruiter-core dashboard content for HC users', () => {
    renderWithProviders(<DashboardPage />, { accessContext: hcAccess });

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Platform administration' })).not.toBeInTheDocument();
  });
});
