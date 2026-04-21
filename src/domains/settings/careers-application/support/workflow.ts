import { buildOperationalGateInput, evaluateOperationalReadinessGate } from '../../../integrations/support';
import type { IntegrationProviderReadinessSignal } from '../../../integrations/support';
import { withCorrelationHeaders } from '../../../../lib/api-client';
import {
  saveApplicationPageConfig,
  saveCareersPageConfig,
  getJobListings,
  saveJobListings,
} from './store';
import {
  serializeApplicationPageConfig,
  serializeCareersPageConfig,
  serializeJobListingDraft,
  toPublicApplicationPageContract,
  toPublicCareersPageContract,
  toPublicJobListingContract,
} from './adapters';
import type { ApplicationPageConfigView, CareersPageConfigView, JobListingEditorDraft } from './models';
import { buildJobBoardPublishingResult, buildJobBoardPublishingStatus, buildJobBoardPublishingTelemetry, normalizeJobBoardPublishTarget } from '../../../jobs/support/publishing';
import { buildSafePublicReflectionIntent } from './closeout';

function headersToRecord(headers: Headers) {
  return Object.fromEntries(headers.entries());
}

function nextListingUuid() {
  return `listing-${getJobListings().length + 1}`;
}

export async function runCareersPageSaveWorkflow(config: CareersPageConfigView) {
  const request = withCorrelationHeaders({ method: 'PUT' });
  const requestHeaders = headersToRecord(new Headers(request.headers));
  const payload = serializeCareersPageConfig(config);
  const publicContract = toPublicCareersPageContract(config);
  saveCareersPageConfig(config);

  return {
    status: 'completed' as const,
    payload,
    publicContract,
    publicReflectionIntent: buildSafePublicReflectionIntent({
      routeId: 'settings.careers-application.careers-page',
      routeFamily: 'careers-page',
      targetType: 'careers-page',
      targetReference: 'settings',
      publicReflectionIntent: 'pending',
      brandSlug: config.brand,
    }),
    requestHeaders,
  };
}

export async function runApplicationPageSaveWorkflow(config: ApplicationPageConfigView) {
  const request = withCorrelationHeaders({ method: 'PUT' });
  const requestHeaders = headersToRecord(new Headers(request.headers));
  const payload = serializeApplicationPageConfig(config);
  const publicContract = toPublicApplicationPageContract(config);
  saveApplicationPageConfig(config);

  return {
    status: 'completed' as const,
    payload,
    publicContract,
    publicReflectionIntent: buildSafePublicReflectionIntent({
      routeId: 'settings.careers-application.application-page',
      routeFamily: 'application-page',
      targetType: 'application-page',
      targetReference: 'settings',
      publicReflectionIntent: 'pending',
      settingsId: config.settingsId,
      section: config.section,
      subsection: config.subsection,
    }),
    requestHeaders,
  };
}

export async function runJobListingSaveWorkflow(draft: JobListingEditorDraft) {
  const request = withCorrelationHeaders({ method: draft.uuid ? 'PUT' : 'POST' });
  const requestHeaders = headersToRecord(new Headers(request.headers));
  const payload = serializeJobListingDraft(draft);
  const uuid = draft.uuid ?? nextListingUuid();
  const items = getJobListings();
  const next = items.some((item) => item.uuid === uuid)
    ? items.map((item) => (item.uuid === uuid ? { uuid, title: draft.title, brand: draft.brand, status: draft.status, publishReady: draft.publishReady } : item))
    : [...items, { uuid, title: draft.title, brand: draft.brand, status: draft.status, publishReady: draft.publishReady }];
  saveJobListings(next);

  return {
    status: 'completed' as const,
    uuid,
    payload,
    publicContract: toPublicJobListingContract({ ...draft, uuid }),
    publicReflectionIntent: buildSafePublicReflectionIntent({
      routeId: 'settings.careers-application.job-listings-editor',
      routeFamily: 'job-listings-editor',
      targetType: 'job-listing',
      publicReflectionIntent: 'pending',
      brandSlug: draft.brand,
      listingUuid: uuid,
    }),
    requestHeaders,
  };
}

