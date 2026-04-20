import type { RejectReasonsSettingsConfigView } from './models';

const rejectReasonsSettingsKey = 'settings-reject-reasons-config';
let rejectReasonsSettingsMemory: RejectReasonsSettingsConfigView | null = null;

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function defaultRejectReasonsSettings(): RejectReasonsSettingsConfigView {
  return {
    reasons: [
      { id: 'reason-1', label: 'Missing required skills', active: true },
      { id: 'reason-2', label: 'Salary mismatch', active: true },
    ],
    simulateSubmissionFailure: false,
  };
}

export function getRejectReasonsSettingsConfig(): RejectReasonsSettingsConfigView {
  rejectReasonsSettingsMemory =
    rejectReasonsSettingsMemory ?? readStorage<RejectReasonsSettingsConfigView>(rejectReasonsSettingsKey) ?? defaultRejectReasonsSettings();
  return rejectReasonsSettingsMemory;
}

export function saveRejectReasonsSettingsConfig(config: RejectReasonsSettingsConfigView) {
  rejectReasonsSettingsMemory = config;
  writeStorage(rejectReasonsSettingsKey, config);
}
