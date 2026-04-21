# Messaging Communication Operational Depth Plan

## Status

Implemented by OpenSpec change `messaging-communication-operational-depth`.

## Scoped consumers

This package deepens authenticated messaging consumers only:

- **Inbox** (`/inbox?conversation=`) — preserves URL-owned selected conversation state, direct-entry refresh behavior, route-local send/retry, and stale conversation recovery.
- **Notification entry** — resolves `inbox.conversation` destinations into typed authenticated conversation targets before inbox rendering or send/reply mechanics.
- **Candidate conversation handoff** — opens authenticated inbox conversations from candidate collaboration context while preserving candidate recovery context when no conversation can be opened.

Public/token `/chat/:token/:user_id` and `/integration/*` routes remain outside this package.

## Operational model

Authenticated messaging operational depth models:

- loading, ready, and empty conversation states;
- inaccessible and not-found selected-conversation outcomes;
- provider-blocked, degraded, unavailable, and unimplemented non-proceeding send states;
- sending, sent, send-failed, and stale-conversation outcomes;
- retry and stale refresh behavior that preserves selected conversation and safe draft state.

Helpers use normalized conversation identity only. They do not expose raw notification payloads, provider transport details, credentials, OAuth secrets, private tokens, signed URLs, public token values, provider callback payloads, message bodies, attachment contents, or tenant-sensitive identifiers.

## Return and recovery

- `/inbox?conversation=` remains the canonical selected-conversation route.
- Missing, inaccessible, or not-found conversations render route-local inbox states when inbox access is allowed; dashboard fallback is reserved for denied inbox access.
- Notification destination fallback is typed: inbox without selection first, then dashboard when inbox access is denied.
- Candidate handoff preserves a sanitized candidate recovery target and never creates a conversation implicitly.
- Public external chat keeps its token eligibility, existing-conversation requirement, and same-route send/retry behavior unchanged.

## Telemetry

The allowlisted messaging telemetry event is `messaging_conversation_action` with only:

- `routeFamily` (`inbox`, `notification`, or `candidate`);
- `action` (`destination_resolved`, `conversation_opened`, `send_started`, `send_failed`, `retry_started`, `sent`, or `stale_refreshed`);
- `messagingState`;
- `entryMode`;
- `fallbackKind`;
- `correlationId`.

Telemetry must not include message bodies, attachment contents, credentials, OAuth secrets, private tokens, signed URLs, raw notification payloads, raw provider payloads, tenant-sensitive identifiers, public token values, or provider callback payloads.

## Validation

Validation covers shared messaging states, conversation identity helpers, notification destination resolution, candidate handoff recovery, send/retry/stale refresh outcomes, safe telemetry payloads, and separation from public/token `/chat/:token/:user_id` plus `/integration/*` routes.
