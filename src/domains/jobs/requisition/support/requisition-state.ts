import { buildHrisRequisitionOperationalState, buildOperationalGateInput, evaluateOperationalReadinessGate } from '../../../integrations/support';
import type { HrisRequisitionOperationalState, IntegrationProviderReadinessSignal, OperationalReadinessGateResult } from '../../../integrations/support';
export type RequisitionAuthoringStateKind =
  | 'draft'
  | 'saving'
  | 'saved'
  | 'submitting'
  | 'submitted'
  | 'validation-error'
  | 'recoverable-failure'
  | 'stale-workflow'
  | 'workflow-drift';

export type WorkflowDriftReason = 'removed-stage' | 'changed-required-fields' | 'reassigned-approval' | 'stale-workflow';

export type RequisitionAuthoringState = {
  kind: RequisitionAuthoringStateKind;
  workflowUuid?: string;
  stageUuid?: string;
  parentTarget: '/jobs/open' | '/dashboard';
  saveMode: 'explicit-save';
  autosave: 'not-enabled';
  canRetry: boolean;
  dataLossWarning: boolean;
  driftReason?: WorkflowDriftReason;
  readinessGate?: OperationalReadinessGateResult;
  hrisOperationalState?: HrisRequisitionOperationalState;
};

export function buildRequisitionDraftState(options: { workflowUuid?: string; stageUuid?: string } = {}): RequisitionAuthoringState {
  return baseState('draft', options, false);
}

export function buildRequisitionMutationState(
  kind: Extract<RequisitionAuthoringStateKind, 'saving' | 'saved' | 'submitting' | 'submitted' | 'validation-error' | 'recoverable-failure'>,
  options: { workflowUuid?: string; stageUuid?: string } = {},
): RequisitionAuthoringState {
  return baseState(kind, options, kind === 'recoverable-failure');
}

export function buildWorkflowDriftState(reason: WorkflowDriftReason, options: { workflowUuid?: string; stageUuid?: string } = {}): RequisitionAuthoringState {
  return { ...baseState(reason === 'stale-workflow' ? 'stale-workflow' : 'workflow-drift', options, true), driftReason: reason };
}

function baseState(
  kind: RequisitionAuthoringStateKind,
  options: { workflowUuid?: string; stageUuid?: string },
  canRetry: boolean,
): RequisitionAuthoringState {
  return {
    kind,
    workflowUuid: options.workflowUuid,
    stageUuid: options.stageUuid,
    parentTarget: options.workflowUuid ? '/jobs/open' : '/dashboard',
    saveMode: 'explicit-save',
    autosave: 'not-enabled',
    canRetry,
    dataLossWarning: kind === 'draft' || kind === 'validation-error' || kind === 'recoverable-failure',
  };
}


export function buildRequisitionHrisReadinessState(
  signal: IntegrationProviderReadinessSignal,
  options: { workflowUuid?: string; stageUuid?: string; mappingStatus?: 'complete' | 'required' | 'drift'; syncStatus?: 'idle' | 'pending' | 'degraded' | 'failed' | 'retrying' | 'synced' } = {},
): RequisitionAuthoringState {
  const readinessGate = evaluateOperationalReadinessGate(buildOperationalGateInput(signal, 'hris-workflow'));
  const hrisOperationalState = buildHrisRequisitionOperationalState({
    routeFamily: options.workflowUuid ? 'requisition-workflow' : 'requisition-authoring',
    gate: readinessGate,
    mappingStatus: options.mappingStatus,
    syncStatus: options.syncStatus,
  });

  return {
    ...baseState(hrisOperationalState.canProceed ? 'draft' : 'recoverable-failure', options, !hrisOperationalState.canProceed),
    readinessGate,
    hrisOperationalState,
  };
}

export function resolveRequisitionWorkflowAndHrisState(input: {
  workflowDrift?: RequisitionAuthoringState;
  hrisState: RequisitionAuthoringState;
}):
  | { authority: 'workflow-drift'; workflowDrift: RequisitionAuthoringState }
  | { authority: 'hris-operational'; hrisState: RequisitionAuthoringState } {
  if (input.workflowDrift) return { authority: 'workflow-drift', workflowDrift: input.workflowDrift };
  return { authority: 'hris-operational', hrisState: input.hrisState };
}
