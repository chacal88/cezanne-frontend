import { buildAuthTokenRouteState, parseAuthCallbackState, resolveLoginAttempt, resolveLogoutState, resolvePostAuthLanding, type AuthLoginAttempt, type AuthLoginResult, type AuthProviderFamily, type AuthSessionContext } from '../models';

export const foundationAuthAdapter = {
  evaluateToken: buildAuthTokenRouteState,
  parseCallback: parseAuthCallbackState,
  resolveLanding: resolvePostAuthLanding,
  login: resolveLoginAttempt,
  logout: resolveLogoutState,
};

export type AuthLoginAdapter = { login(input: AuthLoginAttempt): AuthLoginResult | Promise<AuthLoginResult> };
export type { AuthProviderFamily, AuthSessionContext };
