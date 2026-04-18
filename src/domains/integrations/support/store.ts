import type { IntegrationCompletionState, IntegrationFormsDraft } from './models';

const cvCompletions = new Map<string, IntegrationCompletionState>();
const formsCompletions = new Map<string, IntegrationCompletionState>();
const formsDrafts = new Map<string, IntegrationFormsDraft>();

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getIntegrationCvCompletion(token: string) {
  return cvCompletions.get(token) ?? readStorage<IntegrationCompletionState>(`integration-cv-completion:${token}`) ?? null;
}

export function saveIntegrationCvCompletion(token: string, completion: IntegrationCompletionState) {
  cvCompletions.set(token, completion);
  writeStorage(`integration-cv-completion:${token}`, completion);
}

export function getIntegrationFormsCompletion(token: string) {
  return formsCompletions.get(token) ?? readStorage<IntegrationCompletionState>(`integration-forms-completion:${token}`) ?? null;
}

export function saveIntegrationFormsCompletion(token: string, completion: IntegrationCompletionState) {
  formsCompletions.set(token, completion);
  writeStorage(`integration-forms-completion:${token}`, completion);
}

export function getIntegrationFormsDraft(token: string) {
  return formsDrafts.get(token) ?? readStorage<IntegrationFormsDraft>(`integration-forms-draft:${token}`) ?? { answers: [] };
}

export function saveIntegrationFormsDraft(token: string, draft: IntegrationFormsDraft) {
  formsDrafts.set(token, draft);
  writeStorage(`integration-forms-draft:${token}`, draft);
}
