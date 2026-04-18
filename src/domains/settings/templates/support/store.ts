import type { TemplatesSettingsConfigView } from './models';

const templatesSettingsKey = 'settings-templates-config';
let templatesSettingsMemory: TemplatesSettingsConfigView | null = null;

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function defaultTemplatesSettings(): TemplatesSettingsConfigView {
  return {
    summaries: [
      { id: 'template-1', title: 'Default email template' },
      { id: 'template-2', title: 'Interview reminder template' },
    ],
    smartQuestionsTitle: 'Smart questions',
    diversityQuestionsTitle: 'Diversity questions',
    interviewScoringTitle: 'Interview scoring',
    simulateSubmissionFailure: false,
  };
}

export function getTemplatesSettingsConfig(): TemplatesSettingsConfigView {
  templatesSettingsMemory = templatesSettingsMemory ?? readStorage<TemplatesSettingsConfigView>(templatesSettingsKey) ?? defaultTemplatesSettings();
  return templatesSettingsMemory;
}

export function saveTemplatesSettingsConfig(config: TemplatesSettingsConfigView) {
  templatesSettingsMemory = config;
  writeStorage(templatesSettingsKey, config);
}
