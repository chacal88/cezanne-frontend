import { interpretPublicTokenState } from '../../support/access';
import type { ExternalChatDecision } from './models';

function isEncryptedUserContext(userId: string) {
  return userId.trim().length > 0 && !userId.toLowerCase().startsWith('invalid-user');
}

function hasExistingConversation(token: string, userId: string) {
  const normalizedToken = token.toLowerCase();
  const normalizedUser = userId.toLowerCase();
  return !normalizedToken.includes('no-thread') && !normalizedToken.includes('missing-thread') && !normalizedUser.includes('no-thread');
}

export function evaluateExternalChatAccess(input: { token: string; userId: string }): ExternalChatDecision {
  const tokenState = interpretPublicTokenState(input.token);

  if (tokenState !== 'valid') {
    return {
      family: 'external-tokenized-chat',
      capabilityKey: 'canUseExternalTokenizedChat',
      tokenState,
      readiness: 'token-state',
      canProceed: false,
      conversationReadiness: 'missing-thread',
      sendReadiness: 'missing-context',
      reason: tokenState,
    };
  }

  if (!isEncryptedUserContext(input.userId)) {
    return {
      family: 'external-tokenized-chat',
      capabilityKey: 'canUseExternalTokenizedChat',
      tokenState,
      readiness: 'token-state',
      canProceed: false,
      conversationReadiness: 'missing-thread',
      sendReadiness: 'missing-context',
      reason: 'invalid user context',
    };
  }

  if (!hasExistingConversation(input.token, input.userId)) {
    return {
      family: 'external-tokenized-chat',
      capabilityKey: 'canUseExternalTokenizedChat',
      tokenState: 'inaccessible',
      readiness: 'unavailable',
      canProceed: false,
      conversationReadiness: 'missing-thread',
      sendReadiness: 'missing-context',
      reason: 'no existing conversation',
    };
  }

  return {
    family: 'external-tokenized-chat',
    capabilityKey: 'canUseExternalTokenizedChat',
    tokenState,
    readiness: 'ready',
    canProceed: true,
    conversationReadiness: 'ready',
    sendReadiness: 'ready',
  };
}
