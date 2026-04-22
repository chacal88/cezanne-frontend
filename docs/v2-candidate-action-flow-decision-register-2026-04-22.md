# V2 Candidate Action Flow Decision Register — 2026-04-22

## Purpose

This register records the technical/product decision for V2 candidate action flows: whether to keep greenfield route/page task flows or move closer to the legacy modal-heavy candidate detail experience.

This document is intentionally conservative:

- it does **not** declare parity;
- it does **not** mark any action flow as `Figma-ready`;
- it separates confirmed facts from inference;
- it does not propose implementation code;
- it treats destructive submissions as out of scope for visual evidence.

## Inputs read

- `/Users/kauesantos/Documents/recruit/docs/README.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/visual-evidence-v2-candidates-gap-register-2026-04-22.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/visual-evidence-v2-candidates-deep-capture-2026-04-22.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/v2-candidates-visual-contract.md`
- `/Users/kauesantos/Documents/recruit/recruit-frontend/docs/navigation-and-return-behavior.md`

## Scope

Focused gaps:

- `V2-GAP-024` — schedule/interview flow composition
- `V2-GAP-025` — reject flow composition
- `V2-GAP-026` — email candidate composition
- `V2-GAP-027` — send to hiring manager/review request
- `V2-GAP-028` — move to different job
- `V2-GAP-029` — upload new CV
- `V2-GAP-030` — score now/interview feedback

## Decision vocabulary

| Recommendation | Meaning |
|---|---|
| Modal parity | Match the legacy candidate-detail modal composition without introducing a standalone task-page visual model for the parity target. |
| Routed task page | Keep the greenfield full-page task model as the target product composition. |
| Hybrid overlay | Keep route addressability, direct entry, refresh, and parent-return metadata, but render the action as an overlay/modal on top of the candidate hub when parent context exists. Direct entry rebuilds a usable parent + overlay state. |
| Deferred | Do not decide final composition yet; capture/contract/API evidence is insufficient. |

## Confirmed facts

1. The legacy candidate detail experience opens key candidate actions as modals or modal-like overlays from the candidate detail context.
2. The greenfield candidate implementation currently exposes several candidate actions as route/page task flows or route-local panels.
3. The navigation contract already requires every route/task/overlay to define direct entry, refresh behavior, back behavior, and close/cancel targets.
4. Candidate task flows must preserve candidate/job/workflow context and return to the contextual candidate detail parent rather than dropping to a generic candidate surface.
5. The visual contract says standalone task pages must not be used as final schedule/offer/reject references while legacy uses modal composition unless product explicitly accepts that deviation.
6. Current evidence is parity-blocked and not final Figma-ready evidence.

## Inference used for this register

1. A hybrid overlay is the lowest-risk product/technical direction for high-priority legacy modal flows because it preserves greenfield route safety while moving the visible composition closer to legacy.
2. Pure modal parity is acceptable for lower-surface-area actions that do not need independent deep-link semantics, but still need parent refresh and safe cancellation semantics.
3. Standalone routed task pages should be retained only where the product explicitly prefers a task-page redesign over legacy modal behavior; no such acceptance is documented in the reviewed inputs.
4. Flows with no captured greenfield equivalent and unclear backend/API contract should remain deferred until a safe non-destructive capture and route contract exist.

## Decision summary

