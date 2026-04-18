import { beforeEach, describe, expect, it } from 'vitest';
import { correlationHeaderName } from '../../../../lib/api-client';
import { resetCorrelationId, setActiveCorrelationId } from '../../../../lib/observability';
import { getTemplatesSettingsConfig } from './store';
import { runTemplatesSettingsSave } from './workflow';

describe('templates settings workflow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetCorrelationId();
  });

  it('persists a stable templates update with correlation-aware headers', async () => {
    setActiveCorrelationId('corr_test_templates');
    const current = getTemplatesSettingsConfig();

    const result = await runTemplatesSettingsSave({
      ...current,
      summaries: current.summaries.map((summary, index) => (index === 0 ? { ...summary, title: 'Default outreach template' } : summary)),
    });

    expect(result.state.kind).toBe('success');
    expect(result.readiness.kind).toBe('ready');
    expect(result.config?.summaries[0]?.title).toBe('Default outreach template');
    if (result.state.kind !== 'success') return;
    expect(result.state.requestHeaders[correlationHeaderName]).toBe('corr_test_templates');
  });

  it('returns a retryable readiness state when the save fails recoverably', async () => {
    const result = await runTemplatesSettingsSave({
      ...getTemplatesSettingsConfig(),
      simulateSubmissionFailure: true,
    });

    expect(result.state.kind).toBe('submission-error');
    expect(result.readiness).toEqual({
      kind: 'retryable-error',
      canEdit: false,
      canRetry: true,
      reason: 'Templates settings update failed. Retry is available.',
    });
  });
});
