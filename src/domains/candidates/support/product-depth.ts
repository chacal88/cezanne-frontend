import type { CandidateActionKind, CandidateDegradedSection, CandidateRouteEntryMode } from './models';

export type CandidateHubProductStateKind = 'loading' | 'ready' | 'partial-degraded' | 'denied' | 'not-found' | 'stale-context' | 'unavailable';
export type CandidateDatabaseProductStateKind = 'loading' | 'ready' | 'empty' | 'denied' | 'unavailable' | 'stale' | 'degraded' | 'retryable';
export type CandidateDatabaseAdvancedSearchStateKind = 'simple' | 'advanced-ready' | 'invalid-query' | 'unsupported-query';
export type CandidateDatabaseBulkActionStateKind = 'none-selected' | 'eligible' | 'partially-eligible' | 'blocked' | 'submitting' | 'succeeded' | 'failed' | 'retryable';
export type CandidateSequenceProductStateKind = 'direct' | 'job-context' | 'database-return' | 'notification' | 'stale-ordering' | 'unavailable-sequence';
export type CandidateActionProductStateKind = 'ready' | 'blocked' | 'saving' | 'submitting' | 'succeeded' | 'failed' | 'retryable' | 'terminal' | 'parent-refresh-required';
export type CandidateSummaryProductStateKind = 'ready' | 'degraded' | 'stale' | 'unauthorized' | 'unavailable' | 'parent-refresh-required' | 'downstream-owned';

export function resolveCandidateHubProductState(input: { loading?: boolean; denied?: boolean; notFound?: boolean; unavailable?: boolean; staleContext?: boolean; degradedSections?: CandidateDegradedSection[] }) {
  if (input.loading) return { kind: 'loading' as const };
  if (input.denied) return { kind: 'denied' as const };
  if (input.notFound) return { kind: 'not-found' as const };
  if (input.unavailable) return { kind: 'unavailable' as const };
  if (input.staleContext) return { kind: 'stale-context' as const };
  if (input.degradedSections?.length) return { kind: 'partial-degraded' as const, degradedSections: input.degradedSections };
  return { kind: 'ready' as const };
}

export function resolveCandidateDatabaseProductState(input: { loading?: boolean; denied?: boolean; unavailable?: boolean; stale?: boolean; degraded?: boolean; retryable?: boolean; resultCount?: number }) {
  if (input.loading) return { kind: 'loading' as const };
  if (input.denied) return { kind: 'denied' as const };
  if (input.unavailable) return { kind: 'unavailable' as const };
  if (input.stale) return { kind: 'stale' as const };
  if (input.retryable) return { kind: 'retryable' as const };
  if (input.degraded) return { kind: 'degraded' as const };
  if (input.resultCount === 0) return { kind: 'empty' as const };
  return { kind: 'ready' as const, resultCount: input.resultCount };
}

export function resolveCandidateDatabaseAdvancedSearchState(input: { advancedMode?: boolean; queryState?: 'valid' | 'invalid' | 'unsupported'; advancedQueryId?: string }) {
  if (!input.advancedMode) return { kind: 'simple' as CandidateDatabaseAdvancedSearchStateKind };
  if (input.queryState === 'invalid') return { kind: 'invalid-query' as CandidateDatabaseAdvancedSearchStateKind, advancedQueryId: input.advancedQueryId };
  if (input.queryState === 'unsupported') return { kind: 'unsupported-query' as CandidateDatabaseAdvancedSearchStateKind, advancedQueryId: input.advancedQueryId };
  return { kind: 'advanced-ready' as CandidateDatabaseAdvancedSearchStateKind, advancedQueryId: input.advancedQueryId };
}

