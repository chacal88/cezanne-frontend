export type PlatformFavoriteRequestState = 'pending' | 'resolved' | 'rejected' | 'stale' | 'inaccessible' | 'empty' | 'error';
export type PlatformFavoriteRequestAction = 'approve' | 'reject' | 'reopen';

export type FavoriteRequestQueueState = {
  kind: PlatformFavoriteRequestState;
  platformQueue: true;
  orgFavoriteRequestFlow: false;
  parentTarget: '/favorites-request';
};

export type FavoriteRequestActionReadiness = {
  action: PlatformFavoriteRequestAction;
  available: boolean;
  blockedReason?: 'resolved' | 'rejected' | 'stale' | 'inaccessible' | 'empty' | 'error';
};

export function buildFavoriteRequestQueueState(kind: PlatformFavoriteRequestState = 'pending'): FavoriteRequestQueueState {
  return { kind, platformQueue: true, orgFavoriteRequestFlow: false, parentTarget: '/favorites-request' };
}

export function getFavoriteRequestActionReadiness(kind: PlatformFavoriteRequestState, action: PlatformFavoriteRequestAction): FavoriteRequestActionReadiness {
  if (kind === 'pending') return { action, available: action === 'approve' || action === 'reject' };
  if (kind === 'resolved') return { action, available: action === 'reopen', blockedReason: action === 'reopen' ? undefined : 'resolved' };
  if (kind === 'rejected') return { action, available: action === 'reopen', blockedReason: action === 'reopen' ? undefined : 'rejected' };
  return { action, available: false, blockedReason: kind };
}
