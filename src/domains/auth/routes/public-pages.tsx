import type { FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { observability } from '../../../app/observability';
import {
  authApiAdapter,
  clearLocalAuthSession,
  completeCezanneCallback,
  completeSamlCallback,
  confirmRegistrationToken,
  registerAccount,
  requestPasswordResetEmail,
  resetPassword,
  resolveAuthBaseUrl,
  saveLocalAuthSession,
  validateResetPasswordToken,
  type AuthLoginAdapter,
  type PublicAuthActionStatus,
} from '../api';
import { publicAccessContext, useAccessSession } from '../../../lib/access-control';
import { FlashToast, storeFlashMessage, useStoredFlashMessage, type FlashMessage } from '../../../lib/flash';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildAuthTelemetry, buildAuthTokenRouteState, parseAuthCallbackState, resolveLogoutState, resolvePostAuthLanding, type AuthLoginResult, type AuthProviderFamily } from '../models';
import './public-pages.css';

type PublicRoutePageProps = { title: string; detail: ReactNode; state?: string; landingTarget?: string; className?: string };
type ActionState = { status: PublicAuthActionStatus; message?: string; redirectTo?: string };
type LoginVisualState =
  | 'submitting'
  | 'two-factor-required'
  | 'two-factor-failed'
  | 'sso-mandatory'
  | 'activation-required'
  | 'setup-required'
  | 'bootstrap-failure'
  | 'redirecting';

const loginVisualStates: LoginVisualState[] = ['submitting', 'two-factor-required', 'two-factor-failed', 'sso-mandatory', 'activation-required', 'setup-required', 'bootstrap-failure', 'redirecting'];
const tokenVisualStates = ['missing', 'invalid', 'expired', 'valid', 'success', 'failure', 'retry', 'pending-approval', 'bootstrap-failure'] as const;
const callbackVisualStates = ['launch', 'missing-tenant', 'missing-code', 'provider-error', 'exchanging', 'exchange-failure', 'bootstrap-failure', 'success', 'success-redirect'] as const;

let redirectHandler = (target: string) => {
  window.location.assign(target);
};

export function __setAuthRedirectForTest(handler?: (target: string) => void) {
  redirectHandler = handler ?? ((target: string) => window.location.assign(target));
}

function redirectTo(target: string) {
  redirectHandler(target);
}

function readVisualState(allowed: readonly string[]): string | undefined {
  const state = new URLSearchParams(window.location.search).get('visualState') ?? undefined;
  return state && allowed.includes(state) ? state : undefined;
}

function loginVisualMessage(state: LoginVisualState | undefined) {
  if (state === 'two-factor-required') return 'Two-factor verification is required before this session can continue.';
  if (state === 'two-factor-failed') return 'Two-factor verification failed. Try again.';
  if (state === 'sso-mandatory') return 'This account must sign in with SSO.';
  if (state === 'activation-required') return 'This account needs activation before login can continue.';
  if (state === 'setup-required') return 'Account setup is required before the dashboard can open.';
  if (state === 'bootstrap-failure') return 'Session bootstrap failed after authentication.';
  if (state === 'redirecting') return 'Session ready. Redirecting to the safe landing target.';
  return undefined;
}

function actionStateFromVisualState(state: string | undefined): ActionState | undefined {
  if (!state) return undefined;
  if (state === 'success' || state === 'valid' || state === 'success-redirect') return { status: 'succeeded', message: `${state} visual state.`, redirectTo: state === 'valid' ? undefined : '/' };
  if (state === 'pending-approval') return { status: 'succeeded', message: 'Registration is pending approval.', redirectTo: '/' };
  if (state === 'exchanging' || state === 'submitting') return { status: 'submitting', message: `${state} visual state.` };
  return { status: 'failed', message: `${state} visual state.`, redirectTo: '/' };
}

function trackAuthOpen(event: ReturnType<typeof buildAuthTelemetry>) {
  setActiveCorrelationId(createCorrelationId());
  observability.telemetry.track({ ...event, data: { ...event.data, correlationId: ensureCorrelationId() } });
}

function PublicRoutePage({ title, detail, state, landingTarget, className }: PublicRoutePageProps) {
  return (
    <main className={`auth-public-page auth-public-page--simple${className ? ` ${className}` : ''}`}>
      <section className="auth-route-card">
        <img className="auth-login-logo" src="/assets/img/cezanne/cezanne_recruitment_logo_20261x.png" alt="Cezanne Recruitment logo" />
        <h2>{title}</h2>
        <div>{detail}</div>
        {state ? <p className="auth-debug-state" data-testid="auth-route-state">{state}</p> : null}
        {landingTarget ? <p className="auth-debug-state" data-testid="auth-landing-target">{landingTarget}</p> : null}
      </section>
    </main>
  );
}

function PublicFormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;
  const className = state.status === 'succeeded' ? 'auth-login-message auth-login-message--success' : 'auth-login-message';
  return <p className={className} data-testid="auth-form-message">{state.message}</p>;
}

function getErrorKind(result: AuthLoginResult | null): string | undefined {
  return result?.errorKind;
}

function buildProviderPopupFeatures() {
  const width = 900;
  const height = 600;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
  return `width=${width},height=${height},left=${left},top=${top}`;
}

export function PublicHomePage({ authAdapter = authApiAdapter, autoRedirect = true }: { authAdapter?: AuthLoginAdapter; autoRedirect?: boolean } = {}) {
  const { t } = useTranslation('auth');
  const { setAccessContext } = useAccessSession();
  const flash = useStoredFlashMessage();
  const requestedTarget = useMemo(() => new URLSearchParams(window.location.search).get('returnTo') ?? undefined, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginResult, setLoginResult] = useState<AuthLoginResult | null>(null);
  const landing = useMemo(() => resolvePostAuthLanding({ isAuthenticated: false }), []);
  const visualState = readVisualState(loginVisualStates) as LoginVisualState | undefined;
  const visualErrorKind = visualState === 'two-factor-required' || visualState === 'two-factor-failed' ? visualState : undefined;
  const errorKind = visualErrorKind ?? getErrorKind(loginResult);
  const isTwoFactorStep = errorKind === 'two-factor-required' || errorKind === 'two-factor-failed';
  const submitting = isSubmitting || visualState === 'submitting';

  useEffect(() => {
    trackAuthOpen(buildAuthTelemetry({ action: 'open', outcome: 'ready', sessionOutcome: 'public-entry', entryMode: 'direct', fallbackKind: landing.fallbackKind }));
  }, [landing.fallbackKind]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const result = await authAdapter.login({ email, password, code: isTwoFactorStep && code ? code : undefined, requestedTarget });
    setIsSubmitting(false);
    setLoginResult(result);

    trackAuthOpen(buildAuthTelemetry({
      action: 'submit',
      outcome: result.routeState.kind,
      sessionOutcome: result.status === 'succeeded' ? 'session-ready' : 'public-entry',
      entryMode: 'direct',
      fallbackKind: result.landing?.fallbackKind ?? 'public-entry',
    }));

    if (result.status === 'succeeded' && result.accessContext && result.landing) {
      saveLocalAuthSession(result.accessContext, result.landing.target, result.token, result.userSnapshot);
      setAccessContext(result.accessContext);
      if (autoRedirect && result.landing.target) redirectTo(result.landing.target);
    }
  }

  function launchProvider(provider: 'google' | 'microsoft') {
    window.open(`${resolveAuthBaseUrl()}/login/${provider}`, 'popup', buildProviderPopupFeatures());
  }

  function backToLogin() {
    setCode('');
    setLoginResult(null);
  }

  const loginForm = (
    <form onSubmit={submitLogin} aria-label={t('login.formLabel')} className="auth-login-form">
      <label className="auth-login-field" aria-label={t('login.email')}>
        <i className="auth-login-field__icon fas fa-user" aria-hidden="true" />
        <input className="auth-login-field__control" value={email} onChange={(event) => setEmail(event.target.value)} name="email" type="email" placeholder={t('login.emailPlaceholder')} autoComplete="email" data-testid="auth-login-email" required />
      </label>
      <label className="auth-login-field" aria-label={t('login.password')}>
        <i className="auth-login-field__icon fas fa-lock" aria-hidden="true" />
        <input className="auth-login-field__control" value={password} onChange={(event) => setPassword(event.target.value)} name="password" type={showPassword ? 'text' : 'password'} placeholder={t('login.passwordPlaceholder')} autoComplete="current-password" data-testid="auth-login-password" required />
        <button className="auth-login-field__toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}><i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" /></button>
      </label>
      <button type="submit" className="auth-login-btn" data-testid="auth-login-submit" disabled={submitting}>{submitting ? t('login.loading') : t('login.submit')}</button>
      <div className="auth-login-divider">{t('login.signinOr')}</div>
      <div className="auth-login-socials">
        <button type="button" name="login-google" className="auth-login-social" onClick={() => launchProvider('google')}><img src="/assets/img/login/login_gm.png" alt="Google" />{t('login.signinGoogle')}</button>
        <button type="button" name="login-ms" className="auth-login-social" onClick={() => launchProvider('microsoft')}><img src="/assets/img/login/ms-logo.png" alt="Microsoft" />{t('login.signinMicrosoft')}</button>
      </div>
    </form>
  );

  const twoFactorForm = (
    <form onSubmit={submitLogin} aria-label={t('login.twoFactor.formLabel')} className="auth-login-form">
      <div className="auth-verify-header"><span className="auth-verify-title">{t('login.twoFactor.title')}</span><button type="button" className="auth-verify-link" onClick={backToLogin}>{t('login.twoFactor.backToLogin')}</button></div>
      <div className="auth-verify-separator" />
      <p className="auth-verify-text">{errorKind === 'two-factor-failed' ? t('login.twoFactor.error') : t('login.twoFactor.confirm', { email })}</p>
      <label className="auth-login-field" aria-label={t('login.code')}>
        <i className="auth-login-field__icon fas fa-hashtag" aria-hidden="true" />
        <input className="auth-login-field__control" value={code} onChange={(event) => setCode(event.target.value)} type="text" inputMode="numeric" autoComplete="one-time-code" placeholder={t('login.twoFactor.placeholder')} data-testid="auth-login-code" required />
      </label>
      <button type="submit" className="auth-verify-btn" data-testid="auth-login-submit" disabled={submitting}>{submitting ? t('login.loading') : t('login.twoFactor.verify')}</button>
    </form>
  );

  return (
    <main className="auth-public-page">
      <FlashToast flash={flash} testId="auth-flash-toast" />
      <div>
        <div className="auth-login-shell">
          <section className="auth-login-card" aria-labelledby="auth-login-title">
            <img className="auth-login-logo" src="/assets/img/cezanne/cezanne_recruitment_logo_20261x.png" alt="Cezanne Recruitment logo" />
            {!isTwoFactorStep ? <span className="auth-login-title" id="auth-login-title">{t('login.welcomeTitle')}</span> : null}
            {isTwoFactorStep ? twoFactorForm : loginForm}
            {visualState && !isTwoFactorStep && visualState !== 'submitting' ? <p className="auth-login-message" data-testid="auth-login-message">{loginVisualMessage(visualState)}</p> : null}
            {!visualState && loginResult && loginResult.status === 'failed' && !isTwoFactorStep ? <p className="auth-login-message" data-testid="auth-login-message">{loginResult.routeState.message}</p> : null}
            {loginResult?.landing && !autoRedirect ? <a href={loginResult.landing.target} className="auth-login-continue" data-testid="auth-login-continue">{t('login.continue')}</a> : null}
            <p className="auth-debug-state" data-testid="auth-route-state">{visualState ?? loginResult?.routeState.kind ?? 'ready'}</p>
            {loginResult?.landing ? <p className="auth-debug-state" data-testid="auth-landing-target">{loginResult.landing.target}</p> : null}
            {visualState === 'redirecting' ? <p className="auth-debug-state" data-testid="auth-landing-target">/dashboard</p> : null}
          </section>
        </div>
        <nav className="auth-login-links" aria-label={t('login.secondaryLinks')}><a href="/forgot-password">{t('login.forgotAccount')}</a><a href="/register/null">{t('login.signup')}</a></nav>
      </div>
    </main>
  );
}

