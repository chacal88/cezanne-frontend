import { buildPublicApplicationPath } from './routing';
import {
  evaluateExternalParticipantAccess,
  evaluatePublicApplicationAccess,
  evaluatePublicSurveyAccess,
  evaluateSharedJobEntry,
} from './access';
import {
  getApplicationCompletion,
  getApplicationUploads,
  getInterviewFeedbackCompletion,
  getInterviewFeedbackDraft,
  getInterviewRequestCompletion,
  getReviewCandidateCompletion,
  getReviewCandidateDraft,
  getSurveyAnswer,
  getSurveyCompletion,
} from './store';
import type {
  ExternalReviewSerializedPayload,
  ExternalReviewViewModel,
  PublicApplicationSerializedPayload,
  PublicApplicationViewModel,
  PublicApplicationDraft,
  PublicSurveyViewModel,
  SharedJobRouteModel,
  InterviewRequestViewModel,
  InterviewRequestSerializedPayload,
  ExternalReviewDraft,
} from './models';

function toTitle(jobOrRole: string) {
  return jobOrRole
    .split('-')
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ');
}

function isOpen(jobOrRole: string) {
  return !jobOrRole.toLowerCase().includes('closed');
}

function buildParticipantName(seed: string) {
  return seed
    .replace(/^(valid|expired|invalid|used|inaccessible)-?/i, '')
    .split('-')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ') || 'External participant';
}

function matchesFamily(code: string, disallowed: string) {
  return !code.toLowerCase().includes(disallowed);
}

function defaultReviewDraft(): ExternalReviewDraft {
  return {
    score: '',
    summary: '',
    recommendation: 'yes',
  };
}

export function buildSharedJobViewModel(input: { jobOrRole: string; token: string; source: string }): SharedJobRouteModel {
  const decision = evaluateSharedJobEntry({ token: input.token, source: input.source, isAvailable: isOpen(input.jobOrRole) });
  return {
    route: input,
    decision,
    title: `${toTitle(input.jobOrRole)} role`,
    summary: `Public job presentation for ${toTitle(input.jobOrRole)} keeps token and source semantics in the route.`,
    sourceLabel: input.source,
    applicationPath: buildPublicApplicationPath(input),
  };
}

export function buildPublicApplicationViewModel(input: { jobOrRole: string; token: string; source: string }): PublicApplicationViewModel {
  const completion = getApplicationCompletion(input.jobOrRole, input.token, input.source);
  const decision = evaluatePublicApplicationAccess({
    token: input.token,
    source: input.source,
    isAvailable: isOpen(input.jobOrRole),
    isCompleted: Boolean(completion),
  });

  return {
    route: input,
    decision,
    title: `Apply for ${toTitle(input.jobOrRole)}`,
    intro: 'This public route owns schema defaults, upload workflow, retry handling, and completion state.',
    fields: [
      { key: 'firstName', label: 'First name', required: true },
      { key: 'email', label: 'Email', required: true },
      { key: 'phone', label: 'Phone', required: false },
      { key: 'motivation', label: 'Motivation', required: false },
    ],
    defaults: {
      firstName: '',
      email: '',
      phone: '',
      motivation: '',
    },
    uploads: getApplicationUploads(input.jobOrRole, input.token, input.source),
    completion,
  };
}

export function serializePublicApplicationSubmission(route: { jobOrRole: string; token: string; source: string }, draft: PublicApplicationDraft, uploadSizes: Array<{ name: string; size: number }>): PublicApplicationSerializedPayload {
  return {
    applicant: {
      firstName: draft.firstName,
      email: draft.email,
      phone: draft.phone || undefined,
      motivation: draft.motivation || undefined,
    },
    uploads: uploadSizes,
    route,
  };
}

export function buildPublicSurveyViewModel(input: { surveyuuid: string; jobuuid: string; cvuuid: string }): PublicSurveyViewModel {
  const completion = getSurveyCompletion(input.surveyuuid, input.jobuuid, input.cvuuid);
  const decision = evaluatePublicSurveyAccess({
    surveyuuid: input.surveyuuid,
    isAvailable: !input.surveyuuid.toLowerCase().includes('closed'),
    isCompleted: Boolean(completion),
  });

  return {
    route: input,
    decision,
    title: 'Candidate survey continuation',
    prompt: 'Tell us why this role matches your current priorities.',
    savedAnswer: getSurveyAnswer(input.surveyuuid, input.jobuuid, input.cvuuid),
    completion,
  };
}

