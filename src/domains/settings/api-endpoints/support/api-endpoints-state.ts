export type ApiEndpointSettingsStateKind =
  | 'loading'
  | 'ready'
  | 'empty'
  | 'validation-error'
  | 'saving'
  | 'saved'
  | 'save-error'
  | 'denied'
  | 'unavailable';

export type ApiEndpointSettingsConfig = {
  endpointUrl: string;
  environment: 'sandbox' | 'production';
  credentialMode: 'token' | 'headers';
  headerCount: number;
  simulateSaveFailure?: boolean;
};

export type ApiEndpointSettingsState = {
  kind: ApiEndpointSettingsStateKind;
  owner: 'settings.api-endpoints';
  routeCapability: 'canManageApiEndpoints';
  parentTarget: '/dashboard';
  canEdit: boolean;
  canSave: boolean;
  canRetry: boolean;
  validationErrors: string[];
};

export function buildApiEndpointSettingsState(
  config: ApiEndpointSettingsConfig,
  options: { routeAllowed?: boolean; unavailable?: boolean; loading?: boolean; empty?: boolean; saving?: boolean; saved?: boolean; saveError?: boolean } = {},
): ApiEndpointSettingsState {
  if (options.loading) return baseState('loading', false, false, false);
  if (options.unavailable) return baseState('unavailable', false, false, true);
  if (options.routeAllowed === false) return baseState('denied', false, false, false);
  if (options.empty) return baseState('empty', true, false, false);
  if (options.saving) return baseState('saving', false, false, false);
  if (options.saveError || config.simulateSaveFailure) return baseState('save-error', true, true, true);
  if (options.saved) return baseState('saved', true, true, false);

  const validationErrors = validateApiEndpointSettings(config);
  if (validationErrors.length > 0) return baseState('validation-error', true, false, false, validationErrors);

  return baseState('ready', true, true, false);
}

export function validateApiEndpointSettings(config: ApiEndpointSettingsConfig) {
  const errors: string[] = [];
  try {
    const parsed = new URL(config.endpointUrl);
    if (!['https:', 'http:'].includes(parsed.protocol)) errors.push('unsupported-protocol');
  } catch {
    errors.push('invalid-url');
  }

  if (config.environment === 'production' && !config.endpointUrl.startsWith('https://')) {
    errors.push('production-requires-https');
  }

  if (config.credentialMode === 'headers' && config.headerCount < 1) {
    errors.push('missing-header');
  }

  return errors;
}

export function getDefaultApiEndpointSettingsConfig(overrides: Partial<ApiEndpointSettingsConfig> = {}): ApiEndpointSettingsConfig {
  return {
    endpointUrl: 'https://hooks.example.test/recruit',
    environment: 'sandbox',
    credentialMode: 'token',
    headerCount: 0,
    ...overrides,
  };
}

function baseState(
  kind: ApiEndpointSettingsStateKind,
  canEdit: boolean,
  canSave: boolean,
  canRetry: boolean,
  validationErrors: string[] = [],
): ApiEndpointSettingsState {
  return {
    kind,
    owner: 'settings.api-endpoints',
    routeCapability: 'canManageApiEndpoints',
    parentTarget: '/dashboard',
    canEdit,
    canSave,
    canRetry,
    validationErrors,
  };
}
