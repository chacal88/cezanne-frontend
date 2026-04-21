import { useEffect, useState } from 'react';
import { observability } from '../../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildPublicSurveyViewModel, runPublicSurveyCompletion } from '../support';
import { buildSurveyReviewScoringTelemetry, resolveSurveyReviewScoringSubmitResult, startSurveyReviewScoringSubmit } from '../../candidates/surveys-custom-fields/support';
import { PublicTokenStatePanel } from '../token-state/public-token-state-panel';

export function PublicSurveyPage({ surveyuuid, jobuuid, cvuuid }: { surveyuuid: string; jobuuid: string; cvuuid: string }) {
  const view = buildPublicSurveyViewModel({ surveyuuid, jobuuid, cvuuid });
  const [answer, setAnswer] = useState(view.savedAnswer);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'public_survey_opened',
      data: {
        surveyuuid,
        tokenState: view.decision.tokenState,
        correlationId: ensureCorrelationId(),
      },
    });
  }, [surveyuuid, view.decision.tokenState]);

  async function handleSubmit() {
    setError(null);
    setActiveCorrelationId(createCorrelationId());
    const submittingState = startSurveyReviewScoringSubmit({
      ...view.operationalState,
      draft: { ...view.operationalState.draft, answerCount: answer.trim() ? 1 : 0 },
      canSubmit: Boolean(answer.trim()),
    });
    observability.telemetry.track(buildSurveyReviewScoringTelemetry({
      routeFamily: view.operationalState.routeFamily,
      action: 'submit-start',
      operationalState: submittingState.kind,
      taskContext: view.operationalState.taskContext,
      tokenState: view.operationalState.tokenState,
    }));
    const result = await runPublicSurveyCompletion({ surveyuuid, jobuuid, cvuuid }, answer);
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
        name: 'public_survey_submit_failed',
        data: { surveyuuid, operationalState: failedState.kind, correlationId: ensureCorrelationId() },
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
      name: 'public_survey_submit_completed',
      data: { surveyuuid, operationalState: completedState.kind, correlationId: ensureCorrelationId() },
    });
    window.location.reload();
  }

  if (view.completion) {
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
        <h1>Survey complete</h1>
        <p data-testid="public-survey-completion">{view.completion.message}</p>
        <p data-testid="public-survey-completion-state">{view.operationalState.kind}</p>
      </section>
    );
  }

  if (!view.decision.canProceed && ['token-invalid', 'token-expired', 'inaccessible'].includes(view.operationalState.kind)) {
    return <PublicTokenStatePanel family="public-survey" tokenState={view.decision.tokenState} reason={view.decision.reason} />;
  }

  if (!view.decision.canProceed || view.operationalState.kind !== 'ready') {
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
        <h1>{view.title}</h1>
        <p data-testid="public-survey-operational-state">{view.operationalState.kind}</p>
        <p data-testid="public-survey-operational-message">{view.operationalState.message}</p>
      </section>
    );
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>{view.title}</h1>
      <p>{view.prompt}</p>
      <p data-testid="public-survey-operational-state">{view.operationalState.kind}</p>
      <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} data-testid="public-survey-answer" />
      <button type="button" onClick={handleSubmit} data-testid="public-survey-submit-button">
        Submit survey
      </button>
      {error ? <p data-testid="public-survey-error">{error}</p> : null}
    </section>
  );
}
