# Pre-Figma Flow Review Gate

## Purpose

This document blocks Figma/screen-flow production until every route and flow from `screens.md` has been reviewed for product behavior, state coverage, data/API expectations, parent-return semantics, and telemetry safety. Existing visual references do not imply flow confirmation.

## Gate status

| Gate item | Status | Notes |
|---|---|---|
| Complete route inventory imported from `screens.md` | Done | 103 canonical route rows imported; 4 alias/reference rows are tracked separately below. |
| Domain-by-domain flow review | Done | All route rows are contract-reviewed; no domain is fully Figma-ready until visual evidence is confirmed. |
| Visual reference confirmation | In progress | V0/V1 evidence capture is complete for covered sub-blocks; V2 candidate behaviour evidence is recaptured but parity-blocked against legacy. V3-V5 evidence remains pending. |
| Figma production | Partially unblocked | V0 and V1 covered sub-blocks may proceed to Figma; V2 candidate rows are blocked from final Figma-ready promotion until legacy parity blockers are resolved. Uncovered auth/token/provider/schema/terminal states and V3-V5 remain blocked. |

## Review status values

- `Not reviewed` — route exists in inventory but has not been checked against docs/specs/code/reference behavior.
- `Contract-reviewed` — route behavior contract is specific enough for Figma handoff, but visual reference remains pending.
- `Needs clarification` — behavior, owner, state, data contract, or parent return is ambiguous.
- `Figma-ready` — contract-reviewed and cleared for canonical Figma/screen-flow work.

## Required review checklist per row

- [ ] Canonical route pattern matches router and `screens.md`.
- [ ] Route class is confirmed and back/refresh/direct-entry behavior is explicit.
- [ ] Domain/module owner matches `domains.md` and `modules.md`.
- [ ] Personas and capability gates match runtime capability catalog.
- [ ] Entry modes include shell, direct URL, notification, parent task, public/token, provider callback, or compatibility entry as applicable.
- [ ] State groups include loading, ready, empty, denied, unavailable, degraded, stale, retry, submitting, success, terminal, and read-only variants where applicable.
- [ ] Primary actions and secondary actions are enumerated.
- [ ] Error/retry states distinguish recoverable from terminal failures.
- [ ] Parent return target and refresh intent are explicit.
- [ ] Data/API contracts are identified without inventing backend APIs.
- [ ] Telemetry payload is allowlisted and excludes raw credentials, tokens, auth codes, message bodies, documents, provider payloads, signed URLs, and tenant-sensitive raw payloads.
- [ ] Visual reference is pending or canonical; screenshots/ad-hoc mocks are not treated as canonical.

## Domain summary

| Domain | Rows | H | M | L | Current status |
|---|---:|---:|---:|---:|---|
| `auth` | 9 | 8 | 0 | 1 | Partial: logout is Figma-ready; primary login is Figma-ready only as a sub-block, while token/SSO/session-loss variants remain contract-reviewed |
| `shell` | 5 | 1 | 4 | 0 | Partial: all rows contract-reviewed; canonical visuals still pending |
| `dashboard` | 1 | 1 | 0 | 0 | Figma-ready for desktop dashboard base after current and legacy authenticated seed capture; parity refinements remain tracked debt |
| `notifications` | 1 | 1 | 0 | 0 | Figma-ready for V0 fixture-backed resolver categories by explicit decision; live API replacement remains deferred |
| `inbox` | 1 | 0 | 0 | 1 | Figma-ready for V0 fixture-backed empty/selected conversation states by explicit decision; send/live transport remains deferred |
| `jobs` | 12 | 8 | 4 | 0 | Figma-ready for V1 screen-flow bases after current/legacy visual evidence; provider/form/schema refinements remain deferred debt |
| `candidates` | 7 | 4 | 3 | 0 | Partial: V2 current behaviour evidence exists, but legacy parity review blocks final Figma-ready promotion; deferred provider/schema/terminal variants remain blocked |
| `public-external` | 9 | 1 | 7 | 1 | Partial: all rows contract-reviewed for token/state/workflow; canonical visuals and backend API depth still pending |
| `settings` | 17 | 0 | 14 | 3 | Partial: all rows contract-reviewed; canonical visuals and backend contracts still pending |
| `integrations` | 5 | 0 | 2 | 3 | Partial: all rows contract-reviewed for setup/token contracts; canonical visuals and backend API depth still pending |
| `reports` | 7 | 0 | 5 | 2 | Partial: all rows contract-reviewed for family/result/export/schedule contracts; canonical visuals and backend schema still pending |
| `billing` | 4 | 0 | 4 | 0 | Partial: all rows contract-reviewed for commercial/payment state contracts; canonical visuals and provider API fields still pending |
| `team` | 3 | 0 | 3 | 0 | Partial: all rows contract-reviewed for org-team/invite contracts; canonical visuals and backend contracts still pending |
| `favorites` | 3 | 0 | 0 | 3 | Partial: all rows contract-reviewed for org-favorites contracts; canonical visuals and backend contracts still pending |
| `marketplace` | 1 | 0 | 1 | 0 | Partial: row contract-reviewed for RA marketplace list contract; canonical visuals and backend schema still pending |
| `sysadmin` | 19 | 0 | 13 | 6 | Partial: all rows contract-reviewed for platform-admin contracts; canonical visuals and backend contracts still pending |


## Visual-readiness pass

Contract review is complete, and Figma production is partially unblocked only for rows/sub-blocks explicitly marked `Figma-ready`. V0/V1 covered bases may proceed; V2 candidate rows must remain parity-blocked until side-by-side legacy mismatches are resolved or explicitly accepted. Deferred provider/schema/terminal variants remain blocked until separately evidenced.

| Phase | Domain/family | Required visual evidence | Minimum states to confirm | Output before Figma-ready |
|---|---|---|---|---|
| V0 | Auth entry | Legacy/source login reference, current greenfield login, typography/spacing/token comparison | empty, filled, invalid credentials, loading, 2FA required, SSO required, session bootstrap failure, redirecting | `v0-auth-shell-dashboard-visual-contract.md` plus accepted deviations and screenshots |
| V0 | Auth token flows | Current token pages plus any legacy references available for register/confirm/reset/forgot/invite | missing token, invalid, expired, valid, pending approval, submit success, submit failure, retry, return to login | `v0-auth-shell-dashboard-visual-contract.md` token-flow visual state map |
| V0 | SSO/callback/logout | Current callback/logout pages and provider-launch reference behavior | launch, provider error, missing code, exchange loading, exchange failed, bootstrap failed, logged-out, public-entry fallback | `v0-auth-shell-dashboard-visual-contract.md` SSO/logout transition contract |
| V0 | Shell/navigation/account | Current authenticated shell, legacy dashboard shell reference, account/profile pages | org mode, platform mode, account menu, notification bell, denied fallback, profile dirty/saved/degraded, logout entry | `v0-auth-shell-dashboard-visual-contract.md` shell layout/account visual contract |
| V0 | Dashboard + notifications + inbox | Current dashboard and legacy dashboard reference at matching viewport; notification/inbox current pages | loading skeleton, ready, degraded source, unavailable calendar, empty notifications, unknown/denied/stale destination, selected conversation, send failure | `v0-auth-shell-dashboard-visual-contract.md` R0 visual parity debt list |
| V1 | Jobs | Current job list/detail/task pages plus route/state contracts | list ready/empty/filtered-empty, detail sections, authoring dirty/saved/failed, bid/CV/reject/schedule/offer overlays, provider-blocked states | `v1-jobs-visual-contract.md` jobs screen-flow contract |
| V2 | Candidates | Current candidate hub/database/action pages plus route/state contracts | hub panels, database filters, advanced/bulk states, action launchers, documents/contracts/surveys/degraded sections, parent return | `v2-candidates-visual-contract.md` candidate screen-flow contract |
| V3 | Public/external + integrations token | Current public token pages and integration callbacks | token invalid/expired/used/inaccessible, public application upload failures, survey/review validation, chat send failure, requisition terminal states | `v3-public-external-token-visual-contract.md` public/token screen-flow contract |
| V4 | Settings/integrations/reports/billing/team/favorites/marketplace | Current pages and state contracts by module | ready, empty, denied, unavailable, stale, degraded, validation, save failure, retry, success, provider/payment blocked states | `v4-operations-visual-contract.md` operations visual package |
| V5 | SysAdmin/platform | Current platform pages and state contracts | platform list/detail/edit, queue pending/resolved/rejected, company subscription mutation, taxonomy list/detail, not-found/stale/denied/error | `v5-sysadmin-platform-visual-contract.md` SysAdmin visual package |

### Visual-pass rules

