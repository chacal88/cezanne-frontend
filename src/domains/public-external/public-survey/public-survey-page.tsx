import { useEffect, useState } from 'react';
import { observability } from '../../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildPublicSurveyViewModel, runPublicSurveyCompletion } from '../support';
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
    const result = await runPublicSurveyCompletion({ surveyuuid, jobuuid, cvuuid }, answer);
    if (result.status === 'failed') {
      setError(result.message);
      observability.telemetry.track({
        name: 'public_survey_submit_failed',
        data: { surveyuuid, correlationId: ensureCorrelationId() },
      });
      return;
    }

    observability.telemetry.track({
      name: 'public_survey_submit_completed',
      data: { surveyuuid, correlationId: ensureCorrelationId() },
    });
    window.location.reload();
  }

  if (view.completion) {
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
        <h1>Survey complete</h1>
        <p data-testid="public-survey-completion">{view.completion.message}</p>
      </section>
    );
  }

  if (!view.decision.canProceed) {
    return <PublicTokenStatePanel family="public-survey" tokenState={view.decision.tokenState} reason={view.decision.reason} />;
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>{view.title}</h1>
      <p>{view.prompt}</p>
      <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} data-testid="public-survey-answer" />
      <button type="button" onClick={handleSubmit} data-testid="public-survey-submit-button">
        Submit survey
      </button>
      {error ? <p data-testid="public-survey-error">{error}</p> : null}
    </section>
  );
}
