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
  implementationState: 'foundation-placeholder' | 'planned' | 'implemented';
};

export const platformRouteMetadata = {
  hiringCompanies: {
    routeId: routeIds.platformHiringCompanies,
    routeFamily: platformRouteFamilies.masterData,
    requiredCapability: 'canManageHiringCompanies',
    fallbackTarget: '/dashboard',
    implementationState: 'implemented',
  },
  hiringCompanyDetail: {
    routeId: routeIds.platformHiringCompanyDetail,
    routeFamily: platformRouteFamilies.masterData,
    requiredCapability: 'canManageHiringCompanies',
    fallbackTarget: '/dashboard',
    implementationState: 'implemented',
  },
  hiringCompanySubscription: {
    routeId: routeIds.platformHiringCompanySubscription,
    routeFamily: platformRouteFamilies.masterData,
    requiredCapability: 'canManageHiringCompanies',
    fallbackTarget: '/dashboard',
    implementationState: 'implemented',
  },
  recruitmentAgencies: {
    routeId: routeIds.platformRecruitmentAgencies,
    routeFamily: platformRouteFamilies.masterData,
    requiredCapability: 'canManageRecruitmentAgencies',
    fallbackTarget: '/dashboard',
    implementationState: 'implemented',
  },
  subscriptions: {
    routeId: routeIds.platformSubscriptions,
    routeFamily: platformRouteFamilies.masterData,
    requiredCapability: 'canManagePlatformSubscriptions',
    fallbackTarget: '/dashboard',
    implementationState: 'implemented',
  },
  users: {
    routeId: routeIds.platformUsers,
    routeFamily: platformRouteFamilies.usersAndRequests,
    requiredCapability: 'canManagePlatformUsers',
    fallbackTarget: '/dashboard',
    implementationState: 'implemented',
  },
  favoriteRequests: {
    routeId: routeIds.platformFavoriteRequests,
    routeFamily: platformRouteFamilies.usersAndRequests,
    requiredCapability: 'canManageFavoriteRequests',
    fallbackTarget: '/dashboard',
    implementationState: 'implemented',
  },
  sectors: {
    routeId: routeIds.platformSectors,
    routeFamily: platformRouteFamilies.taxonomy,
    requiredCapability: 'canManageTaxonomy',
    fallbackTarget: '/dashboard',
    implementationState: 'implemented',
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
