# Pre-Figma Flow Review Gate

## Purpose

This document blocks Figma/screen-flow production until every route and flow from `screens.md` has been reviewed for product behavior, state coverage, data/API expectations, parent-return semantics, and telemetry safety. Existing visual references do not imply flow confirmation.

## Gate status

| Gate item | Status | Notes |
|---|---|---|
| Complete route inventory imported from `screens.md` | Done | 103 canonical route rows imported; 4 alias/reference rows are tracked separately below. |
| Domain-by-domain flow review | In progress | No domain is fully Figma-ready until its checklist below is complete. |
| Visual reference confirmation | Not started gate-wide | Existing auth/dashboard references are evidence only; most route families still require canonical visual confirmation. |
| Figma production | Blocked | Do not create/attach canonical Figma frames until the relevant row is marked `Figma-ready`. |

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
| `auth` | 9 | 8 | 1 | 0 | Partial: core contract-reviewed; no row is Figma-ready |
| `shell` | 5 | 1 | 4 | 0 | Partial: notifications/user-profile reviewed; org profile/logout need doc-vs-runtime clarification |
| `dashboard` | 1 | 1 | 0 | 0 | Partial: API-backed contract-reviewed; visual parity debt remains |
| `inbox` | 1 | 1 | 0 | 0 | Partial: fixture-backed contract-reviewed; API/live conversation visuals pending |
| `jobs` | 12 | 8 | 4 | 0 | Partial: all rows contract-reviewed for route/state; canonical visuals and backend API depth still pending |
| `candidates` | 7 | 4 | 3 | 0 | Partial: all rows contract-reviewed for route/state; canonical visuals and backend API depth still pending |
| `public-external` | 9 | 1 | 7 | 1 | Partial: all rows contract-reviewed for token/state/workflow; canonical visuals and backend API depth still pending |
| `settings` | 17 | 0 | 14 | 3 | Partial: 16 rows contract-reviewed; `/recruiters` needs docs/runtime clarification |
| `integrations` | 5 | 0 | 2 | 3 | Partial: all rows contract-reviewed for setup/token contracts; canonical visuals and backend API depth still pending |
| `reports` | 7 | 0 | 5 | 2 | Partial: all rows contract-reviewed for family/result/export/schedule contracts; canonical visuals and backend schema still pending |
| `billing` | 4 | 0 | 4 | 0 | Not reviewed |
| `team` | 3 | 0 | 3 | 0 | Not reviewed |
| `favorites` | 3 | 0 | 0 | 3 | Not reviewed |
| `marketplace` | 1 | 0 | 1 | 0 | Not reviewed |
| `sysadmin` | 19 | 0 | 13 | 6 | Not reviewed |

## Route review inventory

### `auth`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Contract-reviewed | `/` | Public/Token | entry | H | R0 | Confirmed in router, route metadata, auth API adapter, and public page tests. Covers direct entry, returnTo, email/password, 2FA, provider launch, failed login, session bootstrap, and dashboard redirect. Visual reference exists for login only; final non-happy-state visual signoff is still pending. |
| Contract-reviewed | `/confirm-registration/:token` | Public/Token | token-flows | H | R0 | Confirmed in router/metadata and `confirmRegistrationToken`; handles missing/invalid token, token_valid with session bootstrap, approval-pending redirect, failed API, and dashboard/login landing. Visual state references pending. |
| Contract-reviewed | `/forgot-password` | Public/Token | token-flows | H | R0 | Confirmed in router/metadata, API adapter, and public page tests. Handles direct entry, submit, mail_sent, mail_not_found/default failed state, retry, and return to login. Visual state references pending. |
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
| Contract-reviewed | `/notifications` | Page | notifications | H | R0 | Confirmed in router/metadata and notification-state tests. Covers shell/topbar/direct entry, typed destination resolution, ready/empty/degraded/unavailable, unknown/missing/unsupported/denied/stale targets, unread count, dashboard fallback reason, and safe telemetry. Still fixture-backed; canonical notification list visuals pending. |
| Contract-reviewed | `/user-profile` | ShellOverlay | account-context | M | R0 | Confirmed in router/metadata, shell account navigation, and account settings page. Uses `canOpenAccountArea`, shell-aware direct entry, close target to dashboard/current shell parent, fixture-backed editable profile states, save/retry/refresh intent, and unknown-field disclosure. Visual overlay reference is confirmed indirectly but final overlay states pending. |
| Needs clarification | `/hiring-company-profile` | Page | account-context | M | R0 | Runtime route uses `canViewHiringCompanyProfile` plus `canManageCompanySettings` mutation capability and HC org ownership; `screens.md` still lists `canOpenAccountArea`. Code has fixture-backed ready/dirty/saved/denied/unknown-field states and dashboard parent return. Clarify canonical capability naming before Figma-ready. |
| Needs clarification | `/recruitment-agency-profile` | Page | account-context | M | R0 | Runtime route uses `canViewRecruitmentAgencyProfile` plus `canManageAgencySettings` mutation capability and RA org ownership; `screens.md` still lists `canOpenAccountArea`. Code has fixture-backed ready/dirty/saved/denied/unknown-field states and dashboard parent return. Clarify canonical capability naming before Figma-ready. |
| Needs clarification | `/logout` | ShellOverlay | account-context | M | R0 | Router places logout under authenticated shell with `canLogout`; route metadata class is `Page`/session while `screens.md` says `ShellOverlay`/account-context. Implementation clears local session, resets access context, tracks safe logout telemetry, and links to `/`. Clarify route class/owner label before Figma-ready. |


