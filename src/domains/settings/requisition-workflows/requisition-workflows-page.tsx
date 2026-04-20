import { useTranslation } from 'react-i18next';
import { buildRequisitionWorkflowSettingsState } from './support/requisition-workflows-state';

export function RequisitionWorkflowsPage() {
  const { t } = useTranslation('jobs');
  const state = buildRequisitionWorkflowSettingsState();
  return (
    <section aria-labelledby="requisition-workflows-title">
      <p>{t('requisitionWorkflows.eyebrow')}</p>
      <h1 id="requisition-workflows-title">{t('requisitionWorkflows.title')}</h1>
      <p>{t('requisitionWorkflows.copy')}</p>
      <dl>
        <dt>{t('requisition.stateLabel')}</dt>
        <dd data-testid="requisition-workflows-state">{state.kind}</dd>
        <dt>{t('requisitionWorkflows.ownerLabel')}</dt>
        <dd>{state.owner}</dd>
        <dt>{t('requisitionWorkflows.executionOwnerLabel')}</dt>
        <dd>{state.executionOwner}</dd>
      </dl>
    </section>
  );
}
