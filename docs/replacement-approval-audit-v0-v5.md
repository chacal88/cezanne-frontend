# V0-V5 Replacement Approval Audit

## Purpose

This audit records what remains before any V0-V5 surface can be treated as production replacement-approved.

Rules:
- `Figma-ready` means drafting/screen-flow work may start.
- `Figma-ready` does not mean replacement-approved.
- A legacy-backed route/state needs matched legacy, current, and Figma evidence at the same viewport and matched data/state.
- Any visual difference needs either a fix or an explicit product exception tied to the route/family/gap id.
- Backend/API readiness is separate from visual parity and separate from Figma drafting.

## Sources Read

Primary greenfield docs:
- `README.md`
- `roadmap.md`
- `pre-figma-flow-review.md`
- `figma-screen-flow-handoff-index.md`
- `backend-api-contract-backlog.md`
- `implementation-readiness-checklist.md`
- V0-V5 visual contracts and evidence logs

Legacy reference spot-checks:
- `/Users/kauesantos/Documents/recruit/frontend/src/app/pages/_main/main.route.js` confirms legacy `/logout`.
- `/Users/kauesantos/Documents/recruit/frontend/src/app/domain/login/login.route.js` confirms legacy `/forgot-password`, `/reset-password/:token`, and `/confirm-registration/:token`.
- `/Users/kauesantos/Documents/recruit/frontend/src/app/pages/dashboard/dashboard.route.js` and `dashboard.html` confirm legacy `/dashboard`.
- `/Users/kauesantos/Documents/recruit/frontend/src/app/pages/notifications/notifications.route.js` and `notifications.html` confirm legacy `/notifications`.
- `/Users/kauesantos/Documents/recruit/frontend/src/app/pages/inbox/inbox.route.js` and `userInbox` components confirm legacy `/inbox?conversation`.

## Approval Status Values

| Value | Meaning |
|---|---|
| `Yes` | Confirmed by the current evidence package. |
| `Partial` | Confirmed for a constrained subset, viewport, state family, or current-app-only basis. |
| `No` | Not confirmed. |
| `N/A` | Not applicable to the row, or no matching legacy-backed state is currently identified. |
| `TBD` | Needs product/backend/design decision before classification can be final. |

## Final Matrix By Version

| Version | Figma drafting allowed | Backend/API ready | Visual parity ready | Responsive/mobile ready | Product exception needed | Replacement-approved |
|---|---|---|---|---|---|---|
| V0 | Partial | Partial | Partial for `/logout` only | Partial | TBD for fixture/live gaps | `/logout` only |
| V1 | Yes for Jobs screen-flow bases | Partial | No | No | TBD for any accepted layout/schema deviations | No |
| V2 | No | Partial | No | Partial current-app coverage only | Likely for unresolved candidate deviations if not fixed | No |
| V3 | Yes for public/external/token bases | Partial | No | Yes for captured bases | TBD where legacy/reference parity is not pursued | No |
| V4 | Yes for current-app operations bases | Partial | No | Partial | TBD for legacy-backed operations deviations | No |
| V5 | Yes for desktop current-app SysAdmin/platform rows | No/Partial | No | No | TBD for legacy SysAdmin scope and mobile omissions | No |

Only `/logout` is currently replacement-approved, and only for the explicit V0 logout handoff to the public login surface.

First focused evidence pack:
- `replacement-evidence-v0-logout.md` records the first V0 `/logout` replacement evidence pass. Decision: `Pixel-parity-approved` for `/logout` only after the login-field placeholder/icon parity fix and 1440x900 recapture; no other route approval changes.

## V0 Checklist

