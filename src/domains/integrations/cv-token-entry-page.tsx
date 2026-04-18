import { useEffect, useMemo, useState } from 'react';
import { observability } from '../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../lib/observability';
import { PublicTokenStatePanel } from '../public-external/token-state/public-token-state-panel';
import { buildIntegrationCvViewModel, runIntegrationCvWorkflow } from './support';

export function IntegrationCvTokenEntryPage({ token, action }: { token: string; action?: string }) {
  const view = useMemo(() => buildIntegrationCvViewModel({ token, action }), [action, token]);
  const [error, setError] = useState<string | null>(null);
  const [payloadPreview, setPayloadPreview] = useState('');
  const [selection, setSelection] = useState<'slot-1' | 'slot-2' | 'unavailable'>('slot-1');
  const [reason, setReason] = useState('');

  useEffect(() => {
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'integration_cv_opened',
      data: { tokenState: view.decision.tokenState, action: view.currentAction, correlationId: ensureCorrelationId() },
    });
    observability.telemetry.track({
      name: 'integration_cv_bootstrapped',
      data: { readiness: view.decision.readiness, correlationId: ensureCorrelationId() },
    });
  }, [view.currentAction, view.decision.readiness, view.decision.tokenState]);

  async function handleInterviewSubmit() {
    setError(null);
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({ name: 'integration_cv_submission_started', data: { mode: 'interview', correlationId: ensureCorrelationId() } });
    const result = await runIntegrationCvWorkflow({ token, action }, view.candidateName, selection, reason);
    if (result.status === 'failed') {
      setError(result.message);
      observability.telemetry.track({ name: 'integration_cv_submission_failed', data: { mode: 'interview', stage: result.stage, correlationId: ensureCorrelationId() } });
      return;
    }
    setPayloadPreview(JSON.stringify(result.payload, null, 2));
    observability.telemetry.track({ name: 'integration_cv_submission_completed', data: { mode: 'interview', outcome: result.completion.kind, correlationId: ensureCorrelationId() } });
    window.location.reload();
  }

  async function handleOfferSubmit(next: 'accept' | 'reject') {
    setError(null);
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({ name: 'integration_cv_submission_started', data: { mode: 'offer', selection: next, correlationId: ensureCorrelationId() } });
    const result = await runIntegrationCvWorkflow({ token, action }, view.candidateName, next);
    if (result.status === 'failed') {
      setError(result.message);
      observability.telemetry.track({ name: 'integration_cv_submission_failed', data: { mode: 'offer', stage: result.stage, correlationId: ensureCorrelationId() } });
      return;
    }
    setPayloadPreview(JSON.stringify(result.payload, null, 2));
    observability.telemetry.track({ name: 'integration_cv_submission_completed', data: { mode: 'offer', outcome: result.completion.kind, correlationId: ensureCorrelationId() } });
    window.location.reload();
  }

  if (view.completion) {
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
        <h1>Integration CV callback complete</h1>
        <p data-testid="integration-cv-completion">{view.completion.message}</p>
        {payloadPreview ? <pre data-testid="integration-cv-payload-preview">{payloadPreview}</pre> : null}
      </section>
    );
  }

  if (!view.decision.canProceed) {
    return <PublicTokenStatePanel family="integration-cv" tokenState={view.decision.tokenState} reason={view.decision.reason} />;
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>{view.title}</h1>
      <p>{view.intro}</p>
      <p data-testid="integration-cv-candidate">{view.candidateName}</p>
      <p data-testid="integration-cv-job">{view.jobTitle}</p>
      <p data-testid="integration-cv-current-action">{view.currentAction}</p>
      {view.currentAction === 'offer' ? (
        <>
          <p data-testid="integration-cv-offer-value">{view.offerValue}</p>
          <p>{view.offerMessage}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => handleOfferSubmit('accept')} data-testid="integration-cv-offer-accept-button">Accept offer</button>
            <button type="button" onClick={() => handleOfferSubmit('reject')} data-testid="integration-cv-offer-reject-button">Reject offer</button>
          </div>
        </>
      ) : (
        <>
          <fieldset>
            <legend>Interview options</legend>
            {view.interviewChoices.map((choice) => (
              <label key={choice.id} style={{ display: 'block', marginBottom: 8 }}>
                <input type="radio" checked={selection === choice.id} onChange={() => setSelection(choice.id)} /> {choice.label}
              </label>
            ))}
          </fieldset>
          {selection === 'unavailable' ? (
            <label>
              Reason
              <input value={reason} onChange={(event) => setReason(event.target.value)} data-testid="integration-cv-reason" />
            </label>
          ) : null}
          <button type="button" onClick={handleInterviewSubmit} data-testid="integration-cv-submit-button">Submit response</button>
        </>
      )}
      {error ? <p data-testid="integration-cv-error">{error}</p> : null}
      {payloadPreview ? <pre data-testid="integration-cv-payload-preview">{payloadPreview}</pre> : null}
    </section>
  );
}
