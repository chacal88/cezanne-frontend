import type { AccessContext } from '../../../lib/access-control';
import { authServiceGetJson, authServicePostJson, graphqlRequest, resolveAuthServiceBaseUrl, restApiGetJson, restApiPostJson } from '../../../lib/api-client';
import { resolvePostAuthLanding, type AuthLoginAttempt, type AuthLoginResult } from '../models';
import { clearLocalAuthSession, saveLocalAuthSession } from './local-session';

export type AuthLoginError =
  | 'activation-required'
  | 'sso-mandatory'
  | 'approval-required'
  | 'two-factor-required'
  | 'two-factor-failed'
  | 'setup-required'
  | 'invalid-credentials'
  | 'bootstrap-failed'
  | 'provider-error';

export type PublicAuthActionStatus = 'idle' | 'submitting' | 'succeeded' | 'failed';

export type AuthBootstrapUser = {
  id?: string | number;
  sys_admin?: boolean;
  hiring_companies?: Array<{ pivot?: Record<string, unknown>; current_subscription?: Record<string, unknown> }>;
  recruitment_agencies?: Array<{ pivot?: Record<string, unknown> }>;
  calendarIntegration?: unknown;
  featureFlags?: Record<string, unknown>;
  sms?: { included?: number };
  billingHidden?: unknown;
};

type AuthLoginResponse = { token?: string };
type AuthAuthenticateResponse = { user?: AuthBootstrapUser };
type AuthGraphqlResponse = {
  data?: {
    monolith?: {
      auth?: { calendarIntegration?: unknown };
      featureFlags?: Record<string, unknown>;
      userSettingsUiSession?: string;
    };
    billing?: { currentSubscriptionUsage?: { smsIncluded?: number; hidden?: boolean } };
  };
};

type ApiMessageResponse = { msg?: string; token?: string; user?: AuthBootstrapUser; is_hiring_company?: boolean; register?: string; company?: unknown };

type PublicAuthApiResult = {
  status: PublicAuthActionStatus;
  message: string;
  redirectTo?: string;
};

type RegisterInput = {
  organizationType: 'hiringCompany' | 'recruitmentAgency';
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  token?: string;
};

const sessionBootstrapQuery = `query AuthSessionBootstrap {
  monolith {
    auth { firstName calendarIntegration { provider email status statusMessage conference { provider profile status statusMessage } } }
    featureFlags { replaceCvs sourceReportsBeta smsBeta surveysBeta customFieldsBeta onboardBeta blindReviewBeta }
    userSettingsUiSession
  }
  billing { currentSubscriptionUsage { contractsUsed contractsIncluded contractSigner smsUsed smsIncluded hidden } }
}`;

export function resolveAuthBaseUrl(): string {
  return resolveAuthServiceBaseUrl();
}

export function mapAuthLoginError(error: unknown): AuthLoginError {
  if (typeof error === 'object' && error && 'payload' in error) return mapAuthLoginError((error as { payload?: unknown }).payload);
  const rawMessage = typeof error === 'string'
    ? error
    : typeof error === 'object' && error
      ? String((error as { error?: unknown; message?: unknown }).error ?? (error as { message?: unknown }).message ?? '')
      : '';
  const message = rawMessage.toLowerCase();
  if (message.includes('need to be activated')) return 'activation-required';
  if (message.includes('cezanne-sso-mandatory')) return 'sso-mandatory';
  if (message.includes('need to be approved')) return 'approval-required';
  if (message.includes('2fa code required')) return 'two-factor-required';
  if (message.includes('2fa code failed')) return 'two-factor-failed';
  if (message.includes('setup required')) return 'setup-required';
  if (message.includes('token not found') || message.includes('provider') || message.includes('callback')) return 'provider-error';
  return 'invalid-credentials';
}

function enabled(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}

function compact(values: Array<string | undefined>): string[] {
  return values.filter((item): item is string => Boolean(item));
}

