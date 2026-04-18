import { describe, expect, it } from 'vitest';
import { evaluateExternalChatAccess } from './access';

describe('external tokenized chat access', () => {
  it('allows actionable access only when token and user context resolve', () => {
    const decision = evaluateExternalChatAccess({ token: 'valid-chat-token', userId: 'alex-reviewer' });

    expect(decision.capabilityKey).toBe('canUseExternalTokenizedChat');
    expect(decision.canProceed).toBe(true);
    expect(decision.readiness).toBe('ready');
  });

  it('keeps invalid tokens inside the public token-state model', () => {
    const decision = evaluateExternalChatAccess({ token: 'expired-chat-token', userId: 'alex-reviewer' });

    expect(decision.canProceed).toBe(false);
    expect(decision.tokenState).toBe('expired');
    expect(decision.readiness).toBe('token-state');
  });

  it('treats missing existing conversation eligibility as inaccessible', () => {
    const decision = evaluateExternalChatAccess({ token: 'valid-chat-no-thread', userId: 'alex-reviewer' });

    expect(decision.canProceed).toBe(false);
    expect(decision.tokenState).toBe('inaccessible');
    expect(decision.reason).toBe('no existing conversation');
  });
});
