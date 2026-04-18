export type TypedDestination =
  | { kind: 'job.detail'; jobId: string }
  | { kind: 'job.bid.view'; jobId: string; bidId: string }
  | { kind: 'job.cv.view'; jobId: string; candidateId: string }
  | { kind: 'job.schedule'; jobId: string; candidateId: string }
  | { kind: 'job.offer'; jobId: string; candidateId: string }
  | { kind: 'candidate.detail'; candidateId: string }
  | { kind: 'billing.overview' };

export const typedDestinationKinds = [
  'job.detail',
  'job.bid.view',
  'job.cv.view',
  'job.schedule',
  'job.offer',
  'candidate.detail',
  'billing.overview',
] as const;

export function resolveTypedDestination(destination: TypedDestination): string {
  switch (destination.kind) {
    case 'job.detail':
      return `/jobs/${destination.jobId}`;
    case 'job.bid.view':
      return `/jobs/${destination.jobId}/bids/${destination.bidId}`;
    case 'job.cv.view':
      return `/jobs/${destination.jobId}/candidates/${destination.candidateId}/cv`;
    case 'job.schedule':
      return `/jobs/${destination.jobId}/candidates/${destination.candidateId}/schedule`;
    case 'job.offer':
      return `/jobs/${destination.jobId}/candidates/${destination.candidateId}/offer`;
    case 'candidate.detail':
      return `/candidates/${destination.candidateId}`;
    case 'billing.overview':
      return '/billing';
  }
}
