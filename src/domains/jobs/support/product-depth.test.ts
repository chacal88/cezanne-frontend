import { describe, expect, it } from 'vitest';
import { resolveJobAuthoringProductState, resolveJobDetailProductState, resolveJobsListProductState, resolveJobTaskProductState } from './product-depth';

describe('jobs product-depth state', () => {
  it('models list operational outcomes', () => {
    expect(resolveJobsListProductState({ total: 0, filtered: true, scope: 'open' }).kind).toBe('filtered-empty');
    expect(resolveJobsListProductState({ total: 0, filtered: false, scope: 'open' }).kind).toBe('empty');
    expect(resolveJobsListProductState({ total: 1, filtered: false, stale: true, scope: 'open' }).kind).toBe('stale-filters');
  });

  it('separates authoring draft save from publishing outcomes', () => {
    expect(resolveJobAuthoringProductState({ mode: 'edit', saveFailed: true })).toMatchObject({ kind: 'save-failed', retryAvailable: true });
    expect(resolveJobAuthoringProductState({ mode: 'edit', publishing: 'blocked' }).kind).toBe('publish-blocked');
    expect(resolveJobAuthoringProductState({ mode: 'edit', dirty: true }).kind).toBe('dirty-draft');
  });

  it('models detail degradation and task parent refresh', () => {
    expect(resolveJobDetailProductState({ section: 'candidates', degradedSections: ['candidates'] })).toMatchObject({ kind: 'degraded', retryAvailable: true });
    expect(resolveJobTaskProductState({ kind: 'schedule', parentTarget: '/job/1', parentRefresh: true })).toMatchObject({ kind: 'parent-refresh-required', parentTarget: '/job/1' });
  });
});
