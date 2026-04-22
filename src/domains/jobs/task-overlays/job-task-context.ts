import { buildOperationalGateInput, evaluateOperationalReadinessGate } from '../../integrations/support';
import type { IntegrationProviderReadinessSignal } from '../../integrations/support';
import { buildCancelTarget } from '../../../lib/routing';
import { buildInitialCalendarSchedulingState } from '../../scheduling/support';
import { buildContractActionTarget, buildContractSigningState } from '../../contracts/signing';
import type { JobHubSection, JobTaskContext, JobTaskKind } from '../support/models';
import { resolveJobTaskProductState } from '../support/product-depth';

const allowedSections: JobHubSection[] = ['overview', 'candidates', 'workflow', 'activity'];
const allowedOutcomes = ['submit', 'success', 'fail', 'retry', 'cancel'] as const;
const allowedReadinessStates = ['blocked', 'degraded', 'unavailable', 'unimplemented'] as const;

type JobTaskOutcome = (typeof allowedOutcomes)[number];
export type JobTaskReadinessFixtureState = (typeof allowedReadinessStates)[number];

export function validateJobTaskSearch(search: Record<string, unknown>) {
  return {
    parent: typeof search.parent === 'string' && search.parent.startsWith('/job/') ? search.parent : undefined,
    section: typeof search.section === 'string' && (allowedSections as readonly string[]).includes(search.section) ? (search.section as JobHubSection) : undefined,
    outcome: typeof search.outcome === 'string' && (allowedOutcomes as readonly string[]).includes(search.outcome) ? (search.outcome as JobTaskOutcome) : undefined,
    readinessState: typeof search.readinessState === 'string' && (allowedReadinessStates as readonly string[]).includes(search.readinessState) ? (search.readinessState as JobTaskReadinessFixtureState) : undefined,
    parentRefresh: search.parentRefresh === true || search.parentRefresh === 'true' || search.refresh === true || search.refresh === 'true',
  };
}

export function resolveJobTaskContext(input: {
  kind: JobTaskKind;
  pathname: string;
  jobId: string;
  candidateId?: string;
  bidId?: string;
  parent?: string;
  section?: JobHubSection;
  outcome?: JobTaskOutcome;
  parentRefresh?: boolean;
  denied?: boolean;
  unavailable?: boolean;
  degraded?: boolean;
  readinessSignal?: IntegrationProviderReadinessSignal;
  readinessState?: JobTaskReadinessFixtureState;
  calendarSlots?: Parameters<typeof buildInitialCalendarSchedulingState>[0]['slots'];
}): JobTaskContext {
  const defaultParent = input.section ? `/job/${input.jobId}?section=${input.section}` : `/job/${input.jobId}`;

  const fixtureSignal = input.readinessState ? {
    family: 'scheduling' as const,
    providerFamily: 'calendar' as const,
    outcome: input.readinessState,
    reason: 'visual fixture state',
    setupTarget: { providerId: 'calendar-fixture', path: '/integrations/calendar-fixture' as const, label: 'Calendar provider setup' },
  } : undefined;
  const readinessSignal = input.readinessSignal ?? fixtureSignal;
  const readinessGate = input.kind === 'schedule' && readinessSignal
    ? evaluateOperationalReadinessGate(buildOperationalGateInput(readinessSignal, 'job-schedule'))
    : undefined;

  const parentTarget = buildCancelTarget(input.pathname, defaultParent, input.parent ?? defaultParent);
  const operationState = resolveJobTaskProductState({
    kind: input.kind,
    denied: input.denied,
    unavailable: input.unavailable,
    degraded: input.degraded || readinessGate?.state === 'degraded',
    outcome: input.outcome,
    parentRefresh: input.parentRefresh,
    parentTarget,
  });

  const schedulingState = input.kind === 'schedule'
    ? buildInitialCalendarSchedulingState({
      parentContext: {
        routeFamily: 'job',
        returnTarget: parentTarget,
        jobId: input.jobId,
        candidateId: input.candidateId,
      },
      readinessGate,
      slots: input.calendarSlots,
    })
    : undefined;

  const contractSigningState = input.kind === 'offer'
    ? buildContractSigningState({
      actionTarget: buildContractActionTarget({
        routeFamily: 'job',
        taskContext: 'job-offer-overlay',
        parentTarget,
        jobId: input.jobId,
        candidateId: input.candidateId,
        contractId: input.candidateId ? `${input.jobId}-${input.candidateId}-contract` : `${input.jobId}-contract`,
      }),
      document: { documentId: input.candidateId ? `${input.candidateId}-offer-contract-document` : `${input.jobId}-offer-contract-document`, fileName: 'offer-contract.pdf' },
      signing: { templateId: 'offer-template', providerReady: true, currentState: 'ready', downstreamUrlAvailable: true },
    })
    : undefined;

  return {
    kind: input.kind,
    jobId: input.jobId,
    candidateId: input.candidateId,
    bidId: input.bidId,
    section: input.section,
    parentTarget,
    directEntry: !input.parent,
    parentRefreshIntent: input.parentRefresh === true || operationState.kind === 'succeeded' || operationState.kind === 'parent-refresh-required',
    operationState,
    readinessGate,
    schedulingState,
    contractSigningState,
  };
}
