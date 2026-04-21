import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AccessProvider, type AccessContext } from '../../../lib/access-control';
import { AccountSettingsPage } from './account-settings-page';

function buildAccessContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    isAuthenticated: true,
    organizationType: 'hc',
    isAdmin: true,
    isSysAdmin: false,
    pivotEntitlements: [],
    subscriptionCapabilities: [],
    rolloutFlags: [],
    ...overrides,
  };
}

describe('AccountSettingsPage', () => {
  it('renders a state-aware hiring company profile and save refresh intent', () => {
    render(
      <AccessProvider value={buildAccessContext()}>
        <AccountSettingsPage routeKind="hiring-company-profile" titleKey="organizationProfile.hiringCompany.title" descriptionKey="organizationProfile.hiringCompany.detail" />
      </AccessProvider>,
    );

    expect(screen.getByTestId('hiring-company-profile-state')).toHaveTextContent('ready');
    fireEvent.change(screen.getByTestId('hiring-company-profile-organization-name'), { target: { value: 'Updated Company' } });
    expect(screen.getByTestId('hiring-company-profile-state')).toHaveTextContent('dirty');
    fireEvent.click(screen.getByTestId('hiring-company-profile-save-button'));
    expect(screen.getByTestId('hiring-company-profile-state')).toHaveTextContent('saved');
    expect(screen.getByTestId('hiring-company-profile-refresh-intent')).toBeInTheDocument();
  });

  it('denies direct entry when org ownership does not match', () => {
    render(
      <AccessProvider value={buildAccessContext({ organizationType: 'ra', isAdmin: true })}>
        <AccountSettingsPage routeKind="hiring-company-profile" titleKey="organizationProfile.hiringCompany.title" descriptionKey="organizationProfile.hiringCompany.detail" />
      </AccessProvider>,
    );

    expect(screen.getByTestId('hiring-company-profile-state')).toHaveTextContent('denied');
  });

  it('exposes unknown fields and parent return for degraded direct entry handling', () => {
    render(
      <AccessProvider value={buildAccessContext()}>
        <AccountSettingsPage routeKind="company-settings" titleKey="accountSettings.company.title" descriptionKey="accountSettings.company.detail" />
      </AccessProvider>,
    );

    expect(screen.getByTestId('company-settings-parent-link')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByTestId('company-settings-unknown-fields')).toHaveTextContent('profile-persistence-api');
  });
});
