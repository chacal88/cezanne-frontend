import { describe, expect, it } from 'vitest';
import { matchRouteMetadata } from '../../../../lib/routing';
import { buildExternalChatBootstrapEndpoint, buildExternalChatPath } from './routing';

describe('external tokenized chat routing', () => {
  it('builds the canonical route and legacy bootstrap endpoint', () => {
    expect(buildExternalChatPath({ token: 'valid-chat-token', userId: 'alex-reviewer' })).toBe('/chat/valid-chat-token/alex-reviewer');
    expect(buildExternalChatBootstrapEndpoint({ token: 'valid-chat-token', userId: 'alex-reviewer' })).toBe(
      '/chat/messages/valid-chat-token/alex-reviewer',
    );
  });

  it('registers route metadata for the external chat surface', () => {
    const match = matchRouteMetadata('/chat/valid-chat-token/alex-reviewer');

    expect(match?.metadata.routeId).toBe('public-external.external-chat');
    expect(match?.metadata.module).toBe('external-chat');
    expect(match?.metadata.routeClass).toBe('Public/Token');
  });
});
