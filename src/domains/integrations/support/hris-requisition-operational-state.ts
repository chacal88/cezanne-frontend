import { ensureCorrelationId } from '../../../lib/observability';
import type { OperationalReadinessGateResult, OperationalReadinessGateState } from './operational-readiness-gates';

export type HrisRequisitionRouteFamily = 'requisition-authoring' | 'requisition-workflow' | 'requisition-workflows-settings';
export type HrisRequisitionOperationalStateKind =
  | 'ready'
  | 'mapping-required'
  | 'mapping-drift'
  | 'sync-pending'
  | 'sync-degraded'
  | 'sync-failed'
  | 'retrying'
  | 'synced'
  | 'auth-required'
  | 'provider-blocked'
  | 'unavailable'
  | 'unimplemented';
export type HrisRequisitionMappingStatus = 'complete' | 'required' | 'drift';
export type HrisRequisitionSyncStatus = 'idle' | 'pending' | 'degraded' | 'failed' | 'retrying' | 'synced';
export type HrisRequisitionDriftType = 'none' | 'mapping' | 'workflow';
export type HrisRequisitionRecoveryTargetType = 'provider-setup' | 'route-local' | 'workflow-admin' | 'none';
export type HrisRequisitionAction = 'readiness-evaluated' | 'sync-intent' | 'sync-retry' | 'mapping-drift' | 'blocked-action' | 'remediation';

export type HrisRequisitionOperationalState = {
  kind: HrisRequisitionOperationalStateKind;
  routeFamily: HrisRequisitionRouteFamily;
  canProceed: boolean;
  message: string;
  readinessOutcome?: OperationalReadinessGateState;
  recoveryTargetType: HrisRequisitionRecoveryTargetType;
  driftType: HrisRequisitionDriftType;
};

export type HrisRequisitionTelemetryEvent = {
  name: 'hris_requisition_sync_action';
  data: {
    routeFamily: HrisRequisitionRouteFamily;
    action: HrisRequisitionAction;
    hrisState: HrisRequisitionOperationalStateKind;
    readinessOutcome?: OperationalReadinessGateState;
    recoveryTargetType: HrisRequisitionRecoveryTargetType;
    driftType: HrisRequisitionDriftType;
    correlationId: string;
  };
};

export type HrisRequisitionSyncResult = {
  status: 'blocked-action' | 'retrying' | 'failed' | 'synced' | 'remediation';
  operationalState: HrisRequisitionOperationalState;
  telemetry: HrisRequisitionTelemetryEvent;
};

function recoveryTargetFor(kind: HrisRequisitionOperationalStateKind, gate?: OperationalReadinessGateResult): HrisRequisitionRecoveryTargetType {
  if (gate?.setupTarget && (kind === 'auth-required' || kind === 'provider-blocked' || kind === 'sync-degraded')) return 'provider-setup';
  if (kind === 'mapping-required' || kind === 'mapping-drift') return 'workflow-admin';
  if (kind === 'ready' || kind === 'synced') return 'none';
  return 'route-local';
}

function messageFor(kind: HrisRequisitionOperationalStateKind): string {
  const messages: Record<HrisRequisitionOperationalStateKind, string> = {
    ready: 'HRIS requisition workflow is ready.',
    'mapping-required': 'Complete HRIS requisition mapping before continuing.',
    'mapping-drift': 'Repair stale HRIS requisition mapping before continuing.',
    'sync-pending': 'HRIS requisition sync is pending.',
    'sync-degraded': 'HRIS requisition sync is degraded and needs remediation.',
    'sync-failed': 'HRIS requisition sync failed and can be retried.',
    retrying: 'HRIS requisition sync retry is in progress.',
    synced: 'HRIS requisition sync completed.',
    'auth-required': 'HRIS authorization is required before requisition sync can continue.',
    'provider-blocked': 'HRIS provider setup blocks requisition sync.',
    unavailable: 'HRIS requisition sync is unavailable for this route.',
    unimplemented: 'HRIS requisition sync is unsupported for this provider family.',
  };
  return messages[kind];
}