#### Shell review evidence and remaining blockers

Confirmed evidence:
- Authenticated shell navigation is capability-filtered through `src/shell/navigation/nav-registry.ts` and rendered by `src/shell/layout/authenticated-shell.tsx` with org/platform modes and account links.
- `/notifications` has a typed-destination resolver model with safe fallbacks and telemetry; unsupported, stale, denied, and unknown destinations do not become direct implementation evidence for target domains.
- `/user-profile` reuses the account settings state model as a shell-aware overlay with parent close behavior.
- Organization profile pages reuse the same account settings state model and expose unknown persistence fields instead of inventing APIs.

Remaining blockers before `Figma-ready`:
- `screens.md` and runtime metadata disagree on canonical capability names for organization profile routes; normalize the doc contract or explicitly record aliases before visual handoff.
- `/logout` route class/owner differs between `screens.md` (`ShellOverlay`/account-context) and runtime metadata (`Page`/session); choose the canonical design representation.
- Shell visual parity is not complete: sidebar/topbar/account-menu/footer and notification bell interactions need canonical frame/state references.

### `dashboard`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Contract-reviewed | `/dashboard` | Page | landing | H | R0-R5 | Confirmed in router/metadata, dashboard API adapter/state/page tests, and legacy visual comparison. API-backed overview uses GraphQL dashboard/auth/users, REST notifications, and calendar query; covers loading skeleton, ready, degraded, platform mode, notification fallback reasons, safe actions, cards, calendar, and activity. Visual parity debt remains intentionally tracked in `roadmap.md`. |


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
| Contract-reviewed | `/inbox?conversation=` | PageWithStatefulUrl | conversation-list | H | R0 | Confirmed in router/metadata, search validation, inbox page tests, and messaging support tests. Covers menu/direct URL/notification/candidate entry, sanitized conversation query, draft/returnTo URL state, empty/ready/not-found/inaccessible/provider-blocked/degraded/unavailable/stale states, refresh/fallback/return links, and safe telemetry. Still fixture-backed for live conversation list/send transport; canonical conversation UI visuals pending. |


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
| Contract-reviewed | `/jobs/:type?page&search&asAdmin&label` | PageWithStatefulUrl | list | H | R1 | Confirmed in router/metadata, search/scope validation, list page tests, and jobs adapters. Covers scope/page/search/asAdmin/label URL state, clear-filters action, ready/empty/filtered-empty/loading/denied/unavailable/degraded/stale states, ATS source status, create entry, and detail links. Still fixture-backed for job list data; canonical list/table visuals pending. |
| Contract-reviewed | `/jobs/manage/:id?resetWorkflow` | Page | authoring | H | R1 | Confirmed in router/metadata, authoring page, adapters, product-depth, publishing tests. Covers create/edit/copy, resetWorkflow, validating/dirty/saving/saved/save-failed, publish-blocked/partial-publish separation, ATS status, draft serialization seam, and create/edit capabilities. `canResetJobWorkflow` remains an action capability, not a route metadata requirement. Visual authoring/publishing states pending. |
| Contract-reviewed | `/job/:id?section` | PageWithStatefulUrl | detail | H | R1 | Confirmed in router/metadata, search validation, detail page, adapters, and product-depth tests. Covers overview/candidates/workflow/activity sections, degraded section, unavailable, status transition, assignment/share state, summaries, task links, and parent route for overlays. Still fixture-backed for aggregate job payload; canonical hub visuals pending. |
| Contract-reviewed | `/job/:id/bid` | RoutedOverlay | task-overlays | M | R1 | Confirmed in router/metadata and shared `JobTaskPage` context. Covers direct/scoped entry, parent sanitization, ready/submit/success/fail/retry/cancel/refresh/denied/unavailable/degraded state model, close/complete parent links, and safe parent refresh intent. Visual bid-create overlay pending. |
| Contract-reviewed | `/job/:id/bid/:bid_id` | RoutedOverlay | task-overlays | M | R1 | Confirmed in router/metadata and shared `JobTaskPage` context. Covers bidId propagation, scoped parent return, direct-entry fallback, outcome states, and parent refresh intent. Visual bid-view overlay pending. |
| Contract-reviewed | `/job/:id/cv` | RoutedOverlay | task-overlays | H | R1 | Confirmed in router/metadata and shared `JobTaskPage` context. Covers CV create/entry state model, scoped parent return, outcome states, direct-entry fallback, and parent refresh intent. Actual CV payload/form API remains outside this seam; canonical CV-create visuals pending. |
| Contract-reviewed | `/job/:id/cv/:cv_id` | RoutedOverlay | task-overlays | H | R1 | Confirmed in router/metadata and shared `JobTaskPage` context. Covers candidate/CV id propagation, parent return, direct-entry fallback, outcome states, and parent refresh intent. Actual CV document/body payload is intentionally not modeled; canonical CV-view visuals pending. |
| Contract-reviewed | `/job/:id/cv-reject/:cv_id` | TaskFlow | task-overlays | H | R1 | Confirmed in router/metadata and shared job task context. Uses `canRejectCvFromJob`, preserves job/candidate context, supports submit/success/fail/retry/cancel/parent-refresh states, and returns to job parent. Rejection reason catalog/API and exact modal visuals pending. |
| Contract-reviewed | `/job/:id/cv/:cv_id/schedule` | TaskFlow | task-overlays | H | R1 | Confirmed in router/metadata, task context tests, scheduling support, and provider readiness gate integration. Uses `canScheduleInterviewFromJob`, preserves parent return/section, handles readiness ready/degraded/blocked/unavailable, slots, submit/success/fail/retry/cancel/parent-refresh, and setup remediation target. Exact scheduling form/calendar visuals pending. |
| Contract-reviewed | `/job/:id/cv/:cv_id/offer` | TaskFlow | task-overlays | H | R1 | Confirmed in router/metadata, task context tests, and contract-signing support. Uses `canCreateOfferFromJob`, preserves parent return/section, attaches job-scoped contract signing action target, document placeholder, ready/send state, and parent refresh intent. Real offer/contract payload and canonical offer visuals pending. |
| Contract-reviewed | `/build-requisition` | TaskFlow | workflow-state | M | R5 | Confirmed in router/metadata, requisition page, and requisition state tests. Uses `canUseJobRequisitionBranching`, dashboard fallback, explicit-save/no-autosave draft state, data-loss warning, retryable mutation states, and HRIS readiness helper. Canonical requisition draft visuals pending. |
| Contract-reviewed | `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` | PageWithStatefulUrl | workflow-state | M | R5 | Confirmed in router/metadata, requisition page, and requisition state/routing tests. Uses `canUseJobRequisitionBranching`, workflow/stage params, stale-workflow/workflow-drift authority, explicit parent target to jobs, HRIS operational state separation, and dashboard fallback. Exact requisition workflow visuals pending. |


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
| Contract-reviewed | `/candidate/:id/:job?/:status?/:order?/:filters?/:interview?` | PageWithStatefulUrl | detail-hub | H | R2 | Confirmed in router/metadata dynamic route arrays, route parsing/search validation, detail page, candidate store, panels, ATS adapters, and routing/product-depth tests. Covers direct/job/notification/database entry, optional job/status/order/filters/interview context, degraded sections, sequence prev/next, database return, ATS source state, documents/contracts, surveys/custom fields, collaboration, action links, upload CV, and safe telemetry. Still fixture-backed for candidate payloads; canonical hub visuals pending. |
| Contract-reviewed | `/candidate/:id/.../cv/:cv_id/schedule` | TaskFlow | action-launchers | H | R2 | Confirmed in router/metadata action route arrays, task search validation, candidate task page, action context tests, and calendar scheduling support. Runtime route uses specific `canScheduleInterviewFromCandidate` boundary while metadata family records `canOpenCandidateAction`; preserves contextual or database-origin parent, recovery target, readiness gate, slots, submit/success/failure/cancel, and parent refresh intent. Schedule visuals and provider-blocked/degraded states pending. |
| Contract-reviewed | `/candidate/:id/.../cv/:cv_id/offer` | TaskFlow | action-launchers | H | R2 | Confirmed in router/metadata action route arrays, task search validation, candidate task page, action context tests, and contract-signing support. Runtime route uses specific `canCreateOfferFromCandidate` boundary while metadata family records `canOpenCandidateAction`; preserves parent/recovery/database return, attaches candidate-scoped contract signing target, send/status-refresh telemetry, and parent refresh intent. Real offer payload and visuals pending. |
| Contract-reviewed | `/candidate/:id/.../cv-reject/:cv_id` | TaskFlow | action-launchers | H | R2 | Confirmed in router/metadata action route arrays, task search validation, candidate task page, action context, and survey/review scoring support. Runtime route uses `canRejectCandidate` while metadata family records `canOpenCandidateAction`; preserves parent/recovery/database return, submit/failure/cancel/success, review/scoring terminal outcome, candidate store update, and parent refresh intent. Reject reason/review visuals pending. |
| Contract-reviewed | `/candidates-old?query&page` | PageWithStatefulUrl | database-search | M | R4 | Confirmed in router/metadata as compatibility entry that redirects to canonical `/candidates-database` with sanitized state. Uses `canViewCandidateDatabase`; `canSearchCandidates` remains action capability. Preserves query/page/sort/order/stage/tags/advanced state through canonicalization. Visuals should use canonical database route, not legacy alias. |
| Contract-reviewed | `/candidates-database?query&page` | PageWithStatefulUrl | database-search | M | R4 | Confirmed in router/metadata, database route parser, database page, candidate database routing tests, ATS adapters, and product-depth tests. Covers sanitized query/page/sort/order/stage/tags/advanced query, empty/ready/stale/degraded/retryable, advanced invalid/unsupported, bulk none/eligible/partial/blocked/failed/retryable, ATS duplicate/import state, and database-to-detail return target. Fixture-backed results only; canonical database visuals pending. |
| Contract-reviewed | `/candidates-new?query&page` | PageWithStatefulUrl | database-search | M | R4 | Confirmed in router/metadata as compatibility entry that redirects to canonical `/candidates-database` with sanitized state. Uses `canViewCandidateDatabase`; `canSearchCandidates` remains action capability. Visuals should use canonical database route and document alias behavior only. |


