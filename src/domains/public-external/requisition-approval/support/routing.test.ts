import { describe, expect, it } from 'vitest';
import { buildRequisitionApprovalPath } from '../../support';
import { matchRouteMetadata } from '../../../../lib/routing';
import { validateRequisitionApprovalSearch } from './routing';

describe('requisition approval routing', () => {
  it('builds the canonical approval route path', () => {
    expect(buildRequisitionApprovalPath({ token: 'valid-token' })).toBe('/job-requisition-approval?token=valid-token');
  });

  it('registers requisition approval route metadata', () => {
    expect(matchRouteMetadata('/job-requisition-approval')?.metadata.routeId).toBe('public-external.requisition-approval');
  });

  it('keeps the token search contract route-owned', () => {
    expect(validateRequisitionApprovalSearch({ token: 'abc-123' })).toEqual({ token: 'abc-123' });
    expect(validateRequisitionApprovalSearch({})).toEqual({ token: '' });
  });
});
