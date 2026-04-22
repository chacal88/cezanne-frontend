import { useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { resolveJobTaskContext, type JobTaskReadinessFixtureState } from './job-task-context';
import type { JobHubSection, JobTaskKind } from '../support/models';

export function JobTaskPage({
  kind,
  jobId,
  candidateId,
  bidId,
  parent,
  section,
  outcome,
  parentRefresh,
  readinessState,
}: {
  kind: JobTaskKind;
  jobId: string;
  candidateId?: string;
  bidId?: string;
  parent?: string;
  section?: JobHubSection;
  outcome?: 'submit' | 'success' | 'fail' | 'retry' | 'cancel';
  parentRefresh?: boolean;
  readinessState?: JobTaskReadinessFixtureState;
}) {
  const location = useLocation();
  const { t } = useTranslation('jobs');
  const context = resolveJobTaskContext({
    kind,
    pathname: location.pathname,
    jobId,
    candidateId,
    bidId,
    parent,
    section,
    outcome,
    parentRefresh,
    readinessState,
  });

  return (
    <section>
      <h1>{t('tasks.title')}</h1>
      <p>{t('tasks.detail')}</p>
      <dl>
        <dt>{t('tasks.kind')}</dt>
        <dd data-testid="job-task-kind">{context.kind}</dd>
        <dt>{t('tasks.job')}</dt>
        <dd data-testid="job-task-job">{context.jobId}</dd>
        <dt>{t('tasks.candidate')}</dt>
        <dd data-testid="job-task-candidate">{context.candidateId ?? '—'}</dd>
        <dt>{t('tasks.bid')}</dt>
        <dd data-testid="job-task-bid">{context.bidId ?? '—'}</dd>
        <dt>{t('tasks.parent')}</dt>
        <dd data-testid="job-task-parent">{context.parentTarget}</dd>
        <dt>Direct entry</dt>
        <dd data-testid="job-task-direct-entry">{String(context.directEntry)}</dd>
        <dt>Operation state</dt>
        <dd data-testid="job-task-operation-state">{context.operationState.kind}</dd>
        <dt>Parent refresh intent</dt>
        <dd data-testid="job-task-parent-refresh-intent">{String(context.parentRefreshIntent)}</dd>
        <dt>Contract state</dt>
        <dd data-testid="job-contract-task-state">{context.contractSigningState?.kind ?? 'not-contract-task'}</dd>
        <dt>Readiness state</dt>
        <dd data-testid="job-task-readiness-state">{context.readinessGate?.state ?? 'not-readiness-gated'}</dd>
      </dl>
      <p data-testid="job-task-state-message">{context.operationState.message}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <a href={context.parentTarget} data-testid="job-task-close-link">
          {t('tasks.close')}
        </a>
        <a href={`${context.parentTarget}${context.parentTarget.includes('?') ? '&' : '?'}refresh=job-task`} data-testid="job-task-complete-link">
          {t('tasks.complete')}
        </a>
      </div>
    </section>
  );
}
