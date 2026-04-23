# Backend/API Contract: Notifications and Inbox

## Purpose

This document is the Phase 2 contract draft for `backend-api-contract-change-plan.md`.

It converts the V0 Notifications/inbox backlog rows into a backend-facing API contract proposal while preserving typed destination, route fallback, and messaging safety rules.

This document does not approve replacement for notifications, inbox, candidate messaging, or any downstream destination route.

## Scope

In scope:
- notification list transport;
- notification read/unread mutation;
- typed notification destination payloads;
- destination stale/missing/denied fallback taxonomy;
- `/inbox?conversation=` list/detail transport;
- message send/retry/stale refresh semantics;
- candidate-to-inbox conversation handoff;
- email deliverability readiness as backend-only/no-UI provider state.

Out of scope:
- public/external token chat `/chat/:token/:user_id`;
- provider setup UI for sender domains, signatures, DNS, or deliverability;
- raw message body telemetry;
- synthesizing external token URLs from recruiter notifications;
- replacing Jobs, Candidate, Billing, or Dashboard destination page contracts.

## Confirmed Current Frontend State

Confirmed in `src/shell/notifications/notification-state.ts`:
- notification center uses a replaceable adapter with `contract: 'fixture' | 'api'`;
- fixture notifications include typed destinations for candidate detail, job offer, inbox conversation, billing overview, unknown destination, and stale candidate target;
- unknown contracts are explicitly listed as:
  - `notification list API`;
  - `notification read-state mutation`;
  - `notification destination payload schema`.

Confirmed in `src/lib/routing/typed-destinations.ts` and `src/lib/routing/destination-resolver.ts`:
- supported destination kinds include Jobs, Candidates, public shared/application/survey, inbox conversation, and billing overview;
- `inbox.conversation` resolves to `/inbox?conversation=<conversationId>`;
- unsupported or not-yet-owned destinations resolve through typed fallback behavior.

Confirmed in `src/domains/inbox/support/messaging.ts`:
- inbox conversation state is URL-owned through `/inbox?conversation=`;
- fixture conversation adapter covers ready, degraded, provider-blocked, stale, private/inaccessible, not-found, and empty states;
- unknown contracts are explicitly listed as:
  - `inbox conversation list API`;
  - `inbox conversation detail API`;
  - `message send transport`.

Confirmed in `src/domains/inbox/support/email-deliverability-readiness.ts`:
- email deliverability setup ownership is `backend-only-no-ui`;
- no admin route target is exposed from inbox;
- readiness telemetry is allowlisted and excludes provider lifecycle internals.

## Shared Envelope Proposal

Notification and inbox endpoints should use a structured envelope:

```ts
type OperationalEnvelope<TData = unknown> = {
  status: 'ok' | 'error';
  code: string;
  data?: TData;
  message?: string;
  retryable?: boolean;
  correlationId?: string;
};
```

Rules:
- `code` is the behavior contract key; UI must not parse display message text.
- `correlationId` should match or echo `x-correlation-id` where available.
- message bodies, attachment bodies, signed URLs, provider diagnostics, DNS records, private tokens, callback payloads, and tenant-sensitive internals must not appear in telemetry payloads or docs artifacts.

## Notification List Contract

Target list request:

```ts
type NotificationListRequest = {
  page?: number;
  perPage?: number;
  cursor?: string;
  readState?: 'read' | 'unread' | 'all';
  since?: string;
};
```

Target list response:

```ts
type NotificationListResponse = OperationalEnvelope<{
  items: NotificationDto[];
  pageInfo: {
    page?: number;
    perPage?: number;
    total?: number;
    cursor?: string;
    nextCursor?: string;
    hasNextPage: boolean;
  };
  unreadCount: number;
  realtime?: {
    mode: 'polling' | 'sse' | 'websocket' | 'none';
    pollIntervalMs?: number;
  };
}>;
```

Target notification DTO:

```ts
type NotificationDto = {
  id: string;
  notificationKey: string;
  createdAt: string;
  readState: 'read' | 'unread';
  severity?: 'info' | 'warning' | 'urgent';
  actorLabel?: string;
  title?: string;
  summary?: string;
  destination?: NotificationDestinationDto;
  staleReason?: NotificationTargetState;
};
```

Content safety:
- `summary` may contain short display copy only.
- no raw message body, CV/document content, email body, provider callback payload, signed URL, or token value may be included.

## Notification Read-State Mutation

Target mutation request:

```ts
type NotificationReadStateMutation = {
  notificationIds: string[];
  readState: 'read' | 'unread';
};
```

Target mutation response:

```ts
type NotificationReadStateResponse = OperationalEnvelope<{
  updatedIds: string[];
  unreadCount: number;
  staleIds?: string[];
}>;
```

Target mutation codes:

| Code | Frontend behavior |
|---|---|
| `updated` | update local unread count/list state |
| `partial_updated` | update returned ids; keep stale ids visible with retry/refresh affordance |
| `not_found` | refresh list and show stale/missing state for affected ids |
| `denied` | leave list state unchanged; show route-local denied/fallback state |
| `retryable_failure` | keep current state; allow retry |
| `unavailable` | show notification center unavailable/degraded state |

