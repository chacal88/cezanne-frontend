import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AccessBoundary, AccessProvider, type AccessContext } from '../../../lib/access-control';
import { RejectReasonsSettingsPage } from './reject-reasons-settings-page';

function buildAccessContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    isAuthenticated: true,
    organizationType: 'hc',
    isAdmin: true,
    isSysAdmin: false,
    pivotEntitlements: ['jobRequisition', 'seeCandidates'],
    subscriptionCapabilities: ['calendarIntegration', 'formsDocs', 'surveys', 'customFields', 'candidateTags', 'reviewRequests', 'interviewFeedback', 'inbox', 'rejectionReason'],
    rolloutFlags: [],
    ...overrides,
  };
}

describe('RejectReasonsSettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the dedicated reject-reasons route with a ready state', () => {
    render(
      <AccessProvider value={buildAccessContext()}>
        <RejectReasonsSettingsPage />
      </AccessProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Reject reasons settings' })).toBeInTheDocument();
    expect(screen.getByTestId('reject-reasons-readiness')).toHaveTextContent('ready');
    expect(screen.getByTestId('reject-reasons-downstream')).toHaveTextContent('job reject flow, candidate reject flow');
  });

  it('keeps entitlement gating explicit through the route boundary', () => {
    render(
      <AccessProvider value={buildAccessContext({ subscriptionCapabilities: [] })}>
        <AccessBoundary capability="canManageRejectReasons" fallback={<div data-testid="reject-reasons-denied">Denied</div>}>
          <RejectReasonsSettingsPage />
        </AccessBoundary>
      </AccessProvider>,
    );

    expect(screen.getByTestId('reject-reasons-denied')).toHaveTextContent('Denied');
  });

  it('supports recoverable failure and retry without leaving the route', async () => {
    const user = userEvent.setup();

    render(
      <AccessProvider value={buildAccessContext()}>
        <RejectReasonsSettingsPage />
      </AccessProvider>,
    );

    await user.click(screen.getByTestId('reject-reasons-simulate-failure'));
    await user.click(screen.getByTestId('reject-reasons-save-button'));

    expect(screen.getByTestId('reject-reasons-readiness')).toHaveTextContent('retryable-error');
    expect(screen.getByTestId('reject-reasons-mutation-state')).toHaveTextContent('submission-error');
    expect(screen.getByTestId('reject-reasons-retry-button')).toBeInTheDocument();

    await user.click(screen.getByTestId('reject-reasons-simulate-failure'));
    await user.click(screen.getByTestId('reject-reasons-retry-button'));

    expect(screen.getByTestId('reject-reasons-readiness')).toHaveTextContent('ready');
    expect(screen.getByTestId('reject-reasons-mutation-state')).toHaveTextContent('success');
  });
});
