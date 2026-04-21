import { describe, expect, it } from 'vitest';
import { buildJobsListClearFiltersSearch, hasJobsListFilters, validateJobsListSearch, validateJobsListScope } from './jobs-list-page';

describe('JobsListPage route search helpers', () => {
  it('sanitizes list search and scope state', () => {
    expect(validateJobsListScope('assigned')).toBe('assigned');
    expect(validateJobsListScope('unknown')).toBe('open');
    expect(validateJobsListSearch({ page: '2', search: 'engineer', asAdmin: 'true', label: 'urgent' })).toEqual({
      scope: 'open',
      page: 2,
      search: 'engineer',
      asAdmin: true,
      label: 'urgent',
    });
  });

  it('exposes a canonical clear-filters search state', () => {
    expect(hasJobsListFilters({ search: 'engineer', asAdmin: false, label: undefined })).toBe(true);
    expect(hasJobsListFilters({ search: undefined, asAdmin: true, label: undefined })).toBe(true);
    expect(hasJobsListFilters({ search: undefined, asAdmin: false, label: 'urgent' })).toBe(true);
    expect(hasJobsListFilters({ search: undefined, asAdmin: false, label: undefined })).toBe(false);
    expect(buildJobsListClearFiltersSearch('assigned')).toEqual({ scope: 'assigned', page: 1, search: undefined, asAdmin: false, label: undefined });
  });
});