| Route/sub-block | Figma drafting allowed | Backend/API ready | Visual parity ready | Responsive/mobile ready | Product exception needed | Replacement-approved | Main blockers |
|---|---|---|---|---|---|---|---|
| Primary login `/` and `/login` entry | Yes for covered states | Partial | No | Partial | TBD | No | Auth error taxonomy, 2FA delivery/lockout, activation/setup reason payloads, matched legacy/current/Figma parity. |
| Token flows `/forgot-password`, `/reset-password/:token`, `/confirm-registration/:token`, `/register`, `/register/:token`, `/users/invite-token` | Yes for current-app state map | Partial | No | Partial | TBD | No | Token lifecycle enum, continuation payloads, pending/used/expired semantics, matched legacy/current/Figma parity. |
| SSO/Cezanne/SAML launch and callbacks | Yes for current-app transition map | Partial | No | Partial | TBD | No | Provider callback payloads, popup/redirect treatment, provider error taxonomy, reference parity where legacy exists. |
| `/logout` and session-loss transitions | Yes for covered transitions | Partial | Yes for `/logout` explicit handoff only | Partial | No for `/logout`; TBD for `/session-lost` | `/logout` only | `/session-lost` copy/policy parity remains separate; no other session transition is approved. |
| Shell and account profile routes | Yes for current-app state map | Partial | No | No | TBD | No | Profile persistence APIs, validation schema, account-menu/topbar/sidebar parity. |
| `/dashboard` desktop base | Yes for desktop base | Partial | No | No | TBD | No | Aggregate semantics, calendar/activity/inbox summary data, shell/dashboard layout parity, breakpoint parity. |
| `/notifications` resolver categories | Yes, fixture-backed only | No | No | No | Yes if live API remains deferred for first design batch | No | Live notification API, destination payloads, pagination/read-state, legacy/current/Figma parity. |
| `/inbox?conversation=` empty/selected | Yes, fixture-backed only | No | No | No | Yes if live transport remains deferred for first design batch | No | Live conversation transport, composer/send states, provider-blocked states, legacy/current/Figma parity. |

V0 first approved internal candidate: `/logout`, because it has a small route surface and minimal backend dependency. The matched legacy/current/Figma parity pack is recorded in `replacement-evidence-v0-logout.md`.

The first `/logout` evidence pack now exists in `replacement-evidence-v0-logout.md`. Runtime has been aligned to the legacy action-route redirect behavior, the visible login-field parity deltas are fixed, and the current post-handoff login state has been recaptured. `/logout` is approved only for the explicit handoff; `/session-lost`, `/`, and all other routes remain unapproved.

## V1 Checklist

| Route/sub-block | Figma drafting allowed | Backend/API ready | Visual parity ready | Responsive/mobile ready | Product exception needed | Replacement-approved | Main blockers |
|---|---|---|---|---|---|---|---|
| Jobs list `/jobs/:type?page&search&asAdmin&label` | Yes | Partial | No | No | TBD | No | Production row/table schema, source-health contract, table/layout parity, responsive parity. |
| Job authoring `/jobs/manage/:id?resetWorkflow` | Yes | Partial | No | No | TBD | No | Final form schema, validation envelope, reset/publish payloads, legacy form parity. |
| Job detail `/job/:id?section` | Yes | Partial | No | No | TBD | No | Detail aggregate/section schemas, action grouping, candidate pipeline/calendar/activity parity. |
| Job task overlays bid/CV/reject/schedule/offer | Yes | Partial | No | No | TBD | No | Mutation schemas, provider/calendar/contract payloads, overlay/modal parity. |
| Requisition routes `/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` | Yes | Partial | No | No | TBD | No | Requisition/workflow/HRIS schemas, drift payloads, legacy/reference parity. |

## V2 Checklist

| Route/sub-block | Figma drafting allowed | Backend/API ready | Visual parity ready | Responsive/mobile ready | Product exception needed | Replacement-approved | Main blockers |
|---|---|---|---|---|---|---|---|
| Candidate database `/candidates-database?query&page` | No | Partial | No | Partial current-app only | Likely if exact legacy table/menu parity is not fixed | No | Same-run authenticated legacy/current recapture, exact toolbar/column/menu geometry, stage/status column decision, row/data parity. |
| Candidate detail `/candidate/:id/:job?/:status?/:order?/:filters?/:interview?` | No | Partial | No | Partial current-app only | Likely if shell/proportion deviations remain | No | Detail lateral shell/proportions, side-card details, hiring-flow dots/lines, CV/tab proportions, matched data/state. |
| Candidate action launchers schedule/offer/reject/email/review/move/hire/unhire/upload/score | No | Partial | No | No | Likely unless exact modal/editor parity is fixed | No | Exact modal/editor parity, mutation payloads, terminal/read-only/provider states, destructive action boundaries. |
| Candidate non-ready/mobile states | No | Partial | No | Partial current-app only | TBD for mobile parity scope | No | Denied/stale/unavailable/mobile current captures exist, but legacy parity and product-approved mobile scope are still missing. |

No V2 gap is parity-resolved. V2 remains not Figma-ready and not replacement-approved.

