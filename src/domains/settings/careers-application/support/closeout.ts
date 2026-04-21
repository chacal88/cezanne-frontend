import { ensureCorrelationId } from '../../../../lib/observability';
import type { JobBoardPublishingStatus, JobBoardPublishingTarget } from '../../../jobs/support/publishing';
import type { ApplicationPageRouteState, CareersApplicationDecision, JobListingEditorRouteState, JobListingsRouteState } from './models';

export const careersApplicationCloseoutStates = [
  'loading',
  'ready',
  'denied',
  'unavailable',
  'degraded',
  'stale',
  'validation-error',
  'saving',
  'saved',
  'save-error',
  'publishing',
  'published',
  'partial',
  'retryable',
] as const;

export type CareersApplicationCloseoutState = (typeof careersApplicationCloseoutStates)[number];
export type CareersApplicationSaveStatus = 'idle' | 'loading' | 'saving' | 'completed' | 'failed' | 'stale';
export type CareersApplicationPublicReflectionState = 'not-requested' | 'requested' | 'pending' | 'confirmed' | 'uncertain';
export type CareersApplicationRouteFamily = 'careers-page' | 'application-page' | 'job-listings' | 'job-listings-editor';
export type CareersApplicationAdapterContract = 'fixture-backed' | 'confirmed-api' | 'unknown';

export type CareersApplicationCloseoutSnapshot = {
  routeFamily: CareersApplicationRouteFamily;
  state: CareersApplicationCloseoutState;
  capabilityKey: CareersApplicationDecision['capabilityKey'];
  publicReflectionIntent: CareersApplicationPublicReflectionState;
  adapterContract: CareersApplicationAdapterContract;
  message: string;
  canRetry: boolean;
};

export type SafePublicReflectionIntent = {
  routeId: string;
  routeFamily: CareersApplicationRouteFamily;
  targetType: 'careers-page' | 'application-page' | 'job-listing';
  targetReference: 'settings' | 'existing' | 'new' | 'unknown';
  publicReflectionIntent: CareersApplicationPublicReflectionState;
  brandSlug?: string;
  settingsId?: string;
  section?: string;
  subsection?: string;
  listingUuid?: string;
  publishingState?: string;
  correlationId: string;
};

export type SafeCareersApplicationTelemetryPayload = Omit<SafePublicReflectionIntent, 'correlationId'> & {
  correlationId: string;
  lifecycle: 'save' | 'publish' | 'unpublish' | 'status';
  closeoutState?: CareersApplicationCloseoutState;
};

function stateFromDecision(decision: CareersApplicationDecision): CareersApplicationCloseoutState {
  if (decision.canProceed) return 'ready';
  if (decision.reason === 'missing capability') return 'denied';

  const readinessState: Record<CareersApplicationDecision['readiness'], CareersApplicationCloseoutState> = {
    ready: 'ready',
    'missing-brand': 'validation-error',
    'feature-disabled': 'unavailable',
    'missing-settings': 'validation-error',
    'publish-blocked': 'stale',
    'listing-missing': 'unavailable',
  };

  return readinessState[decision.readiness];
}

function stateFromSaveStatus(status: CareersApplicationSaveStatus): CareersApplicationCloseoutState | undefined {
  const states: Partial<Record<CareersApplicationSaveStatus, CareersApplicationCloseoutState>> = {
    loading: 'loading',
    saving: 'saving',
    completed: 'saved',
    failed: 'save-error',
    stale: 'stale',
  };
  return states[status];
}

function snapshot(input: {
  routeFamily: CareersApplicationRouteFamily;
  decision: CareersApplicationDecision;
  saveStatus?: CareersApplicationSaveStatus;
  adapterContract?: CareersApplicationAdapterContract;
  publicReflectionIntent?: CareersApplicationPublicReflectionState;
}): CareersApplicationCloseoutSnapshot {
  const state = stateFromSaveStatus(input.saveStatus ?? 'idle') ?? stateFromDecision(input.decision);
  const publicReflectionIntent = input.publicReflectionIntent ?? (state === 'saved' ? 'pending' : 'not-requested');
  const message = input.decision.canProceed ? `Route is ${state}.` : input.decision.reason ?? `Route is ${state}.`;

  return {
    routeFamily: input.routeFamily,
    state,
    capabilityKey: input.decision.capabilityKey,
    publicReflectionIntent,
    adapterContract: input.adapterContract ?? 'fixture-backed',
    message,
    canRetry: state === 'save-error' || state === 'retryable' || state === 'partial',
  };
}

export function buildCareersPageCloseoutSnapshot(
  decision: CareersApplicationDecision,
  input: { saveStatus?: CareersApplicationSaveStatus; publicReflectionIntent?: CareersApplicationPublicReflectionState; adapterContract?: CareersApplicationAdapterContract } = {},
): CareersApplicationCloseoutSnapshot {
  return snapshot({ routeFamily: 'careers-page', decision, ...input });
}

