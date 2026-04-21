import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { observability } from '../../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildAuthTelemetry, buildAuthTokenRouteState, parseAuthCallbackState, resolveLogoutState, resolvePostAuthLanding, type AuthProviderFamily } from '../models';

type PublicRoutePageProps = {
  title: string;
  detail: ReactNode;
  state?: string;
  landingTarget?: string;
};

function PublicRoutePage({ title, detail, state, landingTarget }: PublicRoutePageProps) {
  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <div>{detail}</div>
      {state ? <p data-testid="auth-route-state">{state}</p> : null}
      {landingTarget ? <p data-testid="auth-landing-target">{landingTarget}</p> : null}
    </section>
  );
}

function trackAuthOpen(event: ReturnType<typeof buildAuthTelemetry>) {
  setActiveCorrelationId(createCorrelationId());
  observability.telemetry.track({ ...event, data: { ...event.data, correlationId: ensureCorrelationId() } });
}

export function PublicHomePage() {
  const { t } = useTranslation('auth');
  const landing = useMemo(() => resolvePostAuthLanding({ isAuthenticated: false }), []);
  trackAuthOpen(buildAuthTelemetry({ action: 'open', outcome: 'ready', sessionOutcome: 'public-entry', entryMode: 'direct', fallbackKind: landing.fallbackKind }));
  return <PublicRoutePage title={t('publicHome.title')} detail={t('publicHome.detail')} state="ready" />;
}

function AuthTokenPage({ token, titleKey, detailKey }: { token?: string; titleKey: string; detailKey: string }) {
  const { t } = useTranslation('auth');
  const state = buildAuthTokenRouteState(token);
  trackAuthOpen(buildAuthTelemetry({ action: 'open', outcome: state.routeState.kind, tokenState: state.tokenState, entryMode: 'direct' }));
  return <PublicRoutePage title={t(titleKey)} detail={state.canSubmit ? t(detailKey) : t(`tokenStates.${state.tokenState}`)} state={state.tokenState} />;
}

export function ConfirmRegistrationPage({ token }: { token?: string }) {
  return <AuthTokenPage token={token} titleKey="confirmRegistration.title" detailKey="confirmRegistration.detail" />;
}

export function ForgotPasswordPage() {
  const { t } = useTranslation('auth');
  trackAuthOpen(buildAuthTelemetry({ action: 'open', outcome: 'ready', entryMode: 'direct' }));
  return <PublicRoutePage title={t('forgotPassword.title')} detail={t('forgotPassword.detail')} state="ready" />;
}

export function ResetPasswordPage({ token }: { token?: string }) {
  return <AuthTokenPage token={token} titleKey="resetPassword.title" detailKey="resetPassword.detail" />;
}

export function RegisterPage({ token }: { token?: string }) {
  return <AuthTokenPage token={token} titleKey="register.title" detailKey="register.detail" />;
}

export function CezanneAuthPage({ tenantGuid }: { tenantGuid?: string }) {
  const { t } = useTranslation('auth');
  const state = tenantGuid ? 'ready' : 'failed';
  trackAuthOpen(buildAuthTelemetry({ action: 'open', providerFamily: 'cezanne', outcome: state, entryMode: 'direct' }));
  return <PublicRoutePage title={t('cezanneAuth.title')} detail={tenantGuid ? t('cezanneAuth.detail') : t('callbackStates.callback-failed')} state={state} />;
}

function CallbackPage({ providerFamily, search, titleKey }: { providerFamily: AuthProviderFamily; search: { code?: unknown; error?: unknown }; titleKey: string }) {
  const { t } = useTranslation('auth');
  const callback = parseAuthCallbackState(providerFamily, search);
  const landing = resolvePostAuthLanding({ isAuthenticated: callback.outcome === 'callback-exchanging', organizationType: 'hc' });
  trackAuthOpen(buildAuthTelemetry({
    action: 'callback',
    providerFamily,
    outcome: callback.routeState.kind,
    callbackOutcome: callback.outcome,
    sessionOutcome: landing.sessionOutcome,
    entryMode: 'callback',
    fallbackKind: landing.fallbackKind,
  }));
  return <PublicRoutePage title={t(titleKey)} detail={t(`callbackStates.${callback.outcome}`)} state={callback.outcome} landingTarget={landing.target} />;
}

export function CezanneCallbackPage({ code, error }: { code?: string; error?: string }) {
  return <CallbackPage providerFamily="cezanne" search={{ code, error }} titleKey="cezanneCallback.title" />;
}

export function SamlCallbackPage({ code, error }: { code?: string; error?: string }) {
  return <CallbackPage providerFamily="saml" search={{ code, error }} titleKey="samlCallback.title" />;
}

export function InviteTokenPage({ token }: { token?: string }) {
  return <AuthTokenPage token={token} titleKey="inviteToken.title" detailKey="inviteToken.detail" />;
}

export function LogoutPage() {
  const { t } = useTranslation('auth');
  const state = resolveLogoutState();
  trackAuthOpen(buildAuthTelemetry({ action: 'logout', outcome: state.kind, sessionOutcome: 'logged-out', entryMode: 'logout', fallbackKind: 'public-entry' }));
  return <PublicRoutePage title={t('logout.title')} detail={t('logout.detail')} state={state.kind} landingTarget={state.landingTarget} />;
}


export function AccessDeniedPage() {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t('accessDenied.title')} detail={t('accessDenied.detail')} />;
}
