import { useTranslation } from 'react-i18next';
import { buildRequisitionDraftState, buildWorkflowDriftState } from './support/requisition-state';

export function BuildRequisitionPage() {
  const { t } = useTranslation('jobs');
  const state = buildRequisitionDraftState();
  return <RequisitionStateSection title={t('requisition.buildTitle')} copy={t('requisition.buildCopy')} state={state} />;
}

export function JobRequisitionPage({ workflowUuid, stageUuid }: { workflowUuid: string; stageUuid?: string }) {
  const { t } = useTranslation('jobs');
  const state = stageUuid
    ? buildRequisitionDraftState({ workflowUuid, stageUuid })
    : buildWorkflowDriftState('stale-workflow', { workflowUuid });
  return <RequisitionStateSection title={t('requisition.workflowTitle', { workflowUuid })} copy={t('requisition.workflowCopy')} state={state} />;
}

function RequisitionStateSection({ title, copy, state }: { title: string; copy: string; state: ReturnType<typeof buildRequisitionDraftState> }) {
  const { t } = useTranslation('jobs');
  return (
    <section aria-labelledby="requisition-title">
      <p>{t('requisition.eyebrow')}</p>
      <h1 id="requisition-title">{title}</h1>
      <p>{copy}</p>
      <dl>
        <dt>{t('requisition.stateLabel')}</dt>
        <dd data-testid="requisition-state">{state.kind}</dd>
        <dt>{t('requisition.parentTargetLabel')}</dt>
        <dd>{state.parentTarget}</dd>
        <dt>{t('requisition.autosaveLabel')}</dt>
        <dd>{state.autosave}</dd>
      </dl>
    </section>
  );
}
