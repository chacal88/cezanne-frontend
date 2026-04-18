import { ensureCorrelationId, type ObservabilityPort } from '../../../../lib/observability';
import { observability as defaultObservability } from '../../../../app/observability';

function track(observability: ObservabilityPort, name: string, data: Record<string, unknown>) {
  observability.telemetry.track({
    name: `careers_application_${name}`,
    data: {
      ...data,
      correlationId: ensureCorrelationId(),
    },
  });
}

export function trackCareersApplicationRouteOpen(routeId: string, observability: ObservabilityPort = defaultObservability) {
  track(observability, 'route_open', { routeId });
}

export function trackCareersApplicationRouteResolution(routeId: string, resolution: Record<string, unknown>, observability: ObservabilityPort = defaultObservability) {
  track(observability, 'route_resolution', { routeId, ...resolution });
}

export function trackCareersApplicationWorkflow(
  lifecycle: 'save_started' | 'save_completed' | 'publish_started' | 'publish_completed' | 'public_contract_updated',
  data: Record<string, unknown>,
  observability: ObservabilityPort = defaultObservability,
) {
  track(observability, lifecycle, data);
}

