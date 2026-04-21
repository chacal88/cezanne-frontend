import type {
  ApplicationPageConfigView,
  ApplicationPageSerializedPayload,
  CareersPageConfigView,
  CareersPageSerializedPayload,
  JobListingEditorDraft,
  JobListingSerializedPayload,
  JobListingsListView,
  JobListingsRouteState,
  PublicApplicationPageContract,
  PublicCareersPageContract,
  PublicJobListingContract,
} from './models';
import { getJobListings } from './store';
import { buildJobBoardPublishingStatus, normalizeJobBoardPublishTarget } from '../../../jobs/support/publishing';

export function serializeCareersPageConfig(config: CareersPageConfigView): CareersPageSerializedPayload {
  return {
    company_name: config.companyName,
    branding: {
      slug: config.brand,
      headline: config.headline,
      featured_jobs_enabled: config.featuredJobsEnabled,
    },
  };
}

export function toPublicCareersPageContract(config: CareersPageConfigView): PublicCareersPageContract {
  return {
    brandSlug: config.brand,
    headline: config.headline,
    featuredJobsEnabled: config.featuredJobsEnabled,
  };
}

export function normalizeApplicationPageConfig(config: ApplicationPageConfigView, route: Pick<ApplicationPageConfigView, 'section' | 'subsection'>): ApplicationPageConfigView {
  return {
    ...config,
    section: route.section,
    subsection: route.subsection,
  };
}

export function serializeApplicationPageConfig(config: ApplicationPageConfigView): ApplicationPageSerializedPayload {
  return {
    settings_id: config.settingsId,
    content: {
      intro_title: config.introTitle,
      collect_phone: config.collectPhone,
      consent_required: config.consentRequired,
    },
    route_context: {
      section: config.section,
      subsection: config.subsection,
    },
  };
}

export function toPublicApplicationPageContract(config: ApplicationPageConfigView): PublicApplicationPageContract {
  return {
    introTitle: config.introTitle,
    collectsPhone: config.collectPhone,
    consentRequired: config.consentRequired,
  };
}

export function buildJobListingsListView(route: JobListingsRouteState): JobListingsListView {
  const items = getJobListings().filter((item) => item.status === route.tab && (!route.brand || item.brand === route.brand));
  return {
    selectedTab: route.tab,
    brand: route.brand,
    publishingTarget: normalizeJobBoardPublishTarget({ routeFamily: 'job-listings', targetType: 'job-listing', hasExistingTarget: true }),
    publishingStatus: buildJobBoardPublishingStatus({ state: items.some((item) => item.status === 'published') ? 'published' : 'ready' }),
    items: items.map((item) => ({
      ...item,
      publishingStatus: buildJobBoardPublishingStatus({
        state: item.status === 'published' ? 'published' : item.publishReady ? 'ready' : 'not-ready',
      }),
    })),
  };
}

export function serializeJobListingDraft(draft: JobListingEditorDraft): JobListingSerializedPayload {
  return {
    listing_uuid: draft.uuid,
    brand: draft.brand,
    title: draft.title,
    description: draft.description,
    status: draft.status,
    publish_ready: draft.publishReady,
  };
}

export function toPublicJobListingContract(draft: Required<Pick<JobListingEditorDraft, 'uuid'>> & JobListingEditorDraft): PublicJobListingContract {
  return {
    uuid: draft.uuid,
    brandSlug: draft.brand,
    title: draft.title,
    isPublished: draft.status === 'published',
  };
}