export function normalizeAuthUserToAccessContext(user: AuthBootstrapUser): AccessContext {
  if (user.sys_admin) {
    return { isAuthenticated: true, organizationType: 'none', isAdmin: true, isSysAdmin: true, pivotEntitlements: [], subscriptionCapabilities: [], rolloutFlags: [] };
  }

  const hiringCompany = user.hiring_companies?.[0];
  const recruitmentAgency = user.recruitment_agencies?.[0];
  const organizationType = hiringCompany ? 'hc' : recruitmentAgency ? 'ra' : 'none';
  const pivot = (hiringCompany?.pivot ?? recruitmentAgency?.pivot ?? {}) as Record<string, unknown>;
  const subscription = (hiringCompany?.current_subscription ?? {}) as Record<string, unknown>;
  const featureFlags = user.featureFlags ?? {};

  return {
    isAuthenticated: true,
    organizationType,
    isAdmin: enabled(pivot.is_admin) || enabled(pivot.is_super_admin),
    isSysAdmin: false,
    pivotEntitlements: compact([
      enabled(pivot.candidates) ? 'seeCandidates' : undefined,
      enabled(pivot.job_requisition) ? 'jobRequisition' : undefined,
      enabled(pivot.recruiters) ? 'recruiters' : undefined,
      enabled(pivot.favorites) ? 'seeFavorites' : undefined,
    ]),
    subscriptionCapabilities: compact([
      user.calendarIntegration ? 'calendarIntegration' : undefined,
      enabled(pivot.forms_documents) || enabled(subscription.contracts) || enabled(pivot.contracts) ? 'formsDocs' : undefined,
      enabled(featureFlags.surveysBeta) ? 'surveys' : undefined,
      enabled(featureFlags.customFieldsBeta) ? 'customFields' : undefined,
      enabled(featureFlags.blindReviewBeta) ? 'reviewRequests' : undefined,
      'inbox',
      'interviewFeedback',
      'candidateTags',
      'rejectionReason',
    ]),
    rolloutFlags: compact([
      enabled(featureFlags.customFieldsBeta) ? 'customFieldsBeta' : undefined,
      enabled(user.billingHidden) ? 'billingHidden' : undefined,
    ]),
  };
}

function buildLocalValidationFailure(input: AuthLoginAttempt): AuthLoginResult | null {
  const email = input.email?.trim() ?? '';
  const password = input.password ?? '';
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !password) {
    return { status: 'failed', routeState: { kind: 'failed', message: 'Login failed. Check your credentials and try again.' }, errorKind: 'invalid-credentials' };
  }
  return null;
}

export async function bootstrapSessionFromToken(token: string, requestedTarget?: string): Promise<AuthLoginResult> {
  const authResponse = await restApiGetJson<AuthAuthenticateResponse>('/authenticate', { token });
  const graphqlResponse = await graphqlRequest<AuthGraphqlResponse>(sessionBootstrapQuery, undefined, { token, language: 'en' });

  if (!authResponse.user) {
    return { status: 'failed', routeState: { kind: 'failed', message: 'Auth bootstrap did not return a user.' }, errorKind: 'bootstrap-failed' };
  }

  const user: AuthBootstrapUser = {
    ...authResponse.user,
    calendarIntegration: graphqlResponse.data?.monolith?.auth?.calendarIntegration,
    featureFlags: graphqlResponse.data?.monolith?.featureFlags,
    sms: { included: graphqlResponse.data?.billing?.currentSubscriptionUsage?.smsIncluded ?? 0 },
    billingHidden: graphqlResponse.data?.billing?.currentSubscriptionUsage?.hidden,
  };
  const accessContext = normalizeAuthUserToAccessContext(user);
  const landing = resolvePostAuthLanding({ isAuthenticated: true, organizationType: accessContext.organizationType, requestedTarget });
  saveLocalAuthSession(accessContext, landing.target, token, user);

  return {
    status: 'succeeded',
    routeState: { kind: 'session-ready', message: 'Session is ready.', landingTarget: landing.target },
    accessContext,
    landing,
    token,
    userSnapshot: user,
  };
}

export async function loginWithAuthApi(input: AuthLoginAttempt): Promise<AuthLoginResult> {
  const localValidationFailure = buildLocalValidationFailure(input);
  if (localValidationFailure) return localValidationFailure;

  try {
    const loginResponse = await authServicePostJson<AuthLoginResponse>('/login', { email: input.email, password: input.password, code: input.code });

    if (!loginResponse.token) {
      return { status: 'failed', routeState: { kind: 'failed', message: 'Auth did not return a token.' }, errorKind: 'invalid-credentials' };
    }

    return bootstrapSessionFromToken(loginResponse.token, input.requestedTarget);
  } catch (error) {
    const errorKind = mapAuthLoginError((error as { error?: unknown; message?: unknown })?.error ?? (error as { message?: unknown })?.message ?? error);
    return { status: 'failed', routeState: { kind: 'failed', message: `Login failed: ${errorKind}.` }, errorKind };
  }
}

export async function completeCezanneCallback(code: string, requestedTarget?: string): Promise<AuthLoginResult> {
  try {
    const response = await authServiceGetJson<AuthLoginResponse>(`/login/cezanne/callback?json=1&code=${encodeURIComponent(code)}`);
    if (!response.token) return { status: 'failed', routeState: { kind: 'failed', message: 'Cezanne callback did not return a token.' }, errorKind: 'bootstrap-failed' };
    const result = await bootstrapSessionFromToken(response.token, requestedTarget);
    if (result.status === 'failed') clearLocalAuthSession();
    return result;
  } catch (error) {
    const errorKind = mapAuthLoginError(error);
    return { status: 'failed', routeState: { kind: 'failed', message: `Cezanne callback failed: ${errorKind}.` }, errorKind };
  }
}

