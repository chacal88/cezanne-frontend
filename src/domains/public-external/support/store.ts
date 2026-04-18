import type { ExternalCompletionState, ExternalReviewDraft, PublicCompletionState, UploadedPublicFile } from './models';

const applicationUploads = new Map<string, UploadedPublicFile[]>();
const applicationCompletions = new Map<string, PublicCompletionState>();
const surveyCompletions = new Map<string, PublicCompletionState>();
const surveyAnswers = new Map<string, string>();
const interviewRequestCompletions = new Map<string, ExternalCompletionState>();
const reviewCandidateCompletions = new Map<string, ExternalCompletionState>();
const interviewFeedbackCompletions = new Map<string, ExternalCompletionState>();
const reviewCandidateDrafts = new Map<string, ExternalReviewDraft>();
const interviewFeedbackDrafts = new Map<string, ExternalReviewDraft>();

function buildKey(parts: string[]) {
  return parts.join('::');
}

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getApplicationUploads(jobOrRole: string, token: string, source: string) {
  const key = buildKey([jobOrRole, token, source]);
  return applicationUploads.get(key) ?? readStorage<UploadedPublicFile[]>(`public-application-uploads:${key}`) ?? [];
}

export function saveApplicationUploads(jobOrRole: string, token: string, source: string, uploads: UploadedPublicFile[]) {
  const key = buildKey([jobOrRole, token, source]);
  applicationUploads.set(key, uploads);
  writeStorage(`public-application-uploads:${key}`, uploads);
}

export function getApplicationCompletion(jobOrRole: string, token: string, source: string) {
  const key = buildKey([jobOrRole, token, source]);
  return applicationCompletions.get(key) ?? readStorage<PublicCompletionState>(`public-application-completion:${key}`) ?? null;
}

export function saveApplicationCompletion(jobOrRole: string, token: string, source: string, completion: PublicCompletionState) {
  const key = buildKey([jobOrRole, token, source]);
  applicationCompletions.set(key, completion);
  writeStorage(`public-application-completion:${key}`, completion);
}

export function getSurveyCompletion(surveyuuid: string, jobuuid: string, cvuuid: string) {
  const key = buildKey([surveyuuid, jobuuid, cvuuid]);
  return surveyCompletions.get(key) ?? readStorage<PublicCompletionState>(`public-survey-completion:${key}`) ?? null;
}

export function saveSurveyCompletion(surveyuuid: string, jobuuid: string, cvuuid: string, completion: PublicCompletionState) {
  const key = buildKey([surveyuuid, jobuuid, cvuuid]);
  surveyCompletions.set(key, completion);
  writeStorage(`public-survey-completion:${key}`, completion);
}

export function getSurveyAnswer(surveyuuid: string, jobuuid: string, cvuuid: string) {
  const key = buildKey([surveyuuid, jobuuid, cvuuid]);
  return surveyAnswers.get(key) ?? readStorage<string>(`public-survey-answer:${key}`) ?? '';
}

export function saveSurveyAnswer(surveyuuid: string, jobuuid: string, cvuuid: string, answer: string) {
  const key = buildKey([surveyuuid, jobuuid, cvuuid]);
  surveyAnswers.set(key, answer);
  writeStorage(`public-survey-answer:${key}`, answer);
}

export function getInterviewRequestCompletion(scheduleUuid: string, cvToken: string) {
  const key = buildKey([scheduleUuid, cvToken]);
  return interviewRequestCompletions.get(key) ?? readStorage<ExternalCompletionState>(`external-interview-request-completion:${key}`) ?? null;
}

export function saveInterviewRequestCompletion(scheduleUuid: string, cvToken: string, completion: ExternalCompletionState) {
  const key = buildKey([scheduleUuid, cvToken]);
  interviewRequestCompletions.set(key, completion);
  writeStorage(`external-interview-request-completion:${key}`, completion);
}

export function getReviewCandidateCompletion(code: string) {
  return reviewCandidateCompletions.get(code) ?? readStorage<ExternalCompletionState>(`external-review-candidate-completion:${code}`) ?? null;
}

export function saveReviewCandidateCompletion(code: string, completion: ExternalCompletionState) {
  reviewCandidateCompletions.set(code, completion);
  writeStorage(`external-review-candidate-completion:${code}`, completion);
}

export function getInterviewFeedbackCompletion(code: string) {
  return interviewFeedbackCompletions.get(code) ?? readStorage<ExternalCompletionState>(`external-interview-feedback-completion:${code}`) ?? null;
}

export function saveInterviewFeedbackCompletion(code: string, completion: ExternalCompletionState) {
  interviewFeedbackCompletions.set(code, completion);
  writeStorage(`external-interview-feedback-completion:${code}`, completion);
}

export function getReviewCandidateDraft(code: string) {
  return reviewCandidateDrafts.get(code) ?? readStorage<ExternalReviewDraft>(`external-review-candidate-draft:${code}`) ?? null;
}

export function saveReviewCandidateDraft(code: string, draft: ExternalReviewDraft) {
  reviewCandidateDrafts.set(code, draft);
  writeStorage(`external-review-candidate-draft:${code}`, draft);
}

export function getInterviewFeedbackDraft(code: string) {
  return interviewFeedbackDrafts.get(code) ?? readStorage<ExternalReviewDraft>(`external-interview-feedback-draft:${code}`) ?? null;
}

export function saveInterviewFeedbackDraft(code: string, draft: ExternalReviewDraft) {
  interviewFeedbackDrafts.set(code, draft);
  writeStorage(`external-interview-feedback-draft:${code}`, draft);
}
