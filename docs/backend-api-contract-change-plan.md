# Backend/API Contract Change Plan

## Purpose

This change plan turns `backend-api-contract-backlog.md` into an execution package for closing the next backend/API/provider/schema blockers across V0-V5.

It keeps backend readiness separate from:
- Figma drafting;
- legacy pixel-parity approval;
- replacement approval;
- fixture-backed current-app evidence.

No route family becomes replacement-approved through this plan. Replacement approval still requires the matching visual/parity evidence package.

## Change status

Status: drafted, mirrored to OpenSpec, and validated.

Opened from roadmap follow-up on 2026-04-23.

Working branch/worktree:
- branch: `codex/backend-api-contracts`
- worktree: `/Users/kauesantos/.codex/worktrees/backend-api-contracts/recruit-frontend`

OpenSpec mirror:
- change id: `backend-api-contracts`
- path: `/Users/kauesantos/Documents/recruit/openspec/changes/backend-api-contracts`
- validation: `openspec validate backend-api-contracts --strict` passed from `/Users/kauesantos/Documents/recruit` on 2026-04-23.

## Confirmed inputs

Confirmed from the active docs package:
- `roadmap.md` marks backend/API contract package creation as the next phase before broader replacement approval.
- `backend-api-contract-backlog.md` contains the V0-V5 blocker matrix and the recommended backend decision order.
- `architecture.md` requires domain-owned adapters and server state through TanStack Query.
- `domains.md` and `modules.md` define the owning domain/module for each contract family.
- `screens.md` defines the canonical route families, route classes, capabilities, and release targets.
- `access-model.md`, `capabilities.md`, and ADR 0007 require capability decisions to stay at route/domain boundaries, with server-authoritative entity/action capability payloads where backend rules are complex.
- `notification-destinations.md` requires typed notification destinations and typed fallbacks, not opaque `referer` redirects.
- `navigation-and-return-behavior.md` requires direct-entry, refresh, back, close/cancel, success, and parent-refresh behavior to remain explicit for overlays and task flows.
- `observability.md`, `telemetry-events.md`, `correlation-id-policy.md`, and `security.md` require safe telemetry, correlation propagation, and shared request hardening.
- ADR 0010 requires non-trivial backend payloads to pass through adapters before reaching UI components.

Confirmed source-backed API evidence already listed in `backend-api-contract-backlog.md`:
- Auth login uses auth service `/login`, REST `/authenticate`, and GraphQL session enrichment.
- Public auth token helpers call the existing user/token/invitation/company/agency endpoints.
- Dashboard has a GraphQL/REST adapter for current aggregate, notifications, and calendar reads.
- Candidate database has a REST adapter for `/v2/cv`.
- Candidate detail has a GraphQL adapter for the current dense aggregate.
- Notifications, inbox, account settings, Jobs, many V3 public/token flows, V4 operations, and V5 SysAdmin/platform routes still have fixture/state/adapter seams where production contracts are not confirmed.

## Planning inferences

These are planning inferences, not confirmed backend facts:
- One mega-contract would be too large to validate safely; this package should close contract families in the same order as dependency risk.
- Jobs and Candidates should be planned together at the shared action/mutation layer because scheduling, reject, offer, documents, upload, review, and parent-refresh semantics overlap.
- Provider/upload/download contracts should be closed before field-specific UI polish for scheduling, publishing, public applications, integration forms, contracts, billing card/payment, and report exports.
- V4/V5 admin table schemas should follow shared primitives so fixture fields do not become accidental production contracts.

## In scope

This change plans and then closes backend/API-facing contracts for:
- Auth/token/session;
- Notifications/inbox;
- Jobs and Candidates aggregates/mutations;
- provider readiness/setup plus upload/download contracts;
- V4/V5 admin schemas.

Contract outputs must include:
- endpoint or operation ownership;
- request parameters/search/body shape;
- response DTO shape;
- normalized frontend view model target;
- capability/action availability object where needed;
- validation and failure envelope;
- stale/conflict/not-found/denied/unavailable/degraded taxonomy;
- pagination/range/sort envelope where relevant;
- mutation success, retry, terminal, and parent-refresh semantics;
- correlation and telemetry-safe payload rules;
- fields explicitly prohibited from telemetry/docs artifacts.

