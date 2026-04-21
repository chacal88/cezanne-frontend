import { evaluateIntegrationTokenEntry } from './access';
import { getIntegrationCvCompletion, getIntegrationFormsCompletion, getIntegrationFormsDraft } from './store';
import type {
  IntegrationCvRouteParams,
  IntegrationCvSerializedPayload,
  IntegrationCvViewModel,
  IntegrationFormsAnswer,
  IntegrationFormsDraft,
  IntegrationFormsRouteParams,
  IntegrationFormsSerializedPayload,
  IntegrationFormsStep,
  IntegrationFormsViewModel,
  IntegrationJobRouteParams,
  IntegrationJobViewModel,
} from './models';

const integrationFormSteps: IntegrationFormsStep[] = [
  {
    id: 'identity-document',
    label: 'Identity document upload',
    requiresFile: true,
    prompt: 'Upload the requested identity document.',
  },
  {
    id: 'availability-notes',
    label: 'Availability notes',
    requiresFile: false,
    prompt: 'Share any notes required to complete the request.',
  },
];

function buildPersonName(seed: string) {
  return (
    seed
      .replace(/^(valid|expired|invalid|used|inaccessible)-?/i, '')
      .split('-')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
      .join(' ') || 'Alex Candidate'
  );
}

function matchesCvFamily(token: string) {
  const normalized = token.toLowerCase();
  return !normalized.includes('forms') && !normalized.includes('job');
}

function matchesFormsFamily(token: string) {
  const normalized = token.toLowerCase();
  return !normalized.includes('job') && !normalized.includes('offer-only');
}

function matchesJobFamily(token: string) {
  return !token.toLowerCase().includes('forms');
}

export function buildIntegrationCvViewModel(route: IntegrationCvRouteParams): IntegrationCvViewModel {
  const completion = getIntegrationCvCompletion(route.token);
  const currentAction = route.action === 'offer' || route.token.toLowerCase().includes('offer') ? 'offer' : 'interview';
  const decision = evaluateIntegrationTokenEntry({
    family: 'integration-cv',
    token: route.token,
    workflowType: 'cv-action',
    matchesRouteFamily: matchesCvFamily(route.token),
    isAvailable: !route.token.toLowerCase().includes('locked'),
    isCompleted: Boolean(completion),
    isReadyForSubmission: !route.token.toLowerCase().includes('missing-context'),
  });

  return {
    route,
    decision,
    title: 'Integration CV callback',
    intro: 'This token route owns interview confirmation, conflict recovery, and offer response behavior.',
    candidateName: buildPersonName(route.token),
    jobTitle: route.token.toLowerCase().includes('finance') ? 'Finance Analyst' : 'Product Designer',
    interviewChoices: [
      { id: 'slot-1', label: 'Tuesday 14:00' },
      { id: 'slot-2', label: 'Wednesday 10:30' },
      { id: 'unavailable', label: 'I am unavailable for the proposed slots', requiresReason: true },
    ],
    offerValue: '€65,000',
    offerMessage: 'Please confirm whether you want to accept this offer.',
    currentAction,
    completion,
  };
}

export function buildIntegrationFormsViewModel(route: IntegrationFormsRouteParams): IntegrationFormsViewModel {
  const completion = getIntegrationFormsCompletion(route.token);
  const draft = getIntegrationFormsDraft(route.token);
  const currentStepIndex = Math.min(draft.answers.length, integrationFormSteps.length - 1);
  const decision = evaluateIntegrationTokenEntry({
    family: 'integration-forms',
    token: route.token,
    workflowType: 'forms-documents',
    matchesRouteFamily: matchesFormsFamily(route.token),
    isAvailable: !route.token.toLowerCase().includes('locked'),
    isCompleted: Boolean(completion),
    isReadyForSubmission: !route.token.toLowerCase().includes('missing-context'),
  });

  return {
    route,
    decision,
    title: 'Requested forms and documents',
    intro: 'This token route owns sequential forms/documents completion, signed upload, persistence, and stable completion.',
    candidateName: buildPersonName(route.token),
    jobTitle: route.token.toLowerCase().includes('finance') ? 'Finance Analyst' : 'Product Designer',
    steps: integrationFormSteps,
    currentStepIndex,
    draft,
    completion,
  };
}

export function buildIntegrationJobViewModel(route: IntegrationJobRouteParams): IntegrationJobViewModel {
  const decision = evaluateIntegrationTokenEntry({
    family: 'integration-job',
    token: route.token,
    workflowType: 'job-presentation',
    matchesRouteFamily: matchesJobFamily(route.token),
    isAvailable: !route.token.toLowerCase().includes('locked'),
  });

  return {
    route,
    decision,
    title: route.token.toLowerCase().includes('finance') ? 'Finance Analyst' : 'Product Designer',
    companyName: route.token.toLowerCase().includes('agency') ? 'Northwind Agency' : 'Acme Hiring',
    location: route.token.toLowerCase().includes('london') ? 'London' : 'Dublin',
    summary: 'This token route renders a normalized job callback view without authenticated recruiter-shell bootstrap.',
  };
}

export function serializeIntegrationCvSubmission(
  route: IntegrationCvRouteParams,
  candidateName: string,
  selection: 'slot-1' | 'slot-2' | 'unavailable' | 'accept' | 'reject',
  reason?: string,
): IntegrationCvSerializedPayload {
  return {
    route,
    candidateName,
    action: selection === 'accept' || selection === 'reject' ? 'offer-response' : 'interview-confirmation',
    selection,
    reason: reason?.trim() || undefined,
  };
}

export function serializeIntegrationFormsSubmission(
  route: IntegrationFormsRouteParams,
  answers: IntegrationFormsAnswer[],
  completedStepId: IntegrationFormsStep['id'],
): IntegrationFormsSerializedPayload {
  return {
    route,
    answers,
    completedStepId,
  };
}

export function mergeIntegrationFormsAnswer(draft: IntegrationFormsDraft, answer: IntegrationFormsAnswer): IntegrationFormsDraft {
  const nextAnswers = draft.answers.filter((item) => item.stepId !== answer.stepId);
  nextAnswers.push(answer);
  return {
    answers: nextAnswers.sort((left, right) => integrationFormSteps.findIndex((step) => step.id == left.stepId) - integrationFormSteps.findIndex((step) => step.id == right.stepId)),
  };
}
