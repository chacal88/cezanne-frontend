import { resetCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildProviderReadinessSignals } from './admin-state';
import { buildOperationalGateInput, evaluateOperationalReadinessGate } from './operational-readiness-gates';
import {
  buildHrisRequisitionOperationalState,
  buildHrisRequisitionTelemetry,
  resolveHrisWorkflowDriftPriority,
  runHrisRequisitionSyncAction,
} from './hris-requisition-operational-state';

describe('HRIS requisition operational state', () => {
  it('models ready, mapping, sync, provider, unavailable, and unimplemented outcomes without raw provider data', () => {
    const [readySignal] = buildProviderReadinessSignals({ id: 'workday', name: 'Workday', family: 'hris', state: 'connected' });
    const readyGate = evaluateOperationalReadinessGate(buildOperationalGateInput(readySignal, 'hris-workflow'));

    expect(buildHrisRequisitionOperationalState({ routeFamily: 'requisition-authoring', gate: readyGate })).toMatchObject({ kind: 'ready', canProceed: true });
    expect(buildHrisRequisitionOperationalState({ routeFamily: 'requisition-workflow', gate: readyGate, mappingStatus: 'required' })).toMatchObject({
      kind: 'mapping-required',
      driftType: 'mapping',
      recoveryTargetType: 'workflow-admin',
    });
    expect(buildHrisRequisitionOperationalState({ routeFamily: 'requisition-workflow', gate: readyGate, mappingStatus: 'drift' })).toMatchObject({ kind: 'mapping-drift' });
    expect(buildHrisRequisitionOperationalState({ routeFamily: 'requisition-workflow', gate: readyGate, syncStatus: 'pending' })).toMatchObject({ kind: 'sync-pending' });
    expect(buildHrisRequisitionOperationalState({ routeFamily: 'requisition-workflow', gate: readyGate, syncStatus: 'failed' })).toMatchObject({ kind: 'sync-failed' });
    expect(buildHrisRequisitionOperationalState({ routeFamily: 'requisition-workflow', gate: readyGate, syncStatus: 'synced' })).toMatchObject({ kind: 'synced', canProceed: true });

    const [blockedSignal] = buildProviderReadinessSignals({ id: 'workday', name: 'Workday', family: 'hris', state: 'reauth_required' });
    const blockedGate = evaluateOperationalReadinessGate(buildOperationalGateInput(blockedSignal, 'hris-workflow'));
    expect(buildHrisRequisitionOperationalState({ routeFamily: 'requisition-workflow', gate: blockedGate })).toMatchObject({ kind: 'auth-required', recoveryTargetType: 'provider-setup' });
    expect(buildHrisRequisitionOperationalState({ routeFamily: 'requisition-workflow', gate: blockedGate, blockedReason: 'provider' })).toMatchObject({ kind: 'provider-blocked' });

    const [unavailableSignal] = buildProviderReadinessSignals({ id: 'workday', name: 'Workday', family: 'hris', state: 'unavailable' });
    expect(buildHrisRequisitionOperationalState({ routeFamily: 'requisition-workflow', gate: evaluateOperationalReadinessGate(buildOperationalGateInput(unavailableSignal, 'hris-workflow')) })).toMatchObject({
      kind: 'unavailable',
    });

    const [customSignal] = buildProviderReadinessSignals({ id: 'custom-provider', name: 'Custom provider', family: 'custom', state: 'unavailable' });
    expect(buildHrisRequisitionOperationalState({ routeFamily: 'requisition-workflow', gate: evaluateOperationalReadinessGate(buildOperationalGateInput(customSignal, 'hris-workflow')) })).toMatchObject({
      kind: 'unimplemented',
    });
  });

  it('keeps workflow drift authoritative over HRIS-ready success', () => {
    const hrisState = buildHrisRequisitionOperationalState({ routeFamily: 'requisition-workflow', syncStatus: 'synced' });
    expect(resolveHrisWorkflowDriftPriority({ workflowDrift: { kind: 'workflow-drift', driftReason: 'removed-stage' }, hrisState })).toEqual({
      authority: 'workflow-drift',
      workflowDrift: { kind: 'workflow-drift', driftReason: 'removed-stage' },
    });
  });

  it('models retry, blocked, failed, synced, and remediation results with safe telemetry', () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_hris_requisition');
    const readyState = buildHrisRequisitionOperationalState({ routeFamily: 'requisition-authoring' });
    const mappingState = buildHrisRequisitionOperationalState({ routeFamily: 'requisition-workflow', mappingStatus: 'drift' });

    expect(runHrisRequisitionSyncAction(mappingState, 'sync-intent')).toMatchObject({ status: 'blocked-action', operationalState: { kind: 'mapping-drift' } });
    expect(runHrisRequisitionSyncAction(mappingState, 'remediation')).toMatchObject({ status: 'remediation' });
    expect(runHrisRequisitionSyncAction(readyState, 'sync-retry')).toMatchObject({ status: 'retrying', operationalState: { kind: 'retrying' } });
    expect(runHrisRequisitionSyncAction(readyState, 'sync-intent', { forceFailure: true })).toMatchObject({ status: 'failed', operationalState: { kind: 'sync-failed' } });
    const synced = runHrisRequisitionSyncAction(readyState, 'sync-intent');

    expect(synced).toMatchObject({ status: 'synced', operationalState: { kind: 'synced' } });
    expect(synced.telemetry.data).toEqual({
      routeFamily: 'requisition-authoring',
      action: 'sync-intent',
      hrisState: 'synced',
      readinessOutcome: undefined,
      recoveryTargetType: 'none',
      driftType: 'none',
      correlationId: 'corr_hris_requisition',
    });
    expect(JSON.stringify(buildHrisRequisitionTelemetry('mapping-drift', mappingState).data)).not.toMatch(/oauth|secret|token|raw|tenant|diagnostic|mappingPayload/i);
  });
});
