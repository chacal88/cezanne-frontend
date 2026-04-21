import { describe, expect, it } from 'vitest';
import { resetCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import {
  buildEmailDeliverabilityReadiness,
  buildEmailDeliverabilityReadinessTelemetry,
  buildEmailDeliverabilityReadinessFromAdapter,
} from './email-deliverability-readiness';

describe('email deliverability frontend alignment', () => {
  it('keeps sender-domain and signature setup backend-only with no admin route target', () => {
    const pendingDomain = buildEmailDeliverabilityReadiness({
      domainStatus: 'pending',
      signatureStatus: 'confirmed',
      providerFamily: 'postmark',
      domainCategory: 'managed',
    });

    expect(pendingDomain).toMatchObject({
      setupOwnership: 'backend-only-no-ui',
      routeOwnership: 'none',
      readinessState: 'domain-pending',
      capabilityOutcome: 'degraded',
      providerFamily: 'postmark',
      domainCategory: 'managed',
      canSend: false,
    });
    expect('adminRouteTarget' in pendingDomain).toBe(false);
  });

  it('normalizes operational messaging readiness without exposing lifecycle internals', () => {
    expect(buildEmailDeliverabilityReadiness({ domainStatus: 'verified', signatureStatus: 'confirmed' })).toMatchObject({
      readinessState: 'ready',
      capabilityOutcome: 'allowed',
      canSend: true,
    });
    expect(buildEmailDeliverabilityReadiness({ domainStatus: 'failed', signatureStatus: 'confirmed' })).toMatchObject({
      readinessState: 'domain-failed',
      capabilityOutcome: 'blocked',
      canSend: false,
    });
    expect(buildEmailDeliverabilityReadiness({ domainStatus: 'verified', signatureStatus: 'pending' })).toMatchObject({
      readinessState: 'signature-pending',
      capabilityOutcome: 'blocked',
      canSend: false,
    });
    expect(buildEmailDeliverabilityReadiness({ backendContractAvailable: false })).toMatchObject({
      readinessState: 'unimplemented',
      capabilityOutcome: 'unimplemented',
      canSend: false,
    });
  });

  it('uses a replaceable readiness adapter seam while the backend contract is unknown', () => {
    expect(buildEmailDeliverabilityReadinessFromAdapter({ conversationId: 'conversation-blocked' })).toMatchObject({
      readinessState: 'domain-failed',
      capabilityOutcome: 'blocked',
      adapterContract: 'fixture',
      unknownContracts: ['email deliverability readiness API'],
    });
    expect(buildEmailDeliverabilityReadinessFromAdapter({ conversationId: 'conversation-signature-pending' })).toMatchObject({
      readinessState: 'signature-pending',
      capabilityOutcome: 'blocked',
    });
  });

  it('emits only the deliverability telemetry allowlist', () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_email_ready');
    const readiness = buildEmailDeliverabilityReadiness({
      domainStatus: 'failed',
      signatureStatus: 'confirmed',
      providerFamily: 'postmark',
      domainCategory: 'managed',
    });

    const event = buildEmailDeliverabilityReadinessTelemetry({ routeId: 'inbox.home', readiness });

    expect(event).toEqual({
      name: 'email_deliverability_readiness_evaluated',
      data: {
        routeId: 'inbox.home',
        capabilityOutcome: 'blocked',
        readinessState: 'domain-failed',
        providerFamily: 'postmark',
        domainCategory: 'managed',
        correlationId: 'corr_email_ready',
      },
    });
    expect(Object.keys(event.data).sort()).toEqual([
      'capabilityOutcome',
      'correlationId',
      'domainCategory',
      'providerFamily',
      'readinessState',
      'routeId',
    ]);
    expect(JSON.stringify(event.data)).not.toContain('selector');
    expect(JSON.stringify(event.data)).not.toContain('token');
    expect(JSON.stringify(event.data)).not.toContain('candidate@example.com');
  });
});
