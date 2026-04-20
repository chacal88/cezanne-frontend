import { matchRouteMetadata } from '../../../../lib/routing';

describe('platform users and favorite-request routing', () => {
  it('registers platform-owned users routes separately from org invite', () => {
    expect(matchRouteMetadata('/users')?.metadata).toMatchObject({
      routeId: 'sysadmin.users.index',
      domain: 'sysadmin',
      module: 'users',
      routeFamily: 'users-and-requests',
      requiredCapability: 'canManagePlatformUsers',
      implementationState: 'implemented',
    });
    expect(matchRouteMetadata('/users/new')?.metadata.routeId).toBe('sysadmin.users.new');
    expect(matchRouteMetadata('/users/edit/user-1')?.metadata).toMatchObject({ routeId: 'sysadmin.users.edit', parentTarget: '/users/$userId' });
    expect(matchRouteMetadata('/users/user-1')?.metadata).toMatchObject({ routeId: 'sysadmin.users.detail', parentTarget: '/users' });
    expect(matchRouteMetadata('/users/invite')?.metadata).toMatchObject({ routeId: 'team.org.invite-foundation', domain: 'team' });
  });

  it('registers platform favorite-request routes separately from org request flows', () => {
    expect(matchRouteMetadata('/favorites-request')?.metadata).toMatchObject({
      routeId: 'sysadmin.favorite-requests.index',
      domain: 'sysadmin',
      module: 'favorite-requests',
      requiredCapability: 'canManageFavoriteRequests',
    });
    expect(matchRouteMetadata('/favorites-request/request-1')?.metadata).toMatchObject({
      routeId: 'sysadmin.favorite-requests.detail',
      parentTarget: '/favorites-request',
      requiredCapability: 'canManageFavoriteRequests',
    });
    expect(matchRouteMetadata('/favorites/request/request-1')?.metadata).toMatchObject({
      routeId: 'favorites.org.request.detail',
      domain: 'favorites',
      requiredCapability: 'canViewOrgFavorites',
    });
  });
});
