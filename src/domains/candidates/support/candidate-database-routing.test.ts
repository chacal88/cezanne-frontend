import {
  buildCandidateDatabaseDetailPath,
  buildCandidateDatabasePath,
  parseCandidateDatabaseSearchFromUrl,
  sanitizeCandidateDatabaseReturnTarget,
  validateCandidateDatabaseSearch,
} from './candidate-database-routing';

describe('candidate database routing helpers', () => {
  it('sanitizes URL state into the canonical candidate database state model', () => {
    expect(
      validateCandidateDatabaseSearch({
        query: ' product ',
        page: '3',
        sort: 'name',
        order: 'asc',
        stage: 'screening',
        tags: 'remote,senior',
        advanced: 'true',
        advancedQueryId: 'query-1<script>',
        advancedQueryState: 'invalid',
      }),
    ).toEqual({
      query: 'product',
      page: 3,
      sort: 'name',
      order: 'asc',
      stage: 'screening',
      tags: ['remote', 'senior'],
      advancedMode: true,
      advancedQueryId: 'query-1script',
      advancedQueryState: 'invalid',
    });
  });

  it('degrades invalid URL state to stable defaults while preserving valid values', () => {
    expect(parseCandidateDatabaseSearchFromUrl('?query=alex&page=-1&sort=invalid&order=sideways&tags=one,,two')).toEqual({
      query: 'alex',
      page: 1,
      sort: 'updatedAt',
      order: 'desc',
      stage: undefined,
      tags: ['one', 'two'],
      advancedMode: false,
      advancedQueryId: undefined,
      advancedQueryState: 'valid',
    });
  });

  it('builds canonical database paths and database-origin detail handoff URLs', () => {
    expect(buildCandidateDatabasePath({ query: 'alex', page: 2, sort: 'name', order: 'asc', tags: ['senior'], advancedMode: true, advancedQueryId: 'query-1', advancedQueryState: 'unsupported' })).toBe(
      '/candidates-database?query=alex&page=2&sort=name&order=asc&tags=senior&advanced=true&advancedQueryId=query-1&advancedQueryState=unsupported',
    );

    expect(buildCandidateDatabaseDetailPath('candidate-123', { query: 'alex', page: 2 })).toBe(
      '/candidate/candidate-123?entry=database&returnTo=%2Fcandidates-database%3Fquery%3Dalex%26page%3D2',
    );
  });

  it('sanitizes database-origin return targets to the canonical route', () => {
    expect(sanitizeCandidateDatabaseReturnTarget('/candidates-old?query=legacy&page=4')).toBe('/candidates-database?query=legacy&page=4');
    expect(sanitizeCandidateDatabaseReturnTarget('https://example.com/candidates-database')).toBe('/candidates-database');
    expect(sanitizeCandidateDatabaseReturnTarget('/jobs/open')).toBe('/candidates-database');
  });
});
