import { ensureCorrelationId } from '../../../lib/observability';

export const contractSigningStates = [
  'loading',
  'ready',
  'template-required',
  'document-required',
  'sending',
  'sent',
  'send-failed',
  'signing-pending',
  'signed',
  'declined',
  'expired',
  'voided',
  'status-stale',
  'provider-blocked',
  'degraded',
  'unavailable',
] as const;

export type ContractSigningStateKind = (typeof contractSigningStates)[number];
export type ContractSigningRouteFamily = 'candidate' | 'job';
export type ContractSigningTaskContext = 'candidate-contract-summary' | 'candidate-offer-launcher' | 'job-offer-overlay';
export type ContractSigningAction = 'launch' | 'send-start' | 'send-failure' | 'retry' | 'status-refresh' | 'downstream-handoff' | 'terminal-outcome';
export type ContractTerminalOutcome = 'signed' | 'declined' | 'expired' | 'voided';
export type ContractSendOutcome = 'sent' | 'signing-pending' | 'send-failed' | 'provider-blocked' | 'degraded' | 'unavailable';
export type ContractRefreshOutcome = ContractTerminalOutcome | 'sent' | 'signing-pending' | 'status-stale' | 'degraded' | 'unavailable';

export type ContractDocumentMetadata = {
  documentId?: string;
  fileName?: string;
  version?: string;
  generatedAt?: string;
};

export type ContractSigningStatus = {
  templateId?: string;
  providerReady?: boolean;
  providerBlocked?: boolean;
  degraded?: boolean;
  unavailable?: boolean;
  stale?: boolean;
  downstreamUrlAvailable?: boolean;
  terminalOutcome?: ContractTerminalOutcome;
  currentState?: ContractSigningStateKind;
};

export type ContractActionTarget = {
  routeFamily: ContractSigningRouteFamily;
  taskContext: ContractSigningTaskContext;
  parentTarget: string;
  candidateId?: string;
  jobId?: string;
  contractId?: string;
};

export type ContractSigningPrerequisites = {
  hasTemplate: boolean;
  hasDocument: boolean;
  providerReady: boolean;
  degraded: boolean;
  unavailable: boolean;
  stale: boolean;
};

export type ContractParentRefreshIntent = {
  refreshCandidate: boolean;
  refreshJob: boolean;
  returnTarget: string;
};

export type ContractDownstreamHandoff = {
  action: 'downstream-handoff';
  canLaunch: boolean;
  parentRefresh: ContractParentRefreshIntent;
  state: ContractSigningStateKind;
  message: string;
};

export type ContractSigningState = {
  kind: ContractSigningStateKind;
  routeFamily: ContractSigningRouteFamily;
  taskContext: ContractSigningTaskContext;
  actionTarget: ContractActionTarget;
  document: ContractDocumentMetadata;
  prerequisites: ContractSigningPrerequisites;
  canSend: boolean;
  canRetry: boolean;
  canRefreshStatus: boolean;
  canLaunchDownstream: boolean;
  parentRefresh?: ContractParentRefreshIntent;
  terminalOutcome?: ContractTerminalOutcome;
  message: string;
};

export type ContractSigningTelemetryEvent = {
  name: 'contract_signing_action';
  data: {
    routeFamily: ContractSigningRouteFamily;
    action: ContractSigningAction;
    contractState: ContractSigningStateKind;
    taskContext: ContractSigningTaskContext;
    terminalOutcome?: ContractTerminalOutcome;
    correlationId: string;
  };
};

function buildParentRefreshIntent(target: ContractActionTarget): ContractParentRefreshIntent {
  return {
    refreshCandidate: target.routeFamily === 'candidate' || Boolean(target.candidateId),
    refreshJob: target.routeFamily === 'job' || Boolean(target.jobId),
    returnTarget: target.parentTarget,
  };
}

function prerequisitesFor(document: ContractDocumentMetadata, signing: ContractSigningStatus): ContractSigningPrerequisites {
  return {
    hasTemplate: Boolean(signing.templateId),
    hasDocument: Boolean(document.documentId),
    providerReady: signing.providerReady !== false && !signing.providerBlocked,
    degraded: Boolean(signing.degraded),
    unavailable: Boolean(signing.unavailable),
    stale: Boolean(signing.stale),
  };
}

function messageFor(kind: ContractSigningStateKind): string {
  const messages: Record<ContractSigningStateKind, string> = {
    loading: 'Loading contract signing state.',
    ready: 'Contract is ready to send or launch.',
    'template-required': 'Select a contract template before sending.',
    'document-required': 'Generate or attach a contract document before sending.',
    sending: 'Sending contract for signature.',
    sent: 'Contract sent. Refresh the parent summary before returning.',
    'send-failed': 'Contract send failed and can be retried.',
    'signing-pending': 'Contract is waiting for signer action.',
    signed: 'Contract was signed. Refresh the parent summary.',
    declined: 'Contract was declined. Refresh the parent summary.',
    expired: 'Contract signing expired. Refresh the parent summary.',
    voided: 'Contract signing was voided. Refresh the parent summary.',
    'status-stale': 'Signing status is stale. Refresh status before claiming a terminal state.',
    'provider-blocked': 'Signing provider setup blocks this action.',
    degraded: 'Signing provider is degraded. Try again after remediation.',
    unavailable: 'Contract signing is unavailable for this route.',
  };
  return messages[kind];
}

