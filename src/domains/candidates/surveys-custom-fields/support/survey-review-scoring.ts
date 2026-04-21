import { ensureCorrelationId } from '../../../../lib/observability';
import type { PublicTokenState } from '../../../public-external/support';

export const surveyReviewScoringStates = [
  'loading',
  'ready',
  'schema-required',
  'template-required',
  'reviewer-required',
  'submitting',
  'submitted',
  'submit-failed',
  'partially-submitted',
  'scoring-pending',
  'scored',
  'read-only',
  'token-invalid',
  'token-expired',
  'inaccessible',
  'provider-blocked',
  'degraded',
  'unavailable',
] as const;

export type SurveyReviewScoringStateKind = (typeof surveyReviewScoringStates)[number];
export type SurveyReviewScoringRouteFamily = 'candidate-review-launcher' | 'external-review-candidate' | 'external-interview-feedback' | 'public-survey';
export type SurveyReviewScoringTaskContext = 'candidate-review-launcher' | 'external-review-candidate' | 'external-interview-feedback' | 'public-survey';
export type SurveyReviewScoringAction = 'open' | 'submit-start' | 'submit-failure' | 'retry' | 'terminal-outcome' | 'scoring-refresh';
export type SurveyReviewTerminalOutcome = 'submitted' | 'partially-submitted' | 'scoring-pending' | 'scored' | 'read-only';
export type SurveyReviewScoringSubmitOutcome = 'submitted' | 'submit-failed' | 'partially-submitted' | 'scoring-pending' | 'scored';
export type SurveyReviewScoringRefreshOutcome = 'scoring-pending' | 'scored' | 'read-only' | 'degraded' | 'unavailable';

export type SurveyReviewScoringReadiness = {
  loading?: boolean;
  schemaReady?: boolean;
  templateReady?: boolean;
  reviewerReady?: boolean;
  tokenState?: PublicTokenState;
  tokenBoundary?: 'authenticated' | 'public';
  providerBlocked?: boolean;
  degraded?: boolean;
  unavailable?: boolean;
  readOnly?: boolean;
  terminalOutcome?: SurveyReviewTerminalOutcome;
};

export type SurveyReviewScoringDraft = {
  answerCount: number;
  requiredAnswerCount: number;
  hasScore?: boolean;
  hasRecommendation?: boolean;
};

export type SurveyReviewScoringParentContext = {
  returnTarget: string;
  candidateId?: string;
  jobId?: string;
  publicRoute?: string;
};

export type SurveyReviewScoringParentRefreshIntent = {
  refreshCandidate: boolean;
  refreshJob: boolean;
  returnTarget: string;
};

export type SurveyReviewScoringState = {
  kind: SurveyReviewScoringStateKind;
  routeFamily: SurveyReviewScoringRouteFamily;
  taskContext: SurveyReviewScoringTaskContext;
  readiness: SurveyReviewScoringReadiness;
  draft: SurveyReviewScoringDraft;
  message: string;
  canSubmit: boolean;
  canRetry: boolean;
  canRefreshScoring: boolean;
  readOnly: boolean;
  tokenState?: PublicTokenState;
  terminalOutcome?: SurveyReviewTerminalOutcome;
  parentContext?: SurveyReviewScoringParentContext;
  parentRefresh?: SurveyReviewScoringParentRefreshIntent;
};

export type SurveyReviewScoringTelemetryEvent = {
  name: 'survey_review_scoring_action';
  data: {
    routeFamily: SurveyReviewScoringRouteFamily;
    action: SurveyReviewScoringAction;
    operationalState: SurveyReviewScoringStateKind;
    taskContext: SurveyReviewScoringTaskContext;
    tokenState?: PublicTokenState;
    terminalOutcome?: SurveyReviewTerminalOutcome;
    correlationId: string;
  };
};

function safeCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function createSurveyReviewScoringDraft(input: Partial<SurveyReviewScoringDraft> = {}): SurveyReviewScoringDraft {
  return {
    answerCount: safeCount(input.answerCount),
    requiredAnswerCount: safeCount(input.requiredAnswerCount),
    hasScore: Boolean(input.hasScore),
    hasRecommendation: Boolean(input.hasRecommendation),
  };
}

