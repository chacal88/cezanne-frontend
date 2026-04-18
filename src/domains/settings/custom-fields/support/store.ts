import type { CustomFieldsSettingsConfigView } from './models';

const customFieldsSettingsKey = 'settings-custom-fields-config';
let customFieldsSettingsMemory: CustomFieldsSettingsConfigView | null = null;

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function defaultCustomFieldsSettings(): CustomFieldsSettingsConfigView {
  return {
    schemaId: 'custom-fields-default',
    fields: [
      { id: 'preferred-shift', label: 'Preferred shift', scope: 'candidate', required: false },
      { id: 'portfolio-url', label: 'Portfolio URL', scope: 'public-application', required: true },
    ],
    simulateSubmissionFailure: false,
  };
}

export function getCustomFieldsSettingsConfig(): CustomFieldsSettingsConfigView {
  customFieldsSettingsMemory = customFieldsSettingsMemory ?? readStorage<CustomFieldsSettingsConfigView>(customFieldsSettingsKey) ?? defaultCustomFieldsSettings();
  return customFieldsSettingsMemory;
}

export function saveCustomFieldsSettingsConfig(config: CustomFieldsSettingsConfigView) {
  customFieldsSettingsMemory = config;
  writeStorage(customFieldsSettingsKey, config);
}
