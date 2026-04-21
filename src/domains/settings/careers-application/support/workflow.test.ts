import { describe, expect, it } from 'vitest';
import { buildProviderReadinessSignals } from '../../../integrations/support';
import { resetCorrelationId, setActiveCorrelationId } from '../../../../lib/observability';
import { getJobListings, saveJobListings } from './store';
import { runApplicationPageSaveWorkflow, runCareersPageSaveWorkflow, runJobListingPublishWorkflow, runJobListingSaveWorkflow, runJobListingUnpublishWorkflow } from './workflow';
import { trackCareersApplicationRouteOpen, trackCareersApplicationRouteResolution, trackCareersApplicationWorkflow } from './telemetry';
import { buildJobListingEditorPath, buildJobListingReturnTarget } from './routing';
import { buildJobListingsListView } from './adapters';
import { buildIntegrationJobPath } from '../../../integrations/support/routing';
import { buildSharedJobPath } from '../../../public-external/support/routing';

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
    expect(careersResult.publicReflectionIntent).toMatchObject({ routeFamily: 'careers-page', brandSlug: 'acme', publicReflectionIntent: 'pending' });
    expect(applicationResult.publicContract.collectsPhone).toBe(true);
    expect(applicationResult.publicReflectionIntent).toMatchObject({ routeFamily: 'application-page', settingsId: 'company-1', publicReflectionIntent: 'pending' });
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
    expect(publishResult.publishingStatus).toMatchObject({ state: 'published', publicReflectionIntent: 'confirmed' });
    expect(publishResult.publicReflectionIntent).toMatchObject({ targetType: 'job-listing', targetReference: 'existing', publicReflectionIntent: 'confirmed', publishingState: 'published' });
    expect(publishResult.telemetry.data).toMatchObject({ routeFamily: 'job-listings', action: 'publish', publishingState: 'published', targetType: 'job-listing' });
  });

  it('blocks job listing publish through job-board readiness without provider setup UI', async () => {
    const saveResult = await runJobListingSaveWorkflow({
      title: 'Product Designer',
      brand: 'acme',
      description: 'Own product design.',
      status: 'draft',
      publishReady: true,
    });
    const [signal] = buildProviderReadinessSignals({ id: 'lever', name: 'Lever', family: 'job-board', state: 'degraded' });

    const publishResult = await runJobListingPublishWorkflow(saveResult.uuid, signal);

    expect(publishResult.status).toBe('blocked');
    if (publishResult.status !== 'blocked') return;
    expect(publishResult.readinessGate).toMatchObject({ state: 'degraded', canProceed: false });
    expect(publishResult.publishingStatus).toMatchObject({ state: 'degraded', canProceed: false });
    expect(publishResult.readinessGate.setupTarget?.path).toBe('/integrations/lever');
  });

  it('preserves job listings list/editor context around publishing status', async () => {
    saveJobListings([{ uuid: 'listing-context', title: 'Context role', brand: 'acme', status: 'draft', publishReady: false }]);

    const view = buildJobListingsListView({ tab: 'draft', brand: 'acme' });
    const failedPublish = await runJobListingPublishWorkflow('listing-context');

    expect(view).toMatchObject({ selectedTab: 'draft', brand: 'acme', publishingTarget: { routeFamily: 'job-listings' } });
    expect(view.items[0].publishingStatus).toMatchObject({ state: 'not-ready' });
    expect(buildJobListingEditorPath({ mode: 'edit', uuid: 'listing-context', brand: 'acme', returnTab: 'draft' })).toBe(
      '/settings/job-listings/edit/listing-context?brand=acme&returnTab=draft',
    );
    expect(buildJobListingReturnTarget({ mode: 'edit', uuid: 'listing-context', brand: 'acme', returnTab: 'draft' })).toBe('/settings/job-listings?tab=draft&brand=acme');
    expect(failedPublish).toMatchObject({ status: 'failed', publishingStatus: { state: 'publish-failed', canRetry: true } });
  });

  it('models unpublish success without changing list/editor routing contracts', async () => {
    saveJobListings([{ uuid: 'listing-published', title: 'Published role', brand: 'acme', status: 'published', publishReady: true }]);

    const result = await runJobListingUnpublishWorkflow('listing-published');

    expect(result).toMatchObject({ status: 'completed', publishingStatus: { state: 'unpublished' } });
    expect(getJobListings().find((item) => item.uuid === 'listing-published')?.status).toBe('draft');
    expect(buildJobListingReturnTarget({ mode: 'edit', uuid: 'listing-published', brand: 'acme', returnTab: 'published' })).toBe('/settings/job-listings?tab=published&brand=acme');
  });

  it('keeps provider setup and public token routes outside publishing helpers', async () => {
    saveJobListings([{ uuid: 'listing-separation', title: 'Separated role', brand: 'acme', status: 'draft', publishReady: true }]);
    const [signal] = buildProviderReadinessSignals({ id: 'lever', name: 'Lever', family: 'job-board', state: 'reauth_required' });

    const result = await runJobListingPublishWorkflow('listing-separation', signal);

    expect(result.status).toBe('blocked');
    if (result.status !== 'blocked') return;
    expect(result.publishingStatus.remediation).toMatchObject({ type: 'provider-setup', path: '/integrations/lever' });
    expect(result).not.toHaveProperty('providerSetupFields');
    expect(JSON.stringify(result.publicReflectionIntent)).not.toContain('token');
    expect(buildIntegrationJobPath({ token: 'public-token', action: 'preview' })).toBe('/integration/job/public-token/preview');
    expect(buildSharedJobPath({ jobOrRole: 'designer', token: 'shared-token', source: 'email' })).toBe('/shared/designer/shared-token/email');
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
