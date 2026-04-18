import { beforeEach, describe, expect, it } from 'vitest';
import { correlationHeaderName } from '../../../../lib/api-client';
import { resetCorrelationId, setActiveCorrelationId } from '../../../../lib/observability';
import { getHiringFlowSettingsConfig } from './store';
import { runHiringFlowSettingsSave } from './workflow';

describe('hiring flow settings workflow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetCorrelationId();
  });

  it('persists a stable workflow update with correlation-aware headers', async () => {
    setActiveCorrelationId('corr_test_hiring_flow');

    const result = await runHiringFlowSettingsSave({
      ...getHiringFlowSettingsConfig(),
      workflowName: 'Executive hiring workflow',
      defaultStageName: 'Application review',
    });

    expect(result.state.kind).toBe('success');
    expect(result.readiness.kind).toBe('ready');
    expect(result.config?.workflowName).toBe('Executive hiring workflow');
    if (result.state.kind !== 'success') return;
    expect(result.state.requestHeaders[correlationHeaderName]).toBe('corr_test_hiring_flow');
  });

  it('returns a retryable readiness state when the save fails recoverably', async () => {
    const result = await runHiringFlowSettingsSave({
      ...getHiringFlowSettingsConfig(),
      simulateSubmissionFailure: true,
    });

    expect(result.state.kind).toBe('submission-error');
    expect(result.readiness).toEqual({
      kind: 'retryable-error',
      canEdit: false,
      canRetry: true,
      reason: 'Workflow settings update failed. Retry is available.',
    });
  });
});
