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
