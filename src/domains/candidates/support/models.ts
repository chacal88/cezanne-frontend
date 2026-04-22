import type { OperationalReadinessGateResult } from '../../integrations/support';
import type { CalendarSchedulingState } from '../../scheduling/support';
import type { ContractSigningState } from '../../contracts/signing';
import type { SurveyReviewScoringState } from '../surveys-custom-fields/support';
import type { AtsCandidateSourceOperationalState } from '../../integrations/support';
export type CandidateRouteEntryMode = 'direct' | 'job' | 'notification' | 'database';
export type CandidateActionKind = 'schedule' | 'offer' | 'reject';
export type CandidateHubActionKind = 'move' | 'hire' | 'unhire' | 'review-request';
export type CandidateHubActionFixtureState = 'ready' | 'blocked' | 'saving' | 'submitting' | 'succeeded' | 'failed' | 'retryable' | 'cancelled' | 'terminal' | 'parent-refresh-required';
export type CandidateDegradedSection = 'documents' | 'contracts' | 'surveys' | 'custom-fields' | 'collaboration' | 'feedback';

export type CandidateContextSegments = {
  candidateId: string;
  jobId?: string;
  status?: string;
  order?: string;
  filters?: string;
  interview?: string;
};

export type CandidateRouteSearch = {
  entry: CandidateRouteEntryMode;
  degrade: CandidateDegradedSection[];
  returnTo?: string;
  fixtureAction?: CandidateHubActionKind;
  fixtureActionState?: CandidateHubActionFixtureState;
};

export type CandidateTaskSearch = {
  entry: CandidateRouteEntryMode;
  parent?: string;
};

export type CandidateActionContext = CandidateContextSegments & {
  cvId: string;
  kind: CandidateActionKind;
  entryMode: CandidateRouteEntryMode;
  returnTarget: string;
  recoveryTarget: string;
  capabilityKey: 'canScheduleInterviewFromCandidate' | 'canCreateOfferFromCandidate' | 'canRejectCandidate';
  readinessGate?: OperationalReadinessGateResult;
  schedulingState?: CalendarSchedulingState;
  contractSigningState?: ContractSigningState;
  surveyReviewScoringState?: SurveyReviewScoringState;
};

export type CandidateDetailView = {
  candidateSummary: {
    candidateId: string;
    cvId: string;
    name: string;
    stage: string;
    headline: string;
    lastAction: string;
  };
  profile: {
    email: string;
    phone: string;
    location: string;
  };
  jobContext?: {
    jobId: string;
    status?: string;
    order?: string;
    filters?: string;
    interview?: string;
  };
  workflowState: {
    entryMode: CandidateRouteEntryMode;
    databaseReturnTarget?: string;
    sequenceState: 'available' | 'stale' | 'unavailable';
    previousCandidatePath?: string;
    nextCandidatePath?: string;
  };
  comments: string[];
  formsSummary: {
    status: string;
    count: number;
  };
  documentsSummary: {
    cvVersion: number;
    candidateOwnedCount: number;
    previewPath: string;
    downloadPath: string;
    lastUpdatedLabel: string;
  };
  contractsSummary: {
    status: string;
    count: number;
    document: import('../../contracts/signing').ContractDocumentMetadata;
    signingState: ContractSigningState;
    refreshRequired: boolean;
  };
  interviewsSummary: {
    status: string;
    count: number;
  };
  surveysSummary: {
    status: string;
    count: number;
  };
  customFields: Array<{ label: string; value: string }>;
  collaboration: {
    tags: string[];
    conversationId: string;
  };
  availableActions: {
    schedule: boolean;
    offer: boolean;
    reject: boolean;
    upload: boolean;
  };
  degradedSections: CandidateDegradedSection[];
  atsSourceStatus?: AtsCandidateSourceOperationalState;
};