## Out of scope

This plan does not:
- approve replacement of any legacy route;
- infer backend payloads from screenshots or Figma;
- implement production endpoints in the backend;
- expose signed URLs, tokens, credentials, raw diagnostics logs, webhook secrets, message bodies, document bodies, survey answers, scoring rubrics, or provider callback payloads in docs or telemetry;
- collapse public/token route behavior into authenticated shell behavior;
- move provider setup ownership out of the `integrations` domain unless a future ADR/change explicitly does so.

## Execution phases

### Phase 1: Auth/token/session

Goal:
- close shared public/authenticated session behavior before downstream contract work depends on ambiguous identity states.

Affected domains/modules:
- `auth.entry`
- `auth.token-flows`
- `auth.sso-callbacks`
- `auth.session-bootstrap`
- `shell.account-context`

Contract decisions to close:
- structured login failure envelope for invalid credentials, 2FA, SSO mandatory, activation, approval, setup, bootstrap failure, and unknown failure;
- 2FA resend, lockout, expiry, verified-code reuse, and remember-device policy;
- activation/setup reason payloads and safe visible outcomes;
- forgot/reset/confirm/register/invite enum consistency and continuation payloads;
- Cezanne/SAML launch/callback response and failure envelopes;
- session-loss trigger taxonomy and `/session-lost` backend trigger mapping;
- account profile read/update schemas and validation envelope.

Acceptance:
- every auth/token/session outcome maps to an approved route-local or shell handoff state;
- public token failures never grant `canEnterShell`;
- callback tokens/raw codes stay out of UI, logs, telemetry, screenshots, and docs artifacts;
- session bootstrap correlation uses `x-correlation-id`.

### Phase 2: Notifications/inbox

Goal:
- make cross-release entry paths stable before domain-specific destination kinds expand.

Affected domains/modules:
- `shell.notifications`
- `inbox.conversation-list`
- `inbox.conversation-entry`
- candidate conversation handoff consumers

Contract decisions to close:
- notification list DTO, pagination, read/unread mutation, realtime/polling policy, stale/missing/denied taxonomy;
- typed notification destination union and backend payload rules for each destination kind;
- inbox conversation list/detail transport;
- send/retry mutation, delivery failure taxonomy, provider-blocked readiness, stale conversation handling;
- safe message DTO boundaries and attachment/body redaction rules.

Acceptance:
- no notification contract depends on opaque `referer`;
- denied/missing/stale destinations resolve through typed fallback behavior;
- `/inbox?conversation=` preserves URL-owned selection on refresh;
- message bodies and provider setup internals are excluded from telemetry.

### Phase 3: Jobs and Candidates aggregates/mutations

Goal:
- close recruiter-core data and mutation contracts together because V1 task overlays and V2 action launchers share operational semantics.

Affected domains/modules:
- `jobs.list`
- `jobs.authoring`
- `jobs.detail`
- `jobs.task-overlays`
- `jobs.workflow-state`
- `candidates.database-search`
- `candidates.detail-hub`
- `candidates.workflow-navigation`
- `candidates.action-launchers`
- `candidates.documents-contracts`
- `candidates.surveys-custom-fields`
- `candidates.communication-collaboration`

Contract decisions to close:
- Jobs list query params, row DTO, action availability, pagination, source-health, empty/degraded reason;
- job draft/create/update/copy/resetWorkflow schemas, validation envelope, draft-vs-published state, publication readiness/result;
- job detail aggregate, section payloads, status transition response, assignment/share payloads, partial failure taxonomy;
- job bid/CV/reject/schedule/offer mutation schemas and parent-refresh contract;
- candidate database production source decision for `/v2/cv`, row/facet/saved-list/bulk/search contracts, ATS duplicate/import/sync status fields;
- candidate detail aggregate, sequence navigation authority, panel schemas, direct-entry/denied/stale/unavailable taxonomy;
- candidate schedule/offer/reject/move/hire/unhire/review mutation contracts;
- upload handshake, signed URL policy, metadata persistence payload, document/form/contract/survey/custom-field schemas;
- comments/tags/message handoff mutation boundaries.