export function buildApplicationPageCloseoutSnapshot(
  decision: CareersApplicationDecision,
  routeState: ApplicationPageRouteState,
  input: { saveStatus?: CareersApplicationSaveStatus; publicReflectionIntent?: CareersApplicationPublicReflectionState; adapterContract?: CareersApplicationAdapterContract } = {},
): CareersApplicationCloseoutSnapshot & Pick<ApplicationPageRouteState, 'settingsId' | 'section' | 'subsection'> {
  return { ...snapshot({ routeFamily: 'application-page', decision, ...input }), ...routeState };
}

export function buildJobListingsCloseoutSnapshot(
  decision: CareersApplicationDecision,
  routeState: JobListingsRouteState,
  publishingStatus: JobBoardPublishingStatus,
): CareersApplicationCloseoutSnapshot & Pick<JobListingsRouteState, 'tab' | 'brand'> & { publishingStatus: JobBoardPublishingStatus } {
  const state = publishingCloseoutState(publishingStatus);
  return {
    ...snapshot({ routeFamily: 'job-listings', decision, publicReflectionIntent: publishingStatus.publicReflectionIntent }),
    state: decision.canProceed ? state : stateFromDecision(decision),
    canRetry: publishingStatus.canRetry,
    tab: routeState.tab,
    brand: routeState.brand,
    publishingStatus,
  };
}

export function buildJobListingEditorCloseoutSnapshot(
  decision: CareersApplicationDecision,
  routeState: JobListingEditorRouteState,
  publishingStatus?: JobBoardPublishingStatus,
): CareersApplicationCloseoutSnapshot & Pick<JobListingEditorRouteState, 'mode' | 'uuid' | 'brand' | 'returnTab'> & { publishingStatus?: JobBoardPublishingStatus } {
  const state = publishingStatus ? publishingCloseoutState(publishingStatus) : stateFromDecision(decision);
  return {
    ...snapshot({ routeFamily: 'job-listings-editor', decision, publicReflectionIntent: publishingStatus?.publicReflectionIntent }),
    state: decision.canProceed ? state : stateFromDecision(decision),
    canRetry: publishingStatus?.canRetry ?? false,
    ...routeState,
    publishingStatus,
  };
}

export function publishingCloseoutState(status: JobBoardPublishingStatus): CareersApplicationCloseoutState {
  if (status.state === 'published' || status.state === 'unpublished') return 'published';
  if (status.state === 'partially-published') return 'partial';
  if (status.state === 'publish-failed' || status.state === 'unpublish-failed') return 'retryable';
  if (status.state === 'publishing' || status.state === 'unpublishing' || status.state === 'validating') return 'publishing';
  if (status.state === 'degraded') return 'degraded';
  if (status.state === 'unavailable' || status.state === 'provider-blocked') return 'unavailable';
  if (status.state === 'not-ready') return 'stale';
  return 'ready';
}

export function buildSafePublicReflectionIntent(input: {
  routeId: string;
  routeFamily: CareersApplicationRouteFamily;
  targetType: SafePublicReflectionIntent['targetType'];
  publicReflectionIntent: CareersApplicationPublicReflectionState;
  target?: JobBoardPublishingTarget;
  targetReference?: SafePublicReflectionIntent['targetReference'];
  brandSlug?: string;
  settingsId?: string;
  section?: string;
  subsection?: string;
  listingUuid?: string;
  publishingState?: string;
  correlationId?: string;
}): SafePublicReflectionIntent {
  return withoutUndefined({
    routeId: input.routeId,
    routeFamily: input.routeFamily,
    targetType: input.targetType,
    targetReference: input.target?.targetReference ?? input.targetReference ?? (input.listingUuid ? 'existing' : input.targetType === 'job-listing' ? 'unknown' : 'settings'),
    publicReflectionIntent: input.publicReflectionIntent,
    brandSlug: sanitizeSlug(input.brandSlug),
    settingsId: sanitizeIdentifier(input.settingsId),
    section: sanitizeIdentifier(input.section),
    subsection: sanitizeIdentifier(input.subsection),
    listingUuid: sanitizeIdentifier(input.listingUuid),
    publishingState: sanitizeIdentifier(input.publishingState),
    correlationId: input.correlationId ?? ensureCorrelationId(),
  });
}

export function buildSafeCareersApplicationTelemetryPayload(input: SafeCareersApplicationTelemetryPayload): SafeCareersApplicationTelemetryPayload {
  return withoutUndefined({
    ...buildSafePublicReflectionIntent(input),
    lifecycle: input.lifecycle,
    closeoutState: input.closeoutState,
  });
}

function sanitizeSlug(value?: string): string | undefined {
  if (!value) return undefined;
  const sanitized = value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return sanitized || undefined;
}

function sanitizeIdentifier(value?: string): string | undefined {
  if (!value) return undefined;
  const sanitized = value.trim().replace(/[^A-Za-z0-9._:-]/g, '');
  return sanitized || undefined;
}

function withoutUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}
