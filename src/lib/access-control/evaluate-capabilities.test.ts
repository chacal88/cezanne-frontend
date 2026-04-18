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
    expect(capabilities.canCreateJob).toBe(false);
    expect(capabilities.canViewJobDetail).toBe(true);
    expect(capabilities.canScheduleInterviewFromJob).toBe(false);
    expect(capabilities.canViewCandidateDetail).toBe(true);
    expect(capabilities.canOpenCandidateConversation).toBe(true);
  });

  it('grants the candidate route family when the organization can operate recruiter-core flows', () => {
    const capabilities = evaluateCapabilities(buildAccessContext());

    expect(capabilities.canViewCandidateDetail).toBe(true);
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
});
