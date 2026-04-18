import { resolveOperationalSettingsReadiness, runOperationalSettingsMutation } from '../../operational/support/workflow';
import type { OperationalSettingsMutationState, OperationalSettingsReadiness } from '../../operational/support/models';
import type { TemplatesSettingsConfigView } from './models';
import { saveTemplatesSettingsConfig } from './store';

export type TemplatesSettingsSaveResult = {
  state: OperationalSettingsMutationState;
  readiness: OperationalSettingsReadiness;
  config?: TemplatesSettingsConfigView;
};

export async function runTemplatesSettingsSave(config: TemplatesSettingsConfigView): Promise<TemplatesSettingsSaveResult> {
  const result = await runOperationalSettingsMutation({
    method: 'PUT',
    execute: async () => {
      if (config.simulateSubmissionFailure) {
        return { ok: false as const, type: 'submission' as const, reason: 'Templates settings update failed. Retry is available.' };
      }

      if (config.summaries.some((summary) => summary.title.trim().length === 0)) {
        return { ok: false as const, type: 'validation' as const, fieldErrors: ['summaries.title'] };
      }

      const savedConfig = {
        ...config,
        summaries: config.summaries.map((summary) => ({ ...summary, title: summary.title.trim() })),
      };
      saveTemplatesSettingsConfig(savedConfig);
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
