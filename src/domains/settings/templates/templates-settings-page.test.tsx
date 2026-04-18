import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AccessProvider, type AccessContext } from '../../../lib/access-control';
import { TemplatesSettingsPage } from './templates-settings-page';

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

describe('TemplatesSettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders direct entry for the templates family root', () => {
    render(
      <AccessProvider value={buildAccessContext()}>
        <TemplatesSettingsPage routeState={{ kind: 'index' }} />
      </AccessProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Templates settings' })).toBeInTheDocument();
    expect(screen.getByTestId('templates-active-view')).toHaveTextContent('index');
    expect(screen.getByTestId('templates-fallback-reason')).toHaveTextContent('matched');
  });

  it('falls back inside the family when a subtype-specific gate is unavailable', () => {
    render(
      <AccessProvider value={buildAccessContext({ isAdmin: false })}>
        <TemplatesSettingsPage routeState={{ kind: 'smart-questions' }} />
      </AccessProvider>,
    );

    expect(screen.getByTestId('templates-requested-view')).toHaveTextContent('smart-questions');
    expect(screen.getByTestId('templates-active-view')).toHaveTextContent('index');
    expect(screen.getByTestId('templates-fallback-reason')).toHaveTextContent('fallback_unavailable');
    expect(screen.getByTestId('templates-family-note')).toBeInTheDocument();
  });

  it('respects diversity and interview-scoring subtype gates', () => {
    const { rerender } = render(
      <AccessProvider value={buildAccessContext()}>
        <TemplatesSettingsPage routeState={{ kind: 'diversity-questions' }} />
      </AccessProvider>,
    );

    expect(screen.getByTestId('templates-active-view')).toHaveTextContent('index');

    rerender(
      <AccessProvider value={buildAccessContext({ rolloutFlags: ['surveysBeta'], subscriptionCapabilities: ['customSurveys', 'interviewFeedback'] })}>
        <TemplatesSettingsPage routeState={{ kind: 'diversity-questions' }} />
      </AccessProvider>,
    );

    expect(screen.getByTestId('templates-active-view')).toHaveTextContent('diversity-questions');

    rerender(
      <AccessProvider value={buildAccessContext({ subscriptionCapabilities: ['interviewFeedback'] })}>
        <TemplatesSettingsPage routeState={{ kind: 'interview-scoring' }} />
      </AccessProvider>,
    );

    expect(screen.getByTestId('templates-active-view')).toHaveTextContent('interview-scoring');
  });

  it('supports recoverable save and retry inside the family contract', async () => {
    const user = userEvent.setup();

    render(
      <AccessProvider value={buildAccessContext()}>
        <TemplatesSettingsPage routeState={{ kind: 'index' }} />
      </AccessProvider>,
    );

    await user.click(screen.getByTestId('templates-simulate-failure'));
    await user.click(screen.getByTestId('templates-save-button'));

    expect(screen.getByTestId('templates-readiness')).toHaveTextContent('retryable-error');
    expect(screen.getByTestId('templates-mutation-state')).toHaveTextContent('submission-error');
    expect(screen.getByTestId('templates-retry-button')).toBeInTheDocument();

    await user.click(screen.getByTestId('templates-simulate-failure'));
    await user.click(screen.getByTestId('templates-retry-button'));

    expect(screen.getByTestId('templates-readiness')).toHaveTextContent('ready');
    expect(screen.getByTestId('templates-mutation-state')).toHaveTextContent('success');
  });
});
