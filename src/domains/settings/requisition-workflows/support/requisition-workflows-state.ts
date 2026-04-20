export type RequisitionWorkflowSettingsStateKind = 'ready' | 'loading' | 'empty' | 'saving' | 'saved' | 'error' | 'denied' | 'stale-workflow';

export type RequisitionWorkflowSettingsState = {
  kind: RequisitionWorkflowSettingsStateKind;
  owner: 'settings.hiring-flow';
  executionOwner: 'jobs.workflow-state';
  parentTarget: '/settings/hiring-flow';
  activeExecutionState: false;
  canRetry: boolean;
};

export function buildRequisitionWorkflowSettingsState(kind: RequisitionWorkflowSettingsStateKind = 'ready'): RequisitionWorkflowSettingsState {
  return {
    kind,
    owner: 'settings.hiring-flow',
    executionOwner: 'jobs.workflow-state',
    parentTarget: '/settings/hiring-flow',
    activeExecutionState: false,
    canRetry: kind === 'error' || kind === 'stale-workflow',
  };
}
