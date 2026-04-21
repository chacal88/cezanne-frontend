import { ensureCorrelationId } from '../../../lib/observability';
import type { OperationalReadinessGateResult, OperationalReadinessGateState } from './operational-readiness-gates';

export type AtsCandidateSourceRouteFamily = 'candidate-database' | 'candidate-detail' | 'jobs-list' | 'job-authoring';
export type AtsCandidateSourceStateKind =
  | 'loading'
  | 'ready'
  | 'source-linked'
  | 'source-unlinked'
  | 'import-pending'
  | 'import-succeeded'
  | 'import-failed'
  | 'duplicate-detected'
  | 'duplicate-merged'
  | 'sync-pending'
  | 'sync-degraded'
  | 'sync-failed'
  | 'stale-source'
  | 'provider-blocked'
  | 'degraded'
  | 'unavailable'
  | 'unimplemented';
export type AtsSourceState = 'linked' | 'unlinked' | 'stale';
export type AtsDuplicateOutcome = 'none' | 'duplicate-detected' | 'duplicate-merged';
export type AtsSyncImportOutcome =
  | 'none'
  | 'import-pending'
  | 'import-succeeded'
  | 'import-failed'
  | 'sync-pending'
  | 'sync-degraded'
  | 'sync-failed';
export type AtsRecoveryTargetType = 'provider-setup' | 'route-local' | 'none';
export type AtsRefreshIntent = 'none' | 'refresh-source' | 'retry-import' | 'retry-sync' | 'provider-remediation';
export type AtsCandidateSourceAction =
  | 'source_resolved'
  | 'import_sync_started'
  | 'duplicate_outcome'
  | 'retry_started'
  | 'refreshed'
  | 'failed'
  | 'recovery_guidance';

export type AtsSourceIdentity = {
  providerId: string;
  providerLabel: string;
  sourceState: AtsSourceState;
  displayLabel: string;
};

export type AtsCandidateSourceOperationalState = {
  kind: AtsCandidateSourceStateKind;
  routeFamily: AtsCandidateSourceRouteFamily;
  canProceed: boolean;
  message: string;
  sourceState?: AtsSourceState;
  sourceIdentity?: AtsSourceIdentity;
  duplicateOutcome: AtsDuplicateOutcome;
  syncImportOutcome: AtsSyncImportOutcome;
  refreshIntent: AtsRefreshIntent;
  recoveryTargetType: AtsRecoveryTargetType;
  readinessOutcome?: OperationalReadinessGateState;
};

export type AtsTelemetryEvent = {
  name: 'ats_candidate_source_action';
  data: {
    routeFamily: AtsCandidateSourceRouteFamily;
    action: AtsCandidateSourceAction;
    atsState: AtsCandidateSourceStateKind;
    sourceState?: AtsSourceState;
    duplicateOutcome?: Exclude<AtsDuplicateOutcome, 'none'>;
    syncImportOutcome?: Exclude<AtsSyncImportOutcome, 'none'>;
    recoveryTargetType: AtsRecoveryTargetType;
    correlationId: string;
  };
};

export type AtsOperationResult = {
  status: 'blocked-action' | 'retrying' | 'refreshed' | 'failed' | 'succeeded' | 'recovery-guidance';
  operationalState: AtsCandidateSourceOperationalState;
  telemetry: AtsTelemetryEvent;
};

const messages: Record<AtsCandidateSourceStateKind, string> = {
  loading: 'ATS source status is loading.',
  ready: 'ATS source status is ready.',
  'source-linked': 'Candidate is linked to a normalized ATS source.',
  'source-unlinked': 'Candidate is not linked to an ATS source.',
  'import-pending': 'ATS import is pending.',
  'import-succeeded': 'ATS import succeeded.',
  'import-failed': 'ATS import failed and can be retried.',
  'duplicate-detected': 'ATS duplicate candidate was detected.',
  'duplicate-merged': 'ATS duplicate candidate was merged.',
  'sync-pending': 'ATS sync is pending.',
  'sync-degraded': 'ATS sync is degraded and needs remediation.',
  'sync-failed': 'ATS sync failed and can be retried.',
  'stale-source': 'ATS source is stale and requires refresh before claiming current sync.',
  'provider-blocked': 'ATS provider setup blocks this operation.',
  degraded: 'ATS readiness is degraded.',
  unavailable: 'ATS source status is unavailable for this route.',
  unimplemented: 'ATS source status is not implemented for this provider family.',
};

