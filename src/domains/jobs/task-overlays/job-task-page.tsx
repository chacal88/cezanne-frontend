import { useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { resolveJobTaskContext } from './job-task-context';
import type { JobHubSection, JobTaskKind } from '../support/models';

export function JobTaskPage({
  kind,
  jobId,
  candidateId,
  bidId,
  parent,
  section,
}: {
  kind: JobTaskKind;
  jobId: string;
  candidateId?: string;
  bidId?: string;
  parent?: string;
  section?: JobHubSection;
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
      </dl>
      <div style={{ display: 'flex', gap: 12 }}>
        <a href={context.parentTarget} data-testid="job-task-close-link">
          {t('tasks.close')}
        </a>
        <a href={context.parentTarget} data-testid="job-task-complete-link">
          {t('tasks.complete')}
        </a>
      </div>
    </section>
  );
}
