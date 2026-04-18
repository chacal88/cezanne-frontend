import { routeIds } from '../../../../lib/routing';
import {
  operationalSettingsSubsectionIds,
  type OperationalSettingsCompatParams,
  type OperationalSettingsRouteDefinition,
  type OperationalSettingsRouteResolution,
  type OperationalSettingsSubsectionId,
} from './models';

const defaultSettingsId = 'default';
const defaultCompatibilitySection = 'settings';
const defaultCompatibilitySubsection: OperationalSettingsSubsectionId = 'hiring-flow';

export const operationalSettingsRouteDefinitions: Record<OperationalSettingsSubsectionId, OperationalSettingsRouteDefinition> = {
  'hiring-flow': {
    subsectionId: 'hiring-flow',
    routeId: routeIds.operationalSettingsHiringFlow,
    capability: 'canManageHiringFlowSettings',
    path: '/settings/hiring-flow',
    compatibilitySection: defaultCompatibilitySection,
    compatibilitySubsection: 'hiring-flow',
  },
  'custom-fields': {
    subsectionId: 'custom-fields',
    routeId: routeIds.operationalSettingsCustomFields,
    capability: 'canManageCustomFields',
    path: '/settings/custom-fields',
    compatibilitySection: defaultCompatibilitySection,
    compatibilitySubsection: 'custom-fields',
  },
  templates: {
    subsectionId: 'templates',
    routeId: routeIds.operationalSettingsTemplates,
    capability: 'canManageTemplates',
    path: '/templates',
    compatibilitySection: defaultCompatibilitySection,
    compatibilitySubsection: 'templates',
  },
  'reject-reasons': {
    subsectionId: 'reject-reasons',
    routeId: routeIds.operationalSettingsRejectReasons,
    capability: 'canManageRejectReasons',
    path: '/reject-reasons',
    compatibilitySection: defaultCompatibilitySection,
    compatibilitySubsection: 'reject-reasons',
  },
};

export const operationalSettingsRouteMetadata = Object.fromEntries(
  Object.values(operationalSettingsRouteDefinitions).map((definition) => [
    definition.path,
    {
      routeId: definition.routeId,
      domain: 'settings',
      module: definition.subsectionId,
      compatibilityPath: buildOperationalSettingsCompatPath({
        settingsId: defaultSettingsId,
        section: definition.compatibilitySection,
        subsection: definition.compatibilitySubsection,
      }),
    },
  ]),
);

export function validateOperationalSettingsCompatParams(params: Partial<Record<string, unknown>>): OperationalSettingsCompatParams {
  const settingsId = typeof params.settingsId === 'string' && params.settingsId.trim().length > 0 ? params.settingsId : defaultSettingsId;
  const section = typeof params.section === 'string' && params.section.trim().length > 0 ? params.section : defaultCompatibilitySection;
  const subsection =
    typeof params.subsection === 'string' && (operationalSettingsSubsectionIds as readonly string[]).includes(params.subsection)
      ? params.subsection
      : defaultCompatibilitySubsection;

  return {
    settingsId,
    section,
    subsection,
  };
}

export function buildOperationalSettingsCompatPath(params: Partial<OperationalSettingsCompatParams> = {}): string {
  const resolved = validateOperationalSettingsCompatParams(params);
  return `/parameters/${resolved.settingsId}/${resolved.section}/${resolved.subsection}`;
}

export function parseOperationalSettingsSubsectionFromPath(pathname: string): OperationalSettingsSubsectionId | null {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const direct = Object.values(operationalSettingsRouteDefinitions).find((definition) => definition.path === normalized);
  if (direct) return direct.subsectionId;

  const match = /^\/parameters(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?$/.exec(normalized);
  if (!match) return null;

  return validateOperationalSettingsCompatParams({
    settingsId: match[1],
    section: match[2],
    subsection: match[3],
  }).subsection as OperationalSettingsSubsectionId;
}

export function resolveOperationalSettingsRoute(
  pathname: string,
  availableSubsections: readonly OperationalSettingsSubsectionId[] = operationalSettingsSubsectionIds,
): OperationalSettingsRouteResolution | null {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const direct = Object.values(operationalSettingsRouteDefinitions).find((definition) => definition.path === normalized);

  if (direct) {
    if (availableSubsections.includes(direct.subsectionId)) {
      return {
        active: direct,
        params: {
          settingsId: defaultSettingsId,
          section: direct.compatibilitySection,
          subsection: direct.compatibilitySubsection,
        },
        reason: 'matched',
      };
    }

    const fallback = availableSubsections[0];
    if (!fallback) return null;
    const active = operationalSettingsRouteDefinitions[fallback];
    return {
      active,
      params: {
        settingsId: defaultSettingsId,
        section: active.compatibilitySection,
        subsection: active.compatibilitySubsection,
      },
      reason: 'fallback_unavailable',
    };
  }

  const compatMatch = /^\/parameters(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?$/.exec(normalized);
  if (!compatMatch) return null;

  const params = validateOperationalSettingsCompatParams({
    settingsId: compatMatch[1],
    section: compatMatch[2],
    subsection: compatMatch[3],
  });
  const requested = params.subsection as OperationalSettingsSubsectionId;
  const fallbackSubsection = availableSubsections.includes(requested) ? requested : availableSubsections[0];
  if (!fallbackSubsection) return null;

  const active = operationalSettingsRouteDefinitions[fallbackSubsection];
  return {
    active,
    params: {
      ...params,
      subsection: active.compatibilitySubsection,
      section: active.compatibilitySection,
    },
    reason: requested === fallbackSubsection ? 'matched' : 'fallback_unknown',
  };
}

export function buildOperationalSettingsDedicatedPath(subsectionId: OperationalSettingsSubsectionId): string {
  return operationalSettingsRouteDefinitions[subsectionId].path;
}
