import { describe, expect, it } from 'vitest';
import { evaluateCapabilities, type AccessContext } from '../../../../lib/access-control';
import { buildJobBoardPublishingStatus } from '../../../jobs/support/publishing';
import { evaluateApplicationPageAccess, evaluateCareersPageAccess, evaluateJobListingsAccess } from './access';
import {
  buildApplicationPageCloseoutSnapshot,
  buildCareersPageCloseoutSnapshot,
  buildJobListingEditorCloseoutSnapshot,
  buildJobListingsCloseoutSnapshot,
  buildSafePublicReflectionIntent,
} from './closeout';

function buildAccessContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    isAuthenticated: true,
    organizationType: 'hc',
    isAdmin: true,
    isSysAdmin: false,
    pivotEntitlements: [],
    subscriptionCapabilities: [],
    rolloutFlags: [],
    ...overrides,
  };
}

describe('careers-application closeout helpers', () => {
  it('models careers and application save closeout states with fixture-backed adapters', () => {
    const capabilities = evaluateCapabilities(buildAccessContext());
    const careers = buildCareersPageCloseoutSnapshot(evaluateCareersPageAccess(capabilities, { brand: 'acme', featureEnabled: true }), {
      saveStatus: 'completed',
      publicReflectionIntent: 'pending',
    });
    const application = buildApplicationPageCloseoutSnapshot(
      evaluateApplicationPageAccess(capabilities, { settingsId: 'settings-1', featureEnabled: true }),
      { settingsId: 'settings-1', section: 'questions', subsection: 'fields' },
      { saveStatus: 'failed' },
    );

    expect(careers).toMatchObject({ routeFamily: 'careers-page', state: 'saved', adapterContract: 'fixture-backed', publicReflectionIntent: 'pending' });
    expect(application).toMatchObject({ routeFamily: 'application-page', state: 'save-error', canRetry: true, section: 'questions' });
  });

  it('models validation, degraded, partial, and retryable job listings states', () => {
    const capabilities = evaluateCapabilities(buildAccessContext());
    const missingBrandDecision = evaluateJobListingsAccess(capabilities, { brand: undefined, featureEnabled: true, publishReady: true });
    const readyDecision = evaluateJobListingsAccess(capabilities, { brand: 'acme', featureEnabled: true, publishReady: true });

    expect(buildJobListingsCloseoutSnapshot(missingBrandDecision, { tab: 'draft' }, buildJobBoardPublishingStatus({ state: 'ready' })).state).toBe('validation-error');
    expect(buildJobListingsCloseoutSnapshot(readyDecision, { tab: 'draft', brand: 'acme' }, buildJobBoardPublishingStatus({ state: 'degraded' })).state).toBe('degraded');
    expect(buildJobListingEditorCloseoutSnapshot(readyDecision, { mode: 'edit', uuid: 'listing-1', brand: 'acme' }, buildJobBoardPublishingStatus({ state: 'partially-published' })).state).toBe('partial');
    expect(buildJobListingEditorCloseoutSnapshot(readyDecision, { mode: 'edit', uuid: 'listing-1', brand: 'acme' }, buildJobBoardPublishingStatus({ state: 'publish-failed' }))).toMatchObject({ state: 'retryable', canRetry: true });
  });

  it('builds safe public reflection intent without leaking tokens or raw labels', () => {
    const intent = buildSafePublicReflectionIntent({
      routeId: 'settings.careers-application.job-listings-editor',
      routeFamily: 'job-listings-editor',
      targetType: 'job-listing',
      publicReflectionIntent: 'pending',
      brandSlug: 'Acme Jobs!',
      listingUuid: 'listing-1',
      publishingState: 'partially-published',
      correlationId: 'corr_safe',
    });

    expect(intent).toMatchObject({ brandSlug: 'acme-jobs', listingUuid: 'listing-1', targetReference: 'existing', correlationId: 'corr_safe' });
    expect(JSON.stringify(intent)).not.toContain('public-token');
  });
});
