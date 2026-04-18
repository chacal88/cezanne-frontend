import { legacyTokenizedChatEndpoints, type ExternalChatRouteParams } from './models';

export function buildExternalChatPath(params: ExternalChatRouteParams) {
  return `/chat/${params.token}/${params.userId}`;
}

export function buildExternalChatBootstrapEndpoint(params: ExternalChatRouteParams) {
  return legacyTokenizedChatEndpoints.bootstrap.replace('{token}', params.token).replace('{user_id}', params.userId);
}