## Typed Destination Contract

Backend must send a typed destination object, not an opaque `referer`.

Base shape:

```ts
type NotificationDestinationDto = {
  kind: NotificationDestinationKind;
  params: Record<string, string | number | boolean | null>;
  fallbackKind?: NotificationFallbackKind;
  targetState?: NotificationTargetState;
};
```

Allowed initial destination kinds:

| Kind | Required params | Target route | Capability gate |
|---|---|---|---|
| `dashboard` | none | `/dashboard` | `canViewDashboard` |
| `notifications` | none | `/notifications` | `canViewNotifications` |
| `inbox.conversation` | `conversationId` | `/inbox?conversation=` | `canUseInbox`, `canOpenConversation` |
| `job.detail` | `jobId`; optional `section` | `/job/:id?section` | `canViewJobDetail` |
| `job.bid.view` | `jobId`, `bidId` | `/job/:id/bid/:bid_id` | `canOpenJobTask` |
| `job.cv.view` | `jobId`, `cvId` | `/job/:id/cv/:cv_id` | `canOpenJobTask` |
| `job.schedule` | `jobId`, `cvId` | `/job/:id/cv/:cv_id/schedule` | `canScheduleInterviewFromJob` |
| `job.offer` | `jobId`, `cvId` | `/job/:id/cv/:cv_id/offer` | `canCreateOfferFromJob` |
| `candidate.detail` | `candidateId`; optional job/workflow params | `/candidate/:id/...` | `canViewCandidateDetail` |
| `billing.overview` | none | `/billing` | `canViewBilling` |
| `informational` | none | no route | none |

Public/token destination kinds are not allowed for recruiter-internal notifications unless a future approved contract explicitly adds them. Current legacy opaque keys such as `cv-interview-feedback`, `cv-reviewed`, and `user-mentioned` resolve to recruiter-internal candidate/inbox/entity destinations.

Target state taxonomy:

```ts
type NotificationTargetState =
  | 'available'
  | 'missing-target'
  | 'stale-target'
  | 'denied-target'
  | 'unsupported-destination'
  | 'unknown-destination';
```

Fallback rules:
- `inbox.conversation` denied conversation -> `/inbox`;
- `inbox.conversation` denied inbox route -> `/dashboard`;
- job/candidate stale or missing -> owning list/detail fallback, then `/dashboard`;
- unsupported or unknown destination -> `/dashboard`;
- fallback reason must be typed and safe.

## Inbox Conversation Contract

Target list request:

```ts
type InboxConversationListRequest = {
  page?: number;
  perPage?: number;
  cursor?: string;
  search?: string;
  unreadOnly?: boolean;
};
```

Target list response:

```ts
type InboxConversationListResponse = OperationalEnvelope<{
  conversations: InboxConversationSummaryDto[];
  pageInfo: {
    page?: number;
    perPage?: number;
    total?: number;
    cursor?: string;
    nextCursor?: string;
    hasNextPage: boolean;
  };
  unreadCount?: number;
}>;
```

Target detail request:

```ts
type InboxConversationDetailRequest = {
  conversationId: string;
  cursor?: string;
  before?: string;
  after?: string;
  limit?: number;
};
```

Target summary/detail DTOs:

```ts
type InboxConversationSummaryDto = {
  conversationId: string;
  subject?: string;
  participantLabel: string;
  lastActivityAt?: string;
  unreadCount?: number;
  state: InboxConversationState;
};

type InboxConversationDetailDto = InboxConversationSummaryDto & {
  messages: InboxMessageDto[];
  readiness: MessagingReadinessDto;
  permissions: {
    canOpenConversation: boolean;
    canSend: boolean;
  };
};

type InboxMessageDto = {
  id: string;
  direction: 'inbound' | 'outbound' | 'system';
  sentAt?: string;
  senderLabel?: string;
  preview?: string;
  body?: string;
  attachments?: Array<{ id: string; label: string; safeMimeType?: string }>;
  deliveryState?: 'queued' | 'sent' | 'delivered' | 'failed' | 'unknown';
};
```

Body safety:
- `body` is allowed for rendering inside the inbox route only.
- telemetry, logs, docs artifacts, screenshots manifests, and notification DTOs must use preview/metadata only.
- attachment binary content and signed URLs are out of scope for this contract.

Conversation state taxonomy:

```ts
type InboxConversationState =
  | 'ready'
  | 'empty'
  | 'inaccessible'
  | 'not_found'
  | 'provider_blocked'
  | 'degraded'
  | 'unavailable'
  | 'stale_conversation';
```

Frontend mapping:

| Backend state | Frontend state |
|---|---|
| `ready` | `ready` |
| `empty` | `empty` |
| `inaccessible` | `inaccessible` |
| `not_found` | `not-found` |
| `provider_blocked` | `provider-blocked` |
| `degraded` | `degraded` |
| `unavailable` | `unavailable` |
| `stale_conversation` | `stale-conversation` |

