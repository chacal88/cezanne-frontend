import { useLocation, Navigate } from '@tanstack/react-router';
import { buildCandidateDatabaseDetailPath, candidateDatabaseCanonicalPath, parseCandidateDatabaseSearchFromUrl } from '../support/candidate-database-routing';

export function CandidateDatabasePage() {
  const location = useLocation();
  const state = parseCandidateDatabaseSearchFromUrl(window.location.search);

  if (location.pathname !== candidateDatabaseCanonicalPath) {
    return <Navigate to={candidateDatabaseCanonicalPath} search={state} replace />;
  }

  const detailPath = buildCandidateDatabaseDetailPath('candidate-123', state);

  return (
    <section>
      <h1>Candidate database</h1>
      <p data-testid="candidate-database-query">{state.query || '—'}</p>
      <p data-testid="candidate-database-page">{state.page}</p>
      <p data-testid="candidate-database-sort">{state.sort}</p>
      <p data-testid="candidate-database-order">{state.order}</p>
      <p data-testid="candidate-database-stage">{state.stage ?? '—'}</p>
      <p data-testid="candidate-database-tags">{state.tags.join(',') || '—'}</p>
      <a href={detailPath} data-testid="candidate-database-detail-link">
        Open candidate from database
      </a>
    </section>
  );
}
