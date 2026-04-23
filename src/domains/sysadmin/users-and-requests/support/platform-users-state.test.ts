import {
  buildPlatformUserCreateState,
  buildPlatformUserDetailState,
  buildPlatformUserEditState,
  buildPlatformUserListState,
  parsePlatformUserCreateStateKind,
  parsePlatformUserDetailStateKind,
  parsePlatformUserEditStateKind,
  parsePlatformUserFilters,
  parsePlatformUserListStateKind,
} from './platform-users-state';

describe('platform user state', () => {
  it('sanitizes platform user list filters', () => {
    expect(parsePlatformUserFilters({ page: '-2', search: ' alex ', hiringCompanyId: '', recruitmentAgencyId: 'ra-1' })).toEqual({
      page: 1,
      search: 'alex',
      recruitmentAgencyId: 'ra-1',
    });
  });

  it('builds URL-owned return targets without org scope', () => {
    expect(buildPlatformUserListState({ page: '3', search: 'alex', hiringCompanyId: 'hc-1' })).toMatchObject({
      returnTo: '/users?page=3&search=alex&hiringCompanyId=hc-1',
      orgScope: false,
    });
  });

  it('keeps detail and edit returns inside platform users', () => {
    expect(buildPlatformUserDetailState('user-1', '/team')).toMatchObject({ parentTarget: '/users', orgScope: false });
    expect(buildPlatformUserEditState('user-1', '/users?page=2')).toMatchObject({
      parentTarget: '/users?page=2',
      successTarget: '/users?page=2',
      cancelTarget: '/users?page=2',
    });
  });

  it('models create lifecycle hooks without reusing org invite state', () => {
    expect(buildPlatformUserCreateState('/users?page=2', 'saving')).toMatchObject({
      kind: 'saving',
      parentTarget: '/users?page=2',
      successTarget: '/users?page=2',
      cancelTarget: '/users?page=2',
      orgScope: false,
    });
    expect(buildPlatformUserCreateState('/users/invite', 'permission-denied')).toMatchObject({
      kind: 'permission-denied',
      parentTarget: '/users',
      orgScope: false,
    });
  });

  it('parses fixture state hooks for visual evidence coverage', () => {
    expect(parsePlatformUserListStateKind('denied')).toBe('denied');
    expect(parsePlatformUserDetailStateKind('permission-denied')).toBe('permission-denied');
    expect(parsePlatformUserEditStateKind('saving')).toBe('saving');
    expect(parsePlatformUserCreateStateKind('cancelled')).toBe('cancelled');
    expect(parsePlatformUserEditStateKind('unknown')).toBe('editing');
  });
});
