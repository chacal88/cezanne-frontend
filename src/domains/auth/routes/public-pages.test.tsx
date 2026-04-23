import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { renderWithProviders } from '../../../testing/render';
import { publicAccessContext } from '../../../lib/access-control';
import { foundationAuthAdapter } from '../api';
import { CezanneAuthPage, CezanneCallbackPage, ConfirmRegistrationPage, ForgotPasswordPage, InviteTokenPage, LogoutPage, PublicHomePage, RegisterPage, ResetPasswordPage, SamlCallbackPage, SessionLossPage, __setAuthRedirectForTest } from './public-pages';

describe('PublicHomePage login flow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    __setAuthRedirectForTest();
    vi.restoreAllMocks();
  });

  it('renders a public login flow and resolves successful login to dashboard', async () => {
    renderWithProviders(<PublicHomePage authAdapter={foundationAuthAdapter} autoRedirect={false} />, { accessContext: publicAccessContext });

    expect(screen.getByTestId('auth-route-state')).toHaveTextContent('ready');
    await userEvent.type(screen.getByTestId('auth-login-email'), 'admin@example.test');
    await userEvent.type(screen.getByTestId('auth-login-password'), 'password');
    await userEvent.click(screen.getByTestId('auth-login-submit'));

    expect(screen.getByTestId('auth-route-state')).toHaveTextContent('session-ready');
    expect(screen.getByTestId('auth-landing-target')).toHaveTextContent('/dashboard');
    expect(screen.getByTestId('auth-login-continue')).toHaveAttribute('href', '/dashboard');
    expect(JSON.stringify(window.localStorage)).not.toContain('password');
    expect(JSON.stringify(window.localStorage)).not.toContain('admin@example.test');
    expect(screen.queryByTestId('auth-login-persona')).not.toBeInTheDocument();
  });

  it('keeps failed login in the public auth shell', async () => {
    renderWithProviders(<PublicHomePage authAdapter={foundationAuthAdapter} autoRedirect={false} />, { accessContext: publicAccessContext });

    await userEvent.clear(screen.getByTestId('auth-login-email'));
    await userEvent.type(screen.getByTestId('auth-login-email'), 'bad@example.test');
    await userEvent.clear(screen.getByTestId('auth-login-password'));
    await userEvent.type(screen.getByTestId('auth-login-password'), 'failpass');
    await userEvent.click(screen.getByTestId('auth-login-submit'));

    expect(screen.getByTestId('auth-route-state')).toHaveTextContent('failed');
    expect(screen.queryByTestId('auth-login-continue')).not.toBeInTheDocument();
  });

  it.each([
    ['submitting'],
    ['two-factor-required'],
    ['two-factor-failed'],
    ['sso-mandatory'],
    ['activation-required'],
    ['setup-required'],
    ['bootstrap-failure'],
    ['redirecting'],
  ])('exposes the %s login visual state without backend contracts', (visualState) => {
    window.history.pushState({}, '', `/?visualState=${visualState}`);
    renderWithProviders(<PublicHomePage authAdapter={foundationAuthAdapter} autoRedirect={false} />, { accessContext: publicAccessContext });

    expect(screen.getByTestId('auth-route-state')).toHaveTextContent(visualState);
    if (visualState.startsWith('two-factor')) expect(screen.getByTestId('auth-login-code')).toBeInTheDocument();
    if (visualState === 'redirecting') expect(screen.getByTestId('auth-landing-target')).toHaveTextContent('/dashboard');
  });

  it.each([
    ['missing'],
    ['invalid'],
    ['expired'],
    ['valid'],
    ['success'],
    ['failure'],
    ['retry'],
    ['pending-approval'],
    ['bootstrap-failure'],
  ])('exposes the %s token-flow visual state without backend contracts', (visualState) => {
    const tokenPages = [
      <ConfirmRegistrationPage key="confirm" token="token" />,
      <ResetPasswordPage key="reset" token="token" />,
      <RegisterPage key="register" token="token" />,
      <ForgotPasswordPage key="forgot" />,
      <InviteTokenPage key="invite" token="token" />,
    ];

    for (const page of tokenPages) {
      window.history.pushState({}, '', `/token-test?visualState=${visualState}`);
      renderWithProviders(page, { accessContext: publicAccessContext });
      expect(screen.getByTestId('auth-route-state')).toHaveTextContent(visualState);
      cleanup();
    }
  });

  it.each([
    ['launch'],
    ['missing-tenant'],
    ['missing-code'],
    ['provider-error'],
    ['exchanging'],
    ['exchange-failure'],
    ['bootstrap-failure'],
    ['success'],
  ])('exposes the %s SSO/callback visual state without provider payloads', (visualState) => {
    const callbackPages = [
      <CezanneAuthPage key="cezanne-launch" tenantGuid="tenant-1" />,
      <CezanneCallbackPage key="cezanne-callback" />,
      <SamlCallbackPage key="saml" />,
    ];

    for (const page of callbackPages) {
      window.history.pushState({}, '', `/auth-test?visualState=${visualState}`);
      renderWithProviders(page, { accessContext: publicAccessContext });
      expect(screen.getByTestId('auth-route-state')).toHaveTextContent(visualState);
      expect(document.body.textContent).not.toContain('auth_code');
      cleanup();
    }
  });

  it('launches provider sign-in through the auth service routes', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderWithProviders(<PublicHomePage authAdapter={foundationAuthAdapter} autoRedirect={false} />, { accessContext: publicAccessContext });

    await userEvent.click(screen.getByRole('button', { name: /google/i }));
    await userEvent.click(screen.getByRole('button', { name: /microsoft/i }));

    expect(openSpy).toHaveBeenNthCalledWith(1, expect.stringMatching(/:3060\/auth\/login\/google$/), 'popup', expect.any(String));
    expect(openSpy).toHaveBeenNthCalledWith(2, expect.stringMatching(/:3060\/auth\/login\/microsoft$/), 'popup', expect.any(String));
  });

  it('keeps forgot-password navigation inside the public auth surface', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ msg: 'mail_sent' }), { status: 200 }));
    renderWithProviders(<ForgotPasswordPage />, { accessContext: publicAccessContext });

    await userEvent.type(screen.getByPlaceholderText('Email address'), 'person@example.test');
    await userEvent.click(screen.getByRole('button', { name: /send email/i }));

    expect(await screen.findByTestId('auth-form-message')).toHaveTextContent('Password reset email sent.');
    expect(screen.getByRole('link', { name: /go to login/i })).toHaveAttribute('href', '/');
  });

  it('renders sign-up and token confirmation as navigable public routes', async () => {
    renderWithProviders(<RegisterPage />, { accessContext: publicAccessContext });

    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to login/i })).toHaveAttribute('href', '/');

    renderWithProviders(<ConfirmRegistrationPage />, { accessContext: publicAccessContext });

    expect(await screen.findByText('Registration token is missing.')).toBeInTheDocument();
  });

  it('redirects explicit logout while keeping session loss visible', () => {
    const redirect = vi.fn();
    __setAuthRedirectForTest(redirect);
    renderWithProviders(<LogoutPage />, { accessContext: publicAccessContext });

    expect(redirect).toHaveBeenCalledWith('/');
    expect(screen.queryByTestId('auth-route-state')).not.toBeInTheDocument();
    cleanup();
    __setAuthRedirectForTest();

    renderWithProviders(<SessionLossPage />, { accessContext: publicAccessContext });

    expect(screen.getByTestId('auth-route-state')).toHaveTextContent('session-expired');
    expect(screen.getByTestId('auth-landing-target')).toHaveTextContent('/');
  });
});
