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
| V0 | Partial | Partial | No | Partial | TBD for fixture/live gaps | No |
| V1 | Yes for Jobs screen-flow bases | Partial | No | No | TBD for any accepted layout/schema deviations | No |
| V2 | No | Partial | No | Partial current-app coverage only | Likely for unresolved candidate deviations if not fixed | No |
| V3 | Yes for public/external/token bases | Partial | No | Yes for captured bases | TBD where legacy/reference parity is not pursued | No |
| V4 | Yes for current-app operations bases | Partial | No | Partial | TBD for legacy-backed operations deviations | No |
| V5 | Yes for desktop current-app SysAdmin/platform rows | No/Partial | No | No | TBD for legacy SysAdmin scope and mobile omissions | No |

No V0-V5 route or sub-block is currently replacement-approved.

## V0 Checklist

| Route/sub-block | Figma drafting allowed | Backend/API ready | Visual parity ready | Responsive/mobile ready | Product exception needed | Replacement-approved | Main blockers |
|---|---|---|---|---|---|---|---|
| Primary login `/` and `/login` entry | Yes for covered states | Partial | No | Partial | TBD | No | Auth error taxonomy, 2FA delivery/lockout, activation/setup reason payloads, matched legacy/current/Figma parity. |
| Token flows `/forgot-password`, `/reset-password/:token`, `/confirm-registration/:token`, `/register`, `/register/:token`, `/users/invite-token` | Yes for current-app state map | Partial | No | Partial | TBD | No | Token lifecycle enum, continuation payloads, pending/used/expired semantics, matched legacy/current/Figma parity. |
| SSO/Cezanne/SAML launch and callbacks | Yes for current-app transition map | Partial | No | Partial | TBD | No | Provider callback payloads, popup/redirect treatment, provider error taxonomy, reference parity where legacy exists. |
| `/logout` and session-loss transitions | Yes for covered transitions | Partial | No | Partial | TBD | No | Final logged-out/session-loss copy, same-viewport legacy/current/Figma comparison. |
| Shell and account profile routes | Yes for current-app state map | Partial | No | No | TBD | No | Profile persistence APIs, validation schema, account-menu/topbar/sidebar parity. |
| `/dashboard` desktop base | Yes for desktop base | Partial | No | No | TBD | No | Aggregate semantics, calendar/activity/inbox summary data, shell/dashboard layout parity, breakpoint parity. |
| `/notifications` resolver categories | Yes, fixture-backed only | No | No | No | Yes if live API remains deferred for first design batch | No | Live notification API, destination payloads, pagination/read-state, legacy/current/Figma parity. |
| `/inbox?conversation=` empty/selected | Yes, fixture-backed only | No | No | No | Yes if live transport remains deferred for first design batch | No | Live conversation transport, composer/send states, provider-blocked states, legacy/current/Figma parity. |

V0 shortest internal candidate: `/logout`, because it has a small route surface and minimal backend dependency. It still needs a matched legacy/current/Figma parity pack before approval.

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

Required approval pack for `/logout`:
1. Capture legacy `/logout` behavior and resulting logged-out/login state at the target viewport.
2. Capture current `/logout` behavior and resulting logged-out/login state at the same viewport.
3. Produce or attach the canonical Figma frame for the logged-out/session transition state.
4. Compare legacy/current/Figma for layout, spacing, typography, icon placement, route handoff, and copy.
5. Fix differences or record a product exception with route `/logout` and the affected visual/state delta.
6. Record the row as `Pixel-parity-approved` only in the replacement evidence record, not by changing route ownership.

Second-best target: V0 `/forgot-password`.

Why it is second:
- It has an existing legacy route and current evidence, but it still depends on final token/error copy and submit lifecycle semantics.

## Required Next Documents Before Approval

Before marking any route approved, create a replacement evidence record with:
- route/family and exact state;
- legacy screenshot path;
- current screenshot path;
- Figma frame/node reference;
- viewport and data seed;
- backend/API readiness status;
- visual diffs found;
- fixes applied or product exception id;
- final decision and approver/date.

This audit does not create any replacement approval. It only identifies the approval checklist and the recommended first route.