## V3 Checklist

| Route/sub-block | Figma drafting allowed | Backend/API ready | Visual parity ready | Responsive/mobile ready | Product exception needed | Replacement-approved | Main blockers |
|---|---|---|---|---|---|---|---|
| Shared token lifecycle | Yes | Partial | No | Yes | TBD | No | Token payloads, terminal copy, reference parity where matching legacy states exist. |
| External chat `/chat/:token/:user_id` | Yes | Partial | No | Yes | TBD | No | Participant/thread DTOs, live transport, send taxonomy, replacement parity if legacy/reference exists. |
| Interview/review/feedback/survey public forms | Yes | Partial | No | Yes | TBD | No | Form schemas, answer payloads, scoring taxonomy, terminal read-only DTOs, reference parity. |
| Shared job and public application | Yes | Partial | No | Yes | TBD | No | Applicant schema, upload provider semantics, metadata persistence, reference parity. |
| Requisition approval/forms/download | Yes | Partial | No | Yes | TBD | No | Approval/form/download payloads, workflow drift taxonomy, signed download contract, reference parity. |
| Integration token callbacks | Yes | Partial | No | Yes | TBD | No | Token callback payloads, provider conflict taxonomy, upload/persistence envelopes, reference parity. |

## V4 Checklist

| Route/sub-block | Figma drafting allowed | Backend/API ready | Visual parity ready | Responsive/mobile ready | Product exception needed | Replacement-approved | Main blockers |
|---|---|---|---|---|---|---|---|
| Settings and templates routes | Yes | Partial | No | Partial | TBD | No | Per-subsection schemas, validation envelopes, public reflection, legacy-backed settings parity. |
| Integrations admin `/integrations*` | Yes | Partial | No | Partial | TBD | No | Provider config/readiness schemas, auth lifecycle, diagnostics, credential placeholder rules, parity where legacy-backed. |
| Reports routes | Yes | Partial | No | Partial | TBD | No | Metrics/dimensions/result schemas, export/schedule contracts, legacy report mapping/parity. |
| Billing/payment/SMS/card | Yes | Partial | No | Partial | TBD | No | Provider challenge/tokenization, subscription/SMS/card payloads, commercial state source, parity. |
| Team/invite/recruiters | Yes | Partial | No | Partial | TBD | No | Team member schema, recruiter visibility, invite payload, role write policy, parity. |
| Org favorites/requests/marketplace | Yes | Partial | No | Partial | TBD | No | Favorite/request DTOs, marketplace item/action contracts, parity where legacy-backed. |

## V5 Checklist

| Route/sub-block | Figma drafting allowed | Backend/API ready | Visual parity ready | Responsive/mobile ready | Product exception needed | Replacement-approved | Main blockers |
|---|---|---|---|---|---|---|---|
| Platform users `/users*` | Yes, desktop current-app only | No | No | No | TBD | No | User schemas, role/tenant assignment, validation/conflict/stale behavior, legacy scope/parity if applicable. |
| Platform favorite requests `/favorites-request*` | Yes, desktop current-app only | No | No | No | TBD | No | Queue/detail/action payloads, action failure taxonomy, audit fields, parity/scope decision. |
| Platform master data companies/agencies/subscriptions | Yes, desktop current-app only | No | No | No | TBD | No | Entity schemas, edit mutations, subscription admin payloads, list filters, parity/scope decision. |
| Taxonomy sectors/subsectors | Yes, desktop current-app only | Partial | No | No | TBD | No | Taxonomy schemas/mutations, parent constraints, conflict taxonomy, parity/scope decision. |
| Platform dashboard | No as standalone replacement target | No | No | No | TBD | No | Dashboard copy/polish, aggregate decision, denied/unavailable variants, mobile scope. |

## Shortest Path To First Replacement Approval

Recommended first approval target: V0 `/logout`.

Why:
- It is already a small, isolated route with current-app evidence.
- The legacy app has a concrete `/logout` state/route in `_main/main.route.js`.
- It has minimal backend payload dependency compared with auth tokens, dashboard, inbox, Jobs, Candidates, V4 operations, or V5 admin tables.
- It can exercise the full approval process without needing complex data seeding.

