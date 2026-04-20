export type OrgFavoriteOwnership = 'personal' | 'org-shared' | 'recruiter-linked';
export type OrgFavoriteListState = 'ready' | 'empty' | 'unavailable';
export type OrgFavoriteDetailState = 'ready' | 'unavailable';
export type OrgFavoriteRequestState = 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'unavailable';
export type OrgFavoriteRequestActionKind = 'submit' | 'cancel' | 'resubmit';

export type OrgFavorite = {
  id: string;
  label: string;
  ownership: OrgFavoriteOwnership;
  recruiterName?: string;
};

export type OrgFavoriteRequest = {
  id: string;
  favoriteId?: string;
  state: OrgFavoriteRequestState;
  title: string;
  unavailableReason?: string;
};

export type OrgFavoriteRequestAction = {
  action: OrgFavoriteRequestActionKind;
  label: string;
  state: 'ready' | 'pending' | 'success' | 'blocked';
  nextState?: OrgFavoriteRequestState;
  reason?: string;
};

export const orgFavoritesRoutes = {
  index: '/favorites',
  detail: '/favorites/$favoriteId',
  requestCreate: '/favorites/request',
  requestDetail: '/favorites/request/$requestId',
  fallback: '/dashboard',
} as const;

const favorites: OrgFavorite[] = [
  { id: 'favorite-1', label: 'Frontend shortlist', ownership: 'personal' },
  { id: 'favorite-2', label: 'Hiring team shortlist', ownership: 'org-shared' },
  { id: 'favorite-3', label: 'Recruiter referrals', ownership: 'recruiter-linked', recruiterName: 'Riley Recruiter' },
];

const favoriteRequests: OrgFavoriteRequest[] = [
  { id: 'request-draft', favoriteId: 'favorite-1', state: 'draft', title: 'Request frontend shortlist review' },
  { id: 'request-submitted', favoriteId: 'favorite-2', state: 'submitted', title: 'Submitted hiring team shortlist request' },
  { id: 'request-pending', favoriteId: 'favorite-3', state: 'pending', title: 'Pending recruiter referrals request' },
  { id: 'request-approved', favoriteId: 'favorite-1', state: 'approved', title: 'Approved frontend shortlist request' },
  { id: 'request-rejected', favoriteId: 'favorite-2', state: 'rejected', title: 'Rejected hiring team shortlist request' },
];

function countByOwnership(ownership: OrgFavoriteOwnership) {
  return favorites.filter((favorite) => favorite.ownership === ownership).length;
}

export function buildOrgFavoritesListViewModel(options: { forceEmpty?: boolean; unavailableReason?: string } = {}) {
  if (options.unavailableReason) {
    return {
      state: 'unavailable' as OrgFavoriteListState,
      favorites: [] as OrgFavorite[],
      personalCount: 0,
      orgSharedCount: 0,
      recruiterLinkedCount: 0,
      parentTarget: '/dashboard' as const,
      platformRequestQueue: false,
      unavailableReason: options.unavailableReason,
    };
  }

  const visibleFavorites = options.forceEmpty ? [] : favorites;

  return {
    state: visibleFavorites.length > 0 ? 'ready' as OrgFavoriteListState : 'empty' as OrgFavoriteListState,
    favorites: visibleFavorites,
    personalCount: options.forceEmpty ? 0 : countByOwnership('personal'),
    orgSharedCount: options.forceEmpty ? 0 : countByOwnership('org-shared'),
    recruiterLinkedCount: options.forceEmpty ? 0 : countByOwnership('recruiter-linked'),
    parentTarget: '/dashboard' as const,
    platformRequestQueue: false,
  };
}

export function buildOrgFavoriteDetailViewModel(favoriteId: string) {
  const favorite = favorites.find((candidate) => candidate.id === favoriteId);

  if (!favorite) {
    return {
      state: 'unavailable' as OrgFavoriteDetailState,
      favorite: null,
      parentTarget: '/favorites' as const,
      platformRequestQueue: false,
      unavailableReason: 'Favorite is unavailable or outside the current organization context',
    };
  }

  return {
    state: 'ready' as OrgFavoriteDetailState,
    favorite,
    parentTarget: '/favorites' as const,
    platformRequestQueue: false,
  };
}

export function buildOrgFavoriteRequestActionReadiness(request: OrgFavoriteRequest): OrgFavoriteRequestAction[] {
  if (request.state === 'draft') {
    return [
      { action: 'submit', label: 'Submit request', state: 'ready', nextState: 'submitted' },
      { action: 'cancel', label: 'Cancel request', state: 'ready', nextState: 'unavailable' },
      { action: 'resubmit', label: 'Resubmit request', state: 'blocked', reason: 'Draft request has not been submitted yet' },
    ];
  }

  if (request.state === 'submitted' || request.state === 'pending') {
    return [
      { action: 'submit', label: 'Submit request', state: 'pending', reason: 'Request is already awaiting review' },
      { action: 'cancel', label: 'Cancel request', state: 'ready', nextState: 'unavailable' },
      { action: 'resubmit', label: 'Resubmit request', state: 'blocked', reason: 'Request has not been rejected' },
    ];
  }

  if (request.state === 'approved') {
    return [
      { action: 'submit', label: 'Submit request', state: 'success', reason: 'Request was approved' },
      { action: 'cancel', label: 'Cancel request', state: 'blocked', reason: 'Approved requests cannot be canceled' },
      { action: 'resubmit', label: 'Resubmit request', state: 'blocked', reason: 'Approved requests do not need resubmission' },
    ];
  }

  if (request.state === 'rejected') {
    return [
      { action: 'submit', label: 'Submit request', state: 'blocked', reason: 'Rejected request must be resubmitted' },
      { action: 'cancel', label: 'Cancel request', state: 'blocked', reason: 'Rejected request is already closed' },
      { action: 'resubmit', label: 'Resubmit request', state: 'ready', nextState: 'submitted' },
    ];
  }

  const reason = request.unavailableReason ?? 'Favorite request is unavailable';
  return [
    { action: 'submit', label: 'Submit request', state: 'blocked', reason },
    { action: 'cancel', label: 'Cancel request', state: 'blocked', reason },
    { action: 'resubmit', label: 'Resubmit request', state: 'blocked', reason },
  ];
}

export function buildOrgFavoriteRequestViewModel(requestId?: string) {
  const request = requestId
    ? favoriteRequests.find((candidate) => candidate.id === requestId)
    : favoriteRequests[0];

  if (!request) {
    const unavailableRequest: OrgFavoriteRequest = {
      id: requestId ?? 'new-request',
      state: 'unavailable',
      title: 'Favorite request unavailable',
      unavailableReason: 'Favorite request is unavailable or outside the current organization context',
    };
    const actions = buildOrgFavoriteRequestActionReadiness(unavailableRequest);
    return {
      state: 'unavailable' as OrgFavoriteRequestState,
      request: unavailableRequest,
      actions,
      parentTarget: '/favorites' as const,
      platformRequestQueue: false,
    };
  }

  const actions = buildOrgFavoriteRequestActionReadiness(request);
  return {
    state: request.state,
    request,
    actions,
    parentTarget: '/favorites' as const,
    platformRequestQueue: false,
  };
}