function AuthTokenPage({ token, titleKey, detailKey }: { token?: string; titleKey: string; detailKey: string }) {
  const { t } = useTranslation('auth');
  const visualState = readVisualState(tokenVisualStates);
  const state = buildAuthTokenRouteState(token);
  trackAuthOpen(buildAuthTelemetry({ action: 'open', outcome: state.routeState.kind, tokenState: state.tokenState, entryMode: 'direct' }));
  return <PublicRoutePage title={t(titleKey)} detail={visualState ? `${visualState} visual state.` : state.canSubmit ? t(detailKey) : t(`tokenStates.${state.tokenState}`)} state={visualState ?? state.tokenState} />;
}

export function ConfirmRegistrationPage({ token }: { token?: string }) {
  const { t } = useTranslation('auth');
  const { setAccessContext } = useAccessSession();
  const visualState = readVisualState(tokenVisualStates);
  const [state, setState] = useState<ActionState>(actionStateFromVisualState(visualState) ?? { status: 'submitting', message: t('confirmRegistration.checking') });

  useEffect(() => {
    if (visualState) return;
    if (!token) {
      setState({ status: 'failed', message: t('confirmRegistration.missingToken'), redirectTo: '/' });
      return;
    }
    void confirmRegistrationToken(token).then((result) => {
      if ('routeState' in result) {
        setState({ status: result.status === 'succeeded' ? 'succeeded' : 'failed', message: result.routeState.message, redirectTo: result.landing?.target });
        if (result.status === 'succeeded' && result.accessContext && result.landing) {
          saveLocalAuthSession(result.accessContext, result.landing.target, result.token, result.userSnapshot);
          setAccessContext(result.accessContext);
          if (result.landing.target) redirectTo(result.landing.target);
        }
      } else {
        setState(result);
        if (result.redirectTo) {
          if (result.message) {
            storeFlashMessage({
              kind: result.status === 'succeeded' ? 'success' : 'error',
              title: result.status === 'succeeded' ? 'Registration confirmed' : 'Registration confirmation',
              message: result.message,
            });
          }
          redirectTo(result.redirectTo);
        }
      }
    }).catch(() => setState({ status: 'failed', message: t('confirmRegistration.failed'), redirectTo: '/' }));
  }, [setAccessContext, t, token, visualState]);

  return <PublicRoutePage title={t('confirmRegistration.title')} detail={<PublicFormMessage state={state} />} state={visualState ?? state.status} landingTarget={state.redirectTo} />;
}

