import { resetCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildProviderReadinessSignals } from './admin-state';
import { buildOperationalGateInput, evaluateOperationalReadinessGate } from './operational-readiness-gates';

describe('operational readiness gates', () => {
  it('maps ready readiness to proceeding action readiness with safe telemetry', () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_gate_ready');
    const [signal] = buildProviderReadinessSignals({ id: 'google-calendar', name: 'Google Calendar', family: 'calendar', state: 'connected' });

    const gate = evaluateOperationalReadinessGate(buildOperationalGateInput(signal, 'job-schedule'));

    expect(gate).toMatchObject({ canProceed: true, state: 'ready' });
    expect(gate.setupTarget).toBeUndefined();
    expect(gate.telemetry).toEqual({
      name: 'provider_readiness_gate_evaluated',
      data: {
        readinessFamily: 'scheduling',
        providerFamily: 'calendar',
        outcome: 'ready',
        actionContext: 'job-schedule',
        recoveryTargetType: 'none',
        correlationId: 'corr_gate_ready',
      },
    });
  });

  it('blocks degraded mutation actions while preserving a safe setup recovery target', () => {
    const [signal] = buildProviderReadinessSignals({ id: 'lever', name: 'Lever', family: 'job-board', state: 'degraded' });

    const gate = evaluateOperationalReadinessGate(buildOperationalGateInput(signal, 'job-listing-publishing'));

    expect(gate.canProceed).toBe(false);
    expect(gate.state).toBe('degraded');
    expect(gate.setupTarget).toEqual({ providerId: 'lever', path: '/integrations/lever', label: 'Review Lever setup' });
    expect(gate.telemetry.data).toMatchObject({
      readinessFamily: 'publishing',
      providerFamily: 'job-board',
      outcome: 'degraded',
      recoveryTargetType: 'provider-setup',
    });
    expect(JSON.stringify(gate.telemetry.data)).not.toContain('credential');
    expect(JSON.stringify(gate.telemetry.data)).not.toContain('token');
  });

  it('keeps unknown provider recovery local without guessing setup URLs', () => {
    const [signal] = buildProviderReadinessSignals({ id: 'unknown-provider', name: 'Unknown provider', family: 'custom', state: 'unavailable' });

    const gate = evaluateOperationalReadinessGate(buildOperationalGateInput(signal, 'hris-workflow'));

    expect(gate).toMatchObject({ canProceed: false, state: 'unimplemented' });
    expect(gate.setupTarget).toBeUndefined();
    expect(gate.telemetry.data.recoveryTargetType).toBe('none');
  });
});
