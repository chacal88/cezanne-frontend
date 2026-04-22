import {
  buildCandidateActionPath,
  buildCandidateDetailPath,
  parseCandidateContextFromPathname,
  validateCandidateDetailSearch,
  validateCandidateTaskSearch,
  buildCandidateParentRefreshTarget,
} from './routing';

describe('candidate routing helpers', () => {
  it('builds the frozen contextual candidate detail path', () => {
    expect(
      buildCandidateDetailPath({
        candidateId: 'candidate-123',
        jobId: 'job-456',
        status: 'screening',
        order: '2',
        filters: 'remote',
        interview: 'interview-1',
      }),
    ).toBe('/candidate/candidate-123/job-456/screening/2/remote/interview-1');
  });

  it('builds contextual candidate action paths', () => {
    const context = { candidateId: 'candidate-123', jobId: 'job-456', status: 'screening', order: '2', filters: 'remote' };

    expect(buildCandidateActionPath('schedule', context, 'cv-123')).toBe('/candidate/candidate-123/job-456/screening/2/remote/cv/cv-123/schedule');
    expect(buildCandidateActionPath('offer', context, 'cv-123')).toBe('/candidate/candidate-123/job-456/screening/2/remote/cv/cv-123/offer');
    expect(buildCandidateActionPath('reject', context, 'cv-123')).toBe('/candidate/candidate-123/job-456/screening/2/remote/cv-reject/cv-123');
  });

  it('parses registered candidate paths through the shared route metadata', () => {
    expect(parseCandidateContextFromPathname('/candidate/candidate-123/job-456/screening/2/remote/interview-1')).toEqual({
      candidateId: 'candidate-123',
      jobId: 'job-456',
      status: 'screening',
      order: '2',
      filters: 'remote',
      interview: 'interview-1',
    });
  });

  it('validates candidate search params with explicit entry and degradation hints', () => {
    expect(validateCandidateDetailSearch({ entry: 'notification', degrade: 'contracts,surveys,invalid' })).toEqual({
      entry: 'notification',
      degrade: ['contracts', 'surveys'],
      returnTo: undefined,
      fixtureAction: undefined,
      fixtureActionState: undefined,
    });
  });

  it('validates database-origin candidate detail search with a sanitized return target', () => {
    expect(validateCandidateDetailSearch({ entry: 'database', returnTo: '/candidates-database?query=alex&page=2' })).toEqual({
      entry: 'database',
      degrade: [],
      returnTo: '/candidates-database?query=alex&page=2',
      fixtureAction: undefined,
      fixtureActionState: undefined,
    });
  });

  it('validates candidate hub action fixture hooks without accepting arbitrary payload keys', () => {
    expect(validateCandidateDetailSearch({ fixtureAction: 'review-request', fixtureActionState: 'parent-refresh-required' })).toMatchObject({
      fixtureAction: 'review-request',
      fixtureActionState: 'parent-refresh-required',
    });
    expect(validateCandidateDetailSearch({ fixtureAction: 'delete', fixtureActionState: 'raw-payload' })).toMatchObject({
      fixtureAction: undefined,
      fixtureActionState: undefined,
    });
  });

  it('rejects invalid parent targets for candidate task flows', () => {
    expect(validateCandidateTaskSearch({ parent: '/job/job-123', entry: 'job' })).toEqual({
      entry: 'job',
      parent: undefined,
    });
  });

  it('adds parent refresh intent without losing database-origin return state', () => {
    expect(buildCandidateParentRefreshTarget('/candidate/candidate-123?entry=database&returnTo=%2Fcandidates-database%3Fquery%3Dalex')).toBe(
      '/candidate/candidate-123?entry=database&returnTo=%2Fcandidates-database%3Fquery%3Dalex&refresh=candidate',
    );
    expect(buildCandidateParentRefreshTarget('/jobs/open')).toBe('/jobs/open');
  });

});
