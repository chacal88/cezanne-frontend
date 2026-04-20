import { evaluateCapabilities } from './evaluate-capabilities';
import type { AccessContext } from './types';

function buildAccessContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    isAuthenticated: true,
    organizationType: 'hc',
    isAdmin: true,
    isSysAdmin: false,
    pivotEntitlements: ['jobRequisition', 'seeCandidates'],
    subscriptionCapabilities: ['calendarIntegration', 'formsDocs', 'surveys', 'customFields', 'candidateTags', 'reviewRequests', 'interviewFeedback', 'inbox'],
    rolloutFlags: [],
    ...overrides,
  };
}

describe('evaluateCapabilities', () => {
  it('grants the jobs route family for hiring-company admins', () => {
    const capabilities = evaluateCapabilities(buildAccessContext());

    expect(capabilities.canManageCareersPage).toBe(true);
    expect(capabilities.canManageApplicationPage).toBe(true);
    expect(capabilities.canManageJobListings).toBe(true);
    expect(capabilities.canManageHiringFlowSettings).toBe(true);
    expect(capabilities.canManageCustomFields).toBe(false);
    expect(capabilities.canManageTemplates).toBe(true);
    expect(capabilities.canManageRejectReasons).toBe(false);
    expect(capabilities.canViewJobsList).toBe(true);
    expect(capabilities.canCreateJob).toBe(true);
    expect(capabilities.canEditJob).toBe(true);
    expect(capabilities.canViewJobDetail).toBe(true);
    expect(capabilities.canScheduleInterviewFromJob).toBe(true);
    expect(capabilities.canUseJobRequisitionBranching).toBe(true);
  });

  it('blocks create/edit decisions for non-admin hiring-company users', () => {
    const capabilities = evaluateCapabilities(buildAccessContext({ isAdmin: false }));

    expect(capabilities.canManageCareersPage).toBe(false);
    expect(capabilities.canManageApplicationPage).toBe(false);
    expect(capabilities.canManageJobListings).toBe(false);
    expect(capabilities.canManageHiringFlowSettings).toBe(false);
    expect(capabilities.canManageCustomFields).toBe(false);
    expect(capabilities.canManageTemplates).toBe(true);
    expect(capabilities.canManageRejectReasons).toBe(false);
    expect(capabilities.canViewJobsList).toBe(true);
    expect(capabilities.canCreateJob).toBe(false);
    expect(capabilities.canEditJob).toBe(false);
    expect(capabilities.canManageJobState).toBe(false);
  });

  it('keeps recruitment-agency users out of jobs list ownership but allows candidate collaboration', () => {
    const capabilities = evaluateCapabilities(
      buildAccessContext({ organizationType: 'ra', isAdmin: false, pivotEntitlements: [], subscriptionCapabilities: ['inbox'] }),
    );

    expect(capabilities.canViewJobsList).toBe(false);
    expect(capabilities.canManageHiringFlowSettings).toBe(false);
    expect(capabilities.canManageCustomFields).toBe(false);
    expect(capabilities.canManageTemplates).toBe(false);
    expect(capabilities.canManageRejectReasons).toBe(false);
    expect(capabilities.canCreateJob).toBe(false);
    expect(capabilities.canViewJobDetail).toBe(true);
    expect(capabilities.canScheduleInterviewFromJob).toBe(false);
    expect(capabilities.canViewCandidateDetail).toBe(true);
    expect(capabilities.canOpenCandidateConversation).toBe(true);
  });

  it('grants the candidate route family when the organization can operate recruiter-core flows', () => {
    const capabilities = evaluateCapabilities(buildAccessContext());

    expect(capabilities.canViewCandidateDetail).toBe(true);
    expect(capabilities.canViewCandidateDatabase).toBe(true);
    expect(capabilities.canSearchCandidates).toBe(true);
    expect(capabilities.canNavigateCandidateSequence).toBe(true);
    expect(capabilities.canScheduleInterviewFromCandidate).toBe(true);
    expect(capabilities.canCreateOfferFromCandidate).toBe(true);
    expect(capabilities.canRejectCandidate).toBe(true);
    expect(capabilities.canManageCandidateDocuments).toBe(true);
    expect(capabilities.canViewCandidateContracts).toBe(true);
    expect(capabilities.canViewCandidateSurveys).toBe(true);
    expect(capabilities.canEditCandidateCustomFields).toBe(true);
    expect(capabilities.canViewInterviewFeedback).toBe(true);
    expect(capabilities.canTagCandidate).toBe(true);
    expect(capabilities.canOpenCandidateConversation).toBe(true);
  });

  it('gates custom-fields admin on the customFieldsBeta rollout flag', () => {
    const withoutFlag = evaluateCapabilities(buildAccessContext());
    const withFlag = evaluateCapabilities(buildAccessContext({ rolloutFlags: ['customFieldsBeta'] }));

    expect(withoutFlag.canManageCustomFields).toBe(false);
    expect(withFlag.canManageCustomFields).toBe(true);
  });

  it('gates reject-reasons admin on the rejectionReason entitlement', () => {
    const withoutEntitlement = evaluateCapabilities(buildAccessContext());
    const withEntitlement = evaluateCapabilities(buildAccessContext({ subscriptionCapabilities: ['rejectionReason'] }));

    expect(withoutEntitlement.canManageRejectReasons).toBe(false);
    expect(withEntitlement.canManageRejectReasons).toBe(true);
  });

  it('removes premium candidate affordances when the backing subscriptions are absent', () => {
    const capabilities = evaluateCapabilities(buildAccessContext({ subscriptionCapabilities: [] }));

    expect(capabilities.canViewCandidateDetail).toBe(true);
    expect(capabilities.canScheduleInterviewFromCandidate).toBe(false);
    expect(capabilities.canViewCandidateContracts).toBe(false);
    expect(capabilities.canViewCandidateSurveys).toBe(false);
    expect(capabilities.canEditCandidateCustomFields).toBe(false);
    expect(capabilities.canViewInterviewFeedback).toBe(false);
    expect(capabilities.canTagCandidate).toBe(false);
    expect(capabilities.canOpenCandidateConversation).toBe(false);
  });

  it('gates org team foundation on org-admin context without granting platform users', () => {
    const hcAdmin = evaluateCapabilities(buildAccessContext({ organizationType: 'hc', isAdmin: true, isSysAdmin: false }));
    const raAdmin = evaluateCapabilities(buildAccessContext({ organizationType: 'ra', isAdmin: true, isSysAdmin: false }));
    const hcUser = evaluateCapabilities(buildAccessContext({ organizationType: 'hc', isAdmin: false, isSysAdmin: false }));

    expect(hcAdmin.canViewOrgTeam).toBe(true);
    expect(hcAdmin.canViewRecruiterVisibility).toBe(true);
    expect(hcAdmin.canManageOrgInvites).toBe(true);
    expect(hcAdmin.canViewPlatformNavigation).toBe(false);
    expect(hcAdmin.canManagePlatformUsers).toBe(false);
    expect(raAdmin.canViewOrgTeam).toBe(true);
    expect(hcUser.canViewOrgTeam).toBe(false);
  });

  it('gates reports on hiring-company admin context', () => {
    const hcAdmin = evaluateCapabilities(buildAccessContext({ organizationType: 'hc', isAdmin: true }));
    const hcUser = evaluateCapabilities(buildAccessContext({ organizationType: 'hc', isAdmin: false }));
    const raAdmin = evaluateCapabilities(buildAccessContext({ organizationType: 'ra', isAdmin: true }));

    expect(hcAdmin.canViewReports).toBe(true);
    expect(hcAdmin.canViewReportFamily).toBe(true);
    expect(hcAdmin.canExportReport).toBe(true);
    expect(hcAdmin.canScheduleReport).toBe(true);
    expect(hcUser.canViewReports).toBe(false);
    expect(raAdmin.canViewReports).toBe(false);
  });

  it('gates integrations admin on hiring-company admin context', () => {
    const hcAdmin = evaluateCapabilities(buildAccessContext({ organizationType: 'hc', isAdmin: true }));
    const hcUser = evaluateCapabilities(buildAccessContext({ organizationType: 'hc', isAdmin: false }));
    const raAdmin = evaluateCapabilities(buildAccessContext({ organizationType: 'ra', isAdmin: true }));

    expect(hcAdmin.canViewIntegrations).toBe(true);
    expect(hcAdmin.canManageIntegrationProvider).toBe(true);
    expect(hcUser.canViewIntegrations).toBe(false);
    expect(raAdmin.canViewIntegrations).toBe(false);
  });

  it('gates candidate database on hiring-company seeCandidates entitlement', () => {
    const withEntitlement = evaluateCapabilities(buildAccessContext({ organizationType: 'hc', pivotEntitlements: ['seeCandidates'] }));
    const withoutEntitlement = evaluateCapabilities(buildAccessContext({ organizationType: 'hc', pivotEntitlements: [] }));
    const recruitmentAgency = evaluateCapabilities(buildAccessContext({ organizationType: 'ra', pivotEntitlements: ['seeCandidates'] }));

    expect(withEntitlement.canViewCandidateDatabase).toBe(true);
    expect(withEntitlement.canSearchCandidates).toBe(true);
    expect(withoutEntitlement.canViewCandidateDatabase).toBe(false);
    expect(recruitmentAgency.canViewCandidateDatabase).toBe(false);
  });
});

  it('grants platform navigation only for SysAdmin platform context', () => {
    const capabilities = evaluateCapabilities(
      buildAccessContext({
        organizationType: 'none',
        isAdmin: true,
        isSysAdmin: true,
        pivotEntitlements: [],
        subscriptionCapabilities: [],
      }),
    );

    expect(capabilities.canViewDashboard).toBe(true);
    expect(capabilities.canViewPlatformNavigation).toBe(true);
    expect(capabilities.canViewPlatformMasterDataNav).toBe(true);
    expect(capabilities.canViewPlatformUsersAndRequestsNav).toBe(true);
    expect(capabilities.canViewPlatformTaxonomyNav).toBe(true);
    expect(capabilities.canManageHiringCompanies).toBe(true);
    expect(capabilities.canViewJobsList).toBe(false);
  });

  it('does not grant Platform navigation from org-scoped admin access', () => {
    const capabilities = evaluateCapabilities(buildAccessContext({ organizationType: 'hc', isAdmin: true, isSysAdmin: false }));

    expect(capabilities.canManageApplicationPage).toBe(true);
    expect(capabilities.canViewPlatformNavigation).toBe(false);
    expect(capabilities.canManageHiringCompanies).toBe(false);
  });
