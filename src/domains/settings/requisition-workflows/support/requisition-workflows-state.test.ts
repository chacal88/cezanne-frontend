import { buildProviderReadinessSignals } from '../../../integrations/support';
import { buildRequisitionWorkflowHrisReadinessState, buildRequisitionWorkflowSettingsState } from './requisition-workflows-state';

describe('requisition workflows settings state', () => {
  it('keeps workflow configuration in settings and execution in jobs', () => {
    expect(buildRequisitionWorkflowSettingsState()).toMatchObject({
      owner: 'settings.hiring-flow',
      executionOwner: 'jobs.workflow-state',
      parentTarget: '/settings/hiring-flow',
      activeExecutionState: false,
    });
  });

  it('allows retry for stale workflow settings states', () => {
    expect(buildRequisitionWorkflowSettingsState('stale-workflow')).toMatchObject({ kind: 'stale-workflow', canRetry: true });
  });

  it('exposes HRIS readiness gates while keeping settings ownership', () => {
    const [signal] = buildProviderReadinessSignals({ id: 'workday', name: 'Workday', family: 'hris', state: 'reauth_required' });
    expect(buildRequisitionWorkflowHrisReadinessState(signal)).toMatchObject({
      owner: 'settings.hiring-flow',
      executionOwner: 'jobs.workflow-state',
      activeExecutionState: false,
      readinessGate: { state: 'blocked', canProceed: false },
      hrisOperationalState: { kind: 'auth-required', routeFamily: 'requisition-workflows-settings' },
    });
  });

  it('shows HRIS mapping drift as administration readiness without submission behavior', () => {
    const [signal] = buildProviderReadinessSignals({ id: 'workday', name: 'Workday', family: 'hris', state: 'connected' });
    expect(buildRequisitionWorkflowHrisReadinessState(signal, { mappingStatus: 'drift' })).toMatchObject({
      kind: 'error',
      activeExecutionState: false,
      hrisOperationalState: { kind: 'mapping-drift', recoveryTargetType: 'workflow-admin' },
    });
  });
});
