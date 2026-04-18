import type { ExternalChatMessage } from './models';

const conversations = new Map<string, ExternalChatMessage[]>();
const drafts = new Map<string, string>();

function buildKey(token: string, userId: string) {
  return `${token}::${userId}`;
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

function titleCase(value: string) {
  return value
    .replace(/^(valid|expired|invalid|used|inaccessible)-?/i, '')
    .split(/[-_]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ');
}

function seedConversation(token: string, userId: string): ExternalChatMessage[] {
  const participantName = titleCase(token) || 'External participant';
  const partnerName = titleCase(userId) || 'Recruiter partner';

  return [
    {
      id: `${token}-1`,
      senderId: 'partner',
      senderName: partnerName,
      senderRole: 'recruiter-partner',
      createdAt: '2026-04-18T09:00:00.000Z',
      htmlMessage: `Hi ${participantName || 'there'}, thanks for joining this shared conversation.`,
    },
    {
      id: `${token}-2`,
      senderId: 'partner',
      senderName: partnerName,
      senderRole: 'recruiter-partner',
      createdAt: '2026-04-18T09:25:00.000Z',
      htmlMessage: 'Please use this page if you need to clarify anything about the process.',
    },
    {
      id: `${token}-3`,
      senderId: 'participant',
      senderName: participantName || 'External participant',
      senderRole: 'external-participant',
      createdAt: '2026-04-18T10:30:00.000Z',
      htmlMessage: 'Thanks, I can access the route and follow up here.',
    },
  ];
}

export function getExternalChatConversation(token: string, userId: string) {
  const key = buildKey(token, userId);
  return conversations.get(key) ?? readStorage<ExternalChatMessage[]>(`external-chat-conversation:${key}`) ?? seedConversation(token, userId);
}

export function saveExternalChatConversation(token: string, userId: string, messages: ExternalChatMessage[]) {
  const key = buildKey(token, userId);
  conversations.set(key, messages);
  writeStorage(`external-chat-conversation:${key}`, messages);
}

export function appendExternalChatMessage(token: string, userId: string, message: ExternalChatMessage) {
  const next = [...getExternalChatConversation(token, userId), message];
  saveExternalChatConversation(token, userId, next);
  return next;
}

export function getExternalChatDraft(token: string, userId: string) {
  const key = buildKey(token, userId);
  return drafts.get(key) ?? readStorage<string>(`external-chat-draft:${key}`) ?? '';
}

export function saveExternalChatDraft(token: string, userId: string, draft: string) {
  const key = buildKey(token, userId);
  drafts.set(key, draft);
  writeStorage(`external-chat-draft:${key}`, draft);
}

export function clearExternalChatDraft(token: string, userId: string) {
  saveExternalChatDraft(token, userId, '');
}
