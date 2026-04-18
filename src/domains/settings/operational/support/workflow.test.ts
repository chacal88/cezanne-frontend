import { describe, expect, it } from 'vitest';
import { correlationHeaderName } from '../../../../lib/api-client';
import { resetCorrelationId, setActiveCorrelationId } from '../../../../lib/observability';
import {
  completeOperationalSettingsMutationFailure,
  completeOperationalSettingsMutationValidationError,
  resolveOperationalSettingsReadiness,
  runOperationalSettingsMutation,
  startOperationalSettingsMutation,
} from './workflow';

describe('operational settings workflow helpers', () => {
  it('resolves loading, retryable, and ready subsection states', () => {
    expect(resolveOperationalSettingsReadiness({ isLoading: true })).toEqual({
      kind: 'loading',
      canEdit: false,
      canRetry: false,
    });
    expect(resolveOperationalSettingsReadiness({ isRetryableError: true, reason: 'Temporary outage' })).toEqual({
      kind: 'retryable-error',
      canEdit: false,
      canRetry: true,
      reason: 'Temporary outage',
    });
    expect(resolveOperationalSettingsReadiness({})).toEqual({
      kind: 'ready',
      canEdit: true,
      canRetry: false,
    });
  });

  it('keeps correlation-aware headers across success, validation failure, and submission failure', async () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_test_operational_settings');

    const submitting = startOperationalSettingsMutation('PUT');
    expect(submitting.requestHeaders[correlationHeaderName]).toBe('corr_test_operational_settings');

    const successResult = await runOperationalSettingsMutation({
      method: 'PUT',
      execute: async () => ({ ok: true, outcome: 'stable', value: { saved: true } }),
    });
    expect(successResult.state.kind).toBe('success');
    if (successResult.state.kind !== 'success') return;
    expect(successResult.state.requestHeaders[correlationHeaderName]).toBe('corr_test_operational_settings');

    const validationState = completeOperationalSettingsMutationValidationError(submitting.requestHeaders, ['name']);
    expect(validationState).toEqual({
      kind: 'validation-error',
      canRetry: false,
      requestHeaders: expect.objectContaining({
        [correlationHeaderName]: 'corr_test_operational_settings',
      }),
      fieldErrors: ['name'],
    });

    const failureState = completeOperationalSettingsMutationFailure(submitting.requestHeaders, 'Network error');
    expect(failureState).toEqual({
      kind: 'submission-error',
      canRetry: true,
      requestHeaders: expect.objectContaining({
        [correlationHeaderName]: 'corr_test_operational_settings',
      }),
      reason: 'Network error',
    });
  });
});
