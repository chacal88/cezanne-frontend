import { useEffect, useState } from 'react';
import { observability } from '../../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildInterviewFeedbackViewModel, runInterviewFeedbackWorkflow, type ExternalReviewDraft } from '../support';
import { buildSurveyReviewScoringTelemetry, resolveSurveyReviewScoringSubmitResult, startSurveyReviewScoringSubmit } from '../../../domains/candidates/surveys-custom-fields/support';
import { PublicTokenStatePanel } from '../token-state/public-token-state-panel';

export function InterviewFeedbackPage({ code }: { code: string }) {
  const view = buildInterviewFeedbackViewModel({ code });
  const [draft, setDraft] = useState<ExternalReviewDraft>(view.defaults);
  const [error, setError] = useState<string | null>(null);
  const [payloadPreview, setPayloadPreview] = useState('');

  useEffect(() => {
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'external_interview_feedback_opened',
      data: { code, tokenState: view.decision.tokenState, operationalState: view.operationalState.kind, correlationId: ensureCorrelationId() },
    });
    observability.telemetry.track({
      name: 'external_interview_feedback_bootstrapped',
      data: { code, readiness: view.decision.readiness, correlationId: ensureCorrelationId() },
    });
    observability.telemetry.track({
      name: 'external_interview_feedback_token_state_resolved',
      data: { code, tokenState: view.decision.tokenState, operationalState: view.operationalState.kind, correlationId: ensureCorrelationId() },
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
      name: 'external_interview_feedback_submission_started',
      data: { code, operationalState: submittingState.kind, correlationId: ensureCorrelationId() },
    });

    const result = await runInterviewFeedbackWorkflow({ code }, view.participantName, draft);
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
        name: 'external_interview_feedback_submission_failed',
        data: { code, stage: result.stage, operationalState: failedState.kind, correlationId: ensureCorrelationId() },
      });
      return;
    }

    setPayloadPreview(JSON.stringify(result.payload, null, 2));
    const completedState = resolveSurveyReviewScoringSubmitResult(view.operationalState, 'scoring-pending');
    observability.telemetry.track(buildSurveyReviewScoringTelemetry({
      routeFamily: completedState.routeFamily,
      action: 'terminal-outcome',
      operationalState: completedState.kind,
      taskContext: completedState.taskContext,
      tokenState: completedState.tokenState,
      terminalOutcome: completedState.terminalOutcome,
    }));
    observability.telemetry.track({
      name: 'external_interview_feedback_submission_completed',
      data: { code, outcome: result.completion.kind, operationalState: completedState.kind, correlationId: ensureCorrelationId() },
    });
    window.location.reload();
  }

  if (view.completion) {
    observability.telemetry.track({
      name: 'external_interview_feedback_terminal_viewed',
      data: { code, outcome: view.completion.kind, operationalState: view.operationalState.kind, correlationId: ensureCorrelationId() },
    });
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
        <h1>Interview feedback submitted</h1>
        <p data-testid="interview-feedback-completion">{view.completion.message}</p>
        <p data-testid="interview-feedback-completion-state">{view.operationalState.kind}</p>
      </section>
    );
  }

  if (!view.decision.canProceed && ['token-invalid', 'token-expired', 'inaccessible'].includes(view.operationalState.kind)) {
    return <PublicTokenStatePanel family="external-interview-feedback" tokenState={view.decision.tokenState} reason={view.decision.reason} />;
  }

  if (!view.decision.canProceed || view.operationalState.kind !== 'ready') {
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
        <h1>{view.title}</h1>
        <p data-testid="external-interview-feedback-operational-state">{view.operationalState.kind}</p>
        <p data-testid="external-interview-feedback-operational-message">{view.operationalState.message}</p>
      </section>
    );
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>{view.title}</h1>
      <p>{view.intro}</p>
      <p data-testid="interview-feedback-participant">{view.participantName}</p>
      <p data-testid="interview-feedback-schema">{view.schemaVersion}</p>
      <p data-testid="interview-feedback-operational-state">{view.operationalState.kind}</p>
      <label>
        Interview score
        <input value={draft.score} onChange={(event) => setDraft((current) => ({ ...current, score: event.target.value }))} data-testid="interview-feedback-score" />
      </label>
      <label>
        Feedback summary
        <textarea value={draft.summary} onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} data-testid="interview-feedback-summary" />
      </label>
      <label>
        Move forward
        <select value={draft.recommendation} onChange={(event) => setDraft((current) => ({ ...current, recommendation: event.target.value }))} data-testid="interview-feedback-recommendation">
          <option value="yes">Yes</option>
          <option value="maybe">Maybe</option>
          <option value="no">No</option>
        </select>
      </label>
      <button type="button" onClick={handleSubmit} data-testid="interview-feedback-submit-button">
        Submit feedback
      </button>
      {error ? <p data-testid="interview-feedback-error">{error}</p> : null}
      {payloadPreview ? <pre data-testid="interview-feedback-payload-preview">{payloadPreview}</pre> : null}
    </section>
  );
}
