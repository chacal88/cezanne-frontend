import { useEffect, useState } from 'react';
import { observability } from '../../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildInterviewFeedbackViewModel, runInterviewFeedbackWorkflow, type ExternalReviewDraft } from '../support';
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
      data: { code, tokenState: view.decision.tokenState, correlationId: ensureCorrelationId() },
    });
    observability.telemetry.track({
      name: 'external_interview_feedback_bootstrapped',
      data: { code, readiness: view.decision.readiness, correlationId: ensureCorrelationId() },
    });
    observability.telemetry.track({
      name: 'external_interview_feedback_token_state_resolved',
      data: { code, tokenState: view.decision.tokenState, correlationId: ensureCorrelationId() },
    });
  }, [code, view.decision.readiness, view.decision.tokenState]);

  async function handleSubmit() {
    setError(null);
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'external_interview_feedback_submission_started',
      data: { code, correlationId: ensureCorrelationId() },
    });

    const result = await runInterviewFeedbackWorkflow({ code }, view.participantName, draft);
    if (result.status === 'failed') {
      setError(result.message);
      observability.telemetry.track({
        name: 'external_interview_feedback_submission_failed',
        data: { code, stage: result.stage, correlationId: ensureCorrelationId() },
      });
      return;
    }

    setPayloadPreview(JSON.stringify(result.payload, null, 2));
    observability.telemetry.track({
      name: 'external_interview_feedback_submission_completed',
      data: { code, outcome: result.completion.kind, correlationId: ensureCorrelationId() },
    });
    window.location.reload();
  }

  if (view.completion) {
    observability.telemetry.track({
      name: 'external_interview_feedback_terminal_viewed',
      data: { code, outcome: view.completion.kind, correlationId: ensureCorrelationId() },
    });
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
        <h1>Interview feedback submitted</h1>
        <p data-testid="interview-feedback-completion">{view.completion.message}</p>
      </section>
    );
  }

  if (!view.decision.canProceed) {
    return <PublicTokenStatePanel family="external-interview-feedback" tokenState={view.decision.tokenState} reason={view.decision.reason} />;
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>{view.title}</h1>
      <p>{view.intro}</p>
      <p data-testid="interview-feedback-participant">{view.participantName}</p>
      <p data-testid="interview-feedback-schema">{view.schemaVersion}</p>
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
