import { buildCandidateActionPath, buildCandidateDetailPath } from '../../domains/candidates/support/routing';
import type { CandidateContextSegments } from '../../domains/candidates/support/models';
import {
  buildPublicApplicationPath,
  buildPublicSurveyPath,
  buildSharedJobPath,
  type PublicApplicationRouteParams,
  type PublicSurveyRouteParams,
  type SharedJobRouteParams,
} from '../../domains/public-external/support/routing';

export type TypedDestination =
  | { kind: 'job.detail'; jobId: string; section?: string }
  | { kind: 'job.bid.view'; jobId: string; bidId: string }
  | { kind: 'job.cv.view'; jobId: string; candidateId: string }
  | { kind: 'job.schedule'; jobId: string; candidateId: string }
  | { kind: 'job.offer'; jobId: string; candidateId: string }
  | { kind: 'job.reject'; jobId: string; candidateId: string }
  | ({ kind: 'candidate.detail' } & CandidateContextSegments)
  | ({ kind: 'candidate.schedule'; cvId: string } & CandidateContextSegments)
  | ({ kind: 'candidate.offer'; cvId: string } & CandidateContextSegments)
  | ({ kind: 'candidate.reject'; cvId: string } & CandidateContextSegments)
  | ({ kind: 'public.shared-job' } & SharedJobRouteParams)
  | ({ kind: 'public.application' } & PublicApplicationRouteParams)
  | ({ kind: 'public.survey' } & PublicSurveyRouteParams)
  | { kind: 'inbox.conversation'; conversationId: string }
  | { kind: 'billing.overview' };

export const typedDestinationKinds = [
  'job.detail',
  'job.bid.view',
  'job.cv.view',
  'job.schedule',
  'job.offer',
  'job.reject',
  'candidate.detail',
  'candidate.schedule',
  'candidate.offer',
  'candidate.reject',
  'public.shared-job',
  'public.application',
  'public.survey',
  'inbox.conversation',
  'billing.overview',
] as const;

export function resolveTypedDestination(destination: TypedDestination): string {
  switch (destination.kind) {
    case 'job.detail': {
      const search = destination.section ? `?section=${encodeURIComponent(destination.section)}` : '';
      return `/job/${destination.jobId}${search}`;
    }
    case 'job.bid.view':
      return `/job/${destination.jobId}/bid/${destination.bidId}`;
    case 'job.cv.view':
      return `/job/${destination.jobId}/cv/${destination.candidateId}`;
    case 'job.schedule':
      return `/job/${destination.jobId}/cv/${destination.candidateId}/schedule`;
    case 'job.offer':
      return `/job/${destination.jobId}/cv/${destination.candidateId}/offer`;
    case 'job.reject':
      return `/job/${destination.jobId}/cv-reject/${destination.candidateId}`;
    case 'candidate.detail':
      return buildCandidateDetailPath(destination);
    case 'candidate.schedule':
      return buildCandidateActionPath('schedule', destination, destination.cvId);
    case 'candidate.offer':
      return buildCandidateActionPath('offer', destination, destination.cvId);
    case 'candidate.reject':
      return buildCandidateActionPath('reject', destination, destination.cvId);
    case 'public.shared-job':
      return buildSharedJobPath(destination);
    case 'public.application':
      return buildPublicApplicationPath(destination);
    case 'public.survey':
      return buildPublicSurveyPath(destination);
    case 'inbox.conversation':
      return `/inbox?conversation=${encodeURIComponent(destination.conversationId)}`;
    case 'billing.overview':
      return '/billing';
  }
}
