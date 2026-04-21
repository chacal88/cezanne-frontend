import type { AccessContext, Capabilities } from '../../../../lib/access-control';

export type AccountSettingsRouteKind = 'user-settings' | 'company-settings' | 'agency-settings' | 'hiring-company-profile' | 'recruitment-agency-profile' | 'user-profile';
export type AccountSettingsStateKind =
  | 'loading'
  | 'ready'
  | 'empty'
  | 'denied'
  | 'unavailable'
  | 'stale'
  | 'degraded'
  | 'dirty'
  | 'saving'
  | 'saved'
  | 'save-failed'
  | 'retry'
  | 'success';

export type AccountSettingsRouteContract = {
  routeKind: AccountSettingsRouteKind;
  owner: 'settings.user-settings' | 'settings.company-settings' | 'settings.agency-settings' | 'shell.account';
  routeCapability: keyof Pick<Capabilities, 'canViewUserSettings' | 'canManageCompanySettings' | 'canManageAgencySettings' | 'canViewHiringCompanyProfile' | 'canViewRecruitmentAgencyProfile' | 'canOpenAccountArea'>;
  parentTarget: '/dashboard';
  organizationType: AccessContext['organizationType'] | 'user';
};

export type AccountSettingsState = AccountSettingsRouteContract & {
  kind: AccountSettingsStateKind;
  canEdit: boolean;
  canSave: boolean;
  canRetry: boolean;
  canRefreshParent: boolean;
  confirmedContracts: string[];
  unknownFields: string[];
  message: string;
};

export const accountSettingsContracts: Record<AccountSettingsRouteKind, AccountSettingsRouteContract> = {
  'user-profile': {
    routeKind: 'user-profile',
    owner: 'shell.account',
    routeCapability: 'canOpenAccountArea',
    parentTarget: '/dashboard',
    organizationType: 'user',
  },
  'user-settings': {
    routeKind: 'user-settings',
    owner: 'settings.user-settings',
    routeCapability: 'canViewUserSettings',
    parentTarget: '/dashboard',
    organizationType: 'user',
  },
  'company-settings': {
    routeKind: 'company-settings',
    owner: 'settings.company-settings',
    routeCapability: 'canManageCompanySettings',
    parentTarget: '/dashboard',
    organizationType: 'hc',
  },
  'agency-settings': {
    routeKind: 'agency-settings',
    owner: 'settings.agency-settings',
    routeCapability: 'canManageAgencySettings',
    parentTarget: '/dashboard',
    organizationType: 'ra',
  },
  'hiring-company-profile': {
    routeKind: 'hiring-company-profile',
    owner: 'shell.account',
    routeCapability: 'canViewHiringCompanyProfile',
    parentTarget: '/dashboard',
    organizationType: 'hc',
  },
  'recruitment-agency-profile': {
    routeKind: 'recruitment-agency-profile',
    owner: 'shell.account',
    routeCapability: 'canViewRecruitmentAgencyProfile',
    parentTarget: '/dashboard',
    organizationType: 'ra',
  },
};

export function buildAccountSettingsState(
  routeKind: AccountSettingsRouteKind,
  options: {
    routeAllowed?: boolean;
    loading?: boolean;
    empty?: boolean;
    unavailable?: boolean;
    stale?: boolean;
    degraded?: boolean;
    dirty?: boolean;
    saving?: boolean;
    saved?: boolean;
    failed?: boolean;
    retry?: boolean;
    success?: boolean;
    confirmedContracts?: string[];
    unknownFields?: string[];
  } = {},
): AccountSettingsState {
  const contract = accountSettingsContracts[routeKind];
  const confirmedContracts = options.confirmedContracts ?? ['route-capability-boundary', 'deterministic-fixture-adapter'];
  const unknownFields = options.unknownFields ?? ['profile-persistence-api', 'server-validation-schema'];

  if (options.loading) return baseState(contract, 'loading', false, false, false, false, confirmedContracts, unknownFields);
  if (options.unavailable) return baseState(contract, 'unavailable', false, false, true, false, confirmedContracts, unknownFields);
  if (options.routeAllowed === false) return baseState(contract, 'denied', false, false, false, false, confirmedContracts, unknownFields);
  if (options.empty) return baseState(contract, 'empty', true, false, false, false, confirmedContracts, unknownFields);
  if (options.saving) return baseState(contract, 'saving', false, false, false, false, confirmedContracts, unknownFields);
  if (options.failed) return baseState(contract, 'save-failed', true, true, true, false, confirmedContracts, unknownFields);
  if (options.retry) return baseState(contract, 'retry', true, true, true, false, confirmedContracts, unknownFields);
  if (options.saved) return baseState(contract, 'saved', true, false, false, true, confirmedContracts, unknownFields);
  if (options.success) return baseState(contract, 'success', true, false, false, true, confirmedContracts, unknownFields);
  if (options.degraded) return baseState(contract, 'degraded', true, true, true, false, confirmedContracts, unknownFields);
  if (options.stale) return baseState(contract, 'stale', true, true, true, false, confirmedContracts, unknownFields);
  if (options.dirty) return baseState(contract, 'dirty', true, true, false, false, confirmedContracts, unknownFields);

  return baseState(contract, 'ready', true, false, false, false, confirmedContracts, unknownFields);
}

function baseState(
  contract: AccountSettingsRouteContract,
  kind: AccountSettingsStateKind,
  canEdit: boolean,
  canSave: boolean,
  canRetry: boolean,
  canRefreshParent: boolean,
  confirmedContracts: string[],
  unknownFields: string[],
): AccountSettingsState {
  return {
    ...contract,
    kind,
    canEdit,
    canSave,
    canRetry,
    canRefreshParent,
    confirmedContracts,
    unknownFields,
    message: `${contract.routeKind}:${kind}`,
  };
}