| Gap | Action flow | Legacy composition | Greenfield evidence | Recommendation | Rationale |
|---|---|---|---|---|---|
| `V2-GAP-024` | Schedule/interview | Centered 4-step modal overlay over candidate detail. | Greenfield schedule action captured as a different route/page task model or non-modal composition. | Hybrid overlay | Scheduling benefits from route metadata and provider-readiness states, but final parity target should visually behave like a candidate-detail modal unless product accepts the page redesign. |
| `V2-GAP-025` | Reject | Two-step modal with message/template editor and reject controls. | Full routed page with backend-owned reason/internal note placeholders. | Hybrid overlay | Reject is destructive and needs explicit route/refresh/return semantics, but legacy modal composition is the better parity target. |
| `V2-GAP-026` | Email candidate | Compose modal from More actions. | Greenfield email/message action appears different and may route toward inbox/conversation behavior. | Hybrid overlay | Candidate-origin compose should remain contextual to the candidate detail while preserving recoverable messaging handoff metadata. |
| `V2-GAP-027` | Send to hiring manager / review request | More actions review-request modal. | No direct greenfield equivalent capture. | Hybrid overlay | Use the same candidate-detail overlay pattern once the action is added/captured; do not invent a standalone page as the default target. |
| `V2-GAP-028` | Move job | More actions move-job modal. | No direct greenfield equivalent capture. | Deferred | The action is not proven in greenfield and likely needs confirmed mutation, permission, and destination-job contracts before final composition. |
| `V2-GAP-029` | Upload CV | Embedded upload-new-CV control near CV controls; file workflow not submitted in evidence. | Greenfield upload CV action captured with different side-card/action feedback layout. | Modal parity | Upload should first match legacy trigger placement and modal/file-control behavior; no standalone page is justified by current evidence. |
| `V2-GAP-030` | Score now / interview feedback | Score-now modal launched from Interview score tab. | Feedback tab captured, but same modal/action flow is not proven. | Hybrid overlay | Scoring/review flows benefit from direct-entry/retry/read-only metadata, but the visible action should remain a contextual overlay from the interview feedback area. |

## Flow-by-flow impact analysis

### 1. Schedule/interview — `V2-GAP-024`

#### Confirmed facts

- Legacy evidence: `legacy-supplement/57-legacy-candidate-detail-more-actions-interview-scheduler-opened.png`.
- Legacy opens a centered multi-step scheduler modal over candidate detail.
- Greenfield evidence: `new/40-candidate-detail-schedule-action-opened.png`.
- Greenfield does not prove the same modal composition.

#### Recommendation

**Hybrid overlay.** Keep an addressable candidate scheduling route/state, but render it as a candidate-detail overlay when opened from candidate detail.

#### Impact

| Area | Impact |
|---|---|
| Deep link | Supported via an addressable task/overlay state that can rebuild candidate context before opening the scheduler overlay. |
| Parent return | Must return to the contextual candidate hub, preserving job/workflow/database-origin params and refresh intent after successful schedule changes. |
| Refresh/back behavior | Refresh should rebuild parent + scheduler state or a safe unavailable/provider-blocked state. Browser back should close the scheduler layer before leaving the candidate context. |
| Route metadata | Needs explicit action type, candidate id, optional job/workflow context, parent return target, readiness state, and parent-refresh intent. |
| Figma readiness | Not ready. Requires side-by-side recapture after overlay composition is aligned and provider-blocked/degraded states are evidenced or deferred explicitly. |

### 2. Reject — `V2-GAP-025`

#### Confirmed facts

- Legacy evidence: `legacy-supplement/55-legacy-candidate-detail-reject-modal-opened.png`.
- Legacy opens a reject modal with step/message/editor controls.
- Greenfield evidence: `new/42-candidate-detail-reject-action-opened.png`.
- Greenfield currently uses a full routed page composition.

#### Recommendation

**Hybrid overlay.** Preserve route/task safety for a destructive flow, but align the visible parity target to the legacy modal.

#### Impact

| Area | Impact |
|---|---|
| Deep link | Supported, but direct entry must render a safe candidate parent plus reject overlay rather than a standalone page unless product approves that redesign. |
| Parent return | Cancel, failure recovery, and success should return to the candidate/job/database-origin context with refresh intent after mutation. |
| Refresh/back behavior | Refresh must not lose draft/error state if encoded or safely recoverable; browser back should close the reject overlay without accidental rejection. |
| Route metadata | Needs reject action state, candidate id, contextual parent, terminal/read-only state, validation/error state, and refresh intent. |
| Figma readiness | Not ready. Modal steps, editor controls, button hierarchy, validation states, and terminal/read-only variants need evidence. |

### 3. Email candidate — `V2-GAP-026`

#### Confirmed facts

- Legacy evidence: `legacy-supplement/56-legacy-candidate-detail-more-actions-email-candidate-opened.png`.
- Legacy opens compose from More actions without submitting a message in evidence.
- Greenfield evidence: `new/43-candidate-detail-email-message-action-opened.png`.
- Greenfield behavior appears compositionally different and may connect to inbox/conversation behavior.

