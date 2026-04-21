import { useEffect, useMemo, useState } from 'react';
import { observability } from '../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../lib/observability';
import { PublicTokenStatePanel } from '../public-external/token-state/public-token-state-panel';
import { buildIntegrationFormsViewModel, runIntegrationFormsWorkflow } from './support';

export function IntegrationFormsTokenEntryPage({ token }: { token: string }) {
  const view = useMemo(() => buildIntegrationFormsViewModel({ token }), [token]);
  const [currentStepIndex, setCurrentStepIndex] = useState(view.currentStepIndex);
  const currentStep = view.steps[currentStepIndex];
  const existingAnswer = view.draft.answers.find((answer) => answer.stepId === currentStep?.id);
  const [answer, setAnswer] = useState(existingAnswer?.answer ?? '');
  const [fileName, setFileName] = useState(existingAnswer?.fileName ?? 'document.pdf');
  const [error, setError] = useState<string | null>(null);
  const [completion, setCompletion] = useState(view.completion);

  useEffect(() => {
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'integration_forms_opened',
      data: { tokenState: view.decision.tokenState, readiness: view.decision.readiness, correlationId: ensureCorrelationId() },
    });
  }, [view.decision.readiness, view.decision.tokenState]);

  async function handleSubmit() {
    if (!currentStep) return;
    setError(null);
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({ name: 'integration_forms_submission_started', data: { stepId: currentStep.id, correlationId: ensureCorrelationId() } });
    const result = await runIntegrationFormsWorkflow(
      { token },
      { stepId: currentStep.id, answer, fileName: currentStep.requiresFile ? fileName : undefined },
    );

    if (result.status === 'failed') {
      setError(result.message);
      observability.telemetry.track({ name: 'integration_forms_submission_failed', data: { stepId: currentStep.id, stage: result.stage, correlationId: ensureCorrelationId() } });
      return;
    }

    observability.telemetry.track({
      name: 'integration_forms_submission_completed',
      data: { stepId: currentStep.id, state: result.status, correlationId: ensureCorrelationId() },
    });
    if (result.status === 'completed') {
      setCompletion(result.completion);
      return;
    }

    setCurrentStepIndex(result.nextStepIndex);
    setAnswer('');
    setFileName('document.pdf');
  }

  if (completion) {
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
        <h1>Requested forms/documents complete</h1>
        <p data-testid="integration-forms-completion">{completion.message}</p>
      </section>
    );
  }

  if (!view.decision.canProceed) {
    return <PublicTokenStatePanel family="integration-forms" tokenState={view.decision.tokenState} reason={view.decision.reason} />;
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>{view.title}</h1>
      <p>{view.intro}</p>
      <p data-testid="integration-forms-candidate">{view.candidateName}</p>
      <p data-testid="integration-forms-job">{view.jobTitle}</p>
      <p data-testid="integration-forms-current-step">{currentStep.label}</p>
      <p data-testid="integration-forms-progress">{currentStepIndex + 1}/{view.steps.length}</p>
      <label>
        Response
        <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} data-testid="integration-forms-answer" />
      </label>
      {currentStep.requiresFile ? (
        <label>
          File name
          <input value={fileName} onChange={(event) => setFileName(event.target.value)} data-testid="integration-forms-file-name" />
        </label>
      ) : null}
      <button type="button" onClick={handleSubmit} data-testid="integration-forms-submit-button">Save and continue</button>
      {error ? <p data-testid="integration-forms-error">{error}</p> : null}
    </section>
  );
}
