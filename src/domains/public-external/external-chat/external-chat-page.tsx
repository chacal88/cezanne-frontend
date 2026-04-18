import { useEffect, useMemo, useState } from 'react';
import { observability } from '../../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { PublicTokenStatePanel } from '../token-state/public-token-state-panel';
import { buildExternalChatViewModel, runExternalChatMessageWorkflow } from './support';

export function ExternalChatPage({ token, userId }: { token: string; userId: string }) {
  const [refreshNonce, setRefreshNonce] = useState(0);
  const view = useMemo(() => buildExternalChatViewModel({ token, userId }), [token, userId, refreshNonce]);
  const [draft, setDraft] = useState(view.draft);
  const [error, setError] = useState<string | null>(null);
  const [payloadPreview, setPayloadPreview] = useState('');

  useEffect(() => {
    setDraft(view.draft);
  }, [view.draft]);

  useEffect(() => {
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'external_tokenized_chat_opened',
      data: { token, userId, tokenState: view.decision.tokenState, correlationId: ensureCorrelationId() },
    });
    observability.telemetry.track({
      name: 'external_tokenized_chat_bootstrapped',
      data: { token, userId, readiness: view.decision.readiness, correlationId: ensureCorrelationId() },
    });
    observability.telemetry.track({
      name: 'external_tokenized_chat_token_state_resolved',
      data: { token, userId, tokenState: view.decision.tokenState, correlationId: ensureCorrelationId() },
    });
  }, [token, userId, view.decision.readiness, view.decision.tokenState]);

  async function handleSend() {
    setError(null);
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'external_tokenized_chat_send_started',
      data: { token, userId, correlationId: ensureCorrelationId() },
    });

    const result = await runExternalChatMessageWorkflow({ token, userId }, view.participantName, view.partnerName, draft);
    if (result.status === 'failed') {
      setError(result.message);
      observability.telemetry.track({
        name: 'external_tokenized_chat_send_failed',
        data: { token, userId, stage: result.stage, correlationId: ensureCorrelationId() },
      });
      return;
    }

    setPayloadPreview(JSON.stringify(result.payload, null, 2));
    setDraft('');
    setRefreshNonce((current) => current + 1);
    observability.telemetry.track({
      name: 'external_tokenized_chat_send_completed',
      data: { token, userId, correlationId: ensureCorrelationId() },
    });
  }

  if (!view.decision.canProceed) {
    return <PublicTokenStatePanel family="external-tokenized-chat" tokenState={view.decision.tokenState} reason={view.decision.reason} />;
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <header style={{ display: 'grid', gap: 4 }}>
        <h1>{view.title}</h1>
        <p>{view.intro}</p>
        <p data-testid="external-chat-participant">External participant: {view.participantName}</p>
        <p data-testid="external-chat-partner">Conversation partner: {view.partnerName}</p>
      </header>

      <div style={{ display: 'grid', gap: 10 }} data-testid="external-chat-groups">
        {view.groups.map((group) => (
          <article
            key={`${group.senderId}-${group.createdAt}`}
            data-testid={`external-chat-group-${group.senderRole}`}
            style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, background: group.senderRole === 'external-participant' ? '#eff6ff' : '#f8fafc' }}
          >
            <strong>{group.senderName}</strong>
            <p style={{ margin: '4px 0 0' }}>{new Date(group.createdAt).toLocaleString()}</p>
            <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
              {group.messages.map((message, index) => (
                <p key={`${group.senderId}-${index}`} data-testid="external-chat-message" dangerouslySetInnerHTML={{ __html: message }} />
              ))}
            </div>
          </article>
        ))}
      </div>

      <label style={{ display: 'grid', gap: 8 }}>
        Reply
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          data-testid="external-chat-draft"
          placeholder="Type your message"
        />
      </label>
      <button type="button" onClick={handleSend} data-testid="external-chat-send-button">
        Send message
      </button>
      {error ? <p data-testid="external-chat-error">{error}</p> : null}
      {payloadPreview ? <pre data-testid="external-chat-payload-preview">{payloadPreview}</pre> : null}
    </section>
  );
}
