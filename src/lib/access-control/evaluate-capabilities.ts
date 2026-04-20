import type { AccessContext, Capabilities } from './types';

function hasOrgAccess(context: AccessContext) {
  return context.organizationType === 'hc' || context.organizationType === 'ra';
}

function isPlatformContext(context: AccessContext) {
  return context.isSysAdmin && context.organizationType === 'none';
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
  const canUsePlatformSurface = canEnterShell && isPlatformContext(context);
  const canViewDashboard = canUseOrgSurface || canUsePlatformSurface;
  const canManageHiringCompanies = canUsePlatformSurface;
  const canManageRecruitmentAgencies = canUsePlatformSurface;
  const canManagePlatformSubscriptions = canUsePlatformSurface;
  const canManagePlatformUsers = canUsePlatformSurface;
  const canManageFavoriteRequests = canUsePlatformSurface;
  const canManageTaxonomy = canUsePlatformSurface;
  const canViewPlatformMasterDataNav = canManageHiringCompanies || canManageRecruitmentAgencies || canManagePlatformSubscriptions;
  const canViewPlatformUsersAndRequestsNav = canManagePlatformUsers || canManageFavoriteRequests;
  const canViewPlatformTaxonomyNav = canManageTaxonomy;
  const canViewPlatformNavigation = canUsePlatformSurface && (canViewPlatformMasterDataNav || canViewPlatformUsersAndRequestsNav || canViewPlatformTaxonomyNav);
  const isHiringCompany = context.organizationType === 'hc';
  const canAdministerJobs = canEnterShell && (context.isAdmin || context.isSysAdmin);
  const canUseJobRequisitionBranching = canEnterShell && isHiringCompany && hasPivotEntitlement(context, 'jobRequisition');
  const canViewJobDetail = canUseOrgSurface;
  const canOpenJobTask = canViewJobDetail;
  const canViewCandidateDetail = canUseOrgSurface;
  const canOpenCandidateAction = canViewCandidateDetail;
  const canOpenCandidateConversation = canUseOrgSurface && hasSubscriptionCapability(context, 'inbox');
  const canViewCandidateDatabase = canEnterShell && context.organizationType === 'hc' && hasPivotEntitlement(context, 'seeCandidates');
  const canViewIntegrations = canEnterShell && context.organizationType === 'hc' && context.isAdmin;
  const canViewReports = canEnterShell && context.organizationType === 'hc' && context.isAdmin;
  const canViewOrgTeam = canEnterShell && (context.organizationType === 'hc' || context.organizationType === 'ra') && context.isAdmin;

  return {
    canEnterShell,
    canViewDashboard,
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
    canManageRejectReasons: canEnterShell && isHiringCompany && canAdministerJobs && hasSubscriptionCapability(context, 'rejectionReason'),
    canViewPlatformNavigation,
    canViewPlatformMasterDataNav,
    canViewPlatformUsersAndRequestsNav,
    canViewPlatformTaxonomyNav,
    canManageHiringCompanies,
    canManageRecruitmentAgencies,
    canManagePlatformSubscriptions,
    canManagePlatformUsers,
    canManageFavoriteRequests,
    canManageTaxonomy,
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
    canViewCandidateDatabase,
    canSearchCandidates: canViewCandidateDatabase,
    canViewIntegrations,
    canManageIntegrationProvider: canViewIntegrations,
    canViewReports,
    canViewReportFamily: canViewReports,
    canExportReport: canViewReports,
    canScheduleReport: canViewReports,
    canViewOrgTeam,
    canViewRecruiterVisibility: canViewOrgTeam,
    canManageOrgInvites: canViewOrgTeam,
  };
}
