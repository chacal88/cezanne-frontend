import { Link, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useCapabilities } from '../../../lib/access-control';
import { buildJobsListViewModel } from '../support/adapters';
import type { JobsListScope, JobsListState } from '../support/models';

const allowedScopes: JobsListScope[] = ['open', 'draft', 'archived', 'assigned'];

export function validateJobsListSearch(search: Record<string, unknown>): JobsListState {
  const pageValue = typeof search.page === 'string' ? Number.parseInt(search.page, 10) : typeof search.page === 'number' ? search.page : 1;
  return {
    scope: 'open',
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
    search: typeof search.search === 'string' && search.search.length > 0 ? search.search : undefined,
    asAdmin: search.asAdmin === true || search.asAdmin === 'true',
    label: typeof search.label === 'string' && search.label.length > 0 ? search.label : undefined,
  };
}

export function validateJobsListScope(scope: unknown): JobsListScope {
  return typeof scope === 'string' && (allowedScopes as readonly string[]).includes(scope) ? (scope as JobsListScope) : 'open';
}

export function hasJobsListFilters(state: Pick<JobsListState, 'search' | 'asAdmin' | 'label'>): boolean {
  return Boolean(state.search || state.asAdmin || state.label);
}

export function buildJobsListClearFiltersSearch(scope: JobsListScope): JobsListState {
  return {
    scope,
    page: 1,
    search: undefined,
    asAdmin: false,
    label: undefined,
  };
}

export function JobsListPage({ scope }: { scope: JobsListScope }) {
  const search = useSearch({ strict: false }) as Omit<JobsListState, 'scope'>;
  const capabilities = useCapabilities();
  const { t } = useTranslation('jobs');
  const viewModel = buildJobsListViewModel({ scope, ...search }, capabilities.canCreateJob);
  const showClearFilters = hasJobsListFilters(viewModel);

  return (
    <section>
      <h1>{t('list.title')}</h1>
      <p>{t('list.detail')}</p>
      <dl>
        <dt>{t('list.scope')}</dt>
        <dd data-testid="jobs-list-scope">{viewModel.scope}</dd>
        <dt>{t('list.search')}</dt>
        <dd data-testid="jobs-list-search">{viewModel.search ?? '—'}</dd>
        <dt>{t('list.page')}</dt>
        <dd data-testid="jobs-list-page">{viewModel.page}</dd>
        <dt>{t('list.adminView')}</dt>
        <dd data-testid="jobs-list-as-admin">{String(viewModel.asAdmin)}</dd>
        <dt>{t('list.label')}</dt>
        <dd data-testid="jobs-list-label">{viewModel.label ?? '—'}</dd>
        <dt>List state</dt>
        <dd data-testid="jobs-list-state">{viewModel.state.kind}</dd>
        <dt>ATS sync</dt>
        <dd data-testid="jobs-list-ats-state">{viewModel.atsStatus?.kind ?? 'unavailable'}</dd>
      </dl>

      <p data-testid="jobs-list-state-message">{viewModel.state.message}</p>
      <p data-testid="jobs-list-create-state">{viewModel.createPath ? t('list.allowedCreate') : t('list.blockedCreate')}</p>

      {showClearFilters ? (
        <Link
          to="/jobs/$scope"
          params={{ scope }}
          search={buildJobsListClearFiltersSearch(scope)}
          data-testid="jobs-list-clear-filters"
        >
          {t('list.clearFilters')}
        </Link>
      ) : null}

      {viewModel.createPath ? (
        <Link to="/jobs/manage" search={{ resetWorkflow: false, copyFromJobId: undefined, saveState: undefined }} data-testid="jobs-create-link">
          {t('list.newJob')}
        </Link>
      ) : null}

      {viewModel.items.length > 0 ? (
        <ul data-testid="jobs-list-results">
          {viewModel.items.map((job) => (
            <li key={job.id}>
              <Link to="/job/$jobId" params={{ jobId: job.id }} search={{ section: 'overview', degradedSections: undefined, unavailable: false, transition: false, assignment: false }} data-testid={`jobs-open-detail-link-${job.id}`}>
                {job.title}
              </Link>{' '}
              <span>({job.status})</span>
              <span> · {job.assignedRecruiter ?? 'unassigned'}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div role="status" data-testid="jobs-list-no-results">
          {viewModel.state.message}
        </div>
      )}
    </section>
  );
}