Completed approval pack for `/logout`:
1. Capture legacy `/logout` behavior and resulting logged-out/login state at the target viewport.
2. Capture current `/logout` behavior and resulting logged-out/login state at the same viewport.
3. Produce or attach the canonical Figma frame for the logged-out/session transition state.
4. Compare legacy/current/Figma for layout, spacing, typography, icon placement, route handoff, and copy.
5. Fix differences or record a product exception with route `/logout` and the affected visual/state delta. Done: login-field placeholder/icon treatment fixed.
6. Record the row as `Pixel-parity-approved` only in the replacement evidence record, not by changing route ownership. Done for `/logout` only.

Second-best target: V0 `/forgot-password`.

Why it is second:
- It has an existing legacy route and current evidence, but it still depends on final token/error copy and submit lifecycle semantics.

### V0 `/forgot-password` Pre-Approval Readiness Note

Status: second candidate only. Do not mark `/forgot-password` replacement-approved from this note, and do not reuse the `/logout` approval pack as evidence for this route.

Current evidence:
- Legacy route/source exists under `/Users/kauesantos/Documents/recruit/frontend/src/app/domain/login/forgot-password/`.
- Legacy ready screenshot exists at `visual-evidence-assets/v0/legacy/legacy-forgot-password-1440x900.png`; focused same-run ready capture now exists under `visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/legacy/`.
- Current ready screenshot exists at `visual-evidence-assets/v0/current/greenfield-forgot-password-1440x900.png`; focused same-run ready recapture now exists under `visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/current/`.
- Current submitted/sent screenshot exists at `visual-evidence-assets/v0/current/greenfield-forgot-password-submitted-1440x900.png`.
- Current deterministic state-hook screenshots exist for `/forgot-password?visualState=missing|invalid|expired|valid|success|failure|retry|pending-approval|bootstrap-failure` in `visual-evidence-assets/v0/current/state-hooks/`.
- Legacy source confirms one email field, disabled/loading submit, `User.save({ id: 'forgot-password' }, vm.forgotPassword)`, response `msg` values `mail_not_found`, `mail_sent`, and `mail_error`, success/error toastr copy, and success redirect to `home`.
- Focused evidence record `replacement-evidence-v0-forgot-password.md` and manifest `visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/capture-manifest.json` now capture ready, submitting, `mail_sent`, `mail_not_found`, and `mail_error` same-run at desktop `1440x900`.

Missing matched legacy/current/Figma captures:
- Canonical Figma frames or frame-node references for ready, submitting, sent/success, not-found, failure/retry, and return-to-login states.
- A side-by-side comparison record for each state above, all at the same viewport, route, seed, and state trigger.

Backend copy/token blockers:
- Final backend response enum for `/user/forgot-password` must confirm whether `mail_sent`, `mail_not_found`, and `mail_error` remain the complete public contract or are replaced by structured error codes.
- Product/security must confirm whether account-existence disclosure follows the legacy `mail_not_found` behavior or changes to neutral recovery copy; any change needs a product exception before replacement approval.
- Current implementation now follows legacy-style top-right flash placement for success, not-found, and failure.
- Current implementation now follows the legacy `mail_sent` handoff direction by redirecting to `/` after storing the success flash.
- Reset-token email lifecycle remains backend-owned: token generation, expiry, used-token semantics, rate limiting/throttling copy, and delivery failure taxonomy must be documented enough that forgot-password does not imply unconfirmed reset-token behavior.

Remaining exact checklist:
1. Attach Figma frame/node references for ready, submitting, sent/success, not-found, failure/retry, and return-to-login.
2. Confirm account-existence disclosure for `mail_not_found`.
3. Confirm the final backend response enum for `/user/forgot-password`.
4. Recapture after Figma references and backend/product decisions are attached before requesting replacement approval.

## Required Next Documents Before Approval

Before marking any route approved, create a replacement evidence record from `replacement-approval-evidence-template.md` with:
- route/family and exact state;
- release/version and route class;
- legacy screenshot path;
- current screenshot path;
- Figma frame/node reference;
- viewport and data seed;
- backend/API readiness status;
- visual diffs found;
- responsive/mobile checklist status;
- fixes applied or product exception id;
- final decision and approver/date.

The reusable template is only a checklist and structure for future route/family evidence packs. It does not grant replacement approval, and it must not be used to mark any route `Pixel-parity-approved` without matched legacy/current/Figma evidence and an explicit approver/date.

This audit does not create any replacement approval. It only identifies the approval checklist and the recommended first route.
