import type { ExternalNotificationFamily, NotificationOwnershipRule } from './models';

const notificationOwnershipRules: Record<ExternalNotificationFamily, NotificationOwnershipRule> = {
  'cv-interview-feedback': {
    family: 'cv-interview-feedback',
    owner: 'candidate.detail',
    allowsExternalTokenDestination: false,
    reason: 'Interview feedback notifications remain recruiter-internal until an explicit external destination contract exists.',
  },
  'cv-reviewed': {
    family: 'cv-reviewed',
    owner: 'candidate.review',
    allowsExternalTokenDestination: false,
    reason: 'Candidate review notifications keep recruiter-owned review context and must not synthesize token links.',
  },
  'user-mentioned': {
    family: 'user-mentioned',
    owner: 'inbox',
    allowsExternalTokenDestination: false,
    reason: 'Mentions resolve to recruiter inbox context, not external-token routes.',
  },
};

export function resolveExternalReviewNotificationOwnership(family: ExternalNotificationFamily): NotificationOwnershipRule {
  return notificationOwnershipRules[family];
}
