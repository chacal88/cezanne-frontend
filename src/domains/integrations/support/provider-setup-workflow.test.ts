import { resetCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { runProviderAuthAction, runProviderDiagnostics, saveProviderConfiguration } from './provider-setup-workflow';

const calendar = { id: 'google-calendar', name: 'Google Calendar', family: 'calendar' as const, state: 'connected' as const };
const jobBoard = { id: 'lever', name: 'Lever', family: 'job-board' as const, state: 'degraded' as const };
const custom = { id: 'custom-provider', name: 'Custom provider', family: 'custom' as const, state: 'unavailable' as const };

describe('provider setup workflows', () => {
  it('keeps configuration validation and save failures route-local with safe telemetry', () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_provider_setup');

    const validation = saveProviderConfiguration(calendar, { requiredFieldsComplete: false });
    const saved = saveProviderConfiguration(calendar, { requiredFieldsComplete: true });
    const failed = saveProviderConfiguration(calendar, { requiredFieldsComplete: true, forceSaveFailure: true });

    expect(validation.status).toBe('validation-error');
    expect(saved.status).toBe('saved');
    expect(failed.status).toBe('save-error');
    expect(saved.telemetry.data).toEqual({
      providerFamily: 'calendar',
      providerState: 'connected',
      section: 'configuration',
      action: 'save',
      outcome: 'saved',
      correlationId: 'corr_provider_setup',
    });
    expect(JSON.stringify(saved.telemetry.data)).not.toMatch(/credential|secret|token|raw|tenant/i);
  });

  it('models auth pending and auth failure without token-entry capability leakage', () => {
    const pending = runProviderAuthAction(calendar, 'connect');
    const failed = runProviderAuthAction(calendar, 'connect', { forceFailure: true });

    expect(pending.status).toBe('auth-pending');
    expect(pending.telemetry.name).toBe('integration_provider_auth_started');
    expect(failed.status).toBe('auth-failed');
    expect(failed.telemetry.data).toMatchObject({ section: 'auth', action: 'connect', failureKind: 'provider-auth-failed' });
  });

  it('models diagnostics passed, failed, logs-ready, unavailable, and retry-safe states with safe payloads', () => {
    const passed = runProviderDiagnostics(calendar);
    const logsReady = runProviderDiagnostics(calendar, { logsReady: true });
    const failed = runProviderDiagnostics(jobBoard);
    const unavailable = runProviderDiagnostics(custom);

    expect(passed.status).toBe('passed');
    expect(logsReady.status).toBe('logs-ready');
    expect(failed.status).toBe('failed');
    expect(unavailable.status).toBe('unavailable');
    expect(failed.telemetry.data).toMatchObject({ providerFamily: 'job-board', section: 'diagnostics', checkId: 'provider-connectivity', severity: 'critical' });
    expect(JSON.stringify(failed.telemetry.data)).not.toMatch(/credential|secret|token|raw|tenant/i);
  });
});
