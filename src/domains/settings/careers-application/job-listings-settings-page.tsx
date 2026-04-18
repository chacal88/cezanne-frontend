import { useEffect, useMemo } from 'react';
import { useCapabilities } from '../../../lib/access-control';
import { evaluateJobListingsAccess } from './support/access';
import { buildJobListingsListView } from './support/adapters';
import { buildJobListingEditorPath } from './support/routing';
import type { JobListingsRouteState } from './support/models';
import { trackCareersApplicationRouteOpen, trackCareersApplicationRouteResolution } from './support/telemetry';

export function JobListingsSettingsPage({ routeState }: { routeState: JobListingsRouteState }) {
  const capabilities = useCapabilities();
  const view = useMemo(() => buildJobListingsListView(routeState), [routeState]);
  const decision = evaluateJobListingsAccess(capabilities, {
    brand: routeState.brand,
    featureEnabled: true,
    publishReady: true,
  });

  useEffect(() => {
    trackCareersApplicationRouteOpen('settings.careers-application.job-listings');
    trackCareersApplicationRouteResolution('settings.careers-application.job-listings', routeState);
  }, [routeState]);

  return (
    <section>
      <h1>Job listings settings</h1>
      <dl>
        <dt>Tab</dt>
        <dd data-testid="job-listings-tab">{view.selectedTab}</dd>
        <dt>Brand</dt>
        <dd data-testid="job-listings-brand">{view.brand ?? '—'}</dd>
        <dt>Readiness</dt>
        <dd data-testid="job-listings-readiness">{decision.readiness}</dd>
      </dl>
      <a
        href={buildJobListingEditorPath({ mode: 'create', brand: routeState.brand, returnTab: routeState.tab })}
        data-testid="job-listings-create-link"
      >
        Create listing
      </a>
      <ul>
        {view.items.map((item) => (
          <li key={item.uuid}>
            <span data-testid={`job-listing-title-${item.uuid}`}>{item.title}</span>{' '}
            <a
              href={buildJobListingEditorPath({ mode: 'edit', uuid: item.uuid, brand: routeState.brand ?? item.brand, returnTab: routeState.tab })}
              data-testid={`job-listings-edit-link-${item.uuid}`}
            >
              Edit
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

