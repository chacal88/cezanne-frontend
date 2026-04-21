import { ensureCorrelationId } from '../../../lib/observability';

export type MessagingRouteFamily = 'inbox' | 'notification' | 'candidate';
export type MessagingEntryMode = 'menu' | 'direct-url' | 'notification' | 'candidate';
export type MessagingStateKind =
  | 'loading'
  | 'ready'
  | 'empty'
  | 'inaccessible'
  | 'not-found'
  | 'provider-blocked'
  | 'degraded'
  | 'unavailable'
  | 'sending'
  | 'sent'
  | 'send-failed'
  | 'stale-conversation';
export type MessagingReadiness = 'ready' | 'provider-blocked' | 'degraded' | 'unavailable' | 'unimplemented';
export type MessagingFallbackKind = 'none' | 'inbox' | 'dashboard' | 'candidate';
export type MessagingTelemetryAction =
  | 'destination_resolved'
  | 'conversation_opened'
  | 'send_started'
  | 'send_failed'
  | 'retry_started'
  | 'sent'
  | 'stale_refreshed';

export type MessagingConversationTarget = {
  conversationId: string;
  path: `/inbox?conversation=${string}`;
  entryMode: MessagingEntryMode;
  returnTarget?: string;
};

export type MessagingDraft = {
  body?: string;
};

export type MessagingOperationalState = {
  kind: MessagingStateKind;
  routeFamily: MessagingRouteFamily;
  entryMode: MessagingEntryMode;
  conversationId?: string;
  draft: MessagingDraft;
  message: string;
  canSend: boolean;
  retryAllowed: boolean;
  refreshRequired: boolean;
  fallbackKind: MessagingFallbackKind;
  returnTarget?: string;
};

export type MessagingDestinationResolution =
  | { status: 'resolved'; target: MessagingConversationTarget; fallbackKind: 'none' }
  | { status: 'denied'; target: '/inbox' | '/dashboard'; fallbackKind: 'inbox' | 'dashboard'; reason: 'inbox-denied' | 'conversation-denied' | 'missing-conversation' };

export type CandidateConversationHandoff =
  | { status: 'opened'; target: MessagingConversationTarget; candidateId: string; recoveryTarget: string }
  | { status: 'unavailable' | 'inaccessible'; state: MessagingOperationalState; candidateId: string; recoveryTarget: string };

export type MessagingTelemetryEvent = {
  name: 'messaging_conversation_action';
  data: {
    routeFamily: MessagingRouteFamily;
    action: MessagingTelemetryAction;
    messagingState: MessagingStateKind;
    entryMode: MessagingEntryMode;
    fallbackKind: MessagingFallbackKind;
    correlationId: string;
  };
};

function sanitizeConversationId(conversationId: unknown): string | undefined {
  if (typeof conversationId !== 'string') return undefined;
  const trimmed = conversationId.trim();
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,80}$/.test(trimmed) ? trimmed : undefined;
}

function createDraft(input: Partial<MessagingDraft> = {}): MessagingDraft {
  return {
    body: typeof input.body === 'string' && input.body.trim().length > 0 ? input.body.trim() : undefined,
  };
}

function stateMessage(kind: MessagingStateKind): string {
  const messages: Record<MessagingStateKind, string> = {
    loading: 'Loading conversation.',
    ready: 'Conversation ready.',
    empty: 'No conversation is selected.',
    inaccessible: 'Conversation is inaccessible for this user.',
    'not-found': 'Conversation was not found.',
    'provider-blocked': 'Messaging provider blocks sending.',
    degraded: 'Messaging is degraded and cannot send right now.',
    unavailable: 'Messaging is unavailable.',
    sending: 'Sending message.',
    sent: 'Message sent; refresh the selected conversation.',
    'send-failed': 'Message failed and can be retried.',
    'stale-conversation': 'Conversation is stale and must be refreshed before retry.',
  };
  return messages[kind];
}

function makeState(input: {
  kind: MessagingStateKind;
  routeFamily: MessagingRouteFamily;
  entryMode: MessagingEntryMode;
  conversationId?: string;
  draft?: Partial<MessagingDraft>;
  message?: string;
  fallbackKind?: MessagingFallbackKind;
  returnTarget?: string;
}): MessagingOperationalState {
  const draft = createDraft(input.draft);
  return {
    kind: input.kind,
    routeFamily: input.routeFamily,
    entryMode: input.entryMode,
    conversationId: sanitizeConversationId(input.conversationId),
    draft,
    message: input.message ?? stateMessage(input.kind),
    canSend: input.kind === 'ready' && Boolean(draft.body),
    retryAllowed: input.kind === 'send-failed',
    refreshRequired: input.kind === 'stale-conversation',
    fallbackKind: input.fallbackKind ?? 'none',
    returnTarget: input.returnTarget,
  };
}

function stateFromReadiness(readiness: MessagingReadiness): MessagingStateKind {
  if (readiness === 'provider-blocked') return 'provider-blocked';
  if (readiness === 'degraded') return 'degraded';
  return 'unavailable';
}

export function buildInboxConversationPath(conversationId: string): `/inbox?conversation=${string}` {
  return `/inbox?conversation=${encodeURIComponent(conversationId)}` as `/inbox?conversation=${string}`;
}

export function buildMessagingConversationTarget(input: {
  conversationId: string;
  entryMode: MessagingEntryMode;
  returnTarget?: string;
}): MessagingConversationTarget | undefined {
  const conversationId = sanitizeConversationId(input.conversationId);
  if (!conversationId) return undefined;
  return {
    conversationId,
    path: buildInboxConversationPath(conversationId),
    entryMode: input.entryMode,
    returnTarget: input.returnTarget,
  };
}

