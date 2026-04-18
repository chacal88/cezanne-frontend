import { matchRouteMetadata } from './route-metadata';

function interpolateParentTarget(template: string, params: Record<string, string>) {
  return template.replace(/\$([A-Za-z0-9_]+)/g, (_, key: string) => params[key] ?? '');
}

export function buildCloseTarget(pathname: string, fallback = '/dashboard', explicitParent?: string) {
  if (explicitParent) return explicitParent;

  const match = matchRouteMetadata(pathname);
  if (!match?.metadata.parentTarget) return fallback;
  return interpolateParentTarget(match.metadata.parentTarget, match.params);
}

export function buildCancelTarget(pathname: string, fallback = '/dashboard', explicitParent?: string) {
  return buildCloseTarget(pathname, fallback, explicitParent);
}

export function buildSuccessTarget(pathname: string, fallback = '/dashboard', explicitParent?: string) {
  return buildCloseTarget(pathname, fallback, explicitParent);
}
