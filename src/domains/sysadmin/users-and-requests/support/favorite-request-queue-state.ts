export type PlatformFavoriteRequestState = 'pending' | 'resolved' | 'rejected' | 'stale' | 'inaccessible' | 'empty' | 'error' | 'action-failure';
export type PlatformFavoriteRequestAction = 'approve' | 'reject' | 'reopen';

export type FavoriteRequestQueueState = {
  kind: PlatformFavoriteRequestState;
  platformQueue: true;
  orgFavoriteRequestFlow: false;
  parentTarget: '/favorites-request';
  retryAvailable: boolean;
};

export type FavoriteRequestActionReadiness = {
  action: PlatformFavoriteRequestAction;
  available: boolean;
  blockedReason?: 'resolved' | 'rejected' | 'stale' | 'inaccessible' | 'empty' | 'error' | 'action-failure';
};

const favoriteRequestStates: PlatformFavoriteRequestState[] = ['pending', 'resolved', 'rejected', 'stale', 'inaccessible', 'empty', 'error', 'action-failure'];

export function parseFavoriteRequestState(value: unknown): PlatformFavoriteRequestState {
  return typeof value === 'string' && favoriteRequestStates.includes(value as PlatformFavoriteRequestState)
    ? (value as PlatformFavoriteRequestState)
    : 'pending';
}

export function buildFavoriteRequestQueueState(kind: PlatformFavoriteRequestState = 'pending'): FavoriteRequestQueueState {
  return { kind, platformQueue: true, orgFavoriteRequestFlow: false, parentTarget: '/favorites-request', retryAvailable: kind === 'error' || kind === 'stale' || kind === 'action-failure' };
}

export function getFavoriteRequestActionReadiness(kind: PlatformFavoriteRequestState, action: PlatformFavoriteRequestAction): FavoriteRequestActionReadiness {
  if (kind === 'pending') return { action, available: action === 'approve' || action === 'reject' };
  if (kind === 'resolved') return { action, available: action === 'reopen', blockedReason: action === 'reopen' ? undefined : 'resolved' };
  if (kind === 'rejected') return { action, available: action === 'reopen', blockedReason: action === 'reopen' ? undefined : 'rejected' };
  if (kind === 'action-failure') return { action, available: true };
  return { action, available: false, blockedReason: kind };
}
