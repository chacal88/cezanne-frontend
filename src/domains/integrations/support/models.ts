import type { PublicRouteReadiness, PublicTokenState } from '../../public-external/support';

export type IntegrationRouteFamily = 'integration-cv' | 'integration-forms' | 'integration-job';
export type IntegrationWorkflowType = 'cv-action' | 'forms-documents' | 'job-presentation';
export type IntegrationCompletionState = {
  kind:
    | 'integration-cv-interview-confirmed'
    | 'integration-cv-unavailable-confirmed'
    | 'integration-cv-offer-accepted'
    | 'integration-cv-offer-rejected'
    | 'integration-forms-complete';
  message: string;
};

export type IntegrationRouteDecision = {
  family: IntegrationRouteFamily;
  capabilityKey: 'canUseIntegrationTokenEntry';
  workflowType: IntegrationWorkflowType;
  tokenState: PublicTokenState;
  readiness: PublicRouteReadiness;
  canProceed: boolean;
  completionState: 'actionable' | 'terminal';
  submissionReadiness: 'ready' | 'missing-context' | 'not-applicable';
  reason?: string;
};

export type IntegrationCvRouteParams = {
  token: string;
  action?: string;
};

export type IntegrationJobRouteParams = {
  token: string;
  action?: string;
};

export type IntegrationFormsRouteParams = {
  token: string;
};

export type IntegrationInterviewChoice = {
  id: 'slot-1' | 'slot-2' | 'unavailable';
  label: string;
  requiresReason?: boolean;
};

export type IntegrationCvViewModel = {
  route: IntegrationCvRouteParams;
  decision: IntegrationRouteDecision;
  title: string;
  intro: string;
  candidateName: string;
  jobTitle: string;
  interviewChoices: IntegrationInterviewChoice[];
  offerValue: string;
  offerMessage: string;
  currentAction: 'interview' | 'offer';
  completion: IntegrationCompletionState | null;
};

export type IntegrationFormsStep = {
  id: 'identity-document' | 'availability-notes';
  label: string;
  requiresFile: boolean;
  placeholder: string;
};

export type IntegrationFormsAnswer = {
  stepId: IntegrationFormsStep['id'];
  answer: string;
  fileName?: string;
};

export type IntegrationFormsDraft = {
  answers: IntegrationFormsAnswer[];
};

export type IntegrationFormsViewModel = {
  route: IntegrationFormsRouteParams;
  decision: IntegrationRouteDecision;
  title: string;
  intro: string;
  candidateName: string;
  jobTitle: string;
  steps: IntegrationFormsStep[];
  currentStepIndex: number;
  draft: IntegrationFormsDraft;
  completion: IntegrationCompletionState | null;
};

export type IntegrationJobViewModel = {
  route: IntegrationJobRouteParams;
  decision: IntegrationRouteDecision;
  title: string;
  companyName: string;
  location: string;
  summary: string;
};

export type IntegrationCvSerializedPayload = {
  route: IntegrationCvRouteParams;
  candidateName: string;
  action: 'interview-confirmation' | 'offer-response';
  selection: 'slot-1' | 'slot-2' | 'unavailable' | 'accept' | 'reject';
  reason?: string;
};

export type IntegrationFormsSerializedPayload = {
  route: IntegrationFormsRouteParams;
  answers: IntegrationFormsAnswer[];
  completedStepId: IntegrationFormsStep['id'];
};

export type IntegrationWorkflowFailureStage = 'bootstrap' | 'validation' | 'upload-handshake' | 'binary-transfer' | 'submission';

export type IntegrationCvWorkflowResult =
  | {
      status: 'completed';
      payload: IntegrationCvSerializedPayload;
      completion: IntegrationCompletionState;
      requestHeaders: Record<string, string>;
    }
  | {
      status: 'failed';
      stage: IntegrationWorkflowFailureStage;
      message: string;
    };

export type IntegrationFormsWorkflowResult =
  | {
      status: 'advanced';
      payload: IntegrationFormsSerializedPayload;
      nextStepIndex: number;
      requestHeaders: Record<string, string>;
      uploadHeaders?: Record<string, string>;
    }
  | {
      status: 'completed';
      payload: IntegrationFormsSerializedPayload;
      completion: IntegrationCompletionState;
      requestHeaders: Record<string, string>;
      uploadHeaders?: Record<string, string>;
    }
  | {
      status: 'failed';
      stage: IntegrationWorkflowFailureStage;
      message: string;
    };
