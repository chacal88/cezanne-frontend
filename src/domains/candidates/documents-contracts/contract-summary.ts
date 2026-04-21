import { buildContractActionTarget, buildContractSigningState } from '../../contracts/signing';
import type { ContractDocumentMetadata, ContractSigningState, ContractSigningStatus } from '../../contracts/signing';

export type CandidateContractSummaryInput = {
  candidateId: string;
  count: number;
  status: string;
  parentTarget: string;
  document?: ContractDocumentMetadata;
  signing?: ContractSigningStatus;
};

export type CandidateContractSummaryView = {
  status: string;
  count: number;
  document: ContractDocumentMetadata;
  signingState: ContractSigningState;
  refreshRequired: boolean;
};

function signingFromLegacyStatus(status: string, fallback?: ContractSigningStatus): ContractSigningStatus {
  if (fallback) return fallback;
  if (status === 'sent') return { templateId: 'legacy-template', providerReady: true, currentState: 'sent', downstreamUrlAvailable: true };
  if (status === 'provider-down') return { templateId: 'legacy-template', providerBlocked: true, currentState: 'provider-blocked' };
  if (status === 'not-started') return { providerReady: true };
  return { templateId: 'legacy-template', providerReady: true, currentState: 'ready', downstreamUrlAvailable: true };
}

export function buildCandidateContractSummary(input: CandidateContractSummaryInput): CandidateContractSummaryView {
  const document = input.document ?? (input.count > 0 ? { documentId: `${input.candidateId}-contract-document`, fileName: 'contract.pdf' } : {});
  const signingState = buildContractSigningState({
    actionTarget: buildContractActionTarget({
      routeFamily: 'candidate',
      taskContext: 'candidate-contract-summary',
      parentTarget: input.parentTarget,
      candidateId: input.candidateId,
      contractId: input.count > 0 ? `${input.candidateId}-contract` : undefined,
    }),
    document,
    signing: signingFromLegacyStatus(input.status, input.signing),
  });

  return {
    status: input.status,
    count: input.count,
    document,
    signingState,
    refreshRequired: Boolean(signingState.parentRefresh) || signingState.kind === 'status-stale',
  };
}
