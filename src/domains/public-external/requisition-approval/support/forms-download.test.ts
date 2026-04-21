import { beforeEach, describe, expect, it } from 'vitest';
import { resetCorrelationId, setActiveCorrelationId } from '../../../../lib/observability';
import {
  buildRequisitionFormsDownloadPath,
  buildRequisitionFormsDownloadViewModel,
  evaluateRequisitionFormsDownloadAccess,
  runRequisitionFormsDownload,
  validateRequisitionFormsDownloadSearch,
} from './forms-download';

describe('requisition forms download route contract', () => {
  beforeEach(() => {
    resetCorrelationId();
  });

  it('parses token search and download mode without auto-running the workflow', () => {
    expect(validateRequisitionFormsDownloadSearch({ token: 'valid-token', download: 'true' })).toEqual({ token: 'valid-token', download: true });
    expect(validateRequisitionFormsDownloadSearch({ token: 'valid-token', download: '1' })).toEqual({ token: 'valid-token', download: true });
    expect(validateRequisitionFormsDownloadSearch({ token: 'valid-token' })).toEqual({ token: 'valid-token', download: false });
    expect(buildRequisitionFormsDownloadPath({ formId: 'form-123', token: 'valid-token', download: true })).toBe('/job-requisition-forms/form-123?token=valid-token&download=true');
  });

  it('keeps token and form target failures separate', () => {
    expect(evaluateRequisitionFormsDownloadAccess({ formId: 'form-123', token: 'expired-token' })).toMatchObject({
      capabilityKey: 'canDownloadRequisitionFormsByToken',
      tokenState: 'expired',
      readiness: 'token-state',
      canDownload: false,
    });

    expect(evaluateRequisitionFormsDownloadAccess({ formId: 'not-found-form', token: 'valid-token' })).toMatchObject({
      tokenState: 'valid',
      readiness: 'not-found',
      canDownload: false,
    });
  });

  it('maps consumed links to document-oriented already-downloaded state, not approval terminal state', () => {
    expect(evaluateRequisitionFormsDownloadAccess({ formId: 'form-123', token: 'used-token' })).toMatchObject({
      tokenState: 'used',
      readiness: 'already-downloaded',
      reason: 'already-downloaded',
    });
  });

  it('serializes a successful explicit download with hardened request headers', async () => {
    setActiveCorrelationId('corr_forms_download');
    const view = buildRequisitionFormsDownloadViewModel({ formId: 'bundle-123', token: 'valid-token', download: true });

    const result = await runRequisitionFormsDownload({ view });

    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.fileName).toBe('bundle-123.pdf');
    expect(result.requestHeaders['x-correlation-id']).toBe('corr_forms_download');
    expect(result.requestHeaders['x-requested-with']).toBeUndefined();
  });


  it('does not mark target/access failures as retryable download failures', async () => {
    const view = buildRequisitionFormsDownloadViewModel({ formId: 'not-found-form', token: 'valid-token', download: true });

    const result = await runRequisitionFormsDownload({ view });

    expect(result).toEqual({
      status: 'failed',
      stage: 'access',
      message: 'The requested requisition forms were not found.',
      retryable: false,
    });
  });

  it('keeps retryable download failures in route', async () => {
    const view = buildRequisitionFormsDownloadViewModel({ formId: 'download-fail-form', token: 'valid-token', download: true });

    const result = await runRequisitionFormsDownload({ view });

    expect(result).toEqual({
      status: 'failed',
      stage: 'download',
      message: 'The requisition forms download failed. Try again.',
      retryable: true,
    });
  });
});
