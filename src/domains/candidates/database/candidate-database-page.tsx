import { useLocation, Navigate } from '@tanstack/react-router';
import { buildCandidateDatabaseDetailPath, candidateDatabaseCanonicalPath, parseCandidateDatabaseSearchFromUrl } from '../support/candidate-database-routing';
import { buildCandidateDatabaseAtsRow } from '../support/ats-operational-adapters';
import { resolveCandidateDatabaseAdvancedSearchState, resolveCandidateDatabaseBulkActionState, resolveCandidateDatabaseProductState } from '../support/product-depth';

export function CandidateDatabasePage() {
  const location = useLocation();
  const state = parseCandidateDatabaseSearchFromUrl(window.location.search);

  if (location.pathname !== candidateDatabaseCanonicalPath) {
    return <Navigate to={candidateDatabaseCanonicalPath} search={state} replace />;
  }

  const resultCount = state.query === 'empty' ? 0 : 1;
  const productState = resolveCandidateDatabaseProductState({
    resultCount,
    stale: state.tags.includes('stale'),
    degraded: state.tags.includes('degraded'),
    retryable: state.tags.includes('retry'),
  });
  const advancedSearchState = resolveCandidateDatabaseAdvancedSearchState({
    advancedMode: state.advancedMode,
    queryState: state.advancedQueryState,
    advancedQueryId: state.advancedQueryId,
  });
  const bulkActionState = resolveCandidateDatabaseBulkActionState({
    selectedCount: state.tags.includes('bulk') ? 2 : 0,
    eligibleCount: state.tags.includes('bulk-partial') ? 1 : state.tags.includes('bulk') ? 2 : 0,
    failed: state.tags.includes('bulk-failed'),
    retryable: state.tags.includes('bulk-retry'),
    blocked: state.tags.includes('bulk-blocked'),
  });
  const detailPath = buildCandidateDatabaseDetailPath('candidate-123', state);
  const atsRow = buildCandidateDatabaseAtsRow({
    candidateId: 'candidate-123',
    listState: state,
    providerId: 'greenhouse',
    providerLabel: 'Greenhouse',
    hasDuplicate: state.tags.includes('duplicate'),
    importStatus: state.tags.includes('import-failed') ? 'failed' : undefined,
  });

  return (
    <section>
      <h1>Candidate database</h1>
      <p data-testid="candidate-database-query">{state.query || '—'}</p>
      <p data-testid="candidate-database-page">{state.page}</p>
      <p data-testid="candidate-database-sort">{state.sort}</p>
      <p data-testid="candidate-database-order">{state.order}</p>
      <p data-testid="candidate-database-stage">{state.stage ?? '—'}</p>
      <p data-testid="candidate-database-tags">{state.tags.join(',') || '—'}</p>
      <p data-testid="candidate-database-product-state">{productState.kind}</p>
      <p data-testid="candidate-database-advanced-state">{advancedSearchState.kind}</p>
      <p data-testid="candidate-database-advanced-query-id">{advancedSearchState.advancedQueryId ?? '—'}</p>
      <p data-testid="candidate-database-bulk-state">{bulkActionState.kind}</p>
      <p data-testid="candidate-database-bulk-selection">{bulkActionState.selectedCount}/{bulkActionState.eligibleCount}</p>
      <p data-testid="candidate-database-ats-state">{atsRow.atsState.kind}</p>
      <p data-testid="candidate-database-ats-return">{atsRow.candidatePath}</p>
      {productState.kind === 'empty' ? (
        <p data-testid="candidate-database-empty-state">No candidates match the current search.</p>
      ) : (
        <a href={detailPath} data-testid="candidate-database-detail-link">
          Open candidate from database
        </a>
      )}
    </section>
  );
}
