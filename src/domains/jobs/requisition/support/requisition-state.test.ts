import { buildProviderReadinessSignals } from '../../../integrations/support';
import { buildRequisitionDraftState, buildRequisitionHrisReadinessState, buildRequisitionMutationState, buildWorkflowDriftState, resolveRequisitionWorkflowAndHrisState } from './requisition-state';

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

  it('models HRIS readiness without replacing workflow drift handling', () => {
    const [signal] = buildProviderReadinessSignals({ id: 'workday', name: 'Workday', family: 'hris', state: 'reauth_required' });
    const state = buildRequisitionHrisReadinessState(signal, { workflowUuid: 'workflow-1' });

    expect(state).toMatchObject({ kind: 'recoverable-failure', parentTarget: '/jobs/open' });
    expect(state.readinessGate).toMatchObject({ state: 'blocked', canProceed: false });
    expect(state.hrisOperationalState).toMatchObject({ kind: 'auth-required', routeFamily: 'requisition-workflow' });
    expect(buildWorkflowDriftState('removed-stage', { workflowUuid: 'workflow-1' })).toMatchObject({ kind: 'workflow-drift' });
  });

  it('preserves workflow drift precedence when HRIS is otherwise ready', () => {
    const [signal] = buildProviderReadinessSignals({ id: 'workday', name: 'Workday', family: 'hris', state: 'connected' });
    const hrisState = buildRequisitionHrisReadinessState(signal, { workflowUuid: 'workflow-1', syncStatus: 'synced' });
    const workflowDrift = buildWorkflowDriftState('changed-required-fields', { workflowUuid: 'workflow-1' });

    expect(resolveRequisitionWorkflowAndHrisState({ workflowDrift, hrisState })).toEqual({ authority: 'workflow-drift', workflowDrift });
  });

  it('keeps build requisition HRIS failures on the dashboard fallback', () => {
    const [signal] = buildProviderReadinessSignals({ id: 'workday', name: 'Workday', family: 'hris', state: 'reauth_required' });
    expect(buildRequisitionHrisReadinessState(signal)).toMatchObject({
      parentTarget: '/dashboard',
      hrisOperationalState: { kind: 'auth-required', routeFamily: 'requisition-authoring' },
    });
  });
});
