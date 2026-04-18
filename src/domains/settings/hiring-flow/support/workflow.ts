import {
  resolveOperationalSettingsReadiness,
  runOperationalSettingsMutation,
} from '../../operational/support/workflow';
import type { OperationalSettingsMutationState, OperationalSettingsReadiness } from '../../operational/support/models';
import type { HiringFlowSettingsConfigView } from './models';
import { saveHiringFlowSettingsConfig } from './store';

export type HiringFlowSettingsSaveResult = {
  state: OperationalSettingsMutationState;
  readiness: OperationalSettingsReadiness;
  config?: HiringFlowSettingsConfigView;
};

export async function runHiringFlowSettingsSave(config: HiringFlowSettingsConfigView): Promise<HiringFlowSettingsSaveResult> {
  const result = await runOperationalSettingsMutation({
    method: 'PUT',
    execute: async () => {
      if (config.simulateSubmissionFailure) {
        return { ok: false as const, type: 'submission' as const, reason: 'Workflow settings update failed. Retry is available.' };
      }

      if (config.workflowName.trim().length === 0) {
        return { ok: false as const, type: 'validation' as const, fieldErrors: ['workflowName'] };
      }

      const savedConfig = { ...config, workflowName: config.workflowName.trim(), defaultStageName: config.defaultStageName.trim() || 'Screening' };
      saveHiringFlowSettingsConfig(savedConfig);
      return { ok: true as const, outcome: 'stable' as const, value: savedConfig };
    },
  });

  if (result.state.kind === 'submission-error') {
    return {
      state: result.state,
      readiness: resolveOperationalSettingsReadiness({ isRetryableError: true, reason: result.state.reason }),
    };
  }

  return {
    state: result.state,
    readiness: resolveOperationalSettingsReadiness({}),
    config: result.value,
  };
}
