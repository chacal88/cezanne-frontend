import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AccessBoundary, AccessProvider, type AccessContext } from '../../../lib/access-control';
import { FormsDocsSettingsPage } from './forms-docs-settings-page';

function buildAccessContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    isAuthenticated: true,
    organizationType: 'hc',
    isAdmin: true,
    isSysAdmin: false,
    pivotEntitlements: ['jobRequisition', 'seeCandidates'],
    subscriptionCapabilities: ['formsDocs'],
    rolloutFlags: [],
    ...overrides,
  };
}

describe('FormsDocsSettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders route-owned forms/docs controls with downstream impact and backend gaps', () => {
    render(
      <AccessProvider value={buildAccessContext()}>
        <FormsDocsSettingsPage />
      </AccessProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Forms and documents settings' })).toBeInTheDocument();
    expect(screen.getByTestId('forms-docs-owner')).toHaveTextContent('settings.forms-docs-controls');
    expect(screen.getByTestId('forms-docs-readiness')).toHaveTextContent('ready');
    expect(screen.getByTestId('forms-docs-source')).toHaveTextContent('fixture-adapter');
    expect(screen.getByTestId('forms-docs-impact-candidate-documents-contracts')).toHaveTextContent('refresh-now');
    expect(screen.getByTestId('forms-docs-unknown-fields')).toHaveTextContent('downstream refresh event delivery contract');
  });

  it('keeps capability gating separate from candidate document capabilities', () => {
    render(
      <AccessProvider value={buildAccessContext({ subscriptionCapabilities: [] })}>
        <AccessBoundary capability="canManageFormsDocsSettings" fallback={<div data-testid="forms-docs-denied">Denied</div>}>
          <FormsDocsSettingsPage />
        </AccessBoundary>
      </AccessProvider>,
    );

    expect(screen.getByTestId('forms-docs-denied')).toHaveTextContent('Denied');
  });

  it('supports degraded state, save retry, and same-route success', async () => {
    const user = userEvent.setup();

    render(
      <AccessProvider value={buildAccessContext()}>
        <FormsDocsSettingsPage />
      </AccessProvider>,
    );

    await user.click(screen.getByTestId('forms-docs-simulate-degraded'));
    expect(screen.getByTestId('forms-docs-readiness')).toHaveTextContent('degraded');

    await user.click(screen.getByTestId('forms-docs-simulate-failure'));
    await user.click(screen.getByTestId('forms-docs-save-button'));
    expect(screen.getByTestId('forms-docs-mutation-state')).toHaveTextContent('retry');
    expect(screen.getByTestId('forms-docs-retry-button')).toBeInTheDocument();

    await user.click(screen.getByTestId('forms-docs-simulate-failure'));
    await user.click(screen.getByTestId('forms-docs-retry-button'));
    expect(screen.getByTestId('forms-docs-mutation-state')).toHaveTextContent('success');
    expect(screen.getByTestId('forms-docs-parent-return')).toHaveAttribute('href', '/parameters/default/settings/forms-docs');
  });
});