export function resolveCandidateDatabaseBulkActionState(input: { selectedCount?: number; eligibleCount?: number; submitting?: boolean; succeeded?: boolean; failed?: boolean; retryable?: boolean; blocked?: boolean }) {
  const selectedCount = input.selectedCount ?? 0;
  const eligibleCount = input.eligibleCount ?? 0;
  if (input.submitting) return { kind: 'submitting' as CandidateDatabaseBulkActionStateKind, selectedCount, eligibleCount };
  if (input.succeeded) return { kind: 'succeeded' as CandidateDatabaseBulkActionStateKind, selectedCount, eligibleCount };
  if (input.retryable) return { kind: 'retryable' as CandidateDatabaseBulkActionStateKind, selectedCount, eligibleCount };
  if (input.failed) return { kind: 'failed' as CandidateDatabaseBulkActionStateKind, selectedCount, eligibleCount };
  if (input.blocked) return { kind: 'blocked' as CandidateDatabaseBulkActionStateKind, selectedCount, eligibleCount };
  if (selectedCount === 0) return { kind: 'none-selected' as CandidateDatabaseBulkActionStateKind, selectedCount, eligibleCount };
  if (eligibleCount > 0 && eligibleCount < selectedCount) return { kind: 'partially-eligible' as CandidateDatabaseBulkActionStateKind, selectedCount, eligibleCount };
  if (eligibleCount === selectedCount) return { kind: 'eligible' as CandidateDatabaseBulkActionStateKind, selectedCount, eligibleCount };
  return { kind: 'blocked' as CandidateDatabaseBulkActionStateKind, selectedCount, eligibleCount };
}

export function resolveCandidateSequenceProductState(input: { entryMode: CandidateRouteEntryMode; hasSequence?: boolean; stale?: boolean; databaseReturnTarget?: string }) {
  if (input.stale) return { kind: 'stale-ordering' as const };
  if (!input.hasSequence && input.entryMode === 'job') return { kind: 'unavailable-sequence' as const };
  if (input.entryMode === 'database') return { kind: 'database-return' as const, returnTarget: input.databaseReturnTarget };
  if (input.entryMode === 'notification') return { kind: 'notification' as const };
  if (input.entryMode === 'job') return { kind: 'job-context' as const };
  return { kind: 'direct' as const };
}

export function resolveCandidateActionProductState(input: { kind: CandidateActionKind | 'move' | 'hire' | 'unhire' | 'review-request' | 'comment' | 'tag' | 'cv-upload' | 'conversation'; blocked?: boolean; saving?: boolean; submitting?: boolean; succeeded?: boolean; failed?: boolean; retryable?: boolean; terminal?: boolean; parentRefresh?: boolean }) {
  if (input.parentRefresh) return { kind: 'parent-refresh-required' as const, action: input.kind };
  if (input.terminal) return { kind: 'terminal' as const, action: input.kind };
  if (input.blocked) return { kind: 'blocked' as const, action: input.kind };
  if (input.saving) return { kind: 'saving' as const, action: input.kind };
  if (input.submitting) return { kind: 'submitting' as const, action: input.kind };
  if (input.succeeded) return { kind: 'succeeded' as const, action: input.kind };
  if (input.retryable) return { kind: 'retryable' as const, action: input.kind };
  if (input.failed) return { kind: 'failed' as const, action: input.kind };
  return { kind: 'ready' as const, action: input.kind };
}

export function resolveCandidateSummaryProductState(input: { degraded?: boolean; stale?: boolean; unauthorized?: boolean; unavailable?: boolean; parentRefresh?: boolean; downstreamOwned?: boolean }) {
  if (input.parentRefresh) return { kind: 'parent-refresh-required' as const };
  if (input.downstreamOwned) return { kind: 'downstream-owned' as const };
  if (input.unauthorized) return { kind: 'unauthorized' as const };
  if (input.unavailable) return { kind: 'unavailable' as const };
  if (input.stale) return { kind: 'stale' as const };
  if (input.degraded) return { kind: 'degraded' as const };
  return { kind: 'ready' as const };
}

export function buildCandidateSafeTelemetry(input: { routeFamily: 'candidate-detail' | 'candidate-action' | 'candidate-database'; action: string; state: string; entryMode?: CandidateRouteEntryMode }) {
  return {
    name: 'candidate_product_depth_event' as const,
    data: {
      routeFamily: input.routeFamily,
      action: input.action,
      state: input.state,
      entryMode: input.entryMode,
    },
  };
}