export function buildHrisRequisitionOperationalState(input: {
  routeFamily: HrisRequisitionRouteFamily;
  gate?: OperationalReadinessGateResult;
  mappingStatus?: HrisRequisitionMappingStatus;
  syncStatus?: HrisRequisitionSyncStatus;
  blockedReason?: 'auth' | 'provider';
}): HrisRequisitionOperationalState {
  let kind: HrisRequisitionOperationalStateKind = 'ready';

  if (input.gate && !input.gate.canProceed) {
    if (input.gate.state === 'blocked') kind = input.blockedReason === 'provider' ? 'provider-blocked' : 'auth-required';
    else if (input.gate.state === 'degraded') kind = 'sync-degraded';
    else kind = input.gate.state;
  } else if (input.mappingStatus === 'required') {
    kind = 'mapping-required';
  } else if (input.mappingStatus === 'drift') {
    kind = 'mapping-drift';
  } else if (input.syncStatus && input.syncStatus !== 'idle') {
    kind = input.syncStatus === 'pending' ? 'sync-pending' : input.syncStatus === 'degraded' ? 'sync-degraded' : input.syncStatus === 'failed' ? 'sync-failed' : input.syncStatus;
  }

  return {
    kind,
    routeFamily: input.routeFamily,
    canProceed: kind === 'ready' || kind === 'synced',
    message: messageFor(kind),
    readinessOutcome: input.gate?.state,
    recoveryTargetType: recoveryTargetFor(kind, input.gate),
    driftType: kind === 'mapping-required' || kind === 'mapping-drift' ? 'mapping' : 'none',
  };
}

export function resolveHrisWorkflowDriftPriority<TWorkflowDrift>(input: {
  workflowDrift?: TWorkflowDrift;
  hrisState: HrisRequisitionOperationalState;
}): { authority: 'workflow-drift'; workflowDrift: TWorkflowDrift } | { authority: 'hris-operational'; hrisState: HrisRequisitionOperationalState } {
  if (input.workflowDrift) return { authority: 'workflow-drift', workflowDrift: input.workflowDrift };
  return { authority: 'hris-operational', hrisState: input.hrisState };
}

export function buildHrisRequisitionTelemetry(
  action: HrisRequisitionAction,
  state: HrisRequisitionOperationalState,
): HrisRequisitionTelemetryEvent {
  return {
    name: 'hris_requisition_sync_action',
    data: {
      routeFamily: state.routeFamily,
      action,
      hrisState: state.kind,
      readinessOutcome: state.readinessOutcome,
      recoveryTargetType: state.recoveryTargetType,
      driftType: state.driftType,
      correlationId: ensureCorrelationId(),
    },
  };
}

export function runHrisRequisitionSyncAction(
  state: HrisRequisitionOperationalState,
  action: Extract<HrisRequisitionAction, 'sync-intent' | 'sync-retry' | 'remediation'>,
  options: { forceFailure?: boolean } = {},
): HrisRequisitionSyncResult {
  if (!state.canProceed && action !== 'remediation' && state.kind !== 'sync-failed') {
    return { status: 'blocked-action', operationalState: state, telemetry: buildHrisRequisitionTelemetry('blocked-action', state) };
  }

  if (action === 'remediation') {
    return { status: 'remediation', operationalState: state, telemetry: buildHrisRequisitionTelemetry('remediation', state) };
  }

  if (action === 'sync-retry') {
    const retryState = { ...state, kind: 'retrying' as const, canProceed: false, message: messageFor('retrying'), recoveryTargetType: 'route-local' as const };
    return { status: 'retrying', operationalState: retryState, telemetry: buildHrisRequisitionTelemetry('sync-retry', retryState) };
  }

  if (options.forceFailure) {
    const failedState = { ...state, kind: 'sync-failed' as const, canProceed: false, message: messageFor('sync-failed'), recoveryTargetType: 'route-local' as const };
    return { status: 'failed', operationalState: failedState, telemetry: buildHrisRequisitionTelemetry('sync-intent', failedState) };
  }

  const syncedState = { ...state, kind: 'synced' as const, canProceed: true, message: messageFor('synced'), recoveryTargetType: 'none' as const };
  return { status: 'synced', operationalState: syncedState, telemetry: buildHrisRequisitionTelemetry('sync-intent', syncedState) };
}
