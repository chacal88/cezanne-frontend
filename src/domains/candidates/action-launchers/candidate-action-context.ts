import { buildOperationalGateInput, evaluateOperationalReadinessGate } from '../../integrations/support';
import type { IntegrationProviderReadinessSignal } from '../../integrations/support';
import { buildCancelTarget } from '../../../lib/routing';
import { buildInitialCalendarSchedulingState } from '../../scheduling/support';
import { buildContractActionTarget, buildContractSigningState } from '../../contracts/signing';
import { buildSurveyReviewScoringState } from '../surveys-custom-fields/support';
import type { CandidateActionContext, CandidateActionKind, CandidateContextSegments, CandidateRouteEntryMode } from '../support/models';
import { buildCandidateDetailPath } from '../support/routing';

const capabilityByKind = {
  schedule: 'canScheduleInterviewFromCandidate',
  offer: 'canCreateOfferFromCandidate',
  reject: 'canRejectCandidate',
} as const;

export function resolveCandidateActionContext(input: {
  kind: CandidateActionKind;
  pathname: string;
  context: CandidateContextSegments;
  cvId: string;
  parent?: string;
  entryMode: CandidateRouteEntryMode;
  readinessSignal?: IntegrationProviderReadinessSignal;
  calendarSlots?: Parameters<typeof buildInitialCalendarSchedulingState>[0]['slots'];
  reviewReadiness?: Parameters<typeof buildSurveyReviewScoringState>[0]['readiness'];
}): CandidateActionContext {
  const defaultParent = buildCandidateDetailPath(input.context);
  const returnTarget = buildCancelTarget(input.pathname, defaultParent, input.parent ?? defaultParent);

  const readinessGate = input.kind === 'schedule' && input.readinessSignal
    ? evaluateOperationalReadinessGate(buildOperationalGateInput(input.readinessSignal, 'candidate-schedule'))
    : undefined;

  const schedulingState = input.kind === 'schedule'
    ? buildInitialCalendarSchedulingState({
      parentContext: {
        routeFamily: 'candidate',
        returnTarget,
        recoveryTarget: defaultParent,
        jobId: input.context.jobId,
        candidateId: input.context.candidateId,
      },
      readinessGate,
      slots: input.calendarSlots,
    })
    : undefined;

  const contractSigningState = input.kind === 'offer'
    ? buildContractSigningState({
      actionTarget: buildContractActionTarget({
        routeFamily: 'candidate',
        taskContext: 'candidate-offer-launcher',
        parentTarget: returnTarget,
        candidateId: input.context.candidateId,
        jobId: input.context.jobId,
        contractId: `${input.context.candidateId}-${input.cvId}-contract`,
      }),
      document: { documentId: `${input.context.candidateId}-${input.cvId}-contract-document`, fileName: 'offer-contract.pdf' },
      signing: { templateId: 'offer-template', providerReady: true, currentState: 'ready', downstreamUrlAvailable: true },
    })
    : undefined;



  const surveyReviewScoringState = input.kind === 'reject'
    ? buildSurveyReviewScoringState({
      routeFamily: 'candidate-review-launcher',
      taskContext: 'candidate-review-launcher',
      readiness: input.reviewReadiness ?? { schemaReady: true, templateReady: true, reviewerReady: true, tokenBoundary: 'authenticated' },
      draft: { answerCount: 1, requiredAnswerCount: 1, hasRecommendation: true },
      parentContext: {
        returnTarget,
        candidateId: input.context.candidateId,
        jobId: input.context.jobId,
      },
    })
    : undefined;

  return {
    ...input.context,
    cvId: input.cvId,
    kind: input.kind,
    entryMode: input.entryMode,
    returnTarget,
    recoveryTarget: defaultParent,
    capabilityKey: capabilityByKind[input.kind],
    readinessGate,
    schedulingState,
    contractSigningState,
    surveyReviewScoringState,
  };
}
