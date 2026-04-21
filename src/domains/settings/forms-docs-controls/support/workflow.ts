import { runOperationalSettingsMutation } from '../../operational/support/workflow';
import type { FormsDocsSettingsConfigView, FormsDocsSettingsMutationState } from './models';
import { buildFormsDocsSettingsViewState } from './state';
import { saveFormsDocsSettingsConfig } from './store';

export type FormsDocsSettingsSaveResult = ReturnType<typeof buildFormsDocsSettingsViewState>;

export async function runFormsDocsSettingsSave(config: FormsDocsSettingsConfigView): Promise<FormsDocsSettingsSaveResult> {
  const result = await runOperationalSettingsMutation({
    method: 'PUT',
    execute: async () => {
      if (config.simulateSaveFailure) {
        return { ok: false as const, type: 'submission' as const, reason: 'Forms/docs settings update failed. Retry is available.' };
      }

      if (config.requestedDocuments.some((document) => document.label.trim().length === 0)) {
        return { ok: false as const, type: 'validation' as const, fieldErrors: ['requestedDocuments.label'] };
      }

      const savedConfig: FormsDocsSettingsConfigView = {
        ...config,
        version: config.version + 1,
        simulateStale: false,
        requestedDocuments: config.requestedDocuments.map((document) => ({ ...document, label: document.label.trim() })),
      };
      saveFormsDocsSettingsConfig(savedConfig);
      return { ok: true as const, outcome: 'refresh-required' as const, value: savedConfig };
    },
  });

  if (result.state.kind === 'submission-error') {
    const mutation: FormsDocsSettingsMutationState = { kind: 'retry', canRetry: true, reason: result.state.reason, requestHeaders: result.state.requestHeaders };
    return buildFormsDocsSettingsViewState(config, mutation);
  }

  if (result.state.kind === 'validation-error') {
    const mutation: FormsDocsSettingsMutationState = { kind: 'validation-error', canRetry: false, fieldErrors: result.state.fieldErrors, requestHeaders: result.state.requestHeaders };
    return buildFormsDocsSettingsViewState(config, mutation);
  }

  const savedConfig = result.value ?? config;
  const mutation: FormsDocsSettingsMutationState =
    result.state.kind === 'success'
      ? { kind: 'success', canRetry: false, outcome: result.state.outcome, requestHeaders: result.state.requestHeaders }
      : { kind: 'idle', canRetry: false };
  return buildFormsDocsSettingsViewState(savedConfig, mutation);
}
