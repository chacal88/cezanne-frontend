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

export function JobsListPage({ scope }: { scope: JobsListScope }) {
  const search = useSearch({ strict: false }) as Omit<JobsListState, 'scope'>;
  const capabilities = useCapabilities();
  const { t } = useTranslation('jobs');
  const viewModel = buildJobsListViewModel({ scope, ...search }, capabilities.canCreateJob);

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
      </dl>
      <p data-testid="jobs-list-create-state">{viewModel.createPath ? t('list.allowedCreate') : t('list.blockedCreate')}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link
          to="/job/$jobId"
          params={{ jobId: 'job-123' }}
          search={{ section: 'candidates' }}
          data-testid="jobs-open-detail-link"
        >
          {t('list.openExample')}
        </Link>
        {viewModel.createPath ? (
          <Link to="/jobs/manage" search={{ resetWorkflow: false }} data-testid="jobs-create-link">
            {t('list.newJob')}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
