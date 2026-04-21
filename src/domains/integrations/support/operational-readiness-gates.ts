import { ensureCorrelationId } from '../../../lib/observability';
import type {
  IntegrationProviderFamily,
  IntegrationProviderReadinessFamily,
  IntegrationProviderReadinessOutcome,
  IntegrationProviderReadinessSignal,
} from './admin-state';

export type OperationalReadinessActionContext =
  | 'job-schedule'
  | 'candidate-schedule'
  | 'job-publishing'
  | 'job-listing-publishing'
  | 'hris-workflow';

export type ProviderSetupRecoveryTarget = {
  providerId: string;
  path: `/integrations/${string}`;
  label: string;
};

export type OperationalReadinessGateInput = IntegrationProviderReadinessSignal & {
  actionContext: OperationalReadinessActionContext;
  setupTarget?: ProviderSetupRecoveryTarget;
};

export type OperationalReadinessGateState = IntegrationProviderReadinessOutcome;

export type ProviderReadinessGateTelemetryData = {
  readinessFamily: IntegrationProviderReadinessFamily;
  providerFamily: IntegrationProviderFamily;
  outcome: OperationalReadinessGateState;
  actionContext: OperationalReadinessActionContext;
  recoveryTargetType: 'provider-setup' | 'none';
  correlationId: string;
};

export type ProviderReadinessGateTelemetryEvent = {
  name: 'provider_readiness_gate_evaluated';
  data: ProviderReadinessGateTelemetryData;
};

export type OperationalReadinessGateResult = {
  canProceed: boolean;
  state: OperationalReadinessGateState;
  message: string;
  setupTarget?: ProviderSetupRecoveryTarget;
  telemetry: ProviderReadinessGateTelemetryEvent;
};

const actionLabels: Record<OperationalReadinessActionContext, string> = {
  'job-schedule': 'job scheduling',
  'candidate-schedule': 'candidate scheduling',
  'job-publishing': 'job publishing',
  'job-listing-publishing': 'job listing publishing',
  'hris-workflow': 'HRIS workflow',
};

const familyLabels: Record<IntegrationProviderReadinessFamily, string> = {
  scheduling: 'Scheduling',
  publishing: 'Publishing',
  'sync-workflow': 'HRIS workflow',
  'ats-sync-import': 'ATS sync/import',
  'assessment-review-scoring': 'Assessment review/scoring',
};

function safeTelemetry(input: OperationalReadinessGateInput): ProviderReadinessGateTelemetryEvent {
  return {
    name: 'provider_readiness_gate_evaluated',
    data: {
      readinessFamily: input.family,
      providerFamily: input.providerFamily,
      outcome: input.outcome,
      actionContext: input.actionContext,
      recoveryTargetType: input.setupTarget ? 'provider-setup' : 'none',
      correlationId: ensureCorrelationId(),
    },
  };
}

function messageFor(input: OperationalReadinessGateInput) {
  const actionLabel = actionLabels[input.actionContext];
  const familyLabel = familyLabels[input.family];

  if (input.outcome === 'ready') return `${familyLabel} readiness is ready for ${actionLabel}.`;
  if (input.outcome === 'degraded') return `${familyLabel} readiness is degraded. Repair provider setup before submitting ${actionLabel}.`;
  if (input.outcome === 'blocked') return `${familyLabel} readiness is blocked. Review provider setup before submitting ${actionLabel}.`;
  if (input.outcome === 'unavailable') return `${familyLabel} readiness is unavailable for ${actionLabel}.`;
  return `${familyLabel} readiness is unsupported for this provider family.`;
}

export function evaluateOperationalReadinessGate(input: OperationalReadinessGateInput): OperationalReadinessGateResult {
  return {
    canProceed: input.outcome === 'ready',
    state: input.outcome,
    message: messageFor(input),
    setupTarget: input.setupTarget,
    telemetry: safeTelemetry(input),
  };
}

export function buildOperationalGateInput(
  signal: IntegrationProviderReadinessSignal,
  actionContext: OperationalReadinessActionContext,
): OperationalReadinessGateInput {
  return {
    ...signal,
    actionContext,
    setupTarget: signal.setupTarget,
  };
}
