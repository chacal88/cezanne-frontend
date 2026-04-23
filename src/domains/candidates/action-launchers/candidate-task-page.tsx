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
  if (kind === 'schedule') return { title: 'Interview scheduler', readiness: 'Calendar readiness and slot selection stay task-local.', primary: 'next step ›' };
  if (kind === 'offer') return { title: 'Create offer', readiness: 'Contract and signing readiness stay bounded to this launcher.', primary: 'Send offer' };
  return { title: 'Reject candidate', readiness: 'Required review context is shown without inventing a reason catalog.', primary: 'Reject with message' };
}

function taskPanelTitle(kind: CandidateActionKind) {
  if (kind === 'schedule') return 'Select interview type and location';
  if (kind === 'offer') return 'Offer details';
  return 'Reject candidate';
}

function scheduleJobTitle(actionContext: ReturnType<typeof resolveCandidateActionContext>) {
  if (!actionContext.jobId) return 'API Seed Pipeline';
  return `API Seed Pipeline ${actionContext.jobId}`;
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
    <section className="candidate-product-page candidate-task-page candidate-task-modal-page" data-testid="candidate-task-composition">
      <div className="candidate-task-modal-background" aria-hidden="true">
        <p className="candidate-detail-breadcrumb">▣ My jobs &gt; Live jobs &gt; {actionContext.jobId ?? 'Candidate'}</p>
        <div className="candidate-task-background-card">
          <h1>candidate profile</h1>
          <p>{record.name}</p>
          <p>{record.stage}</p>
        </div>
      </div>

      <div className="candidate-task-modal-backdrop" role="presentation">
        <div className={`candidate-task-modal candidate-task-modal--${actionContext.kind}`} role="dialog" aria-modal="true" aria-labelledby="candidate-task-title">
          <header className="candidate-task-modal-header">
            <div>
              <p className="candidate-task-modal-eyebrow">Candidate workflow</p>
              <h1 id="candidate-task-title">{copy.title}</h1>
            </div>
            <button className="candidate-task-modal-close" type="button" onClick={() => handleClose('cancel')} data-testid="candidate-task-close-link" aria-label="Back to candidate">×</button>
            <span className="candidate-detail-hidden-state" data-testid="candidate-task-product-state">{actionProductState.kind}</span>
            <span className="candidate-detail-hidden-state" data-testid="candidate-task-kind">{actionContext.kind}</span>
          </header>

          {actionContext.kind === 'schedule' ? (
            <ol className="candidate-task-stepper" aria-label="Interview scheduler steps">
              {['Interview details', 'Choose slots', 'Invite interviewers', 'Review and send'].map((step, index) => (
                <li className={index === 0 ? 'is-active' : ''} key={step}>
                  <span>{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          ) : null}

          <div className="candidate-task-legacy-layout">
            {actionContext.kind === 'schedule' ? (
              <aside className="candidate-product-card candidate-task-candidate-card candidate-task-schedule-overview">
                <header className="candidate-task-schedule-title">
                  <h2>{scheduleJobTitle(actionContext)}</h2>
                  <span>{record.location}</span>
                </header>
                <div className="candidate-task-schedule-columns">
                  <section className="candidate-task-schedule-column">
                    <h3>Candidate details</h3>
                    <div className="candidate-task-schedule-candidate">
                      <strong>{record.name}</strong>
                      <div className="candidate-task-schedule-score">
                        <span>-</span>
                        <small>/100 - CV score</small>
                      </div>
                      <p>{record.email}</p>
                    </div>
                  </section>
                  <section className="candidate-task-schedule-column candidate-task-schedule-job">
                    <h3>Job details</h3>
                    <p><strong>Negotiable salary</strong></p>
                    <p>Job type: Permanent</p>
                    <p>Job terms: Full-time</p>
                    <p>Address: Dublin, Ireland</p>
                    <p>Sector: Accounting &amp; Finance | Other</p>
                    <p>Created at: Apr 23, 2026 1:30 PM</p>
                    <p>Published by: Alex Seeder</p>
                  </section>
                </div>
                <div className="candidate-detail-hidden-state" data-testid="candidate-task-candidate">Candidate: {actionContext.candidateId}</div>
                <div className="candidate-detail-hidden-state" data-testid="candidate-task-cv">CV: {actionContext.cvId}</div>
                <div className="candidate-detail-hidden-state" data-testid="candidate-task-parent">Parent: {actionContext.returnTarget}</div>
                <div className="candidate-detail-hidden-state" data-testid="candidate-task-recovery">Recovery: {actionContext.recoveryTarget}</div>
                <div className="candidate-detail-hidden-state" data-testid="candidate-task-entry">Entry: {actionContext.entryMode}</div>
                <div className="candidate-detail-hidden-state" data-testid="candidate-task-last-action">Last action: {record.lastAction}</div>
                <div className="candidate-detail-hidden-state" data-testid="candidate-task-capability">Capability: {actionContext.capabilityKey}</div>
              </aside>
            ) : (
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
                  <p>✉ <span>{record.email}</span></p>
                  <p>☎ <span>{record.phone}</span></p>
                  <p>◆ <span>{record.location}</span></p>
                  <p>✓ <span>{record.lastAction}</span></p>
                  <p className="candidate-detail-hidden-state" data-testid="candidate-task-candidate">Candidate: {actionContext.candidateId}</p>
                  <p className="candidate-detail-hidden-state" data-testid="candidate-task-cv">CV: {actionContext.cvId}</p>
                  <p className="candidate-detail-hidden-state" data-testid="candidate-task-parent">Parent: {actionContext.returnTarget}</p>
                  <p className="candidate-detail-hidden-state" data-testid="candidate-task-recovery">Recovery: {actionContext.recoveryTarget}</p>
                  <p className="candidate-detail-hidden-state" data-testid="candidate-task-entry">Entry: {actionContext.entryMode}</p>
                  <p className="candidate-detail-hidden-state" data-testid="candidate-task-last-action">Last action: {record.lastAction}</p>
                  <p className="candidate-detail-hidden-state" data-testid="candidate-task-capability">Capability: {actionContext.capabilityKey}</p>
                </div>
              </aside>
            )}

        <main className="candidate-product-card candidate-task-form-card" data-testid="candidate-task-action-body">
          <header className="candidate-task-form-header">
            <h2>{taskPanelTitle(actionContext.kind)}</h2>
            <p>{copy.readiness}</p>
          </header>

          {actionContext.kind === 'schedule' ? (
            <div className="candidate-task-form-grid">
              <label className="candidate-task-full">Interview type<select value="" onChange={() => undefined}><option value="">Select interview type...</option></select></label>
              <label className="candidate-task-full">Location<input readOnly value="" placeholder="Input location for the interview..." /></label>
              <fieldset className="candidate-task-radio-group">
                <legend>Group</legend>
                <label><input type="radio" readOnly /> Yes</label>
                <label><input type="radio" readOnly defaultChecked /> No</label>
              </fieldset>
              <fieldset className="candidate-task-radio-group candidate-task-full">
                <legend>Already scheduled an interview time with this candidate?</legend>
                <p>Send confirmation of the timeslot instead of an invite.</p>
                <label><input type="radio" readOnly /> Yes</label>
                <label><input type="radio" readOnly defaultChecked /> No</label>
              </fieldset>
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
            <>
              <button className="candidate-task-reject-close" type="button" onClick={() => handleClose('cancel')} aria-label="Close reject candidate">×</button>
              <ol className="candidate-task-reject-steps" aria-label="Reject candidate steps">
                <li className="is-active"><span>1</span> Add message</li>
                <li><span>2</span> Leave internal reason for rejection</li>
              </ol>
              <div className="candidate-task-message-editor">
                <h3>Send a message to the candidate</h3>
                <p>Let candidates know that they were unsuccessful at this time.</p>
                <label className="candidate-task-full">
                  <span>Select a template to load</span>
                  <select value="" onChange={() => undefined}><option value="">Change Template</option></select>
                </label>
                <div className="candidate-task-recipient-chip">Bcc: {record.name} &lt;{record.email}&gt; ×</div>
                <input readOnly placeholder="Subject" />
                <div className="candidate-task-editor-toolbar" aria-label="Message editor toolbar">
                  <span>normal</span>
                  <strong>B</strong>
                  <em>I</em>
                  <span>U</span>
                  <span>link</span>
                  <span>☰</span>
                  <button type="button">Select a file...</button>
                </div>
                <textarea readOnly aria-label="Message body" />
              </div>
            </>
          ) : null}

          <section className="candidate-task-readiness-strip candidate-detail-hidden-state" data-testid="candidate-task-readiness-panel">
            <span data-testid="candidate-schedule-task-state">Calendar: {actionContext.schedulingState?.kind ?? 'not-schedule-task'}</span>
            <span data-testid="candidate-contract-task-state">Contract: {actionContext.contractSigningState?.kind ?? 'not-contract-task'}</span>
            <span data-testid="candidate-contract-task-refresh">{actionContext.contractSigningState?.parentRefresh ? 'refresh required' : 'refresh pending action'}</span>
            <span data-testid="candidate-review-task-state">Review: {actionContext.surveyReviewScoringState?.kind ?? 'not-review-task'}</span>
            <span data-testid="candidate-review-task-return">Return: {actionContext.surveyReviewScoringState?.parentContext?.returnTarget ?? actionContext.returnTarget}</span>
          </section>

          {failure ? <p className="candidate-task-alert candidate-task-alert--danger" data-testid="candidate-task-failure">{failure}</p> : null}
          {outcome === 'succeeded' ? <p className="candidate-task-alert candidate-task-alert--success" data-testid="candidate-task-success-refresh">Success. Refreshing parent candidate hub.</p> : null}

          <footer className="candidate-task-footer">
            <button className="candidate-product-button candidate-product-button--secondary" type="button" onClick={() => handleClose('cancel')}>{actionContext.kind === 'reject' ? 'Close' : 'Cancel'}</button>
            <button className="candidate-product-button candidate-product-button--danger" type="button" onClick={handleFailure} data-testid="candidate-task-fail-link">{actionContext.kind === 'reject' ? 'Reject without message' : 'Simulate failure'}</button>
            <button className="candidate-product-button" type="button" onClick={handleComplete} disabled={blocked || terminal} data-testid="candidate-task-complete-link">{copy.primary}</button>
          </footer>
        </main>
          </div>
        </div>
      </div>
    </section>
  );
}
