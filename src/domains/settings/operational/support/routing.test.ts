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
