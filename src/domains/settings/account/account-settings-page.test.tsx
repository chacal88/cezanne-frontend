import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AccessProvider, type AccessContext } from '../../../lib/access-control';
import { AccountSettingsPage } from './account-settings-page';
import type { AccountSettingsRouteKind, AccountSettingsStateKind } from './support/account-settings-state';

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

  it('exposes deterministic V0 profile fixture states and close targets', () => {
    const routes: Array<{ routeKind: AccountSettingsRouteKind; titleKey: string; descriptionKey: string; accessContext: AccessContext; parentLabel: string }> = [
      { routeKind: 'user-profile', titleKey: 'userProfile.title', descriptionKey: 'userProfile.detail', accessContext: buildAccessContext(), parentLabel: 'user-profile-parent-link' },
      { routeKind: 'hiring-company-profile', titleKey: 'organizationProfile.hiringCompany.title', descriptionKey: 'organizationProfile.hiringCompany.detail', accessContext: buildAccessContext(), parentLabel: 'hiring-company-profile-parent-link' },
      { routeKind: 'recruitment-agency-profile', titleKey: 'organizationProfile.recruitmentAgency.title', descriptionKey: 'organizationProfile.recruitmentAgency.detail', accessContext: buildAccessContext({ organizationType: 'ra' }), parentLabel: 'recruitment-agency-profile-parent-link' },
    ];
    const states: AccountSettingsStateKind[] = ['dirty', 'saving', 'saved', 'save-failed', 'retry', 'degraded', 'denied'];

    for (const route of routes) {
      for (const state of states) {
        render(
          <AccessProvider value={route.accessContext}>
            <AccountSettingsPage routeKind={route.routeKind} titleKey={route.titleKey} descriptionKey={route.descriptionKey} fixtureState={state} parentTarget={route.routeKind === 'user-profile' ? '/dashboard' : undefined} isOverlay={route.routeKind === 'user-profile'} />
          </AccessProvider>,
        );

        expect(screen.getByTestId(`${route.routeKind}-state`)).toHaveTextContent(state);
        expect(screen.getByTestId(route.parentLabel)).toHaveAttribute('href', '/dashboard');
        cleanup();
      }
    }
  });
});
