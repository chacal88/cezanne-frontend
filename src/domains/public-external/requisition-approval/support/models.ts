import type { PublicTokenState } from '../../support';

export type ApprovalDecisionKind = 'approve' | 'reject';
export type ApprovalTerminalState = 'approved' | 'rejected';
export type ApprovalWorkflowState = 'awaiting-decision' | 'approved' | 'rejected' | 'inactive';
export type ApproverReadiness = 'ready' | 'token-state' | 'completed' | 'workflow-drift' | 'unavailable' | 'recoverable-error';

export type RequisitionApprovalAccess = {
  capabilityKey: 'canApproveRequisitionByToken';
  tokenState: PublicTokenState;
  workflowState: ApprovalWorkflowState;
  readiness: ApproverReadiness;
  canApprove: boolean;
  canReject: boolean;
  requiresRejectComment: boolean;
  reason?: string;
  terminalState?: ApprovalTerminalState;
};

export type RequisitionApprovalResolution =
  | { kind: 'terminal'; terminalState: ApprovalTerminalState }
  | { kind: 'workflow-drift'; reason: string }
  | null;

export type RequisitionApprovalBootstrap = {
  token: string;
  tokenState: PublicTokenState;
  workflowState: ApprovalWorkflowState;
  title: string;
  summary: string;
  approverName: string;
  requestedBy: string;
  requisitionLabel: string;
  requiresRejectComment: boolean;
  canApprove: boolean;
  canReject: boolean;
  isAvailable: boolean;
  resolution: RequisitionApprovalResolution;
};

export type RequisitionApprovalViewModel = {
  route: {
    token: string;
  };
  access: RequisitionApprovalAccess;
  title: string;
  summary: string;
  approverName: string;
  requestedBy: string;
  requisitionLabel: string;
  rejectionPrompt: string;
};

export type RequisitionApprovalDraft = {
  comment: string;
};

export type RequisitionApprovalSerializedDecision = {
  token: string;
  decision: ApprovalDecisionKind;
  comment?: string;
  workflowState: ApprovalWorkflowState;
  requisitionLabel: string;
  approverName: string;
};

export type RequisitionApprovalWorkflowResult =
  | {
      status: 'completed';
      terminalState: ApprovalTerminalState;
      payload: RequisitionApprovalSerializedDecision;
      requestHeaders: Record<string, string>;
    }
  | {
      status: 'failed';
      stage: 'validation' | 'submission';
      message: string;
    }
  | {
      status: 'workflow-drift';
      message: string;
    }
  | {
      status: 'token-state';
      tokenState: PublicTokenState;
      message: string;
    };