#### Candidates review evidence and remaining blockers

Confirmed evidence:
- Candidate detail and action routes are generated from canonical route arrays, preserving dense optional context segments instead of ad-hoc route aliases.
- Candidate detail supports direct, job, notification, and database-origin entry modes, including sanitized database return targets and sequence behavior.
- Candidate action launchers preserve contextual parent/recovery targets and use shared support for scheduling, contract signing, survey/review scoring, candidate store updates, and parent refresh intent.
- Candidate database canonicalizes legacy `/candidates-old` and `/candidates-new` entries to `/candidates-database` while preserving sanitized URL state.
- Database/search, advanced search, bulk actions, ATS source state, duplicate/import/sync states, and detail handoff are modeled without inventing backend APIs.

Remaining blockers before `Figma-ready`:
- Candidate data and database rows are fixture-backed adapter seams; Figma must not infer production backend fields beyond the documented state contract.
- Canonical visuals are missing for candidate hub panels, sequence nav, database return, documents/contracts, survey/custom-field degradation, collaboration handoff, and CV upload.
- Schedule/offer/reject launchers need separate frames/states for ready, provider-blocked/degraded/unavailable, submit, failure, retry, success, terminal/read-only, and parent-refresh outcomes.
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
| Needs clarification | `/recruiters` | Page | agency-settings | L | R4 | `screens.md` documents `/recruiters`, but runtime canonical recruiter visibility is `/team/recruiters` and agency settings runtime route is `/settings/agency-settings`. Do not create a Figma screen for `/recruiters` until this legacy/docs alias is resolved. |
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
- `/recruiters` is a docs/runtime mismatch: choose whether it is a legacy alias for `/team/recruiters`, an agency settings alias for `/settings/agency-settings`, or documentation residue.
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
| Not reviewed | `/billing` | Page | overview | M | R4 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/billing/upgrade` | TaskFlow | upgrade | M | R4 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/billing/sms` | TaskFlow | sms | M | R4 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/billing/card/:id` | ShellOverlay | cards | M | R4 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |

### `team`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Not reviewed | `/team` | Page | org-team | M | R4 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/team/recruiters` | Page | recruiter-visibility | M | R4 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/users/invite` | TaskFlow | invite-management | M | R4 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |

### `favorites`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Not reviewed | `/favorites` | Page | org-favorites | L | R4 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/favorites/:id` | Page | org-favorites | L | R4 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/favorites/request/:id?` | TaskFlow | org-favorite-requests | L | R4 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |

### `marketplace`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Not reviewed | `/jobmarket/:type` | PageWithStatefulUrl | marketplace-list | M | R4 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |

### `sysadmin`

| Status | Route | Class | Module | Crit | Release | Review notes |
|---|---|---|---|---|---|---|
| Not reviewed | `/users?page&search&hiringCompanyId&recruitmentAgencyId` | PageWithStatefulUrl | users | M | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/users/edit/:id` | Page | users | M | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/users/new` | Page | users | M | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/users/:id` | Page | users | M | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/favorites-request` | PageWithStatefulUrl | favorite-requests | L | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/favorites-request/:id` | Page | favorite-requests | L | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/hiring-companies` | Page | companies | M | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/hiring-companies/:id` | Page | companies | M | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/hiring-companies/edit/:id` | Page | companies | M | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/hiring-company/:id/subscription` | Page | companies | M | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/recruitment-agencies` | Page | agencies | M | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/recruitment-agencies/:id` | Page | agencies | M | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/recruitment-agencies/edit/:id` | Page | agencies | M | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/subscriptions` | Page | subscriptions | M | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/subscriptions/:id` | Page | subscriptions | M | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/sectors` | PageWithStatefulUrl | taxonomy | L | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/sectors/:id` | Page | taxonomy | L | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/sectors/:sector_id/subsectors` | PageWithStatefulUrl | taxonomy | L | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |
| Not reviewed | `/subsectors/:id` | Page | taxonomy | L | R5 | Pending review: confirm entry modes, state groups, data/API contract, parent return, telemetry, and visual reference before Figma. |

