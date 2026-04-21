import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { InboxPage, validateInboxSearch } from './inbox-page';
import { renderWithProviders } from '../../testing/render';

describe('InboxPage route search', () => {
  it('keeps selected conversation URL-owned and sanitized', () => {
    expect(validateInboxSearch({ conversation: 'conversation-1' })).toEqual({ conversation: 'conversation-1', entry: undefined, draft: undefined, returnTo: undefined });
    expect(validateInboxSearch({ conversation: '' })).toEqual({ conversation: undefined, entry: undefined, draft: undefined, returnTo: undefined });
    expect(validateInboxSearch({ conversation: '../bad', entry: 'notification', returnTo: '/candidate/candidate-1', draft: ' Hello ' })).toEqual({ conversation: undefined, entry: 'notification', draft: 'Hello', returnTo: '/candidate/candidate-1' });
  });

  it('renders product-depth direct entry state for a fixture-backed conversation', () => {
    window.history.pushState({}, '', '/inbox?conversation=conversation-123&entry=notification&draft=Reply&returnTo=/dashboard');
    renderWithProviders(<InboxPage />);

    expect(screen.getByTestId('inbox-active-conversation')).toHaveTextContent('conversation-123');
    expect(screen.getByTestId('inbox-conversation-state')).toHaveTextContent('ready');
    expect(screen.getByTestId('inbox-entry-mode')).toHaveTextContent('notification');
    expect(screen.getByTestId('inbox-subject')).toHaveTextContent('Candidate follow-up');
    expect(screen.getByTestId('inbox-can-send')).toHaveTextContent('true');
    expect(screen.getByTestId('inbox-return-target')).toHaveAttribute('href', '/dashboard');
  });
});
