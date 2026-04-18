import { useEffect, useMemo, useState } from 'react';
import { useCapabilities } from '../../../lib/access-control';
import { evaluateApplicationPageAccess } from './support/access';
import { normalizeApplicationPageConfig, toPublicApplicationPageContract } from './support/adapters';
import { getApplicationPageConfig } from './support/store';
import type { ApplicationPageRouteState } from './support/models';
import { runApplicationPageSaveWorkflow } from './support/workflow';
import { trackCareersApplicationRouteOpen, trackCareersApplicationRouteResolution, trackCareersApplicationWorkflow } from './support/telemetry';

export function ApplicationPageSettingsPage({ routeState }: { routeState: ApplicationPageRouteState }) {
  const capabilities = useCapabilities();
  const [config, setConfig] = useState(() => normalizeApplicationPageConfig(getApplicationPageConfig(routeState.settingsId), routeState));
  const [saveState, setSaveState] = useState('idle');
  const [requestHeaders, setRequestHeaders] = useState<Record<string, string>>({});

  useEffect(() => {
    setConfig(normalizeApplicationPageConfig(getApplicationPageConfig(routeState.settingsId), routeState));
  }, [routeState]);

  useEffect(() => {
    trackCareersApplicationRouteOpen('settings.careers-application.application-page');
    trackCareersApplicationRouteResolution('settings.careers-application.application-page', routeState);
  }, [routeState]);

  const decision = useMemo(
    () => evaluateApplicationPageAccess(capabilities, { settingsId: routeState.settingsId, featureEnabled: config.featureEnabled }),
    [capabilities, config.featureEnabled, routeState.settingsId],
  );

  async function handleSave() {
    trackCareersApplicationWorkflow('save_started', { routeId: 'settings.careers-application.application-page', section: config.section, subsection: config.subsection });
    const result = await runApplicationPageSaveWorkflow(config);
    setSaveState(result.status);
    setRequestHeaders(result.requestHeaders);
    trackCareersApplicationWorkflow('save_completed', { routeId: 'settings.careers-application.application-page', section: config.section, subsection: config.subsection });
    trackCareersApplicationWorkflow('public_contract_updated', { routeId: 'settings.careers-application.application-page', introTitle: result.publicContract.introTitle });
  }

  return (
    <section>
      <h1>Application page settings</h1>
      <dl>
        <dt>Settings</dt>
        <dd data-testid="application-page-settings-id">{config.settingsId}</dd>
        <dt>Section</dt>
        <dd data-testid="application-page-section">{config.section}</dd>
        <dt>Subsection</dt>
        <dd data-testid="application-page-subsection">{config.subsection}</dd>
        <dt>Readiness</dt>
        <dd data-testid="application-page-readiness">{decision.readiness}</dd>
      </dl>
      <label>
        Intro title
        <input data-testid="application-page-intro-title" value={config.introTitle} onChange={(event) => setConfig((current) => ({ ...current, introTitle: event.target.value }))} />
      </label>
      <label>
        <input
          type="checkbox"
          checked={config.collectPhone}
          onChange={(event) => setConfig((current) => ({ ...current, collectPhone: event.target.checked }))}
        />
        Collect phone
      </label>
      <label>
        <input
          type="checkbox"
          checked={config.consentRequired}
          onChange={(event) => setConfig((current) => ({ ...current, consentRequired: event.target.checked }))}
        />
        Consent required
      </label>
      <button type="button" onClick={handleSave} data-testid="application-page-save-button">
        Save application page
      </button>
      <p data-testid="application-page-save-state">{saveState}</p>
      <pre data-testid="application-page-public-contract">{JSON.stringify(toPublicApplicationPageContract(config), null, 2)}</pre>
      <pre data-testid="application-page-request-headers">{JSON.stringify(requestHeaders, null, 2)}</pre>
    </section>
  );
}

