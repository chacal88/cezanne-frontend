import { Link } from '@tanstack/react-router';
import { listIntegrationProviders, resolveIntegrationProvider } from './support/admin-state';

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
      <Link to={provider.parentTarget} data-testid="integration-provider-parent-link">
        Back to integrations
      </Link>
    </section>
  );
}
