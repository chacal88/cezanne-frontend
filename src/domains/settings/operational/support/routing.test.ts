import { describe, expect, it } from 'vitest';
import {
  buildOperationalSettingsCompatPath,
  buildOperationalSettingsDedicatedPath,
  parseOperationalSettingsSubsectionFromPath,
  resolveOperationalSettingsRoute,
  validateOperationalSettingsCompatParams,
} from './routing';

describe('operational settings routing helpers', () => {
  it('builds canonical compatibility and dedicated subsection paths', () => {
    expect(buildOperationalSettingsCompatPath({ settingsId: 'company-1', subsection: 'templates' })).toBe('/parameters/company-1/settings/templates');
    expect(buildOperationalSettingsDedicatedPath('reject-reasons')).toBe('/reject-reasons');
    expect(buildOperationalSettingsDedicatedPath('api-endpoints')).toBe('/settings/api-endpoints');
  });

  it('normalizes compatibility params with stable defaults', () => {
    expect(validateOperationalSettingsCompatParams({})).toEqual({
      settingsId: 'default',
      section: 'settings',
      subsection: 'hiring-flow',
    });
  });

  it('parses subsection identity from compatibility and dedicated paths', () => {
    expect(parseOperationalSettingsSubsectionFromPath('/parameters/company-1/settings/custom-fields')).toBe('custom-fields');
    expect(parseOperationalSettingsSubsectionFromPath('/templates')).toBe('templates');
    expect(parseOperationalSettingsSubsectionFromPath('/settings/api-endpoints')).toBe('api-endpoints');
  });

  it('falls back to the first visible subsection when compatibility entry is unknown', () => {
    const resolution = resolveOperationalSettingsRoute('/parameters/company-1/settings/unknown-subsection', ['templates', 'reject-reasons']);
    expect(resolution).toEqual({
      active: expect.objectContaining({
        subsectionId: 'templates',
        path: '/templates',
        routeId: 'settings.operational.templates',
      }),
      params: {
        settingsId: 'company-1',
        section: 'settings',
        subsection: 'templates',
      },
      reason: 'fallback_unknown',
    });
  });

  it('falls back when a dedicated route is unavailable to the current actor', () => {
    const resolution = resolveOperationalSettingsRoute('/settings/custom-fields', ['hiring-flow']);
    expect(resolution).toEqual({
      active: expect.objectContaining({
        subsectionId: 'hiring-flow',
        path: '/settings/hiring-flow',
        routeId: 'settings.operational.hiring-flow',
      }),
      params: {
        settingsId: 'default',
        section: 'settings',
        subsection: 'hiring-flow',
      },
      reason: 'fallback_unavailable',
    });
  });
});


  it('includes API endpoints in the closed R5 compatibility inventory', () => {
    const resolution = resolveOperationalSettingsRoute('/parameters/company-1/settings/api-endpoints', ['api-endpoints']);
    expect(resolution).toEqual({
      active: expect.objectContaining({
        subsectionId: 'api-endpoints',
        path: '/settings/api-endpoints',
        routeId: 'settings.api-endpoints',
        capability: 'canManageApiEndpoints',
      }),
      params: {
        settingsId: 'company-1',
        section: 'settings',
        subsection: 'api-endpoints',
      },
      reason: 'matched',
    });
  });


  it('distinguishes unauthorized and unimplemented compatibility fallback outcomes', () => {
    expect(resolveOperationalSettingsRoute('/parameters/company-1/settings/api-endpoints', ['templates'])?.reason).toBe('fallback_unauthorized');
    expect(
      resolveOperationalSettingsRoute('/parameters/company-1/settings/api-endpoints', ['templates'], { unimplementedSubsections: ['api-endpoints'] })?.reason,
    ).toBe('fallback_unimplemented');
  });
