import type { CandidateContextSegments } from '../support/models';
import { buildCandidateDetailPath } from '../support/routing';

const seededSequence = ['candidate-123', 'candidate-456', 'candidate-degraded'] as const;

export function resolveCandidateSequence(context: CandidateContextSegments) {
  if (!context.jobId || !context.order || !context.filters) {
    return { state: 'unavailable' as const };
  }

  if (context.order === 'stale' || context.filters === 'stale') {
    return { state: 'stale' as const };
  }

  const index = seededSequence.indexOf(context.candidateId as (typeof seededSequence)[number]);
  if (index === -1) return { state: 'unavailable' as const };

  return {
    state: 'available' as const,
    previousCandidatePath: seededSequence[index - 1]
      ? buildCandidateDetailPath({ ...context, candidateId: seededSequence[index - 1] })
      : undefined,
    nextCandidatePath: seededSequence[index + 1]
      ? buildCandidateDetailPath({ ...context, candidateId: seededSequence[index + 1] })
      : undefined,
  };
}
