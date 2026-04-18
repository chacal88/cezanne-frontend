import { beforeEach, describe, expect, it } from 'vitest';
import { buildRequisitionApprovalViewModel, serializeRequisitionApprovalDecision } from './adapters';
import { resetRequisitionApprovalResolutions, saveTerminalApprovalResolution } from './store';

describe('requisition approval adapters', () => {
  beforeEach(() => {
    resetRequisitionApprovalResolutions();
  });

  it('builds a normalized route-owned approval view model', () => {
    const view = buildRequisitionApprovalViewModel({ token: 'finance-director-valid-token' });

    expect(view.title).toContain('Finance Analyst');
    expect(view.approverName).toBe('Morgan Director');
    expect(view.access.readiness).toBe('ready');
  });

  it('keeps terminal interpretation stable after completion', () => {
    saveTerminalApprovalResolution('valid-token', 'rejected');

    const view = buildRequisitionApprovalViewModel({ token: 'valid-token' });
    expect(view.access.readiness).toBe('completed');
    expect(view.access.terminalState).toBe('rejected');
  });

  it('serializes approval decisions through a dedicated serializer', () => {
    const view = buildRequisitionApprovalViewModel({ token: 'reject-comment-token' });
    const payload = serializeRequisitionApprovalDecision({
      token: 'reject-comment-token',
      decision: 'reject',
      draft: { comment: 'Needs budget review.' },
      view,
    });

    expect(payload).toEqual({
      token: 'reject-comment-token',
      decision: 'reject',
      comment: 'Needs budget review.',
      workflowState: 'awaiting-decision',
      requisitionLabel: 'REQ-PD-101',
      approverName: 'Alex Approver',
    });
  });
});
