import { describe, expect, it } from 'vitest';
import { validateInboxSearch } from './inbox-page';

describe('InboxPage route search', () => {
  it('keeps selected conversation URL-owned and sanitized', () => {
    expect(validateInboxSearch({ conversation: 'conversation-1' })).toEqual({ conversation: 'conversation-1' });
    expect(validateInboxSearch({ conversation: '' })).toEqual({ conversation: undefined });
  });
});
