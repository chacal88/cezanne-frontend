import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useCapabilities } from '../../../lib/access-control';
import {
  buildCompanySubscriptionState,
  buildMasterDataDetailState,
  buildMasterDataEditState,
  buildMasterDataListState,
  type MasterDataEntity,
} from './support/master-data-state';

type MasterDataListPageProps = { entity: MasterDataEntity };
type MasterDataDetailPageProps = { entity: MasterDataEntity; id: string };
type MasterDataEditPageProps = { entity: MasterDataEntity; id: string };

const entityTitleKeys = {
  'hiring-company': 'masterData.entities.hiringCompany',
  'recruitment-agency': 'masterData.entities.recruitmentAgency',
  subscription: 'masterData.entities.subscription',
} as const;

export function MasterDataListPage({ entity }: MasterDataListPageProps) {
  const { t } = useTranslation('sysadmin');
  const state = buildMasterDataListState(entity, 1);
  return (
    <section aria-labelledby="master-data-list-title">
      <p>{t('masterData.eyebrow')}</p>
      <h1 id="master-data-list-title">{t('masterData.listTitle', { entity: t(entityTitleKeys[entity]) })}</h1>
      <p>{t('masterData.listDetail')}</p>
      <dl>
        <dt>{t('foundation.stateLabel')}</dt>
        <dd data-testid="platform-master-data-state">{state.kind}</dd>
        <dt>{t('masterData.countLabel')}</dt>
        <dd>{state.count}</dd>
      </dl>
    </section>
  );
}

export function MasterDataDetailPage({ entity, id }: MasterDataDetailPageProps) {
  const { t } = useTranslation('sysadmin');
  const state = buildMasterDataDetailState(entity, id);
  return (
    <section aria-labelledby="master-data-detail-title">
      <p>{t('masterData.eyebrow')}</p>
      <h1 id="master-data-detail-title">{t('masterData.detailTitle', { entity: t(entityTitleKeys[entity]), id })}</h1>
      <p>{t('masterData.detailCopy')}</p>
      <dl>
        <dt>{t('foundation.stateLabel')}</dt>
        <dd data-testid="platform-master-data-state">{state.kind}</dd>
        <dt>{t('masterData.parentTargetLabel')}</dt>
        <dd>{state.parentTarget}</dd>
      </dl>
    </section>
  );
}

export function MasterDataEditPage({ entity, id }: MasterDataEditPageProps) {
  const { t } = useTranslation('sysadmin');
  const state = buildMasterDataEditState(entity, id);
  return (
    <section aria-labelledby="master-data-edit-title">
      <p>{t('masterData.eyebrow')}</p>
      <h1 id="master-data-edit-title">{t('masterData.editTitle', { entity: t(entityTitleKeys[entity]), id })}</h1>
      <p>{t('masterData.editCopy')}</p>
      <dl>
        <dt>{t('foundation.stateLabel')}</dt>
        <dd data-testid="platform-master-data-state">{state.kind}</dd>
        <dt>{t('masterData.cancelTargetLabel')}</dt>
        <dd>{state.cancelTarget}</dd>
      </dl>
    </section>
  );
}

export function CompanySubscriptionPage({ companyId }: { companyId: string }) {
  const { t } = useTranslation('sysadmin');
  const capabilities = useCapabilities();
  const state = buildCompanySubscriptionState(companyId, {
    routeAllowed: capabilities.canManageHiringCompanies,
    mutationAllowed: capabilities.canManagePlatformSubscriptions,
  });

  return (
    <section aria-labelledby="company-subscription-title">
      <p>{t('masterData.eyebrow')}</p>
      <h1 id="company-subscription-title">{t('masterData.companySubscriptionTitle', { id: companyId })}</h1>
      <p>{t('masterData.companySubscriptionCopy')}</p>
      <dl>
        <dt>{t('foundation.stateLabel')}</dt>
        <dd data-testid="platform-master-data-state">{state.kind}</dd>
        <dt>{t('masterData.routeCapabilityLabel')}</dt>
        <dd>{state.routeCapability}</dd>
        <dt>{t('masterData.mutationCapabilityLabel')}</dt>
        <dd>{state.mutationCapability}</dd>
      </dl>
      <Link to="/hiring-companies/$companyId" params={{ companyId }}>{t('masterData.backToCompany')}</Link>
    </section>
  );
}