function normalizeInitialKind(prerequisites: ContractSigningPrerequisites, signing: ContractSigningStatus): ContractSigningStateKind {
  if (signing.currentState === 'loading') return 'loading';
  if (!prerequisites.hasTemplate) return 'template-required';
  if (!prerequisites.hasDocument) return 'document-required';
  if (!prerequisites.providerReady || signing.providerBlocked) return 'provider-blocked';
  if (prerequisites.unavailable) return 'unavailable';
  if (prerequisites.degraded) return 'degraded';
  if (prerequisites.stale) return 'status-stale';
  if (signing.terminalOutcome) return signing.terminalOutcome;
  if (signing.currentState && contractSigningStates.includes(signing.currentState)) return signing.currentState;
  return 'ready';
}

export function buildContractActionTarget(input: ContractActionTarget): ContractActionTarget {
  return {
    routeFamily: input.routeFamily,
    taskContext: input.taskContext,
    parentTarget: input.parentTarget,
    candidateId: input.candidateId,
    jobId: input.jobId,
    contractId: input.contractId,
  };
}

export function buildContractSigningState(input: {
  actionTarget: ContractActionTarget;
  document?: ContractDocumentMetadata;
  signing?: ContractSigningStatus;
}): ContractSigningState {
  const document = input.document ?? {};
  const signing = input.signing ?? {};
  const prerequisites = prerequisitesFor(document, signing);
  const kind = normalizeInitialKind(prerequisites, signing);
  const terminalOutcome = ['signed', 'declined', 'expired', 'voided'].includes(kind) ? (kind as ContractTerminalOutcome) : signing.terminalOutcome;

  return {
    kind,
    routeFamily: input.actionTarget.routeFamily,
    taskContext: input.actionTarget.taskContext,
    actionTarget: input.actionTarget,
    document,
    prerequisites,
    canSend: kind === 'ready',
    canRetry: kind === 'send-failed' || kind === 'status-stale',
    canRefreshStatus: kind === 'status-stale' || kind === 'signing-pending' || kind === 'sent',
    canLaunchDownstream: (kind === 'sent' || kind === 'signing-pending' || kind === 'ready') && signing.downstreamUrlAvailable !== false,
    parentRefresh: terminalOutcome ? buildParentRefreshIntent(input.actionTarget) : undefined,
    terminalOutcome,
    message: messageFor(kind),
  };
}

export function startContractSend(state: ContractSigningState): ContractSigningState {
  if (!state.canSend) return state;
  return { ...state, kind: 'sending', canSend: false, canRetry: false, canRefreshStatus: false, message: messageFor('sending') };
}

export function resolveContractSendResult(state: ContractSigningState, outcome: ContractSendOutcome): ContractSigningState {
  const parentRefresh = outcome === 'sent' || outcome === 'signing-pending' ? buildParentRefreshIntent(state.actionTarget) : undefined;
  return {
    ...state,
    kind: outcome,
    canSend: false,
    canRetry: outcome === 'send-failed',
    canRefreshStatus: outcome === 'sent' || outcome === 'signing-pending',
    canLaunchDownstream: outcome === 'sent' || outcome === 'signing-pending',
    parentRefresh,
    message: messageFor(outcome),
  };
}

export function retryContractSend(state: ContractSigningState): ContractSigningState {
  if (!state.canRetry) return state;
  return { ...state, kind: 'ready', canSend: true, canRetry: false, canRefreshStatus: false, canLaunchDownstream: true, message: 'Retry contract signing with the current document and template.' };
}

export function refreshContractSigningStatus(state: ContractSigningState, outcome: ContractRefreshOutcome): ContractSigningState {
  const terminalOutcome = ['signed', 'declined', 'expired', 'voided'].includes(outcome) ? (outcome as ContractTerminalOutcome) : undefined;
  return {
    ...state,
    kind: outcome,
    terminalOutcome,
    canSend: false,
    canRetry: outcome === 'status-stale',
    canRefreshStatus: outcome === 'status-stale' || outcome === 'sent' || outcome === 'signing-pending',
    canLaunchDownstream: outcome === 'sent' || outcome === 'signing-pending',
    parentRefresh: terminalOutcome ? buildParentRefreshIntent(state.actionTarget) : state.parentRefresh,
    message: messageFor(outcome),
  };
}

export function buildContractDownstreamHandoff(state: ContractSigningState): ContractDownstreamHandoff {
  const canLaunch = state.canLaunchDownstream && state.kind !== 'status-stale';
  return {
    action: 'downstream-handoff',
    canLaunch,
    parentRefresh: buildParentRefreshIntent(state.actionTarget),
    state: canLaunch ? state.kind : 'status-stale',
    message: canLaunch ? 'Launch downstream signer and refresh parent context on return.' : messageFor('status-stale'),
  };
}

export function buildContractSigningTelemetry(input: {
  routeFamily: ContractSigningRouteFamily;
  action: ContractSigningAction;
  contractState: ContractSigningStateKind;
  taskContext: ContractSigningTaskContext;
  terminalOutcome?: ContractTerminalOutcome;
  correlationId?: string;
}): ContractSigningTelemetryEvent {
  return {
    name: 'contract_signing_action',
    data: {
      routeFamily: input.routeFamily,
      action: input.action,
      contractState: input.contractState,
      taskContext: input.taskContext,
      terminalOutcome: input.terminalOutcome,
      correlationId: input.correlationId ?? ensureCorrelationId(),
    },
  };
}
