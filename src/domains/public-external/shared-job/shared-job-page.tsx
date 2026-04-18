import { useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { observability } from '../../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildSharedJobViewModel } from '../support';
import { PublicTokenStatePanel } from '../token-state/public-token-state-panel';

export function SharedJobPage({ jobOrRole, token, source }: { jobOrRole: string; token: string; source: string }) {
  const view = buildSharedJobViewModel({ jobOrRole, token, source });

  useEffect(() => {
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'public_shared_job_opened',
      data: {
        jobOrRole,
        tokenState: view.decision.tokenState,
        source,
        correlationId: ensureCorrelationId(),
      },
    });
  }, [jobOrRole, source, view.decision.tokenState]);

  if (!view.decision.canProceed) {
    return <PublicTokenStatePanel family="shared-job" tokenState={view.decision.tokenState} reason={view.decision.reason} />;
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
      <h1>Shared job</h1>
      <p data-testid="shared-job-title">{view.title}</p>
      <p data-testid="shared-job-source">{view.sourceLabel}</p>
      <p>{view.summary}</p>
      <Link to={view.applicationPath} data-testid="shared-job-apply-link">
        Start application
      </Link>
    </section>
  );
}
