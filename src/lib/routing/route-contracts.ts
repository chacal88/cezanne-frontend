export const routeClasses = {
  publicToken: 'Public/Token',
  page: 'Page',
  pageWithStatefulUrl: 'PageWithStatefulUrl',
  shellOverlay: 'ShellOverlay',
} as const;

export type RouteClass = (typeof routeClasses)[keyof typeof routeClasses];

export const routeIds = {
  publicHome: 'public.home',
  confirmRegistration: 'auth.confirm-registration',
  forgotPassword: 'auth.forgot-password',
  resetPassword: 'auth.reset-password',
  register: 'auth.register',
  authCezanne: 'auth.cezanne',
  authCezanneCallback: 'auth.cezanne-callback',
  authSaml: 'auth.saml',
  inviteToken: 'auth.invite-token',
  dashboard: 'dashboard.home',
  notifications: 'shell.notifications',
  inbox: 'inbox.home',
  userProfile: 'shell.user-profile',
  hiringCompanyProfile: 'shell.hiring-company-profile',
  recruitmentAgencyProfile: 'shell.recruitment-agency-profile',
  logout: 'shell.logout',
  accessDenied: 'system.access-denied',
} as const;

export type RouteId = (typeof routeIds)[keyof typeof routeIds];

export const registeredRoutePaths = [
  '/',
  '/confirm-registration/$token',
  '/forgot-password',
  '/reset-password/$token',
  '/register/$token',
  '/auth/cezanne/$tenantGuid',
  '/auth/cezanne/callback',
  '/auth/saml',
  '/users/invite-token',
  '/dashboard',
  '/notifications',
  '/inbox',
  '/user-profile',
  '/hiring-company-profile',
  '/recruitment-agency-profile',
  '/logout',
  '/access-denied',
] as const;

export type RegisteredRoutePath = (typeof registeredRoutePaths)[number];
