import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExternalChatPage } from './external-chat-page';

describe('ExternalChatPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders grouped messages for actionable chat routes', () => {
    render(<ExternalChatPage token="valid-chat-token" userId="alex-reviewer" />);

    expect(screen.getByTestId('external-chat-participant')).toHaveTextContent('External participant: Chat Token');
    expect(screen.getAllByTestId('external-chat-message').length).toBeGreaterThan(1);
  });

  it('shows public token-state messaging when no eligible conversation exists', () => {
    render(<ExternalChatPage token="valid-chat-no-thread" userId="alex-reviewer" />);

    expect(screen.getByTestId('external-tokenized-chat-token-state')).toHaveTextContent('inaccessible');
  });

  it('preserves draft text after recoverable send failure', async () => {
    const user = userEvent.setup();
    render(<ExternalChatPage token="valid-chat-token" userId="alex-reviewer" />);

    const draft = screen.getByTestId('external-chat-draft');
    await user.clear(draft);
    await user.type(draft, 'submit-fail please retry');
    await user.click(screen.getByTestId('external-chat-send-button'));

    expect(screen.getByTestId('external-chat-error')).toHaveTextContent('Message delivery failed. Try again.');
    expect(screen.getByTestId('external-chat-draft')).toHaveValue('submit-fail please retry');
  });
});
