import { useMemo, useState } from 'react';
import { useCapabilities } from '../../../lib/access-control';
import { resolveOperationalSettingsReadiness } from '../operational/support/workflow';
import type { OperationalSettingsMutationState } from '../operational/support/models';
import { getHiringFlowSettingsConfig } from './support/store';
import { runHiringFlowSettingsSave } from './support/workflow';

export function HiringFlowSettingsPage() {
  const capabilities = useCapabilities();
  const [config, setConfig] = useState(() => getHiringFlowSettingsConfig());
  const [readiness, setReadiness] = useState(() => resolveOperationalSettingsReadiness({}));
  const [mutationState, setMutationState] = useState<OperationalSettingsMutationState>({ kind: 'idle', canRetry: false });

  const requisitionAdjacency = useMemo(
    () => (capabilities.canUseJobRequisitionBranching ? 'available' : 'hidden'),
    [capabilities.canUseJobRequisitionBranching],
  );

  async function handleSave() {
    setMutationState({ kind: 'submitting', canRetry: false, requestHeaders: {} });
    const result = await runHiringFlowSettingsSave(config);
    setMutationState(result.state);
    setReadiness(result.readiness);

    if (result.config) {
      setConfig(result.config);
    }
  }

  return (
    <section>
      <h1>Hiring flow settings</h1>
      <dl>
        <dt>Readiness</dt>
        <dd data-testid="hiring-flow-readiness">{readiness.kind}</dd>
        <dt>Workflow</dt>
        <dd data-testid="hiring-flow-workflow-id">{config.workflowId}</dd>
        <dt>Requisition adjacency</dt>
        <dd data-testid="hiring-flow-requisition-adjacency">{requisitionAdjacency}</dd>
      </dl>

      <p data-testid="hiring-flow-scope-note">
        This route owns hiring-flow configuration only. Requisition authoring stays outside this R4 slice.
      </p>

      <label>
        Workflow name
        <input
          data-testid="hiring-flow-workflow-name"
          value={config.workflowName}
          onChange={(event) => setConfig((current) => ({ ...current, workflowName: event.target.value }))}
        />
      </label>

      <label>
        Default stage
        <input
          data-testid="hiring-flow-default-stage"
          value={config.defaultStageName}
          onChange={(event) => setConfig((current) => ({ ...current, defaultStageName: event.target.value }))}
        />
      </label>

      <label>
        Stage count
        <input
          data-testid="hiring-flow-stage-count"
          type="number"
          min={1}
          value={config.stageCount}
          onChange={(event) => setConfig((current) => ({ ...current, stageCount: Number(event.target.value) || 1 }))}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={config.approvalsEnabled}
          onChange={(event) => setConfig((current) => ({ ...current, approvalsEnabled: event.target.checked }))}
        />
        Require admin approvals
      </label>

      <label>
        Requisition mode
        <select
          data-testid="hiring-flow-requisition-mode"
          value={config.requisitionMode}
          onChange={(event) =>
            setConfig((current) => ({ ...current, requisitionMode: event.target.value as typeof current.requisitionMode }))
          }
        >
          <option value="disabled">Disabled</option>
          <option value="optional">Optional</option>
          <option value="required">Required</option>
        </select>
      </label>

      <label>
        <input
          data-testid="hiring-flow-simulate-failure"
          type="checkbox"
          checked={config.simulateSubmissionFailure}
          onChange={(event) => setConfig((current) => ({ ...current, simulateSubmissionFailure: event.target.checked }))}
        />
        Simulate recoverable save failure
      </label>

      <button type="button" data-testid="hiring-flow-save-button" onClick={handleSave}>
        Save hiring flow settings
      </button>

      {mutationState.kind === 'submission-error' ? (
        <button type="button" data-testid="hiring-flow-retry-button" onClick={handleSave}>
          Retry save
        </button>
      ) : null}

      <p data-testid="hiring-flow-mutation-state">{mutationState.kind}</p>
      <pre data-testid="hiring-flow-request-headers">
        {JSON.stringify('requestHeaders' in mutationState ? mutationState.requestHeaders : {}, null, 2)}
      </pre>
    </section>
  );
}
