import type { AccessContext, Capabilities } from '../../../../lib/access-control';
import type { TemplatesResolvedView, TemplatesRouteState } from './models';

function canUseSmartQuestions(access: AccessContext) {
  return access.isAdmin || access.isSysAdmin;
}

function canUseDiversityQuestions(access: AccessContext) {
  return (access.isAdmin || access.isSysAdmin) && access.rolloutFlags.includes('surveysBeta') && access.subscriptionCapabilities.includes('customSurveys');
}

function canUseInterviewScoring(access: AccessContext, capabilities: Capabilities) {
  return (access.isAdmin || access.isSysAdmin) && capabilities.canViewInterviewFeedback;
}

export function resolveTemplatesRouteState(routeState: TemplatesRouteState, access: AccessContext, capabilities: Capabilities): TemplatesResolvedView {
  if (routeState.kind === 'detail' || routeState.kind === 'index') {
    return {
      requested: routeState.kind,
      active: routeState.kind,
      fallbackReason: 'matched',
    };
  }

  const allowed =
    (routeState.kind === 'smart-questions' && canUseSmartQuestions(access)) ||
    (routeState.kind === 'diversity-questions' && canUseDiversityQuestions(access)) ||
    (routeState.kind === 'interview-scoring' && canUseInterviewScoring(access, capabilities));

  return {
    requested: routeState.kind,
    active: allowed ? routeState.kind : 'index',
    fallbackReason: allowed ? 'matched' : 'fallback_unavailable',
  };
}