export async function runJobListingPublishWorkflow(uuid: string, readinessSignal?: IntegrationProviderReadinessSignal) {
  const request = withCorrelationHeaders({ method: 'POST' });
  const requestHeaders = headersToRecord(new Headers(request.headers));
  const items = getJobListings();
  const listing = items.find((item) => item.uuid === uuid);
  const readinessGate = readinessSignal ? evaluateOperationalReadinessGate(buildOperationalGateInput(readinessSignal, 'job-listing-publishing')) : undefined;
  const target = normalizeJobBoardPublishTarget({ routeFamily: 'job-listings', targetType: 'job-listing', hasExistingTarget: Boolean(listing) });

  if (readinessGate && !readinessGate.canProceed) {
    const publishingStatus = buildJobBoardPublishingStatus({ readinessGate });
    return {
      status: 'blocked' as const,
      message: readinessGate.message,
      readinessGate,
      publishingStatus,
      publishingTarget: target,
      publicReflectionIntent: buildSafePublicReflectionIntent({
        routeId: 'settings.careers-application.job-listings-editor',
        routeFamily: 'job-listings-editor',
        targetType: 'job-listing',
        target,
        publicReflectionIntent: publishingStatus.publicReflectionIntent,
        listingUuid: uuid,
        publishingState: publishingStatus.state,
      }),
      telemetry: buildJobBoardPublishingTelemetry({ routeFamily: 'job-listings', action: 'publish', publishingState: publishingStatus.state, readinessGate, targetType: 'job-listing' }),
      requestHeaders,
    };
  }

  if (!listing || !listing.publishReady) {
    const result = buildJobBoardPublishingResult({ action: 'publish', kind: 'retryable-failure', message: 'Listing is not ready to publish.' });
    return {
      status: 'failed' as const,
      message: result.status.message,
      publishingStatus: result.status,
      publishingTarget: target,
      publicReflectionIntent: buildSafePublicReflectionIntent({
        routeId: 'settings.careers-application.job-listings-editor',
        routeFamily: 'job-listings-editor',
        targetType: 'job-listing',
        target,
        publicReflectionIntent: result.status.publicReflectionIntent,
        listingUuid: uuid,
        publishingState: result.status.state,
      }),
      telemetry: buildJobBoardPublishingTelemetry({ routeFamily: 'job-listings', action: 'publish', publishingState: result.status.state, targetType: 'job-listing' }),
      requestHeaders,
    };
  }

  const next = items.map((item) => (item.uuid === uuid ? { ...item, status: 'published' as const } : item));
  saveJobListings(next);

  const result = buildJobBoardPublishingResult({ action: 'publish', kind: 'success', readinessGate, publicReflectionIntent: 'confirmed' });

  return {
    status: 'completed' as const,
    publicContract: toPublicJobListingContract({ ...listing, uuid, status: 'published', description: '', publishReady: true }),
    publicReflectionIntent: buildSafePublicReflectionIntent({
      routeId: 'settings.careers-application.job-listings-editor',
      routeFamily: 'job-listings-editor',
      targetType: 'job-listing',
      target,
      publicReflectionIntent: result.status.publicReflectionIntent,
      brandSlug: listing.brand,
      listingUuid: uuid,
      publishingState: result.status.state,
    }),
    readinessGate,
    publishingStatus: result.status,
    publishingTarget: target,
    telemetry: buildJobBoardPublishingTelemetry({ routeFamily: 'job-listings', action: 'publish', publishingState: result.status.state, readinessGate, targetType: 'job-listing' }),
    requestHeaders,
  };
}



export async function runJobListingUnpublishWorkflow(uuid: string, readinessSignal?: IntegrationProviderReadinessSignal) {
  const request = withCorrelationHeaders({ method: 'POST' });
  const requestHeaders = headersToRecord(new Headers(request.headers));
  const items = getJobListings();
  const listing = items.find((item) => item.uuid === uuid);
  const readinessGate = readinessSignal ? evaluateOperationalReadinessGate(buildOperationalGateInput(readinessSignal, 'job-listing-publishing')) : undefined;
  const target = normalizeJobBoardPublishTarget({ routeFamily: 'job-listings', targetType: 'job-listing', hasExistingTarget: Boolean(listing) });

  if (readinessGate && !readinessGate.canProceed) {
    const publishingStatus = buildJobBoardPublishingStatus({ readinessGate });
    return {
      status: 'blocked' as const,
      message: readinessGate.message,
      readinessGate,
      publishingStatus,
      publishingTarget: target,
      publicReflectionIntent: buildSafePublicReflectionIntent({
        routeId: 'settings.careers-application.job-listings-editor',
        routeFamily: 'job-listings-editor',
        targetType: 'job-listing',
        target,
        publicReflectionIntent: publishingStatus.publicReflectionIntent,
        listingUuid: uuid,
        publishingState: publishingStatus.state,
      }),
      requestHeaders,
    };
  }

  if (!listing || listing.status !== 'published') {
    const result = buildJobBoardPublishingResult({ action: 'unpublish', kind: 'retryable-failure', message: 'Listing is not published.' });
    return {
      status: 'failed' as const,
      message: result.status.message,
      publishingStatus: result.status,
      publishingTarget: target,
      publicReflectionIntent: buildSafePublicReflectionIntent({
        routeId: 'settings.careers-application.job-listings-editor',
        routeFamily: 'job-listings-editor',
        targetType: 'job-listing',
        target,
        publicReflectionIntent: result.status.publicReflectionIntent,
        listingUuid: uuid,
        publishingState: result.status.state,
      }),
      requestHeaders,
    };
  }

  const next = items.map((item) => (item.uuid === uuid ? { ...item, status: 'draft' as const } : item));
  saveJobListings(next);
  const result = buildJobBoardPublishingResult({ action: 'unpublish', kind: 'success', readinessGate, publicReflectionIntent: 'confirmed' });

  return {
    status: 'completed' as const,
    readinessGate,
    publishingStatus: result.status,
    publishingTarget: target,
    publicReflectionIntent: buildSafePublicReflectionIntent({
      routeId: 'settings.careers-application.job-listings-editor',
      routeFamily: 'job-listings-editor',
      targetType: 'job-listing',
      target,
      publicReflectionIntent: result.status.publicReflectionIntent,
      brandSlug: listing.brand,
      listingUuid: uuid,
      publishingState: result.status.state,
    }),
    requestHeaders,
  };
}
