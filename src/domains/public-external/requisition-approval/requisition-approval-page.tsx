import { useEffect, useMemo, useState } from 'react';
import { observability } from '../../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { PublicTokenStatePanel } from '../token-state/public-token-state-panel';
import { buildRequisitionApprovalViewModel, runRequisitionApprovalDecision, type ApprovalDecisionKind } from './support';

function TerminalOutcome({ state, reason }: { state: 'approved' | 'rejected'; reason?: string }) {
  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>{state === 'approved' ? 'Requisition approved' : 'Requisition rejected'}</h1>
      <p data-testid="requisition-approval-terminal-state">{state}</p>
      {reason ? <p data-testid="requisition-approval-terminal-reason">{reason}</p> : null}
    </section>
  );
}

function WorkflowDriftPanel({ reason }: { reason: string }) {
  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
      <h1>Approval no longer actionable</h1>
      <p data-testid="requisition-approval-workflow-drift">workflow-drift</p>
      <p>{reason}</p>
    </section>
  );
}

export function RequisitionApprovalPage({ token }: { token: string }) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [payloadPreview, setPayloadPreview] = useState('');
  const view = useMemo(() => buildRequisitionApprovalViewModel({ token }), [token]);

  useEffect(() => {
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'requisition_approval_opened',
      data: {
        tokenState: view.access.tokenState,
        workflowState: view.access.workflowState,
        readiness: view.access.readiness,
        correlationId: ensureCorrelationId(),
      },
    });
  }, [view.access.readiness, view.access.tokenState, view.access.workflowState]);

  async function handleDecision(decision: ApprovalDecisionKind) {
    setError(null);
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'requisition_approval_submit_started',
      data: { decision, correlationId: ensureCorrelationId() },
    });

    const result = await runRequisitionApprovalDecision({
      token,
      decision,
      draft: { comment },
      view,
    });

    if (result.status === 'failed') {
      setError(result.message);
      observability.telemetry.track({
        name: 'requisition_approval_submit_failed',
        data: { decision, stage: result.stage, correlationId: ensureCorrelationId() },
      });
      return;
    }

    if (result.status === 'workflow-drift') {
      observability.telemetry.track({
        name: 'requisition_approval_workflow_drift',
        data: { decision, correlationId: ensureCorrelationId() },
      });
      window.location.reload();
      return;
    }

    if (result.status === 'token-state') {
      observability.telemetry.track({
        name: 'requisition_approval_token_state_resolved',
        data: { decision, tokenState: result.tokenState, correlationId: ensureCorrelationId() },
      });
      window.location.reload();
      return;
    }

    setPayloadPreview(JSON.stringify(result.payload, null, 2));
    observability.telemetry.track({
      name: 'requisition_approval_submit_completed',
      data: { decision, terminalState: result.terminalState, correlationId: ensureCorrelationId() },
    });
    window.location.reload();
  }

  if (view.access.readiness === 'completed' && view.access.terminalState) {
    return <TerminalOutcome state={view.access.terminalState} reason={view.access.reason} />;
  }

  if (view.access.readiness === 'workflow-drift') {
    return <WorkflowDriftPanel reason={view.access.reason ?? 'The workflow changed before this route could continue.'} />;
  }

  if (view.access.readiness === 'token-state') {
    return <PublicTokenStatePanel family="requisition-approval" tokenState={view.access.tokenState} reason={view.access.reason} />;
  }

  if (view.access.readiness === 'unavailable') {
    return <WorkflowDriftPanel reason={view.access.reason ?? 'Approval is not actionable for the current workflow state.'} />;
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>Requisition approval</h1>
      <p data-testid="requisition-approval-title">{view.title}</p>
      <p data-testid="requisition-approval-summary">{view.summary}</p>
      <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: 8 }}>
        <dt>Approver</dt>
        <dd data-testid="requisition-approval-approver">{view.approverName}</dd>
        <dt>Requested by</dt>
        <dd data-testid="requisition-approval-requested-by">{view.requestedBy}</dd>
        <dt>Requisition</dt>
        <dd data-testid="requisition-approval-requisition">{view.requisitionLabel}</dd>
        <dt>Workflow state</dt>
        <dd data-testid="requisition-approval-workflow-state">{view.access.workflowState}</dd>
      </dl>
      <label>
        Reject comment
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} data-testid="requisition-approval-comment" />
      </label>
      <p data-testid="requisition-approval-rejection-prompt">{view.rejectionPrompt}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="button" onClick={() => handleDecision('approve')} disabled={!view.access.canApprove} data-testid="requisition-approval-approve-button">
          Approve requisition
        </button>
        <button type="button" onClick={() => handleDecision('reject')} disabled={!view.access.canReject} data-testid="requisition-approval-reject-button">
          Reject requisition
        </button>
      </div>
      {error ? <p data-testid="requisition-approval-error">{error}</p> : null}
      {payloadPreview ? <pre data-testid="requisition-approval-payload-preview">{payloadPreview}</pre> : null}
    </section>
  );
}
