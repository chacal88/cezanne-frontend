import { resolveTypedDestinationForR0, type TypedDestination } from '../../lib/routing';
import type { Capabilities } from '../../lib/access-control';

export type NotificationReadState = 'read' | 'unread';
export type NotificationCenterStateKind =
  | 'loading'
  | 'empty'
  | 'ready'
  | 'stale-target'
  | 'missing-target'
  | 'unknown-destination'
  | 'unsupported-destination'
  | 'denied-target'
  | 'fallback';
export type NotificationCenterLoadState = 'loading' | 'empty' | 'ready' | 'degraded' | 'unavailable';
export type ShellNotificationFixture = {
  id: string;
  labelKey: 'notifications.seeded.candidateFollowUp' | 'notifications.seeded.offerAttention' | 'notifications.seeded.billingFallback' | 'notifications.seeded.inboxConversation' | 'notifications.seeded.unknownDestination' | 'notifications.seeded.staleCandidate';
  destination?: TypedDestination;
  readState: NotificationReadState;
  force?: Exclude<NotificationCenterStateKind, 'loading' | 'empty' | 'ready'>;
};
export type NotificationViewModel = {
  id: string;
  labelKey: ShellNotificationFixture['labelKey'];
  readState: NotificationReadState;
  state: NotificationCenterStateKind;
  target: string;
  fallbackTarget: '/dashboard' | '/access-denied' | '/inbox';
  destinationKind: string;
  entryMode: 'notification';
  refreshRequired: boolean;
  message: string;
};

export type NotificationCenterViewModel = {
  state: NotificationCenterLoadState;
  items: NotificationViewModel[];
  unreadCount: number;
  adapterContract: 'fixture' | 'api';
  unknownContracts: string[];
};

export type NotificationListAdapter = {
  contract: 'fixture' | 'api';
  load(): readonly ShellNotificationFixture[];
};

export const foundationNotifications: ShellNotificationFixture[] = [
  { id: 'n-1', labelKey: 'notifications.seeded.candidateFollowUp', readState: 'unread', destination: { kind: 'candidate.detail', candidateId: 'candidate-123', jobId: 'job-456', status: 'screening', order: '2', filters: 'remote', interview: 'interview-1' } },
  { id: 'n-2', labelKey: 'notifications.seeded.offerAttention', readState: 'read', destination: { kind: 'job.offer', jobId: 'job-456', candidateId: 'candidate-123' } },
  { id: 'n-3', labelKey: 'notifications.seeded.inboxConversation', readState: 'unread', destination: { kind: 'inbox.conversation', conversationId: 'conversation-123' } },
  { id: 'n-4', labelKey: 'notifications.seeded.billingFallback', readState: 'unread', destination: { kind: 'billing.overview' } },
  { id: 'n-5', labelKey: 'notifications.seeded.unknownDestination', readState: 'unread' },
  { id: 'n-6', labelKey: 'notifications.seeded.staleCandidate', readState: 'read', destination: { kind: 'candidate.detail', candidateId: 'candidate-stale' }, force: 'stale-target' },
];

export const fixtureNotificationAdapter: NotificationListAdapter = {
  contract: 'fixture',
  load: () => foundationNotifications,
};

function messageForState(state: NotificationCenterStateKind) {
  const messages: Record<NotificationCenterStateKind, string> = {
    loading: 'Notifications are loading.',
    empty: 'No notifications are available.',
    ready: 'Destination is available.',
    'stale-target': 'Destination exists but is stale and should refresh from dashboard.',
    'missing-target': 'Destination target is missing.',
    'unknown-destination': 'Notification payload does not include a typed destination.',
    'unsupported-destination': 'Destination is not owned by this frontend slice.',
    'denied-target': 'Destination is denied for this user.',
    fallback: 'Destination fell back to a safe route.',
  };
  return messages[state];
}

