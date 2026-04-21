import { describe, expect, it } from 'vitest';
import { matchRouteMetadata } from '../../../../lib/routing';
import {
  buildApplicationPagePath,
  buildJobListingEditorPath,
  buildJobListingsPath,
  parseApplicationPagePathname,
  parseJobListingsSearchFromUrl,
  validateApplicationPageParams,
} from './routing';

describe('careers-application routing helpers', () => {
  it('builds canonical settings paths', () => {
    expect(buildApplicationPagePath({ settingsId: 'company-1', section: 'questions', subsection: 'fields' })).toBe(
      '/settings/application-page/company-1/questions/fields',
    );
    expect(buildJobListingsPath({ tab: 'published', brand: 'acme' })).toBe('/settings/job-listings?tab=published&brand=acme');
    expect(buildJobListingEditorPath({ mode: 'create', brand: 'acme', returnTab: 'draft' })).toBe('/settings/job-listings/edit?new=true&brand=acme&returnTab=draft');
  });

  it('restores route state from path/search values', () => {
    expect(parseApplicationPagePathname('/settings/application-page/company-1/consent/privacy')).toEqual({
      settingsId: 'company-1',
      section: 'consent',
      subsection: 'privacy',
    });
    expect(parseJobListingsSearchFromUrl('?tab=published&brand=acme')).toEqual({ tab: 'published', brand: 'acme' });
  });

  it('registers settings route metadata', () => {
    expect(matchRouteMetadata('/settings/careers-page')?.metadata).toMatchObject({
      routeId: 'settings.careers-application.careers-page',
      requiredCapability: 'canManageCareersPage',
      fallbackTarget: '/access-denied',
      implementationState: 'implemented',
    });
    expect(matchRouteMetadata('/settings/application-page/company-1/questions/fields')?.metadata).toMatchObject({
      routeId: 'settings.careers-application.application-page',
      requiredCapability: 'canManageApplicationPage',
      routeFamily: 'careers-application-settings',
      implementationState: 'implemented',
    });
    expect(matchRouteMetadata('/settings/job-listings/edit/listing-1')?.metadata).toMatchObject({
      routeId: 'settings.careers-application.job-listings-editor',
      parentTarget: '/settings/job-listings',
      requiredCapability: 'canManageJobListings',
      implementationState: 'implemented',
    });
  });

  it('normalizes missing application params to canonical defaults', () => {
    expect(validateApplicationPageParams({})).toEqual({
      settingsId: 'default',
      section: 'intro',
      subsection: 'header',
    });
  });
});

