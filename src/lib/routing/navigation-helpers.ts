import { getRouteMetadata } from './route-metadata';

export function buildCloseTarget(pathname: string, fallback = '/dashboard') {
  const metadata = getRouteMetadata(pathname);
  return metadata.parentTarget ?? fallback;
}

export function buildCancelTarget(pathname: string, fallback = '/dashboard') {
  return buildCloseTarget(pathname, fallback);
}

export function buildSuccessTarget(pathname: string, fallback = '/dashboard') {
  return buildCloseTarget(pathname, fallback);
}
