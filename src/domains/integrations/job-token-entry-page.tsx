import { useEffect, useMemo } from 'react';
import { observability } from '../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../lib/observability';
import { PublicTokenStatePanel } from '../public-external/token-state/public-token-state-panel';
import { buildIntegrationJobViewModel } from './support';

export function IntegrationJobTokenEntryPage({ token, action }: { token: string; action?: string }) {
  const view = useMemo(() => buildIntegrationJobViewModel({ token, action }), [action, token]);

  useEffect(() => {
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'integration_job_opened',
      data: { tokenState: view.decision.tokenState, action: action ?? 'default', correlationId: ensureCorrelationId() },
    });
  }, [action, view.decision.tokenState]);

  if (!view.decision.canProceed) {
    return <PublicTokenStatePanel family="integration-job" tokenState={view.decision.tokenState} reason={view.decision.reason} />;
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>Integration job callback</h1>
      <p data-testid="integration-job-title">{view.title}</p>
      <p data-testid="integration-job-company">{view.companyName}</p>
      <p data-testid="integration-job-location">{view.location}</p>
      <p data-testid="integration-job-summary">{view.summary}</p>
      <p data-testid="integration-job-action">{action ?? 'default'}</p>
    </section>
  );
}