- Do not infer backend schemas from screenshots; screen contracts may show placeholder labels only when the corresponding route/state contract allows unknown fields.
- Do not merge public/token flows into authenticated shell frames.
- Do not merge provider setup screens with operational provider-blocked task states.
- Do not create standalone legacy alias frames for `/recruiters`, `/candidates-old`, `/candidates-new`, `/parameters*`, or other alias/reference rows; document their canonical target only.
- Treat auth/dashboard legacy screenshots as visual evidence, not as final product-depth proof.
- A route may be marked `Figma-ready` only after its visual contract names the evidence source, required states, accepted deviations, viewport assumptions, and unresolved backend/API unknowns.


## Visual contract package inventory

| Package | Covered phase | Status | Next evidence action |
|---|---|---|---|
| `v0-auth-shell-dashboard-visual-contract.md` | V0 auth, shell, dashboard, notifications, inbox | Prepared | Capture legacy/current app visual evidence and accepted deviations for R0 anchor flows. |
| `v1-jobs-visual-contract.md` | V1 jobs list, authoring, detail, task overlays, requisitions | Evidence captured | `visual-evidence-v1-jobs.md` covers V1 screen-flow bases and records deferred provider/form/schema details. |
| `v2-candidates-visual-contract.md` | V2 candidate hub, database, actions, panel boundaries | Product-composition evidence captured | `visual-evidence-v2-candidates.md` captures current/legacy evidence and records covered candidate rows as behaviour-evidenced but parity-blocked while keeping provider/schema/terminal variants deferred. |
| `v3-public-external-token-visual-contract.md` | V3 public/external and integration token flows | Prepared | Capture public token lifecycle and route-specific public-layout evidence. |
| `v4-operations-visual-contract.md` | V4 settings, integrations admin, reports, billing, team, favorites, marketplace | Prepared | Capture operational authenticated-shell module evidence and blocked/degraded states. |
| `v5-sysadmin-platform-visual-contract.md` | V5 SysAdmin/platform users, queues, master data, subscriptions, taxonomy | Prepared | Capture platform admin evidence while preserving org/platform boundaries. |

No package marks any row `Figma-ready` by itself. A row becomes `Figma-ready` only after the relevant package is populated with canonical visual evidence and accepted deviations. Use `visual-evidence-capture-plan.md` for the evidence schema, capture order, and promotion rule.

## Route review inventory

### `auth`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Contract-reviewed | `/` | Public/Token | entry | H | R0 | Confirmed in router, route metadata, auth API adapter, and public page tests. Covers direct entry, returnTo, email/password, 2FA, provider launch, failed login, session bootstrap, and dashboard redirect. Visual reference exists for login only; final non-happy-state visual signoff is still pending. |
| Contract-reviewed | `/confirm-registration/:token` | Public/Token | token-flows | H | R0 | Confirmed in router/metadata and `confirmRegistrationToken`; handles missing/invalid token, token_valid with session bootstrap, approval-pending redirect, failed API, and dashboard/login landing. Visual state references pending. |
| Figma-ready | `/forgot-password` | Public/Token | token-flows | H | R0 | Confirmed in router/metadata, API adapter, public page tests, legacy ready visual, and current submitted/sent capture. Covers ready, submit/sent, retry, and return-to-login visuals; not-found/default failed copy remains backend-owned and should reuse the same message slot. |
| Contract-reviewed | `/reset-password/:token` | Public/Token | token-flows | H | R0 | Confirmed in router/metadata and API adapter. Handles token validation, missing/invalid/expired token, password mismatch, submit success, failed submit, and login redirect. Visual state references pending. |
| Contract-reviewed | `/register/:token` | Public/Token | token-flows | H | R0 | Confirmed in router/metadata and API adapter. Covers invitation token registration plus public HC/RA registration, password mismatch, submit success/failure, and login redirect. Visual state references pending. |
| Contract-reviewed | `/auth/cezanne/:tenantGuid` | Public/Token | sso-callbacks | H | R0 | Confirmed in router/metadata and public page code. Launches current auth service `/login/cezanne/:tenantGuid`; missing tenant returns failed state. Visual launch/failure references pending. |
| Contract-reviewed | `/auth/cezanne/callback?code` | Public/Token | sso-callbacks | H | R0 | Confirmed in router/metadata and callback API adapter. Handles provider error, missing code, code exchange, bootstrap success/failure, safe telemetry, and dashboard/login landing. Visual callback states pending. |
| Contract-reviewed | `/auth/saml?code&error` | Public/Token | sso-callbacks | H | R0 | Confirmed in router/metadata and public page code. Covers SAML email launch, callback code exchange, provider error, missing code, bootstrap success/failure, and login/dashboard landing. Visual launch/callback states pending. |
| Contract-reviewed | `/users/invite-token` | Public/Token | token-flows | M | R0 | Confirmed in router/metadata as invite-token public/token route. Current code validates token presence shape only through shared token-state model; exact backend continuation screen still needs visual/reference confirmation before Figma. |


#### Auth review evidence and remaining blockers

Confirmed evidence:
- Router and route metadata register all auth public/token and SSO callback rows as full direct-entry public routes with `canUseAuthTokenFlow` or `canCompleteSsoCallback`.
- Current API usage is centralized through `src/lib/api-client/platform-api.ts` and `src/domains/auth/api/auth-api-adapter.ts`; it uses the current auth service, REST API, and GraphQL bootstrap contracts without treating them as legacy-only APIs.
- Tests cover login success/failure, provider launch, forgot-password submission, sign-up surface, confirmation missing-token behavior, local session safety, auth capabilities, and auth API adapter branches.
- Telemetry code emits auth-safe route/state outcomes and does not persist raw credentials, passwords, auth codes, or raw tokens in local session snapshots.

Remaining blockers before `Figma-ready`:
- Visual states are confirmed only for the primary login screen; token, callback, 2FA, failed, pending approval, mandatory SSO, activation/setup-required, expired-token, and terminal retry screens still need canonical reference confirmation.
- `/users/invite-token` still needs exact legacy-reference confirmation for the continuation screen before canonical visual design.
- Provider popup/callback UX needs final decision on whether Figma represents popup launch, callback waiting, and callback failure as separate frames or annotated states.

### `shell`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Figma-ready | `/notifications` | Page | notifications | H | R0 | Confirmed in router/metadata, notification-state tests, and current visual evidence for fixture-backed resolver categories. V0 explicitly accepts fixture-backed destination categories as temporary Figma input; live API replacement must preserve available/unknown/unsupported/denied/stale fallback semantics. |
| Contract-reviewed | `/user-profile` | ShellOverlay | account-context | M | R0 | Confirmed in router/metadata, shell account navigation, and account settings page. Uses `canOpenAccountArea`, shell-aware direct entry, close target to dashboard/current shell parent, fixture-backed editable profile states, save/retry/refresh intent, and unknown-field disclosure. Visual overlay reference is confirmed indirectly but final overlay states pending. |
| Contract-reviewed | `/hiring-company-profile` | Page | account-context | M | R0 | Confirmed in router/metadata, organization profile page, account settings state/page tests, and runtime capability evaluation. Uses `canViewHiringCompanyProfile` for route access plus `canManageCompanySettings` as mutation capability, HC org ownership, dashboard parent return, ready/dirty/saved/denied/degraded/stale/retry states, refresh intent, and explicit unknown persistence fields. Visual reference pending. |
| Contract-reviewed | `/recruitment-agency-profile` | Page | account-context | M | R0 | Confirmed in router/metadata, organization profile page, account settings state tests, and runtime capability evaluation. Uses `canViewRecruitmentAgencyProfile` for route access plus `canManageAgencySettings` as mutation capability, RA org ownership, dashboard parent return, ready/dirty/saved/denied/degraded/stale/retry states, refresh intent, and explicit unknown persistence fields. Visual reference pending. |
| Figma-ready | `/logout` | Page | session | M | R0 | Confirmed in router/metadata and updated logout implementation. Runtime now renders a stable public/session logged-out page, clears local auth session, resets access context to public, tracks safe logout telemetry, preserves public-entry fallback semantics, and links to `/`. Explicit session-loss transition remains separate deferred debt. |


#### Shell review evidence and remaining blockers

Confirmed evidence:
- Authenticated shell navigation is capability-filtered through `src/shell/navigation/nav-registry.ts` and rendered by `src/shell/layout/authenticated-shell.tsx` with org/platform modes and account links.
- `/notifications` has a typed-destination resolver model with safe fallbacks and telemetry; unsupported, stale, denied, and unknown destinations do not become direct implementation evidence for target domains.
- `/user-profile` reuses the account settings state model as a shell-aware overlay with parent close behavior.
- Organization profile pages reuse the same account settings state model and expose unknown persistence fields instead of inventing APIs.

Remaining blockers before `Figma-ready`:
- Organization profile route capability names now follow runtime metadata: view capabilities gate route access, while manage capabilities are mutation capabilities.
- `/logout` now follows runtime metadata as a shell/session page rather than an account-context overlay.
- Shell visual parity is not complete: sidebar/topbar/account-menu/footer and notification bell interactions need canonical frame/state references.

