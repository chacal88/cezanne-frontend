import { buildAuthTokenRouteState, parseAuthCallbackState, resolveLogoutState, resolvePostAuthLanding, type AuthProviderFamily, type AuthSessionContext } from '../models';

export const foundationAuthAdapter = {
  evaluateToken: buildAuthTokenRouteState,
  parseCallback: parseAuthCallbackState,
  resolveLanding: resolvePostAuthLanding,
  logout: resolveLogoutState,
};

export type FoundationAuthAdapter = typeof foundationAuthAdapter;
export type { AuthProviderFamily, AuthSessionContext };
