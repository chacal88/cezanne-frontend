import { describe, expect, it } from 'vitest';
import { resetCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildIntegrationCvViewModel, buildIntegrationFormsViewModel, buildIntegrationJobViewModel } from './adapters';
import { runIntegrationCvWorkflow, runIntegrationFormsWorkflow } from './workflow';

describe('integration token adapters', () => {
  it('builds normalized callback view models', () => {
    expect(buildIntegrationCvViewModel({ token: 'valid-token' }).decision.capabilityKey).toBe('canUseIntegrationTokenEntry');
    expect(buildIntegrationFormsViewModel({ token: 'valid-token' }).steps).toHaveLength(2);
    expect(buildIntegrationJobViewModel({ token: 'valid-token' }).title).toBe('Product Designer');
  });
});

describe('integration token workflows', () => {
  it('reuses hardened request headers for CV callback submissions', async () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_test_integration_cv');

    const result = await runIntegrationCvWorkflow({ token: 'valid-token' }, 'Alex Candidate', 'slot-1');
    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.requestHeaders['x-correlation-id']).toBe('corr_test_integration_cv');
    expect(result.requestHeaders['x-requested-with']).toBe('XMLHttpRequest');
  });

  it('keeps CV conflict recovery on the same route workflow', async () => {
    const result = await runIntegrationCvWorkflow({ token: 'conflict-token' }, 'Alex Candidate', 'slot-1');
    expect(result).toEqual({
      status: 'failed',
      stage: 'submission',
      message: 'The selected interview slot is no longer available.',
    });
  });

  it('keeps forms upload and persistence failures recoverable', async () => {
    const uploadFailure = await runIntegrationFormsWorkflow({ token: 'valid-token' }, { stepId: 'identity-document', answer: 'Passport attached', fileName: 'upload-fail.pdf' });
    const submitFailure = await runIntegrationFormsWorkflow({ token: 'valid-token' }, { stepId: 'availability-notes', answer: 'submit-fail note' });

    expect(uploadFailure).toEqual({
      status: 'failed',
      stage: 'binary-transfer',
      message: 'Binary upload failed. Try again.',
    });
    expect(submitFailure).toEqual({
      status: 'failed',
      stage: 'submission',
      message: 'The forms/documents callback could not be saved. Try again.',
    });
  });

  it('advances then completes the forms callback with explicit upload headers', async () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_test_integration_forms');

    const first = await runIntegrationFormsWorkflow({ token: 'valid-token' }, { stepId: 'identity-document', answer: 'Passport attached', fileName: 'passport.pdf' });
    const second = await runIntegrationFormsWorkflow({ token: 'valid-token' }, { stepId: 'availability-notes', answer: 'Available next week' });

    expect(first.status).toBe('advanced');
    expect(second.status).toBe('completed');
    if (first.status !== 'advanced' || second.status !== 'completed') return;
    expect(first.uploadHeaders?.['x-correlation-id']).toBe('corr_test_integration_forms');
    expect(second.requestHeaders['x-correlation-id']).toBe('corr_test_integration_forms');
  });
});
