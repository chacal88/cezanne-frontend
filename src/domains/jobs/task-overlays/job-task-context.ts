import { buildOperationalGateInput, evaluateOperationalReadinessGate } from '../../integrations/support';
import type { IntegrationProviderReadinessSignal } from '../../integrations/support';
import { buildCancelTarget } from '../../../lib/routing';
import { buildInitialCalendarSchedulingState } from '../../scheduling/support';
import { buildContractActionTarget, buildContractSigningState } from '../../contracts/signing';
import type { JobHubSection, JobTaskContext, JobTaskKind } from '../support/models';

export function validateJobTaskSearch(search: Record<string, unknown>) {
  return {
    parent: typeof search.parent === 'string' && search.parent.startsWith('/job/') ? search.parent : undefined,
    section: typeof search.section === 'string' ? (search.section as JobHubSection) : undefined,
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
  readinessSignal?: IntegrationProviderReadinessSignal;
  calendarSlots?: Parameters<typeof buildInitialCalendarSchedulingState>[0]['slots'];
}): JobTaskContext {
  const defaultParent = input.section ? `/job/${input.jobId}?section=${input.section}` : `/job/${input.jobId}`;

  const readinessGate = input.kind === 'schedule' && input.readinessSignal
    ? evaluateOperationalReadinessGate(buildOperationalGateInput(input.readinessSignal, 'job-schedule'))
    : undefined;

  const schedulingState = input.kind === 'schedule'
    ? buildInitialCalendarSchedulingState({
      parentContext: {
        routeFamily: 'job',
        returnTarget: buildCancelTarget(input.pathname, defaultParent, input.parent ?? defaultParent),
        jobId: input.jobId,
        candidateId: input.candidateId,
      },
      readinessGate,
      slots: input.calendarSlots,
    })
    : undefined;

  const parentTarget = buildCancelTarget(input.pathname, defaultParent, input.parent ?? defaultParent);
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
    readinessGate,
    schedulingState,
    contractSigningState,
  };
}
