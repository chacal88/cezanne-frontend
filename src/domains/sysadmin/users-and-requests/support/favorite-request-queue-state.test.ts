import { buildFavoriteRequestQueueState, getFavoriteRequestActionReadiness, parseFavoriteRequestState } from './favorite-request-queue-state';

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

  it('exposes retry for stale error and action failure states', () => {
    expect(buildFavoriteRequestQueueState('stale')).toMatchObject({ retryAvailable: true });
    expect(buildFavoriteRequestQueueState('error')).toMatchObject({ retryAvailable: true });
    expect(buildFavoriteRequestQueueState('action-failure')).toMatchObject({ retryAvailable: true });
    expect(getFavoriteRequestActionReadiness('action-failure', 'approve')).toEqual({ action: 'approve', available: true });
  });

  it('parses favorite request fixture states for queue and detail frames', () => {
    expect(parseFavoriteRequestState('stale')).toBe('stale');
    expect(parseFavoriteRequestState('action-failure')).toBe('action-failure');
    expect(parseFavoriteRequestState('not-supported')).toBe('pending');
  });
});
