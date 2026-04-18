import { describe, expect, it } from 'vitest';
import { resetCorrelationId, setActiveCorrelationId } from '../../../../lib/observability';
import { getJobListings } from './store';
import { runApplicationPageSaveWorkflow, runCareersPageSaveWorkflow, runJobListingPublishWorkflow, runJobListingSaveWorkflow } from './workflow';
import { trackCareersApplicationRouteOpen, trackCareersApplicationRouteResolution, trackCareersApplicationWorkflow } from './telemetry';

describe('careers-application workflow', () => {
  it('serializes save workflows through the hardened request boundary', async () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_test_careers_settings');

    const careersResult = await runCareersPageSaveWorkflow({
      companyName: 'Acme Recruiting',
      brand: 'acme',
      headline: 'Build your career with Acme',
      featuredJobsEnabled: true,
      featureEnabled: true,
    });
    const applicationResult = await runApplicationPageSaveWorkflow({
      settingsId: 'company-1',
      section: 'questions',
      subsection: 'fields',
      introTitle: 'Tell us about your experience',
      collectPhone: true,
      consentRequired: true,
      featureEnabled: true,
    });

    expect(careersResult.requestHeaders['x-correlation-id']).toBe('corr_test_careers_settings');
    expect(applicationResult.requestHeaders['x-correlation-id']).toBe('corr_test_careers_settings');
    expect(careersResult.publicContract.brandSlug).toBe('acme');
    expect(applicationResult.publicContract.collectsPhone).toBe(true);
  });

  it('keeps job listing save and publish workflows explicit', async () => {
    const saveResult = await runJobListingSaveWorkflow({
      title: 'Platform Engineer',
      brand: 'acme',
      description: 'Own platform tooling.',
      status: 'draft',
      publishReady: true,
    });

    expect(saveResult.status).toBe('completed');
    expect(getJobListings().some((item) => item.uuid === saveResult.uuid)).toBe(true);

    const publishResult = await runJobListingPublishWorkflow(saveResult.uuid);
    expect(publishResult.status).toBe('completed');
    if (publishResult.status !== 'completed') return;
    expect(publishResult.publicContract.isPublished).toBe(true);
  });
});

describe('careers-application telemetry helpers', () => {
  it('emits correlation-aware telemetry events for route and workflow lifecycles', () => {
    const events: Array<{ name: string; data?: Record<string, unknown> }> = [];
    const observability = {
      telemetry: {
        identify: () => undefined,
        setContext: () => undefined,
        track: (event: { name: string; data?: Record<string, unknown> }) => events.push(event),
        reset: () => undefined,
      },
      errors: { captureError: () => undefined },
      rum: { page: () => undefined, startSpan: () => ({ end: () => undefined }) },
    };

    resetCorrelationId();
    setActiveCorrelationId('corr_test_telemetry');
    trackCareersApplicationRouteOpen('settings.careers-application.job-listings', observability);
    trackCareersApplicationRouteResolution('settings.careers-application.application-page', { section: 'questions', subsection: 'fields' }, observability);
    trackCareersApplicationWorkflow('public_contract_updated', { routeId: 'settings.careers-application.careers-page' }, observability);

    expect(events.map((event) => event.name)).toEqual([
      'careers_application_route_open',
      'careers_application_route_resolution',
      'careers_application_public_contract_updated',
    ]);
    expect(events.every((event) => event.data?.correlationId === 'corr_test_telemetry')).toBe(true);
  });
});