export function ForgotPasswordPage() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [flash, setFlash] = useState<FlashMessage | null>(null);
  const visualState = readVisualState(tokenVisualStates);
  const [state, setState] = useState<ActionState>(actionStateFromVisualState(visualState) ?? { status: 'idle' });
  trackAuthOpen(buildAuthTelemetry({ action: 'open', outcome: 'ready', entryMode: 'direct' }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: 'submitting', message: t('forgotPassword.sending') });
    try {
      const result = await requestPasswordResetEmail(email);
      if (result.status === 'succeeded' && result.redirectTo) {
        storeFlashMessage({ kind: 'success', title: t('forgotPassword.sentTitle'), message: result.message });
        redirectTo(result.redirectTo);
        return;
      }
      if (result.status === 'failed') {
        setFlash({ kind: 'error', title: result.message === 'Email not found.' ? t('forgotPassword.notFoundTitle') : t('forgotPassword.errorTitle'), message: result.message });
        setState({ status: 'idle' });
        return;
      }
      setState(result);
    } catch {
      setFlash({ kind: 'error', title: t('forgotPassword.errorTitle'), message: t('forgotPassword.error') });
      setState({ status: 'idle' });
    }
  }

  return (
    <PublicRoutePage
      className="auth-public-page--forgot-password"
      title={t('forgotPassword.title')}
      detail={(
        <form className="auth-secondary-form auth-secondary-form--forgot-password" onSubmit={submit} aria-label={t('forgotPassword.title')}>
          <FlashToast flash={flash} testId="auth-flash-toast" />
          {t('forgotPassword.detail') ? <p>{t('forgotPassword.detail')}</p> : null}
          <label className="auth-login-field" htmlFor="forgot-password-email">
            <input id="forgot-password-email" className="auth-login-field__control" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('login.emailPlaceholder')} type="email" required />
            <i className="far fa-envelope auth-login-field__icon" aria-hidden="true" />
          </label>
          <button className="auth-login-btn" type="submit" disabled={state.status === 'submitting'}>
            {state.status === 'submitting' ? <i className="fas fa-spin fa-circle-notch" aria-label={t('forgotPassword.sending')} /> : t('forgotPassword.submit')}
          </button>
          {state.status === 'submitting' ? <PublicFormMessage state={state} /> : null}
          <a className="auth-login-continue" href="/">{t('forgotPassword.goToLogin')}</a>
        </form>
      )}
      state={visualState ?? state.status}
    />
  );
}

