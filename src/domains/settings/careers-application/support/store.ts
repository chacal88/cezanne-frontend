import type { ApplicationPageConfigView, CareersPageConfigView, JobListingEditorDraft, JobListingSummary } from './models';

const careersPageKey = 'settings-careers-page-config';
const applicationPageKeyPrefix = 'settings-application-page-config:';
const jobListingsKey = 'settings-job-listings';

const careersPageMemory = new Map<string, CareersPageConfigView>();
const applicationPageMemory = new Map<string, ApplicationPageConfigView>();
let jobListingsMemory: JobListingSummary[] | null = null;

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getCareersPageConfig(): CareersPageConfigView {
  return (
    careersPageMemory.get(careersPageKey) ??
    readStorage<CareersPageConfigView>(careersPageKey) ?? {
      companyName: 'Acme Recruiting',
      brand: 'acme',
      headline: 'Build your career with Acme',
      featuredJobsEnabled: true,
      featureEnabled: true,
    }
  );
}

export function saveCareersPageConfig(config: CareersPageConfigView) {
  careersPageMemory.set(careersPageKey, config);
  writeStorage(careersPageKey, config);
}

export function getApplicationPageConfig(settingsId: string): ApplicationPageConfigView {
  const key = `${applicationPageKeyPrefix}${settingsId}`;
  return (
    applicationPageMemory.get(key) ??
    readStorage<ApplicationPageConfigView>(key) ?? {
      settingsId,
      section: 'intro',
      subsection: 'header',
      introTitle: 'Tell us about yourself',
      collectPhone: true,
      consentRequired: true,
      featureEnabled: true,
    }
  );
}

export function saveApplicationPageConfig(config: ApplicationPageConfigView) {
  const key = `${applicationPageKeyPrefix}${config.settingsId}`;
  applicationPageMemory.set(key, config);
  writeStorage(key, config);
}

function defaultJobListings(): JobListingSummary[] {
  return [
    { uuid: 'listing-1', title: 'Senior Product Designer', brand: 'acme', status: 'draft', publishReady: true },
    { uuid: 'listing-2', title: 'Frontend Engineer', brand: 'acme', status: 'published', publishReady: true },
    { uuid: 'listing-3', title: 'Recruiting Coordinator', brand: 'globex', status: 'archived', publishReady: false },
  ];
}

export function getJobListings(): JobListingSummary[] {
  if (jobListingsMemory) return jobListingsMemory;
  jobListingsMemory = readStorage<JobListingSummary[]>(jobListingsKey) ?? defaultJobListings();
  return jobListingsMemory;
}

export function saveJobListings(items: JobListingSummary[]) {
  jobListingsMemory = items;
  writeStorage(jobListingsKey, items);
}

export function getJobListingDraft(uuid?: string): JobListingEditorDraft {
  const item = getJobListings().find((entry) => entry.uuid === uuid);
  if (!item) {
    return {
      uuid,
      title: '',
      brand: 'acme',
      description: '',
      status: 'draft',
      publishReady: false,
    };
  }

  return {
    uuid: item.uuid,
    title: item.title,
    brand: item.brand,
    description: `${item.title} public description`,
    status: item.status,
    publishReady: item.publishReady,
  };
}

