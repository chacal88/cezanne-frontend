import type { CandidateDetailView } from '../support/models';

export function CandidateDocumentsPanel({ view }: { view: CandidateDetailView }) {
  const degraded = view.degradedSections.includes('documents');
  const contractsDegraded = view.degradedSections.includes('contracts');

  return (
    <section>
      <h2>Documents and contracts</h2>
      <p data-testid="candidate-documents-preview">{view.documentsSummary.previewPath}</p>
      <p data-testid="candidate-documents-version">v{view.documentsSummary.cvVersion}</p>
      <p data-testid="candidate-documents-download">{view.documentsSummary.downloadPath}</p>
      <p data-testid="candidate-documents-count">{view.documentsSummary.candidateOwnedCount}</p>
      <p data-testid="candidate-documents-updated">{view.documentsSummary.lastUpdatedLabel}</p>
      <p data-testid="candidate-documents-state">{degraded ? 'documents unavailable' : 'documents available'}</p>
      <p data-testid="candidate-contracts-state">{contractsDegraded ? 'contracts unavailable' : view.contractsSummary.signingState.kind}</p>
      <p data-testid="candidate-contracts-document">{view.contractsSummary.document.documentId ?? 'no contract document'}</p>
      <p data-testid="candidate-contracts-refresh">{view.contractsSummary.refreshRequired ? 'refresh required' : 'refresh not required'}</p>
      <p data-testid="candidate-contracts-count">{view.contractsSummary.count}</p>
    </section>
  );
}
