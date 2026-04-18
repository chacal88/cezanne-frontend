import { beforeEach, describe, expect, it } from 'vitest';
import { correlationHeaderName } from '../../../../lib/api-client';
import { resetCorrelationId, setActiveCorrelationId } from '../../../../lib/observability';
import { getCustomFieldsSettingsConfig } from './store';
import { runCustomFieldsSettingsSave } from './workflow';

describe('custom-fields settings workflow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetCorrelationId();
  });

  it('persists a stable custom-fields update with correlation-aware headers', async () => {
    setActiveCorrelationId('corr_test_custom_fields');

    const current = getCustomFieldsSettingsConfig();
    const result = await runCustomFieldsSettingsSave({
      ...current,
      fields: current.fields.map((field, index) => (index === 0 ? { ...field, label: 'Preferred working shift' } : field)),
    });

    expect(result.state.kind).toBe('success');
    expect(result.readiness.kind).toBe('ready');
    expect(result.config?.fields[0]?.label).toBe('Preferred working shift');
    if (result.state.kind !== 'success') return;
    expect(result.state.requestHeaders[correlationHeaderName]).toBe('corr_test_custom_fields');
  });

  it('returns a retryable readiness state when the save fails recoverably', async () => {
    const result = await runCustomFieldsSettingsSave({
      ...getCustomFieldsSettingsConfig(),
      simulateSubmissionFailure: true,
    });

    expect(result.state.kind).toBe('submission-error');
    expect(result.readiness).toEqual({
      kind: 'retryable-error',
      canEdit: false,
      canRetry: true,
      reason: 'Custom-fields settings update failed. Retry is available.',
    });
  });
});
