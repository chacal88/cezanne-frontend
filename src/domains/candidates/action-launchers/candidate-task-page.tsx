import { useEffect, useMemo, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { observability } from '../../../app/observability';
import { resolveCandidateActionContext } from './candidate-action-context';
import { completeCandidateAction, getCandidateRecord } from '../support/store';
import { buildCandidateParentRefreshTarget, parseCandidateContextFromPathname, parseCandidateTaskSearchFromUrl } from '../support/routing';
import type { CandidateActionKind } from '../support/models';
import { buildContractSigningTelemetry, resolveContractSendResult, startContractSend } from '../../contracts/signing';
import { buildSurveyReviewScoringTelemetry, resolveSurveyReviewScoringSubmitResult, startSurveyReviewScoringSubmit } from '../surveys-custom-fields/support';
import { resolveCandidateActionProductState } from '../support/product-depth';
import '../candidate-composition.css';

function getActionKind(pathname: string): CandidateActionKind {
  if (pathname.endsWith('/schedule')) return 'schedule';
  if (pathname.endsWith('/offer')) return 'offer';
  return 'reject';
}

function getCvIdFromPathname(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const rejectIndex = parts.indexOf('cv-reject');
  if (rejectIndex >= 0) return parts[rejectIndex + 1];
  const cvIndex = parts.indexOf('cv');
  return parts[cvIndex + 1] ?? 'cv-missing';
}

function describeTask(kind: CandidateActionKind) {
  if (kind === 'schedule') return { title: 'Schedule interview', readiness: 'Calendar readiness and slot selection stay task-local.', primary: 'Schedule interview' };
  if (kind === 'offer') return { title: 'Create offer', readiness: 'Contract and signing readiness stay bounded to this launcher.', primary: 'Send offer' };
  return { title: 'Reject candidate', readiness: 'Required review context is shown without inventing a reason catalog.', primary: 'Reject candidate' };
}

function taskPanelTitle(kind: CandidateActionKind) {
  if (kind === 'schedule') return 'Interview details';
  if (kind === 'offer') return 'Offer details';
  return 'Reject candidate';
}


export function CandidateTaskRoutePage() {
  const location = useLocation();
  const search = parseCandidateTaskSearchFromUrl(window.location.search);
  const contextSegments = parseCandidateContextFromPathname(location.pathname);
  const kind = getActionKind(location.pathname);
  const actionContext = useMemo(
    () =>
      resolveCandidateActionContext({
        kind,
        pathname: location.pathname,
        context: contextSegments,
        cvId: getCvIdFromPathname(location.pathname),
        parent: search.parent,
        entryMode: search.entry,
      }),
    [contextSegments, kind, location.pathname, search.entry, search.parent],
  );
  const [outcome, setOutcome] = useState<'ready' | 'submitting' | 'failed' | 'succeeded' | 'cancelled'>('ready');
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    observability.telemetry.track({
      name: 'candidate_action_opened',
      data: {
        candidateId: actionContext.candidateId,
        taskType: actionContext.kind,
        parentRouteId: 'candidates.detail',
        correlationId: ensureCorrelationId(),
      },
    });
  }, [actionContext.candidateId, actionContext.kind]);

  function handleClose(outcomeKind: 'cancel' | 'success') {
    if (outcomeKind === 'cancel') {
      setOutcome('cancelled');
      observability.telemetry.track({
        name: 'taskflow_cancelled',
        data: { taskType: actionContext.kind, correlationId: ensureCorrelationId() },
      });
    }
    window.location.assign(actionContext.returnTarget);
  }

  function handleComplete() {
    setOutcome('submitting');
    setActiveCorrelationId(createCorrelationId());
    const sendingState = actionContext.contractSigningState ? startContractSend(actionContext.contractSigningState) : undefined;
    const sentState = sendingState ? resolveContractSendResult(actionContext.contractSigningState!, 'sent') : undefined;
    const submittingReviewState = actionContext.surveyReviewScoringState ? startSurveyReviewScoringSubmit(actionContext.surveyReviewScoringState) : undefined;
    const submittedReviewState = submittingReviewState ? resolveSurveyReviewScoringSubmitResult(actionContext.surveyReviewScoringState!, 'submitted') : undefined;
    completeCandidateAction(actionContext.candidateId, actionContext.kind);
    if (sentState) {
      observability.telemetry.track(buildContractSigningTelemetry({
        routeFamily: sentState.routeFamily,
        action: 'send-start',
        contractState: sendingState!.kind,
        taskContext: sentState.taskContext,
      }));
      observability.telemetry.track(buildContractSigningTelemetry({
        routeFamily: sentState.routeFamily,
        action: 'status-refresh',
        contractState: sentState.kind,
        taskContext: sentState.taskContext,
      }));
    }
    if (submittedReviewState) {
      observability.telemetry.track(buildSurveyReviewScoringTelemetry({
        routeFamily: submittedReviewState.routeFamily,
        action: 'submit-start',
        operationalState: submittingReviewState!.kind,
        taskContext: submittedReviewState.taskContext,
      }));
      observability.telemetry.track(buildSurveyReviewScoringTelemetry({
        routeFamily: submittedReviewState.routeFamily,
        action: 'terminal-outcome',
        operationalState: submittedReviewState.kind,
        taskContext: submittedReviewState.taskContext,
        terminalOutcome: submittedReviewState.terminalOutcome,
      }));
    }
    observability.telemetry.track({
      name: 'candidate_action_succeeded',
      data: {
        candidateId: actionContext.candidateId,
        taskType: actionContext.kind,
        correlationId: ensureCorrelationId(),
      },
    });
    observability.telemetry.track({
      name: 'taskflow_succeeded',
      data: { taskType: actionContext.kind, correlationId: ensureCorrelationId() },
    });
    setOutcome('succeeded');
    window.location.assign(buildCandidateParentRefreshTarget(actionContext.returnTarget));
  }

  function handleFailure() {
    setOutcome('failed');
    setFailure('The task could not complete. Recovery stays on the candidate hub.');
    observability.telemetry.track({
      name: 'candidate_action_failed',
      data: {
        candidateId: actionContext.candidateId,
        taskType: actionContext.kind,
        failureKind: 'simulated',
        correlationId: ensureCorrelationId(),
      },
    });
  }

  const record = getCandidateRecord(actionContext.candidateId);
  const terminal = record.stage === 'rejected' && actionContext.kind !== 'reject';
  const blocked = Boolean(actionContext.readinessGate && !actionContext.readinessGate.canProceed);
  const actionProductState = resolveCandidateActionProductState({
    kind: actionContext.kind,
    blocked,
    submitting: outcome === 'submitting',
    succeeded: outcome === 'succeeded',
    retryable: outcome === 'failed',
    terminal,
    parentRefresh: outcome === 'succeeded',
  });
  const copy = describeTask(actionContext.kind);

  return (
    <section className="candidate-product-page candidate-task-page" data-testid="candidate-task-composition">
      <p className="candidate-detail-breadcrumb">▣ My jobs &gt; Live jobs &gt; {actionContext.jobId ?? 'Candidate'} &gt; {copy.title}</p>

      <div className="candidate-detail-titlebar">
        <h1>{copy.title}</h1>
        <div className="candidate-detail-legacy-controls">
          <button className="candidate-product-link candidate-product-link--secondary" type="button" onClick={() => handleClose('cancel')} data-testid="candidate-task-close-link">← Back to candidate</button>
          <span className="candidate-detail-count-badge" data-testid="candidate-task-product-state">{actionProductState.kind}</span>
          <span className="candidate-detail-hidden-state" data-testid="candidate-task-kind">{actionContext.kind}</span>
        </div>
      </div>

      <div className="candidate-task-legacy-layout">
        <aside className="candidate-product-card candidate-profile-card candidate-task-candidate-card">
          <div className="candidate-profile-header">
            <div className="candidate-profile-name-row">
              <h2>{record.name}</h2>
              <span className="candidate-product-chip">✉</span>
            </div>
            <p className="candidate-product-muted">{record.headline}</p>
            <span className="candidate-product-chip">{record.stage}</span>
          </div>
          <div className="candidate-profile-meta">
            <p data-testid="candidate-task-candidate">◉ Candidate: {actionContext.candidateId}</p>
            <p data-testid="candidate-task-cv">▣ CV: {actionContext.cvId}</p>
            <p data-testid="candidate-task-parent">↩ Parent: {actionContext.returnTarget}</p>
            <p data-testid="candidate-task-recovery">↻ Recovery: {actionContext.recoveryTarget}</p>
            <p data-testid="candidate-task-entry">★ Entry: {actionContext.entryMode}</p>
            <p data-testid="candidate-task-last-action">✓ Last action: {record.lastAction}</p>
            <p data-testid="candidate-task-capability">⚿ Capability: {actionContext.capabilityKey}</p>
          </div>
        </aside>

        <main className="candidate-product-card candidate-task-form-card" data-testid="candidate-task-action-body">
          <header className="candidate-task-form-header">
            <h2>{taskPanelTitle(actionContext.kind)}</h2>
            <p>{copy.readiness}</p>
          </header>

          {actionContext.kind === 'schedule' ? (
            <div className="candidate-task-form-grid">
              <label>Interview type<input readOnly value="Phone Interview" /></label>
              <label>Date<input readOnly value="21 Apr 2026" /></label>
              <label>Time<input readOnly value="10:00" /></label>
              <label>Interviewer<input readOnly value="Sam Warner" /></label>
              <label className="candidate-task-full">Location / link<input readOnly value="Calendar readiness controls final provider slot details" /></label>
            </div>
          ) : null}

          {actionContext.kind === 'offer' ? (
            <div className="candidate-task-form-grid">
              <label>Offer template<input readOnly value="Default offer template" /></label>
              <label>Contract state<input readOnly value={actionContext.contractSigningState?.kind ?? 'ready'} /></label>
              <label className="candidate-task-full">Message<textarea readOnly value="Offer payload fields remain backend-owned." /></label>
            </div>
          ) : null}

          {actionContext.kind === 'reject' ? (
            <div className="candidate-task-form-grid">
              <label>Reason<select value="not-suitable" onChange={() => undefined}><option value="not-suitable">Not suitable for this role</option></select></label>
              <label>Review outcome<input readOnly value={actionContext.surveyReviewScoringState?.kind ?? 'ready'} /></label>
              <label className="candidate-task-full">Internal note<textarea readOnly value="Reject reason catalog remains backend-owned." /></label>
            </div>
          ) : null}

          <section className="candidate-task-readiness-strip" data-testid="candidate-task-readiness-panel">
            <span data-testid="candidate-schedule-task-state">Calendar: {actionContext.schedulingState?.kind ?? 'not-schedule-task'}</span>
            <span data-testid="candidate-contract-task-state">Contract: {actionContext.contractSigningState?.kind ?? 'not-contract-task'}</span>
            <span data-testid="candidate-contract-task-refresh">{actionContext.contractSigningState?.parentRefresh ? 'refresh required' : 'refresh pending action'}</span>
            <span data-testid="candidate-review-task-state">Review: {actionContext.surveyReviewScoringState?.kind ?? 'not-review-task'}</span>
            <span data-testid="candidate-review-task-return">Return: {actionContext.surveyReviewScoringState?.parentContext?.returnTarget ?? actionContext.returnTarget}</span>
          </section>

          {failure ? <p className="candidate-task-alert candidate-task-alert--danger" data-testid="candidate-task-failure">{failure}</p> : null}
          {outcome === 'succeeded' ? <p className="candidate-task-alert candidate-task-alert--success" data-testid="candidate-task-success-refresh">Success. Refreshing parent candidate hub.</p> : null}

          <footer className="candidate-task-footer">
            <button className="candidate-product-button candidate-product-button--secondary" type="button" onClick={() => handleClose('cancel')}>Cancel</button>
            <button className="candidate-product-button candidate-product-button--danger" type="button" onClick={handleFailure} data-testid="candidate-task-fail-link">Simulate failure</button>
            <button className="candidate-product-button" type="button" onClick={handleComplete} disabled={blocked || terminal} data-testid="candidate-task-complete-link">{copy.primary}</button>
          </footer>
        </main>
      </div>
    </section>
  );
}
