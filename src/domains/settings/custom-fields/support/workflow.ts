import { resolveOperationalSettingsReadiness, runOperationalSettingsMutation } from '../../operational/support/workflow';
import type { OperationalSettingsMutationState, OperationalSettingsReadiness } from '../../operational/support/models';
import type { CustomFieldsSettingsConfigView } from './models';
import { saveCustomFieldsSettingsConfig } from './store';

export type CustomFieldsSettingsSaveResult = {
  state: OperationalSettingsMutationState;
  readiness: OperationalSettingsReadiness;
  config?: CustomFieldsSettingsConfigView;
};

export async function runCustomFieldsSettingsSave(config: CustomFieldsSettingsConfigView): Promise<CustomFieldsSettingsSaveResult> {
  const result = await runOperationalSettingsMutation({
    method: 'PUT',
    execute: async () => {
      if (config.simulateSubmissionFailure) {
        return { ok: false as const, type: 'submission' as const, reason: 'Custom-fields settings update failed. Retry is available.' };
      }

      if (config.fields.some((field) => field.label.trim().length === 0)) {
        return { ok: false as const, type: 'validation' as const, fieldErrors: ['fields.label'] };
      }

      const savedConfig = {
        ...config,
        fields: config.fields.map((field) => ({ ...field, label: field.label.trim() })),
      };
      saveCustomFieldsSettingsConfig(savedConfig);
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
