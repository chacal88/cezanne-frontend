import { beforeEach, describe, expect, it } from 'vitest';
import { correlationHeaderName } from '../../../../lib/api-client';
import { resetCorrelationId, setActiveCorrelationId } from '../../../../lib/observability';
import { getRejectReasonsSettingsConfig } from './store';
import { runRejectReasonsSettingsSave } from './workflow';

describe('reject-reasons settings workflow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetCorrelationId();
  });

  it('persists a stable reject-reasons update with correlation-aware headers', async () => {
    setActiveCorrelationId('corr_test_reject_reasons');
    const current = getRejectReasonsSettingsConfig();

    const result = await runRejectReasonsSettingsSave({
      ...current,
      reasons: current.reasons.map((reason, index) => (index === 0 ? { ...reason, label: 'Missing core experience' } : reason)),
    });

    expect(result.state.kind).toBe('success');
    expect(result.readiness.kind).toBe('ready');
    expect(result.config?.reasons[0]?.label).toBe('Missing core experience');
    if (result.state.kind !== 'success') return;
    expect(result.state.requestHeaders[correlationHeaderName]).toBe('corr_test_reject_reasons');
  });

  it('returns a retryable readiness state when the save fails recoverably', async () => {
    const result = await runRejectReasonsSettingsSave({
      ...getRejectReasonsSettingsConfig(),
      simulateSubmissionFailure: true,
    });

    expect(result.state.kind).toBe('submission-error');
    expect(result.readiness).toEqual({
      kind: 'retryable-error',
      canEdit: false,
      canRetry: true,
      reason: 'Reject-reasons update failed. Retry is available.',
    });
  });
});
