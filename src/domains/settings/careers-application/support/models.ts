export const applicationSections = ['intro', 'questions', 'consent'] as const;
export const applicationSubsections = ['header', 'fields', 'privacy'] as const;
export const jobListingsTabs = ['draft', 'published', 'archived'] as const;

export type ApplicationSection = (typeof applicationSections)[number];
export type ApplicationSubsection = (typeof applicationSubsections)[number];
export type JobListingsTab = (typeof jobListingsTabs)[number];

export type ApplicationPageRouteState = {
  settingsId: string;
  section: ApplicationSection;
  subsection: ApplicationSubsection;
};

export type JobListingsRouteState = {
  tab: JobListingsTab;
  brand?: string;
};

export type JobListingEditorRouteState = {
  mode: 'create' | 'edit';
  uuid?: string;
  brand?: string;
  returnTab?: JobListingsTab;
};

export type CareersApplicationReadiness =
  | 'ready'
  | 'missing-brand'
  | 'feature-disabled'
  | 'missing-settings'
  | 'publish-blocked'
  | 'listing-missing';

export type CareersApplicationDecision = {
  family: 'careers-page' | 'application-page' | 'job-listings';
  capabilityKey: 'canManageCareersPage' | 'canManageApplicationPage' | 'canManageJobListings';
  readiness: CareersApplicationReadiness;
  canProceed: boolean;
  reason?: string;
};

export type CareersPageConfigView = {
  companyName: string;
  brand: string;
  headline: string;
  featuredJobsEnabled: boolean;
  featureEnabled: boolean;
};

export type ApplicationPageConfigView = {
  settingsId: string;
  section: ApplicationSection;
  subsection: ApplicationSubsection;
  introTitle: string;
  collectPhone: boolean;
  consentRequired: boolean;
  featureEnabled: boolean;
};

export type JobListingSummary = {
  uuid: string;
  title: string;
  brand: string;
  status: JobListingsTab;
  publishReady: boolean;
};

export type JobListingsListView = {
  selectedTab: JobListingsTab;
  brand?: string;
  items: JobListingSummary[];
};

export type JobListingEditorDraft = {
  uuid?: string;
  title: string;
  brand: string;
  description: string;
  status: JobListingsTab;
  publishReady: boolean;
};

export type CareersPageSerializedPayload = {
  company_name: string;
  branding: {
    slug: string;
    headline: string;
    featured_jobs_enabled: boolean;
  };
};

export type ApplicationPageSerializedPayload = {
  settings_id: string;
  content: {
    intro_title: string;
    collect_phone: boolean;
    consent_required: boolean;
  };
  route_context: {
    section: ApplicationSection;
    subsection: ApplicationSubsection;
  };
};

export type JobListingSerializedPayload = {
  listing_uuid?: string;
  brand: string;
  title: string;
  description: string;
  status: JobListingsTab;
  publish_ready: boolean;
};

export type PublicCareersPageContract = {
  brandSlug: string;
  headline: string;
  featuredJobsEnabled: boolean;
};

export type PublicApplicationPageContract = {
  introTitle: string;
  collectsPhone: boolean;
  consentRequired: boolean;
};

export type PublicJobListingContract = {
  uuid: string;
  brandSlug: string;
  title: string;
  isPublished: boolean;
};

