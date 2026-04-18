import {
  registeredRoutePaths,
  routeClasses,
  routeIds,
  type RegisteredRoutePath,
  type RouteClass,
  type RouteId,
} from './route-contracts';

export type RouteMetadata = {
  routeId: RouteId;
  routeClass: RouteClass;
  domain: string;
  module: string;
  directEntry: 'full' | 'shell-aware' | 'scoped';
  parentTarget?: string;
};

export const routeMetadataRegistry: Record<RegisteredRoutePath, RouteMetadata> = {
  '/': { routeId: routeIds.publicHome, routeClass: routeClasses.publicToken, domain: 'auth', module: 'public-entry', directEntry: 'full' },
  '/confirm-registration/$token': { routeId: routeIds.confirmRegistration, routeClass: routeClasses.publicToken, domain: 'auth', module: 'registration', directEntry: 'full' },
  '/forgot-password': { routeId: routeIds.forgotPassword, routeClass: routeClasses.publicToken, domain: 'auth', module: 'password-recovery', directEntry: 'full' },
  '/reset-password/$token': { routeId: routeIds.resetPassword, routeClass: routeClasses.publicToken, domain: 'auth', module: 'password-recovery', directEntry: 'full' },
  '/register/$token': { routeId: routeIds.register, routeClass: routeClasses.publicToken, domain: 'auth', module: 'registration', directEntry: 'full' },
  '/auth/cezanne/$tenantGuid': { routeId: routeIds.authCezanne, routeClass: routeClasses.publicToken, domain: 'auth', module: 'cezanne', directEntry: 'full' },
  '/auth/cezanne/callback': { routeId: routeIds.authCezanneCallback, routeClass: routeClasses.publicToken, domain: 'auth', module: 'cezanne', directEntry: 'full' },
  '/auth/saml': { routeId: routeIds.authSaml, routeClass: routeClasses.publicToken, domain: 'auth', module: 'sso', directEntry: 'full' },
  '/users/invite-token': { routeId: routeIds.inviteToken, routeClass: routeClasses.publicToken, domain: 'auth', module: 'invite', directEntry: 'full' },
  '/dashboard': { routeId: routeIds.dashboard, routeClass: routeClasses.page, domain: 'dashboard', module: 'home', directEntry: 'full' },
  '/notifications': { routeId: routeIds.notifications, routeClass: routeClasses.page, domain: 'shell', module: 'notifications', directEntry: 'full' },
  '/inbox': { routeId: routeIds.inbox, routeClass: routeClasses.pageWithStatefulUrl, domain: 'inbox', module: 'conversation-list', directEntry: 'full' },
  '/user-profile': { routeId: routeIds.userProfile, routeClass: routeClasses.shellOverlay, domain: 'shell', module: 'account', directEntry: 'shell-aware', parentTarget: '/dashboard' },
  '/hiring-company-profile': { routeId: routeIds.hiringCompanyProfile, routeClass: routeClasses.page, domain: 'shell', module: 'account', directEntry: 'full' },
  '/recruitment-agency-profile': { routeId: routeIds.recruitmentAgencyProfile, routeClass: routeClasses.page, domain: 'shell', module: 'account', directEntry: 'full' },
  '/logout': { routeId: routeIds.logout, routeClass: routeClasses.page, domain: 'shell', module: 'session', directEntry: 'full' },
  '/access-denied': { routeId: routeIds.accessDenied, routeClass: routeClasses.page, domain: 'system', module: 'fallback', directEntry: 'full' },
};

export function getRouteMetadata(pathname: string): RouteMetadata {
  if ((registeredRoutePaths as readonly string[]).includes(pathname)) {
    return routeMetadataRegistry[pathname as RegisteredRoutePath];
  }

  return {
    routeId: routeIds.accessDenied,
    routeClass: routeClasses.page,
    domain: 'system',
    module: 'fallback',
    directEntry: 'full',
  };
}
