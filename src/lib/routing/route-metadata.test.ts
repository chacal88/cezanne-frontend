import { describe, expect, it } from 'vitest';
import { getRouteMetadata, matchRouteMetadata, routeMetadataRegistry } from './route-metadata';
import { registeredRoutePaths } from './route-contracts';

describe('route metadata registry', () => {
  it('covers every registered route path', () => {
    for (const path of registeredRoutePaths) {
      expect(routeMetadataRegistry[path], path).toBeDefined();
    }
  });

  it('registers API endpoints as a settings-owned route', () => {
    expect(getRouteMetadata('/settings/api-endpoints')).toMatchObject({
      routeId: 'settings.api-endpoints',
      domain: 'settings',
      module: 'api-endpoints',
      requiredCapability: 'canManageApiEndpoints',
      fallbackTarget: '/dashboard',
      implementationState: 'implemented',
    });
  });


  it('registers requisition forms download separately from approval', () => {
    expect(matchRouteMetadata('/job-requisition-forms/form-123')).toMatchObject({
      pattern: '/job-requisition-forms/$formId',
      params: { formId: 'form-123' },
      metadata: expect.objectContaining({
        routeId: 'public-external.requisition-forms.download',
        routeClass: 'Public/Token',
        domain: 'public-external',
        module: 'requisition-forms-download',
        requiredCapability: 'canDownloadRequisitionFormsByToken',
      }),
    });
  });

  it('registers parameters compatibility paths as resolver routes', () => {
    expect(matchRouteMetadata('/parameters/company-1/settings/api-endpoints')).toMatchObject({
      pattern: '/parameters/$settingsId/$section/$subsection',
      params: { settingsId: 'company-1', section: 'settings', subsection: 'api-endpoints' },
      metadata: expect.objectContaining({
        routeId: 'settings.operational.compat',
        domain: 'settings',
        module: 'settings-container',
        requiredCapability: 'canEnterSettings',
      }),
    });
  });
});
