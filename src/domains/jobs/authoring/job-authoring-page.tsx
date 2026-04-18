import { useTranslation } from 'react-i18next';
import { useCapabilities } from '../../../lib/access-control';
import { normalizeJobAuthoringDraft, serializeJobAuthoringDraft } from '../support/adapters';

export function validateJobAuthoringSearch(search: Record<string, unknown>) {
  return {
    resetWorkflow: search.resetWorkflow === true || search.resetWorkflow === 'true',
  };
}

export function JobAuthoringPage({ jobId, resetWorkflow }: { jobId?: string; resetWorkflow: boolean }) {
  const capabilities = useCapabilities();
  const { t } = useTranslation('jobs');
  const draft = normalizeJobAuthoringDraft({ jobId });
  const serialized = serializeJobAuthoringDraft(draft);
  const branching = capabilities.canUseJobRequisitionBranching ? 'requisition-aware' : 'ordinary-jobs';

  return (
    <section>
      <h1>{jobId ? t('authoring.editTitle') : t('authoring.createTitle')}</h1>
      <p>{t('authoring.detail')}</p>
      <dl>
        <dt>{t('authoring.mode')}</dt>
        <dd data-testid="job-authoring-mode">{jobId ? 'edit' : 'create'}</dd>
        <dt>{t('authoring.branching')}</dt>
        <dd data-testid="job-authoring-branching">{branching}</dd>
        <dt>{t('authoring.resetWorkflow')}</dt>
        <dd data-testid="job-authoring-reset-workflow">{String(resetWorkflow)}</dd>
      </dl>
      <h2>{t('authoring.savePayload')}</h2>
      <pre data-testid="job-authoring-save-payload">{JSON.stringify(serialized, null, 2)}</pre>
    </section>
  );
}
