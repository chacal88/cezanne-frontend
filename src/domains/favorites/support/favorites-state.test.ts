import {
  buildOrgFavoriteDetailViewModel,
  buildOrgFavoriteRequestActionReadiness,
  buildOrgFavoriteRequestViewModel,
  buildOrgFavoritesListViewModel,
  orgFavoritesRoutes,
} from './favorites-state';

describe('org favorites state', () => {
  it('models personal org shared and recruiter linked favorites outside platform queues', () => {
    expect(orgFavoritesRoutes).toEqual({
      index: '/favorites',
      detail: '/favorites/$favoriteId',
      requestCreate: '/favorites/request',
      requestDetail: '/favorites/request/$requestId',
      fallback: '/dashboard',
    });
    expect(buildOrgFavoritesListViewModel()).toMatchObject({
      state: 'ready',
      personalCount: 1,
      orgSharedCount: 1,
      recruiterLinkedCount: 1,
      parentTarget: '/dashboard',
      platformRequestQueue: false,
    });
  });

  it('models empty and unavailable list states', () => {
    expect(buildOrgFavoritesListViewModel({ forceEmpty: true })).toMatchObject({
      state: 'empty',
      personalCount: 0,
      orgSharedCount: 0,
      recruiterLinkedCount: 0,
      platformRequestQueue: false,
    });
    expect(buildOrgFavoritesListViewModel({ unavailableReason: 'Favorites are unavailable' })).toMatchObject({
      state: 'unavailable',
      unavailableReason: 'Favorites are unavailable',
      platformRequestQueue: false,
    });
  });

  it('models ready and unavailable detail states with favorites parent fallback', () => {
    expect(buildOrgFavoriteDetailViewModel('favorite-2')).toMatchObject({
      state: 'ready',
      favorite: { ownership: 'org-shared' },
      parentTarget: '/favorites',
      platformRequestQueue: false,
    });

    expect(buildOrgFavoriteDetailViewModel('unknown')).toMatchObject({
      state: 'unavailable',
      favorite: null,
      parentTarget: '/favorites',
      platformRequestQueue: false,
      unavailableReason: 'Favorite is unavailable or outside the current organization context',
    });
  });

  it('models favorite request submit cancel and resubmit readiness', () => {
    expect(buildOrgFavoriteRequestActionReadiness({ id: 'draft', state: 'draft', title: 'Draft' })).toEqual([
      { action: 'submit', label: 'Submit request', state: 'ready', nextState: 'submitted' },
      { action: 'cancel', label: 'Cancel request', state: 'ready', nextState: 'unavailable' },
      { action: 'resubmit', label: 'Resubmit request', state: 'blocked', reason: 'Draft request has not been submitted yet' },
    ]);

    expect(buildOrgFavoriteRequestActionReadiness({ id: 'rejected', state: 'rejected', title: 'Rejected' })).toContainEqual({
      action: 'resubmit',
      label: 'Resubmit request',
      state: 'ready',
      nextState: 'submitted',
    });
  });

  it('models favorite request route state without platform queues', () => {
    expect(buildOrgFavoriteRequestViewModel()).toMatchObject({
      state: 'draft',
      parentTarget: '/favorites',
      platformRequestQueue: false,
    });
    expect(buildOrgFavoriteRequestViewModel('unknown')).toMatchObject({
      state: 'unavailable',
      parentTarget: '/favorites',
      platformRequestQueue: false,
      request: {
        unavailableReason: 'Favorite request is unavailable or outside the current organization context',
      },
    });
  });
});
