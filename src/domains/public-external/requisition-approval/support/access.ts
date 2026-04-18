import { interpretPublicTokenState } from '../../support';
import type { ApprovalWorkflowState, RequisitionApprovalAccess, RequisitionApprovalResolution } from './models';

function inferWorkflowState(token: string, resolution: RequisitionApprovalResolution): ApprovalWorkflowState {
  if (resolution?.kind === 'terminal') return resolution.terminalState;
  const normalized = token.toLowerCase();
  if (normalized.includes('used-approved')) return 'approved';
  if (normalized.includes('used-rejected')) return 'rejected';
  if (normalized.includes('inactive')) return 'inactive';
  return 'awaiting-decision';
}

export function evaluateRequisitionApprovalAccess(input: {
  token: string;
  isAvailable: boolean;
  requiresRejectComment: boolean;
  canApprove: boolean;
  canReject: boolean;
  resolution: RequisitionApprovalResolution;
}): RequisitionApprovalAccess {
  const normalizedToken = input.token.trim() || 'invalid-missing-token';
  const tokenState = interpretPublicTokenState(normalizedToken);
  const workflowState = inferWorkflowState(normalizedToken, input.resolution);

  if (input.resolution?.kind === 'workflow-drift' || normalizedToken.toLowerCase().includes('workflow-drift')) {
    return {
      capabilityKey: 'canApproveRequisitionByToken',
      tokenState,
      workflowState,
      readiness: 'workflow-drift',
      canApprove: false,
      canReject: false,
      requiresRejectComment: input.requiresRejectComment,
      reason: input.resolution?.kind === 'workflow-drift' ? input.resolution.reason : 'The requisition workflow changed before this approval could be completed.',
    };
  }

  if (input.resolution?.kind === 'terminal' || (tokenState === 'used' && (workflowState === 'approved' || workflowState === 'rejected'))) {
    return {
      capabilityKey: 'canApproveRequisitionByToken',
      tokenState: 'used',
      workflowState,
      readiness: 'completed',
      canApprove: false,
      canReject: false,
      requiresRejectComment: input.requiresRejectComment,
      reason: workflowState === 'approved' ? 'This requisition was already approved.' : 'This requisition was already rejected.',
      terminalState: workflowState === 'approved' ? 'approved' : 'rejected',
    };
  }

  if (tokenState !== 'valid') {
    return {
      capabilityKey: 'canApproveRequisitionByToken',
      tokenState,
      workflowState,
      readiness: 'token-state',
      canApprove: false,
      canReject: false,
      requiresRejectComment: input.requiresRejectComment,
      reason: tokenState,
    };
  }

  if (!input.isAvailable || workflowState !== 'awaiting-decision' || (!input.canApprove && !input.canReject)) {
    return {
      capabilityKey: 'canApproveRequisitionByToken',
      tokenState,
      workflowState,
      readiness: 'unavailable',
      canApprove: false,
      canReject: false,
      requiresRejectComment: input.requiresRejectComment,
      reason: 'Approval is not actionable for the current workflow state.',
    };
  }

  return {
    capabilityKey: 'canApproveRequisitionByToken',
    tokenState,
    workflowState,
    readiness: 'ready',
    canApprove: input.canApprove,
    canReject: input.canReject,
    requiresRejectComment: input.requiresRejectComment,
  };
}
