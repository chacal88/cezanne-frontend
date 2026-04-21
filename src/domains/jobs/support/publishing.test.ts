import { describe, expect, it } from 'vitest';
import { resetCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildProviderReadinessSignals } from '../../integrations/support';
import { buildOperationalGateInput, evaluateOperationalReadinessGate } from '../../integrations/support';
import {
  buildJobBoardPublishingResult,
  buildJobBoardPublishingStatus,
  buildJobBoardPublishingTelemetry,
  jobBoardPublishingStates,
  normalizeJobBoardPublishTarget,
  resolvePublishingStateFromReadiness,
} from './publishing';

describe('job-board publishing operational helpers', () => {
  it('models the deterministic publishing lifecycle states', () => {
    expect(jobBoardPublishingStates).toEqual([
      'not-ready',
      'ready',
      'validating',
      'publishing',
      'published',
      'publish-failed',
      'partially-published',
      'unpublish-ready',
      'unpublishing',
      'unpublished',
      'unpublish-failed',
      'provider-blocked',
      'degraded',
      'unavailable',
    ]);
  });

  it('normalizes publish targets without raw provider setup details', () => {
    expect(normalizeJobBoardPublishTarget({ routeFamily: 'job-authoring', targetType: 'job', hasExistingTarget: true })).toEqual({
      routeFamily: 'job-authoring',
      targetType: 'job',
      targetReference: 'existing',
    });
  });

  it('maps readiness gates to proceeding and blocked publishing states', () => {
    const [readySignal] = buildProviderReadinessSignals({ id: 'lever', name: 'Lever', family: 'job-board', state: 'connected' });
    const [blockedSignal] = buildProviderReadinessSignals({ id: 'lever', name: 'Lever', family: 'job-board', state: 'reauth_required' });
    const readyGate = evaluateOperationalReadinessGate(buildOperationalGateInput(readySignal, 'job-publishing'));
    const blockedGate = evaluateOperationalReadinessGate(buildOperationalGateInput(blockedSignal, 'job-publishing'));

    expect(resolvePublishingStateFromReadiness(readyGate)).toBe('ready');
    expect(resolvePublishingStateFromReadiness(blockedGate)).toBe('provider-blocked');
    expect(buildJobBoardPublishingStatus({ readinessGate: blockedGate })).toMatchObject({
      state: 'provider-blocked',
      canProceed: false,
      remediation: { type: 'provider-setup', path: '/integrations/lever' },
    });
  });

  it('distinguishes success, retryable failure, partial outcome, and public-reflection intent', () => {
    expect(buildJobBoardPublishingResult({ action: 'publish', kind: 'success' }).status).toMatchObject({
      state: 'published',
      publicReflectionIntent: 'confirmed',
    });
    expect(buildJobBoardPublishingResult({ action: 'publish', kind: 'retryable-failure' }).status).toMatchObject({
      state: 'publish-failed',
      canRetry: true,
      publicReflectionIntent: 'pending',
    });
    expect(buildJobBoardPublishingResult({ action: 'publish', kind: 'partial' }).status).toMatchObject({
      state: 'partially-published',
      canRetry: true,
      publicReflectionIntent: 'uncertain',
    });
    expect(buildJobBoardPublishingResult({ action: 'unpublish', kind: 'retryable-failure' }).status.state).toBe('unpublish-failed');
  });

  it('emits safe allowlisted telemetry payloads', () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_publish_safe');
    const event = buildJobBoardPublishingTelemetry({
      routeFamily: 'job-listings',
      action: 'publish',
      publishingState: 'partially-published',
      targetType: 'job-listing',
    });

    expect(event).toEqual({
      name: 'job_board_publishing_action',
      data: {
        routeFamily: 'job-listings',
        action: 'publish',
        publishingState: 'partially-published',
        readinessOutcome: 'none',
        targetType: 'job-listing',
        correlationId: 'corr_publish_safe',
      },
    });
    expect(JSON.stringify(event.data)).not.toContain('credential');
    expect(JSON.stringify(event.data)).not.toContain('token');
    expect(JSON.stringify(event.data)).not.toContain('mapping');
    expect(JSON.stringify(event.data)).not.toContain('payload');
  });
});
