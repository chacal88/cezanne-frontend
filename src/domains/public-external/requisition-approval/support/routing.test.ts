import { describe, expect, it } from 'vitest';
import { buildRequisitionApprovalPath } from '../../support';
import { matchRouteMetadata } from '../../../../lib/routing';
import { validateRequisitionFormsDownloadSearch } from './forms-download';
import { validateRequisitionApprovalSearch } from './routing';

describe('requisition approval routing', () => {
  it('builds the canonical approval route path', () => {
    expect(buildRequisitionApprovalPath({ token: 'valid-token' })).toBe('/job-requisition-approval?token=valid-token');
  });

  it('registers requisition approval route metadata', () => {
    expect(matchRouteMetadata('/job-requisition-approval')?.metadata.routeId).toBe('public-external.requisition-approval');
  });


  it('registers requisition forms download as a separate public token route', () => {
    const match = matchRouteMetadata('/job-requisition-forms/form-123');

    expect(match?.pattern).toBe('/job-requisition-forms/$formId');
    expect(match?.metadata).toMatchObject({
      routeId: 'public-external.requisition-forms.download',
      domain: 'public-external',
      module: 'requisition-forms-download',
      requiredCapability: 'canDownloadRequisitionFormsByToken',
      implementationState: 'implemented',
    });
    expect(match?.params).toEqual({ formId: 'form-123' });
  });

  it('keeps forms download search parsing separate from approval token parsing', () => {
    expect(validateRequisitionFormsDownloadSearch({ token: 'abc-123', download: '' })).toEqual({ token: 'abc-123', download: true });
    expect(validateRequisitionFormsDownloadSearch({ token: 'abc-123', download: 'false' })).toEqual({ token: 'abc-123', download: false });
  });

  it('keeps the token search contract route-owned', () => {
    expect(validateRequisitionApprovalSearch({ token: 'abc-123' })).toEqual({ token: 'abc-123' });
    expect(validateRequisitionApprovalSearch({})).toEqual({ token: '' });
  });

  it('keeps public requisition routes separate from authenticated HRIS operational state', () => {
    expect(matchRouteMetadata('/job-requisition-approval')?.metadata).toMatchObject({
      routeId: 'public-external.requisition-approval',
      routeClass: 'Public/Token',
      domain: 'public-external',
      module: 'requisition-approval',
    });
    expect(matchRouteMetadata('/job-requisition-forms/form-123')?.metadata).toMatchObject({
      routeId: 'public-external.requisition-forms.download',
      routeClass: 'Public/Token',
      domain: 'public-external',
      module: 'requisition-forms-download',
    });
    expect(matchRouteMetadata('/job-requisition-approval')?.metadata).not.toHaveProperty('parentTarget', '/integrations');
    expect(matchRouteMetadata('/job-requisition-forms/form-123')?.metadata).not.toHaveProperty('requiredCapability', 'canManageIntegrationProvider');
  });

});
