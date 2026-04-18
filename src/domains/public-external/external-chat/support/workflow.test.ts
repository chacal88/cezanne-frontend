import { describe, expect, it } from 'vitest';
import { resetCorrelationId, setActiveCorrelationId } from '../../../../lib/observability';
import { getExternalChatConversation, getExternalChatDraft } from './store';
import { runExternalChatMessageWorkflow } from './workflow';
import { resolveExternalChatNotificationOwnership } from './notification-ownership';

describe('external tokenized chat workflow', () => {
  it('sends messages with hardened correlation-aware headers and appends the conversation', async () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_test_external_chat');

    const result = await runExternalChatMessageWorkflow(
      { token: 'valid-chat-token', userId: 'alex-reviewer' },
      'Morgan Candidate',
      'Alex Reviewer',
      'Thanks for the update',
    );

    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.requestHeaders['x-correlation-id']).toBe('corr_test_external_chat');
    expect(result.requestHeaders['x-requested-with']).toBe('XMLHttpRequest');
    const conversation = getExternalChatConversation('valid-chat-token', 'alex-reviewer');
    expect(conversation[conversation.length - 1]?.htmlMessage).toContain('Thanks for the update');
    expect(getExternalChatDraft('valid-chat-token', 'alex-reviewer')).toBe('');
  });

  it('keeps recoverable send failures on the same route and preserves the draft', async () => {
    const result = await runExternalChatMessageWorkflow(
      { token: 'valid-chat-token', userId: 'alex-reviewer' },
      'Morgan Candidate',
      'Alex Reviewer',
      'submit-fail please retry',
    );

    expect(result).toEqual({
      status: 'failed',
      stage: 'submission',
      message: 'Message delivery failed. Try again.',
    });
    expect(getExternalChatDraft('valid-chat-token', 'alex-reviewer')).toBe('submit-fail please retry');
  });

  it('keeps recruiter-internal notifications out of the external chat route', () => {
    expect(resolveExternalChatNotificationOwnership('user-mentioned')).toEqual({
      family: 'user-mentioned',
      owner: 'inbox',
      allowsExternalTokenDestination: false,
      reason: 'Mentions continue to resolve to recruiter inbox context and must not synthesize external chat token routes.',
    });
    expect(resolveExternalChatNotificationOwnership('cv-reviewed').allowsExternalTokenDestination).toBe(false);
    expect(resolveExternalChatNotificationOwnership('cv-interview-feedback').owner).toBe('candidate.detail');
  });
});
