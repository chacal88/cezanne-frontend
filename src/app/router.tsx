import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { AccessBoundary } from '../lib/access-control';
import { RouteTelemetryObserver } from '../lib/observability';
import { PublicShell } from '../shell/layout/public-shell';
import { AuthenticatedShell } from '../shell/layout/authenticated-shell';
import { DashboardPage } from '../domains/dashboard/dashboard-page';
import { NotificationsPage } from '../shell/notifications/notifications-page';
import { InboxPage, validateInboxSearch } from '../domains/inbox/inbox-page';
import { UserProfileShellOverlay } from '../shell/account/user-profile-overlay';
import { observability } from './observability';
import {
  AccessDeniedPage,
  CezanneAuthPage,
  CezanneCallbackPage,
  ConfirmRegistrationPage,
  ForgotPasswordPage,
  InviteTokenPage,
  LogoutPage,
  ProfilePlaceholderPage,
  PublicHomePage,
  RegisterPage,
  ResetPasswordPage,
  SamlCallbackPage,
} from '../domains/auth/routes/public-pages';

const deniedFallback = <AccessDeniedPage />;

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <RouteTelemetryObserver observability={observability} />
    </>
  ),
  notFoundComponent: AccessDeniedPage,
});

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public-layout',
  component: () => (
    <PublicShell>
      <Outlet />
    </PublicShell>
  ),
});

const shellLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'shell-layout',
  component: () => (
    <AccessBoundary capability="canEnterShell" fallback={deniedFallback}>
      <AuthenticatedShell>
        <Outlet />
      </AuthenticatedShell>
    </AccessBoundary>
  ),
});

const publicHomeRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/', component: PublicHomePage });
const confirmRegistrationRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/confirm-registration/$token', component: ConfirmRegistrationPage });
const forgotPasswordRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/forgot-password', component: ForgotPasswordPage });
const resetPasswordRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/reset-password/$token', component: ResetPasswordPage });
const registerRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/register/$token', component: RegisterPage });
const cezanneAuthRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/auth/cezanne/$tenantGuid', component: CezanneAuthPage });
const cezanneCallbackRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/auth/cezanne/callback',
  validateSearch: (search) => ({ code: typeof search.code === 'string' ? search.code : undefined }),
  component: CezanneCallbackPage,
});
const samlCallbackRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/auth/saml',
  validateSearch: (search) => ({ code: typeof search.code === 'string' ? search.code : undefined, error: typeof search.error === 'string' ? search.error : undefined }),
  component: SamlCallbackPage,
});
const inviteTokenRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/users/invite-token', component: InviteTokenPage });

const dashboardRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/dashboard',
  component: () => (
    <AccessBoundary capability="canViewDashboard" fallback={deniedFallback}>
      <DashboardPage />
    </AccessBoundary>
  ),
});

const notificationsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/notifications',
  component: () => (
    <AccessBoundary capability="canViewNotifications" fallback={deniedFallback}>
      <NotificationsPage />
    </AccessBoundary>
  ),
});

const inboxRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/inbox',
  validateSearch: validateInboxSearch,
  component: () => (
    <AccessBoundary capability="canUseInbox" fallback={deniedFallback}>
      <InboxPage />
    </AccessBoundary>
  ),
});

const userProfileRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/user-profile',
  component: () => (
    <AccessBoundary capability="canOpenAccountArea" fallback={deniedFallback}>
      <UserProfileShellOverlay />
    </AccessBoundary>
  ),
});

const hiringCompanyProfileRoute = createRoute({ getParentRoute: () => shellLayoutRoute, path: '/hiring-company-profile', component: () => <ProfilePlaceholderPage titleKey="profilePlaceholder.hiringCompanyTitle" /> });
const recruitmentAgencyProfileRoute = createRoute({ getParentRoute: () => shellLayoutRoute, path: '/recruitment-agency-profile', component: () => <ProfilePlaceholderPage titleKey="profilePlaceholder.recruitmentAgencyTitle" /> });
const logoutRoute = createRoute({ getParentRoute: () => shellLayoutRoute, path: '/logout', component: LogoutPage });
const accessDeniedRoute = createRoute({ getParentRoute: () => rootRoute, path: '/access-denied', component: AccessDeniedPage });

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([publicHomeRoute, confirmRegistrationRoute, forgotPasswordRoute, resetPasswordRoute, registerRoute, cezanneAuthRoute, cezanneCallbackRoute, samlCallbackRoute, inviteTokenRoute]),
  shellLayoutRoute.addChildren([dashboardRoute, notificationsRoute, inboxRoute, userProfileRoute, hiringCompanyProfileRoute, recruitmentAgencyProfileRoute, logoutRoute]),
  accessDeniedRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
