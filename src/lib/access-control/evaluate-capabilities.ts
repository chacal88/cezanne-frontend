import type { AccessContext, Capabilities } from './types';

function hasOrgAccess(context: AccessContext) {
  return context.organizationType === 'hc' || context.organizationType === 'ra' || context.isSysAdmin;
}

function hasPivotEntitlement(context: AccessContext, entitlement: string) {
  return context.pivotEntitlements.includes(entitlement);
}

function hasSubscriptionCapability(context: AccessContext, capability: string) {
  return context.subscriptionCapabilities.includes(capability);
}

function hasRolloutFlag(context: AccessContext, flag: string) {
  return context.rolloutFlags.includes(flag);
}

export function evaluateCapabilities(context: AccessContext): Capabilities {
  const canEnterShell = context.isAuthenticated;
  const canUseOrgSurface = canEnterShell && hasOrgAccess(context);
  const isHiringCompany = context.organizationType === 'hc' || context.isSysAdmin;
  const canAdministerJobs = canEnterShell && (context.isAdmin || context.isSysAdmin);
  const canUseJobRequisitionBranching = canEnterShell && isHiringCompany && hasPivotEntitlement(context, 'jobRequisition');
  const canViewJobDetail = canUseOrgSurface;
  const canOpenJobTask = canViewJobDetail;
  const canViewCandidateDetail = canUseOrgSurface;
  const canOpenCandidateAction = canViewCandidateDetail;
  const canOpenCandidateConversation = canUseOrgSurface && hasSubscriptionCapability(context, 'inbox');

  return {
    canEnterShell,
    canViewDashboard: canUseOrgSurface,
    canViewNotifications: canEnterShell,
    canUseInbox: canUseOrgSurface,
    canOpenAccountArea: canEnterShell,
    canLogout: canEnterShell,
    canSeeNavSection: canEnterShell,
    canManageCareersPage: canEnterShell && isHiringCompany && canAdministerJobs,
    canManageApplicationPage: canEnterShell && isHiringCompany && canAdministerJobs,
    canManageJobListings: canEnterShell && isHiringCompany && canAdministerJobs,
    canManageHiringFlowSettings: canEnterShell && isHiringCompany && canAdministerJobs,
    canManageCustomFields: canEnterShell && isHiringCompany && canAdministerJobs && hasRolloutFlag(context, 'customFieldsBeta'),
    canManageTemplates: canEnterShell && isHiringCompany,
    canViewJobsList: canEnterShell && isHiringCompany,
    canCreateJob: canEnterShell && isHiringCompany && canAdministerJobs,
    canEditJob: canEnterShell && isHiringCompany && canAdministerJobs,
    canResetJobWorkflow: canEnterShell && isHiringCompany && canAdministerJobs,
    canViewJobDetail,
    canManageJobState: canEnterShell && isHiringCompany && canAdministerJobs,
    canOpenJobTask,
    canScheduleInterviewFromJob: canOpenJobTask && hasSubscriptionCapability(context, 'calendarIntegration'),
    canCreateOfferFromJob: canOpenJobTask,
    canRejectCvFromJob: canOpenJobTask,
    canUseJobRequisitionBranching,
    canManageJobAssignments: canEnterShell && isHiringCompany && canAdministerJobs,
    canViewCandidateDetail,
    canNavigateCandidateSequence: canViewCandidateDetail,
    canOpenCandidateAction,
    canScheduleInterviewFromCandidate: canOpenCandidateAction && hasSubscriptionCapability(context, 'calendarIntegration'),
    canCreateOfferFromCandidate: canOpenCandidateAction,
    canRejectCandidate: canOpenCandidateAction,
    canMoveCandidateStage: canOpenCandidateAction,
    canHireCandidate: canOpenCandidateAction,
    canRequestCandidateReview: canOpenCandidateAction && hasSubscriptionCapability(context, 'reviewRequests'),
    canManageCandidateDocuments: canViewCandidateDetail,
    canViewCandidateContracts: canViewCandidateDetail && hasSubscriptionCapability(context, 'formsDocs'),
    canViewCandidateSurveys: canViewCandidateDetail && hasSubscriptionCapability(context, 'surveys'),
    canEditCandidateCustomFields: canViewCandidateDetail && hasSubscriptionCapability(context, 'customFields'),
    canViewInterviewFeedback: canViewCandidateDetail && hasSubscriptionCapability(context, 'interviewFeedback'),
    canCommentOnCandidate: canViewCandidateDetail,
    canTagCandidate: canViewCandidateDetail && hasSubscriptionCapability(context, 'candidateTags'),
    canOpenCandidateConversation,
  };
}
