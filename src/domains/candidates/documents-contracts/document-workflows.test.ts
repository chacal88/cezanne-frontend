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

import { buildCandidateContractSummary } from './contract-summary';

describe('candidate contract signing summaries', () => {
  it('keeps document metadata visible while signing actionability is blocked', () => {
    const summary = buildCandidateContractSummary({
      candidateId: 'candidate-123',
      count: 1,
      status: 'ready',
      parentTarget: '/candidate/candidate-123/cv/cv-123/offer',
      document: { documentId: 'doc-1', fileName: 'contract.pdf' },
      signing: { providerBlocked: true },
    });

    expect(summary.document).toEqual({ documentId: 'doc-1', fileName: 'contract.pdf' });
    expect(summary.signingState).toMatchObject({ kind: 'template-required', canSend: false });
  });

  it('marks candidate summary refresh intent after terminal contract status', () => {
    const summary = buildCandidateContractSummary({
      candidateId: 'candidate-123',
      count: 1,
      status: 'signed',
      parentTarget: '/candidate/candidate-123/cv/cv-123/offer',
      document: { documentId: 'doc-1' },
      signing: { templateId: 'template-1', providerReady: true, terminalOutcome: 'signed' },
    });

    expect(summary.signingState).toMatchObject({ kind: 'signed', terminalOutcome: 'signed', parentRefresh: { refreshCandidate: true } });
    expect(summary.refreshRequired).toBe(true);
  });
});