Acceptance:
- raw REST/GraphQL payloads are documented as DTOs and mapped through domain adapters;
- route-level access and action availability are represented as capability/view-model data, not leaf-component role checks;
- every task mutation declares success/cancel/failure parent-return and parent-refresh intent;
- upload contracts keep signed URLs and document bodies out of telemetry/docs artifacts.

### Phase 4: Provider/readiness/upload/download primitives

Goal:
- close shared provider and file-transfer contracts before detailed operational UI polish hardens fixture assumptions.

Affected domains/modules:
- `integrations.provider-index`
- `integrations.provider-detail`
- `integrations.provider-family-support`
- `integrations.token-entry`
- public application uploads
- integration forms/documents callbacks
- contract signing consumers
- billing card/payment provider consumers
- report export/download consumers

Contract decisions to close:
- normalized provider setup/readiness schema for calendar, job-board, HRIS, ATS, assessment, messaging, contract signing, and custom/unimplemented families;
- provider credential/auth lifecycle payloads and diagnostics summary schema;
- safe readiness handoff shape for scheduling, publishing, HRIS, ATS source/import/sync, surveys/reviews/scoring, messaging, and contracts;
- upload handshake, progress, binary transfer, metadata persistence, retry, terminal, already-downloaded, and download failure envelopes;
- public/token integration callback lifecycle enum and family-mismatch behavior;
- payment tokenization/challenge/card persistence boundaries where provider UI is involved;
- report export/schedule delivery/download lifecycle.

Acceptance:
- authenticated provider setup remains under `/integrations/:id`;
- public/token `/integration/*` routes remain separate and do not reuse authenticated shell setup state;
- operational consumers use normalized readiness/status outputs, not credentials or raw provider diagnostics;
- signed URLs, OAuth secrets, webhook secrets, private tokens, raw diagnostics logs, and callback payloads are explicitly prohibited from telemetry.

### Phase 5: V4/V5 admin schemas

Goal:
- close operational/admin table and mutation schemas after shared primitives are stable.

Affected domains/modules:
- `settings.*`
- `reports.*`
- `billing.*`
- `team` and org invite/favorite routes documented in screens/capabilities;
- `marketplace.*`
- `sysadmin.companies`
- `sysadmin.agencies`
- `sysadmin.subscriptions`
- `sysadmin.users`
- `sysadmin.favorite-requests`
- `sysadmin.taxonomy`

Contract decisions to close:
- settings subsection read/update schemas, validation envelope, public-reflection/downstream refresh behavior;
- templates, reject reasons, custom fields, forms/docs, API endpoint token/webhook persistence schemas;
- reports metrics/dimensions/result rows/export/schedule contracts;
- billing subscription/SMS/card/payment mutation schemas and payment failure taxonomy;
- team member, recruiter visibility, invite, role write policy, invite token behavior;
- org favorites/request and marketplace list/action DTOs;
- platform users, favorite-request queue/detail/action, company/agency/subscription, company subscription admin, sector/subsector schemas and mutation envelopes;
- platform dashboard aggregate decision.

Acceptance:
- org-scoped and platform-scoped user/favorite capabilities remain separate;
- SysAdmin schemas do not leak tenant-sensitive identifiers into telemetry;
- `/parameters` remains a compatibility resolver, not a monolithic settings API;
- admin table filters/pagination/sort envelopes are explicit and reusable where appropriate.

## Cross-phase acceptance criteria

Every closed contract must answer:
1. which domain/module owns the adapter;
2. whether the transport is REST, GraphQL, token/public, provider SDK boundary, or file-transfer boundary;
3. which canonical route families consume it;
4. which capability or action availability object gates route entry or mutation;
5. which loading/ready/empty/denied/not-found/stale/degraded/unavailable/error states are possible;
6. how validation errors are shaped and displayed;
7. how successful mutations invalidate or refresh parent state;
8. which telemetry events are emitted and which fields are allowlisted;
9. how `x-correlation-id` propagates through the request;
10. what remains explicitly unknown or deferred.

