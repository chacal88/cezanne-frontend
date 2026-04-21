import type { Capabilities } from '../../../lib/access-control';

export function authTokenErrorsStayPublic(capabilities: Pick<Capabilities, 'canEnterShell' | 'canUseAuthTokenFlow'>, tokenCanSubmit: boolean) {
  return tokenCanSubmit ? capabilities.canUseAuthTokenFlow : !capabilities.canEnterShell;
}