### `dashboard`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Figma-ready | `/dashboard` | Page | landing | H | R0-R5 | Confirmed in router/metadata, dashboard API adapter/state/page tests, local API seed, current API-backed dashboard capture, and authenticated legacy dashboard capture. Covers desktop shell/dashboard base, cards, calendar, activity, source health/degraded handling, and safe actions. Visual/data parity refinements remain tracked debt, not a V0 blocker. |


#### Dashboard review evidence and remaining blockers

Confirmed evidence:
- Dashboard is API-backed for the first real flow and no longer treats fixture counts as ready data during loading.
- Dashboard state covers normal entry, platform landing, notification fallback, denied target, stale/missing/unsupported destination, degraded source health, safe actions, refresh intent, activity, calendar, and email-confirmation warning.
- Tests cover API normalization, loading skeleton behavior, state model, degraded behavior, and authenticated rendering.

Remaining blockers before `Figma-ready`:
- Exact visual parity is intentionally deferred: legacy calendar component behavior, card wrapping/breakpoints, activity spacing/scroll, shell footer/topbar, and pending-schedule toggle remain roadmap debt.
- Real inbox summary count is not yet a confirmed API input for dashboard; do not invent it in Figma labels beyond current contract.

### `inbox`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Figma-ready | `/inbox?conversation=` | PageWithStatefulUrl | conversation-list | H | R0 | Confirmed in router/metadata, search validation, inbox page tests, messaging support tests, and current visual evidence for fixture-backed empty plus selected conversation states. V0 explicitly accepts fixture-backed list/detail visuals as temporary Figma input; send/provider-blocked/live transport remains deferred. |


#### Inbox review evidence and remaining blockers

Confirmed evidence:
- URL state is validated and sanitized before entering the conversation state model.
- Messaging support separates destination resolution, operational state, candidate handoff, fallback kind, refresh requirement, retry permission, and telemetry-safe payloads.
- Fixture-backed conversation states are explicit adapter seams, not claimed backend APIs.

Remaining blockers before `Figma-ready`:
- Live conversation list/detail/send transport contracts are still unknown from the greenfield module and must not be invented for screen design.
- Canonical visuals are still missing for the conversation list, selected conversation, composer, send failure, stale conversation, provider-blocked, and candidate-return states.

### `jobs`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Figma-ready | `/jobs/:type?page&search&asAdmin&label` | PageWithStatefulUrl | list | H | R1 | Confirmed in router/metadata, search/scope validation, list page tests, jobs adapters, and V1 visual evidence. Covers ready, filtered-empty/clear-filters, loading, degraded, stale, unavailable, denied, URL-owned state, create entry, and ATS status. Fixture-backed list data remains accepted as screen-flow evidence only; final production table schema remains deferred. |
| Figma-ready | `/jobs/manage/:id?resetWorkflow` | Page | authoring | H | R1 | Confirmed in router/metadata, authoring page, adapters, product-depth, publishing tests, and V1 visual evidence. Covers create/edit/copy, resetWorkflow, validating/dirty/saving/saved/save-failed, draft serialization, and route-state layout. Provider-specific publish-blocked/partial-publish labels and full form schema remain deferred. `canResetJobWorkflow` remains an action capability, not a route metadata requirement. |
| Figma-ready | `/job/:id?section` | PageWithStatefulUrl | detail | H | R1 | Confirmed in router/metadata, search validation, detail page, adapters, product-depth tests, current V1 captures, and authenticated legacy job detail reference. Covers overview/candidates/workflow/activity sections, degraded section, unavailable, status transition, assignment/share state, summaries, task links, and parent route for overlays. Fixture aggregate remains screen-flow evidence only; final backend schema remains deferred. |
| Figma-ready | `/job/:id/bid` | RoutedOverlay | task-overlays | M | R1 | Confirmed in router/metadata, shared `JobTaskPage` context, and V1 visual evidence. Covers bid-create route shell, scoped parent return, close/complete actions, and task state model. Bid payload/form internals remain deferred. |
| Figma-ready | `/job/:id/bid/:bid_id` | RoutedOverlay | task-overlays | M | R1 | Confirmed in router/metadata, shared `JobTaskPage` context, and V1 visual evidence. Covers bidId propagation, scoped parent return, direct-entry fallback, outcome states, and parent refresh intent. Bid detail payload remains deferred. |
| Figma-ready | `/job/:id/cv` | RoutedOverlay | task-overlays | H | R1 | Confirmed in router/metadata, shared `JobTaskPage` context, and V1 visual evidence. Covers CV create route shell, scoped parent return, outcome states, and parent refresh intent. Actual CV payload/form API remains outside this seam. |
| Figma-ready | `/job/:id/cv/:cv_id` | RoutedOverlay | task-overlays | H | R1 | Confirmed in router/metadata, shared `JobTaskPage` context, and V1 visual evidence. Covers candidate/CV id propagation, parent return, direct-entry fallback, outcome states, and parent refresh intent. Actual CV document/body payload is intentionally not modeled. |
| Figma-ready | `/job/:id/cv-reject/:cv_id` | TaskFlow | task-overlays | H | R1 | Confirmed in router/metadata, shared job task context, and V1 visual evidence. Uses `canRejectCvFromJob`, preserves job/candidate context, supports ready/failure/cancel/parent-refresh state shells, and returns to job parent. Rejection reason catalog/API and exact form fields remain deferred. |
| Figma-ready | `/job/:id/cv/:cv_id/schedule` | TaskFlow | task-overlays | H | R1 | Confirmed in router/metadata, task context tests, scheduling support, provider readiness gate integration, and V1 visual evidence. Uses `canScheduleInterviewFromJob`, preserves parent return/section, and captures ready/failure route shells. Provider-blocked/degraded/unavailable labels, slot selection, conflicts, and remediation copy remain deferred. |
| Figma-ready | `/job/:id/cv/:cv_id/offer` | TaskFlow | task-overlays | H | R1 | Confirmed in router/metadata, task context tests, contract-signing support, and V1 visual evidence. Uses `canCreateOfferFromJob`, preserves parent return/section, attaches job-scoped contract signing action target, document placeholder, ready/success/parent-refresh state shells. Real offer/contract payload remains deferred. |
| Figma-ready | `/build-requisition` | TaskFlow | workflow-state | M | R5 | Confirmed in router/metadata, requisition page, requisition state tests, and V1 visual evidence. Uses `canUseJobRequisitionBranching`, dashboard fallback, explicit-save/no-autosave draft state, and jobs-side route ownership. Data-loss warning and HRIS readiness labels remain deferred. |
| Figma-ready | `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` | PageWithStatefulUrl | workflow-state | M | R5 | Confirmed in router/metadata, requisition page, requisition state/routing tests, and V1 visual evidence. Uses `canUseJobRequisitionBranching`, workflow/stage params, stale-workflow/workflow-drift authority, explicit parent target to jobs, HRIS operational state separation, and dashboard fallback. Exact workflow payload fields remain deferred. |


#### Jobs review evidence and remaining blockers

Confirmed evidence:
- Router and route metadata register all jobs list, authoring, detail, task-overlay, schedule, offer, and requisition workflow routes with route family ownership and capability gates.
- List/detail/authoring state models cover URL-state sanitization, filters, clear-filters, empty/degraded/stale/unavailable/denied states, draft serialization, publishing readiness, and ATS source status without inventing backend APIs.
- Task overlays share a canonical parent-return model through `JobTaskPage` and `resolveJobTaskContext`; direct entry falls back to the job hub, and successful or explicit parent-refresh outcomes preserve refresh intent.
- Schedule tasks consume provider readiness gates and calendar scheduling state; offer tasks consume contract-signing state while preserving the job parent context.
- Requisition routes separate jobs-side authoring/workflow-state from settings-side workflow configuration and HRIS operational readiness.

Remaining blockers before `Figma-ready`:
- Job list/detail/authoring data is still fixture-backed adapter evidence; visual labels may show states and structure, but must not invent exact backend field contracts or production data tables.
- Task overlays need canonical visual references per task kind: bid create/view, CV create/view, reject, schedule, and offer.
- Schedule and offer flows need visual states for provider-blocked/degraded/unavailable, submit, failed, retry, success, and parent-refresh outcomes.
- Requisition visual design needs explicit separation between jobs-side build/workflow routes and settings-side workflow configuration; do not merge those flows in Figma.
- Legacy route alias `/job/$id/cv/{cv_id}` must remain an alias/reference row mapped to the canonical `/job/:id/cv/:cv_id` family.