## Deliverables

For each phase:
- update `backend-api-contract-backlog.md` from blocker matrix into closed/open decision status;
- add or update domain-specific contract docs only where the contract is too large for the backlog row;
- update `modules.md`, `screens.md`, `capabilities.md`, `notification-destinations.md`, `navigation-and-return-behavior.md`, `telemetry-events.md`, or ADRs only when a contract changes an existing behavior rule;
- add adapter/model/test implementation only after the contract is explicit enough to avoid fixture-driven invention;
- record validation commands and remaining blockers in a phase closeout note.

## Phase deliverables

| Phase | Contract artifact | Status |
|---|---|---|
| Phase 1: Auth/token/session | `backend-api-contract-auth-token-session.md` | Drafted from current frontend adapter/tests plus V0 closeout docs; backend envelope decisions remain open. |
| Phase 2: Notifications/inbox | `backend-api-contract-notifications-inbox.md` | Drafted from current shell notification, typed destination, inbox messaging, and deliverability readiness seams; live transport decisions remain open. |
| Phase 3: Jobs and Candidates aggregates/mutations | `backend-api-contract-jobs-candidates.md` | Drafted from current Jobs fixtures/adapters, Candidate `/v2/cv` and GraphQL adapters, task/action seams, upload seams, and parent-refresh models; production mutation contracts remain open. |
| Phase 4: Provider/readiness/upload/download primitives | `backend-api-contract-provider-upload-download.md` | Drafted from current integrations provider setup/readiness seams, public/token callbacks, upload/download stages, contract signing, scheduling, billing provider challenge, and report export seams; provider/file-transfer contracts remain open. |
| Phase 5: V4/V5 admin schemas | `backend-api-contract-admin-v4-v5-schemas.md` | Drafted from current Settings, Reports, Billing, Team, Favorites, Marketplace, and SysAdmin fixture/state seams; admin persistence/table/mutation schemas remain open. |

## Initial task list

- [x] 1. Confirm whether this docs-local change plan should also be mirrored into `/Users/kauesantos/Documents/recruit/openspec/changes/` or stay isolated inside this worktree.
- [x] 2. Phase 1 inventory: extract current auth/token/session adapter calls and compare with V0 backlog outcomes.
- [x] 3. Phase 1 contract draft: write the backend-facing auth/token/session envelope proposal with confirmed vs unknown fields.
- [x] 4. Phase 2 inventory: extract notification/inbox fixture seams, typed destination kinds, and missing live DTOs.
- [x] 5. Phase 2 contract draft: write notification destination DTO, read-state mutation, inbox conversation/send contract, and fallback taxonomy.
- [x] 6. Phase 3 inventory: extract Jobs/Candidates adapters, fixture seams, task mutation states, upload states, and parent-refresh rules.
- [x] 7. Phase 3 contract draft: write aggregate/mutation DTO proposals for shared recruiter-core action families.
- [x] 8. Phase 4 inventory: extract provider readiness, token-entry, upload/download, billing/payment, and report export seams.
- [x] 9. Phase 4 contract draft: write provider/readiness/upload/download primitive contracts and safety rules.
- [x] 10. Phase 5 inventory: extract V4/V5 admin route fixture schemas and table/mutation assumptions.
- [x] 11. Phase 5 contract draft: write admin schema proposals grouped by settings, reports, billing, org admin, marketplace, and sysadmin.
- [x] 12. Validate docs links and run the agreed docs/source checks for this planning package.

## Validation plan

Planning-only validation:
- `npm test -- --runInBand` when source tests are affected later;
- `npm run build` when runtime contracts/adapters are changed later;
- docs link/search validation through `rg` for the new plan references.

OpenSpec validation:
- The app worktree does not contain an `openspec/` directory. If this plan is mirrored to `/Users/kauesantos/Documents/recruit/openspec/changes/`, validate from `/Users/kauesantos/Documents/recruit` with the matching change id.
