import { matchRouteMetadata } from '../../../../lib/routing';

describe('platform master-data routing', () => {
  it('registers companies agencies and subscriptions route metadata', () => {
    expect(matchRouteMetadata('/hiring-companies')?.metadata).toMatchObject({
      routeId: 'sysadmin.master-data.hiring-companies',
      module: 'companies',
      routeFamily: 'master-data',
      requiredCapability: 'canManageHiringCompanies',
      implementationState: 'implemented',
    });

    expect(matchRouteMetadata('/hiring-companies/company-1')?.metadata).toMatchObject({
      routeId: 'sysadmin.master-data.hiring-company.detail',
      parentTarget: '/hiring-companies',
      requiredCapability: 'canManageHiringCompanies',
    });

    expect(matchRouteMetadata('/hiring-companies/edit/company-1')?.metadata).toMatchObject({
      routeId: 'sysadmin.master-data.hiring-company.edit',
      parentTarget: '/hiring-companies/$companyId',
      requiredCapability: 'canManageHiringCompanies',
    });

    expect(matchRouteMetadata('/recruitment-agencies')?.metadata).toMatchObject({
      routeId: 'sysadmin.master-data.recruitment-agencies',
      module: 'agencies',
      requiredCapability: 'canManageRecruitmentAgencies',
    });

    expect(matchRouteMetadata('/subscriptions/subscription-1')?.metadata).toMatchObject({
      routeId: 'sysadmin.master-data.subscription.detail',
      module: 'subscriptions',
      parentTarget: '/subscriptions',
      requiredCapability: 'canManagePlatformSubscriptions',
    });
  });

  it('keeps company subscription route under company ownership with subscription mutation capability', () => {
    expect(matchRouteMetadata('/hiring-company/company-1/subscription')?.metadata).toMatchObject({
      routeId: 'sysadmin.master-data.hiring-company.subscription',
      domain: 'sysadmin',
      module: 'companies',
      parentTarget: '/hiring-companies/$companyId',
      requiredCapability: 'canManageHiringCompanies',
      mutationCapability: 'canManagePlatformSubscriptions',
      implementationState: 'implemented',
    });
  });
});
