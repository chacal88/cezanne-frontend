export type TaxonomyStateKind = 'ready' | 'loading' | 'empty' | 'error' | 'denied' | 'not-found' | 'stale' | 'mutation-success' | 'mutation-error';
export type TaxonomySurface = 'sector-list' | 'sector-detail' | 'subsector-list' | 'subsector-detail';

export type TaxonomyState = {
  surface: TaxonomySurface;
  kind: TaxonomyStateKind;
  parentTarget: string;
  routeFamily: 'taxonomy';
  settingsSubsection: false;
  masterDataRoute: false;
  sectorId?: string;
  subsectorId?: string;
};

const taxonomyStateKinds: TaxonomyStateKind[] = ['ready', 'loading', 'empty', 'error', 'denied', 'not-found', 'stale', 'mutation-success', 'mutation-error'];

export function parseTaxonomyStateKind(value: unknown): TaxonomyStateKind {
  return typeof value === 'string' && taxonomyStateKinds.includes(value as TaxonomyStateKind) ? (value as TaxonomyStateKind) : 'ready';
}

export function buildSectorListState(kind: TaxonomyStateKind = 'ready'): TaxonomyState {
  return baseState('sector-list', kind, '/dashboard');
}

export function buildSectorDetailState(sectorId: string, kind: TaxonomyStateKind = 'ready'): TaxonomyState {
  return { ...baseState('sector-detail', kind, '/sectors'), sectorId };
}

export function buildSubsectorListState(sectorId: string, kind: TaxonomyStateKind = 'ready'): TaxonomyState {
  return { ...baseState('subsector-list', kind, `/sectors/${sectorId}`), sectorId };
}

export function buildSubsectorDetailState(subsectorId: string, sectorId?: string, kind: TaxonomyStateKind = 'ready'): TaxonomyState {
  return { ...baseState('subsector-detail', kind, sectorId ? `/sectors/${sectorId}/subsectors` : '/sectors'), sectorId, subsectorId };
}

function baseState(surface: TaxonomySurface, kind: TaxonomyStateKind, parentTarget: string): TaxonomyState {
  return { surface, kind, parentTarget, routeFamily: 'taxonomy', settingsSubsection: false, masterDataRoute: false };
}
