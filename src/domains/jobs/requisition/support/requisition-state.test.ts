import { buildRequisitionDraftState, buildRequisitionMutationState, buildWorkflowDriftState } from './requisition-state';

describe('requisition authoring state', () => {
  it('models local draft state with explicit save and data-loss warning', () => {
    expect(buildRequisitionDraftState()).toMatchObject({
      kind: 'draft',
      parentTarget: '/dashboard',
      saveMode: 'explicit-save',
      autosave: 'not-enabled',
      dataLossWarning: true,
    });
  });

  it('models recoverable save failures with retry', () => {
    expect(buildRequisitionMutationState('recoverable-failure', { workflowUuid: 'workflow-1' })).toMatchObject({
      kind: 'recoverable-failure',
      workflowUuid: 'workflow-1',
      parentTarget: '/jobs/open',
      canRetry: true,
    });
  });

  it('models workflow drift separately from generic errors', () => {
    expect(buildWorkflowDriftState('removed-stage', { workflowUuid: 'workflow-1', stageUuid: 'stage-1' })).toMatchObject({
      kind: 'workflow-drift',
      driftReason: 'removed-stage',
      canRetry: true,
    });
  });
});
