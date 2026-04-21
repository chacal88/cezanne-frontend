import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { observability } from '../../../app/observability';
import { useCapabilities } from '../../../lib/access-control';
import { buildApiEndpointSettingsState, getDefaultApiEndpointSettingsConfig, type ApiEndpointSettingsConfig } from './support/api-endpoints-state';

export function ApiEndpointsSettingsPage() {
  const { t } = useTranslation('settings');
  const capabilities = useCapabilities();
  const [config, setConfig] = useState<ApiEndpointSettingsConfig>(() => getDefaultApiEndpointSettingsConfig());
  const [saved, setSaved] = useState(false);
  const state = buildApiEndpointSettingsState(config, { routeAllowed: capabilities.canManageApiEndpoints, saved });

  useEffect(() => {
    observability.telemetry.track({
      name: 'settings_compat_resolved',
      data: { routeId: 'settings.api-endpoints', requestedSubsection: 'api-endpoints', resolvedSubsection: 'api-endpoints', outcome: 'direct' },
    });
  }, []);

  function handleSave() {
    const nextState = buildApiEndpointSettingsState(config, { routeAllowed: capabilities.canManageApiEndpoints });
    if (nextState.kind === 'validation-error') {
      observability.telemetry.track({ name: 'api_endpoints_validation_failed', data: { routeId: 'settings.api-endpoints', failureKind: nextState.validationErrors[0] } });
      setSaved(false);
      return;
    }
    if (nextState.kind === 'save-error') {
      observability.telemetry.track({ name: 'api_endpoints_save_failed', data: { routeId: 'settings.api-endpoints', failureKind: 'simulated-save-failure' } });
      setSaved(false);
      return;
    }
    observability.telemetry.track({ name: 'api_endpoints_save_succeeded', data: { routeId: 'settings.api-endpoints' } });
    setSaved(true);
  }

  return (
    <section aria-labelledby="api-endpoints-title">
      <p>{t('apiEndpoints.eyebrow')}</p>
      <h1 id="api-endpoints-title">{t('apiEndpoints.title')}</h1>
      <p>{t('apiEndpoints.copy')}</p>
      <dl>
        <dt>{t('apiEndpoints.stateLabel')}</dt>
        <dd data-testid="api-endpoints-state">{state.kind}</dd>
        <dt>{t('apiEndpoints.ownerLabel')}</dt>
        <dd>{state.owner}</dd>
        <dt>{t('apiEndpoints.capabilityLabel')}</dt>
        <dd>{state.routeCapability}</dd>
      </dl>
      <label>
        {t('apiEndpoints.urlLabel')}
        <input data-testid="api-endpoints-url" value={config.endpointUrl} onChange={(event) => { setSaved(false); setConfig((current) => ({ ...current, endpointUrl: event.target.value })); }} />
      </label>
      <label>
        {t('apiEndpoints.environmentLabel')}
        <select data-testid="api-endpoints-environment" value={config.environment} onChange={(event) => { setSaved(false); setConfig((current) => ({ ...current, environment: event.target.value as ApiEndpointSettingsConfig['environment'] })); }}>
          <option value="sandbox">sandbox</option>
          <option value="production">production</option>
        </select>
      </label>
      <label>
        <input data-testid="api-endpoints-simulate-failure" type="checkbox" checked={Boolean(config.simulateSaveFailure)} onChange={(event) => { setSaved(false); setConfig((current) => ({ ...current, simulateSaveFailure: event.target.checked })); }} />
        {t('apiEndpoints.simulateFailureLabel')}
      </label>
      <button type="button" data-testid="api-endpoints-save-button" disabled={!state.canSave} onClick={handleSave}>
        {t('apiEndpoints.save')}
      </button>
      {state.canRetry ? <button type="button" data-testid="api-endpoints-retry-button" onClick={handleSave}>{t('apiEndpoints.retry')}</button> : null}
      <pre data-testid="api-endpoints-validation-errors">{JSON.stringify(state.validationErrors)}</pre>
    </section>
  );
}