function buildParentRefreshIntent(parentContext?: SurveyReviewScoringParentContext): SurveyReviewScoringParentRefreshIntent | undefined {
  if (!parentContext) return undefined;
  return {
    refreshCandidate: Boolean(parentContext.candidateId),
    refreshJob: Boolean(parentContext.jobId),
    returnTarget: parentContext.returnTarget,
  };
}

function messageFor(kind: SurveyReviewScoringStateKind): string {
  const messages: Record<SurveyReviewScoringStateKind, string> = {
    loading: 'Loading survey, review, or scoring context.',
    ready: 'Survey, review, or scoring context is ready for submission.',
    'schema-required': 'A safe schema summary is required before this route can submit.',
    'template-required': 'A scoring or review template is required before this route can submit.',
    'reviewer-required': 'Reviewer context is required before this route can submit.',
    submitting: 'Submitting the survey, review, or feedback draft.',
    submitted: 'Submission completed. Refresh the parent context before returning.',
    'submit-failed': 'Submission failed recoverably. Retry is available on this route.',
    'partially-submitted': 'Submission partially completed. Review the route-local retry guidance.',
    'scoring-pending': 'Submission completed and scoring is pending.',
    scored: 'Submission has a scored outcome.',
    'read-only': 'This route is terminal and read-only.',
    'token-invalid': 'The public token is invalid.',
    'token-expired': 'The public token is expired.',
    inaccessible: 'This public route is inaccessible for the provided token.',
    'provider-blocked': 'Provider readiness blocks this action.',
    degraded: 'The survey, review, or scoring provider is degraded.',
    unavailable: 'Survey, review, or scoring is unavailable for this route.',
  };
  return messages[kind];
}

function mapReadinessToState(readiness: SurveyReviewScoringReadiness): SurveyReviewScoringStateKind {
  if (readiness.loading) return 'loading';
  if (readiness.terminalOutcome) return readiness.terminalOutcome === 'submitted' ? 'read-only' : readiness.terminalOutcome;
  if (readiness.readOnly) return 'read-only';
  if (readiness.tokenState === 'invalid') return 'token-invalid';
  if (readiness.tokenState === 'expired') return 'token-expired';
  if (readiness.tokenState === 'inaccessible' || readiness.tokenState === 'used') return 'inaccessible';
  if (readiness.unavailable) return 'unavailable';
  if (readiness.degraded) return 'degraded';
  if (readiness.providerBlocked) return 'provider-blocked';
  if (readiness.schemaReady === false) return 'schema-required';
  if (readiness.templateReady === false) return 'template-required';
  if (readiness.reviewerReady === false) return 'reviewer-required';
  return 'ready';
}

function makeState(input: {
  routeFamily: SurveyReviewScoringRouteFamily;
  taskContext: SurveyReviewScoringTaskContext;
  readiness?: SurveyReviewScoringReadiness;
  draft?: Partial<SurveyReviewScoringDraft>;
  kind?: SurveyReviewScoringStateKind;
  parentContext?: SurveyReviewScoringParentContext;
}): SurveyReviewScoringState {
  const readiness = input.readiness ?? {};
  const draft = createSurveyReviewScoringDraft(input.draft);
  const kind = input.kind ?? mapReadinessToState(readiness);
  const readOnly = kind === 'read-only' || kind === 'scored' || kind === 'submitted' || kind === 'scoring-pending';
  const terminalOutcome = readOnly || kind === 'partially-submitted' ? readiness.terminalOutcome ?? (kind as SurveyReviewTerminalOutcome) : undefined;

  return {
    kind,
    routeFamily: input.routeFamily,
    taskContext: input.taskContext,
    readiness,
    draft,
    message: messageFor(kind),
    canSubmit: kind === 'ready' && draft.answerCount >= draft.requiredAnswerCount,
    canRetry: kind === 'submit-failed' || kind === 'partially-submitted',
    canRefreshScoring: kind === 'submitted' || kind === 'scoring-pending',
    readOnly,
    tokenState: readiness.tokenState,
    terminalOutcome,
    parentContext: input.parentContext,
    parentRefresh: terminalOutcome ? buildParentRefreshIntent(input.parentContext) : undefined,
  };
}