#### Recommendation

**Hybrid overlay.** Candidate-origin compose should open as a contextual overlay while retaining messaging route/handoff metadata.

#### Impact

| Area | Impact |
|---|---|
| Deep link | Supported for compose/recover states only if message body handling is safe and no sensitive body content is encoded in the URL. |
| Parent return | Close/cancel returns to candidate detail; successful send should refresh candidate communication summaries or email history. Inbox handoff should preserve candidate recovery context. |
| Refresh/back behavior | Refresh should rebuild a safe empty/draft-recoverable compose state or return to candidate detail with a non-destructive notice. Back closes compose first. |
| Route metadata | Needs candidate id, optional conversation id or communication intent, parent return, provider/degraded state, and no raw message body in route metadata. |
| Figma readiness | Not ready. Requires compose modal parity, email history relationship, provider-blocked/degraded states, and safe content-handling evidence. |

### 4. Send to hiring manager / review request — `V2-GAP-027`

#### Confirmed facts

- Legacy evidence: `legacy-supplement/58-legacy-candidate-detail-more-actions-send-to-hiring-manager-opened.png`.
- Legacy exposes this as a More actions modal.
- No direct greenfield equivalent was captured from candidate detail.

#### Recommendation

**Hybrid overlay.** When implemented/captured, make it a candidate-detail overlay with route metadata rather than a new standalone visual family.

#### Impact

| Area | Impact |
|---|---|
| Deep link | Should be supported only after recipient/review-request contract is known; direct entry can rebuild parent + review-request overlay. |
| Parent return | Close/cancel returns to candidate detail; success refreshes collaboration/review status on the parent. |
| Refresh/back behavior | Refresh must handle stale recipient lists or unavailable review capability without navigating away. Back closes overlay first. |
| Route metadata | Needs action type, candidate id, optional job context, parent return, recipient/readiness state, and mutation outcome/refresh intent. |
| Figma readiness | Not ready. Greenfield equivalent, recipient state, validation/error states, and success/blocked variants are not evidenced. |

### 5. Move job — `V2-GAP-028`

#### Confirmed facts

- Legacy evidence: `legacy-supplement/59-legacy-candidate-detail-more-actions-move-job-opened.png`.
- Legacy exposes this as a More actions modal.
- No direct greenfield equivalent was captured.

#### Recommendation

**Deferred.** Do not choose modal, route, or hybrid as final target until the action contract is confirmed.

#### Impact

| Area | Impact |
|---|---|
| Deep link | Not ready to define beyond requiring a stable parent candidate context if the flow becomes addressable. |
| Parent return | Must be defined before implementation because a successful move may invalidate the current job-context candidate route. |
| Refresh/back behavior | Needs explicit stale-context behavior: refresh after move may need to show old-context unavailable, new job context, or a parent fallback. Back must not replay a mutation. |
| Route metadata | Missing confirmed destination-job selection contract, permission model, mutation outcome, and post-move parent target. |
| Figma readiness | Not ready. Requires greenfield equivalent, safe dummy data, non-destructive capture boundaries, and post-move route behavior decision. |

### 6. Upload CV — `V2-GAP-029`

#### Confirmed facts

- Legacy evidence: `legacy-supplement/60-legacy-candidate-detail-upload-new-cv-visible-control.png`.
- Legacy upload control is embedded near CV controls; file selection/submission was not performed.
- Greenfield evidence: `new/45-candidate-detail-upload-cv-action-opened.png`.
- Greenfield placement and feedback composition differ from legacy.

#### Recommendation

**Modal parity.** First align trigger placement and file-control/modal behavior to the legacy CV area. Do not promote a standalone routed task page for upload based on current evidence.

#### Impact

| Area | Impact |
|---|---|
| Deep link | Not required for parity target unless product later requires resumable upload. The CV tab/detail route is the stable entry. |
| Parent return | Close/cancel remains on the CV tab or candidate detail; success refreshes CV/document summary and latest-CV preview state. |
| Refresh/back behavior | Refresh during upload should degrade safely to the CV tab; browser back should close any upload overlay/file state before leaving candidate detail. |
| Route metadata | Minimal route metadata: candidate id, active CV tab/panel, parent context, and refresh intent after upload. File/binary state must not be route-encoded. |
| Figma readiness | Not ready. Needs selected-file, validation-error, upload-failure, success, and no-preview states with safe dummy files. |

