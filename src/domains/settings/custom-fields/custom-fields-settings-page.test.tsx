import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AccessBoundary, AccessProvider, type AccessContext } from '../../../lib/access-control';
import { CustomFieldsSettingsPage } from './custom-fields-settings-page';

function buildAccessContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    isAuthenticated: true,
    organizationType: 'hc',
    isAdmin: true,
    isSysAdmin: false,
    pivotEntitlements: ['jobRequisition', 'seeCandidates'],
    subscriptionCapabilities: ['calendarIntegration', 'formsDocs', 'surveys', 'customFields', 'candidateTags', 'reviewRequests', 'interviewFeedback', 'inbox'],
    rolloutFlags: ['customFieldsBeta'],
    ...overrides,
  };
}

describe('CustomFieldsSettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the dedicated custom-fields route with a ready state', () => {
    render(
      <AccessProvider value={buildAccessContext()}>
        <CustomFieldsSettingsPage />
      </AccessProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Custom fields settings' })).toBeInTheDocument();
    expect(screen.getByTestId('custom-fields-readiness')).toHaveTextContent('ready');
    expect(screen.getByTestId('custom-fields-downstream')).toHaveTextContent('candidate detail, public application');
  });

  it('keeps beta-gated access explicit through the route boundary', () => {
    render(
      <AccessProvider value={buildAccessContext({ rolloutFlags: [] })}>
        <AccessBoundary capability="canManageCustomFields" fallback={<div data-testid="custom-fields-denied">Denied</div>}>
          <CustomFieldsSettingsPage />
        </AccessBoundary>
      </AccessProvider>,
    );

    expect(screen.getByTestId('custom-fields-denied')).toHaveTextContent('Denied');
  });

  it('supports recoverable failure and retry without leaving the route', async () => {
    const user = userEvent.setup();

    render(
      <AccessProvider value={buildAccessContext()}>
        <CustomFieldsSettingsPage />
      </AccessProvider>,
    );

    await user.click(screen.getByTestId('custom-fields-simulate-failure'));
    await user.click(screen.getByTestId('custom-fields-save-button'));

    expect(screen.getByTestId('custom-fields-readiness')).toHaveTextContent('retryable-error');
    expect(screen.getByTestId('custom-fields-mutation-state')).toHaveTextContent('submission-error');
    expect(screen.getByTestId('custom-fields-retry-button')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Custom fields settings' })).toBeInTheDocument();

    await user.click(screen.getByTestId('custom-fields-simulate-failure'));
    await user.click(screen.getByTestId('custom-fields-retry-button'));

    expect(screen.getByTestId('custom-fields-readiness')).toHaveTextContent('ready');
    expect(screen.getByTestId('custom-fields-mutation-state')).toHaveTextContent('success');
  });
});
