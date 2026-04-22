import {
  buildCompanySubscriptionState,
  buildCompanySubscriptionFixtureOptions,
  buildMasterDataDetailState,
  buildMasterDataEditState,
  buildMasterDataListState,
  parseCompanySubscriptionStateKind,
  parseMasterDataDetailStateKind,
  parseMasterDataEditStateKind,
  parseMasterDataListStateKind,
} from './master-data-state';

describe('platform master-data state', () => {
  it('models list empty and ready states with dashboard fallback', () => {
    expect(buildMasterDataListState('hiring-company', 0)).toMatchObject({
      entity: 'hiring-company',
      kind: 'empty',
      parentTarget: '/dashboard',
      fallbackTarget: '/dashboard',
    });

    expect(buildMasterDataListState('subscription', 2)).toMatchObject({ entity: 'subscription', kind: 'ready', count: 2 });
  });

  it('models detail stale state with stable parent target', () => {
    expect(buildMasterDataDetailState('recruitment-agency', 'agency-1', 'stale')).toMatchObject({
      entity: 'recruitment-agency',
      id: 'agency-1',
      kind: 'stale',
      parentTarget: '/recruitment-agencies',
    });
  });

  it('models edit success and cancel targets back to detail', () => {
    expect(buildMasterDataEditState('hiring-company', 'company-1', 'success')).toMatchObject({
      parentTarget: '/hiring-companies/company-1',
      successTarget: '/hiring-companies/company-1',
      cancelTarget: '/hiring-companies/company-1',
    });
  });

  it('keeps company subscription route ownership separate from mutation capability', () => {
    expect(buildCompanySubscriptionState('company-1', { mutationAllowed: false })).toMatchObject({
      kind: 'mutation-blocked',
      parentTarget: '/hiring-companies/company-1',
      routeCapability: 'canManageHiringCompanies',
      mutationCapability: 'canManagePlatformSubscriptions',
      canMutateSubscription: false,
      blockedReason: 'missing-platform-subscription-capability',
      refreshTargets: ['company-detail', 'company-subscription', 'subscriptions-list'],
    });
  });

  it('parses master-data and company-subscription fixture states', () => {
    expect(parseMasterDataListStateKind('loading')).toBe('loading');
    expect(parseMasterDataDetailStateKind('not-found')).toBe('not-found');
    expect(parseMasterDataEditStateKind('cancelled')).toBe('cancelled');
    expect(parseCompanySubscriptionStateKind('mutation-error')).toBe('mutation-error');
    expect(buildCompanySubscriptionFixtureOptions('stale')).toEqual({ stale: true });
  });
});
