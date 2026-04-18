import { useMemo, useState } from 'react';
import { useAccessContext, useCapabilities } from '../../../lib/access-control';
import { resolveOperationalSettingsReadiness } from '../operational/support/workflow';
import type { OperationalSettingsMutationState } from '../operational/support/models';
import type { TemplatesRouteState } from './support/models';
import { resolveTemplatesRouteState } from './support/routing';
import { getTemplatesSettingsConfig } from './support/store';
import { runTemplatesSettingsSave } from './support/workflow';

export function TemplatesSettingsPage({ routeState }: { routeState: TemplatesRouteState }) {
  const access = useAccessContext();
  const capabilities = useCapabilities();
  const [config, setConfig] = useState(() => getTemplatesSettingsConfig());
  const [readiness, setReadiness] = useState(() => resolveOperationalSettingsReadiness({}));
  const [mutationState, setMutationState] = useState<OperationalSettingsMutationState>({ kind: 'idle', canRetry: false });

  const resolvedView = useMemo(() => resolveTemplatesRouteState(routeState, access, capabilities), [routeState, access, capabilities]);

  async function handleSave() {
    setMutationState({ kind: 'submitting', canRetry: false, requestHeaders: {} });
    const result = await runTemplatesSettingsSave(config);
    setMutationState(result.state);
    setReadiness(result.readiness);

    if (result.config) {
      setConfig(result.config);
    }
  }

  return (
    <section>
      <h1>Templates settings</h1>
      <dl>
        <dt>Readiness</dt>
        <dd data-testid="templates-readiness">{readiness.kind}</dd>
        <dt>Requested view</dt>
        <dd data-testid="templates-requested-view">{resolvedView.requested}</dd>
        <dt>Active view</dt>
        <dd data-testid="templates-active-view">{resolvedView.active}</dd>
        <dt>Fallback</dt>
        <dd data-testid="templates-fallback-reason">{resolvedView.fallbackReason}</dd>
      </dl>

      <p data-testid="templates-family-note">
        Templates routes stay inside one family contract even when a subsection is unavailable.
      </p>

      {routeState.kind === 'detail' ? <p data-testid="templates-detail-id">Template detail: {routeState.templateId}</p> : null}

      <label>
        First template title
        <input
          data-testid="templates-title-0"
          value={config.summaries[0]?.title ?? ''}
          onChange={(event) =>
            setConfig((current) => ({
              ...current,
              summaries: current.summaries.map((summary, index) => (index === 0 ? { ...summary, title: event.target.value } : summary)),
            }))
          }
        />
      </label>

      <label>
        <input
          data-testid="templates-simulate-failure"
          type="checkbox"
          checked={config.simulateSubmissionFailure}
          onChange={(event) => setConfig((current) => ({ ...current, simulateSubmissionFailure: event.target.checked }))}
        />
        Simulate recoverable save failure
      </label>

      <button type="button" data-testid="templates-save-button" onClick={handleSave}>
        Save templates settings
      </button>

      {mutationState.kind === 'submission-error' ? (
        <button type="button" data-testid="templates-retry-button" onClick={handleSave}>
          Retry save
        </button>
      ) : null}

      <p data-testid="templates-mutation-state">{mutationState.kind}</p>
    </section>
  );
}