## Alias/reference rows from `screens.md`

These rows are not independent canonical screens; they point to registered route families and must be reviewed through their owning canonical rows.

| Alias/reference row | Canonical review target | Status | Notes |
|---|---|---|---|
| `/job/$id/cv/{cv_id}` | Job CV route family (`/job/:id/cv`, `/job/:id/cv/:cv_id`) | Contract-reviewed | Reviewed as part of jobs task-overlays; keep as alias/reference and do not create a separate canonical route. |
| `/candidate/$id/.../cv/$cv_id/offer` | Candidate action route family (`/candidate/:id/.../cv/:cv_id/offer`) | Contract-reviewed | Reviewed as part of candidate action launchers; keep as alias/reference and do not create a separate canonical route. |
| `/integration/cv/$token/$action?` | Integration token-entry route family (`/integration/cv/:token/:action?`) | Contract-reviewed | Reviewed as public/token integration callback; keep separate from authenticated provider setup. |
| `/parameters*` | `/parameters/:settings_id?/:section?/:subsection?` compatibility family | Contract-reviewed | Reviewed as operational settings compatibility resolver; keep as alias/reference and do not create a monolithic settings screen. |

## Current blockers before Figma

- Full domain-by-domain review has not been completed for all 103 canonical route rows and 4 alias/reference rows.
- Existing auth/dashboard visual references do not cover all token, callback, degraded, denied, stale, retry, and parent-return states.
- Jobs, candidate, public/external, settings, and integrations exact visual references are still partial; do not start detailed Figma frames until their rows are contract-reviewed and signoff-ready.
- Shell/dashboard visual parity debt remains tracked in `roadmap.md` and should be handled during visual refinement, not as API/data blocker.

## Next review order

1. Auth public/token + SSO callback states.
2. Shell, dashboard, notifications, inbox.
3. Jobs list/detail/task overlays.
4. Candidate hub/action launchers/database handoff.
5. Public/external token flows. (Contract-reviewed; visual confirmation pending.)
6. Settings, integrations, reports, billing, team/favorites, marketplace. (Settings, integrations, and reports contract-reviewed except `/recruiters` clarification.)
7. SysAdmin/platform long-tail.

## Generated inventory note

This file was initialized from `screens.md` with 103 canonical route rows plus 4 alias/reference rows. Update statuses manually as review evidence is confirmed; do not regenerate over reviewed statuses without preserving notes.
