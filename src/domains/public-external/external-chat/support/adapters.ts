import { getExternalChatConversation, getExternalChatDraft } from './store';
import { evaluateExternalChatAccess } from './access';
import type {
  ExternalChatMessage,
  ExternalChatMessageGroup,
  ExternalChatRouteParams,
  ExternalChatSerializedPayload,
  ExternalChatViewModel,
} from './models';
import { buildExternalChatBootstrapEndpoint } from './routing';

function titleCase(value: string) {
  return value
    .replace(/^(valid|expired|invalid|used|inaccessible)-?/i, '')
    .split(/[-_]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ');
}

function groupMessages(messages: ExternalChatMessage[]): ExternalChatMessageGroup[] {
  return messages.reduce<ExternalChatMessageGroup[]>((groups, message) => {
    const last = groups[groups.length - 1];
    const sameSender = last?.senderId === message.senderId;
    const withinHour =
      last != null && Math.abs(new Date(message.createdAt).getTime() - new Date(last.createdAt).getTime()) <= 60 * 60 * 1000;

    if (last && sameSender && withinHour) {
      last.messages.push(message.htmlMessage);
      last.createdAt = message.createdAt;
      return groups;
    }

    groups.push({
      senderId: message.senderId,
      senderName: message.senderName,
      senderRole: message.senderRole,
      createdAt: message.createdAt,
      messages: [message.htmlMessage],
    });
    return groups;
  }, []);
}

export function buildExternalChatViewModel(route: ExternalChatRouteParams): ExternalChatViewModel {
  const decision = evaluateExternalChatAccess(route);
  const messages = decision.canProceed ? getExternalChatConversation(route.token, route.userId) : [];
  const participantName = titleCase(route.token) || 'External participant';
  const partnerName = titleCase(route.userId) || 'Recruiter partner';

  return {
    route,
    decision,
    title: 'External shared chat',
    intro: `This direct-entry route preserves the legacy tokenized chat contract at ${buildExternalChatBootstrapEndpoint(route)} while keeping recruiter inbox state out of the page bootstrap.`,
    participantName,
    partnerName,
    groups: groupMessages(messages),
    draft: getExternalChatDraft(route.token, route.userId),
  };
}

export function serializeExternalChatMessage(route: ExternalChatRouteParams, participantName: string, partnerName: string, message: string): ExternalChatSerializedPayload {
  return {
    route,
    participantName,
    partnerName,
    message,
    endpoint: '/chat',
  };
}
