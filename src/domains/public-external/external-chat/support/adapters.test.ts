import { describe, expect, it } from 'vitest';
import { buildExternalChatViewModel, serializeExternalChatMessage } from './adapters';
import { saveExternalChatConversation } from './store';

describe('external chat adapters', () => {
  it('normalizes legacy-style message lists into grouped route-facing messages', () => {
    saveExternalChatConversation('valid-chat-token', 'alex-reviewer', [
      {
        id: '1',
        senderId: 'partner',
        senderName: 'Alex Reviewer',
        senderRole: 'recruiter-partner',
        createdAt: '2026-04-18T09:00:00.000Z',
        htmlMessage: 'First message',
      },
      {
        id: '2',
        senderId: 'partner',
        senderName: 'Alex Reviewer',
        senderRole: 'recruiter-partner',
        createdAt: '2026-04-18T09:20:00.000Z',
        htmlMessage: 'Follow-up message',
      },
      {
        id: '3',
        senderId: 'participant',
        senderName: 'Morgan Candidate',
        senderRole: 'external-participant',
        createdAt: '2026-04-18T11:00:00.000Z',
        htmlMessage: 'Thanks for the update',
      },
    ]);

    const view = buildExternalChatViewModel({ token: 'valid-chat-token', userId: 'alex-reviewer' });

    expect(view.groups).toHaveLength(2);
    expect(view.groups[0]?.messages).toEqual(['First message', 'Follow-up message']);
    expect(view.groups[1]?.senderRole).toBe('external-participant');
  });

  it('serializes message submission against the legacy POST endpoint contract', () => {
    const payload = serializeExternalChatMessage(
      { token: 'valid-chat-token', userId: 'alex-reviewer' },
      'Morgan Candidate',
      'Alex Reviewer',
      'Thanks for the update',
    );

    expect(payload).toEqual({
      route: { token: 'valid-chat-token', userId: 'alex-reviewer' },
      participantName: 'Morgan Candidate',
      partnerName: 'Alex Reviewer',
      message: 'Thanks for the update',
      endpoint: '/chat',
    });
  });
});
