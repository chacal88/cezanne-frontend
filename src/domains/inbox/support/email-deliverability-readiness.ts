import { ensureCorrelationId } from '../../../lib/observability';

export type EmailDeliverabilitySetupOwnership = 'backend-only-no-ui';
export type EmailDeliverabilityRouteOwnership = 'none';
export type EmailProviderFamily = 'postmark' | 'smtp' | 'unknown';
export type RedactedDomainCategory = 'managed' | 'fallback' | 'owned' | 'unknown';

export type EmailDomainVerificationStatus = 'verified' | 'pending' | 'failed' | 'unknown' | 'unavailable';
export type SenderSignatureStatus = 'confirmed' | 'pending' | 'failed' | 'not-required' | 'unknown' | 'unavailable';

export type EmailDeliverabilityReadinessState =
  | 'ready'
  | 'domain-pending'
  | 'domain-failed'
  | 'signature-pending'
  | 'signature-failed'
  | 'degraded'
  | 'unavailable'
  | 'unimplemented';

export type EmailDeliverabilityCapabilityOutcome = 'allowed' | 'blocked' | 'degraded' | 'unavailable' | 'unimplemented';

export type EmailDeliverabilityReadinessInput = {
  domainStatus?: EmailDomainVerificationStatus;
  signatureStatus?: SenderSignatureStatus;
  providerFamily?: EmailProviderFamily;
  domainCategory?: RedactedDomainCategory;
  backendContractAvailable?: boolean;
};

export type EmailDeliverabilityReadiness = {
  setupOwnership: EmailDeliverabilitySetupOwnership;
  routeOwnership: EmailDeliverabilityRouteOwnership;
  readinessState: EmailDeliverabilityReadinessState;
  capabilityOutcome: EmailDeliverabilityCapabilityOutcome;
  providerFamily: EmailProviderFamily;
  domainCategory: RedactedDomainCategory;
  canSend: boolean;
  adminRouteTarget?: never;
};

export type EmailDeliverabilityReadinessTelemetryEvent = {
  name: 'email_deliverability_readiness_evaluated';
  data: {
    routeId: 'inbox.home' | 'shell.notifications' | 'candidates.detail';
    capabilityOutcome: EmailDeliverabilityCapabilityOutcome;
    readinessState: EmailDeliverabilityReadinessState;
    providerFamily: EmailProviderFamily;
    domainCategory: RedactedDomainCategory;
    correlationId: string;
  };
};

function normalizeProviderFamily(providerFamily?: EmailProviderFamily): EmailProviderFamily {
  return providerFamily ?? 'unknown';
}

function normalizeDomainCategory(domainCategory?: RedactedDomainCategory): RedactedDomainCategory {
  return domainCategory ?? 'unknown';
}

function readinessFromInput(input: EmailDeliverabilityReadinessInput): Pick<EmailDeliverabilityReadiness, 'readinessState' | 'capabilityOutcome' | 'canSend'> {
  if (input.backendContractAvailable === false) {
    return { readinessState: 'unimplemented', capabilityOutcome: 'unimplemented', canSend: false };
  }

  if (input.domainStatus === 'verified' && (input.signatureStatus === 'confirmed' || input.signatureStatus === 'not-required')) {
    return { readinessState: 'ready', capabilityOutcome: 'allowed', canSend: true };
  }

  if (input.domainStatus === 'pending') {
    return { readinessState: 'domain-pending', capabilityOutcome: 'degraded', canSend: false };
  }

  if (input.domainStatus === 'failed') {
    return { readinessState: 'domain-failed', capabilityOutcome: 'blocked', canSend: false };
  }

  if (input.signatureStatus === 'pending') {
    return { readinessState: 'signature-pending', capabilityOutcome: 'blocked', canSend: false };
  }

  if (input.signatureStatus === 'failed') {
    return { readinessState: 'signature-failed', capabilityOutcome: 'blocked', canSend: false };
  }

  if (input.domainStatus === 'unavailable' || input.signatureStatus === 'unavailable') {
    return { readinessState: 'unavailable', capabilityOutcome: 'unavailable', canSend: false };
  }

  return { readinessState: 'degraded', capabilityOutcome: 'degraded', canSend: false };
}

export function buildEmailDeliverabilityReadiness(input: EmailDeliverabilityReadinessInput): EmailDeliverabilityReadiness {
  return {
    setupOwnership: 'backend-only-no-ui',
    routeOwnership: 'none',
    providerFamily: normalizeProviderFamily(input.providerFamily),
    domainCategory: normalizeDomainCategory(input.domainCategory),
    ...readinessFromInput(input),
  };
}


export type EmailDeliverabilityReadinessAdapter = {
  contract: 'fixture' | 'api';
  loadReadiness(conversationId?: string): EmailDeliverabilityReadinessInput;
};

export const fixtureEmailDeliverabilityReadinessAdapter: EmailDeliverabilityReadinessAdapter = {
  contract: 'fixture',
  loadReadiness(conversationId?: string) {
    if (conversationId === 'conversation-blocked') {
      return { domainStatus: 'failed', signatureStatus: 'confirmed', providerFamily: 'postmark', domainCategory: 'managed' };
    }
    if (conversationId === 'conversation-signature-pending') {
      return { domainStatus: 'verified', signatureStatus: 'pending', providerFamily: 'postmark', domainCategory: 'managed' };
    }
    return { domainStatus: 'verified', signatureStatus: 'confirmed', providerFamily: 'postmark', domainCategory: 'managed' };
  },
};

export function buildEmailDeliverabilityReadinessFromAdapter(input: {
  conversationId?: string;
  adapter?: EmailDeliverabilityReadinessAdapter;
}): EmailDeliverabilityReadiness & { adapterContract: 'fixture' | 'api'; unknownContracts: string[] } {
  const adapter = input.adapter ?? fixtureEmailDeliverabilityReadinessAdapter;
  return {
    ...buildEmailDeliverabilityReadiness(adapter.loadReadiness(input.conversationId)),
    adapterContract: adapter.contract,
    unknownContracts: adapter.contract === 'api' ? [] : ['email deliverability readiness API'],
  };
}

export function buildEmailDeliverabilityReadinessTelemetry(input: {
  routeId: EmailDeliverabilityReadinessTelemetryEvent['data']['routeId'];
  readiness: EmailDeliverabilityReadiness;
}): EmailDeliverabilityReadinessTelemetryEvent {
  return {
    name: 'email_deliverability_readiness_evaluated',
    data: {
      routeId: input.routeId,
      capabilityOutcome: input.readiness.capabilityOutcome,
      readinessState: input.readiness.readinessState,
      providerFamily: input.readiness.providerFamily,
      domainCategory: input.readiness.domainCategory,
      correlationId: ensureCorrelationId(),
    },
  };
}
