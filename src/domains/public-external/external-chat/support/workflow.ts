import { withCorrelationHeaders } from '../../../../lib/api-client';
import type { ExternalChatMessage, ExternalChatRouteParams, ExternalChatWorkflowResult } from './models';
import { appendExternalChatMessage, clearExternalChatDraft, saveExternalChatDraft } from './store';
import { serializeExternalChatMessage } from './adapters';

function headersToRecord(headers: Headers) {
  return Object.fromEntries(headers.entries());
}

function createMessage(route: ExternalChatRouteParams, participantName: string, message: string): ExternalChatMessage {
  return {
    id: `${route.token}-${Date.now()}`,
    senderId: 'participant',
    senderName: participantName,
    senderRole: 'external-participant',
    createdAt: new Date().toISOString(),
    htmlMessage: message.replace(/\n/g, '<br />'),
  };
}

export async function runExternalChatMessageWorkflow(
  route: ExternalChatRouteParams,
  participantName: string,
  partnerName: string,
  message: string,
): Promise<ExternalChatWorkflowResult> {
  saveExternalChatDraft(route.token, route.userId, message);

  if (!participantName.trim() || !partnerName.trim()) {
    return { status: 'failed', stage: 'bootstrap', message: 'Chat participant context is missing.' };
  }

  if (!message.trim()) {
    return { status: 'failed', stage: 'validation', message: 'Enter a message before sending.' };
  }

  const request = withCorrelationHeaders({ method: 'POST' });
  const requestHeaders = headersToRecord(new Headers(request.headers));

  if (message.includes('submit-fail')) {
    return { status: 'failed', stage: 'submission', message: 'Message delivery failed. Try again.' };
  }

  appendExternalChatMessage(route.token, route.userId, createMessage(route, participantName, message));
  clearExternalChatDraft(route.token, route.userId);

  return {
    status: 'completed',
    payload: serializeExternalChatMessage(route, participantName, partnerName, message),
    requestHeaders,
  };
}
