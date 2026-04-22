import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useCapabilities } from '../../../lib/access-control';
import {
  buildCompanySubscriptionFixtureOptions,
  buildCompanySubscriptionState,
  buildMasterDataDetailState,
  buildMasterDataEditState,
  buildMasterDataListState,
  parseCompanySubscriptionStateKind,
  parseMasterDataDetailStateKind,
  parseMasterDataEditStateKind,
  parseMasterDataListStateKind,
  type MasterDataEntity,
} from './support/master-data-state';

type MasterDataListPageProps = { entity: MasterDataEntity; search?: Record<string, unknown> };
type MasterDataDetailPageProps = { entity: MasterDataEntity; id: string; search?: Record<string, unknown> };
type MasterDataEditPageProps = { entity: MasterDataEntity; id: string; search?: Record<string, unknown> };

const entityTitleKeys = {
  'hiring-company': 'masterData.entities.hiringCompany',
  'recruitment-agency': 'masterData.entities.recruitmentAgency',
  subscription: 'masterData.entities.subscription',
} as const;

export function MasterDataListPage({ entity, search = {} }: MasterDataListPageProps) {
  const { t } = useTranslation('sysadmin');
  const fixtureState = parseMasterDataListStateKind(search.fixtureState);
  const count = fixtureState === 'empty' ? 0 : 1;
  const state = buildMasterDataListState(entity, count, fixtureState);
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

export function MasterDataDetailPage({ entity, id, search = {} }: MasterDataDetailPageProps) {
  const { t } = useTranslation('sysadmin');
  const state = buildMasterDataDetailState(entity, id, parseMasterDataDetailStateKind(search.fixtureState));
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

export function MasterDataEditPage({ entity, id, search = {} }: MasterDataEditPageProps) {
  const { t } = useTranslation('sysadmin');
  const state = buildMasterDataEditState(entity, id, parseMasterDataEditStateKind(search.fixtureState));
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

export function CompanySubscriptionPage({ companyId, search = {} }: { companyId: string; search?: Record<string, unknown> }) {
  const { t } = useTranslation('sysadmin');
  const capabilities = useCapabilities();
  const fixtureState = parseCompanySubscriptionStateKind(search.fixtureState);
  const state = buildCompanySubscriptionState(companyId, {
    routeAllowed: capabilities.canManageHiringCompanies,
    mutationAllowed: capabilities.canManagePlatformSubscriptions,
    ...buildCompanySubscriptionFixtureOptions(fixtureState),
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
        <dt>Mutation allowed</dt>
        <dd data-testid="platform-company-subscription-can-mutate">{String(state.canMutateSubscription)}</dd>
        <dt>Refresh targets</dt>
        <dd data-testid="platform-company-subscription-refresh-targets">{state.refreshTargets.join(',')}</dd>
      </dl>
      <Link to="/hiring-companies/$companyId" params={{ companyId }}>{t('masterData.backToCompany')}</Link>
    </section>
  );
}
