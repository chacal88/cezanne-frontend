import { describe, expect, it } from 'vitest';
import { buildCandidateSafeTelemetry, resolveCandidateActionProductState, resolveCandidateDatabaseProductState, resolveCandidateHubProductState, resolveCandidateSequenceProductState, resolveCandidateSummaryProductState } from './product-depth';

describe('candidate product-depth state', () => {
  it('models aggregate hub and sequence states', () => {
    expect(resolveCandidateHubProductState({ degradedSections: ['contracts'] })).toMatchObject({ kind: 'partial-degraded', degradedSections: ['contracts'] });
    expect(resolveCandidateHubProductState({ staleContext: true }).kind).toBe('stale-context');
    expect(resolveCandidateSequenceProductState({ entryMode: 'database', databaseReturnTarget: '/candidates-database?q=a' })).toMatchObject({ kind: 'database-return' });
    expect(resolveCandidateSequenceProductState({ entryMode: 'job', hasSequence: false }).kind).toBe('unavailable-sequence');
  });

  it('models database, action lifecycle, and downstream summary ownership', () => {
    expect(resolveCandidateDatabaseProductState({ resultCount: 0 })).toMatchObject({ kind: 'empty' });
    expect(resolveCandidateDatabaseProductState({ stale: true })).toMatchObject({ kind: 'stale' });
    expect(resolveCandidateActionProductState({ kind: 'offer', parentRefresh: true })).toMatchObject({ kind: 'parent-refresh-required', action: 'offer' });
    expect(resolveCandidateActionProductState({ kind: 'cv-upload', saving: true })).toMatchObject({ kind: 'saving', action: 'cv-upload' });
    expect(resolveCandidateActionProductState({ kind: 'cv-upload', retryable: true })).toMatchObject({ kind: 'retryable', action: 'cv-upload' });
    expect(resolveCandidateSummaryProductState({ stale: true }).kind).toBe('stale');
    expect(resolveCandidateSummaryProductState({ downstreamOwned: true }).kind).toBe('downstream-owned');
  });

  it('keeps telemetry allowlisted without raw candidate content', () => {
    const payload = JSON.stringify(buildCandidateSafeTelemetry({ routeFamily: 'candidate-action', action: 'cv-upload', state: 'retryable', entryMode: 'database' }));
    expect(payload).not.toContain('documentBody');
    expect(payload).not.toContain('messageBody');
    expect(payload).not.toContain('surveyAnswer');
    expect(payload).not.toContain('tenantId');
  });
});