### `candidates`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Contract-reviewed | `/candidate/:id/:job?/:status?/:order?/:filters?/:interview?` | PageWithStatefulUrl | detail-hub | H | R2 | Confirmed in router/metadata dynamic route arrays, route parsing/search validation, detail page, candidate store, panels, ATS adapters, and routing/product-depth tests. Covers direct/job/notification/database entry, optional job/status/order/filters/interview context, degraded sections, sequence prev/next, database return, ATS source state, documents/contracts, surveys/custom fields, collaboration, action links, upload CV, and safe telemetry. Still fixture-backed for candidate payloads; current V2 product-composition evidence covers ready/context/degraded/upload states, while denied/not-found/unavailable/mobile variants remain deferred. |
| Contract-reviewed | `/candidate/:id/.../cv/:cv_id/schedule` | TaskFlow | action-launchers | H | R2 | Confirmed in router/metadata action route arrays, task search validation, candidate task page, action context tests, and calendar scheduling support. Runtime route uses specific `canScheduleInterviewFromCandidate` boundary while metadata family records `canOpenCandidateAction`; preserves contextual or database-origin parent, recovery target, readiness gate, slots, submit/success/failure/cancel, and parent refresh intent. Current V2 product-composition evidence covers ready, job-context, failure/retry, cancel, and parent return; provider-blocked/degraded/unavailable variants remain deferred. |
| Contract-reviewed | `/candidate/:id/.../cv/:cv_id/offer` | TaskFlow | action-launchers | H | R2 | Confirmed in router/metadata action route arrays, task search validation, candidate task page, action context tests, and contract-signing support. Runtime route uses specific `canCreateOfferFromCandidate` boundary while metadata family records `canOpenCandidateAction`; preserves parent/recovery/database return, attaches candidate-scoped contract signing target, send/status-refresh telemetry, and parent refresh intent. Current V2 product-composition evidence covers ready, database-origin parent, contract readiness, and success/refresh; real offer payload fields and terminal/read-only variants remain deferred. |
| Contract-reviewed | `/candidate/:id/.../cv-reject/:cv_id` | TaskFlow | action-launchers | H | R2 | Confirmed in router/metadata action route arrays, task search validation, candidate task page, action context, and survey/review scoring support. Runtime route uses `canRejectCandidate` while metadata family records `canOpenCandidateAction`; preserves parent/recovery/database return, submit/failure/cancel/success, review/scoring terminal outcome, candidate store update, and parent refresh intent. Current V2 product-composition evidence covers the reject task shell and readiness boundary; reject reason catalog and terminal/read-only variants remain deferred. |
| Contract-reviewed | `/candidates-old?query&page` | PageWithStatefulUrl | database-search | M | R4 | Confirmed in router/metadata and V2 evidence as a compatibility entry that maps to canonical `/candidates-database` with sanitized state. This row is documentation-only as an alias; do not create a standalone screen. |
| Contract-reviewed | `/candidates-database?query&page` | PageWithStatefulUrl | database-search | M | R4 | Confirmed in router/metadata, database route parser, database page, candidate database routing tests, ATS adapters, and product-depth tests. Covers sanitized query/page/sort/order/stage/tags/advanced query, empty/ready/stale/degraded/retryable, advanced invalid/unsupported, bulk none/eligible/partial/blocked/failed/retryable, ATS duplicate/import state, and database-to-detail return target. Fixture-backed results only; current V2 product-composition evidence covers canonical database, filtered-empty recovery, advanced invalid/unsupported, bulk partial/blocked/failed, and ATS duplicate/import states. |
| Contract-reviewed | `/candidates-new?query&page` | PageWithStatefulUrl | database-search | M | R4 | Confirmed in router/metadata and V2 evidence as a compatibility entry that maps to canonical `/candidates-database` with sanitized state. This row is documentation-only as an alias; do not create a standalone screen. |


#### Candidates review evidence and remaining blockers

Confirmed evidence:
- Candidate detail and action routes are generated from canonical route arrays, preserving dense optional context segments instead of ad-hoc route aliases.
- Candidate detail supports direct, job, notification, and database-origin entry modes, including sanitized database return targets and sequence behavior.
- Candidate action launchers preserve contextual parent/recovery targets and use shared support for scheduling, contract signing, survey/review scoring, candidate store updates, and parent refresh intent.
- Candidate database canonicalizes legacy `/candidates-old` and `/candidates-new` entries to `/candidates-database` while preserving sanitized URL state.
- Database/search, advanced search, bulk actions, ATS source state, duplicate/import/sync states, and detail handoff are modeled without inventing backend APIs.

Remaining blockers before expanding `Figma-ready` coverage:
- Candidate data and database rows are fixture-backed adapter seams; Figma must not infer production backend fields beyond the documented state contract.
- Covered current greenfield product-composition captures promote database/detail/action rows only for the evidenced states. Legacy database/detail screenshots are reference-only.
- Additional provider-blocked/degraded/unavailable, denied, not-found, stale, terminal/read-only, and mobile candidate variants require separate captures before promotion.
- Route metadata uses `canOpenCandidateAction` as the task route-family gate while runtime route wrappers use specific action capabilities; keep this documented as family gate plus action-specific boundary, not a conflict.
- Alias/reference row `/candidate/$id/.../cv/$cv_id/offer` must remain mapped to the canonical action route arrays and not become a separate route.

### `public-external`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Contract-reviewed | `/chat/:token/:user_id` | Public/Token | external-chat | M | R3 | Confirmed in router/metadata, external chat page, and external chat support tests. Covers direct token entry, valid/invalid/expired/used/inaccessible token states, participant/partner context, grouped messages, draft persistence, send success/failure, refresh after send, and safe telemetry without raw token payloads. Visual reference pending. |
| Contract-reviewed | `/interview-request/:scheduleUuid/:cvToken` | Public/Token | external-review | M | R3 | Confirmed in router/metadata and interview request page/workflow support. Covers accept/decline decision entry, token-state panel, completed/terminal request, missing participant bootstrap failure, submission failure/retry, terminal success, and safe telemetry. Visual reference pending. |
| Contract-reviewed | `/review-candidate/:code` | Public/Token | external-review | M | R3 | Confirmed in router/metadata, review candidate page, survey/review scoring support, and public-external workflow tests. Covers token-state, ready review form, schema/version label, saved draft, validation failure, submission failure/retry, completed terminal state, inaccessible/expired states, and safe telemetry. Visual reference pending. |
| Contract-reviewed | `/interview-feedback/:code` | Public/Token | external-review | M | R3 | Confirmed in router/metadata, interview feedback page, survey/review scoring support, and public-external workflow tests. Covers token-state, ready feedback form, scoring-pending terminal outcome, saved draft, validation failure, submission failure/retry, inaccessible/expired states, and safe telemetry. Visual reference pending. |
| Contract-reviewed | `/shared/:jobOrRole/:token/:source` | Public/Token | shared-job-view | M | R3 | Confirmed in router/metadata, shared job page, shared route builders, and public token access support. Covers valid shared job entry, invalid source, invalid/expired/used/inaccessible token states, unavailable shared job, start-application parent handoff, and safe telemetry. Visual reference pending. |
| Contract-reviewed | `/:jobOrRole/application/:token/:source` | Public/Token | public-application | H | R3 | Confirmed in router/metadata, public application page, upload workflow adapter, and public-external workflow tests. Covers shared-job handoff, direct token entry, token/source states, required applicant validation, upload handshake failure, binary transfer failure, metadata persistence failure, submission failure/retry, uploaded-file state, completion, and return to shared job. Visual reference pending. |
| Contract-reviewed | `/surveys/:surveyuuid/:jobuuid/:cvuuid` | Public/Token | public-survey | M | R3 | Confirmed in router/metadata, public survey page, public survey workflow, and survey/review scoring separation tests. Covers token-state, ready survey answer, missing-answer validation, submission failure/retry, completed terminal state, operational states such as inaccessible/expired/degraded, and safe telemetry. Visual reference pending. |
| Contract-reviewed | `/job-requisition-approval?token` | Public/Token | requisition-approval | M | R3 | Confirmed in router/metadata, requisition approval page, approval access/workflow tests, and tokenized routing support. Covers token query validation, awaiting-decision, approve/reject, required rejection comment, submission failure/retry, workflow drift, used-on-submit, already approved/rejected terminal states, unavailable workflow, and safe telemetry. Visual reference pending. |
| Contract-reviewed | `/job-requisition-forms/:id?download` | Public/Token | requisition-forms-download | L | R5 | Confirmed in router/metadata, forms download page, search validation, route builder, and forms download tests. Covers token query validation, view/download modes, ready download, invalid/expired/used tokens, already downloaded, not-found, unavailable, retryable download failure, completed download, and safe telemetry. Visual reference pending. |


#### Public/external review evidence and remaining blockers

Confirmed evidence:
- Public/token routes are registered separately from the authenticated shell and use public route metadata capabilities such as `canOpenSharedJob`, `canSubmitPublicApplication`, `canCompletePublicSurvey`, `canUseExternalTokenizedChat`, `canUseExternalReviewFlow`, `canApproveRequisitionByToken`, and `canDownloadRequisitionFormsByToken`.
- Token/source/readiness decisions are centralized in public-external access helpers and rendered through `PublicTokenStatePanel` or route-specific terminal panels instead of falling through to authenticated-shell screens.
- Public application and requisition forms explicitly model upload/download seams, retryable transfer failures, metadata persistence/download completion, and correlation headers without inventing backend response fields.
- External review and survey flows reuse the candidate survey/review scoring state contract while keeping public-token route ownership separate from authenticated candidate action launchers.
- Requisition approval separates workflow drift, used-token terminal states, validation, and submission errors from provider setup or authenticated requisition workflow configuration.

