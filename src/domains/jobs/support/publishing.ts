import { ensureCorrelationId } from '../../../lib/observability';
import type { OperationalReadinessGateResult, OperationalReadinessGateState } from '../../integrations/support';

export const jobBoardPublishingStates = [
  'not-ready',
  'ready',
  'validating',
  'publishing',
  'published',
  'publish-failed',
  'partially-published',
  'unpublish-ready',
  'unpublishing',
  'unpublished',
  'unpublish-failed',
  'provider-blocked',
  'degraded',
  'unavailable',
] as const;

export type JobBoardPublishingState = (typeof jobBoardPublishingStates)[number];
export type JobBoardPublishingRouteFamily = 'job-authoring' | 'job-listings';
export type JobBoardPublishingAction = 'publish' | 'unpublish';
export type JobBoardPublishingTargetType = 'job' | 'job-listing';
export type JobBoardPublishingPublicReflectionIntent = 'not-requested' | 'requested' | 'pending' | 'confirmed' | 'uncertain';
export type JobBoardPublishingResultKind = 'success' | 'retryable-failure' | 'partial';

export type JobBoardPublishingTarget = {
  routeFamily: JobBoardPublishingRouteFamily;
  targetType: JobBoardPublishingTargetType;
  targetReference: 'new' | 'existing' | 'unknown';
};

export type JobBoardPublishingStatus = {
  state: JobBoardPublishingState;
  canProceed: boolean;
  canRetry: boolean;
  publicReflectionIntent: JobBoardPublishingPublicReflectionIntent;
  remediation?: {
    type: 'provider-setup' | 'route-local';
    label: string;
    path?: `/integrations/${string}`;
  };
  message: string;
};

export type JobBoardPublishingResult = {
  action: JobBoardPublishingAction;
  kind: JobBoardPublishingResultKind;
  status: JobBoardPublishingStatus;
  publicReflectionIntent: JobBoardPublishingPublicReflectionIntent;
};

export type JobBoardPublishingTelemetryData = {
  routeFamily: JobBoardPublishingRouteFamily;
  action: JobBoardPublishingAction | 'status';
  publishingState: JobBoardPublishingState;
  readinessOutcome: OperationalReadinessGateState | 'none';
  targetType: JobBoardPublishingTargetType;
  correlationId: string;
};

export type JobBoardPublishingTelemetryEvent = {
  name: 'job_board_publishing_action';
  data: JobBoardPublishingTelemetryData;
};

const providerBlockedStates: Partial<Record<OperationalReadinessGateState, JobBoardPublishingState>> = {
  blocked: 'provider-blocked',
  degraded: 'degraded',
  unavailable: 'unavailable',
  unimplemented: 'unavailable',
};

export function normalizeJobBoardPublishTarget(input: {
  routeFamily: JobBoardPublishingRouteFamily;
  targetType: JobBoardPublishingTargetType;
  hasExistingTarget?: boolean;
}): JobBoardPublishingTarget {
  return {
    routeFamily: input.routeFamily,
    targetType: input.targetType,
    targetReference: input.hasExistingTarget === true ? 'existing' : input.hasExistingTarget === false ? 'new' : 'unknown',
  };
}

export function resolvePublishingStateFromReadiness(readinessGate?: OperationalReadinessGateResult): JobBoardPublishingState {
  if (!readinessGate) return 'not-ready';
  if (readinessGate.canProceed) return 'ready';
  return providerBlockedStates[readinessGate.state] ?? 'unavailable';
}

export function buildJobBoardPublishingStatus(input: {
  state?: JobBoardPublishingState;
  readinessGate?: OperationalReadinessGateResult;
  publicReflectionIntent?: JobBoardPublishingPublicReflectionIntent;
  message?: string;
}): JobBoardPublishingStatus {
  const state = input.state ?? resolvePublishingStateFromReadiness(input.readinessGate);
  const readinessGate = input.readinessGate;
  const canProceed = state === 'ready' || state === 'unpublish-ready';
  const canRetry = state === 'publish-failed' || state === 'partially-published' || state === 'unpublish-failed';
  const remediation = readinessGate?.setupTarget
    ? { type: 'provider-setup' as const, label: readinessGate.setupTarget.label, path: readinessGate.setupTarget.path }
    : canRetry || state === 'not-ready'
      ? { type: 'route-local' as const, label: canRetry ? 'Retry publishing action' : 'Complete route requirements' }
      : undefined;

  return {
    state,
    canProceed,
    canRetry,
    publicReflectionIntent: input.publicReflectionIntent ?? (state === 'published' ? 'confirmed' : state === 'partially-published' ? 'uncertain' : 'not-requested'),
    remediation,
    message: input.message ?? readinessGate?.message ?? messageForState(state),
  };
}

export function buildJobBoardPublishingResult(input: {
  action: JobBoardPublishingAction;
  kind: JobBoardPublishingResultKind;
  readinessGate?: OperationalReadinessGateResult;
  publicReflectionIntent?: JobBoardPublishingPublicReflectionIntent;
  message?: string;
}): JobBoardPublishingResult {
  const state = resultState(input.action, input.kind);
  const publicReflectionIntent = input.publicReflectionIntent ?? (input.kind === 'success' ? 'confirmed' : input.kind === 'partial' ? 'uncertain' : 'pending');
  return {
    action: input.action,
    kind: input.kind,
    publicReflectionIntent,
    status: buildJobBoardPublishingStatus({ state, readinessGate: input.readinessGate, publicReflectionIntent, message: input.message }),
  };
}

export function buildJobBoardPublishingTelemetry(input: {
  routeFamily: JobBoardPublishingRouteFamily;
  action: JobBoardPublishingAction | 'status';
  publishingState: JobBoardPublishingState;
  readinessGate?: OperationalReadinessGateResult;
  targetType: JobBoardPublishingTargetType;
  correlationId?: string;
}): JobBoardPublishingTelemetryEvent {
  return {
    name: 'job_board_publishing_action',
    data: {
      routeFamily: input.routeFamily,
      action: input.action,
      publishingState: input.publishingState,
      readinessOutcome: input.readinessGate?.state ?? 'none',
      targetType: input.targetType,
      correlationId: input.correlationId ?? ensureCorrelationId(),
    },
  };
}

function resultState(action: JobBoardPublishingAction, kind: JobBoardPublishingResultKind): JobBoardPublishingState {
  if (action === 'unpublish') {
    if (kind === 'success') return 'unpublished';
    if (kind === 'partial') return 'partially-published';
    return 'unpublish-failed';
  }
  if (kind === 'success') return 'published';
  if (kind === 'partial') return 'partially-published';
  return 'publish-failed';
}

function messageForState(state: JobBoardPublishingState): string {
  const messages: Record<JobBoardPublishingState, string> = {
    'not-ready': 'Publishing target is not ready.',
    ready: 'Publishing target is ready.',
    validating: 'Publishing target is being validated.',
    publishing: 'Publishing is in progress.',
    published: 'Publishing completed.',
    'publish-failed': 'Publishing failed and can be retried.',
    'partially-published': 'Publishing is partially complete and needs review.',
    'unpublish-ready': 'Unpublish action is ready.',
    unpublishing: 'Unpublish is in progress.',
    unpublished: 'Unpublish completed.',
    'unpublish-failed': 'Unpublish failed and can be retried.',
    'provider-blocked': 'Provider setup blocks publishing.',
    degraded: 'Provider readiness is degraded.',
    unavailable: 'Provider readiness is unavailable.',
  };
  return messages[state];
}
