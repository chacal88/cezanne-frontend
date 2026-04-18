import { getRouteMetadata } from '../routing';
import { ensureCorrelationId } from './correlation';
import type { TelemetryContext } from './ports';

export function buildTelemetryContext(pathname: string): TelemetryContext {
  const metadata = getRouteMetadata(pathname);
  return {
    routeId: metadata.routeId,
    routeClass: metadata.routeClass,
    domain: metadata.domain,
    module: metadata.module,
    correlationId: ensureCorrelationId(),
  };
}
