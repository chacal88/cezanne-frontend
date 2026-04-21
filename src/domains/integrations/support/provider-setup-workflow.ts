import { ensureCorrelationId } from '../../../lib/observability';
import type {
  IntegrationProviderAction,
  IntegrationProviderAuthState,
  IntegrationProviderConfigurationState,
  IntegrationProviderDiagnosticsState,
  IntegrationProviderSummary,
} from './admin-state';
import { buildProviderAuthState, buildProviderConfigurationState, buildProviderDiagnosticsState } from './admin-state';

type SafeTelemetryData = {
  providerFamily: IntegrationProviderSummary['family'];
  providerState: IntegrationProviderSummary['state'];
  section: 'configuration' | 'auth' | 'diagnostics';
  action: string;
  outcome: string;
  correlationId: string;
  checkId?: string;
  severity?: 'info' | 'warning' | 'critical';
  failureKind?: string;
};

export type ProviderSetupTelemetryEvent = {
  name:
    | 'integration_provider_configuration_saved'
    | 'integration_provider_configuration_failed'
    | 'integration_provider_auth_started'
    | 'integration_provider_auth_failed'
    | 'integration_provider_diagnostics_started'
    | 'integration_provider_diagnostics_completed';
  data: SafeTelemetryData;
};

export type ProviderConfigurationDraft = {
  requiredFieldsComplete: boolean;
  forceSaveFailure?: boolean;
};

export type ProviderConfigurationWorkflowResult = {
  status: IntegrationProviderConfigurationState;
  message: string;
  telemetry: ProviderSetupTelemetryEvent;
};

export type ProviderAuthWorkflowResult = {
  status: IntegrationProviderAuthState;
  message: string;
  telemetry: ProviderSetupTelemetryEvent;
};

export type ProviderDiagnosticsWorkflowResult = {
  status: IntegrationProviderDiagnosticsState;
  message: string;
  checkId: string;
  severity: 'info' | 'warning' | 'critical';
  telemetry: ProviderSetupTelemetryEvent;
};

function safeTelemetryData(
  provider: IntegrationProviderSummary,
  section: SafeTelemetryData['section'],
  action: string,
  outcome: string,
  extra: Partial<Pick<SafeTelemetryData, 'checkId' | 'failureKind' | 'severity'>> = {},
): SafeTelemetryData {
  return {
    providerFamily: provider.family,
    providerState: provider.state,
    section,
    action,
    outcome,
    correlationId: ensureCorrelationId(),
    ...extra,
  };
}

export function saveProviderConfiguration(provider: IntegrationProviderSummary, draft: ProviderConfigurationDraft): ProviderConfigurationWorkflowResult {
  const unavailableState = buildProviderConfigurationState({ provider });
  if (unavailableState === 'unavailable' || unavailableState === 'unimplemented') {
    return {
      status: unavailableState,
      message: 'Provider-family configuration is not available for this provider.',
      telemetry: {
        name: 'integration_provider_configuration_failed',
        data: safeTelemetryData(provider, 'configuration', 'save', unavailableState, { failureKind: unavailableState }),
      },
    };
  }

  if (!draft.requiredFieldsComplete) {
    return {
      status: 'validation-error',
      message: 'Complete the required provider-family setup fields before saving.',
      telemetry: {
        name: 'integration_provider_configuration_failed',
        data: safeTelemetryData(provider, 'configuration', 'save', 'validation-error', { failureKind: 'validation-error' }),
      },
    };
  }

  if (draft.forceSaveFailure) {
    return {
      status: 'save-error',
      message: 'Provider configuration could not be saved. Try again.',
      telemetry: {
        name: 'integration_provider_configuration_failed',
        data: safeTelemetryData(provider, 'configuration', 'save', 'save-error', { failureKind: 'save-error' }),
      },
    };
  }

  return {
    status: 'saved',
    message: 'Provider configuration saved.',
    telemetry: {
      name: 'integration_provider_configuration_saved',
      data: safeTelemetryData(provider, 'configuration', 'save', 'saved'),
    },
  };
}

export function runProviderAuthAction(
  provider: IntegrationProviderSummary,
  action: Extract<IntegrationProviderAction, 'connect' | 'reauthorize'>,
  options: { forceFailure?: boolean } = {},
): ProviderAuthWorkflowResult {
  if (options.forceFailure) {
    return {
      status: 'auth-failed',
      message: `${action === 'reauthorize' ? 'Reauthorization' : 'Connection'} failed. Retry from this provider detail route.`,
      telemetry: {
        name: 'integration_provider_auth_failed',
        data: safeTelemetryData(provider, 'auth', action, 'auth-failed', { failureKind: 'provider-auth-failed' }),
      },
    };
  }

  return {
    status: buildProviderAuthState({ provider, isPending: true }),
    message: `${action === 'reauthorize' ? 'Reauthorization' : 'Connection'} started. Waiting for provider callback readiness.`,
    telemetry: {
      name: 'integration_provider_auth_started',
      data: safeTelemetryData(provider, 'auth', action, 'auth-pending'),
    },
  };
}

export function runProviderDiagnostics(provider: IntegrationProviderSummary, options: { forceFailure?: boolean; logsReady?: boolean } = {}): ProviderDiagnosticsWorkflowResult {
  const baseState = buildProviderDiagnosticsState({ provider });
  if (baseState === 'unavailable') {
    return {
      status: 'unavailable',
      message: 'Diagnostics are unavailable for this provider family.',
      checkId: 'provider-family-supported',
      severity: 'warning',
      telemetry: {
        name: 'integration_provider_diagnostics_completed',
        data: safeTelemetryData(provider, 'diagnostics', 'run_diagnostics', 'unavailable', { checkId: 'provider-family-supported', severity: 'warning' }),
      },
    };
  }

  if (options.forceFailure || provider.state === 'degraded') {
    return {
      status: 'failed',
      message: 'Diagnostics found a recoverable provider issue. Review remediation and retry.',
      checkId: 'provider-connectivity',
      severity: provider.state === 'degraded' ? 'critical' : 'warning',
      telemetry: {
        name: 'integration_provider_diagnostics_completed',
        data: safeTelemetryData(provider, 'diagnostics', 'run_diagnostics', 'failed', {
          checkId: 'provider-connectivity',
          severity: provider.state === 'degraded' ? 'critical' : 'warning',
        }),
      },
    };
  }

  return {
    status: options.logsReady ? 'logs-ready' : 'passed',
    message: options.logsReady ? 'Diagnostics passed and safe summaries are ready.' : 'Diagnostics passed.',
    checkId: 'provider-connectivity',
    severity: 'info',
    telemetry: {
      name: 'integration_provider_diagnostics_completed',
      data: safeTelemetryData(provider, 'diagnostics', 'run_diagnostics', options.logsReady ? 'logs-ready' : 'passed', {
        checkId: 'provider-connectivity',
        severity: 'info',
      }),
    },
  };
}
