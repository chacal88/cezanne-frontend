export type CandidateDatabaseSort = 'updatedAt' | 'name' | 'stage';
export type CandidateDatabaseOrder = 'asc' | 'desc';

export type CandidateDatabaseRouteState = {
  query: string;
  page: number;
  sort: CandidateDatabaseSort;
  order: CandidateDatabaseOrder;
  stage?: string;
  tags: string[];
  advancedMode: boolean;
  advancedQueryId?: string;
  advancedQueryState: 'valid' | 'invalid' | 'unsupported';
};

export const candidateDatabaseCanonicalPath = '/candidates-database' as const;
export const candidateDatabaseCompatPaths = ['/candidates-old', '/candidates-new'] as const;

const sortValues: CandidateDatabaseSort[] = ['updatedAt', 'name', 'stage'];
const orderValues: CandidateDatabaseOrder[] = ['asc', 'desc'];

function singleString(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function sanitizePage(value: unknown) {
  const parsed = Number.parseInt(singleString(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function sanitizeSort(value: unknown): CandidateDatabaseSort {
  const raw = singleString(value);
  return sortValues.includes(raw as CandidateDatabaseSort) ? (raw as CandidateDatabaseSort) : 'updatedAt';
}

function sanitizeOrder(value: unknown): CandidateDatabaseOrder {
  const raw = singleString(value);
  return orderValues.includes(raw as CandidateDatabaseOrder) ? (raw as CandidateDatabaseOrder) : 'desc';
}

function sanitizeTags(value: unknown) {
  const raw = Array.isArray(value) ? value.join(',') : singleString(value);
  if (!raw) return [];
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function validateCandidateDatabaseSearch(search: Record<string, unknown>): CandidateDatabaseRouteState {
  const query = singleString(search.query).slice(0, 200);
  const stage = singleString(search.stage).slice(0, 80) || undefined;

  return {
    query,
    page: sanitizePage(search.page),
    sort: sanitizeSort(search.sort),
    order: sanitizeOrder(search.order),
    stage,
    tags: sanitizeTags(search.tags),
    advancedMode: search.advanced === true || search.advanced === 'true' || search.advancedMode === true || search.advancedMode === 'true',
    advancedQueryId: singleString(search.advancedQueryId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || undefined,
    advancedQueryState: ['valid', 'invalid', 'unsupported'].includes(singleString(search.advancedQueryState))
      ? (singleString(search.advancedQueryState) as CandidateDatabaseRouteState['advancedQueryState'])
      : 'valid',
  };
}

export function parseCandidateDatabaseSearchFromUrl(searchValue: string): CandidateDatabaseRouteState {
  const params = new URLSearchParams(searchValue);
  return validateCandidateDatabaseSearch(Object.fromEntries(params.entries()));
}

export function buildCandidateDatabaseSearch(state: Partial<CandidateDatabaseRouteState>) {
  const sanitized = validateCandidateDatabaseSearch(state);
  const params = new URLSearchParams();
  if (sanitized.query) params.set('query', sanitized.query);
  if (sanitized.page !== 1) params.set('page', String(sanitized.page));
  if (sanitized.sort !== 'updatedAt') params.set('sort', sanitized.sort);
  if (sanitized.order !== 'desc') params.set('order', sanitized.order);
  if (sanitized.stage) params.set('stage', sanitized.stage);
  if (sanitized.tags.length > 0) params.set('tags', sanitized.tags.join(','));
  if (sanitized.advancedMode) params.set('advanced', 'true');
  if (sanitized.advancedQueryId) params.set('advancedQueryId', sanitized.advancedQueryId);
  if (sanitized.advancedQueryState !== 'valid') params.set('advancedQueryState', sanitized.advancedQueryState);
  return params.toString();
}

export function buildCandidateDatabasePath(state: Partial<CandidateDatabaseRouteState> = {}) {
  const query = buildCandidateDatabaseSearch(state);
  return query ? `${candidateDatabaseCanonicalPath}?${query}` : candidateDatabaseCanonicalPath;
}

export function sanitizeCandidateDatabaseReturnTarget(value: unknown) {
  const raw = singleString(value);
  if (!raw) return candidateDatabaseCanonicalPath;

  try {
    const url = new URL(raw, 'http://recruit.local');
    if (url.origin !== 'http://recruit.local') return candidateDatabaseCanonicalPath;
    if (url.pathname !== candidateDatabaseCanonicalPath && !(candidateDatabaseCompatPaths as readonly string[]).includes(url.pathname)) {
      return candidateDatabaseCanonicalPath;
    }
    return `${candidateDatabaseCanonicalPath}${url.search}`;
  } catch {
    return candidateDatabaseCanonicalPath;
  }
}

export function buildCandidateDatabaseDetailPath(candidateId: string, databaseState: Partial<CandidateDatabaseRouteState> = {}) {
  const returnTo = buildCandidateDatabasePath(databaseState);
  const params = new URLSearchParams({ entry: 'database', returnTo });
  return `/candidate/${candidateId}?${params.toString()}`;
}
