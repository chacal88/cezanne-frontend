import { evaluateRequisitionApprovalAccess } from './access';
import { getRequisitionApprovalResolution } from './store';
import type { RequisitionApprovalBootstrap, RequisitionApprovalDraft, RequisitionApprovalSerializedDecision, RequisitionApprovalViewModel } from './models';

function inferTitle(token: string) {
  if (token.toLowerCase().includes('finance')) return 'Finance Analyst';
  if (token.toLowerCase().includes('engineering')) return 'Engineering Manager';
  return 'Product Designer';
}

export function buildRequisitionApprovalBootstrap(token: string): RequisitionApprovalBootstrap {
  const normalized = token.trim();
  const resolution = getRequisitionApprovalResolution(normalized);
  return {
    token: normalized,
    tokenState: normalized ? 'valid' : 'invalid',
    workflowState: resolution?.kind === 'terminal' ? resolution.terminalState : 'awaiting-decision',
    title: `Approve requisition for ${inferTitle(normalized)}`,
    summary: 'This public approval route owns token validation, workflow interpretation, approve/reject actions, and stable terminal outcomes.',
    approverName: normalized.toLowerCase().includes('director') ? 'Morgan Director' : 'Alex Approver',
    requestedBy: normalized.toLowerCase().includes('finance') ? 'Jordan Finance' : 'Taylor Recruiter',
    requisitionLabel: normalized.toLowerCase().includes('finance') ? 'REQ-FIN-204' : 'REQ-PD-101',
    requiresRejectComment: normalized.toLowerCase().includes('reject-comment'),
    canApprove: !normalized.toLowerCase().includes('reject-only'),
    canReject: !normalized.toLowerCase().includes('approve-only'),
    isAvailable: !normalized.toLowerCase().includes('locked'),
    resolution,
  };
}

export function buildRequisitionApprovalViewModel(input: { token: string }): RequisitionApprovalViewModel {
  const bootstrap = buildRequisitionApprovalBootstrap(input.token);
  const access = evaluateRequisitionApprovalAccess({
    token: bootstrap.token,
    isAvailable: bootstrap.isAvailable,
    requiresRejectComment: bootstrap.requiresRejectComment,
    canApprove: bootstrap.canApprove,
    canReject: bootstrap.canReject,
    resolution: bootstrap.resolution,
  });

  return {
    route: { token: bootstrap.token },
    access,
    title: bootstrap.title,
    summary: bootstrap.summary,
    approverName: bootstrap.approverName,
    requestedBy: bootstrap.requestedBy,
    requisitionLabel: bootstrap.requisitionLabel,
    rejectionPrompt: bootstrap.requiresRejectComment ? 'A rejection comment is required for this requisition.' : 'An optional rejection comment can clarify the decision.',
  };
}

export function serializeRequisitionApprovalDecision(input: {
  token: string;
  decision: 'approve' | 'reject';
  draft: RequisitionApprovalDraft;
  view: RequisitionApprovalViewModel;
}): RequisitionApprovalSerializedDecision {
  return {
    token: input.token,
    decision: input.decision,
    comment: input.draft.comment.trim() || undefined,
    workflowState: input.view.access.workflowState,
    requisitionLabel: input.view.requisitionLabel,
    approverName: input.view.approverName,
  };
}