export function ResetPasswordPage({ token }: { token?: string }) {
  const { t } = useTranslation('auth');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const visualState = readVisualState(tokenVisualStates);
  const [state, setState] = useState<ActionState>(actionStateFromVisualState(visualState) ?? { status: 'idle' });

  useEffect(() => {
    if (visualState) return;
    if (!token) return;
    void validateResetPasswordToken(token).then((result) => setState(result)).catch(() => setState({ status: 'failed', message: t('resetPassword.invalidToken'), redirectTo: '/' }));
  }, [t, token, visualState]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setState({ status: 'failed', message: t('resetPassword.missingToken') });
    if (password !== passwordConfirmation) return setState({ status: 'failed', message: t('resetPassword.passwordMismatch') });
    setState({ status: 'submitting', message: t('resetPassword.submitting') });
    try {
      const result = await resetPassword({ token, password, passwordConfirmation });
      setState(result);
      if (result.status === 'succeeded' && result.redirectTo) redirectTo(result.redirectTo);
    } catch {
      setState({ status: 'failed', message: t('resetPassword.error') });
    }
  }

  return <PublicRoutePage title={t('resetPassword.title')} detail={<form className="auth-secondary-form" onSubmit={submit} aria-label={t('resetPassword.title')}><input className="auth-login-field__control" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('resetPassword.password')} type="password" autoComplete="new-password" required /><input className="auth-login-field__control" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder={t('resetPassword.passwordConfirmation')} type="password" autoComplete="new-password" required /><button className="auth-login-btn" type="submit" disabled={state.status === 'submitting'}>{state.status === 'submitting' ? t('resetPassword.submitting') : t('resetPassword.submit')}</button><PublicFormMessage state={state} /><a className="auth-login-continue" href="/">{t('login.goToLogin')}</a></form>} state={visualState ?? state.status} landingTarget={state.redirectTo} />;
}

export function RegisterPage({ token }: { token?: string }) {
  const { t } = useTranslation('auth');
  const normalizedToken = token === 'null' ? undefined : token;
  const [organizationType, setOrganizationType] = useState<'hiringCompany' | 'recruitmentAgency'>(normalizedToken === 'ra' || normalizedToken === 'recruitment-agency' ? 'recruitmentAgency' : 'hiringCompany');
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const visualState = readVisualState(tokenVisualStates);
  const [state, setState] = useState<ActionState>(actionStateFromVisualState(visualState) ?? { status: 'idle' });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== passwordConfirmation) return setState({ status: 'failed', message: t('resetPassword.passwordMismatch') });
    setState({ status: 'submitting', message: t('register.submitting') });
    try {
      const result = await registerAccount({ organizationType, companyName, firstName, lastName, email, password, passwordConfirmation, token: normalizedToken });
      setState(result);
      if (result.status === 'succeeded' && result.redirectTo) redirectTo(result.redirectTo);
    } catch {
      setState({ status: 'failed', message: t('register.error') });
    }
  }

  return <PublicRoutePage title={t('register.title')} detail={<form className="auth-secondary-form" onSubmit={submit} aria-label={t('register.title')}><select className="auth-login-field__control" value={organizationType} onChange={(event) => setOrganizationType(event.target.value as 'hiringCompany' | 'recruitmentAgency')}><option value="hiringCompany">{t('register.hiringCompany')}</option><option value="recruitmentAgency">{t('register.recruitmentAgency')}</option></select><input className="auth-login-field__control" value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder={t('register.companyName')} required /><input className="auth-login-field__control" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder={t('register.firstName')} required /><input className="auth-login-field__control" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder={t('register.lastName')} required /><input className="auth-login-field__control" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('login.emailPlaceholder')} type="email" required /><input className="auth-login-field__control" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('resetPassword.password')} type="password" required /><input className="auth-login-field__control" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder={t('resetPassword.passwordConfirmation')} type="password" required /><button className="auth-login-btn" type="submit" disabled={state.status === 'submitting'}>{state.status === 'submitting' ? t('register.submitting') : t('register.submit')}</button><PublicFormMessage state={state} /><a className="auth-login-continue" href="/">{t('login.goToLogin')}</a></form>} state={visualState ?? state.status} />;
}

export function CezanneAuthPage({ tenantGuid }: { tenantGuid?: string }) {
  const { t } = useTranslation('auth');
  const visualState = readVisualState(callbackVisualStates);
  useEffect(() => {
    if (tenantGuid && !visualState) window.location.href = `${resolveAuthBaseUrl()}/login/cezanne/${tenantGuid}`;
  }, [tenantGuid, visualState]);
  const state = visualState ?? (tenantGuid ? 'launch' : 'missing-tenant');
  return <PublicRoutePage title={t('cezanneAuth.title')} detail={tenantGuid ? t('cezanneAuth.redirecting') : t('callbackStates.callback-failed')} state={state} />;
}

