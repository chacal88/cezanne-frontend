import { useEffect, useState } from 'react';
import { observability } from '../../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildReviewCandidateViewModel, runReviewCandidateWorkflow, type ExternalReviewDraft } from '../support';
import { buildSurveyReviewScoringTelemetry, resolveSurveyReviewScoringSubmitResult, startSurveyReviewScoringSubmit } from '../../../domains/candidates/surveys-custom-fields/support';
import { PublicTokenStatePanel } from '../token-state/public-token-state-panel';

export function ReviewCandidatePage({ code }: { code: string }) {
  const view = buildReviewCandidateViewModel({ code });
  const [draft, setDraft] = useState<ExternalReviewDraft>(view.defaults);
  const [error, setError] = useState<string | null>(null);
  const [completion, setCompletion] = useState(view.completion);

  useEffect(() => {
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'external_review_candidate_opened',
      data: { tokenState: view.decision.tokenState, operationalState: view.operationalState.kind, correlationId: ensureCorrelationId() },
    });
    observability.telemetry.track({
      name: 'external_review_candidate_bootstrapped',
      data: { readiness: view.decision.readiness, correlationId: ensureCorrelationId() },
    });
    observability.telemetry.track({
      name: 'external_review_candidate_token_state_resolved',
      data: { tokenState: view.decision.tokenState, operationalState: view.operationalState.kind, correlationId: ensureCorrelationId() },
    });
  }, [code, view.decision.readiness, view.decision.tokenState]);

  async function handleSubmit() {
    setError(null);
    setActiveCorrelationId(createCorrelationId());
    const submittingState = startSurveyReviewScoringSubmit(view.operationalState);
    observability.telemetry.track(buildSurveyReviewScoringTelemetry({
      routeFamily: view.operationalState.routeFamily,
      action: 'submit-start',
      operationalState: submittingState.kind,
      taskContext: view.operationalState.taskContext,
      tokenState: view.operationalState.tokenState,
    }));
    observability.telemetry.track({
      name: 'external_review_candidate_submission_started',
      data: { operationalState: submittingState.kind, correlationId: ensureCorrelationId() },
    });

    const result = await runReviewCandidateWorkflow({ code }, view.participantName, draft);
    if (result.status === 'failed') {
      setError(result.message);
      const failedState = resolveSurveyReviewScoringSubmitResult(view.operationalState, 'submit-failed');
      observability.telemetry.track(buildSurveyReviewScoringTelemetry({
        routeFamily: failedState.routeFamily,
        action: 'submit-failure',
        operationalState: failedState.kind,
        taskContext: failedState.taskContext,
        tokenState: failedState.tokenState,
      }));
      observability.telemetry.track({
        name: 'external_review_candidate_submission_failed',
        data: { stage: result.stage, operationalState: failedState.kind, correlationId: ensureCorrelationId() },
      });
      return;
    }

    const completedState = resolveSurveyReviewScoringSubmitResult(view.operationalState, 'submitted');
    observability.telemetry.track(buildSurveyReviewScoringTelemetry({
      routeFamily: completedState.routeFamily,
      action: 'terminal-outcome',
      operationalState: completedState.kind,
      taskContext: completedState.taskContext,
      tokenState: completedState.tokenState,
      terminalOutcome: completedState.terminalOutcome,
    }));
    observability.telemetry.track({
      name: 'external_review_candidate_submission_completed',
      data: { outcome: result.completion.kind, operationalState: completedState.kind, correlationId: ensureCorrelationId() },
    });
    setCompletion(result.completion);
  }

  if (completion) {
    observability.telemetry.track({
      name: 'external_review_candidate_terminal_viewed',
      data: { outcome: completion.kind, operationalState: view.operationalState.kind, correlationId: ensureCorrelationId() },
    });
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
        <h1>Candidate review submitted</h1>
        <p data-testid="review-candidate-completion">{completion.message}</p>
        <p data-testid="review-candidate-completion-state">{view.operationalState.kind}</p>
      </section>
    );
  }

  if (!view.decision.canProceed && ['token-invalid', 'token-expired', 'inaccessible'].includes(view.operationalState.kind)) {
    return <PublicTokenStatePanel family="external-review-candidate" tokenState={view.decision.tokenState} reason={view.decision.reason} />;
  }

  if (!view.decision.canProceed || view.operationalState.kind !== 'ready') {
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
        <h1>{view.title}</h1>
        <p data-testid="external-review-candidate-operational-state">{view.operationalState.kind}</p>
        <p data-testid="external-review-candidate-operational-message">{view.operationalState.message}</p>
      </section>
    );
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>{view.title}</h1>
      <p>{view.intro}</p>
      <p data-testid="review-candidate-participant">{view.participantName}</p>
      <p data-testid="review-candidate-schema">{view.schemaVersion}</p>
      <p data-testid="review-candidate-operational-state">{view.operationalState.kind}</p>
      <label>
        Overall score
        <input value={draft.score} onChange={(event) => setDraft((current) => ({ ...current, score: event.target.value }))} data-testid="review-candidate-score" />
      </label>
      <label>
        Summary
        <textarea value={draft.summary} onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} data-testid="review-candidate-summary" />
      </label>
      <label>
        Recommendation
        <select value={draft.recommendation} onChange={(event) => setDraft((current) => ({ ...current, recommendation: event.target.value }))} data-testid="review-candidate-recommendation">
          <option value="yes">Move forward</option>
          <option value="maybe">Maybe</option>
          <option value="no">No</option>
        </select>
      </label>
      <button type="button" onClick={handleSubmit} data-testid="review-candidate-submit-button">
        Submit review
      </button>
      {error ? <p data-testid="review-candidate-error">{error}</p> : null}
    </section>
  );
}