export async function completeSamlCallback(code: string, requestedTarget?: string): Promise<AuthLoginResult> {
  try {
    const response = await authServiceGetJson<AuthLoginResponse>(`/login/saml/callback?code=${encodeURIComponent(code)}`);
    if (!response.token) return { status: 'failed', routeState: { kind: 'failed', message: 'SAML callback did not return a token.' }, errorKind: 'bootstrap-failed' };
    const result = await bootstrapSessionFromToken(response.token, requestedTarget);
    if (result.status === 'failed') clearLocalAuthSession();
    return result;
  } catch (error) {
    const errorKind = mapAuthLoginError(error);
    return { status: 'failed', routeState: { kind: 'failed', message: `SAML callback failed: ${errorKind}.` }, errorKind };
  }
}

export async function requestPasswordResetEmail(email: string): Promise<PublicAuthApiResult> {
  const response = await restApiPostJson<ApiMessageResponse>('/user/forgot-password', { email });
  switch (response.msg) {
    case 'mail_sent':
      return { status: 'succeeded', message: `A verification email has been sent to ${email}. Please check your inbox or spam folder to reset password.`, redirectTo: '/' };
    case 'mail_not_found':
      return { status: 'failed', message: 'Email not found.' };
    default:
      return { status: 'failed', message: 'Failed to send, please try again or contact the system admin on support@occupop.com' };
  }
}

export async function validateResetPasswordToken(token: string): Promise<PublicAuthApiResult> {
  const response = await restApiGetJson<ApiMessageResponse>(`/user/valid-token?token=${encodeURIComponent(token)}`);
  return response.msg === 'token_not_found'
    ? { status: 'failed', message: 'This reset token is invalid.', redirectTo: '/' }
    : { status: 'succeeded', message: 'Reset token is valid.' };
}

export async function resetPassword(input: { token: string; password: string; passwordConfirmation: string }): Promise<PublicAuthApiResult> {
  const response = await restApiPostJson<ApiMessageResponse>('/user/reset-password', {
    token: input.token,
    password: input.password,
    password_confirmation: input.passwordConfirmation,
  });
  switch (response.msg) {
    case 'token_accepted':
      return { status: 'succeeded', message: 'Password changed successfully.', redirectTo: '/' };
    case 'token_expired':
      return { status: 'failed', message: 'This reset token is expired.', redirectTo: '/' };
    case 'token_used':
      return { status: 'failed', message: 'This reset token was already used.', redirectTo: '/' };
    case 'token_not_found':
    case 'token_invalid':
      return { status: 'failed', message: 'This reset token is invalid.', redirectTo: '/' };
    default:
      return { status: 'failed', message: 'Password could not be changed.' };
  }
}

export async function confirmRegistrationToken(token: string): Promise<AuthLoginResult | PublicAuthApiResult> {
  const response = await restApiGetJson<ApiMessageResponse>(`/user/first-access?token=${encodeURIComponent(token)}`);
  if (response.msg === 'token_valid' && response.token) {
    const result = await bootstrapSessionFromToken(response.token);
    if (result.status === 'succeeded') return result;
    clearLocalAuthSession();
    return { status: 'failed', message: 'Registration was confirmed, but the session could not be started. Try logging in.', redirectTo: '/' };
  }
  if (response.msg === 'token_valid' || response.msg === 'approval_pending') {
    return { status: 'succeeded', message: 'Registration confirmed. Your account is waiting for approval.', redirectTo: '/' };
  }
  if (response.msg === 'bootstrap_failed') {
    clearLocalAuthSession();
    return { status: 'failed', message: 'Registration was confirmed, but the session could not be started. Try logging in.', redirectTo: '/' };
  }
  if (response.msg === 'token_expired') return { status: 'failed', message: 'This registration token is expired.', redirectTo: '/' };
  return { status: 'failed', message: 'This registration token is invalid.', redirectTo: '/' };
}

export async function registerAccount(input: RegisterInput): Promise<PublicAuthApiResult> {
  const payload = {
    name: input.companyName,
    user: {
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      password: input.password,
      password_confirmation: input.passwordConfirmation,
      token: input.token,
    },
  };

  if (input.token && input.token !== 'null') {
    const response = await restApiPostJson<ApiMessageResponse>('/invitation', payload);
    return response.msg === 'token_invalid' || response.msg === 'token_expired'
      ? { status: 'failed', message: 'This invitation token is invalid.', redirectTo: '/' }
      : { status: 'succeeded', message: 'Registration completed.', redirectTo: '/' };
  }

  const endpoint = input.organizationType === 'hiringCompany' ? '/hiring_company' : '/recruitment_agency';
  const response = await restApiPostJson<ApiMessageResponse>(endpoint, payload);
  return response.register === 'ok'
    ? { status: 'succeeded', message: 'Registration completed. Check your email to continue.', redirectTo: '/' }
    : { status: 'failed', message: 'Registration could not be completed.' };
}

export const authApiAdapter = {
  login: loginWithAuthApi,
};
