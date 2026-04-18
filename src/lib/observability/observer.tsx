import { useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';
import type { ObservabilityPort } from './ports';
import { buildTelemetryContext } from './context';

export function RouteTelemetryObserver({ observability }: { observability: ObservabilityPort }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const context = buildTelemetryContext(pathname);
    observability.telemetry.setContext(context);
    if (context.routeId && context.routeClass) {
      observability.rum.page({ routeId: context.routeId, routeClass: context.routeClass });
      observability.telemetry.track({ name: 'route_page_view', data: context });
    }
  }, [observability, pathname]);

  return null;
}