Remaining blockers before `Figma-ready`:
- These flows are contract-reviewed but visually unconfirmed; each needs canonical public-layout frames for ready, token invalid/expired/used/inaccessible, unavailable, validation failure, retryable transfer/submission failure, terminal success, and terminal read-only states.
- Public application upload and requisition forms download are still adapter seams; do not design backend-specific progress, virus scanning, or file metadata fields beyond the documented contract until APIs are confirmed.
- External chat needs visual decisions for grouped-message alignment, participant identity treatment, composer failure, and post-send refresh.
- Requisition approval needs visual decisions for workflow drift, already approved/rejected, rejection-comment-required, and used-on-submit conflict states.

### `settings`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Contract-reviewed | `/settings/agency-settings` | Page | agency-settings | L | R4 | Confirmed in router/metadata, agency settings page, account settings route contract, and account settings state tests. Canonical runtime route is `/settings/agency-settings`; legacy/docs `/recruiters` is not a registered route and must not become a standalone Figma screen. Covers RA org ownership, `canManageAgencySettings`, dashboard parent return, ready/dirty/saved/denied/degraded/stale/retry states, refresh intent, and explicit unknown persistence fields. Visual reference pending. |
| Contract-reviewed | `/templates` | Page | templates | M | R4 | Confirmed in router/metadata, templates page, routing support, and workflow tests. Covers index entry, capability gate, ready/readiness state, save validation, submission failure/retry, success mutation state, and safe request headers. Visual reference pending. |
| Contract-reviewed | `/templates/:id` | Page | templates | M | R4 | Confirmed as `/templates/$templateId` route with parent target `/templates`. Covers detail route state, template id display, same template config save/validation/retry model, and direct-entry fallback through access boundary. Visual reference pending. |
| Contract-reviewed | `/templates/smart-questions` | Page | templates | M | R4 | Confirmed in templates route resolver. Covers subsection entry, admin/sysadmin feature availability, fallback to index when unavailable, save/validation/retry, and parent target `/templates`. Visual reference pending. |
| Contract-reviewed | `/templates/diversity-questions` | Page | templates | M | R4 | Confirmed in templates route resolver. Covers surveys/custom-surveys entitlement gate, fallback to index when unavailable, save/validation/retry, and parent target `/templates`. Visual reference pending. |
| Contract-reviewed | `/templates/interview-scoring` | Page | templates | M | R4 | Confirmed in templates route resolver. Covers interview-feedback capability gate, fallback to index when unavailable, save/validation/retry, and parent target `/templates`. Visual reference pending. |
| Contract-reviewed | `/parameters/:settings_id?/:section?/:subsection?` | PageWithStatefulUrl | settings-container | M | R4-R5 | Confirmed through `/parameters`, `/parameters/$settingsId`, `/parameters/$settingsId/$section`, and `/parameters/$settingsId/$section/$subsection` routes plus operational settings resolver tests. Covers canonical subsection mapping, unknown/unimplemented/unauthorized fallback, direct dedicated-route redirect, available-subsection filtering, and dashboard fallback when no settings subsection is available. Visual reference pending. |
| Contract-reviewed | `/settings/careers-page` | Page | careers-application | M | R3 | Confirmed in router/metadata, careers page settings page, careers-application access/workflow tests, and public reflection closeout support. Covers brand/headline editing, save workflow, public careers-page contract preview, pending public reflection intent, request headers, and access decision. Visual reference pending. |
| Contract-reviewed | `/settings/application-page/:settings_id?/:section?/:subsection?` | PageWithStatefulUrl | careers-application | M | R3 | Confirmed via `/settings/application-page`, `/$settingsId`, and `/$settingsId/$section/$subsection` runtime routes plus route validation tests. Covers settings/section/subsection defaults, invalid section fallback, application config editing, save workflow, public application-page contract preview, and pending reflection intent. Visual reference pending. |
| Contract-reviewed | `/settings/job-listings?tab&brand` | PageWithStatefulUrl | careers-application | M | R3 | Confirmed in router/metadata, job listings page, search validation, route builders, and workflow tests. Covers tab/brand URL state, empty/list states, create/edit links, publishing status projection, public reflection state, and parent target `/parameters`. Visual reference pending. |
| Contract-reviewed | `/settings/job-listings/edit/:uuid?new&brand` | Page | careers-application | M | R3 | Confirmed through create and edit routes (`/settings/job-listings/edit`, `/settings/job-listings/edit/$uuid`) and editor workflow tests. Covers create/edit mode, brand/returnTab query state, draft save, publish/unpublish readiness gates, provider-blocked publishing, retryable publish failure, public job-listing contract, and return target to job listings. Visual reference pending. |
| Contract-reviewed | `/settings/hiring-flow` | Page | hiring-flow | M | R4 | Confirmed in router/metadata, hiring-flow page, operational settings routing, and save workflow tests. Covers direct entry, readiness, workflow/stage config, requisition adjacency note, validation, submission failure/retry, success, and safe mutation headers. Visual reference pending. |
| Contract-reviewed | `/settings/custom-fields` | Page | custom-fields | M | R4 | Confirmed in router/metadata, custom-fields page, operational routing, and workflow tests. Covers field label/scope editing, downstream candidate/public-application note, validation, submission failure/retry, success, and safe mutation headers. Visual reference pending. |
| Contract-reviewed | `/settings/api-endpoints` | Page | api-endpoints | L | R5 | Confirmed in router/metadata, API endpoints page, and state tests. Covers loading/ready/empty/validation-error/saving/saved/save-error/denied/unavailable, URL/HTTPS/header validation, retry, dashboard parent target, and safe state ownership. Visual reference pending. |
| Contract-reviewed | `/settings/forms-docs` | Page | forms-docs-controls | L | R4-R5 | Confirmed in router/metadata, forms/docs page, state/workflow tests, and downstream impact support. Covers ready/empty/unavailable/stale/degraded/denied/loading, validation, submission failure/retry, success with refresh-required, unknown contract fields, downstream impact signals, and `/parameters` parent return. Visual reference pending. |
| Contract-reviewed | `/requisition-workflows` | Page | hiring-flow | M | R5 | Confirmed in router/metadata and requisition workflow state tests. Covers settings-owned configuration distinct from jobs execution, parent `/settings/hiring-flow`, loading/empty/saving/saved/error/denied/stale-workflow states, HRIS readiness gate, mapping/sync status, and no active execution ownership. Visual reference pending. |
| Contract-reviewed | `/reject-reasons` | Page | reject-reasons | M | R4 | Confirmed in router/metadata, reject reasons page, operational routing, and workflow tests. Covers rejection reason list editing, job/candidate reject downstream note, validation, submission failure/retry, success, and safe mutation headers. Visual reference pending. |


#### Settings review evidence and remaining blockers

Confirmed evidence:
- Operational settings routes use dedicated pages plus `/parameters` compatibility routing; unknown, unimplemented, and unauthorized subsections resolve to safe fallbacks instead of becoming new screens.
- Templates, hiring flow, custom fields, reject reasons, API endpoints, forms/docs, and careers-application settings have explicit state/workflow helpers and tests for validation, retryable failure, save success, readiness, and safe request headers.
- Careers-application settings keep public reflection as an explicit pending/confirmed intent and do not claim immediate public-site API synchronization.
- Job listing publish/unpublish flows consume provider readiness gates and remain separate from provider setup; blocked publishing is represented as route-local operational state.
- Requisition workflow settings are documented as configuration ownership only; active requisition execution remains in jobs workflow state.

Remaining blockers before `Figma-ready`:
- Legacy `/recruiters` has been resolved as documentation residue: agency settings is `/settings/agency-settings`, and recruiter visibility is `/team/recruiters`. Do not create a standalone `/recruiters` screen.
- Settings visuals are not canonical for subsection tabs, nested compatibility URLs, validation banners, retry controls, stale/degraded warnings, unknown contract field disclosure, and public reflection status.
- Forms/docs and API endpoints still expose unknown backend contract fields; do not invent exact backend payloads or credential storage UX before API contracts are confirmed.
- Careers application and job listings need visual confirmation for public preview/contract panels and provider-blocked publish states.

