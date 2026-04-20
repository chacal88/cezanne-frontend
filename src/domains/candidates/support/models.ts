export type CandidateRouteEntryMode = 'direct' | 'job' | 'notification' | 'database';
export type CandidateActionKind = 'schedule' | 'offer' | 'reject';
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
};
