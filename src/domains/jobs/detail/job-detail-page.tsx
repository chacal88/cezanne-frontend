import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { normalizeJobHub } from '../support/adapters';
import type { JobHubSection } from '../support/models';

export const allowedJobHubSections: JobHubSection[] = ['overview', 'candidates', 'workflow', 'activity'];

export function validateJobDetailSearch(search: Record<string, unknown>) {
  const section = typeof search.section === 'string' && (allowedJobHubSections as readonly string[]).includes(search.section)
    ? (search.section as JobHubSection)
    : 'overview';

  return { section };
}

export function JobDetailPage({ jobId, section }: { jobId: string; section: JobHubSection }) {
  const { t } = useTranslation('jobs');
  const viewModel = normalizeJobHub({ jobId, section });
  const parent = `/job/${jobId}?section=${section}`;

  return (
    <section>
      <h1>{t('detail.title')}</h1>
      <p>{t('detail.detail')}</p>
      <dl>
        <dt>{t('detail.section')}</dt>
        <dd data-testid="job-detail-section">{viewModel.section}</dd>
        <dt>{t('detail.workflow')}</dt>
        <dd data-testid="job-detail-workflow">{viewModel.workflowState}</dd>
        <dt>{t('detail.assignments')}</dt>
        <dd data-testid="job-detail-assignments">{viewModel.assignments.join(', ')}</dd>
      </dl>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link
          to="/job/$jobId/cv/$candidateId/schedule"
          params={{ jobId, candidateId: 'candidate-456' }}
          search={{ parent, section }}
          data-testid="job-open-schedule-link"
        >
          {t('detail.openSchedule')}
        </Link>
        <Link
          to="/job/$jobId/cv/$candidateId/offer"
          params={{ jobId, candidateId: 'candidate-456' }}
          search={{ parent, section }}
          data-testid="job-open-offer-link"
        >
          {t('detail.openOffer')}
        </Link>
      </div>
    </section>
  );
}
