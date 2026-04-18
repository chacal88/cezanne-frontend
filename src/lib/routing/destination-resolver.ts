import { resolveTypedDestination, type TypedDestination } from './typed-destinations';

export type TypedDestinationResolution = {
  destination: TypedDestination;
  target: string;
  fallbackTarget: '/access-denied';
  status: 'available' | 'not-available-in-r0';
  message?: string;
};

function notAvailableInR0(destination: TypedDestination, family: string): TypedDestinationResolution {
  return {
    destination,
    target: resolveTypedDestination(destination),
    fallbackTarget: '/access-denied',
    status: 'not-available-in-r0',
    message: `${family} destinations are not registered in R0 yet.`,
  };
}

export function resolveTypedDestinationForR0(destination: TypedDestination): TypedDestinationResolution {
  switch (destination.kind) {
    case 'job.detail':
    case 'job.bid.view':
    case 'job.cv.view':
    case 'job.schedule':
    case 'job.offer':
      return notAvailableInR0(destination, 'Jobs');
    case 'candidate.detail':
      return notAvailableInR0(destination, 'Candidate');
    case 'billing.overview':
      return notAvailableInR0(destination, 'Billing');
  }
}