export function buildSurveyReviewScoringState(input: {
  routeFamily: SurveyReviewScoringRouteFamily;
  taskContext: SurveyReviewScoringTaskContext;
  readiness?: SurveyReviewScoringReadiness;
  draft?: Partial<SurveyReviewScoringDraft>;
  parentContext?: SurveyReviewScoringParentContext;
}): SurveyReviewScoringState {
  return makeState(input);
}

export function validateSurveyReviewScoringDraft(state: SurveyReviewScoringState): SurveyReviewScoringState | undefined {
  if (state.kind !== 'ready') return state.canSubmit ? undefined : state;
  if (state.draft.answerCount < state.draft.requiredAnswerCount) {
    return makeState({ ...state, kind: 'schema-required', readiness: state.readiness, draft: state.draft });
  }
  return undefined;
}

export function startSurveyReviewScoringSubmit(state: SurveyReviewScoringState): SurveyReviewScoringState {
  const invalid = validateSurveyReviewScoringDraft(state);
  if (invalid) return invalid;
  return { ...state, kind: 'submitting', canSubmit: false, canRetry: false, canRefreshScoring: false, readOnly: false, message: messageFor('submitting') };
}

export function resolveSurveyReviewScoringSubmitResult(state: SurveyReviewScoringState, outcome: SurveyReviewScoringSubmitOutcome): SurveyReviewScoringState {
  return {
    ...state,
    kind: outcome,
    canSubmit: false,
    canRetry: outcome === 'submit-failed' || outcome === 'partially-submitted',
    canRefreshScoring: outcome === 'submitted' || outcome === 'scoring-pending',
    readOnly: outcome === 'submitted' || outcome === 'scoring-pending' || outcome === 'scored',
    terminalOutcome: outcome === 'submit-failed' ? undefined : outcome,
    parentRefresh: outcome === 'submit-failed' ? undefined : buildParentRefreshIntent(state.parentContext) ?? state.parentRefresh,
    message: messageFor(outcome),
  };
}

export function retrySurveyReviewScoringSubmit(state: SurveyReviewScoringState): SurveyReviewScoringState {
  if (!state.canRetry) return state;
  return { ...state, kind: 'ready', canSubmit: state.draft.answerCount >= state.draft.requiredAnswerCount, canRetry: false, readOnly: false, terminalOutcome: undefined, message: 'Retry submission with the current safe draft summary.' };
}

export function refreshSurveyReviewScoringStatus(state: SurveyReviewScoringState, outcome: SurveyReviewScoringRefreshOutcome): SurveyReviewScoringState {
  return {
    ...state,
    kind: outcome,
    canSubmit: false,
    canRetry: false,
    canRefreshScoring: outcome === 'scoring-pending',
    readOnly: outcome === 'scoring-pending' || outcome === 'scored' || outcome === 'read-only',
    terminalOutcome: outcome === 'degraded' || outcome === 'unavailable' ? undefined : outcome,
    message: messageFor(outcome),
  };
}

export function buildSurveyReviewScoringTelemetry(input: {
  routeFamily: SurveyReviewScoringRouteFamily;
  action: SurveyReviewScoringAction;
  operationalState: SurveyReviewScoringStateKind;
  taskContext: SurveyReviewScoringTaskContext;
  tokenState?: PublicTokenState;
  terminalOutcome?: SurveyReviewTerminalOutcome;
  correlationId?: string;
}): SurveyReviewScoringTelemetryEvent {
  return {
    name: 'survey_review_scoring_action',
    data: {
      routeFamily: input.routeFamily,
      action: input.action,
      operationalState: input.operationalState,
      taskContext: input.taskContext,
      tokenState: input.tokenState,
      terminalOutcome: input.terminalOutcome,
      correlationId: input.correlationId ?? ensureCorrelationId(),
    },
  };
}