function singleString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function recoveryTargetFor(kind: AtsCandidateSourceStateKind, gate?: OperationalReadinessGateResult): AtsRecoveryTargetType {
  if (gate?.setupTarget && (kind === 'provider-blocked' || kind === 'degraded')) return 'provider-setup';
  if (kind === 'ready' || kind === 'source-linked' || kind === 'import-succeeded' || kind === 'duplicate-merged') return 'none';
  return 'route-local';
}

function refreshIntentFor(kind: AtsCandidateSourceStateKind): AtsRefreshIntent {
  if (kind === 'stale-source') return 'refresh-source';
  if (kind === 'import-failed') return 'retry-import';
  if (kind === 'sync-failed' || kind === 'sync-degraded') return 'retry-sync';
  if (kind === 'provider-blocked' || kind === 'degraded' || kind === 'unavailable' || kind === 'unimplemented') return 'provider-remediation';
  return 'none';
}

function outcomeFor(kind: AtsCandidateSourceStateKind): Pick<AtsCandidateSourceOperationalState, 'duplicateOutcome' | 'syncImportOutcome'> {
  if (kind === 'duplicate-detected' || kind === 'duplicate-merged') return { duplicateOutcome: kind, syncImportOutcome: 'none' };
  if (kind === 'import-pending' || kind === 'import-succeeded' || kind === 'import-failed' || kind === 'sync-pending' || kind === 'sync-degraded' || kind === 'sync-failed') {
    return { duplicateOutcome: 'none', syncImportOutcome: kind };
  }
  return { duplicateOutcome: 'none', syncImportOutcome: 'none' };
}

export function normalizeAtsSourceIdentity(input: {
  providerId?: unknown;
  providerLabel?: unknown;
  sourceState?: AtsSourceState;
}): AtsSourceIdentity | undefined {
  const providerId = singleString(input.providerId);
  const providerLabel = singleString(input.providerLabel) || providerId;
  if (!providerId || !providerLabel) return undefined;
  const sourceState = input.sourceState ?? 'linked';
  return {
    providerId,
    providerLabel,
    sourceState,
    displayLabel: `${providerLabel} (${sourceState})`,
  };
}

export function buildAtsCandidateSourceState(input: {
  routeFamily: AtsCandidateSourceRouteFamily;
  gate?: OperationalReadinessGateResult;
  sourceIdentity?: AtsSourceIdentity;
  sourceState?: AtsSourceState;
  operationState?: AtsCandidateSourceStateKind;
  duplicateOutcome?: AtsDuplicateOutcome;
  syncImportOutcome?: AtsSyncImportOutcome;
  isLoading?: boolean;
}): AtsCandidateSourceOperationalState {
  let kind: AtsCandidateSourceStateKind = 'ready';

  if (input.isLoading) kind = 'loading';
  else if (input.gate && !input.gate.canProceed) {
    if (input.gate.state === 'blocked') kind = 'provider-blocked';
    else kind = input.gate.state;
  } else if (input.duplicateOutcome && input.duplicateOutcome !== 'none') kind = input.duplicateOutcome;
  else if (input.syncImportOutcome && input.syncImportOutcome !== 'none') kind = input.syncImportOutcome;
  else if (input.operationState) kind = input.operationState;
  else if (input.sourceState === 'stale' || input.sourceIdentity?.sourceState === 'stale') kind = 'stale-source';
  else if (input.sourceIdentity) kind = 'source-linked';
  else if (input.sourceState === 'unlinked') kind = 'source-unlinked';

  const outcomes = outcomeFor(kind);

  return {
    kind,
    routeFamily: input.routeFamily,
    canProceed: kind === 'ready' || kind === 'source-linked' || kind === 'import-succeeded' || kind === 'duplicate-merged',
    message: messages[kind],
    sourceState: input.sourceIdentity?.sourceState ?? input.sourceState,
    sourceIdentity: input.sourceIdentity,
    duplicateOutcome: input.duplicateOutcome ?? outcomes.duplicateOutcome,
    syncImportOutcome: input.syncImportOutcome ?? outcomes.syncImportOutcome,
    refreshIntent: refreshIntentFor(kind),
    recoveryTargetType: recoveryTargetFor(kind, input.gate),
    readinessOutcome: input.gate?.state,
  };
}

