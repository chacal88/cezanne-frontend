import { useEffect, useState } from 'react';
import { observability } from '../../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildReviewCandidateViewModel, runReviewCandidateWorkflow, type ExternalReviewDraft } from '../support';
import { PublicTokenStatePanel } from '../token-state/public-token-state-panel';

export function ReviewCandidatePage({ code }: { code: string }) {
  const view = buildReviewCandidateViewModel({ code });
  const [draft, setDraft] = useState<ExternalReviewDraft>(view.defaults);
  const [error, setError] = useState<string | null>(null);
  const [payloadPreview, setPayloadPreview] = useState('');

  useEffect(() => {
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'external_review_candidate_opened',
      data: { code, tokenState: view.decision.tokenState, correlationId: ensureCorrelationId() },
    });
    observability.telemetry.track({
      name: 'external_review_candidate_bootstrapped',
      data: { code, readiness: view.decision.readiness, correlationId: ensureCorrelationId() },
    });
    observability.telemetry.track({
      name: 'external_review_candidate_token_state_resolved',
      data: { code, tokenState: view.decision.tokenState, correlationId: ensureCorrelationId() },
    });
  }, [code, view.decision.readiness, view.decision.tokenState]);

  async function handleSubmit() {
    setError(null);
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'external_review_candidate_submission_started',
      data: { code, correlationId: ensureCorrelationId() },
    });

    const result = await runReviewCandidateWorkflow({ code }, view.participantName, draft);
    if (result.status === 'failed') {
      setError(result.message);
      observability.telemetry.track({
        name: 'external_review_candidate_submission_failed',
        data: { code, stage: result.stage, correlationId: ensureCorrelationId() },
      });
      return;
    }

    setPayloadPreview(JSON.stringify(result.payload, null, 2));
    observability.telemetry.track({
      name: 'external_review_candidate_submission_completed',
      data: { code, outcome: result.completion.kind, correlationId: ensureCorrelationId() },
    });
    window.location.reload();
  }

  if (view.completion) {
    observability.telemetry.track({
      name: 'external_review_candidate_terminal_viewed',
      data: { code, outcome: view.completion.kind, correlationId: ensureCorrelationId() },
    });
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
        <h1>Candidate review submitted</h1>
        <p data-testid="review-candidate-completion">{view.completion.message}</p>
      </section>
    );
  }

  if (!view.decision.canProceed) {
    return <PublicTokenStatePanel family="external-review-candidate" tokenState={view.decision.tokenState} reason={view.decision.reason} />;
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>{view.title}</h1>
      <p>{view.intro}</p>
      <p data-testid="review-candidate-participant">{view.participantName}</p>
      <p data-testid="review-candidate-schema">{view.schemaVersion}</p>
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
      {payloadPreview ? <pre data-testid="review-candidate-payload-preview">{payloadPreview}</pre> : null}
    </section>
  );
}
