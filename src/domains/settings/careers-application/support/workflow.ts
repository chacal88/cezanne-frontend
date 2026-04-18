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
    requestHeaders,
  };
}

export async function runJobListingPublishWorkflow(uuid: string) {
  const request = withCorrelationHeaders({ method: 'POST' });
  const requestHeaders = headersToRecord(new Headers(request.headers));
  const items = getJobListings();
  const listing = items.find((item) => item.uuid === uuid);

  if (!listing || !listing.publishReady) {
    return {
      status: 'failed' as const,
      message: 'Listing is not ready to publish.',
      requestHeaders,
    };
  }

  const next = items.map((item) => (item.uuid === uuid ? { ...item, status: 'published' as const } : item));
  saveJobListings(next);

  return {
    status: 'completed' as const,
    publicContract: toPublicJobListingContract({ ...listing, uuid, status: 'published', description: '', publishReady: true }),
    requestHeaders,
  };
}

