import type { ExternalChatNotificationOwnership } from './models';

const ownership: Record<ExternalChatNotificationOwnership['family'], ExternalChatNotificationOwnership> = {
  'user-mentioned': {
    family: 'user-mentioned',
    owner: 'inbox',
    allowsExternalTokenDestination: false,
    reason: 'Mentions continue to resolve to recruiter inbox context and must not synthesize external chat token routes.',
  },
  'cv-reviewed': {
    family: 'cv-reviewed',
    owner: 'candidate.review',
    allowsExternalTokenDestination: false,
    reason: 'Candidate review notifications remain attached to recruiter-owned review context.',
  },
  'cv-interview-feedback': {
    family: 'cv-interview-feedback',
    owner: 'candidate.detail',
    allowsExternalTokenDestination: false,
    reason: 'Interview feedback notifications remain recruiter-internal until a typed external destination is explicitly added.',
  },
};

export function resolveExternalChatNotificationOwnership(family: ExternalChatNotificationOwnership['family']) {
  return ownership[family];
}
