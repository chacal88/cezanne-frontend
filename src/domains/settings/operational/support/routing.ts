import type { Capabilities } from '../../../../lib/access-control';
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
  'api-endpoints': {
    subsectionId: 'api-endpoints',
    routeId: routeIds.settingsApiEndpoints,
    capability: 'canManageApiEndpoints',
    path: '/settings/api-endpoints',
    compatibilitySection: defaultCompatibilitySection,
    compatibilitySubsection: 'api-endpoints',
  },
  'forms-docs': {
    subsectionId: 'forms-docs',
    routeId: routeIds.settingsFormsDocsControls,
    capability: 'canManageFormsDocsSettings',
    path: '/settings/forms-docs',
    compatibilitySection: defaultCompatibilitySection,
    compatibilitySubsection: 'forms-docs',
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
  options: { unimplementedSubsections?: readonly string[] } = {},
): OperationalSettingsRouteResolution | null {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const direct = Object.values(operationalSettingsRouteDefinitions).find((definition) => definition.path === normalized);
  const unimplemented = options.unimplementedSubsections ?? [];

  if (direct) {
    if (unimplemented.includes(direct.subsectionId)) return fallbackResolution('fallback_unimplemented', availableSubsections);
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

    return fallbackResolution('fallback_unavailable', availableSubsections);
  }

  const compatMatch = /^\/parameters(?:\/([^/]+))?(?:\/([^/]+))?(?:\/([^/]+))?$/.exec(normalized);
  if (!compatMatch) return null;

  const settingsId = compatMatch[1] && compatMatch[1].trim() ? compatMatch[1] : defaultSettingsId;
  const section = compatMatch[2] && compatMatch[2].trim() ? compatMatch[2] : defaultCompatibilitySection;
  const requestedRaw = compatMatch[3] && compatMatch[3].trim() ? compatMatch[3] : defaultCompatibilitySubsection;
  const requestedIsKnown = (operationalSettingsSubsectionIds as readonly string[]).includes(requestedRaw);
  const requested = requestedIsKnown ? (requestedRaw as OperationalSettingsSubsectionId) : null;

  if (!requested || unimplemented.includes(requested)) {
    const fallback = fallbackResolution(requested ? 'fallback_unimplemented' : 'fallback_unknown', availableSubsections, settingsId, section);
    return fallback;
  }

  if (!availableSubsections.includes(requested)) {
    return fallbackResolution('fallback_unauthorized', availableSubsections, settingsId, section);
  }

  const active = operationalSettingsRouteDefinitions[requested];
  return {
    active,
    params: {
      settingsId,
      section: active.compatibilitySection,
      subsection: active.compatibilitySubsection,
    },
    reason: 'matched',
  };
}

export function getAvailableOperationalSettingsSubsections(capabilities: Capabilities): OperationalSettingsSubsectionId[] {
  return operationalSettingsSubsectionIds.filter((subsectionId) => capabilities[operationalSettingsRouteDefinitions[subsectionId].capability]);
}

function fallbackResolution(
  reason: OperationalSettingsRouteResolution['reason'],
  availableSubsections: readonly OperationalSettingsSubsectionId[],
  settingsId = defaultSettingsId,
  section = defaultCompatibilitySection,
): OperationalSettingsRouteResolution | null {
  const fallback = availableSubsections[0];
  if (!fallback) return null;
  const active = operationalSettingsRouteDefinitions[fallback];
  return {
    active,
    params: {
      settingsId,
      section: active.compatibilitySection || section,
      subsection: active.compatibilitySubsection,
    },
    reason,
  };
}

export function buildOperationalSettingsDedicatedPath(subsectionId: OperationalSettingsSubsectionId): string {
  return operationalSettingsRouteDefinitions[subsectionId].path;
}
