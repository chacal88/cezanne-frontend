import { matchRouteMetadata } from '../../../../lib/routing';

describe('platform taxonomy routing', () => {
  it('registers sectors and subsectors as platform taxonomy routes', () => {
    expect(matchRouteMetadata('/sectors')?.metadata).toMatchObject({
      routeId: 'sysadmin.taxonomy.sectors',
      domain: 'sysadmin',
      module: 'taxonomy',
      routeFamily: 'taxonomy',
      requiredCapability: 'canManageTaxonomy',
      implementationState: 'implemented',
    });
    expect(matchRouteMetadata('/sectors/sector-1')?.metadata).toMatchObject({
      routeId: 'sysadmin.taxonomy.sector.detail',
      parentTarget: '/sectors',
    });
    expect(matchRouteMetadata('/sectors/sector-1/subsectors')?.metadata).toMatchObject({
      routeId: 'sysadmin.taxonomy.sector.subsectors',
      parentTarget: '/sectors/$sectorId',
    });
    expect(matchRouteMetadata('/subsectors/subsector-1')?.metadata).toMatchObject({
      routeId: 'sysadmin.taxonomy.subsector.detail',
      parentTarget: '/sectors',
    });
  });
});
