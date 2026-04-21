import { useEffect, useState } from 'react';
import { useCapabilities } from '../../../lib/access-control';
import { evaluateCareersPageAccess } from './support/access';
import { getCareersPageConfig } from './support/store';
import { runCareersPageSaveWorkflow } from './support/workflow';
import { toPublicCareersPageContract } from './support/adapters';
import { trackCareersApplicationRouteOpen, trackCareersApplicationWorkflow } from './support/telemetry';
import { buildCareersPageCloseoutSnapshot } from './support/closeout';

export function CareersPageSettingsPage() {
  const capabilities = useCapabilities();
  const [config, setConfig] = useState(() => getCareersPageConfig());
  const [saveState, setSaveState] = useState<string>('idle');
  const [requestHeaders, setRequestHeaders] = useState<Record<string, string>>({});
  const decision = evaluateCareersPageAccess(capabilities, { brand: config.brand, featureEnabled: config.featureEnabled });
  const closeout = buildCareersPageCloseoutSnapshot(decision, {
    saveStatus: saveState === 'completed' ? 'completed' : saveState === 'failed' ? 'failed' : 'idle',
    publicReflectionIntent: saveState === 'completed' ? 'pending' : 'not-requested',
  });

  useEffect(() => {
    trackCareersApplicationRouteOpen('settings.careers-application.careers-page');
  }, []);

  async function handleSave() {
    trackCareersApplicationWorkflow('save_started', { routeId: 'settings.careers-application.careers-page' });
    const result = await runCareersPageSaveWorkflow(config);
    setSaveState(result.status);
    setRequestHeaders(result.requestHeaders);
    trackCareersApplicationWorkflow('save_completed', { routeId: 'settings.careers-application.careers-page' });
    trackCareersApplicationWorkflow('public_contract_updated', { routeId: 'settings.careers-application.careers-page', brand: result.publicContract.brandSlug });
  }

  return (
    <section>
      <h1>Careers page settings</h1>
      <p data-testid="careers-page-readiness">{decision.readiness}</p>
      <p data-testid="careers-page-closeout-state">{closeout.state}</p>
      <label>
        Company
        <input value={config.companyName} onChange={(event) => setConfig((current) => ({ ...current, companyName: event.target.value }))} />
      </label>
      <label>
        Brand
        <input data-testid="careers-page-brand" value={config.brand} onChange={(event) => setConfig((current) => ({ ...current, brand: event.target.value }))} />
      </label>
      <label>
        Headline
        <input data-testid="careers-page-headline" value={config.headline} onChange={(event) => setConfig((current) => ({ ...current, headline: event.target.value }))} />
      </label>
      <label>
        <input
          type="checkbox"
          checked={config.featuredJobsEnabled}
          onChange={(event) => setConfig((current) => ({ ...current, featuredJobsEnabled: event.target.checked }))}
        />
        Featured jobs enabled
      </label>
      <button type="button" onClick={handleSave} data-testid="careers-page-save-button">
        Save careers page
      </button>
      <p data-testid="careers-page-save-state">{saveState}</p>
      <pre data-testid="careers-page-public-contract">{JSON.stringify(toPublicCareersPageContract(config), null, 2)}</pre>
      <pre data-testid="careers-page-request-headers">{JSON.stringify(requestHeaders, null, 2)}</pre>
    </section>
  );
}

