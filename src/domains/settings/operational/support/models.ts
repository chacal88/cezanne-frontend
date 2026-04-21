export const operationalSettingsSubsectionIds = ['hiring-flow', 'custom-fields', 'templates', 'reject-reasons', 'api-endpoints', 'forms-docs'] as const;

export type OperationalSettingsSubsectionId = (typeof operationalSettingsSubsectionIds)[number];

export type OperationalSettingsRouteId =
  | 'settings.operational.compat'
  | 'settings.operational.hiring-flow'
  | 'settings.operational.custom-fields'
  | 'settings.operational.templates'
  | 'settings.operational.reject-reasons'
  | 'settings.api-endpoints'
  | 'settings.forms-docs-controls';

export type OperationalSettingsCapability =
  | 'canManageHiringFlowSettings'
  | 'canManageCustomFields'
  | 'canManageTemplates'
  | 'canManageRejectReasons'
  | 'canManageApiEndpoints'
  | 'canManageFormsDocsSettings';

export type OperationalSettingsRouteDefinition = {
  subsectionId: OperationalSettingsSubsectionId;
  routeId: OperationalSettingsRouteId;
  capability: OperationalSettingsCapability;
  path: string;
  compatibilitySection: string;
  compatibilitySubsection: string;
};

export type OperationalSettingsCompatParams = {
  settingsId: string;
  section: string;
  subsection: string;
};

export type OperationalSettingsResolutionReason = 'matched' | 'fallback_unknown' | 'fallback_unavailable' | 'fallback_unauthorized' | 'fallback_unimplemented';

export type OperationalSettingsRouteResolution = {
  active: OperationalSettingsRouteDefinition;
  params: OperationalSettingsCompatParams;
  reason: OperationalSettingsResolutionReason;
};

export type OperationalSettingsReadiness =
  | { kind: 'loading'; canEdit: false; canRetry: false }
  | { kind: 'blocked'; canEdit: false; canRetry: false; reason: string }
  | { kind: 'retryable-error'; canEdit: false; canRetry: true; reason: string }
  | { kind: 'ready'; canEdit: true; canRetry: false };

export type OperationalSettingsMutationState =
  | { kind: 'idle'; canRetry: false }
  | { kind: 'submitting'; canRetry: false; requestHeaders: Record<string, string> }
  | { kind: 'success'; canRetry: false; requestHeaders: Record<string, string>; outcome: 'stable' | 'refresh-required' }
  | { kind: 'validation-error'; canRetry: false; fieldErrors: string[]; requestHeaders: Record<string, string> }
  | { kind: 'submission-error'; canRetry: true; reason: string; requestHeaders: Record<string, string> };

export type OperationalSettingsSubmittingState = Extract<OperationalSettingsMutationState, { kind: 'submitting' }>;
