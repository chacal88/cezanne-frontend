import { describe, expect, it } from 'vitest';
import { resetCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildExternalChatPath } from '../../public-external/external-chat/support';
import { buildIntegrationCvPath } from '../../integrations/support';
import {
  buildCandidateConversationHandoff,
  buildInboxConversationPath,
  buildInboxConversationStateFromAdapter,
  buildMessagingOperationalState,
  buildMessagingTelemetry,
  buildMessagingStateFromEmailDeliverabilityReadiness,
  refreshStaleConversation,
  resolveInboxConversationDestination,
  resolveMessagingSendResult,
  retryMessagingSend,
  startMessagingSend,
} from './messaging';
import { buildEmailDeliverabilityReadiness } from './email-deliverability-readiness';

describe('messaging communication operational helpers', () => {
  it('models URL-owned selected conversation states route-locally', () => {
    expect(buildMessagingOperationalState({}).kind).toBe('empty');
    expect(buildMessagingOperationalState({ conversationId: 'conversation-1', exists: false })).toMatchObject({ kind: 'not-found', fallbackKind: 'inbox' });
    expect(buildMessagingOperationalState({ conversationId: 'conversation-1', accessible: false })).toMatchObject({ kind: 'inaccessible', fallbackKind: 'inbox' });
    expect(buildMessagingOperationalState({ conversationId: 'conversation-1', readiness: 'provider-blocked' })).toMatchObject({ kind: 'provider-blocked', canSend: false });
    expect(buildMessagingOperationalState({ conversationId: 'conversation-1', readiness: 'degraded' }).kind).toBe('degraded');
    expect(buildMessagingOperationalState({ conversationId: 'conversation-1', readiness: 'unavailable' }).kind).toBe('unavailable');
    expect(buildMessagingOperationalState({ conversationId: 'conversation-1', draft: { body: ' Hello ' } })).toMatchObject({ kind: 'ready', canSend: true, draft: { body: 'Hello' } });
  });


  it('loads direct-entry conversation state through a replaceable adapter seam', () => {
    expect(buildInboxConversationStateFromAdapter({ conversationId: 'conversation-123', entryMode: 'notification' })).toMatchObject({
      kind: 'ready',
      subject: 'Candidate follow-up',
      participantLabel: 'Alex Candidate',
      adapterContract: 'fixture',
      entryMode: 'notification',
    });
    expect(buildInboxConversationStateFromAdapter({ conversationId: 'conversation-private' })).toMatchObject({ kind: 'inaccessible', fallbackKind: 'inbox' });
    expect(buildInboxConversationStateFromAdapter({ conversationId: 'conversation-stale', draft: { body: 'Reply' } })).toMatchObject({ kind: 'stale-conversation', refreshRequired: true, draft: { body: 'Reply' } });
    expect(buildInboxConversationStateFromAdapter({ conversationId: 'missing-conversation' })).toMatchObject({ kind: 'not-found' });
  });

  it('resolves notification destinations before conversation rendering with typed fallback', () => {
    expect(buildInboxConversationPath('conversation-1')).toBe('/inbox?conversation=conversation-1');
    expect(resolveInboxConversationDestination({ conversationId: 'conversation-1', canViewInbox: true, canOpenConversation: true })).toMatchObject({
      status: 'resolved',
      target: { conversationId: 'conversation-1', path: '/inbox?conversation=conversation-1', entryMode: 'notification' },
    });
    expect(resolveInboxConversationDestination({ conversationId: 'conversation-1', canViewInbox: true, canOpenConversation: false })).toEqual({
      status: 'denied',
      target: '/inbox',
      fallbackKind: 'inbox',
      reason: 'conversation-denied',
    });
    expect(resolveInboxConversationDestination({ conversationId: 'conversation-1', canViewInbox: false, canOpenConversation: true })).toEqual({
      status: 'denied',
      target: '/dashboard',
      fallbackKind: 'dashboard',
      reason: 'inbox-denied',
    });
  });

  it('handles send, recoverable failure, retry, stale refresh, and sent states without losing conversation context', () => {
    const ready = buildMessagingOperationalState({ conversationId: 'conversation-1', draft: { body: 'Reply to candidate' } });

    expect(startMessagingSend(ready)).toMatchObject({ kind: 'sending', conversationId: 'conversation-1' });
    const failed = resolveMessagingSendResult({ state: ready, outcome: 'failed' });
    expect(failed).toMatchObject({ kind: 'send-failed', retryAllowed: true, draft: { body: 'Reply to candidate' } });
    expect(retryMessagingSend(failed)).toMatchObject({ kind: 'ready', canSend: true, conversationId: 'conversation-1' });
    const stale = resolveMessagingSendResult({ state: ready, outcome: 'stale' });
    expect(stale).toMatchObject({ kind: 'stale-conversation', refreshRequired: true, draft: { body: 'Reply to candidate' } });
    expect(refreshStaleConversation(stale)).toMatchObject({ kind: 'ready', conversationId: 'conversation-1' });
    expect(resolveMessagingSendResult({ state: ready, outcome: 'sent' })).toMatchObject({ kind: 'sent', draft: {} });
  });

  it('preserves candidate recovery context during conversation handoff', () => {
    expect(buildCandidateConversationHandoff({ candidateId: 'candidate-1', conversationId: 'conversation-1', canOpenCandidateConversation: true, recoveryTarget: '/candidate/candidate-1' })).toMatchObject({
      status: 'opened',
      target: { path: '/inbox?conversation=conversation-1', returnTarget: '/candidate/candidate-1' },
      recoveryTarget: '/candidate/candidate-1',
    });
    expect(buildCandidateConversationHandoff({ candidateId: 'candidate-1', canOpenCandidateConversation: true, recoveryTarget: '/candidate/candidate-1' })).toMatchObject({
      status: 'unavailable',
      state: { kind: 'empty', fallbackKind: 'inbox' },
    });
    expect(buildCandidateConversationHandoff({ candidateId: 'candidate-1', conversationId: 'conversation-1', canOpenCandidateConversation: false, recoveryTarget: '/candidate/candidate-1' })).toMatchObject({
      status: 'inaccessible',
      state: { kind: 'inaccessible', returnTarget: '/candidate/candidate-1' },
    });
  });

  it('consumes email deliverability readiness as normalized messaging state without setup ownership', () => {
    const readiness = buildEmailDeliverabilityReadiness({ domainStatus: 'failed', signatureStatus: 'confirmed', providerFamily: 'postmark', domainCategory: 'managed' });
    const state = buildMessagingStateFromEmailDeliverabilityReadiness({ conversationId: 'conversation-1', readiness, draft: { body: 'Reply' } });

    expect(state).toMatchObject({
      kind: 'provider-blocked',
      canSend: false,
      conversationId: 'conversation-1',
      fallbackKind: 'none',
    });
    expect(JSON.stringify(state)).not.toContain('/settings');
    expect(JSON.stringify(state)).not.toContain('/integrations');
    expect(JSON.stringify(state)).not.toContain('PostmarkDomainID');
  });

  it('emits allowlisted telemetry and keeps external token chat/integration routes separate', () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_message_safe');
    const event = buildMessagingTelemetry({ routeFamily: 'inbox', action: 'send_failed', messagingState: 'send-failed', entryMode: 'direct-url', fallbackKind: 'none' });

    expect(event).toEqual({
      name: 'messaging_conversation_action',
      data: {
        routeFamily: 'inbox',
        action: 'send_failed',
        messagingState: 'send-failed',
        entryMode: 'direct-url',
        fallbackKind: 'none',
        correlationId: 'corr_message_safe',
      },
    });
    expect(JSON.stringify(event.data)).not.toContain('message body');
    expect(JSON.stringify(event.data)).not.toContain('token');
    expect(buildExternalChatPath({ token: 'valid-chat-token', userId: 'alex-reviewer' })).toBe('/chat/valid-chat-token/alex-reviewer');
    expect(buildIntegrationCvPath({ token: 'public-token' })).toBe('/integration/cv/public-token');
  });
});