## Message Send Contract

Target send request:

```ts
type MessageSendRequest = {
  conversationId: string;
  body: string;
  clientMessageId: string;
  idempotencyKey?: string;
};
```

Target send response:

```ts
type MessageSendResponse = OperationalEnvelope<{
  conversationId: string;
  message?: InboxMessageDto;
  conversationState: InboxConversationState;
  refreshRequired: boolean;
}>;
```

Target send codes:

| Code | Frontend behavior |
|---|---|
| `sent` | clear draft; refresh selected conversation |
| `queued` | clear or preserve draft per backend decision; show pending/sent state |
| `validation_failed` | preserve draft; show route-local validation failure |
| `provider_blocked` | preserve draft; show non-proceeding provider-blocked state |
| `delivery_failed` | preserve draft; allow retry |
| `stale_conversation` | preserve draft; require refresh before retry |
| `conversation_not_found` | fallback to `/inbox`; refresh list |
| `conversation_denied` | fallback to `/inbox` or `/dashboard` depending route access |
| `retryable_failure` | preserve draft; allow retry |
| `unavailable` | preserve draft; route-local unavailable state |

Retry rules:
- retries should reuse the same `clientMessageId` or an explicit `idempotencyKey` if the backend uses idempotent send semantics;
- draft body must be preserved on retryable failures and stale conversation outcomes;
- successful send must produce a parent refresh intent for the selected conversation.

## Candidate Conversation Handoff

Candidate detail/action surfaces may hand off into inbox only through normalized conversation targets:

```ts
type CandidateConversationLink = {
  candidateId: string;
  conversationId?: string;
  recoveryTarget: string;
  permissions: {
    canOpenCandidateConversation: boolean;
  };
};
```

Rules:
- if `conversationId` is missing, the handoff resolves to inbox fallback/empty state;
- if capability is denied, the candidate route renders an inaccessible handoff state and preserves `recoveryTarget`;
- candidate surfaces must not construct message transports directly.

## Email Deliverability Readiness Contract

Email deliverability remains backend-only/no-UI from the frontend route perspective.

Target readiness DTO:

```ts
type EmailDeliverabilityReadinessDto = {
  setupOwnership: 'backend-only-no-ui';
  routeOwnership: 'none';
  readinessState:
    | 'ready'
    | 'domain-pending'
    | 'domain-failed'
    | 'signature-pending'
    | 'signature-failed'
    | 'degraded'
    | 'unavailable'
    | 'unimplemented';
  capabilityOutcome: 'allowed' | 'blocked' | 'degraded' | 'unavailable' | 'unimplemented';
  providerFamily: 'postmark' | 'smtp' | 'unknown';
  domainCategory: 'managed' | 'fallback' | 'owned' | 'unknown';
  canSend: boolean;
};
```

Rules:
- no admin route target is exposed from inbox;
- no DNS selectors, DKIM/SPF values, provider account ids, sender-domain ids, or raw provider diagnostics are exposed in telemetry;
- blocked/degraded readiness keeps the user in the current inbox/candidate route with route-local explanation.

## Realtime and Polling Policy

Backend/Messaging must choose one explicit transport policy:
- polling with `pollIntervalMs`;
- SSE;
- WebSocket;
- none for V0.

Frontend requirements:
- URL-owned selected conversation must survive refresh regardless of realtime mode;
- realtime updates must not mutate route selection;
- stale conversation signals must preserve draft and require refresh before retrying send.

## Telemetry and Security Rules

Required telemetry event families:
- `notification_clicked`;
- `notification_destination_resolved`;
- `notification_destination_denied`;
- `notification_fallback_used`;
- `messaging_conversation_action`;
- `email_deliverability_readiness_evaluated`.

Allowed telemetry fields:
- notification key;
- destination kind;
- target/fallback kind;
- normalized messaging state;
- entry mode;
- capability outcome;
- provider family;
- redacted domain category;
- correlation id.

Forbidden telemetry fields:
- message body;
- attachment body;
- candidate CV/document content;
- signed URLs;
- public route tokens;
- private tokens;
- provider callback payloads;
- DNS records/selectors;
- raw provider diagnostics logs;
- tenant-sensitive identifiers.

## Remaining Blockers

P0 backend blockers:
- publish notification list DTO, pagination, read-state mutation, destination union, and realtime/polling policy;
- publish inbox conversation list/detail DTOs and send/retry/idempotency contract;
- publish delivery failure and stale conversation taxonomy;
- publish provider-blocked readiness API for messaging.

P1 schema blockers:
- decide whether inbox message `body` is returned inline, paginated separately, or behind a message-detail endpoint;
- decide attachment metadata/download contract if inbox attachments are in scope.

P3 replacement blockers:
- visual/parity evidence remains required for notification center, inbox list/detail, and candidate conversation handoff before replacement approval.

