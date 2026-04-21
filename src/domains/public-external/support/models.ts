export type PublicTokenState = 'valid' | 'invalid' | 'expired' | 'used' | 'inaccessible';
export type PublicRouteFamily =
  | 'shared-job'
  | 'public-application'
  | 'public-survey'
  | 'external-tokenized-chat'
  | 'requisition-approval'
  | 'requisition-forms-download'
  | 'external-interview-request'
  | 'external-review-candidate'
  | 'external-interview-feedback'
  | 'integration-cv'
  | 'integration-forms'
  | 'integration-job';
export type PublicSourceState = 'valid' | 'invalid';
export type PublicRouteReadiness = 'ready' | 'token-state' | 'unavailable' | 'completed' | 'recoverable-error';
export type ExternalWorkflowType = 'decision' | 'review-form' | 'feedback-form';
export type ExternalNotificationFamily = 'cv-interview-feedback' | 'cv-reviewed' | 'user-mentioned';

export type PublicRouteDecision = {
  family: PublicRouteFamily;
  capabilityKey:
    | 'canOpenSharedJob'
    | 'canSubmitPublicApplication'
    | 'canCompletePublicSurvey'
    | 'canUseExternalTokenizedChat'
    | 'canUseExternalReviewFlow'
    | 'canDownloadRequisitionFormsByToken';
  tokenState: PublicTokenState;
  sourceState?: PublicSourceState;
  readiness: PublicRouteReadiness;
  canProceed: boolean;
  reason?: string;
};

export type ExternalParticipantDecision = PublicRouteDecision & {
  family: 'external-interview-request' | 'external-review-candidate' | 'external-interview-feedback';
  capabilityKey: 'canUseExternalReviewFlow';
  workflowType: ExternalWorkflowType;
  completionState: 'actionable' | 'terminal';
  submissionReadiness: 'ready' | 'missing-context';
};

export type SharedJobRouteModel = {
  route: {
    jobOrRole: string;
    token: string;
    source: string;
  };
  decision: PublicRouteDecision;
  title: string;
  summary: string;
  sourceLabel: string;
  applicationPath: string;
};

export type PublicApplicationField = {
  key: 'firstName' | 'email' | 'phone' | 'motivation';
  label: string;
  required: boolean;
};

export type PublicApplicationViewModel = {
  route: {
    jobOrRole: string;
    token: string;
    source: string;
  };
  decision: PublicRouteDecision;
  title: string;
  intro: string;
  fields: PublicApplicationField[];
  defaults: Record<PublicApplicationField['key'], string>;
  uploads: UploadedPublicFile[];
  completion: PublicCompletionState | null;
};

export type UploadedPublicFile = {
  name: string;
  size: number;
  requestHeaders: Record<string, string>;
  status: 'uploaded';
};

export type PublicApplicationDraft = {
  firstName: string;
  email: string;
  phone: string;
  motivation: string;
  fileName: string;
};

export type PublicApplicationSerializedPayload = {
  applicant: {
    firstName: string;
    email: string;
    phone?: string;
    motivation?: string;
  };
  uploads: Array<{
    name: string;
    size: number;
  }>;
  route: {
    jobOrRole: string;
    token: string;
    source: string;
  };
};

export type WorkflowFailureStage = 'validation' | 'upload-handshake' | 'binary-transfer' | 'metadata-persistence' | 'submission';
export type ExternalWorkflowFailureStage = 'bootstrap' | 'validation' | 'submission';

export type PublicCompletionState = {
  kind: 'application-complete' | 'survey-complete';
  message: string;
};

export type ExternalCompletionState = {
  kind: 'interview-request-accepted' | 'interview-request-declined' | 'review-submitted' | 'feedback-submitted';
  message: string;
};

export type PublicApplicationWorkflowResult =
  | {
      status: 'completed';
      uploadedFiles: UploadedPublicFile[];
      payload: PublicApplicationSerializedPayload;
      completion: PublicCompletionState;
    }
  | {
      status: 'failed';
      stage: WorkflowFailureStage;
      message: string;
    };

export type PublicSurveyViewModel = {
  route: {
    surveyuuid: string;
    jobuuid: string;
    cvuuid: string;
  };
  decision: PublicRouteDecision;
  title: string;
  prompt: string;
  savedAnswer: string;
  completion: PublicCompletionState | null;
};

export type InterviewRequestDecisionChoice = 'accept' | 'decline';

export type InterviewRequestViewModel = {
  route: {
    scheduleUuid: string;
    cvToken: string;
  };
  decision: ExternalParticipantDecision;
  title: string;
  intro: string;
  participantName: string;
  scheduledAt: string;
  terminalOutcome: ExternalCompletionState | null;
};

export type InterviewRequestSerializedPayload = {
  route: {
    scheduleUuid: string;
    cvToken: string;
  };
  decision: InterviewRequestDecisionChoice;
  participantName: string;
};

export type InterviewRequestWorkflowResult =
  | {
      status: 'completed';
      payload: InterviewRequestSerializedPayload;
      completion: ExternalCompletionState;
      requestHeaders: Record<string, string>;
    }
  | {
      status: 'failed';
      stage: ExternalWorkflowFailureStage;
      message: string;
    };

export type ExternalReviewQuestion = {
  key: 'score' | 'summary' | 'recommendation';
  label: string;
  required: boolean;
};

export type ExternalReviewDraft = {
  score: string;
  summary: string;
  recommendation: string;
};

export type ExternalReviewSerializedPayload = {
  route: {
    code: string;
  };
  participantName: string;
  schemaVersion: string;
  answers: ExternalReviewDraft;
};

export type ExternalReviewViewModel = {
  route: {
    code: string;
  };
  decision: ExternalParticipantDecision;
  title: string;
  intro: string;
  participantName: string;
  schemaVersion: string;
  questions: ExternalReviewQuestion[];
  defaults: ExternalReviewDraft;
  completion: ExternalCompletionState | null;
};

export type ExternalReviewWorkflowResult =
  | {
      status: 'completed';
      payload: ExternalReviewSerializedPayload;
      completion: ExternalCompletionState;
      requestHeaders: Record<string, string>;
    }
  | {
      status: 'failed';
      stage: ExternalWorkflowFailureStage;
      message: string;
    };

export type NotificationOwnershipRule = {
  family: ExternalNotificationFamily;
  owner: 'candidate.detail' | 'candidate.review' | 'inbox';
  allowsExternalTokenDestination: false;
  reason: string;
};
