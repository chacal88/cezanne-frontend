import type { AccessContext } from '../../../lib/access-control';
import { ensureCorrelationId } from '../../../lib/observability';

export type AuthTokenState = 'valid' | 'invalid' | 'expired' | 'used' | 'inaccessible';
export type AuthRouteStateKind =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'submitting'
  | 'succeeded'
  | 'failed'
  | 'session-bootstrapping'
  | 'session-ready'
  | 'session-expired'
  | 'logged-out';
export type AuthCallbackOutcome = 'callback-error' | 'callback-exchanging' | 'callback-succeeded' | 'callback-failed';
export type AuthProviderFamily = 'cezanne' | 'saml';
export type AuthAction = 'open' | 'submit' | 'callback' | 'bootstrap' | 'logout' | 'session-expired';
export type LoginPersona = 'hc-admin' | 'hc-user' | 'ra-admin' | 'ra-user' | 'sysadmin';

export type AuthRouteState = {
  kind: AuthRouteStateKind;
  message: string;
  landingTarget?: string;
};

export type AuthTokenRouteState = {
  tokenState: AuthTokenState;
  routeState: AuthRouteState;
  canSubmit: boolean;
};

export type AuthCallbackState = {
  providerFamily: AuthProviderFamily;
  outcome: AuthCallbackOutcome;
  routeState: AuthRouteState;
  hasSafeCode: boolean;
};

export type AuthSessionContext = {
  isAuthenticated: boolean;
  organizationType?: 'hc' | 'ra' | 'none';
  requestedTarget?: string;
  sessionExpired?: boolean;
};

export type AuthLoginAttempt = {
  email?: string;
  password?: string;
  code?: string;
  persona?: LoginPersona;
  requestedTarget?: string;
};

export type AuthLoginResult = {
  status: 'succeeded' | 'failed';
  routeState: AuthRouteState;
  accessContext?: AccessContext;
  landing?: ReturnType<typeof resolvePostAuthLanding>;
  token?: string;
  userSnapshot?: unknown;
  errorKind?: string;
};

export type AuthTelemetryEvent = {
  name: 'auth_session_action';
  data: {
    routeFamily: 'auth';
    action: AuthAction;
    providerFamily?: AuthProviderFamily;
    outcome?: AuthRouteStateKind;
    tokenState?: AuthTokenState;
    callbackOutcome?: AuthCallbackOutcome;
    sessionOutcome?: 'session-ready' | 'session-expired' | 'logged-out' | 'public-entry';
    entryMode?: 'direct' | 'callback' | 'logout' | 'session-loss';
    fallbackKind?: 'dashboard' | 'platform-dashboard' | 'public-entry' | 'sanitized-return';
    correlationId: string;
  };
};

const unsafeTargetPrefixes = ['/integration/', '/chat/', '/surveys/', '/review-candidate/', '/interview-feedback/'];


const baseOrgEntitlements = ['seeCandidates', 'jobRequisition', 'seeFavorites', 'recruiters'];
const baseOrgSubscriptions = ['calendarIntegration', 'formsDocs', 'surveys', 'customFields', 'candidateTags', 'reviewRequests', 'interviewFeedback', 'inbox', 'rejectionReason'];

export function buildAccessContextForLoginPersona(persona: LoginPersona): AccessContext {
  if (persona === 'sysadmin') {
    return {
      isAuthenticated: true,
      organizationType: 'none',
      isAdmin: true,
      isSysAdmin: true,
      pivotEntitlements: [],
      subscriptionCapabilities: [],
      rolloutFlags: [],
    };
  }

  const organizationType = persona.startsWith('ra') ? 'ra' : 'hc';
  const isAdmin = persona.endsWith('admin');
  return {
    isAuthenticated: true,
    organizationType,
    isAdmin,
    isSysAdmin: false,
    pivotEntitlements: organizationType === 'hc' ? baseOrgEntitlements : ['recruiters'],
    subscriptionCapabilities: baseOrgSubscriptions,
    rolloutFlags: ['customFieldsBeta'],
  };
}

function isValidLoginEmail(email?: string): boolean {
  return typeof email === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
}

function isValidLoginPassword(password?: string): boolean {
  const normalized = typeof password === 'string' ? password.trim() : '';
  return normalized.length >= 6 && !normalized.toLowerCase().includes('fail');
}

