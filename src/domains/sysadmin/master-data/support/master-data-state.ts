export type MasterDataEntity = 'hiring-company' | 'recruitment-agency' | 'subscription';
export type MasterDataListStateKind = 'loading' | 'empty' | 'error' | 'denied' | 'ready';
export type MasterDataDetailStateKind = 'loading' | 'not-found' | 'stale' | 'denied' | 'ready';
export type MasterDataEditStateKind = 'editing' | 'saving' | 'success' | 'cancelled' | 'error' | 'denied';

export type MasterDataListState = {
  entity: MasterDataEntity;
  kind: MasterDataListStateKind;
  count: number;
  parentTarget: '/dashboard';
  fallbackTarget: '/dashboard';
};

export type MasterDataDetailState = {
  entity: MasterDataEntity;
  kind: MasterDataDetailStateKind;
  id: string;
  parentTarget: string;
  fallbackTarget: '/dashboard';
};

export type MasterDataEditState = {
  entity: MasterDataEntity;
  kind: MasterDataEditStateKind;
  id: string;
  parentTarget: string;
  successTarget: string;
  cancelTarget: string;
};

export type CompanySubscriptionState = {
  kind: 'ready' | 'loading' | 'stale' | 'denied' | 'not-found' | 'mutation-blocked' | 'mutation-success' | 'mutation-error';
  companyId: string;
  parentTarget: string;
  routeCapability: 'canManageHiringCompanies';
  mutationCapability: 'canManagePlatformSubscriptions';
  canMutateSubscription: boolean;
  blockedReason?: 'missing-platform-subscription-capability' | 'stale-company' | 'not-found';
  refreshTargets: Array<'company-detail' | 'company-subscription' | 'subscriptions-list'>;
};

export function buildMasterDataListState(entity: MasterDataEntity, count = 1, kind?: MasterDataListStateKind): MasterDataListState {
  const resolvedKind = kind ?? (count > 0 ? 'ready' : 'empty');
  return { entity, kind: resolvedKind, count, parentTarget: '/dashboard', fallbackTarget: '/dashboard' };
}

export function buildMasterDataDetailState(entity: MasterDataEntity, id: string, kind: MasterDataDetailStateKind = 'ready'): MasterDataDetailState {
  return { entity, id, kind, parentTarget: getListTarget(entity), fallbackTarget: '/dashboard' };
}

export function buildMasterDataEditState(entity: MasterDataEntity, id: string, kind: MasterDataEditStateKind = 'editing'): MasterDataEditState {
  const parentTarget = getDetailTarget(entity, id);
  return { entity, id, kind, parentTarget, successTarget: parentTarget, cancelTarget: parentTarget };
}

export function buildCompanySubscriptionState(
  companyId: string,
  options: { routeAllowed?: boolean; mutationAllowed?: boolean; stale?: boolean; notFound?: boolean; mutationOutcome?: 'success' | 'error' } = {},
): CompanySubscriptionState {
  const routeAllowed = options.routeAllowed ?? true;
  const mutationAllowed = options.mutationAllowed ?? true;
  const parentTarget = `/hiring-companies/${companyId}`;

  if (!routeAllowed) {
    return baseCompanySubscriptionState(companyId, parentTarget, 'denied', false, 'missing-platform-subscription-capability');
  }

  if (options.notFound) {
    return baseCompanySubscriptionState(companyId, parentTarget, 'not-found', false, 'not-found');
  }

  if (options.stale) {
    return baseCompanySubscriptionState(companyId, parentTarget, 'stale', false, 'stale-company');
  }

  if (!mutationAllowed) {
    return baseCompanySubscriptionState(companyId, parentTarget, 'mutation-blocked', false, 'missing-platform-subscription-capability');
  }

  if (options.mutationOutcome === 'success') {
    return baseCompanySubscriptionState(companyId, parentTarget, 'mutation-success', true);
  }

  if (options.mutationOutcome === 'error') {
    return baseCompanySubscriptionState(companyId, parentTarget, 'mutation-error', true);
  }

  return baseCompanySubscriptionState(companyId, parentTarget, 'ready', true);
}

export function getListTarget(entity: MasterDataEntity) {
  if (entity === 'hiring-company') return '/hiring-companies';
  if (entity === 'recruitment-agency') return '/recruitment-agencies';
  return '/subscriptions';
}

export function getDetailTarget(entity: MasterDataEntity, id: string) {
  if (entity === 'hiring-company') return `/hiring-companies/${id}`;
  if (entity === 'recruitment-agency') return `/recruitment-agencies/${id}`;
  return `/subscriptions/${id}`;
}

function baseCompanySubscriptionState(
  companyId: string,
  parentTarget: string,
  kind: CompanySubscriptionState['kind'],
  canMutateSubscription: boolean,
  blockedReason?: CompanySubscriptionState['blockedReason'],
): CompanySubscriptionState {
  return {
    companyId,
    parentTarget,
    kind,
    routeCapability: 'canManageHiringCompanies',
    mutationCapability: 'canManagePlatformSubscriptions',
    canMutateSubscription,
    blockedReason,
    refreshTargets: ['company-detail', 'company-subscription', 'subscriptions-list'],
  };
}
