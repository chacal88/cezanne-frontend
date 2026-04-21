import type { FormsDocsSettingsConfigView } from './models';

const formsDocsSettingsKey = 'settings-forms-docs-config';
let formsDocsSettingsMemory: FormsDocsSettingsConfigView | null = null;

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getDefaultFormsDocsSettingsConfig(): FormsDocsSettingsConfigView {
  return {
    schemaId: 'forms-docs-fixture-v1',
    source: 'fixture-adapter',
    version: 1,
    requestedDocuments: [
      { id: 'cv', label: 'CV', consumer: 'candidate-documents', required: true },
      { id: 'portfolio', label: 'Portfolio or certificate', consumer: 'public-application', required: false },
      { id: 'signed-form', label: 'Signed onboarding form', consumer: 'integration-forms', required: false },
    ],
    publicUploadsEnabled: true,
    candidateRefreshMode: 'after-save',
    publicRefreshMode: 'after-save',
    simulateEmpty: false,
    simulateUnavailable: false,
    simulateStale: false,
    simulateDegraded: false,
    simulateSaveFailure: false,
  };
}

export function getFormsDocsSettingsConfig(): FormsDocsSettingsConfigView {
  formsDocsSettingsMemory = formsDocsSettingsMemory ?? readStorage<FormsDocsSettingsConfigView>(formsDocsSettingsKey) ?? getDefaultFormsDocsSettingsConfig();
  return formsDocsSettingsMemory;
}

export function saveFormsDocsSettingsConfig(config: FormsDocsSettingsConfigView) {
  formsDocsSettingsMemory = config;
  writeStorage(formsDocsSettingsKey, config);
}