export function buildInterviewRequestViewModel(input: { scheduleUuid: string; cvToken: string }): InterviewRequestViewModel {
  const terminalOutcome = getInterviewRequestCompletion(input.scheduleUuid, input.cvToken);
  const decision = evaluateExternalParticipantAccess({
    family: 'external-interview-request',
    token: input.cvToken,
    workflowType: 'decision',
    matchesRouteFamily: matchesFamily(input.cvToken, 'review') && matchesFamily(input.cvToken, 'feedback'),
    isAvailable: !input.scheduleUuid.toLowerCase().includes('closed'),
    isCompleted: Boolean(terminalOutcome),
    isReadyForSubmission: !input.scheduleUuid.toLowerCase().includes('missing-context'),
  });

  return {
    route: input,
    decision,
    title: 'Interview request',
    intro: 'Respond to this interview request directly from the public/external route.',
    participantName: buildParticipantName(input.cvToken),
    scheduledAt: '2026-04-25 14:00 UTC',
    terminalOutcome,
  };
}

export function serializeInterviewRequestDecision(route: { scheduleUuid: string; cvToken: string }, participantName: string, decision: 'accept' | 'decline'): InterviewRequestSerializedPayload {
  return {
    route,
    decision,
    participantName,
  };
}

export function buildReviewCandidateViewModel(input: { code: string }): ExternalReviewViewModel {
  const completion = getReviewCandidateCompletion(input.code);
  const defaults = getReviewCandidateDraft(input.code) ?? defaultReviewDraft();
  const decision = evaluateExternalParticipantAccess({
    family: 'external-review-candidate',
    token: input.code,
    workflowType: 'review-form',
    matchesRouteFamily: matchesFamily(input.code, 'feedback'),
    isAvailable: !input.code.toLowerCase().includes('closed'),
    isCompleted: Boolean(completion),
    isReadyForSubmission: !input.code.toLowerCase().includes('missing-schema'),
  });

  return {
    route: input,
    decision,
    title: 'Candidate review',
    intro: 'Review this candidate using the normalized external review aggregate and serializer.',
    participantName: buildParticipantName(input.code),
    schemaVersion: 'review-v1',
    questions: [
      { key: 'score', label: 'Overall score', required: true },
      { key: 'summary', label: 'Summary', required: true },
      { key: 'recommendation', label: 'Recommendation', required: true },
    ],
    defaults,
    completion,
  };
}

export function buildInterviewFeedbackViewModel(input: { code: string }): ExternalReviewViewModel {
  const completion = getInterviewFeedbackCompletion(input.code);
  const defaults = getInterviewFeedbackDraft(input.code) ?? defaultReviewDraft();
  const decision = evaluateExternalParticipantAccess({
    family: 'external-interview-feedback',
    token: input.code,
    workflowType: 'feedback-form',
    matchesRouteFamily: matchesFamily(input.code, 'review-candidate'),
    isAvailable: !input.code.toLowerCase().includes('closed'),
    isCompleted: Boolean(completion),
    isReadyForSubmission: !input.code.toLowerCase().includes('missing-schema'),
  });

  return {
    route: input,
    decision,
    title: 'Interview feedback',
    intro: 'Submit structured interview feedback without relying on recruiter-shell state.',
    participantName: buildParticipantName(input.code),
    schemaVersion: 'feedback-v1',
    questions: [
      { key: 'score', label: 'Interview score', required: true },
      { key: 'summary', label: 'Feedback summary', required: true },
      { key: 'recommendation', label: 'Move forward', required: true },
    ],
    defaults,
    completion,
  };
}

export function serializeReviewCandidateSubmission(route: { code: string }, participantName: string, draft: ExternalReviewDraft): ExternalReviewSerializedPayload {
  return {
    route,
    participantName,
    schemaVersion: 'review-v1',
    answers: draft,
  };
}

export function serializeInterviewFeedbackSubmission(route: { code: string }, participantName: string, draft: ExternalReviewDraft): ExternalReviewSerializedPayload {
  return {
    route,
    participantName,
    schemaVersion: 'feedback-v1',
    answers: draft,
  };
}
