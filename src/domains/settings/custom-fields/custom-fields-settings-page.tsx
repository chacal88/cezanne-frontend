import { useState } from 'react';
import { resolveOperationalSettingsReadiness } from '../operational/support/workflow';
import type { OperationalSettingsMutationState } from '../operational/support/models';
import { getCustomFieldsSettingsConfig } from './support/store';
import { runCustomFieldsSettingsSave } from './support/workflow';

export function CustomFieldsSettingsPage() {
  const [config, setConfig] = useState(() => getCustomFieldsSettingsConfig());
  const [readiness, setReadiness] = useState(() => resolveOperationalSettingsReadiness({}));
  const [mutationState, setMutationState] = useState<OperationalSettingsMutationState>({ kind: 'idle', canRetry: false });

  async function handleSave() {
    setMutationState({ kind: 'submitting', canRetry: false, requestHeaders: {} });
    const result = await runCustomFieldsSettingsSave(config);
    setMutationState(result.state);
    setReadiness(result.readiness);

    if (result.config) {
      setConfig(result.config);
    }
  }

  return (
    <section>
      <h1>Custom fields settings</h1>
      <dl>
        <dt>Readiness</dt>
        <dd data-testid="custom-fields-readiness">{readiness.kind}</dd>
        <dt>Schema</dt>
        <dd data-testid="custom-fields-schema-id">{config.schemaId}</dd>
        <dt>Downstream consumers</dt>
        <dd data-testid="custom-fields-downstream">candidate detail, public application</dd>
      </dl>

      <p data-testid="custom-fields-scope-note">
        This route owns custom-fields administration only. Candidate and public rendering stay downstream from this R4 slice.
      </p>

      {config.fields.map((field, index) => (
        <fieldset key={field.id}>
          <legend>{field.id}</legend>
          <label>
            Label
            <input
              data-testid={`custom-fields-label-${index}`}
              value={field.label}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  fields: current.fields.map((entry, entryIndex) => (entryIndex === index ? { ...entry, label: event.target.value } : entry)),
                }))
              }
            />
          </label>
          <label>
            Scope
            <span data-testid={`custom-fields-scope-${index}`}>{field.scope}</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={field.required}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  fields: current.fields.map((entry, entryIndex) => (entryIndex === index ? { ...entry, required: event.target.checked } : entry)),
                }))
              }
            />
            Required
          </label>
        </fieldset>
      ))}

      <label>
        <input
          data-testid="custom-fields-simulate-failure"
          type="checkbox"
          checked={config.simulateSubmissionFailure}
          onChange={(event) => setConfig((current) => ({ ...current, simulateSubmissionFailure: event.target.checked }))}
        />
        Simulate recoverable save failure
      </label>

      <button type="button" data-testid="custom-fields-save-button" onClick={handleSave}>
        Save custom fields settings
      </button>

      {mutationState.kind === 'submission-error' ? (
        <button type="button" data-testid="custom-fields-retry-button" onClick={handleSave}>
          Retry save
        </button>
      ) : null}

      <p data-testid="custom-fields-mutation-state">{mutationState.kind}</p>
      <pre data-testid="custom-fields-request-headers">
        {JSON.stringify('requestHeaders' in mutationState ? mutationState.requestHeaders : {}, null, 2)}
      </pre>
    </section>
  );
}
