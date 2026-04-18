import type { ExternalParticipantDecision, ExternalWorkflowType, PublicRouteDecision, PublicRouteFamily, PublicSourceState, PublicTokenState } from './models';

export function interpretPublicTokenState(token: string): PublicTokenState {
  const normalized = token.toLowerCase();
  if (normalized.startsWith('invalid')) return 'invalid';
  if (normalized.startsWith('expired')) return 'expired';
  if (normalized.startsWith('used')) return 'used';
  if (normalized.startsWith('inaccessible')) return 'inaccessible';
  return 'valid';
}

export function interpretPublicSourceState(source: string): PublicSourceState {
  return source.trim().length > 0 && source !== 'invalid-source' ? 'valid' : 'invalid';
}

function buildDecision(input: {
  family: PublicRouteFamily;
  capabilityKey: PublicRouteDecision['capabilityKey'];
  tokenState: PublicTokenState;
  sourceState?: PublicSourceState;
  isAvailable: boolean;
  isCompleted?: boolean;
}): PublicRouteDecision {
  if (input.isCompleted) {
    return {
      family: input.family,
      capabilityKey: input.capabilityKey,
      tokenState: input.tokenState,
      sourceState: input.sourceState,
      readiness: 'completed',
      canProceed: false,
      reason: 'already completed',
    };
  }

  if (input.tokenState !== 'valid' || input.sourceState === 'invalid') {
    return {
      family: input.family,
      capabilityKey: input.capabilityKey,
      tokenState: input.tokenState,
      sourceState: input.sourceState,
      readiness: 'token-state',
      canProceed: false,
      reason: input.sourceState === 'invalid' ? 'invalid source' : input.tokenState,
    };
  }

  if (!input.isAvailable) {
    return {
      family: input.family,
      capabilityKey: input.capabilityKey,
      tokenState: input.tokenState,
      sourceState: input.sourceState,
      readiness: 'unavailable',
      canProceed: false,
      reason: 'unavailable',
    };
  }

  return {
    family: input.family,
    capabilityKey: input.capabilityKey,
    tokenState: input.tokenState,
    sourceState: input.sourceState,
    readiness: 'ready',
    canProceed: true,
  };
}

function normalizeExternalTokenState(token: string, matchesRouteFamily: boolean): PublicTokenState {
  if (!matchesRouteFamily) return 'inaccessible';
  return interpretPublicTokenState(token);
}

export function evaluateSharedJobEntry(input: { token: string; source: string; isAvailable: boolean }): PublicRouteDecision {
  return buildDecision({
    family: 'shared-job',
    capabilityKey: 'canOpenSharedJob',
    tokenState: interpretPublicTokenState(input.token),
    sourceState: interpretPublicSourceState(input.source),
    isAvailable: input.isAvailable,
  });
}

export function evaluatePublicApplicationAccess(input: { token: string; source: string; isAvailable: boolean; isCompleted?: boolean }): PublicRouteDecision {
  return buildDecision({
    family: 'public-application',
    capabilityKey: 'canSubmitPublicApplication',
    tokenState: interpretPublicTokenState(input.token),
    sourceState: interpretPublicSourceState(input.source),
    isAvailable: input.isAvailable,
    isCompleted: input.isCompleted,
  });
}

export function evaluatePublicSurveyAccess(input: { surveyuuid: string; isAvailable: boolean; isCompleted?: boolean }): PublicRouteDecision {
  return buildDecision({
    family: 'public-survey',
    capabilityKey: 'canCompletePublicSurvey',
    tokenState: interpretPublicTokenState(input.surveyuuid),
    isAvailable: input.isAvailable,
    isCompleted: input.isCompleted,
  });
}

export function evaluateExternalParticipantAccess(input: {
  family: ExternalParticipantDecision['family'];
  token: string;
  workflowType: ExternalWorkflowType;
  matchesRouteFamily: boolean;
  isAvailable: boolean;
  isCompleted?: boolean;
  isReadyForSubmission?: boolean;
}): ExternalParticipantDecision {
  const tokenState = normalizeExternalTokenState(input.token, input.matchesRouteFamily);

  if (input.isCompleted || tokenState === 'used') {
    return {
      family: input.family,
      capabilityKey: 'canUseExternalReviewFlow',
      workflowType: input.workflowType,
      tokenState: input.isCompleted ? 'valid' : tokenState,
      readiness: 'completed',
      canProceed: false,
      completionState: 'terminal',
      submissionReadiness: 'ready',
      reason: input.family === 'external-interview-request' ? 'request already answered' : 'submission already completed',
    };
  }

  if (tokenState !== 'valid') {
    return {
      family: input.family,
      capabilityKey: 'canUseExternalReviewFlow',
      workflowType: input.workflowType,
      tokenState,
      readiness: 'token-state',
      canProceed: false,
      completionState: 'terminal',
      submissionReadiness: 'missing-context',
      reason: tokenState,
    };
  }

  if (!input.isAvailable) {
    return {
      family: input.family,
      capabilityKey: 'canUseExternalReviewFlow',
      workflowType: input.workflowType,
      tokenState,
      readiness: 'unavailable',
      canProceed: false,
      completionState: 'terminal',
      submissionReadiness: 'missing-context',
      reason: 'unavailable',
    };
  }

  if (!input.isReadyForSubmission) {
    return {
      family: input.family,
      capabilityKey: 'canUseExternalReviewFlow',
      workflowType: input.workflowType,
      tokenState,
      readiness: 'recoverable-error',
      canProceed: false,
      completionState: 'actionable',
      submissionReadiness: 'missing-context',
      reason: 'missing submission context',
    };
  }

  return {
    family: input.family,
    capabilityKey: 'canUseExternalReviewFlow',
    workflowType: input.workflowType,
    tokenState,
    readiness: 'ready',
    canProceed: true,
    completionState: 'actionable',
    submissionReadiness: 'ready',
  };
}
