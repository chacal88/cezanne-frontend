import { useEffect, useState } from 'react';
import { useCapabilities } from '../../../lib/access-control';
import { evaluateJobListingsAccess } from './support/access';
import { toPublicJobListingContract } from './support/adapters';
import { getJobListingDraft } from './support/store';
import type { JobListingEditorRouteState } from './support/models';
import { buildJobListingReturnTarget } from './support/routing';
import { runJobListingPublishWorkflow, runJobListingSaveWorkflow } from './support/workflow';
import { trackCareersApplicationRouteOpen, trackCareersApplicationRouteResolution, trackCareersApplicationWorkflow } from './support/telemetry';

export function JobListingEditorPage({ routeState }: { routeState: JobListingEditorRouteState }) {
  const capabilities = useCapabilities();
  const [draft, setDraft] = useState(() => {
    const initial = getJobListingDraft(routeState.uuid);
    return routeState.brand ? { ...initial, brand: routeState.brand } : initial;
  });
  const [saveState, setSaveState] = useState('idle');
  const [publishState, setPublishState] = useState('idle');
  const [uuid, setUuid] = useState<string | undefined>(routeState.uuid);

  useEffect(() => {
    const initial = getJobListingDraft(routeState.uuid);
    setDraft(routeState.brand ? { ...initial, brand: routeState.brand } : initial);
    setUuid(routeState.uuid);
  }, [routeState.brand, routeState.uuid]);

  useEffect(() => {
    trackCareersApplicationRouteOpen('settings.careers-application.job-listings-editor');
    trackCareersApplicationRouteResolution('settings.careers-application.job-listings-editor', routeState);
  }, [routeState]);

  const decision = evaluateJobListingsAccess(capabilities, {
    brand: draft.brand,
    featureEnabled: true,
    publishReady: draft.publishReady,
    listingExists: routeState.mode === 'create' ? true : Boolean(routeState.uuid),
  });

  async function handleSave() {
    trackCareersApplicationWorkflow('save_started', { routeId: 'settings.careers-application.job-listings-editor', mode: routeState.mode });
    const result = await runJobListingSaveWorkflow({ ...draft, uuid });
    setUuid(result.uuid);
    setSaveState(result.status);
    trackCareersApplicationWorkflow('save_completed', { routeId: 'settings.careers-application.job-listings-editor', uuid: result.uuid });
    trackCareersApplicationWorkflow('public_contract_updated', { routeId: 'settings.careers-application.job-listings-editor', uuid: result.publicContract.uuid });
  }

  async function handlePublish() {
    if (!uuid) return;
    trackCareersApplicationWorkflow('publish_started', { routeId: 'settings.careers-application.job-listings-editor', uuid });
    const result = await runJobListingPublishWorkflow(uuid);
    setPublishState(result.status);
    if (result.status === 'completed') {
      setDraft((current) => ({ ...current, status: 'published' }));
      trackCareersApplicationWorkflow('publish_completed', { routeId: 'settings.careers-application.job-listings-editor', uuid });
      trackCareersApplicationWorkflow('public_contract_updated', { routeId: 'settings.careers-application.job-listings-editor', uuid: result.publicContract.uuid });
    }
  }

  const returnTarget = buildJobListingReturnTarget(routeState);
  const publicContract = uuid ? toPublicJobListingContract({ ...draft, uuid }) : null;

  return (
    <section>
      <h1>{routeState.mode === 'create' ? 'Create listing' : 'Edit listing'}</h1>
      <dl>
        <dt>Mode</dt>
        <dd data-testid="job-listing-editor-mode">{routeState.mode}</dd>
        <dt>Brand</dt>
        <dd data-testid="job-listing-editor-brand">{draft.brand}</dd>
        <dt>Readiness</dt>
        <dd data-testid="job-listing-editor-readiness">{decision.readiness}</dd>
      </dl>
      <label>
        Title
        <input data-testid="job-listing-editor-title" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
      </label>
      <label>
        Description
        <textarea data-testid="job-listing-editor-description" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
      </label>
      <label>
        <input
          type="checkbox"
          checked={draft.publishReady}
          onChange={(event) => setDraft((current) => ({ ...current, publishReady: event.target.checked }))}
        />
        Publish ready
      </label>
      <button type="button" onClick={handleSave} data-testid="job-listing-editor-save-button">
        Save listing
      </button>
      <button type="button" onClick={handlePublish} data-testid="job-listing-editor-publish-button">
        Publish listing
      </button>
      <a href={returnTarget} data-testid="job-listing-editor-cancel-link">
        Back to list
      </a>
      <p data-testid="job-listing-editor-save-state">{saveState}</p>
      <p data-testid="job-listing-editor-publish-state">{publishState}</p>
      <pre data-testid="job-listing-editor-public-contract">{publicContract ? JSON.stringify(publicContract, null, 2) : 'null'}</pre>
    </section>
  );
}