### `integrations`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Contract-reviewed | `/integrations` | Page | provider-index | M | R4 | Confirmed in router/metadata, integrations admin index page, provider admin state, and routing tests. Covers authenticated provider setup index, capability gate `canViewIntegrations`, provider family/state list, supported and unsupported provider families, and dashboard fallback. Visual reference pending. |
| Contract-reviewed | `/integrations/:id` | Page | provider-detail | M | R4 + post-R5 | Confirmed as `/integrations/$providerId` route with `canManageIntegrationProvider`, parent `/integrations`, admin detail page, provider setup state, readiness signals, and setup workflow tests. Covers configuration/auth/diagnostics sections, connected/disconnected/degraded/reauth/unavailable states, validation error, save error, auth pending/failure, diagnostics passed/failed/logs-ready/unavailable, safe telemetry, and unsupported provider-family messaging. Visual reference pending. |
| Contract-reviewed | `/integration/cv/:token/:action?` | Public/Token | token-entry | L | R3 | Confirmed through `/integration/cv/$token` and `/$action` public routes, token-entry metadata, CV token page, adapters, routing tests, and workflow tests. Covers interview-slot response, unavailable reason validation, offer accept/reject action, invalid/expired/used/inaccessible token states, completed terminal state, conflict/submission failure/retry, safe correlation headers, and separation from authenticated provider setup. Visual reference pending. |
| Contract-reviewed | `/integration/forms/:token` | Public/Token | token-entry | L | R3 | Confirmed in router/metadata, forms token page, adapters, routing tests, and workflow tests. Covers multi-step requested forms/documents callback, current step/progress, answer validation, file-required validation, upload handshake failure, binary transfer failure, persistence/submission failure, advanced-to-next-step, completed terminal state, token states, and safe upload/request headers. Visual reference pending. |
| Contract-reviewed | `/integration/job/:token/:action?` | Public/Token | token-entry | L | R3 | Confirmed through `/integration/job/$token` and `/$action` public routes, token-entry metadata, job token page, adapters, and routing tests. Covers tokenized job presentation, action echo, invalid/expired/used/inaccessible token states, unavailable/inaccessible route-family handling, read-only job-presentation workflow, and separation from authenticated provider setup. Visual reference pending. |


#### Integrations review evidence and remaining blockers

Confirmed evidence:
- Authenticated provider setup routes (`/integrations`, `/integrations/:id`) are separate from public integration token-entry callbacks (`/integration/*`) in router parents, route metadata, capability gates, and tests.
- Provider setup depth models configuration, auth, diagnostics, provider-family readiness signals, and unsupported provider-family states without exposing raw credentials, provider payloads, or raw logs.
- Operational readiness signals from provider setup remain consumable by scheduling, publishing, ATS import, HRIS requisition, and assessment/scoring flows without merging those operational flows into provider setup screens.
- Integration token-entry routes reuse public-token lifecycle semantics and keep CV, forms/documents, and job presentation callbacks route-local with safe telemetry and correlation headers.
- Forms/document token flow explicitly models upload handshake, binary transfer, persistence failure, and completion as adapter seams, not confirmed backend API shapes.

Remaining blockers before `Figma-ready`:
- Provider setup visuals need canonical frames for index, detail, configuration validation/save, auth pending/failure/reauthorize, diagnostics running/passed/failed/logs-ready, degraded/blocked/unavailable, and unsupported provider-family states.
- Token-entry visuals need public-layout frames for CV interview/offer, forms multi-step upload, job presentation read-only, token invalid/expired/used/inaccessible, retryable submission/upload failures, and terminal success.
- Provider-specific API fields, credential storage UX, provider log details, and external callback payload fields are not confirmed; do not invent them for Figma.
- Keep provider setup separated from operational flows: scheduling, publishing, ATS import, HRIS workflow, and assessment/scoring should link to setup remediation when blocked, not duplicate setup UX.

### `reports`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Contract-reviewed | `/hiring-company/report/:id?` | Page | report-index | M | R4 | Confirmed through `/hiring-company/report` and `/hiring-company/report/$reportId` compatibility routes, metadata, legacy compatibility page, and state tests. Redirects to `/report` or a known `/report/:family`, defaults unknown ids to jobs, uses `canViewReports`, and keeps legacy aggregate entry separate from canonical family screens. Visual reference pending. |
| Contract-reviewed | `/report/jobs` | Page | report-family-pages | M | R4 | Confirmed via `/report/$family` route, family validation, report page, and report-state tests. Covers jobs family filters, loading/ready/empty/denied/unavailable/degraded/partial/stale/retryable/unsupported results, export/schedule lifecycle, stale/partial command blocking, safe telemetry, parent `/report`, and unknown backend contract fields. Visual reference pending. |
| Contract-reviewed | `/report/hiring-process` | Page | report-family-pages | M | R4 | Confirmed as canonical report family with shared report result and command contract. Covers period/owner/team filters, result states, export/schedule availability, command failure/retry, safe telemetry, parent `/report`, and replaceable adapters without claiming backend schema. Visual reference pending. |
| Contract-reviewed | `/report/teams` | Page | report-family-pages | M | R4 | Confirmed as canonical report family with shared report result and command contract. Covers team/owner filters, all route-owned result states, export/schedule lifecycle, command blocking on stale/partial/degraded results, safe telemetry, and parent `/report`. Visual reference pending. |
| Contract-reviewed | `/report/candidates` | Page | report-family-pages | M | R4 | Confirmed as canonical report family with shared report result and command contract. Covers candidate-report filters, all result states, export/schedule lifecycle, retryable command failure, safe telemetry, unknown result schema fields, and parent `/report`. Visual reference pending. |
| Contract-reviewed | `/report/diversity` | Page | report-family-pages | L | R4 | Confirmed as report family with beta flag signal and unsupported scheduling. Covers all result states, export available, schedule unsupported, safe telemetry, unknown backend metric/dimension fields, and parent `/report`. Visual reference pending. |
| Contract-reviewed | `/report/source` | Page | report-family-pages | L | R4 | Confirmed as report family with beta flag signal and unsupported scheduling. Covers all result states, export available, schedule unsupported, safe telemetry, unknown backend metric/dimension fields, and parent `/report`. Visual reference pending. |


#### Reports review evidence and remaining blockers

Confirmed evidence:
- Runtime canonical report index is `/report`; `screens.md` tracked `/hiring-company/report/:id?` as legacy compatibility and code redirects it to canonical report families.
- The `/report/$family` route validates known families before rendering and falls back to `/report` for unknown family ids.
- Report state helpers explicitly model result states, export/schedule command lifecycles, stale/partial/degraded command blocking, safe telemetry, replaceable adapters, and unknown backend contract fields.
- Diversity and source reports support export but not scheduling; this is route-owned behavior, not a missing implementation.
- Telemetry summarizes filters without raw owner/team values or tenant-sensitive custom period details.

Remaining blockers before `Figma-ready`:
- Report visuals are not canonical for index, family pages, filter controls, loading/empty/denied/unavailable/degraded/partial/stale/retryable/unsupported result states, export/schedule command feedback, and legacy redirect notes.
- Backend report schemas, row dimensions, metric definitions, export format, and schedule recurrence payloads are intentionally unknown; do not invent tables, charts, or exact CSV/PDF controls beyond the route contract.
- Need decide whether legacy `/hiring-company/report/:id?` appears only as redirect annotation or needs a transient compatibility frame in design docs.

### `billing`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Contract-reviewed | `/billing` | Page | overview | M | R4 | Confirmed in router/metadata, billing overview page, route metadata tests, and billing state tests. Covers HC-admin commercial billing outside platform subscription admin, loading/ready/empty/denied/unavailable/stale/degraded/pending-change states, plan/SMS/card summaries, pending changes, direct/parent/notification entry mode, action availability/blocking, dashboard fallback, and refresh intent. Visual reference pending. |
| Contract-reviewed | `/billing/upgrade` | TaskFlow | upgrade | M | R4 | Confirmed in router/metadata, upgrade page, and billing state tests. Covers parent `/billing`, same-plan blocked, card-blocked with add-card target, confirmation, submitted, success, failure, retry, provider challenge, stale, degraded, denied, unavailable, selected-plan preservation, and refresh intent. Visual reference pending. |
| Contract-reviewed | `/billing/sms` | TaskFlow | sms | M | R4 | Confirmed in router/metadata, SMS page, and billing state tests. Covers inactive/trial/active/usage-warning/suspended/card-blocked/pending/success/partial-success/failed/retry/stale/degraded/denied/unavailable states, enable/disable/update-limit readiness, usage threshold, parent refresh requirement, add-card target, and `/billing` return. Visual reference pending. |
| Contract-reviewed | `/billing/card/:id` | ShellOverlay | cards | M | R4 | Confirmed as `/billing/card/$cardId` shell-aware overlay route with parent `/billing`, card page, and billing state tests. Covers existing/backup/primary/new card entry, missing/expired/unavailable/validation-failed/provider-challenge/pending/saved/failed/retry states, edit/remove/make-default readiness, direct/parent/notification entry mode, provider challenge refresh intent, unavailable card fallback, and platform subscription admin separation. Visual reference pending. |


#### Billing review evidence and remaining blockers

