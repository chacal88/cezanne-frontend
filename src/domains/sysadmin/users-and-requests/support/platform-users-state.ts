export type PlatformUserFilters = {
  page: number;
  search?: string;
  hiringCompanyId?: string;
  recruitmentAgencyId?: string;
};

export type PlatformUserListState = {
  kind: 'ready' | 'loading' | 'empty' | 'error' | 'denied';
  filters: PlatformUserFilters;
  returnTo: string;
  orgScope: false;
};

export type PlatformUserDetailState = {
  kind: 'ready' | 'loading' | 'not-found' | 'permission-denied' | 'stale';
  userId: string;
  parentTarget: string;
  orgScope: false;
};

export type PlatformUserEditState = {
  kind: 'editing' | 'saving' | 'success' | 'cancelled' | 'error' | 'permission-denied';
  userId: string;
  parentTarget: string;
  successTarget: string;
  cancelTarget: string;
  orgScope: false;
};

export type PlatformUserCreateState = {
  kind: 'editing' | 'saving' | 'success' | 'cancelled' | 'error' | 'permission-denied';
  parentTarget: string;
  successTarget: string;
  cancelTarget: string;
  orgScope: false;
};

const platformUserListStateKinds: PlatformUserListState['kind'][] = ['ready', 'loading', 'empty', 'error', 'denied'];
const platformUserDetailStateKinds: PlatformUserDetailState['kind'][] = ['ready', 'loading', 'not-found', 'permission-denied', 'stale'];
const platformUserEditStateKinds: PlatformUserEditState['kind'][] = ['editing', 'saving', 'success', 'cancelled', 'error', 'permission-denied'];
const platformUserCreateStateKinds: PlatformUserCreateState['kind'][] = ['editing', 'saving', 'success', 'cancelled', 'error', 'permission-denied'];

export function parsePlatformUserListStateKind(value: unknown): PlatformUserListState['kind'] {
  return typeof value === 'string' && platformUserListStateKinds.includes(value as PlatformUserListState['kind'])
    ? (value as PlatformUserListState['kind'])
    : 'ready';
}

export function parsePlatformUserDetailStateKind(value: unknown): PlatformUserDetailState['kind'] {
  return typeof value === 'string' && platformUserDetailStateKinds.includes(value as PlatformUserDetailState['kind'])
    ? (value as PlatformUserDetailState['kind'])
    : 'ready';
}

export function parsePlatformUserEditStateKind(value: unknown): PlatformUserEditState['kind'] {
  return typeof value === 'string' && platformUserEditStateKinds.includes(value as PlatformUserEditState['kind'])
    ? (value as PlatformUserEditState['kind'])
    : 'editing';
}

export function parsePlatformUserCreateStateKind(value: unknown): PlatformUserCreateState['kind'] {
  return typeof value === 'string' && platformUserCreateStateKinds.includes(value as PlatformUserCreateState['kind'])
    ? (value as PlatformUserCreateState['kind'])
    : 'editing';
}

export function parsePlatformUserFilters(search: Record<string, unknown>): PlatformUserFilters {
  const page = typeof search.page === 'number' ? search.page : Number(search.page);
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    ...cleanStringFilter('search', search.search),
    ...cleanStringFilter('hiringCompanyId', search.hiringCompanyId),
    ...cleanStringFilter('recruitmentAgencyId', search.recruitmentAgencyId),
  };
}

export function buildPlatformUsersListTarget(filters: PlatformUserFilters) {
  const params = new URLSearchParams();
  if (filters.page > 1) params.set('page', String(filters.page));
  if (filters.search) params.set('search', filters.search);
  if (filters.hiringCompanyId) params.set('hiringCompanyId', filters.hiringCompanyId);
  if (filters.recruitmentAgencyId) params.set('recruitmentAgencyId', filters.recruitmentAgencyId);
  const qs = params.toString();
  return qs ? `/users?${qs}` : '/users';
}

export function buildPlatformUserListState(search: Record<string, unknown>, kind: PlatformUserListState['kind'] = 'ready'): PlatformUserListState {
  const filters = parsePlatformUserFilters(search);
  return { kind, filters, returnTo: buildPlatformUsersListTarget(filters), orgScope: false };
}

export function buildPlatformUserDetailState(userId: string, returnTo = '/users', kind: PlatformUserDetailState['kind'] = 'ready'): PlatformUserDetailState {
  return { kind, userId, parentTarget: sanitizePlatformUsersReturn(returnTo), orgScope: false };
}

export function buildPlatformUserEditState(userId: string, returnTo = `/users/${userId}`, kind: PlatformUserEditState['kind'] = 'editing'): PlatformUserEditState {
  const parentTarget = sanitizePlatformUsersReturn(returnTo);
  return { kind, userId, parentTarget, successTarget: parentTarget, cancelTarget: parentTarget, orgScope: false };
}

export function buildPlatformUserCreateState(returnTo = '/users', kind: PlatformUserCreateState['kind'] = 'editing'): PlatformUserCreateState {
  const parentTarget = sanitizePlatformUsersReturn(returnTo);
  return { kind, parentTarget, successTarget: parentTarget, cancelTarget: parentTarget, orgScope: false };
}

export function sanitizePlatformUsersReturn(value: string) {
  return value.startsWith('/users') && value !== '/users/invite' ? value : '/users';
}

function cleanStringFilter(key: 'search' | 'hiringCompanyId' | 'recruitmentAgencyId', value: unknown) {
  return typeof value === 'string' && value.trim() ? { [key]: value.trim() } : {};
}
