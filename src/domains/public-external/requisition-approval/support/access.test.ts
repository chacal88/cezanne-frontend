import { describe, expect, it } from 'vitest';
import { evaluateRequisitionApprovalAccess } from './access';

describe('requisition approval access', () => {
  it('grants ready access without recruiter-shell capability reuse', () => {
    const access = evaluateRequisitionApprovalAccess({
      token: 'valid-token',
      isAvailable: true,
      requiresRejectComment: false,
      canApprove: true,
      canReject: true,
      resolution: null,
    });

    expect(access.capabilityKey).toBe('canApproveRequisitionByToken');
    expect(access.readiness).toBe('ready');
    expect(access.canApprove).toBe(true);
    expect(access.canReject).toBe(true);
  });

  it('maps used approvals to stable terminal outcomes', () => {
    const access = evaluateRequisitionApprovalAccess({
      token: 'used-approved-token',
      isAvailable: true,
      requiresRejectComment: false,
      canApprove: true,
      canReject: true,
      resolution: { kind: 'terminal', terminalState: 'approved' },
    });

    expect(access.readiness).toBe('completed');
    expect(access.terminalState).toBe('approved');
    expect(access.tokenState).toBe('used');
  });

  it('surfaces workflow drift separately from generic failure', () => {
    const access = evaluateRequisitionApprovalAccess({
      token: 'valid-token',
      isAvailable: true,
      requiresRejectComment: false,
      canApprove: true,
      canReject: true,
      resolution: { kind: 'workflow-drift', reason: 'Workflow changed.' },
    });

    expect(access.readiness).toBe('workflow-drift');
    expect(access.reason).toBe('Workflow changed.');
    expect(access.canApprove).toBe(false);
  });
});
