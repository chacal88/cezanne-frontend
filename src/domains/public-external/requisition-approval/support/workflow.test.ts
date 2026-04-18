import { beforeEach, describe, expect, it } from 'vitest';
import { resetCorrelationId, setActiveCorrelationId } from '../../../../lib/observability';
import { buildRequisitionApprovalViewModel } from './adapters';
import { resetRequisitionApprovalResolutions } from './store';
import { runRequisitionApprovalDecision } from './workflow';

describe('requisition approval workflow', () => {
  beforeEach(() => {
    resetCorrelationId();
    resetRequisitionApprovalResolutions();
  });

  it('serializes successful approval decisions and reuses hardened request headers', async () => {
    setActiveCorrelationId('corr_test_approval');
    const view = buildRequisitionApprovalViewModel({ token: 'valid-token' });

    const result = await runRequisitionApprovalDecision({
      token: 'valid-token',
      decision: 'approve',
      draft: { comment: '' },
      view,
    });

    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.payload.decision).toBe('approve');
    expect(result.requestHeaders['x-correlation-id']).toBe('corr_test_approval');
    expect(result.requestHeaders['x-requested-with']).toBe('XMLHttpRequest');
  });

  it('keeps reject validation recoverable inside the same route', async () => {
    const view = buildRequisitionApprovalViewModel({ token: 'reject-comment-token' });

    const result = await runRequisitionApprovalDecision({
      token: 'reject-comment-token',
      decision: 'reject',
      draft: { comment: '' },
      view,
    });

    expect(result).toEqual({
      status: 'failed',
      stage: 'validation',
      message: 'Add a rejection comment before rejecting this requisition.',
    });
  });

  it('resolves workflow drift explicitly instead of returning a generic failure', async () => {
    const view = buildRequisitionApprovalViewModel({ token: 'drift-on-submit-token' });

    const result = await runRequisitionApprovalDecision({
      token: 'drift-on-submit-token',
      decision: 'approve',
      draft: { comment: '' },
      view,
    });

    expect(result).toEqual({
      status: 'workflow-drift',
      message: 'The requisition moved to a different workflow state before your decision was saved.',
    });
  });

  it('maps concurrent consumption to a used token-state outcome', async () => {
    const view = buildRequisitionApprovalViewModel({ token: 'used-on-submit-approved-token' });

    const result = await runRequisitionApprovalDecision({
      token: 'used-on-submit-approved-token',
      decision: 'approve',
      draft: { comment: '' },
      view,
    });

    expect(result).toEqual({
      status: 'token-state',
      tokenState: 'used',
      message: 'This requisition was already approved from another session.',
    });
  });
});