Confirmed evidence:
- Billing routes are authenticated shell routes and remain separate from SysAdmin platform subscription administration; all view models force `platformSubscriptionAdmin: false`.
- Overview state covers commercial hidden/unavailable states, pending changes, refresh intents, and route actions without claiming payment-provider backend contracts.
- Upgrade flow models plan-change readiness, card dependency, selected-plan preservation, payment challenge, stale/degraded states, retry, success, and return-to-parent behavior.
- SMS add-on flow models usage-warning, card-blocked activation, suspended/partial-success/pending/retry states, and parent refresh requirements.
- Card overlay models shell-aware card management with primary/backup/new roles, provider challenge, pending/saved/failed/retry states, and action-specific blocking reasons.

Remaining blockers before `Figma-ready`:
- Billing visuals are not canonical for overview cards, pending changes, plan picker, confirmation, challenge-required, success/failure/retry, SMS usage thresholds, and shell-overlay card editing.
- Payment-provider forms, card tokenization fields, challenge provider UI, invoice/payment history, tax/VAT fields, and exact subscription mutation payloads are not confirmed; do not invent them for screen flows.
- Need final visual decision for whether `/billing/card/:id` is represented as a modal overlay, right drawer, or full shell-aware route frame.

### `team`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Contract-reviewed | `/team` | Page | org-team | M | R4 | Confirmed in router/metadata, team index page, team foundation state, route metadata tests, and team tests. Covers org-scoped member list, active/pending/disabled members, pending invites, ready/empty/denied/unavailable/degraded/stale/retryable/refresh-required states, membership role/status actions, safe telemetry, dashboard fallback, and explicit `platformScope: false`. Visual reference pending. |
| Contract-reviewed | `/team/recruiters` | Page | recruiter-visibility | M | R4 | Confirmed in router/metadata, recruiter visibility page, team foundation state, and tests. Covers parent `/team`, filters all/visible/limited/hidden, visible/limited/hidden counts, assignment ready/pending/blocked, ready/empty/denied/unavailable/degraded/stale/retryable/refresh-required states, safe telemetry, and separation from `/recruiters` docs residue. Visual reference pending. |
| Contract-reviewed | `/users/invite` | TaskFlow | invite-management | M | R4 | Confirmed in router/metadata, invite foundation page, team state, and tests. Covers org-scoped invite send/resend/revoke readiness, draft/pending/sent/revoked/blocked invite states, membership readiness adjacency, parent `/team`, dashboard fallback, and separation from public `/users/invite-token` acceptance and platform `/users*` CRUD. Visual reference pending. |


#### Team review evidence and remaining blockers

Confirmed evidence:
- Team routes are org-scoped authenticated shell routes and do not require platform user administration capabilities.
- `/team/recruiters` is the runtime canonical recruiter visibility route; legacy `/recruiters` must not be treated as a separate screen.
- Invite management is the org-admin send/resend/revoke task flow; public invite acceptance remains under auth token flow and platform user CRUD remains under SysAdmin.
- Team telemetry uses state/persona/count summaries and excludes raw invite/user identifiers.

Remaining blockers before `Figma-ready`:
- Team visuals are not canonical for member table/cards, pending invites, recruiter visibility filters, blocked assignment states, invite send/resend/revoke, degraded/stale/refresh-required banners, and membership role/status actions.
- Backend member API, role write policy, and recruiter visibility filter contracts are unknown; do not invent exact backend fields.

### `favorites`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Contract-reviewed | `/favorites` | Page | org-favorites | L | R4 | Confirmed in router/metadata, favorites index page, org favorites state, route metadata tests, and favorites tests. Covers org-scoped personal/org-shared/recruiter-linked favorites, ready/empty/unavailable list states, dashboard fallback, create request link, and explicit separation from platform favorite request queues. Visual reference pending. |
| Contract-reviewed | `/favorites/:id` | Page | org-favorites | L | R4 | Confirmed as `/favorites/$favoriteId` route with parent `/favorites`, favorite detail page, and favorites tests. Covers ready detail, unavailable/outside-org fallback, ownership display, parent return, and `platformRequestQueue: false`. Visual reference pending. |
| Contract-reviewed | `/favorites/request/:id?` | TaskFlow | org-favorite-requests | L | R4 | Confirmed through `/favorites/request` and `/favorites/request/$requestId` routes, request page, and favorites tests. Covers create/detail entry, draft/submitted/pending/approved/rejected/unavailable states, submit/cancel/resubmit readiness, parent `/favorites`, dashboard fallback, and separation from SysAdmin `/favorites-request*` queue. Visual reference pending. |


#### Favorites review evidence and remaining blockers

Confirmed evidence:
- Favorites are org-scoped and explicitly separate from platform favorite-request queues.
- Favorite request task flows model draft/submitted/pending/approved/rejected/unavailable states and action readiness without claiming SysAdmin queue behavior.
- Favorite detail has a route-local unavailable/outside-org fallback and returns to `/favorites`.

Remaining blockers before `Figma-ready`:
- Favorites visuals are not canonical for personal/org-shared/recruiter-linked ownership, empty/unavailable states, request workflow states, and action blocking reasons.
- Favorite backend ownership fields and request mutation payloads are unknown; do not invent exact queue/reviewer data.

### `marketplace`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Contract-reviewed | `/jobmarket/:type` | PageWithStatefulUrl | marketplace-list | M | R4 | Confirmed as `/jobmarket/$type` route with `canViewMarketplace`, marketplace page, state helpers, route metadata tests, and marketplace tests. Covers RA marketplace list types fill/bidding/cvs/assigned, ready/empty/unavailable states, dashboard fallback, unknown type unavailable state, and explicit separation from billing and platform scopes. Visual reference pending. |


#### Marketplace review evidence and remaining blockers

Confirmed evidence:
- Marketplace is RA-scoped list state, not billing or platform administration.
- Supported type values are explicit: `fill`, `bidding`, `cvs`, and `assigned`; unknown types become unavailable instead of new screen families.

Remaining blockers before `Figma-ready`:
- Marketplace visuals are not canonical for each list type, empty/unavailable states, and RA-specific item cards/list controls.
- Item backend schema, bidding actions, CV handoff actions, and assignment collaboration details are unknown; do not invent them for Figma.

