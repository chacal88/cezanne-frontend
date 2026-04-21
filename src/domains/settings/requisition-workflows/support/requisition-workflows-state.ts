import { buildHrisRequisitionOperationalState, buildOperationalGateInput, evaluateOperationalReadinessGate } from '../../../integrations/support';
import type { HrisRequisitionOperationalState, IntegrationProviderReadinessSignal, OperationalReadinessGateResult } from '../../../integrations/support';
export type RequisitionWorkflowSettingsStateKind = 'ready' | 'loading' | 'empty' | 'saving' | 'saved' | 'error' | 'denied' | 'stale-workflow';

export type RequisitionWorkflowSettingsState = {
  kind: RequisitionWorkflowSettingsStateKind;
  owner: 'settings.hiring-flow';
  executionOwner: 'jobs.workflow-state';
  parentTarget: '/settings/hiring-flow';
  activeExecutionState: false;
  canRetry: boolean;
  readinessGate?: OperationalReadinessGateResult;
  hrisOperationalState?: HrisRequisitionOperationalState;
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


export function buildRequisitionWorkflowHrisReadinessState(
  signal: IntegrationProviderReadinessSignal,
  options: { mappingStatus?: 'complete' | 'required' | 'drift'; syncStatus?: 'idle' | 'pending' | 'degraded' | 'failed' | 'retrying' | 'synced' } = {},
): RequisitionWorkflowSettingsState {
  const readinessGate = evaluateOperationalReadinessGate(buildOperationalGateInput(signal, 'hris-workflow'));
  const hrisOperationalState = buildHrisRequisitionOperationalState({
    routeFamily: 'requisition-workflows-settings',
    gate: readinessGate,
    mappingStatus: options.mappingStatus,
    syncStatus: options.syncStatus,
  });

  return {
    ...buildRequisitionWorkflowSettingsState(hrisOperationalState.canProceed ? 'ready' : 'error'),
    readinessGate,
    hrisOperationalState,
  };
}