export function resolveAtsDuplicatePolicy(input: { hasDuplicate?: boolean; wasMerged?: boolean }): AtsDuplicateOutcome {
  if (input.wasMerged) return 'duplicate-merged';
  if (input.hasDuplicate) return 'duplicate-detected';
  return 'none';
}

export function resolveAtsSyncImportOutcome(input: {
  kind: 'import' | 'sync';
  status?: 'idle' | 'pending' | 'succeeded' | 'failed' | 'degraded';
}): AtsSyncImportOutcome {
  if (!input.status || input.status === 'idle') return 'none';
  if (input.kind === 'import') return input.status === 'pending' ? 'import-pending' : input.status === 'succeeded' ? 'import-succeeded' : 'import-failed';
  if (input.status === 'pending') return 'sync-pending';
  if (input.status === 'degraded') return 'sync-degraded';
  if (input.status === 'failed') return 'sync-failed';
  return 'none';
}

export function buildAtsTelemetry(action: AtsCandidateSourceAction, state: AtsCandidateSourceOperationalState): AtsTelemetryEvent {
  return {
    name: 'ats_candidate_source_action',
    data: {
      routeFamily: state.routeFamily,
      action,
      atsState: state.kind,
      sourceState: state.sourceState,
      duplicateOutcome: state.duplicateOutcome === 'none' ? undefined : state.duplicateOutcome,
      syncImportOutcome: state.syncImportOutcome === 'none' ? undefined : state.syncImportOutcome,
      recoveryTargetType: state.recoveryTargetType,
      correlationId: ensureCorrelationId(),
    },
  };
}

export function runAtsRetryOrRefresh(
  state: AtsCandidateSourceOperationalState,
  action: Extract<AtsCandidateSourceAction, 'retry_started' | 'refreshed' | 'recovery_guidance'>,
  options: { forceFailure?: boolean } = {},
): AtsOperationResult {
  if (action === 'recovery_guidance') {
    return { status: 'recovery-guidance', operationalState: state, telemetry: buildAtsTelemetry(action, state) };
  }

  if (state.recoveryTargetType === 'provider-setup') {
    return { status: 'blocked-action', operationalState: state, telemetry: buildAtsTelemetry('recovery_guidance', state) };
  }

  if (action === 'retry_started') {
    const retryKind = state.syncImportOutcome.startsWith('import') ? 'import-pending' : 'sync-pending';
    const retryState = buildAtsCandidateSourceState({ routeFamily: state.routeFamily, sourceIdentity: state.sourceIdentity, operationState: retryKind });
    return { status: 'retrying', operationalState: retryState, telemetry: buildAtsTelemetry(action, retryState) };
  }

  if (options.forceFailure) {
    const failedState = buildAtsCandidateSourceState({ routeFamily: state.routeFamily, sourceIdentity: state.sourceIdentity, operationState: 'sync-failed' });
    return { status: 'failed', operationalState: failedState, telemetry: buildAtsTelemetry('failed', failedState) };
  }

  const refreshedState = buildAtsCandidateSourceState({ routeFamily: state.routeFamily, sourceIdentity: state.sourceIdentity, operationState: 'source-linked' });
  return { status: 'refreshed', operationalState: refreshedState, telemetry: buildAtsTelemetry(action, refreshedState) };
}

export function projectAtsStateLabel(state: AtsCandidateSourceOperationalState) {
  return state.sourceIdentity ? `${state.sourceIdentity.displayLabel}: ${state.message}` : state.message;
}
