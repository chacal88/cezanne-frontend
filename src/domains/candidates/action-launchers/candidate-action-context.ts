import { buildCancelTarget } from '../../../lib/routing';
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
}): CandidateActionContext {
  const defaultParent = buildCandidateDetailPath(input.context);
  const returnTarget = buildCancelTarget(input.pathname, defaultParent, input.parent ?? defaultParent);

  return {
    ...input.context,
    cvId: input.cvId,
    kind: input.kind,
    entryMode: input.entryMode,
    returnTarget,
    recoveryTarget: defaultParent,
    capabilityKey: capabilityByKind[input.kind],
  };
}
