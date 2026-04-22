import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { listIntegrationProviders, resolveIntegrationProvider } from './support/admin-state';
import { runProviderAuthAction, runProviderDiagnostics, saveProviderConfiguration } from './support/provider-setup-workflow';

export function IntegrationsIndexPage() {
  const providers = listIntegrationProviders();

  return (
    <section>
      <h1>Integrations</h1>
      <p>Internal integrations admin shell for provider setup state.</p>
      <ul>
        {providers.map((provider) => (
          <li key={provider.id} data-testid={`integration-provider-${provider.id}`}>
            <Link to="/integrations/$providerId" params={{ providerId: provider.id }} data-testid={`integration-provider-link-${provider.id}`}>
              {provider.name}
            </Link>{' '}
            <span data-testid={`integration-provider-state-${provider.id}`}>{provider.state}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function IntegrationProviderDetailPage({ providerId }: { providerId: string }) {
  const provider = resolveIntegrationProvider(providerId);
  const [message, setMessage] = useState('');
  const [lastTelemetryName, setLastTelemetryName] = useState('');
  const [lastSectionState, setLastSectionState] = useState('');
  const forcedWorkflow = new URLSearchParams(window.location.search).get('workflow');

  function record(result: { message: string; status: string; telemetry: { name: string } }) {
    setMessage(result.message);
    setLastSectionState(result.status);
    setLastTelemetryName(result.telemetry.name);
  }

  useEffect(() => {
    if (forcedWorkflow === 'auth-failed') {
      const action = provider.state === 'reauth_required' ? 'reauthorize' : 'connect';
      record(runProviderAuthAction(provider, action, { forceFailure: true }));
    }
    if (forcedWorkflow === 'auth-pending') {
      const action = provider.state === 'reauth_required' ? 'reauthorize' : 'connect';
      record(runProviderAuthAction(provider, action));
    }
    if (forcedWorkflow === 'diagnostics-passed') record(runProviderDiagnostics(provider));
    if (forcedWorkflow === 'diagnostics-failed') record(runProviderDiagnostics(provider, { forceFailure: true }));
    if (forcedWorkflow === 'diagnostics-logs-ready') record(runProviderDiagnostics(provider, { logsReady: true }));
  }, [forcedWorkflow, providerId]);

  return (
    <section>
      <p>Provider detail</p>
      <h1>{provider.name}</h1>
      <p data-testid="integration-provider-id">{provider.id}</p>
      <p data-testid="integration-provider-family">{provider.family}</p>
      <p data-testid="integration-provider-state">{provider.state}</p>
      <p data-testid="integration-provider-state-label">{provider.stateLabel}</p>
      <ul>
        {provider.actions.map((action) => (
          <li key={action.id} data-testid={`integration-provider-action-${action.id}`}>
            {action.label} <span data-testid={`integration-provider-action-concern-${action.id}`}>{action.concern}</span>
          </li>
        ))}
      </ul>

      <div aria-label="Provider setup sections">
        {provider.sections.map((section) => (
          <section key={section.id} data-testid={`integration-provider-section-${section.id}`}>
            <h2>{section.title}</h2>
            <p data-testid={`integration-provider-section-state-${section.id}`}>{section.state}</p>
            <p>{section.description}</p>
            <dl>
              {section.fields.map((field) => (
                <div key={field.id} data-testid={`integration-provider-field-${section.id}-${field.id}`}>
                  <dt>{field.label}</dt>
                  <dd>{field.secret ? 'Configured securely' : field.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <div aria-label="Provider readiness signals">
        {provider.readinessSignals.map((signal) => (
          <p key={signal.family} data-testid={`integration-provider-readiness-${signal.family}`}>
            {signal.outcome}: {signal.reason}
          </p>
        ))}
      </div>

      <div aria-label="Provider setup actions">
        <button type="button" onClick={() => record(saveProviderConfiguration(provider, { requiredFieldsComplete: true }))} data-testid="integration-provider-save">
          Save configuration
        </button>
        <button type="button" onClick={() => record(saveProviderConfiguration(provider, { requiredFieldsComplete: false }))} data-testid="integration-provider-save-invalid">
          Try invalid save
        </button>
        <button type="button" onClick={() => record(runProviderAuthAction(provider, provider.state === 'reauth_required' ? 'reauthorize' : 'connect'))} data-testid="integration-provider-auth">
          {provider.state === 'reauth_required' ? 'Reauthorize' : 'Connect'}
        </button>
        <button type="button" onClick={() => record(runProviderDiagnostics(provider))} data-testid="integration-provider-diagnostics">
          Run diagnostics
        </button>
      </div>

      {message ? <p data-testid="integration-provider-workflow-message">{message}</p> : null}
      {lastSectionState ? <p data-testid="integration-provider-workflow-state">{lastSectionState}</p> : null}
      {lastTelemetryName ? <p data-testid="integration-provider-telemetry-event">{lastTelemetryName}</p> : null}

      <Link to={provider.parentTarget} data-testid="integration-provider-parent-link">
        Back to integrations
      </Link>
    </section>
  );
}
