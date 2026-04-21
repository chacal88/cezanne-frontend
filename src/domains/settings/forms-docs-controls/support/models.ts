export type FormsDocsRequestedDocument = {
  id: string;
  label: string;
  consumer: 'candidate-documents' | 'public-application' | 'integration-forms';
  required: boolean;
};

export type FormsDocsSettingsConfigView = {
  schemaId: string;
  source: 'fixture-adapter';
  version: number;
  requestedDocuments: FormsDocsRequestedDocument[];
  publicUploadsEnabled: boolean;
  candidateRefreshMode: 'manual' | 'after-save';
  publicRefreshMode: 'manual' | 'after-save';
  simulateEmpty: boolean;
  simulateUnavailable: boolean;
  simulateStale: boolean;
  simulateDegraded: boolean;
  simulateSaveFailure: boolean;
};

export type FormsDocsSettingsReadinessState =
  | { kind: 'loading'; canEdit: false; canRetry: false; reason?: string }
  | { kind: 'ready'; canEdit: true; canRetry: false; reason?: string }
  | { kind: 'empty'; canEdit: true; canRetry: false; reason: string }
  | { kind: 'denied'; canEdit: false; canRetry: false; reason: string }
  | { kind: 'unavailable'; canEdit: false; canRetry: true; reason: string }
  | { kind: 'stale'; canEdit: true; canRetry: true; reason: string }
  | { kind: 'degraded'; canEdit: true; canRetry: true; reason: string }
  | { kind: 'failed'; canEdit: false; canRetry: true; reason: string };

export type FormsDocsSettingsMutationState =
  | { kind: 'idle'; canRetry: false }
  | { kind: 'saving'; canRetry: false; requestHeaders: Record<string, string> }
  | { kind: 'submitting'; canRetry: false; requestHeaders: Record<string, string> }
  | { kind: 'validation-error'; canRetry: false; fieldErrors: string[]; requestHeaders: Record<string, string> }
  | { kind: 'failed'; canRetry: true; reason: string; requestHeaders: Record<string, string> }
  | { kind: 'retry'; canRetry: true; reason: string; requestHeaders: Record<string, string> }
  | { kind: 'success'; canRetry: false; outcome: 'stable' | 'refresh-required'; requestHeaders: Record<string, string> };

export type FormsDocsDownstreamConsumer = 'candidate-documents-contracts' | 'public-application' | 'integration-forms-token';

export type FormsDocsDownstreamImpactSignal = {
  consumer: FormsDocsDownstreamConsumer;
  state: 'fresh' | 'stale' | 'degraded' | 'unavailable';
  refreshIntent: 'none' | 'refresh-on-next-open' | 'refresh-now';
  mutationOwner: 'settings.forms-docs-controls';
  message: string;
};

export type FormsDocsSettingsViewState = {
  owner: 'settings.forms-docs-controls';
  routeId: 'settings.forms-docs-controls';
  parentTarget: '/parameters/default/settings/forms-docs';
  config: FormsDocsSettingsConfigView;
  readiness: FormsDocsSettingsReadinessState;
  mutation: FormsDocsSettingsMutationState;
  downstreamImpact: FormsDocsDownstreamImpactSignal[];
  unknownContractFields: string[];
};
