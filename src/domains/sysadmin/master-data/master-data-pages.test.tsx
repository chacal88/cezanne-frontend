import type { ReactNode } from 'react';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../testing/render';
import { CompanySubscriptionPage, MasterDataListPage } from './master-data-pages';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');
  return {
    ...actual,
    Link: ({ to, params, children, ...props }: { to: string; params?: Record<string, string>; children: ReactNode }) => {
      const href = params ? Object.entries(params).reduce((path, [key, value]) => path.replace(`$${key}`, value), to) : to;
      return <a href={href} {...props}>{children}</a>;
    },
  };
});

const sysadminContext = {
  isAuthenticated: true,
  organizationType: 'none' as const,
  isAdmin: true,
  isSysAdmin: true,
  pivotEntitlements: [],
  subscriptionCapabilities: [],
  rolloutFlags: [],
};

describe('SysAdmin master-data pages', () => {
  it('renders deterministic master-data list state hooks', () => {
    renderWithProviders(<MasterDataListPage entity="hiring-company" search={{ fixtureState: 'denied' }} />);

    expect(screen.getByRole('heading', { name: 'Hiring company list' })).toBeVisible();
    expect(screen.getByTestId('platform-master-data-state')).toHaveTextContent('denied');
  });

  it('renders company subscription loading and refresh contract', () => {
    renderWithProviders(<CompanySubscriptionPage companyId="company-1" search={{ fixtureState: 'loading' }} />, { accessContext: sysadminContext });

    expect(screen.getByTestId('platform-master-data-state')).toHaveTextContent('loading');
    expect(screen.getByTestId('platform-company-subscription-can-mutate')).toHaveTextContent('false');
    expect(screen.getByTestId('platform-company-subscription-refresh-targets')).toHaveTextContent('company-detail,company-subscription,subscriptions-list');
  });
});
