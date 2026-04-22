import type { CandidateDetailView } from '../support/models';

export function CandidateDocumentsPanel({ view }: { view: CandidateDetailView }) {
  const degraded = view.degradedSections.includes('documents');
  const contractsDegraded = view.degradedSections.includes('contracts');

  return (
    <section className="candidate-product-panel" data-testid="candidate-documents-panel">
      <h2>Documents and contracts</h2>
      <p data-testid="candidate-documents-preview">{degraded ? 'preview unavailable' : 'CV preview available'}</p>
      <p data-testid="candidate-documents-version">v{view.documentsSummary.cvVersion}</p>
      <p data-testid="candidate-documents-download">{degraded ? 'download unavailable' : 'download action available'}</p>
      <p data-testid="candidate-documents-count">{view.documentsSummary.candidateOwnedCount} candidate-owned documents</p>
      <p data-testid="candidate-documents-updated">Last updated {view.documentsSummary.lastUpdatedLabel}</p>
      <p data-testid="candidate-documents-state">{degraded ? 'documents unavailable' : 'documents available'}</p>
      <p data-testid="candidate-contracts-state">{contractsDegraded ? 'contracts unavailable' : view.contractsSummary.signingState.kind}</p>
      <p data-testid="candidate-contracts-document">{contractsDegraded ? 'contract metadata unavailable' : 'contract document metadata ready'}</p>
      <p data-testid="candidate-contracts-refresh">{view.contractsSummary.refreshRequired ? 'refresh required' : 'refresh not required'}</p>
      <p data-testid="candidate-contracts-count">{view.contractsSummary.count} contract records</p>
    </section>
  );
}
