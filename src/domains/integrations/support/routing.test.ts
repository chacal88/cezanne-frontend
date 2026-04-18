import { describe, expect, it } from 'vitest';
import { matchRouteMetadata } from '../../../lib/routing';
import { buildIntegrationCvPath, buildIntegrationFormsPath, buildIntegrationJobPath } from './routing';

describe('integration token routing', () => {
  it('builds canonical integration callback paths', () => {
    expect(buildIntegrationCvPath({ token: 'valid-token' })).toBe('/integration/cv/valid-token');
    expect(buildIntegrationCvPath({ token: 'offer-token', action: 'offer' })).toBe('/integration/cv/offer-token/offer');
    expect(buildIntegrationFormsPath({ token: 'valid-token' })).toBe('/integration/forms/valid-token');
    expect(buildIntegrationJobPath({ token: 'valid-token' })).toBe('/integration/job/valid-token');
    expect(buildIntegrationJobPath({ token: 'valid-token', action: 'preview' })).toBe('/integration/job/valid-token/preview');
  });

  it('registers integration route metadata', () => {
    expect(matchRouteMetadata('/integration/cv/valid-token')?.metadata.routeId).toBe('integrations.token-entry.cv');
    expect(matchRouteMetadata('/integration/cv/valid-token/offer')?.metadata.routeId).toBe('integrations.token-entry.cv');
    expect(matchRouteMetadata('/integration/forms/valid-token')?.metadata.routeId).toBe('integrations.token-entry.forms');
    expect(matchRouteMetadata('/integration/job/valid-token')?.metadata.routeId).toBe('integrations.token-entry.job');
    expect(matchRouteMetadata('/integration/job/valid-token/preview')?.metadata.routeId).toBe('integrations.token-entry.job');
  });
});