function dashboardFallback(reason: 'notification-fallback' | 'denied-target' | 'stale-target' | 'missing-target' | 'unsupported-destination', fallbackTarget?: string) {
  const params = new URLSearchParams({ reason });
  if (fallbackTarget) params.set('fallbackTarget', fallbackTarget);
  return `/dashboard?${params.toString()}`;
}

export function buildNotificationCenterState(
  items: readonly ShellNotificationFixture[],
  capabilities?: Pick<Capabilities, 'canResolveNotificationDestination' | 'canUseInbox'>,
): NotificationViewModel[] {
  return items.map((item) => {
    if (!item.destination) {
      return {
        id: item.id,
        labelKey: item.labelKey,
        readState: item.readState,
        state: 'unknown-destination',
        target: dashboardFallback('missing-target'),
        fallbackTarget: '/dashboard',
        destinationKind: 'unknown',
        entryMode: 'notification',
        refreshRequired: false,
        message: messageForState('unknown-destination'),
      };
    }

    const resolved = resolveTypedDestinationForR0(item.destination);
    const isInbox = item.destination.kind === 'inbox.conversation';
    const forced = item.force;
    const capabilityDenied = capabilities?.canResolveNotificationDestination === false || (isInbox && capabilities?.canUseInbox === false);
    const state: NotificationCenterStateKind = forced
      ?? (capabilityDenied ? 'denied-target' : resolved.status === 'available' ? 'ready' : 'unsupported-destination');
    const fallbackTarget = isInbox ? '/inbox' : state === 'ready' ? '/access-denied' : '/dashboard';
    const fallbackReason = state === 'stale-target' ? 'stale-target' : state === 'missing-target' ? 'missing-target' : state === 'unsupported-destination' ? 'unsupported-destination' : state === 'denied-target' ? 'denied-target' : 'notification-fallback';
    return {
      id: item.id,
      labelKey: item.labelKey,
      readState: item.readState,
      state,
      target: state === 'ready' ? resolved.target : dashboardFallback(fallbackReason, fallbackTarget),
      fallbackTarget,
      destinationKind: item.destination.kind,
      entryMode: 'notification',
      refreshRequired: state === 'stale-target',
      message: messageForState(state),
    };
  });
}

export function buildNotificationCenterViewModel(input: {
  adapter?: NotificationListAdapter;
  loading?: boolean;
  unavailable?: boolean;
  capabilities?: Pick<Capabilities, 'canResolveNotificationDestination' | 'canUseInbox'>;
} = {}): NotificationCenterViewModel {
  if (input.loading) return { state: 'loading', items: [], unreadCount: 0, adapterContract: input.adapter?.contract ?? 'fixture', unknownContracts: [] };
  if (input.unavailable) return { state: 'unavailable', items: [], unreadCount: 0, adapterContract: input.adapter?.contract ?? 'fixture', unknownContracts: ['notification list API'] };

  const adapter = input.adapter ?? fixtureNotificationAdapter;
  const items = buildNotificationCenterState(adapter.load(), input.capabilities);
  const hasFallbacks = items.some((item) => item.state !== 'ready');
  return {
    state: items.length === 0 ? 'empty' : hasFallbacks ? 'degraded' : 'ready',
    items,
    unreadCount: items.filter((item) => item.readState === 'unread').length,
    adapterContract: adapter.contract,
    unknownContracts: adapter.contract === 'api' ? [] : ['notification list API', 'notification read-state mutation', 'notification destination payload schema'],
  };
}

export function buildShellNotificationTelemetry(input: Pick<NotificationViewModel, 'state' | 'destinationKind' | 'entryMode'>) {
  return {
    name: 'shell_notification_resolved' as const,
    data: {
      routeFamily: 'shell-notifications',
      destinationKind: input.destinationKind,
      fallbackReason: input.state === 'ready' ? undefined : input.state,
      capabilityOutcome: input.state === 'ready' ? 'allowed' : 'fallback',
      entryMode: input.entryMode,
    },
  };
}