export function buildMessagingOperationalState(input: {
  routeFamily?: MessagingRouteFamily;
  entryMode?: MessagingEntryMode;
  conversationId?: string;
  loading?: boolean;
  exists?: boolean;
  accessible?: boolean;
  readiness?: MessagingReadiness;
  stale?: boolean;
  draft?: Partial<MessagingDraft>;
  returnTarget?: string;
}): MessagingOperationalState {
  const routeFamily = input.routeFamily ?? 'inbox';
  const entryMode = input.entryMode ?? 'direct-url';
  const conversationId = sanitizeConversationId(input.conversationId);

  if (input.loading) return makeState({ kind: 'loading', routeFamily, entryMode, conversationId, draft: input.draft, returnTarget: input.returnTarget });
  if (!conversationId) return makeState({ kind: 'empty', routeFamily, entryMode, draft: input.draft, fallbackKind: 'inbox', returnTarget: input.returnTarget });
  if (input.exists === false) return makeState({ kind: 'not-found', routeFamily, entryMode, conversationId, draft: input.draft, fallbackKind: 'inbox', returnTarget: input.returnTarget });
  if (input.accessible === false) return makeState({ kind: 'inaccessible', routeFamily, entryMode, conversationId, draft: input.draft, fallbackKind: 'inbox', returnTarget: input.returnTarget });
  if (input.readiness && input.readiness !== 'ready') return makeState({ kind: stateFromReadiness(input.readiness), routeFamily, entryMode, conversationId, draft: input.draft, returnTarget: input.returnTarget });
  if (input.stale) return makeState({ kind: 'stale-conversation', routeFamily, entryMode, conversationId, draft: input.draft, returnTarget: input.returnTarget });
  return makeState({ kind: 'ready', routeFamily, entryMode, conversationId, draft: input.draft, returnTarget: input.returnTarget });
}

export function resolveInboxConversationDestination(input: {
  conversationId?: string;
  canViewInbox: boolean;
  canOpenConversation: boolean;
  entryMode?: MessagingEntryMode;
  returnTarget?: string;
}): MessagingDestinationResolution {
  if (!input.canViewInbox) return { status: 'denied', target: '/dashboard', fallbackKind: 'dashboard', reason: 'inbox-denied' };
  const target = input.conversationId
    ? buildMessagingConversationTarget({ conversationId: input.conversationId, entryMode: input.entryMode ?? 'notification', returnTarget: input.returnTarget })
    : undefined;
  if (!target) return { status: 'denied', target: '/inbox', fallbackKind: 'inbox', reason: 'missing-conversation' };
  if (!input.canOpenConversation) return { status: 'denied', target: '/inbox', fallbackKind: 'inbox', reason: 'conversation-denied' };
  return { status: 'resolved', target, fallbackKind: 'none' };
}

export function buildCandidateConversationHandoff(input: {
  candidateId: string;
  conversationId?: string;
  canOpenCandidateConversation: boolean;
  recoveryTarget: string;
}): CandidateConversationHandoff {
  const target = input.conversationId
    ? buildMessagingConversationTarget({ conversationId: input.conversationId, entryMode: 'candidate', returnTarget: input.recoveryTarget })
    : undefined;

  if (input.canOpenCandidateConversation && target) {
    return { status: 'opened', target, candidateId: input.candidateId, recoveryTarget: input.recoveryTarget };
  }

  const state = buildMessagingOperationalState({
    routeFamily: 'candidate',
    entryMode: 'candidate',
    conversationId: input.conversationId,
    exists: Boolean(target),
    accessible: input.canOpenCandidateConversation,
    returnTarget: input.recoveryTarget,
  });

  return {
    status: input.canOpenCandidateConversation ? 'unavailable' : 'inaccessible',
    state,
    candidateId: input.candidateId,
    recoveryTarget: input.recoveryTarget,
  };
}

export function startMessagingSend(state: MessagingOperationalState): MessagingOperationalState {
  if (state.kind === 'stale-conversation') return state;
  if (!state.conversationId || !state.draft.body || state.kind !== 'ready') {
    return makeState({ ...state, kind: state.kind === 'ready' ? 'send-failed' : state.kind, message: state.kind === 'ready' ? 'Enter a message before sending.' : state.message });
  }
  return makeState({ ...state, kind: 'sending' });
}

export function resolveMessagingSendResult(input: {
  state: MessagingOperationalState;
  outcome: 'sent' | 'failed' | 'stale';
}): MessagingOperationalState {
  if (input.outcome === 'stale') return makeState({ ...input.state, kind: 'stale-conversation' });
  if (input.outcome === 'failed') return makeState({ ...input.state, kind: 'send-failed' });
  return makeState({ ...input.state, kind: 'sent', draft: {} });
}

export function retryMessagingSend(state: MessagingOperationalState): MessagingOperationalState {
  return makeState({ ...state, kind: 'ready', message: 'Retry sending with the preserved draft.' });
}

export function refreshStaleConversation(state: MessagingOperationalState): MessagingOperationalState {
  return makeState({ ...state, kind: 'ready', message: 'Conversation refreshed. Review the draft before sending again.' });
}

export function buildMessagingTelemetry(input: {
  routeFamily: MessagingRouteFamily;
  action: MessagingTelemetryAction;
  messagingState: MessagingStateKind;
  entryMode: MessagingEntryMode;
  fallbackKind?: MessagingFallbackKind;
}): MessagingTelemetryEvent {
  return {
    name: 'messaging_conversation_action',
    data: {
      routeFamily: input.routeFamily,
      action: input.action,
      messagingState: input.messagingState,
      entryMode: input.entryMode,
      fallbackKind: input.fallbackKind ?? 'none',
      correlationId: ensureCorrelationId(),
    },
  };
}
