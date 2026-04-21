export type DashboardReentryReason =
  | 'normal'
  | 'notification-fallback'
  | 'denied-target'
  | 'stale-target'
  | 'missing-target'
  | 'unsupported-destination'
  | 'platform-landing';
export type DashboardSourceHealth = 'ready' | 'loading' | 'stale' | 'degraded' | 'unavailable';
export type DashboardReadinessState = 'ready' | 'degraded' | 'blocked' | 'unavailable';
export type DashboardActionKind = 'open-notifications' | 'open-inbox' | 'retry-dashboard' | 'return-to-fallback';
export type DashboardCardKind = 'jobs' | 'candidates' | 'interviews';
export type DashboardActivityItem = { id: string; message: string; createdAt?: string; target?: string };
export type DashboardCalendarEvent = { id: string; title: string; start: string; end?: string; status: 'pending' | 'completed' | 'confirmed' | 'busy' };

export type DashboardSafeAction = {
  kind: DashboardActionKind;
  label: string;
  target: '/notifications' | '/inbox' | '/dashboard' | string;
  refreshIntent?: 'dashboard' | 'target';
};

export type DashboardReentryState = {
  reason: DashboardReentryReason;
  message: string;
  fallbackTarget?: string;
  safeActions: DashboardSafeAction[];
};

export type DashboardSummaryCard = {
  kind: DashboardCardKind;
  title: string;
  subtitle: string;
  tooltip: string;
  count: number;
  target: string;
};

export type DashboardOverview = {
  liveJobsUuids: string[];
  liveJobsCount: number;
  liveCvsCount: number;
  liveInterviewsScheduledCount: number;
  users: Array<{ id?: string | number; uuid?: string; firstName?: string; lastName?: string }>;
  auth: {
    uuid?: string;
    firstName?: string;
    occupopEmail?: string;
    occupopEmailConfirmed?: boolean | null;
    occupopEmailConfirmationLink?: string;
  };
  calendarIntegrationState: DashboardReadinessState;
  notificationCount?: number;
  inboxConversationCount?: number;
  activityItems?: DashboardActivityItem[];
  calendarEvents?: DashboardCalendarEvent[];
};

export type DashboardOperationalSummary = {
  sourceHealth: DashboardSourceHealth;
  calendarReadiness: DashboardReadinessState;
  notificationState: 'ready' | 'empty' | 'degraded' | 'unavailable';
  inboxState: 'ready' | 'empty' | 'degraded' | 'unavailable';
  refreshRequired: boolean;
  adapterContract: 'fixture' | 'api';
  unknownContracts: string[];
};

export type DashboardViewModel = DashboardReentryState & DashboardOperationalSummary & {
  greetingName: string;
  cards: DashboardSummaryCard[];
  users: DashboardOverview['users'];
  emailConfirmationRequired: boolean;
  activityItems: DashboardActivityItem[];
  calendarEvents: DashboardCalendarEvent[];
};

const emptyOverview: DashboardOverview = {
  liveJobsUuids: [],
  liveJobsCount: 0,
  liveCvsCount: 0,
  liveInterviewsScheduledCount: 0,
  users: [],
  auth: {},
  calendarIntegrationState: 'unavailable',
  activityItems: [],
  calendarEvents: [],
};

function safeFallbackAction(fallbackTarget?: string): DashboardSafeAction | undefined {
  if (!fallbackTarget) return undefined;
  return { kind: 'return-to-fallback', label: 'Return to safe target', target: fallbackTarget, refreshIntent: 'target' };
}

export function buildDashboardReentryState(input: { reason?: string; platformMode?: boolean; fallbackTarget?: string }): DashboardReentryState {
  if (input.platformMode) {
    return {
      reason: 'platform-landing',
      message: 'Platform dashboard landing.',
      safeActions: [{ kind: 'retry-dashboard', label: 'Refresh platform dashboard', target: '/dashboard', refreshIntent: 'dashboard' }],
    };
  }

  const fallbackAction = safeFallbackAction(input.fallbackTarget);
  const fallbackActions = fallbackAction ? [fallbackAction] : [];

  if (input.reason === 'notification-fallback') {
    return {
      reason: 'notification-fallback',
      message: 'Notification destination fell back to dashboard.',
      fallbackTarget: input.fallbackTarget,
      safeActions: [{ kind: 'open-notifications', label: 'Review notifications', target: '/notifications' }, ...fallbackActions],
    };
  }
  if (input.reason === 'denied-target') {
    return {
      reason: 'denied-target',
      message: 'Requested destination is not allowed.',
      fallbackTarget: input.fallbackTarget,
      safeActions: [{ kind: 'open-notifications', label: 'Review accessible notifications', target: '/notifications' }],
    };
  }
  if (input.reason === 'stale-target') {
    return {
      reason: 'stale-target',
      message: 'Requested destination is stale and needs refresh.',
      fallbackTarget: input.fallbackTarget,
      safeActions: [{ kind: 'retry-dashboard', label: 'Refresh dashboard context', target: '/dashboard', refreshIntent: 'dashboard' }, ...fallbackActions],
    };
  }
  if (input.reason === 'missing-target') {
    return {
      reason: 'missing-target',
      message: 'Requested destination no longer exists.',
      fallbackTarget: input.fallbackTarget,
      safeActions: [{ kind: 'open-notifications', label: 'Review notifications', target: '/notifications' }],
    };
  }
  if (input.reason === 'unsupported-destination') {
    return {
      reason: 'unsupported-destination',
      message: 'Requested destination is not owned by this frontend slice.',
      fallbackTarget: input.fallbackTarget,
      safeActions: [{ kind: 'open-notifications', label: 'Review notifications', target: '/notifications' }, ...fallbackActions],
    };
  }
  return {
    reason: 'normal',
    message: 'Dashboard landing.',
    safeActions: [
      { kind: 'open-notifications', label: 'Open notifications', target: '/notifications' },
      { kind: 'open-inbox', label: 'Open inbox', target: '/inbox' },
    ],
  };
}

function cardCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function buildDashboardCards(overview: DashboardOverview = emptyOverview): DashboardSummaryCard[] {
  return [
    {
      kind: 'jobs',
      title: 'My open jobs',
      subtitle: 'Live jobs assigned to you',
      tooltip: 'Jobs that you created or were assigned to you',
      count: cardCount(overview.liveJobsCount),
      target: '/jobs/open',
    },
    {
      kind: 'candidates',
      title: 'My candidates',
      subtitle: 'Candidates on live jobs',
      tooltip: 'Candidates at any stage on the jobs created by you or assigned to you',
      count: cardCount(overview.liveCvsCount),
      target: '/candidates-database',
    },
    {
      kind: 'interviews',
      title: 'My interviews',
      subtitle: 'Scheduled interviews',
      tooltip: 'Interviews scheduled from applicants of jobs created by you or assigned to you',
      count: cardCount(overview.liveInterviewsScheduledCount),
      target: '/jobs/open',
    },
  ];
}

export function buildDashboardOperationalState(input: {
  reason?: string;
  platformMode?: boolean;
  fallbackTarget?: string;
  sourceHealth?: DashboardSourceHealth;
  calendarReadiness?: DashboardReadinessState;
  notificationCount?: number;
  inboxConversationCount?: number;
  adapterContract?: 'fixture' | 'api';
}): DashboardOperationalSummary & DashboardReentryState {
  const reentry = buildDashboardReentryState(input);
  const sourceHealth = input.sourceHealth ?? (reentry.reason === 'stale-target' ? 'stale' : 'ready');
  const calendarReadiness = input.calendarReadiness ?? (sourceHealth === 'degraded' ? 'degraded' : sourceHealth === 'unavailable' ? 'unavailable' : 'ready');
  return {
    ...reentry,
    sourceHealth,
    calendarReadiness,
    notificationState: (input.notificationCount ?? 0) === 0 ? 'empty' : sourceHealth === 'unavailable' ? 'unavailable' : sourceHealth === 'degraded' ? 'degraded' : 'ready',
    inboxState: (input.inboxConversationCount ?? 0) === 0 ? 'empty' : sourceHealth === 'unavailable' ? 'unavailable' : sourceHealth === 'degraded' ? 'degraded' : 'ready',
    refreshRequired: sourceHealth === 'stale' || sourceHealth === 'degraded' || reentry.reason === 'stale-target',
    adapterContract: input.adapterContract ?? 'fixture',
    unknownContracts: input.adapterContract === 'api' ? [] : ['dashboard aggregate query', 'calendar readiness API', 'notification summary API', 'inbox summary API'],
  };
}

export function buildDashboardViewModel(input: {
  overview?: DashboardOverview;
  reason?: string;
  platformMode?: boolean;
  fallbackTarget?: string;
  sourceHealth?: DashboardSourceHealth;
  adapterContract?: 'fixture' | 'api';
}): DashboardViewModel {
  const overview = input.overview ?? emptyOverview;
  const operational = buildDashboardOperationalState({
    reason: input.reason,
    platformMode: input.platformMode,
    fallbackTarget: input.fallbackTarget,
    sourceHealth: input.sourceHealth,
    calendarReadiness: overview.calendarIntegrationState,
    notificationCount: overview.notificationCount,
    inboxConversationCount: overview.inboxConversationCount,
    adapterContract: input.adapterContract,
  });

  return {
    ...operational,
    greetingName: overview.auth.firstName || 'there',
    cards: buildDashboardCards(overview),
    users: overview.users,
    activityItems: overview.activityItems ?? [],
    calendarEvents: overview.calendarEvents ?? [],
    emailConfirmationRequired: overview.auth.occupopEmailConfirmed === false && Boolean(overview.auth.occupopEmailConfirmationLink),
  };
}

export const fixtureDashboardOverview: DashboardOverview = {
  liveJobsUuids: ['fixture-job-1', 'fixture-job-2'],
  liveJobsCount: 2,
  liveCvsCount: 14,
  liveInterviewsScheduledCount: 3,
  users: [],
  auth: { firstName: 'there', occupopEmailConfirmed: true },
  calendarIntegrationState: 'ready',
  notificationCount: 3,
  inboxConversationCount: 2,
  activityItems: [],
  calendarEvents: [],
};
