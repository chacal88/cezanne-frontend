import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { normalizeJobHub } from '../support/adapters';
import type { JobHubSection } from '../support/models';

export const allowedJobHubSections: JobHubSection[] = ['overview', 'candidates', 'workflow', 'activity'];

export function validateJobDetailSearch(search: Record<string, unknown>) {
  const section = typeof search.section === 'string' && (allowedJobHubSections as readonly string[]).includes(search.section)
    ? (search.section as JobHubSection)
    : 'overview';

  const degradedSections = typeof search.degradedSection === 'string' && (allowedJobHubSections as readonly string[]).includes(search.degradedSection)
    ? [search.degradedSection as JobHubSection]
    : undefined;

  return {
    section,
    degradedSections,
    unavailable: search.unavailable === true || search.unavailable === 'true',
    transition: search.transition === true || search.transition === 'true',
    assignment: search.assignment === true || search.assignment === 'true',
  };
}

export function JobDetailPage({ jobId, section, degradedSections, unavailable, transition, assignment }: { jobId: string; section: JobHubSection; degradedSections?: JobHubSection[]; unavailable?: boolean; transition?: boolean; assignment?: boolean }) {
  const { t } = useTranslation('jobs');
  const viewModel = normalizeJobHub({ jobId, section, degradedSections, unavailable, transition, assignment });
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
        <dt>Share state</dt>
        <dd data-testid="job-detail-share-state">{viewModel.shareState}</dd>
        <dt>Section state</dt>
        <dd data-testid="job-detail-section-state">{viewModel.sectionState.kind}</dd>
      </dl>
      <p data-testid="job-detail-state-message">{viewModel.sectionState.message}</p>

      <h2>Summaries</h2>
      <ul data-testid="job-detail-summaries">
        {viewModel.summaries.map((summary) => (
          <li key={summary.key} data-testid={`job-detail-summary-${summary.key}`}>
            {summary.label}: {summary.state} {typeof summary.count === 'number' ? `(${summary.count})` : ''}
          </li>
        ))}
      </ul>

      <h2>Status transitions</h2>
      <ul data-testid="job-detail-transitions">
        {viewModel.transitions.map((transitionState) => (
          <li key={transitionState.action}>{transitionState.action}: {transitionState.state}</li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: 12 }}>
        <Link
          to="/job/$jobId/cv/$candidateId/schedule"
          params={{ jobId, candidateId: 'candidate-456' }}
          search={{ parent, section, outcome: undefined, parentRefresh: false }}
          data-testid="job-open-schedule-link"
        >
          {t('detail.openSchedule')}
        </Link>
        <Link
          to="/job/$jobId/cv/$candidateId/offer"
          params={{ jobId, candidateId: 'candidate-456' }}
          search={{ parent, section, outcome: undefined, parentRefresh: false }}
          data-testid="job-open-offer-link"
        >
          {t('detail.openOffer')}
        </Link>
      </div>
    </section>
  );
}
