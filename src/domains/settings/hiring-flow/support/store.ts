import type { HiringFlowSettingsConfigView } from './models';

const hiringFlowSettingsKey = 'settings-hiring-flow-config';
let hiringFlowSettingsMemory: HiringFlowSettingsConfigView | null = null;

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function defaultHiringFlowSettings(): HiringFlowSettingsConfigView {
  return {
    workflowId: 'workflow-default',
    workflowName: 'Default hiring workflow',
    defaultStageName: 'Screening',
    stageCount: 4,
    approvalsEnabled: false,
    requisitionMode: 'optional',
    simulateSubmissionFailure: false,
  };
}

export function getHiringFlowSettingsConfig(): HiringFlowSettingsConfigView {
  hiringFlowSettingsMemory = hiringFlowSettingsMemory ?? readStorage<HiringFlowSettingsConfigView>(hiringFlowSettingsKey) ?? defaultHiringFlowSettings();
  return hiringFlowSettingsMemory;
}

export function saveHiringFlowSettingsConfig(config: HiringFlowSettingsConfigView) {
  hiringFlowSettingsMemory = config;
  writeStorage(hiringFlowSettingsKey, config);
}