function CallbackPage({ providerFamily, search, titleKey }: { providerFamily: AuthProviderFamily; search: { code?: unknown; error?: unknown }; titleKey: string }) {
  const { t } = useTranslation('auth');
  const { setAccessContext } = useAccessSession();
  const visualState = readVisualState(callbackVisualStates);
  const [state, setState] = useState<ActionState>(actionStateFromVisualState(visualState) ?? { status: 'submitting', message: t('callbackStates.callback-exchanging') });
  const callback = parseAuthCallbackState(providerFamily, search);

  useEffect(() => {
    if (visualState) return;
    if (typeof search.error === 'string') return setState({ status: 'failed', message: t('callbackStates.callback-failed') });
    if (typeof search.code !== 'string' || !search.code) return setState({ status: 'idle', message: t('callbackStates.callback-failed') });
    const run = providerFamily === 'cezanne' ? completeCezanneCallback : completeSamlCallback;
    void run(search.code).then((result) => {
      setState({ status: result.status === 'succeeded' ? 'succeeded' : 'failed', message: result.routeState.message, redirectTo: result.landing?.target });
      if (result.status === 'succeeded' && result.accessContext && result.landing) {
        saveLocalAuthSession(result.accessContext, result.landing.target, result.token, result.userSnapshot);
        setAccessContext(result.accessContext);
        if (result.landing.target) redirectTo(result.landing.target);
      }
    }).catch(() => setState({ status: 'failed', message: t('callbackStates.callback-failed') }));
  }, [providerFamily, search.code, search.error, setAccessContext, t, visualState]);

  trackAuthOpen(buildAuthTelemetry({ action: 'callback', providerFamily, outcome: callback.routeState.kind, callbackOutcome: callback.outcome, entryMode: 'callback' }));
  return <PublicRoutePage title={t(titleKey)} detail={<PublicFormMessage state={state} />} state={visualState ?? state.status} landingTarget={state.redirectTo} />;
}

export function CezanneCallbackPage({ code, error }: { code?: string; error?: string }) {
  return <CallbackPage providerFamily="cezanne" search={{ code, error }} titleKey="cezanneCallback.title" />;
}

export function SamlCallbackPage({ code, error }: { code?: string; error?: string }) {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const visualState = readVisualState(callbackVisualStates);
  if (code || error) return <CallbackPage providerFamily="saml" search={{ code, error }} titleKey="samlCallback.title" />;
  return <PublicRoutePage title={t('samlCallback.title')} detail={<form className="auth-secondary-form" onSubmit={(event) => { event.preventDefault(); window.location.href = `${resolveAuthBaseUrl()}/login/saml?profileEmail=${encodeURIComponent(email)}`; }}><input className="auth-login-field__control" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('login.emailPlaceholder')} type="email" required /><button className="auth-login-btn" type="submit">{t('samlCallback.launch')}</button><a className="auth-login-continue" href="/">{t('login.goToLogin')}</a></form>} state={visualState ?? 'ready'} />;
}

export function InviteTokenPage({ token }: { token?: string }) {
  return <AuthTokenPage token={token} titleKey="inviteToken.title" detailKey="inviteToken.detail" />;
}

export function LogoutPage() {
  const { setAccessContext } = useAccessSession();
  const state = resolveLogoutState();

  useEffect(() => {
    clearLocalAuthSession();
    setAccessContext(publicAccessContext);
    trackAuthOpen(buildAuthTelemetry({ action: 'logout', outcome: state.kind, sessionOutcome: 'logged-out', entryMode: 'logout', fallbackKind: 'public-entry' }));
    redirectTo(state.landingTarget ?? '/');
  }, [setAccessContext, state.kind, state.landingTarget]);

  return null;
}

export function SessionLossPage() {
  const { t } = useTranslation('auth');
  const { setAccessContext } = useAccessSession();
  const state = { kind: 'session-expired', landingTarget: '/' };

  useEffect(() => {
    clearLocalAuthSession();
    setAccessContext(publicAccessContext);
    trackAuthOpen(buildAuthTelemetry({ action: 'session-expired', outcome: 'session-expired', sessionOutcome: 'session-expired', entryMode: 'session-loss', fallbackKind: 'public-entry' }));
  }, [setAccessContext]);

  return <PublicRoutePage title={t('logout.title')} detail={<><p>{t('sessionStates.session-expired-detail')}</p><a className="auth-login-continue" href="/">{t('login.goToLogin')}</a></>} state={state.kind} landingTarget={state.landingTarget} />;
}

export function AccessDeniedPage() {
  const { t } = useTranslation('auth');
  return <PublicRoutePage title={t('accessDenied.title')} detail={t('accessDenied.detail')} />;
}
