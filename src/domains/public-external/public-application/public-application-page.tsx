import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { observability } from '../../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildPublicApplicationViewModel, buildSharedJobPath, runPublicApplicationWorkflow, type PublicApplicationDraft } from '../support';
import { PublicTokenStatePanel } from '../token-state/public-token-state-panel';

export function PublicApplicationPage({ jobOrRole, token, source }: { jobOrRole: string; token: string; source: string }) {
  const view = buildPublicApplicationViewModel({ jobOrRole, token, source });
  const [draft, setDraft] = useState<PublicApplicationDraft>(() => ({ ...view.defaults, fileName: 'cv.pdf' }));
  const [error, setError] = useState<string | null>(null);
  const [completion, setCompletion] = useState(view.completion);

  useEffect(() => {
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'public_application_opened',
      data: {
        jobOrRole,
        tokenState: view.decision.tokenState,
        source,
        correlationId: ensureCorrelationId(),
      },
    });
  }, [jobOrRole, source, view.decision.tokenState]);

  async function handleSubmit() {
    setError(null);
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'public_application_submit_started',
      data: { jobOrRole, correlationId: ensureCorrelationId() },
    });

    const result = await runPublicApplicationWorkflow({ jobOrRole, token, source }, draft);
    if (result.status === 'failed') {
      setError(result.message);
      observability.telemetry.track({
        name: 'public_application_submit_failed',
        data: { jobOrRole, stage: result.stage, correlationId: ensureCorrelationId() },
      });
      return;
    }

    observability.telemetry.track({
      name: 'public_application_submit_completed',
      data: {
        jobOrRole,
        uploadCount: result.uploadedFiles.length,
        correlationId: ensureCorrelationId(),
      },
    });
    setCompletion(result.completion);
  }

  if (completion) {
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
        <h1>Application complete</h1>
        <p data-testid="public-application-completion">{completion.message}</p>
        <Link to={buildSharedJobPath({ jobOrRole, token, source })} data-testid="public-application-back-link">
          Back to shared job
        </Link>
      </section>
    );
  }

  if (!view.decision.canProceed) {
    return <PublicTokenStatePanel family="public-application" tokenState={view.decision.tokenState} reason={view.decision.reason} />;
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>Public application</h1>
      <p>{view.intro}</p>
      <label>
        First name
        <input value={draft.firstName} onChange={(event) => setDraft((current) => ({ ...current, firstName: event.target.value }))} data-testid="public-application-first-name" />
      </label>
      <label>
        Email
        <input value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} data-testid="public-application-email" />
      </label>
      <label>
        Phone
        <input value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} data-testid="public-application-phone" />
      </label>
      <label>
        Motivation
        <textarea value={draft.motivation} onChange={(event) => setDraft((current) => ({ ...current, motivation: event.target.value }))} data-testid="public-application-motivation" />
      </label>
      <label>
        File name
        <input value={draft.fileName} onChange={(event) => setDraft((current) => ({ ...current, fileName: event.target.value }))} data-testid="public-application-file-name" />
      </label>
      <button type="button" onClick={handleSubmit} data-testid="public-application-submit-button">
        Submit application
      </button>
      {error ? <p data-testid="public-application-error">{error}</p> : null}
      {view.uploads.length > 0 ? <p data-testid="public-application-upload-count">{view.uploads.length}</p> : null}
    </section>
  );
}
