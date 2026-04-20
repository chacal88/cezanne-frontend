import { buildFavoriteRequestQueueState, getFavoriteRequestActionReadiness } from './favorite-request-queue-state';

describe('platform favorite-request queue state', () => {
  it('models platform queue separately from org favorite request flows', () => {
    expect(buildFavoriteRequestQueueState('pending')).toMatchObject({
      platformQueue: true,
      orgFavoriteRequestFlow: false,
      parentTarget: '/favorites-request',
    });
  });

  it('blocks actions deterministically outside pending state', () => {
    expect(getFavoriteRequestActionReadiness('resolved', 'approve')).toEqual({
      action: 'approve',
      available: false,
      blockedReason: 'resolved',
    });
    expect(getFavoriteRequestActionReadiness('resolved', 'reopen')).toEqual({ action: 'reopen', available: true });
  });
});
