import { describe, expect, it } from 'vitest';
import { buildCandidateDatabaseAtsRow, buildCandidateDetailAtsStatus } from './ats-operational-adapters';
import { normalizeAtsSourceIdentity } from '../../integrations/support';
import { buildIntegrationCvPath, buildIntegrationFormsPath, buildIntegrationJobPath } from '../../integrations/support/routing';

describe('candidate ATS operational adapters', () => {
  it('preserves candidate database list state while adding duplicate/source status', () => {
    const row = buildCandidateDatabaseAtsRow({
      candidateId: 'candidate-123',
      listState: { query: 'alex', page: 4, sort: 'name', order: 'asc', stage: 'screening', tags: ['duplicate', 'remote'] },
      providerId: 'greenhouse',
      providerLabel: 'Greenhouse',
      hasDuplicate: true,
    });

    expect(row.candidatePath).toBe('/candidates-database?query=alex&page=4&sort=name&order=asc&stage=screening&tags=duplicate%2Cremote');
    expect(row.atsState).toMatchObject({ kind: 'duplicate-detected', duplicateOutcome: 'duplicate-detected' });
    expect(JSON.stringify(row)).not.toContain('raw');
  });

  it('models candidate database ATS sync outcomes without raw provider payloads', () => {
    const row = buildCandidateDatabaseAtsRow({
      candidateId: 'candidate-123',
      listState: { query: 'alex' },
      providerId: 'greenhouse',
      providerLabel: 'Greenhouse',
      syncStatus: 'failed',
    });

    expect(row.atsState).toMatchObject({ kind: 'sync-failed', syncImportOutcome: 'sync-failed', refreshIntent: 'retry-sync' });
    expect(JSON.stringify(row)).not.toContain('providerPayload');
  });

  it('keeps candidate detail context while exposing stale-source refresh remediation', () => {
    const detail = buildCandidateDetailAtsStatus({
      context: { candidateId: 'candidate-stale', jobId: 'job-1', status: 'screening' },
      sourceIdentity: normalizeAtsSourceIdentity({ providerId: 'greenhouse', providerLabel: 'Greenhouse', sourceState: 'stale' }),
      sourceState: 'stale',
    });

    expect(detail.candidatePath).toBe('/candidate/candidate-stale/job-1/screening');
    expect(detail.atsState).toMatchObject({ kind: 'stale-source', refreshIntent: 'refresh-source' });
    expect(detail.refresh.status).toBe('refreshed');
  });

  it('does not alter public token integration path helpers', () => {
    expect(buildIntegrationCvPath({ token: 'valid-token', action: 'offer' })).toBe('/integration/cv/valid-token/offer');
    expect(buildIntegrationFormsPath({ token: 'valid-forms' })).toBe('/integration/forms/valid-forms');
    expect(buildIntegrationJobPath({ token: 'valid-job' })).toBe('/integration/job/valid-job');
  });
});
