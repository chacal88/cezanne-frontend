import { correlationHeaderName, requestedWithHeaderName } from '../../../lib/api-client';
import { completeCandidateAction, getCandidateRecord, uploadCandidateCv } from '../support/store';

describe('candidate document and action workflows', () => {
  it('refreshes candidate-visible state after a candidate action completes', () => {
    completeCandidateAction('candidate-123', 'offer');
    const record = getCandidateRecord('candidate-123');

    expect(record.lastAction).toBe('offer completed');
    expect(record.contractsStatus).toBe('sent');
  });

  it('refreshes preview and summary state after a CV upload', () => {
    const before = getCandidateRecord('candidate-456');
    const requestInit = uploadCandidateCv('candidate-456');
    const after = getCandidateRecord('candidate-456');
    const headers = new Headers(requestInit.headers);

    expect(after.cvVersion).toBe(before.cvVersion + 1);
    expect(after.previewPath).toContain(`v${after.cvVersion}`);
    expect(after.downloadPath).toContain(`v${after.cvVersion}`);
    expect(headers.get(correlationHeaderName)).toBeTruthy();
    expect(headers.get(requestedWithHeaderName)).toBe('XMLHttpRequest');
  });
});
