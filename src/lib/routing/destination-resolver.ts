import { resolveTypedDestination, type TypedDestination } from './typed-destinations';

export type TypedDestinationResolution = {
  destination: TypedDestination;
  target: string;
  fallbackTarget: '/access-denied';
  status: 'available' | 'not-available-in-r0' | 'not-available-in-r1';
  message?: string;
};

function notAvailable(destination: TypedDestination, family: string, status: TypedDestinationResolution['status']) {
  return {
    destination,
    target: resolveTypedDestination(destination),
    fallbackTarget: '/access-denied' as const,
    status,
    message: `${family} destinations are not registered yet for this slice.`,
  };
}

export function resolveTypedDestinationForR0(destination: TypedDestination): TypedDestinationResolution {
  switch (destination.kind) {
    case 'job.detail':
    case 'job.bid.view':
    case 'job.cv.view':
    case 'job.schedule':
    case 'job.offer':
    case 'job.reject':
    case 'candidate.detail':
    case 'candidate.schedule':
    case 'candidate.offer':
    case 'candidate.reject':
    case 'public.shared-job':
    case 'public.application':
    case 'public.survey':
      return {
        destination,
        target: resolveTypedDestination(destination),
        fallbackTarget: '/access-denied',
        status: 'available',
      };
    case 'billing.overview':
      return notAvailable(destination, 'Billing', 'not-available-in-r1');
  }
}
