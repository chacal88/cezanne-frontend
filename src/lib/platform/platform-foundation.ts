import type { Capabilities } from '../access-control';
import { routeIds, type RouteId } from '../routing';

export const platformRouteFamilies = {
  masterData: 'master-data',
  usersAndRequests: 'users-and-requests',
  taxonomy: 'taxonomy',
} as const;

export type PlatformRouteFamily = (typeof platformRouteFamilies)[keyof typeof platformRouteFamilies];

export type PlatformRouteMetadata = {
  routeId: RouteId;
  routeFamily: PlatformRouteFamily;
  requiredCapability: keyof Capabilities;
  fallbackTarget: '/dashboard';
  implementationState: 'foundation-placeholder' | 'planned';
};

export const platformRouteMetadata = {
  hiringCompanies: {
    routeId: routeIds.platformHiringCompanies,
    routeFamily: platformRouteFamilies.masterData,
    requiredCapability: 'canManageHiringCompanies',
    fallbackTarget: '/dashboard',
    implementationState: 'foundation-placeholder',
  },
} as const satisfies Record<string, PlatformRouteMetadata>;

export function getPlatformFallbackOutcome(capabilities: Capabilities, metadata: PlatformRouteMetadata) {
  const allowed = capabilities[metadata.requiredCapability];
  return {
    allowed,
    routeId: metadata.routeId,
    routeFamily: metadata.routeFamily,
    capability: metadata.requiredCapability,
    capabilityOutcome: allowed ? 'allowed' : 'denied',
    fallbackTarget: metadata.fallbackTarget,
    fallbackOutcome: allowed ? 'not-needed' : 'dashboard',
  } as const;
}
