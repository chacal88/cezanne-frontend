import { matchRouteMetadata } from '../../../../lib/routing';
import {
  applicationSections,
  applicationSubsections,
  jobListingsTabs,
  type ApplicationPageRouteState,
  type ApplicationSection,
  type ApplicationSubsection,
  type JobListingEditorRouteState,
  type JobListingsRouteState,
  type JobListingsTab,
} from './models';

const defaultSettingsId = 'default';

export function validateApplicationPageParams(params: Record<string, unknown>): ApplicationPageRouteState {
  const settingsId = typeof params.settingsId === 'string' && params.settingsId.trim().length > 0 ? params.settingsId : defaultSettingsId;
  const section =
    typeof params.section === 'string' && (applicationSections as readonly string[]).includes(params.section)
      ? (params.section as ApplicationSection)
      : 'intro';
  const subsection =
    typeof params.subsection === 'string' && (applicationSubsections as readonly string[]).includes(params.subsection)
      ? (params.subsection as ApplicationSubsection)
      : section === 'consent'
        ? 'privacy'
        : section === 'questions'
          ? 'fields'
          : 'header';

  return { settingsId, section, subsection };
}

export function buildApplicationPagePath(state: Partial<ApplicationPageRouteState> = {}): string {
  const resolved = validateApplicationPageParams(state);
  return `/settings/application-page/${resolved.settingsId}/${resolved.section}/${resolved.subsection}`;
}

export function parseApplicationPagePathname(pathname: string): ApplicationPageRouteState {
  const match = matchRouteMetadata(pathname);
  if (!match || match.metadata.routeId !== 'settings.careers-application.application-page') {
    throw new Error(`Path is not a registered application-page settings route: ${pathname}`);
  }

  return validateApplicationPageParams(match.params);
}

export function validateJobListingsSearch(search: Record<string, unknown>): JobListingsRouteState {
  const tab = typeof search.tab === 'string' && (jobListingsTabs as readonly string[]).includes(search.tab) ? (search.tab as JobListingsTab) : 'draft';
  const brand = typeof search.brand === 'string' && search.brand.trim().length > 0 ? search.brand : undefined;
  return { tab, brand };
}

export function buildJobListingsPath(state: Partial<JobListingsRouteState> = {}): string {
  const resolved = validateJobListingsSearch(state);
  const params = new URLSearchParams();
  params.set('tab', resolved.tab);
  if (resolved.brand) params.set('brand', resolved.brand);
  return `/settings/job-listings?${params.toString()}`;
}

export function validateJobListingEditorSearch(search: Record<string, unknown>, uuid?: string): JobListingEditorRouteState {
  const brand = typeof search.brand === 'string' && search.brand.trim().length > 0 ? search.brand : undefined;
  const returnTab =
    typeof search.returnTab === 'string' && (jobListingsTabs as readonly string[]).includes(search.returnTab)
      ? (search.returnTab as JobListingsTab)
      : undefined;

  return {
    mode: search.new === true || search.new === 'true' || !uuid ? 'create' : 'edit',
    uuid,
    brand,
    returnTab,
  };
}

export function buildJobListingEditorPath(state: JobListingEditorRouteState): string {
  const pathname = state.mode === 'edit' && state.uuid ? `/settings/job-listings/edit/${state.uuid}` : '/settings/job-listings/edit';
  const params = new URLSearchParams();
  if (state.mode === 'create') params.set('new', 'true');
  if (state.brand) params.set('brand', state.brand);
  if (state.returnTab) params.set('returnTab', state.returnTab);
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function buildJobListingReturnTarget(state: JobListingEditorRouteState): string {
  return buildJobListingsPath({ tab: state.returnTab ?? 'draft', brand: state.brand });
}

export function parseJobListingsSearchFromUrl(searchValue: string): JobListingsRouteState {
  const params = new URLSearchParams(searchValue);
  return validateJobListingsSearch(Object.fromEntries(params.entries()));
}

