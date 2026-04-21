import { describe, expect, it } from 'vitest';
import { buildProviderReadinessSignals } from './admin-state';
import { buildOperationalGateInput, evaluateOperationalReadinessGate } from './operational-readiness-gates';
import {
  buildAtsCandidateSourceState,
  buildAtsTelemetry,
  normalizeAtsSourceIdentity,
  resolveAtsDuplicatePolicy,
  resolveAtsSyncImportOutcome,
  runAtsRetryOrRefresh,
} from './ats-candidate-source-operational-state';

describe('ATS candidate source operational state', () => {
  it('models source identity and all required state kinds deterministically', () => {
    const identity = normalizeAtsSourceIdentity({ providerId: 'greenhouse', providerLabel: 'Greenhouse', sourceState: 'linked' });
    expect(identity).toEqual({ providerId: 'greenhouse', providerLabel: 'Greenhouse', sourceState: 'linked', displayLabel: 'Greenhouse (linked)' });

    const requiredStates = [
      'loading',
      'ready',
      'source-linked',
      'source-unlinked',
      'import-pending',
      'import-succeeded',
      'import-failed',
      'duplicate-detected',
      'duplicate-merged',
      'sync-pending',
      'sync-degraded',
      'sync-failed',
      'stale-source',
      'provider-blocked',
      'degraded',
      'unavailable',
      'unimplemented',
    ] as const;

    expect(requiredStates.map((operationState) => buildAtsCandidateSourceState({ routeFamily: 'candidate-detail', operationState }).kind)).toEqual(requiredStates);
  });

  it('keeps duplicate policy distinct from import and sync outcomes', () => {
    expect(resolveAtsDuplicatePolicy({ hasDuplicate: true })).toBe('duplicate-detected');
    expect(resolveAtsDuplicatePolicy({ hasDuplicate: true, wasMerged: true })).toBe('duplicate-merged');
    expect(resolveAtsSyncImportOutcome({ kind: 'import', status: 'failed' })).toBe('import-failed');
    expect(resolveAtsSyncImportOutcome({ kind: 'sync', status: 'degraded' })).toBe('sync-degraded');

    expect(buildAtsCandidateSourceState({ routeFamily: 'candidate-database', duplicateOutcome: 'duplicate-detected' })).toMatchObject({
      kind: 'duplicate-detected',
      duplicateOutcome: 'duplicate-detected',
      syncImportOutcome: 'none',
    });
  });

  it('exposes stale-source refresh intent and provider repair without leaking setup internals', () => {
    const stale = buildAtsCandidateSourceState({ routeFamily: 'candidate-detail', sourceState: 'stale' });
    expect(stale).toMatchObject({ kind: 'stale-source', refreshIntent: 'refresh-source', recoveryTargetType: 'route-local' });
    expect(runAtsRetryOrRefresh(stale, 'refreshed')).toMatchObject({ status: 'refreshed', operationalState: { kind: 'source-linked' } });

    const [signal] = buildProviderReadinessSignals({ id: 'greenhouse', name: 'Greenhouse', family: 'ats', state: 'blocked' });
    const gate = evaluateOperationalReadinessGate(buildOperationalGateInput(signal, 'job-publishing'));
    const blocked = buildAtsCandidateSourceState({ routeFamily: 'candidate-detail', gate });
    expect(blocked).toMatchObject({ kind: 'provider-blocked', recoveryTargetType: 'provider-setup', readinessOutcome: 'blocked' });
    expect(JSON.stringify(blocked)).not.toContain('credential');
  });

  it('emits only allowlisted safe telemetry fields', () => {
    const state = buildAtsCandidateSourceState({ routeFamily: 'candidate-database', duplicateOutcome: 'duplicate-merged' });
    const event = buildAtsTelemetry('duplicate_outcome', state);
    expect(event.name).toBe('ats_candidate_source_action');
    expect(Object.keys(event.data).sort()).toEqual([
      'atsState',
      'correlationId',
      'duplicateOutcome',
      'recoveryTargetType',
      'routeFamily',
      'sourceState',
      'syncImportOutcome',
      'action',
    ].sort());
    expect(JSON.stringify(event)).not.toMatch(/externalId|tenant|token|credential|payload|raw/i);
  });
});
