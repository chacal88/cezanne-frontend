import { withCorrelationHeaders } from '../../../lib/api-client';
import type {
  ExternalReviewDraft,
  ExternalReviewWorkflowResult,
  InterviewRequestDecisionChoice,
  InterviewRequestWorkflowResult,
  PublicApplicationDraft,
  PublicApplicationWorkflowResult,
  UploadedPublicFile,
} from './models';
import {
  saveApplicationCompletion,
  saveApplicationUploads,
  saveInterviewFeedbackCompletion,
  saveInterviewFeedbackDraft,
  saveInterviewRequestCompletion,
  saveReviewCandidateCompletion,
  saveReviewCandidateDraft,
  saveSurveyAnswer,
  saveSurveyCompletion,
} from './store';
import {
  serializeInterviewFeedbackSubmission,
  serializeInterviewRequestDecision,
  serializePublicApplicationSubmission,
  serializeReviewCandidateSubmission,
} from './adapters';

function headersToRecord(headers: Headers) {
  return Object.fromEntries(headers.entries());
}

function failWhen(condition: boolean, stage: Extract<PublicApplicationWorkflowResult, { status: 'failed' }>['stage'], message: string): PublicApplicationWorkflowResult | null {
  return condition ? { status: 'failed', stage, message } : null;
}

function normalizeUpload(fileName: string): UploadedPublicFile {
  const request = withCorrelationHeaders({ method: 'POST' });
  return {
    name: fileName,
    size: 1024,
    requestHeaders: headersToRecord(new Headers(request.headers)),
    status: 'uploaded',
  };
}

function validateReviewDraft(draft: ExternalReviewDraft) {
  return Boolean(draft.score.trim() && draft.summary.trim() && draft.recommendation.trim());
}

export async function runPublicApplicationWorkflow(route: { jobOrRole: string; token: string; source: string }, draft: PublicApplicationDraft): Promise<PublicApplicationWorkflowResult> {
  const validationFailure = failWhen(!draft.firstName || !draft.email, 'validation', 'First name and email are required.');
  if (validationFailure) return validationFailure;

  const handshakeFailure = failWhen(draft.fileName.includes('handshake-fail'), 'upload-handshake', 'Upload handshake failed.');
  if (handshakeFailure) return handshakeFailure;

  const uploadFailure = failWhen(draft.fileName.includes('upload-fail'), 'binary-transfer', 'Binary upload failed.');
  if (uploadFailure) return uploadFailure;

  const uploadedFiles = draft.fileName ? [normalizeUpload(draft.fileName)] : [];
  saveApplicationUploads(route.jobOrRole, route.token, route.source, uploadedFiles);

  const metadataFailure = failWhen(draft.fileName.includes('persist-fail'), 'metadata-persistence', 'Upload metadata persistence failed.');
  if (metadataFailure) return metadataFailure;

  const submissionFailure = failWhen(draft.email.includes('submit-fail'), 'submission', 'Public application submission failed.');
  if (submissionFailure) return submissionFailure;

  const payload = serializePublicApplicationSubmission(route, draft, uploadedFiles.map((file) => ({ name: file.name, size: file.size })));
  const completion = {
    kind: 'application-complete' as const,
    message: 'Application submitted successfully.',
  };
  saveApplicationCompletion(route.jobOrRole, route.token, route.source, completion);

  return {
    status: 'completed',
    uploadedFiles,
    payload,
    completion,
  };
}

export async function runPublicSurveyCompletion(route: { surveyuuid: string; jobuuid: string; cvuuid: string }, answer: string) {
  if (!answer.trim()) {
    return { status: 'failed' as const, message: 'Please provide an answer before continuing.' };
  }

  if (answer.includes('submit-fail')) {
    return { status: 'failed' as const, message: 'Survey submission failed. Try again.' };
  }

  saveSurveyAnswer(route.surveyuuid, route.jobuuid, route.cvuuid, answer);
  const completion = {
    kind: 'survey-complete' as const,
    message: 'Survey completed successfully.',
  };
  saveSurveyCompletion(route.surveyuuid, route.jobuuid, route.cvuuid, completion);
  return { status: 'completed' as const, completion };
}

export async function runInterviewRequestDecisionWorkflow(route: { scheduleUuid: string; cvToken: string }, participantName: string, decision: InterviewRequestDecisionChoice): Promise<InterviewRequestWorkflowResult> {
  if (!participantName.trim()) {
    return { status: 'failed', stage: 'bootstrap', message: 'Participant context is missing.' };
  }

  const request = withCorrelationHeaders({ method: 'POST' });
  const requestHeaders = headersToRecord(new Headers(request.headers));

  if (route.cvToken.includes('submit-fail')) {
    return { status: 'failed', stage: 'submission', message: 'Interview request response failed. Try again.' };
  }

  const payload = serializeInterviewRequestDecision(route, participantName, decision);
  const completion = {
    kind: decision === 'accept' ? ('interview-request-accepted' as const) : ('interview-request-declined' as const),
    message: decision === 'accept' ? 'Interview request accepted.' : 'Interview request declined.',
  };

  saveInterviewRequestCompletion(route.scheduleUuid, route.cvToken, completion);

  return {
    status: 'completed',
    payload,
    completion,
    requestHeaders,
  };
}

export async function runReviewCandidateWorkflow(route: { code: string }, participantName: string, draft: ExternalReviewDraft): Promise<ExternalReviewWorkflowResult> {
  saveReviewCandidateDraft(route.code, draft);

  if (!participantName.trim()) {
    return { status: 'failed', stage: 'bootstrap', message: 'Reviewer context is missing.' };
  }

  if (!validateReviewDraft(draft)) {
    return { status: 'failed', stage: 'validation', message: 'Complete every review field before submitting.' };
  }

  const request = withCorrelationHeaders({ method: 'POST' });
  const requestHeaders = headersToRecord(new Headers(request.headers));

  if (draft.summary.includes('submit-fail')) {
    return { status: 'failed', stage: 'submission', message: 'Candidate review submission failed. Try again.' };
  }

  const payload = serializeReviewCandidateSubmission(route, participantName, draft);
  const completion = {
    kind: 'review-submitted' as const,
    message: 'Candidate review submitted successfully.',
  };
  saveReviewCandidateCompletion(route.code, completion);

  return {
    status: 'completed',
    payload,
    completion,
    requestHeaders,
  };
}

export async function runInterviewFeedbackWorkflow(route: { code: string }, participantName: string, draft: ExternalReviewDraft): Promise<ExternalReviewWorkflowResult> {
  saveInterviewFeedbackDraft(route.code, draft);

  if (!participantName.trim()) {
    return { status: 'failed', stage: 'bootstrap', message: 'Interviewer context is missing.' };
  }

  if (!validateReviewDraft(draft)) {
    return { status: 'failed', stage: 'validation', message: 'Complete every feedback field before submitting.' };
  }

  const request = withCorrelationHeaders({ method: 'POST' });
  const requestHeaders = headersToRecord(new Headers(request.headers));

  if (draft.summary.includes('submit-fail')) {
    return { status: 'failed', stage: 'submission', message: 'Interview feedback submission failed. Try again.' };
  }

  const payload = serializeInterviewFeedbackSubmission(route, participantName, draft);
  const completion = {
    kind: 'feedback-submitted' as const,
    message: 'Interview feedback submitted successfully.',
  };
  saveInterviewFeedbackCompletion(route.code, completion);

  return {
    status: 'completed',
    payload,
    completion,
    requestHeaders,
  };
}
