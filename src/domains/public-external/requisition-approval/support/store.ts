import type { RequisitionApprovalResolution } from './models';

const approvalResolutions = new Map<string, Exclude<RequisitionApprovalResolution, null>>();

function storageKey(token: string) {
  return `requisition-approval-resolution:${token}`;
}

function readStorage(token: string): RequisitionApprovalResolution {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(storageKey(token));
  return value ? (JSON.parse(value) as Exclude<RequisitionApprovalResolution, null>) : null;
}

function writeStorage(token: string, value: Exclude<RequisitionApprovalResolution, null>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(token), JSON.stringify(value));
}

export function getRequisitionApprovalResolution(token: string): RequisitionApprovalResolution {
  return approvalResolutions.get(token) ?? readStorage(token);
}

export function saveTerminalApprovalResolution(token: string, terminalState: 'approved' | 'rejected') {
  const resolution = { kind: 'terminal', terminalState } as const;
  approvalResolutions.set(token, resolution);
  writeStorage(token, resolution);
}

export function saveWorkflowDriftResolution(token: string, reason: string) {
  const resolution = { kind: 'workflow-drift', reason } as const;
  approvalResolutions.set(token, resolution);
  writeStorage(token, resolution);
}

export function resetRequisitionApprovalResolutions() {
  approvalResolutions.clear();
  if (typeof window === 'undefined') return;
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith('requisition-approval-resolution:'))
    .forEach((key) => window.localStorage.removeItem(key));
}
