import { withCorrelationHeaders } from '../../../lib/api-client';
import type {
  IntegrationCvRouteParams,
  IntegrationCvWorkflowResult,
  IntegrationFormsAnswer,
  IntegrationFormsRouteParams,
  IntegrationFormsWorkflowResult,
} from './models';
import { mergeIntegrationFormsAnswer, serializeIntegrationCvSubmission, serializeIntegrationFormsSubmission } from './adapters';
import { getIntegrationFormsDraft, saveIntegrationCvCompletion, saveIntegrationFormsCompletion, saveIntegrationFormsDraft } from './store';

function headersToRecord(headers: Headers) {
  return Object.fromEntries(headers.entries());
}

export async function runIntegrationCvWorkflow(
  route: IntegrationCvRouteParams,
  candidateName: string,
  selection: 'slot-1' | 'slot-2' | 'unavailable' | 'accept' | 'reject',
  reason?: string,
): Promise<IntegrationCvWorkflowResult> {
  if (!candidateName.trim()) {
    return { status: 'failed', stage: 'bootstrap', message: 'Candidate context is missing.' };
  }

  if (selection === 'unavailable' && !reason?.trim()) {
    return { status: 'failed', stage: 'validation', message: 'Add a reason before marking yourself unavailable.' };
  }

  const request = withCorrelationHeaders({ method: 'POST' });
  const requestHeaders = headersToRecord(new Headers(request.headers));

  if (route.token.toLowerCase().includes('conflict')) {
    return { status: 'failed', stage: 'submission', message: 'The selected interview slot is no longer available.' };
  }

  if (route.token.toLowerCase().includes('submit-fail')) {
    return { status: 'failed', stage: 'submission', message: 'The integration callback could not be saved. Try again.' };
  }

  const payload = serializeIntegrationCvSubmission(route, candidateName, selection, reason);
  const completion = {
    kind:
      selection === 'accept'
        ? ('integration-cv-offer-accepted' as const)
        : selection === 'reject'
          ? ('integration-cv-offer-rejected' as const)
          : selection === 'unavailable'
            ? ('integration-cv-unavailable-confirmed' as const)
            : ('integration-cv-interview-confirmed' as const),
    message:
      selection === 'accept'
        ? 'Offer accepted successfully.'
        : selection === 'reject'
          ? 'Offer rejected successfully.'
          : selection === 'unavailable'
            ? 'Unavailability recorded successfully.'
            : 'Interview slot confirmed successfully.',
  };

  saveIntegrationCvCompletion(route.token, completion);

  return {
    status: 'completed',
    payload,
    completion,
    requestHeaders,
  };
}

export async function runIntegrationFormsWorkflow(
  route: IntegrationFormsRouteParams,
  answer: IntegrationFormsAnswer,
): Promise<IntegrationFormsWorkflowResult> {
  if (!answer.answer.trim()) {
    return { status: 'failed', stage: 'validation', message: 'Complete the current step before continuing.' };
  }

  if (answer.stepId === 'identity-document' && !answer.fileName?.trim()) {
    return { status: 'failed', stage: 'validation', message: 'Upload the requested file before continuing.' };
  }

  if (answer.fileName?.includes('handshake-fail')) {
    return { status: 'failed', stage: 'upload-handshake', message: 'Upload handshake failed. Try again.' };
  }

  if (answer.fileName?.includes('upload-fail')) {
    return { status: 'failed', stage: 'binary-transfer', message: 'Binary upload failed. Try again.' };
  }

  const request = withCorrelationHeaders({ method: 'POST' });
  const requestHeaders = headersToRecord(new Headers(request.headers));
  const uploadHeaders = answer.fileName ? headersToRecord(new Headers(withCorrelationHeaders({ method: 'PUT' }).headers)) : undefined;

  if (answer.answer.includes('submit-fail') || answer.fileName?.includes('persist-fail')) {
    return { status: 'failed', stage: 'submission', message: 'The forms/documents callback could not be saved. Try again.' };
  }

  const existingDraft = getIntegrationFormsDraft(route.token);
  const nextDraft = mergeIntegrationFormsAnswer(existingDraft, answer);
  saveIntegrationFormsDraft(route.token, nextDraft);

  const payload = serializeIntegrationFormsSubmission(route, nextDraft.answers, answer.stepId);
  if (nextDraft.answers.length < 2) {
    return {
      status: 'advanced',
      payload,
      nextStepIndex: nextDraft.answers.length,
      requestHeaders,
      uploadHeaders,
    };
  }

  const completion = {
    kind: 'integration-forms-complete' as const,
    message: 'Requested forms/documents submitted successfully.',
  };
  saveIntegrationFormsCompletion(route.token, completion);
  return {
    status: 'completed',
    payload,
    completion,
    requestHeaders,
    uploadHeaders,
  };
}
