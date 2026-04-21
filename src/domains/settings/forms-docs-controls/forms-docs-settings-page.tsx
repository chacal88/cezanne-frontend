import { useState } from 'react';
import { buildFormsDocsSettingsViewState } from './support/state';
import type { FormsDocsSettingsMutationState } from './support/models';
import { getFormsDocsSettingsConfig } from './support/store';
import { runFormsDocsSettingsSave } from './support/workflow';

export function FormsDocsSettingsPage() {
  const [config, setConfig] = useState(() => getFormsDocsSettingsConfig());
  const [mutation, setMutation] = useState<FormsDocsSettingsMutationState>({ kind: 'idle', canRetry: false });
  const [view, setView] = useState(() => buildFormsDocsSettingsViewState(config));

  function updateConfig(update: typeof config | ((current: typeof config) => typeof config)) {
    setConfig((current) => {
      const next = typeof update === 'function' ? update(current) : update;
      setView(buildFormsDocsSettingsViewState(next, mutation));
      return next;
    });
  }

  async function handleSave() {
    const saving: FormsDocsSettingsMutationState = { kind: 'saving', canRetry: false, requestHeaders: {} };
    setMutation(saving);
    setView(buildFormsDocsSettingsViewState(config, saving));
    const result = await runFormsDocsSettingsSave(config);
    setMutation(result.mutation);
    setConfig(result.config);
    setView(result);
  }

  return (
    <section aria-labelledby="forms-docs-settings-title">
      <p><a href={view.parentTarget} data-testid="forms-docs-parent-return">Back to settings</a></p>
      <h1 id="forms-docs-settings-title">Forms and documents settings</h1>
      <dl>
        <dt>Route owner</dt>
        <dd data-testid="forms-docs-owner">{view.owner}</dd>
        <dt>Readiness</dt>
        <dd data-testid="forms-docs-readiness">{view.readiness.kind}</dd>
        <dt>Mutation</dt>
        <dd data-testid="forms-docs-mutation-state">{view.mutation.kind}</dd>
        <dt>Schema</dt>
        <dd data-testid="forms-docs-schema-id">{view.config.schemaId}</dd>
        <dt>Adapter source</dt>
        <dd data-testid="forms-docs-source">{view.config.source}</dd>
        <dt>Version</dt>
        <dd data-testid="forms-docs-version">{view.config.version}</dd>
      </dl>

      <p data-testid="forms-docs-scope-note">
        This route owns authenticated forms/docs controls only. Candidate document truth, public applications, and integration forms token flows remain downstream consumers.
      </p>

      {view.readiness.kind === 'unavailable' || view.readiness.kind === 'failed' ? (
        <p data-testid="forms-docs-unavailable-note">{view.readiness.reason}</p>
      ) : null}

      <fieldset>
        <legend>Requested forms and documents</legend>
        {config.requestedDocuments.map((document, index) => (
          <label key={document.id}>
            Document {document.id}
            <input
              data-testid={`forms-docs-label-${index}`}
              value={document.label}
              onChange={(event) => updateConfig((current) => ({
                ...current,
                requestedDocuments: current.requestedDocuments.map((entry, entryIndex) => (entryIndex === index ? { ...entry, label: event.target.value } : entry)),
              }))}
            />
            <span data-testid={`forms-docs-consumer-${index}`}>{document.consumer}</span>
          </label>
        ))}
      </fieldset>

      <label>
        <input
          data-testid="forms-docs-public-uploads"
          type="checkbox"
          checked={config.publicUploadsEnabled}
          onChange={(event) => updateConfig((current) => ({ ...current, publicUploadsEnabled: event.target.checked }))}
        />
        Public uploads enabled
      </label>

      <label>
        <input
          data-testid="forms-docs-simulate-empty"
          type="checkbox"
          checked={config.simulateEmpty}
          onChange={(event) => updateConfig((current) => ({ ...current, simulateEmpty: event.target.checked }))}
        />
        Simulate empty state
      </label>
      <label>
        <input
          data-testid="forms-docs-simulate-unavailable"
          type="checkbox"
          checked={config.simulateUnavailable}
          onChange={(event) => updateConfig((current) => ({ ...current, simulateUnavailable: event.target.checked }))}
        />
        Simulate unavailable backend contract
      </label>
      <label>
        <input
          data-testid="forms-docs-simulate-stale"
          type="checkbox"
          checked={config.simulateStale}
          onChange={(event) => updateConfig((current) => ({ ...current, simulateStale: event.target.checked }))}
        />
        Simulate stale downstream state
      </label>
      <label>
        <input
          data-testid="forms-docs-simulate-degraded"
          type="checkbox"
          checked={config.simulateDegraded}
          onChange={(event) => updateConfig((current) => ({ ...current, simulateDegraded: event.target.checked }))}
        />
        Simulate degraded downstream state
      </label>
      <label>
        <input
          data-testid="forms-docs-simulate-failure"
          type="checkbox"
          checked={config.simulateSaveFailure}
          onChange={(event) => updateConfig((current) => ({ ...current, simulateSaveFailure: event.target.checked }))}
        />
        Simulate recoverable save failure
      </label>

      <button type="button" data-testid="forms-docs-save-button" disabled={!view.readiness.canEdit} onClick={handleSave}>
        Save forms/docs settings
      </button>
      {view.mutation.canRetry ? <button type="button" data-testid="forms-docs-retry-button" onClick={handleSave}>Retry save</button> : null}

      <h2>Downstream impact</h2>
      <ul data-testid="forms-docs-downstream-impact">
        {view.downstreamImpact.map((impact) => (
          <li key={impact.consumer} data-testid={`forms-docs-impact-${impact.consumer}`}>
            {impact.consumer}: {impact.state} / {impact.refreshIntent}
          </li>
        ))}
      </ul>

      <h2>Unknown backend contract fields</h2>
      <ul data-testid="forms-docs-unknown-fields">
        {view.unknownContractFields.map((field) => <li key={field}>{field}</li>)}
      </ul>
    </section>
  );
}
