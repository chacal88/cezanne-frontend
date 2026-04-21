import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { observability } from '../../app/observability';
import { buildInboxConversationStateFromAdapter, buildMessagingTelemetry, type MessagingEntryMode } from './support';

export type InboxSearch = {
  conversation?: string;
  entry?: MessagingEntryMode;
  draft?: string;
  returnTo?: string;
};

export function validateInboxSearch(search: Record<string, unknown>): InboxSearch {
  const entry = typeof search.entry === 'string' && ['menu', 'direct-url', 'notification', 'candidate'].includes(search.entry)
    ? (search.entry as MessagingEntryMode)
    : undefined;
  return {
    conversation: typeof search.conversation === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,80}$/.test(search.conversation.trim()) ? search.conversation.trim() : undefined,
    entry,
    draft: typeof search.draft === 'string' && search.draft.trim().length > 0 ? search.draft.trim() : undefined,
    returnTo: typeof search.returnTo === 'string' && search.returnTo.startsWith('/') ? search.returnTo : undefined,
  };
}

export function InboxPage() {
  const search = validateInboxSearch(Object.fromEntries(new URLSearchParams(window.location.search).entries()));
  const { t } = useTranslation('inbox');
  const entryMode = search.entry ?? (search.conversation ? 'direct-url' : 'menu');
  const state = buildInboxConversationStateFromAdapter({ conversationId: search.conversation, entryMode, draft: { body: search.draft }, returnTarget: search.returnTo });

  useEffect(() => {
    observability.telemetry.track(buildMessagingTelemetry({
      routeFamily: 'inbox',
      action: state.kind === 'ready' ? 'conversation_opened' : 'destination_resolved',
      messagingState: state.kind,
      entryMode: state.entryMode,
      fallbackKind: state.fallbackKind,
    }));
  }, [state.entryMode, state.fallbackKind, state.kind]);

  return (
    <section>
      <h1>{t('home.title')}</h1>
      <p>{t('home.detail')}</p>
      <dl aria-label="Inbox conversation state">
        <dt>{t('home.activeConversation')}</dt>
        <dd data-testid="inbox-active-conversation">{state.conversationId ?? t('home.none')}</dd>
        <dt>{t('home.state')}</dt>
        <dd data-testid="inbox-conversation-state">{state.kind}</dd>
        <dt>{t('home.entryMode')}</dt>
        <dd data-testid="inbox-entry-mode">{state.entryMode}</dd>
        <dt>{t('home.subject')}</dt>
        <dd data-testid="inbox-subject">{state.subject ?? '—'}</dd>
        <dt>{t('home.participant')}</dt>
        <dd data-testid="inbox-participant">{state.participantLabel ?? '—'}</dd>
        <dt>{t('home.canSend')}</dt>
        <dd data-testid="inbox-can-send">{String(state.canSend)}</dd>
        <dt>{t('home.retryAllowed')}</dt>
        <dd data-testid="inbox-retry-allowed">{String(state.retryAllowed)}</dd>
        <dt>{t('home.refreshRequired')}</dt>
        <dd data-testid="inbox-refresh-required">{String(state.refreshRequired)}</dd>
        <dt>{t('home.adapter')}</dt>
        <dd data-testid="inbox-adapter-contract">{state.adapterContract}</dd>
      </dl>
      <p data-testid="inbox-state-message">{state.message}</p>
      {state.returnTarget ? <a href={state.returnTarget} data-testid="inbox-return-target">Return to parent</a> : null}
      {state.fallbackKind !== 'none' ? <a href="/inbox" data-testid="inbox-safe-fallback">Inbox fallback</a> : null}
      {state.refreshRequired ? <a href={`/inbox?conversation=${state.conversationId ?? ''}`} data-testid="inbox-refresh-link">Refresh conversation</a> : null}
      {state.unknownContracts.length ? <p data-testid="inbox-unknown-contracts">{state.unknownContracts.join(', ')}</p> : null}
    </section>
  );
}
