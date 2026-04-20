import { resolveOperationalSettingsReadiness, runOperationalSettingsMutation } from '../../operational/support/workflow';
import type { OperationalSettingsMutationState, OperationalSettingsReadiness } from '../../operational/support/models';
import type { RejectReasonsSettingsConfigView } from './models';
import { saveRejectReasonsSettingsConfig } from './store';

export type RejectReasonsSettingsSaveResult = {
  state: OperationalSettingsMutationState;
  readiness: OperationalSettingsReadiness;
  config?: RejectReasonsSettingsConfigView;
};

export async function runRejectReasonsSettingsSave(config: RejectReasonsSettingsConfigView): Promise<RejectReasonsSettingsSaveResult> {
  const result = await runOperationalSettingsMutation({
    method: 'PUT',
    execute: async () => {
      if (config.simulateSubmissionFailure) {
        return { ok: false as const, type: 'submission' as const, reason: 'Reject-reasons update failed. Retry is available.' };
      }

      if (config.reasons.some((reason) => reason.label.trim().length === 0)) {
        return { ok: false as const, type: 'validation' as const, fieldErrors: ['reasons.label'] };
      }

      const savedConfig = {
        ...config,
        reasons: config.reasons.map((reason) => ({ ...reason, label: reason.label.trim() })),
      };
      saveRejectReasonsSettingsConfig(savedConfig);
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
