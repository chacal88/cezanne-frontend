import { interpretPublicTokenState } from '../../public-external/support';
import type { IntegrationRouteDecision, IntegrationRouteFamily, IntegrationWorkflowType } from './models';

function normalizeIntegrationTokenState(token: string, matchesRouteFamily: boolean) {
  if (!matchesRouteFamily) return 'inaccessible' as const;
  return interpretPublicTokenState(token);
}

export function evaluateIntegrationTokenEntry(input: {
  family: IntegrationRouteFamily;
  token: string;
  workflowType: IntegrationWorkflowType;
  matchesRouteFamily: boolean;
  isAvailable: boolean;
  isCompleted?: boolean;
  isReadyForSubmission?: boolean;
}): IntegrationRouteDecision {
  const tokenState = normalizeIntegrationTokenState(input.token, input.matchesRouteFamily);

  if (input.isCompleted || tokenState === 'used') {
    return {
      family: input.family,
      capabilityKey: 'canUseIntegrationTokenEntry',
      workflowType: input.workflowType,
      tokenState: input.isCompleted ? 'valid' : tokenState,
      readiness: 'completed',
      canProceed: false,
      completionState: 'terminal',
      submissionReadiness: input.workflowType === 'job-presentation' ? 'not-applicable' : 'ready',
      reason: input.family === 'integration-forms' ? 'forms/documents already completed' : 'integration callback already completed',
    };
  }

  if (tokenState !== 'valid') {
    return {
      family: input.family,
      capabilityKey: 'canUseIntegrationTokenEntry',
      workflowType: input.workflowType,
      tokenState,
      readiness: 'token-state',
      canProceed: false,
      completionState: 'terminal',
      submissionReadiness: input.workflowType === 'job-presentation' ? 'not-applicable' : 'missing-context',
      reason: tokenState,
    };
  }

  if (!input.isAvailable) {
    return {
      family: input.family,
      capabilityKey: 'canUseIntegrationTokenEntry',
      workflowType: input.workflowType,
      tokenState,
      readiness: 'unavailable',
      canProceed: false,
      completionState: 'terminal',
      submissionReadiness: input.workflowType === 'job-presentation' ? 'not-applicable' : 'missing-context',
      reason: 'unavailable',
    };
  }

  if (input.workflowType !== 'job-presentation' && !input.isReadyForSubmission) {
    return {
      family: input.family,
      capabilityKey: 'canUseIntegrationTokenEntry',
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
    capabilityKey: 'canUseIntegrationTokenEntry',
    workflowType: input.workflowType,
    tokenState,
    readiness: 'ready',
    canProceed: true,
    completionState: input.workflowType === 'job-presentation' ? 'terminal' : 'actionable',
    submissionReadiness: input.workflowType === 'job-presentation' ? 'not-applicable' : 'ready',
  };
}