### 7. Score now / interview feedback — `V2-GAP-030`

#### Confirmed facts

- Legacy evidence: `legacy-supplement/61-legacy-candidate-detail-score-now-modal-opened.png`.
- Legacy opens score-now as a modal from the Interview score tab.
- Greenfield evidence: `new/32-candidate-detail-feedback-tab.png`.
- Greenfield feedback tab does not prove the same score-now modal/action flow.

#### Recommendation

**Hybrid overlay.** Keep review/scoring operational route metadata for retry/read-only/degraded states, but render score entry as a candidate-detail overlay from the interview feedback area.

#### Impact

| Area | Impact |
|---|---|
| Deep link | Supported for review/scoring launcher states if direct entry can rebuild candidate context and avoid exposing raw answers in URL metadata. |
| Parent return | Close/cancel returns to Interview score/Feedback context; success refreshes score summary and review status. |
| Refresh/back behavior | Refresh should rebuild a safe scoring state, read-only terminal state, or candidate feedback tab fallback. Back closes scoring overlay first. |
| Route metadata | Needs candidate id, optional interview/review id, parent return, read-only/terminal state, validation/retry state, and refresh intent. |
| Figma readiness | Not ready. Requires modal parity capture, score fields, validation, completed/read-only, unavailable, and retry states. |

## Cross-flow technical decision

### Recommended target model

Use **route-backed overlays** for most candidate action flows instead of standalone task pages as the final parity visual target.

Confirmed constraint:

- The navigation contract already expects route/task/overlay metadata for direct entry, refresh, back, and close/cancel behavior.

Inferred design direction:

- Route-backed overlays preserve those guarantees while matching the legacy modal-heavy product composition more closely than full routed pages.

### Route metadata minimum

Each non-deferred route-backed action should declare:

- action id/type;
- candidate id;
- optional job/workflow/status/order/filter context;
- source/entry context: job, database, notification, direct, or candidate detail;
- sanitized parent return target;
- close/cancel target;
- refresh behavior;
- back-button behavior;
- mutation success refresh intent;
- unavailable/denied/provider-blocked/degraded behavior where applicable;
- explicit rule that sensitive message bodies, file contents, raw scoring answers, and provider payloads are not encoded in route metadata.

## Product decision

1. Do **not** treat current greenfield standalone task pages as final visual parity evidence for candidate actions.
2. Prefer **hybrid overlay** for schedule, reject, email candidate, send to hiring manager/review request, and score now/interview feedback.
3. Prefer **modal parity** for upload CV because the legacy evidence places the trigger in the CV area and no independent route need is confirmed.
4. Keep move job **deferred** until greenfield evidence and post-move route behavior are defined.
5. Keep all seven flows parity-blocked until recaptured after the chosen composition is implemented or explicitly accepted as a product deviation.

## Figma readiness decision

| Area | Decision | Reason |
|---|---|---|
| Candidate action flows | Not Figma-ready | Current evidence confirms composition differences or missing greenfield equivalents. |
| Hybrid overlay model | Not Figma-ready | It is a recommended direction, not captured parity evidence. |
| Modal parity targets | Not Figma-ready | Legacy references exist, but matching greenfield modal states are not proven. |
| Deferred move-job flow | Not Figma-ready | Contract and greenfield evidence are insufficient. |

## Follow-up evidence required before any promotion

1. Recapture each chosen overlay/modal state side-by-side with the legacy reference.
2. Capture direct-entry refresh behavior for route-backed overlays.
3. Capture browser back behavior proving one-step overlay close where applicable.
4. Capture parent-return behavior from job-origin and database-origin candidate contexts.
5. Capture validation/error/retry/provider-blocked/degraded states without submitting destructive actions.
6. Confirm route metadata for each non-deferred action in `navigation-and-return-behavior.md` or a referenced extension.
7. Record any product-approved deviation from legacy modal composition before using it as Figma input.