### `sysadmin`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Contract-reviewed | `/users?page&search&hiringCompanyId&recruitmentAgencyId` | PageWithStatefulUrl | users | M | R5 | Confirmed in router/metadata, platform users page, users state helpers, route metadata tests, and platform users tests. Covers platform-scope list filters, sanitized page/search/hiringCompanyId/recruitmentAgencyId state, ready/loading/empty/error/denied states, return target construction, dashboard fallback, and explicit `orgScope: false`. Visual reference pending; backend user list schema and mutation contracts unknown. |
| Contract-reviewed | `/users/edit/:id` | Page | users | M | R5 | Confirmed as `/users/edit/$userId` route with `canManagePlatformUsers`, edit page, platform users state, and tests. Covers returnTo sanitization, editing/saving/success/cancelled/error/permission-denied states, parent/success/cancel target preservation, and separation from org invite management. Visual reference pending; backend role/tenant assignment payload unknown. |
| Contract-reviewed | `/users/new` | Page | users | M | R5 | Confirmed in router/metadata and create page using platform user list state with `canManagePlatformUsers`. Covers direct/create entry, optional search-derived return context, platform-only user creation surface, dashboard fallback, and explicit separation from public invite acceptance and org `/users/invite`. Visual reference pending; backend create payload unknown. |
| Contract-reviewed | `/users/:id` | Page | users | M | R5 | Confirmed as `/users/$userId` route with detail page, returnTo sanitization, platform users state, route metadata, and tests. Covers ready/loading/not-found/permission-denied/stale states, parent target preservation, platform scope, and edit handoff. Visual reference pending; backend user detail schema unknown. |
| Contract-reviewed | `/favorites-request` | PageWithStatefulUrl | favorite-requests | L | R5 | Confirmed in router/metadata, platform favorite request queue page, favorite request queue state, and tests. Covers platform queue ownership, pending/resolved/rejected/stale/inaccessible/empty/error states, approve/reject/reopen readiness, dashboard fallback, and explicit separation from org `/favorites/request*`. Visual reference pending; backend queue schema/action payload unknown. |
| Contract-reviewed | `/favorites-request/:id` | Page | favorite-requests | L | R5 | Confirmed as `/favorites-request/$requestId` detail route with `canManageFavoriteRequests`, detail page, queue state, and tests. Covers request detail entry, pending/resolved/rejected/stale/inaccessible/empty/error states, parent `/favorites-request`, and approve/reject/reopen action readiness. Visual reference pending; backend detail/action contract unknown. |
| Contract-reviewed | `/hiring-companies` | Page | companies | M | R5 | Confirmed in router/metadata, master-data list page, master-data state, and routing tests. Covers platform master-data list states loading/ready/empty/error/denied, count projection, dashboard fallback, and entity ownership `hiring-company`. Visual reference pending; backend company list schema unknown. |
| Contract-reviewed | `/hiring-companies/:id` | Page | companies | M | R5 | Confirmed as `/hiring-companies/$companyId` route with master-data detail page and state tests. Covers loading/ready/not-found/stale/denied states, parent `/hiring-companies`, dashboard fallback, and edit/subscription handoff. Visual reference pending; backend company detail fields unknown. |
| Contract-reviewed | `/hiring-companies/edit/:id` | Page | companies | M | R5 | Confirmed as `/hiring-companies/edit/$companyId` route with master-data edit page and state tests. Covers editing/saving/success/cancelled/error/denied states, detail parent/success/cancel targets, and platform company ownership. Visual reference pending; backend update payload unknown. |
| Contract-reviewed | `/hiring-company/:id/subscription` | Page | companies | M | R5 | Confirmed as `/hiring-company/$companyId/subscription` route with `canManageHiringCompanies`, company subscription page, master-data state, and tests. Covers ready/loading/stale/denied/not-found/mutation-blocked/mutation-success/mutation-error states, route capability vs mutation capability `canManagePlatformSubscriptions`, refresh targets, and parent company detail. Visual reference pending; backend subscription mutation details unknown. |
| Contract-reviewed | `/recruitment-agencies` | Page | agencies | M | R5 | Confirmed in router/metadata, master-data list page, master-data state, and routing tests. Covers platform master-data list states loading/ready/empty/error/denied, count projection, dashboard fallback, and entity ownership `recruitment-agency`. Visual reference pending; backend agency list schema unknown. |
| Contract-reviewed | `/recruitment-agencies/:id` | Page | agencies | M | R5 | Confirmed as `/recruitment-agencies/$agencyId` route with master-data detail page and state tests. Covers loading/ready/not-found/stale/denied states, parent `/recruitment-agencies`, dashboard fallback, and edit handoff. Visual reference pending; backend agency detail fields unknown. |
| Contract-reviewed | `/recruitment-agencies/edit/:id` | Page | agencies | M | R5 | Confirmed as `/recruitment-agencies/edit/$agencyId` route with master-data edit page and state tests. Covers editing/saving/success/cancelled/error/denied states, detail parent/success/cancel targets, and platform agency ownership. Visual reference pending; backend update payload unknown. |
| Contract-reviewed | `/subscriptions` | Page | subscriptions | M | R5 | Confirmed in router/metadata, master-data list page, master-data state, and routing tests. Covers platform subscription list states loading/ready/empty/error/denied, count projection, dashboard fallback, and separation from authenticated org `/billing` commercial screens. Visual reference pending; backend subscription list schema unknown. |
| Contract-reviewed | `/subscriptions/:id` | Page | subscriptions | M | R5 | Confirmed as `/subscriptions/$subscriptionId` route with master-data detail page and state tests. Covers loading/ready/not-found/stale/denied states, parent `/subscriptions`, dashboard fallback, and platform subscription ownership. Visual reference pending; backend subscription detail fields unknown. |
| Contract-reviewed | `/sectors` | PageWithStatefulUrl | taxonomy | L | R5 | Confirmed in router/metadata, taxonomy sector list page, taxonomy state, and routing/state tests. Covers route family `taxonomy`, ready/loading/empty/error/denied/not-found/stale/mutation-success/mutation-error states, dashboard parent, and separation from settings subsections/master-data routes. Visual reference pending; backend taxonomy list schema unknown. |
| Contract-reviewed | `/sectors/:id` | Page | taxonomy | L | R5 | Confirmed as `/sectors/$sectorId` route with sector detail page, taxonomy state, and tests. Covers sector id state, ready/loading/empty/error/denied/not-found/stale/mutation-success/mutation-error variants, parent `/sectors`, and taxonomy route ownership. Visual reference pending; backend sector detail/update payload unknown. |
| Contract-reviewed | `/sectors/:sector_id/subsectors` | PageWithStatefulUrl | taxonomy | L | R5 | Confirmed as `/sectors/$sectorId/subsectors` route with subsector list page, taxonomy state, and tests. Covers sector-scoped subsector list, route family `taxonomy`, parent sector detail, list and mutation states, and no settings/master-data ownership. Visual reference pending; backend subsector list schema unknown. |
| Contract-reviewed | `/subsectors/:id` | Page | taxonomy | L | R5 | Confirmed as `/subsectors/$subsectorId` route with subsector detail page, taxonomy state, and tests. Covers subsector detail, optional sector parent resolution, not-found/stale/denied/error/mutation states, fallback parent `/sectors`, and taxonomy route ownership. Visual reference pending; backend subsector detail/update payload unknown. |


#### SysAdmin review evidence and remaining blockers

Confirmed evidence:
- SysAdmin/platform routes are registered inside the authenticated shell with platform-specific capabilities: `canManagePlatformUsers`, `canManageFavoriteRequests`, `canManageHiringCompanies`, `canManageRecruitmentAgencies`, `canManagePlatformSubscriptions`, and `canManageTaxonomy`.
- Users and favorite-request queues are implemented under `src/domains/sysadmin/users-and-requests`, with state helpers for URL filters, platform-only scope, return targets, queue states, and action readiness.
- Company, agency, and subscription master-data routes share `src/domains/sysadmin/master-data`, including list/detail/edit states, dashboard fallback, entity-specific parent targets, and company subscription route-vs-mutation capability separation.
- Taxonomy routes are implemented under `src/domains/sysadmin/taxonomy`, with explicit sector/subsector surfaces, parent targets, route family ownership, and separation from settings subsections or generic master-data routes.
- Platform subscription administration is intentionally separate from org billing screens, and platform user CRUD is intentionally separate from org team invite management and public invite-token acceptance.

Remaining blockers before `Figma-ready`:
- SysAdmin visuals are not canonical for platform list/detail/edit, queue action, company subscription, taxonomy list/detail, denied, stale, not-found, mutation-success, and mutation-error states.
- Backend schemas and mutation payloads for platform users, favorite request actions, master-data entities, platform subscriptions, and taxonomy entities are unknown; do not invent fields in Figma contracts.
- Legacy `/recruiters` is not a SysAdmin route and must not be mapped to platform `/users`; recruiter visibility remains `/team/recruiters`.

## Alias/reference rows from `screens.md`

These rows are not independent canonical screens; they point to registered route families and must be reviewed through their owning canonical rows.

| Alias/reference row | Canonical review target | Status | Notes |
|---|---|---|---|
| `/job/$id/cv/{cv_id}` | Job CV route family (`/job/:id/cv`, `/job/:id/cv/:cv_id`) | Contract-reviewed | Reviewed as part of jobs task-overlays; keep as alias/reference and do not create a separate canonical route. |
| `/candidate/$id/.../cv/$cv_id/offer` | Candidate action route family (`/candidate/:id/.../cv/:cv_id/offer`) | Contract-reviewed | Reviewed as part of candidate action launchers; keep as alias/reference and do not create a separate canonical route. |
| `/integration/cv/$token/$action?` | Integration token-entry route family (`/integration/cv/:token/:action?`) | Contract-reviewed | Reviewed as public/token integration callback; keep separate from authenticated provider setup. |
| `/parameters*` | `/parameters/:settings_id?/:section?/:subsection?` compatibility family | Contract-reviewed | Reviewed as operational settings compatibility resolver; keep as alias/reference and do not create a monolithic settings screen. |

## Current blockers before Figma

- Full domain-by-domain contract review is complete for all 103 canonical route rows and 4 alias/reference rows. Rows become `Figma-ready` only when canonical evidence confirms their visual/state scope and unresolved debt is explicitly recorded.
- Existing auth/dashboard visual references do not cover all token, callback, degraded, denied, stale, retry, and parent-return states.
- V0 covered rows and V1 jobs screen-flow bases may proceed to Figma with deferred provider/form/schema annotations. V2 candidate rows are behaviour-evidenced but parity-blocked; public/external, settings, integrations, reports, billing, team/favorites, marketplace, and SysAdmin exact visual references are still partial.
- Shell/dashboard visual parity debt remains tracked in `roadmap.md` and should be handled during visual refinement, not as API/data blocker.

## Next review order

Contract review is complete. The next pass is visual confirmation and Figma-readiness, in this order:

1. Auth public/token + SSO callback states.
2. Shell, dashboard, notifications, inbox.
3. Jobs list/detail/task overlays. Done for V1 screen-flow bases; provider/form/schema details remain deferred.
4. Candidate hub/action launchers/database handoff.
5. Public/external token flows.
6. Settings, integrations, reports, billing, team/favorites, marketplace.
7. SysAdmin/platform long-tail.

## Generated inventory note

This file was initialized from `screens.md` with 103 canonical route rows plus 4 alias/reference rows. Update statuses manually as review evidence is confirmed; do not regenerate over reviewed statuses without preserving notes.
