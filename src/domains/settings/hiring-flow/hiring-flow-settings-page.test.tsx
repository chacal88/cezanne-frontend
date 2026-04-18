import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AccessBoundary, AccessProvider, type AccessContext } from '../../../lib/access-control';
import { HiringFlowSettingsPage } from './hiring-flow-settings-page';

function buildAccessContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    isAuthenticated: true,
    organizationType: 'hc',
    isAdmin: true,
    isSysAdmin: false,
    pivotEntitlements: ['jobRequisition', 'seeCandidates'],
    subscriptionCapabilities: ['calendarIntegration', 'formsDocs', 'surveys', 'customFields', 'candidateTags', 'reviewRequests', 'interviewFeedback', 'inbox'],
    rolloutFlags: [],
    ...overrides,
  };
}

describe('HiringFlowSettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the dedicated hiring-flow route with a ready state', () => {
    render(
      <AccessProvider value={buildAccessContext()}>
        <HiringFlowSettingsPage />
      </AccessProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Hiring flow settings' })).toBeInTheDocument();
    expect(screen.getByTestId('hiring-flow-readiness')).toHaveTextContent('ready');
    expect(screen.getByTestId('hiring-flow-requisition-adjacency')).toHaveTextContent('available');
  });

  it('keeps admin gating explicit through the route boundary', () => {
    render(
      <AccessProvider value={buildAccessContext({ isAdmin: false })}>
        <AccessBoundary capability="canManageHiringFlowSettings" fallback={<div data-testid="hiring-flow-denied">Denied</div>}>
          <HiringFlowSettingsPage />
        </AccessBoundary>
      </AccessProvider>,
    );

    expect(screen.getByTestId('hiring-flow-denied')).toHaveTextContent('Denied');
  });

  it('supports recoverable failure and retry without leaving the route', async () => {
    const user = userEvent.setup();

    render(
      <AccessProvider value={buildAccessContext()}>
        <HiringFlowSettingsPage />
      </AccessProvider>,
    );

    await user.click(screen.getByTestId('hiring-flow-simulate-failure'));
    await user.click(screen.getByTestId('hiring-flow-save-button'));

    expect(screen.getByTestId('hiring-flow-readiness')).toHaveTextContent('retryable-error');
    expect(screen.getByTestId('hiring-flow-mutation-state')).toHaveTextContent('submission-error');
    expect(screen.getByTestId('hiring-flow-retry-button')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hiring flow settings' })).toBeInTheDocument();

    await user.click(screen.getByTestId('hiring-flow-simulate-failure'));
    await user.click(screen.getByTestId('hiring-flow-retry-button'));

    expect(screen.getByTestId('hiring-flow-readiness')).toHaveTextContent('ready');
    expect(screen.getByTestId('hiring-flow-mutation-state')).toHaveTextContent('success');
  });
});
