import { withCorrelationHeaders } from '../../../../lib/api-client';
import { saveTerminalApprovalResolution, saveWorkflowDriftResolution } from './store';
import { serializeRequisitionApprovalDecision } from './adapters';
import type { RequisitionApprovalDraft, RequisitionApprovalViewModel, RequisitionApprovalWorkflowResult } from './models';

function headersToRecord(headers: Headers) {
  return Object.fromEntries(headers.entries());
}

export async function runRequisitionApprovalDecision(input: {
  token: string;
  decision: 'approve' | 'reject';
  draft: RequisitionApprovalDraft;
  view: RequisitionApprovalViewModel;
}): Promise<RequisitionApprovalWorkflowResult> {
  const normalized = input.token.toLowerCase();

  if (input.decision === 'reject' && input.view.access.requiresRejectComment && !input.draft.comment.trim()) {
    return {
      status: 'failed',
      stage: 'validation',
      message: 'Add a rejection comment before rejecting this requisition.',
    };
  }

  const request = withCorrelationHeaders({ method: 'POST' });
  const requestHeaders = headersToRecord(new Headers(request.headers));

  if (normalized.includes('drift-on-submit')) {
    saveWorkflowDriftResolution(input.token, 'The requisition moved to a different workflow state before your decision was saved.');
    return {
      status: 'workflow-drift',
      message: 'The requisition moved to a different workflow state before your decision was saved.',
    };
  }

  if (normalized.includes('used-on-submit-approved')) {
    saveTerminalApprovalResolution(input.token, 'approved');
    return {
      status: 'token-state',
      tokenState: 'used',
      message: 'This requisition was already approved from another session.',
    };
  }

  if (normalized.includes('used-on-submit-rejected')) {
    saveTerminalApprovalResolution(input.token, 'rejected');
    return {
      status: 'token-state',
      tokenState: 'used',
      message: 'This requisition was already rejected from another session.',
    };
  }

  if (input.draft.comment.toLowerCase().includes('submit-fail') || normalized.includes('submit-fail')) {
    return {
      status: 'failed',
      stage: 'submission',
      message: 'The approval service could not save your decision. Try again.',
    };
  }

  const terminalState = input.decision === 'approve' ? 'approved' : 'rejected';
  saveTerminalApprovalResolution(input.token, terminalState);

  return {
    status: 'completed',
    terminalState,
    payload: serializeRequisitionApprovalDecision(input),
    requestHeaders,
  };
}
