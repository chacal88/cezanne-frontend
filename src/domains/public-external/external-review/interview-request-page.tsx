import { useEffect, useState } from 'react';
import { observability } from '../../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildInterviewRequestViewModel, runInterviewRequestDecisionWorkflow, type InterviewRequestDecisionChoice } from '../support';
import { PublicTokenStatePanel } from '../token-state/public-token-state-panel';

export function InterviewRequestPage({ scheduleUuid, cvToken }: { scheduleUuid: string; cvToken: string }) {
  const view = buildInterviewRequestViewModel({ scheduleUuid, cvToken });
  const [error, setError] = useState<string | null>(null);
  const [terminalOutcome, setTerminalOutcome] = useState(view.terminalOutcome);

  useEffect(() => {
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'external_interview_request_opened',
      data: { tokenState: view.decision.tokenState, correlationId: ensureCorrelationId() },
    });
    observability.telemetry.track({
      name: 'external_interview_request_bootstrapped',
      data: { readiness: view.decision.readiness, correlationId: ensureCorrelationId() },
    });
    observability.telemetry.track({
      name: 'external_interview_request_token_state_resolved',
      data: { tokenState: view.decision.tokenState, correlationId: ensureCorrelationId() },
    });
  }, [scheduleUuid, view.decision.readiness, view.decision.tokenState]);

  async function handleDecision(decision: InterviewRequestDecisionChoice) {
    setError(null);
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'external_interview_request_submission_started',
      data: { decision, correlationId: ensureCorrelationId() },
    });

    const result = await runInterviewRequestDecisionWorkflow({ scheduleUuid, cvToken }, view.participantName, decision);
    if (result.status === 'failed') {
      setError(result.message);
      observability.telemetry.track({
        name: 'external_interview_request_submission_failed',
        data: { stage: result.stage, correlationId: ensureCorrelationId() },
      });
      return;
    }

    observability.telemetry.track({
      name: 'external_interview_request_submission_completed',
      data: { outcome: result.completion.kind, correlationId: ensureCorrelationId() },
    });
    setTerminalOutcome(result.completion);
  }

  if (terminalOutcome) {
    observability.telemetry.track({
      name: 'external_interview_request_terminal_viewed',
      data: { outcome: terminalOutcome.kind, correlationId: ensureCorrelationId() },
    });
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
        <h1>Interview request complete</h1>
        <p data-testid="interview-request-completion">{terminalOutcome.message}</p>
      </section>
    );
  }

  if (!view.decision.canProceed) {
    return <PublicTokenStatePanel family="external-interview-request" tokenState={view.decision.tokenState} reason={view.decision.reason} />;
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>{view.title}</h1>
      <p>{view.intro}</p>
      <p data-testid="interview-request-participant">{view.participantName}</p>
      <p data-testid="interview-request-scheduled-at">{view.scheduledAt}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => handleDecision('accept')} data-testid="interview-request-accept-button">
          Accept request
        </button>
        <button type="button" onClick={() => handleDecision('decline')} data-testid="interview-request-decline-button">
          Decline request
        </button>
      </div>
      {error ? <p data-testid="interview-request-error">{error}</p> : null}
    </section>
  );
}