export function resolveLoginAttempt(input: AuthLoginAttempt): AuthLoginResult {
  if (!isValidLoginEmail(input.email) || !isValidLoginPassword(input.password)) {
    return {
      status: 'failed',
      routeState: { kind: 'failed', message: 'Login failed. Check your credentials and try again.' },
    };
  }

  const accessContext = buildAccessContextForLoginPersona(input.persona ?? 'hc-admin');
  const landing = resolvePostAuthLanding({
    isAuthenticated: accessContext.isAuthenticated,
    organizationType: accessContext.organizationType,
    requestedTarget: input.requestedTarget,
  });

  return {
    status: 'succeeded',
    accessContext,
    landing,
    routeState: { kind: 'session-ready', message: 'Session is ready.', landingTarget: landing.target },
  };
}

export function resolveAuthTokenState(token?: string): AuthTokenState {
  const normalized = (token ?? '').toLowerCase();
  if (!normalized) return 'invalid';
  if (normalized.includes('expired')) return 'expired';
  if (normalized.includes('used')) return 'used';
  if (normalized.includes('locked') || normalized.includes('inaccessible')) return 'inaccessible';
  if (normalized.includes('invalid')) return 'invalid';
  return 'valid';
}

export function buildAuthTokenRouteState(token?: string): AuthTokenRouteState {
  const tokenState = resolveAuthTokenState(token);
  if (tokenState !== 'valid') {
    return {
      tokenState,
      canSubmit: false,
      routeState: {
        kind: 'failed',
        message: `Auth token flow is ${tokenState}.`,
      },
    };
  }

  return {
    tokenState,
    canSubmit: true,
    routeState: {
      kind: 'ready',
      message: 'Auth token flow is ready.',
    },
  };
}

export function parseAuthCallbackState(providerFamily: AuthProviderFamily, search: { code?: unknown; error?: unknown }): AuthCallbackState {
  const error = typeof search.error === 'string' && search.error.trim().length > 0;
  const hasSafeCode = typeof search.code === 'string' && search.code.trim().length > 0;

  if (error) {
    return {
      providerFamily,
      outcome: 'callback-error',
      hasSafeCode: false,
      routeState: { kind: 'failed', message: `${providerFamily} callback returned an error.` },
    };
  }

  if (!hasSafeCode) {
    return {
      providerFamily,
      outcome: 'callback-failed',
      hasSafeCode: false,
      routeState: { kind: 'failed', message: `${providerFamily} callback is missing an exchange code.` },
    };
  }

  return {
    providerFamily,
    outcome: 'callback-exchanging',
    hasSafeCode,
    routeState: { kind: 'session-bootstrapping', message: `${providerFamily} callback is exchanging safely.` },
  };
}

export function resolvePostAuthLanding(context: AuthSessionContext) {
  if (context.sessionExpired || !context.isAuthenticated) {
    return { sessionOutcome: 'session-expired' as const, target: '/', fallbackKind: 'public-entry' as const };
  }

  const requested = context.requestedTarget?.trim();
  const isSafeInternalTarget = requested?.startsWith('/') && !requested.startsWith('//') && !unsafeTargetPrefixes.some((prefix) => requested.startsWith(prefix));
  if (isSafeInternalTarget && requested !== '/') {
    return { sessionOutcome: 'session-ready' as const, target: requested, fallbackKind: 'sanitized-return' as const };
  }

  if (context.organizationType === 'none') {
    return { sessionOutcome: 'session-ready' as const, target: '/hiring-companies', fallbackKind: 'platform-dashboard' as const };
  }

  return { sessionOutcome: 'session-ready' as const, target: '/dashboard', fallbackKind: 'dashboard' as const };
}

export function resolveLogoutState(): AuthRouteState {
  return { kind: 'logged-out', message: 'Session has been cleared.', landingTarget: '/' };
}

export function buildAuthTelemetry(input: {
  action: AuthAction;
  providerFamily?: AuthProviderFamily;
  outcome?: AuthRouteStateKind;
  tokenState?: AuthTokenState;
  callbackOutcome?: AuthCallbackOutcome;
  sessionOutcome?: 'session-ready' | 'session-expired' | 'logged-out' | 'public-entry';
  entryMode?: 'direct' | 'callback' | 'logout' | 'session-loss';
  fallbackKind?: 'dashboard' | 'platform-dashboard' | 'public-entry' | 'sanitized-return';
}): AuthTelemetryEvent {
  return {
    name: 'auth_session_action',
    data: {
      routeFamily: 'auth',
      action: input.action,
      providerFamily: input.providerFamily,
      outcome: input.outcome,
      tokenState: input.tokenState,
      callbackOutcome: input.callbackOutcome,
      sessionOutcome: input.sessionOutcome,
      entryMode: input.entryMode,
      fallbackKind: input.fallbackKind,
      correlationId: ensureCorrelationId(),
    },
  };
}
