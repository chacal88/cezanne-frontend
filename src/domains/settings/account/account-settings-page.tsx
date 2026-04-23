import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessContext, useCapabilities } from '../../../lib/access-control';
import { defaultAccountSettingsAdapter, type AccountSettingsFixture } from './support/account-settings-adapter';
import { accountSettingsOptionsFromFixtureState, buildAccountSettingsState, parseAccountSettingsFixtureState, type AccountSettingsRouteKind } from './support/account-settings-state';

const routeCapabilityMap = {
  'user-profile': 'canOpenAccountArea',
  'user-settings': 'canViewUserSettings',
  'company-settings': 'canManageCompanySettings',
  'agency-settings': 'canManageAgencySettings',
  'hiring-company-profile': 'canViewHiringCompanyProfile',
  'recruitment-agency-profile': 'canViewRecruitmentAgencyProfile',
} as const;

const requiredOrganizationMap = {
  'company-settings': 'hc',
  'hiring-company-profile': 'hc',
  'agency-settings': 'ra',
  'recruitment-agency-profile': 'ra',
} as const;

type AccountSettingsPageProps = {
  routeKind: AccountSettingsRouteKind;
  titleKey: string;
  descriptionKey: string;
  isOverlay?: boolean;
  parentTarget?: '/dashboard';
  fixtureState?: unknown;
};

export function AccountSettingsPage({ routeKind, titleKey, descriptionKey, isOverlay = false, parentTarget, fixtureState }: AccountSettingsPageProps) {
  const { t } = useTranslation('shell');
  const accessContext = useAccessContext();
  const capabilities = useCapabilities();
  const requiredOrganization = requiredOrganizationMap[routeKind as keyof typeof requiredOrganizationMap];
  const fixture = defaultAccountSettingsAdapter.loadFixture(routeKind);
  const [draft, setDraft] = useState<AccountSettingsFixture | null>(fixture);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);

  const routeAllowed = capabilities[routeCapabilityMap[routeKind]] && (!requiredOrganization || accessContext.organizationType === requiredOrganization);
  const fixtureOptions = accountSettingsOptionsFromFixtureState(parseAccountSettingsFixtureState(fixtureState));
  const state = buildAccountSettingsState(routeKind, {
    routeAllowed,
    empty: routeAllowed && !draft,
    dirty,
    saved,
    failed,
    unavailable: routeAllowed && !fixture,
    ...fixtureOptions,
    ...(fixtureOptions.routeAllowed === false ? { routeAllowed: false } : {}),
  });

  function updateDraft(field: keyof AccountSettingsFixture, value: string) {
    setSaved(false);
    setFailed(false);
    setDirty(true);
    setDraft((current) => ({ ...(current ?? { displayName: '', email: '', locale: 'en' as const }), [field]: value }));
  }

  function handleSave() {
    if (!draft) return;
    const result = defaultAccountSettingsAdapter.saveFixture(routeKind, draft);
    setFailed(!result.ok);
    setSaved(result.ok);
    setDirty(!result.ok);
  }

  return (
    <section aria-labelledby={`${routeKind}-title`} style={{ maxWidth: isOverlay ? 520 : 720, border: isOverlay ? '1px solid #e5e7eb' : undefined, borderRadius: 12, padding: isOverlay ? 20 : 0 }}>
      <p style={{ marginTop: 0, color: '#666' }}>{isOverlay ? t('userProfile.eyebrow') : t('accountSettings.eyebrow')}</p>
      <h1 id={`${routeKind}-title`} style={{ marginTop: 0 }}>{t(titleKey)}</h1>
      <p>{t(descriptionKey)}</p>
      <dl>
        <dt>{t('accountSettings.stateLabel')}</dt>
        <dd data-testid={`${routeKind}-state`}>{state.kind}</dd>
        <dt>{t('accountSettings.ownerLabel')}</dt>
        <dd>{state.owner}</dd>
        <dt>{t('accountSettings.capabilityLabel')}</dt>
        <dd>{state.routeCapability}</dd>
      </dl>
      {draft ? (
        <div style={{ display: 'grid', gap: 10 }}>
          <label>
            {t('accountSettings.displayName')}
            <input data-testid={`${routeKind}-display-name`} value={draft.displayName} disabled={!state.canEdit} onChange={(event) => updateDraft('displayName', event.target.value)} />
          </label>
          <label>
            {t('accountSettings.email')}
            <input data-testid={`${routeKind}-email`} value={draft.email} disabled={!state.canEdit} onChange={(event) => updateDraft('email', event.target.value)} />
          </label>
          {draft.organizationName !== undefined ? (
            <label>
              {t('accountSettings.organizationName')}
              <input data-testid={`${routeKind}-organization-name`} value={draft.organizationName} disabled={!state.canEdit} onChange={(event) => updateDraft('organizationName', event.target.value)} />
            </label>
          ) : null}
        </div>
      ) : null}
      <button type="button" data-testid={`${routeKind}-save-button`} disabled={!state.canSave} onClick={handleSave}>
        {t('accountSettings.save')}
      </button>
      {state.canRetry ? <button type="button" data-testid={`${routeKind}-retry-button`} onClick={handleSave}>{t('accountSettings.retry')}</button> : null}
      {state.canRefreshParent ? <p data-testid={`${routeKind}-refresh-intent`}>{t('accountSettings.refreshIntent')}</p> : null}
      <a href={parentTarget ?? state.parentTarget} data-testid={`${routeKind}-parent-link`}>{isOverlay ? t('userProfile.close') : t('accountSettings.returnToParent')}</a>
      <pre data-testid={`${routeKind}-unknown-fields`}>{JSON.stringify(state.unknownFields)}</pre>
    </section>
  );
}
