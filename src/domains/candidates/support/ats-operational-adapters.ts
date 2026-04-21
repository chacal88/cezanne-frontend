import {
  buildAtsCandidateSourceState,
  buildAtsTelemetry,
  normalizeAtsSourceIdentity,
  resolveAtsDuplicatePolicy,
  resolveAtsSyncImportOutcome,
  runAtsRetryOrRefresh,
  type AtsCandidateSourceOperationalState,
  type AtsSourceIdentity,
  type AtsSourceState,
  type OperationalReadinessGateResult,
} from '../../integrations/support';
import type { CandidateDatabaseRouteState } from './candidate-database-routing';
import { buildCandidateDatabasePath } from './candidate-database-routing';
import type { CandidateContextSegments } from './models';
import { buildCandidateDetailPath } from './routing';

export type CandidateDatabaseAtsRow = {
  candidateId: string;
  candidatePath: string;
  atsState: AtsCandidateSourceOperationalState;
};

export type CandidateDetailAtsStatus = {
  candidateId: string;
  candidatePath: string;
  atsState: AtsCandidateSourceOperationalState;
  refresh: ReturnType<typeof runAtsRetryOrRefresh>;
};

export function buildCandidateDatabaseAtsRow(input: {
  candidateId: string;
  listState: Partial<CandidateDatabaseRouteState>;
  providerId?: string;
  providerLabel?: string;
  sourceState?: AtsSourceState;
  hasDuplicate?: boolean;
  wasMerged?: boolean;
  importStatus?: 'idle' | 'pending' | 'succeeded' | 'failed';
  gate?: OperationalReadinessGateResult;
}): CandidateDatabaseAtsRow {
  const sourceIdentity = normalizeAtsSourceIdentity(input);
  const atsState = buildAtsCandidateSourceState({
    routeFamily: 'candidate-database',
    gate: input.gate,
    sourceIdentity,
    sourceState: input.sourceState,
    duplicateOutcome: resolveAtsDuplicatePolicy(input),
    syncImportOutcome: resolveAtsSyncImportOutcome({ kind: 'import', status: input.importStatus }),
  });

  return {
    candidateId: input.candidateId,
    candidatePath: buildCandidateDatabasePath(input.listState),
    atsState,
  };
}

export function buildCandidateDetailAtsStatus(input: {
  context: CandidateContextSegments;
  sourceIdentity?: AtsSourceIdentity;
  sourceState?: AtsSourceState;
  hasDuplicate?: boolean;
  wasMerged?: boolean;
  syncStatus?: 'idle' | 'pending' | 'failed' | 'degraded';
  gate?: OperationalReadinessGateResult;
}): CandidateDetailAtsStatus {
  const atsState = buildAtsCandidateSourceState({
    routeFamily: 'candidate-detail',
    gate: input.gate,
    sourceIdentity: input.sourceIdentity,
    sourceState: input.sourceState,
    duplicateOutcome: resolveAtsDuplicatePolicy(input),
    syncImportOutcome: resolveAtsSyncImportOutcome({ kind: 'sync', status: input.syncStatus }),
  });

  const refresh = runAtsRetryOrRefresh(atsState, atsState.refreshIntent === 'none' ? 'recovery_guidance' : 'refreshed');
  buildAtsTelemetry('source_resolved', atsState);

  return {
    candidateId: input.context.candidateId,
    candidatePath: buildCandidateDetailPath(input.context),
    atsState,
    refresh,
  };
}
