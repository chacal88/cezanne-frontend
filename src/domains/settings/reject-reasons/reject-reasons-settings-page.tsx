import { useState } from 'react';
import { resolveOperationalSettingsReadiness } from '../operational/support/workflow';
import type { OperationalSettingsMutationState } from '../operational/support/models';
import { getRejectReasonsSettingsConfig } from './support/store';
import { runRejectReasonsSettingsSave } from './support/workflow';

export function RejectReasonsSettingsPage() {
  const [config, setConfig] = useState(() => getRejectReasonsSettingsConfig());
  const [readiness, setReadiness] = useState(() => resolveOperationalSettingsReadiness({}));
  const [mutationState, setMutationState] = useState<OperationalSettingsMutationState>({ kind: 'idle', canRetry: false });

  async function handleSave() {
    setMutationState({ kind: 'submitting', canRetry: false, requestHeaders: {} });
    const result = await runRejectReasonsSettingsSave(config);
    setMutationState(result.state);
    setReadiness(result.readiness);

    if (result.config) {
      setConfig(result.config);
    }
  }

  return (
    <section>
      <h1>Reject reasons settings</h1>
      <dl>
        <dt>Readiness</dt>
        <dd data-testid="reject-reasons-readiness">{readiness.kind}</dd>
        <dt>Downstream consumers</dt>
        <dd data-testid="reject-reasons-downstream">job reject flow, candidate reject flow</dd>
      </dl>

      <p data-testid="reject-reasons-scope-note">
        This route owns reject-reasons administration only. Job and candidate reject flows stay downstream from this R4 slice.
      </p>

      {config.reasons.map((reason, index) => (
        <fieldset key={reason.id}>
          <legend>{reason.id}</legend>
          <label>
            Label
            <input
              data-testid={`reject-reasons-label-${index}`}
              value={reason.label}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  reasons: current.reasons.map((entry, entryIndex) => (entryIndex === index ? { ...entry, label: event.target.value } : entry)),
                }))
              }
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={reason.active}
              onChange={(event) =>
                setConfig((current) => ({
                  ...current,
                  reasons: current.reasons.map((entry, entryIndex) => (entryIndex === index ? { ...entry, active: event.target.checked } : entry)),
                }))
              }
            />
            Active
          </label>
        </fieldset>
      ))}

      <label>
        <input
          data-testid="reject-reasons-simulate-failure"
          type="checkbox"
          checked={config.simulateSubmissionFailure}
          onChange={(event) => setConfig((current) => ({ ...current, simulateSubmissionFailure: event.target.checked }))}
        />
        Simulate recoverable save failure
      </label>

      <button type="button" data-testid="reject-reasons-save-button" onClick={handleSave}>
        Save reject reasons
      </button>

      {mutationState.kind === 'submission-error' ? (
        <button type="button" data-testid="reject-reasons-retry-button" onClick={handleSave}>
          Retry save
        </button>
      ) : null}

      <p data-testid="reject-reasons-mutation-state">{mutationState.kind}</p>
    </section>
  );
}
