import { describe, expect, it } from 'vitest';
import { resolveTypedDestination } from './typed-destinations';
import { resolveTypedDestinationForR0 } from './destination-resolver';

describe('typed inbox conversation destination', () => {
  it('resolves inbox conversation notifications to URL-owned selection', () => {
    const destination = { kind: 'inbox.conversation' as const, conversationId: 'conversation-1' };

    expect(resolveTypedDestination(destination)).toBe('/inbox?conversation=conversation-1');
    expect(resolveTypedDestinationForR0(destination)).toMatchObject({
      status: 'available',
      target: '/inbox?conversation=conversation-1',
      fallbackTarget: '/access-denied',
    });
  });
});
