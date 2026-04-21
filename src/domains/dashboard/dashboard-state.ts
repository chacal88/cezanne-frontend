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

export type DashboardOperationalSummary = {
  sourceHealth: DashboardSourceHealth;
  calendarReadiness: DashboardReadinessState;
  notificationState: 'ready' | 'empty' | 'degraded' | 'unavailable';
  inboxState: 'ready' | 'empty' | 'degraded' | 'unavailable';
  refreshRequired: boolean;
  adapterContract: 'fixture' | 'api';
  unknownContracts: string[];
};

export type DashboardOperationalState = DashboardReentryState & DashboardOperationalSummary;

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

export function buildDashboardOperationalState(input: {
  reason?: string;
  platformMode?: boolean;
  fallbackTarget?: string;
  sourceHealth?: DashboardSourceHealth;
  calendarReadiness?: DashboardReadinessState;
  notificationCount?: number;
  inboxConversationCount?: number;
  adapterContract?: 'fixture' | 'api';
}): DashboardOperationalState {
  const reentry = buildDashboardReentryState(input);
  const sourceHealth = input.sourceHealth ?? (reentry.reason === 'stale-target' ? 'stale' : 'ready');
  const calendarReadiness = input.calendarReadiness ?? (sourceHealth === 'degraded' ? 'degraded' : sourceHealth === 'unavailable' ? 'unavailable' : 'ready');
  return {
    ...reentry,
    sourceHealth,
    calendarReadiness,
    notificationState: input.notificationCount === 0 ? 'empty' : sourceHealth === 'unavailable' ? 'unavailable' : sourceHealth === 'degraded' ? 'degraded' : 'ready',
    inboxState: input.inboxConversationCount === 0 ? 'empty' : sourceHealth === 'unavailable' ? 'unavailable' : sourceHealth === 'degraded' ? 'degraded' : 'ready',
    refreshRequired: sourceHealth === 'stale' || sourceHealth === 'degraded' || reentry.reason === 'stale-target',
    adapterContract: input.adapterContract ?? 'fixture',
    unknownContracts: input.adapterContract === 'api' ? [] : ['dashboard aggregate query', 'calendar readiness API', 'notification summary API', 'inbox summary API'],
  };
}
