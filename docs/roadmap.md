# Greenfield Frontend Roadmap

## Purpose

This document defines the delivery roadmap for building the recruiter frontend from zero, as a full replacement (no coexistence with the legacy AngularJS/React app).

It is a **synthesis** of the migration planning knowledge base in `../../docs/frontend-2/`, reinterpreted for a greenfield rewrite:

- scope content (journeys, domains, access, edge cases, contracts) is preserved
- migration-specific content (coexistence, handoff, parity against legacy, phased ownership) is discarded
- release slicing is redefined for greenfield, not for phased migration

## Source baseline

Synthesized from:
- `../../docs/frontend-2/frontend-wave-1-journey-catalog.md`
- `../../docs/frontend-2/frontend-wave-2-and-wave-3-journey-catalog.md`
- `../../docs/frontend-2/frontend-rewrite-risks.md`
- `../../docs/frontend-2/frontend-jobs-domain-specification.md`
- `../../docs/frontend-2/frontend-candidate-domain-specification.md`
- `../../docs/frontend-2/frontend-design-system-gap-analysis.md`
- `../../docs/frontend-2/frontend-screen-inventory.md`
- `../../docs/frontend-2/frontend-modal-and-child-route-classification.md`
- `../../docs/frontend-2/frontend-edge-case-and-exception-catalog.md`
- `../../docs/frontend-2/frontend-role-to-screen-matrix.md`
- `../../docs/frontend-2/frontend-feature-flag-to-screen-matrix.md`
- `../../docs/frontend-2/frontend-contract-gap-inventory.md`
- `../../docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`
- `../../docs/frontend-2/frontend-file-upload-and-document-flow-inventory.md`
- `../../docs/frontend-2/frontend-state-management-strategy.md`
- `../../docs/frontend-2/frontend-migration-scope-statement.md`

## Package conventions

- **Release (R)** = a shippable greenfield milestone. Replaces "Wave" terminology from the migration docs.
- **Journey** = an end-to-end operational outcome (unchanged from frontend-2).
- **Hub** = a durable page-level operational center (unchanged).
- **Task flow** = an action-oriented subflow that may be a routed overlay or a dedicated page (unchanged).
- **Route class** = one of Page, PageWithStatefulUrl, RoutedOverlay, ShellOverlay, TaskFlow, EmbeddedFlow, Public/Token. See §6.

## Normative companion documents

This roadmap is not the route inventory and not the module registry. Use it together with:

- [`domains.md`](./domains.md) — definitive domain boundaries, ownership, and domain-to-domain dependencies
- [`modules.md`](./modules.md) — implementation modules inside each domain
- [`screens.md`](./screens.md) — executable route/screen manifest, including route class, persona, capability, flag, criticality, and release

Planning rule:
- `roadmap.md` defines **why and when**
- `domains.md` defines **what owns what**
- `modules.md` defines **what gets built**
- `screens.md` defines **what gets registered and shipped**

---

## 1. Release milestones

Six releases. R0 is foundation; R1/R2 are the recruiter-core pair that together make the product usable; R3 extracts external surfaces; R4 covers operational depth; R5 closes platform long-tail.

| # | Milestone | Scope summary | Complexity |
|---|---|---|---|
| **R0** | **Foundation** | Routing model, domain API layer, access/capability model, design-system blockers, auth + SSO/SAML, shell, dashboard as valid recruiter-core landing route, notifications with typed destination resolver, inbox conversation entry | L |
| **R1** | **Recruiter core — Jobs** | Jobs list, authoring (create/edit/resetWorkflow, incl. `jobRequisition` branching), detail hub, job-scoped task overlays (bid, cv, schedule, offer, reject) | XL |

R1 implementation status (confirmed in code): the Jobs route family is now registered in `src/app/router.tsx`, the route metadata/capability layer recognizes the R1 slice, and the first smoke tests cover list, authoring, detail, and schedule-entry routes.
| **R2** | **Recruiter core — Candidate** | Candidate detail hub, prev/next nav, full action family, comments/tags, CV upload, forms/docs/contracts/surveys/custom-fields summaries, interview feedback | XL |
| **R3** | **Public + external slice** | Public application, public survey, external interview/review/feedback flows, requisition approval, provider integration callbacks, careers/application-page/job-listing settings | L |

R3 implementation status (confirmed in code): the public/token route family now includes provider integration callbacks in `src/app/router.tsx`, with route metadata coverage plus smoke and Vitest proof for CV callback, forms/documents callback, and job callback direct entry.
| **R4** | **Operations depth** | Candidate database + search, templates, hiring-flow/custom-fields config, integrations setup, team/users + favorites, reports, marketplace (RA), billing | L |
| **R5** | **Platform + long-tail** | Sysadmin (companies/agencies/subscriptions/sectors/users), requisition authoring workflows, API endpoints settings, remaining parameters subsections, tokenized integration entries (cv/forms/job) | M |

### Why this slicing (and not the original Waves)

The frontend-2 waves were optimized for phased **co-existence** — Wave 1 had to be releasable alongside a still-running legacy. Greenfield doesn't have that constraint, so the slicing is optimized for two different goals:

1. **Get a credible recruiter-core product launched (R0 → R2)**. Until both Jobs and Candidate are complete, the product is not usable. R1 and R2 are inseparable from a go-to-market perspective, but separable as delivery milestones.
2. **Then extract slices that can launch independently (R3 → R5)**. Public/external, operations depth, and platform long-tail are independently testable and shippable once the core is in place.

R0 is new and heavy on purpose: foundational decisions (routing, access, state, API layer, design-system primitives) must land once, correctly, before any domain work. Most greenfield failures trace back to skipping R0.

Between `R1` and `R2`, the repository also carries a short hardening pass that is intentionally not modeled as a separate release: unit-test baseline, request/security hardening, and documentation synchronization. This keeps the R2 candidate slice from inheriting avoidable shared-library gaps.

### Cross-release dependencies to watch

Some capabilities cannot be cleanly confined to one release:

- **`jobRequisition` branching (R1 ↔ R5)** — full requisition authoring workflows are R5, but Jobs create/edit in R1 must already branch correctly when `jobRequisition` is enabled (with minimum signoff/requisition adjacency). Deferring the branching entirely to R5 would break R1 for HC orgs that have the flag on.
- **Notification typed-destination resolver (R0 ↔ every release)** — R0 ships the resolver, but each later release adds new destination kinds. The contract must stay stable; new kinds extend the union, they don't reshape it.
- **Capability model (R0 ↔ every release)** — R0 ships the 3-layer access model. Every new domain in R1+ contributes its own `canXxx` decisions to the capability layer, but never re-derives primitives in components.

---

## 2. Go/no-go gates per release

A release is not "done" just because the code is written. It's done when the gates are green. Treat gates as product-level acceptance, not engineering checklists.

### R0 — Foundation gates

- Auth flows cover success, invalid token, expired token, SSO/SAML callback error
- Shell renders correctly for every distinct persona: HC user, HC admin, RA user, RA admin, SysAdmin
- Dashboard is a valid landing route for authenticated recruiter-core users (not a placeholder) — renders role-correctly and supports deep-link / notification-based re-entry
- Notification router resolves **typed destinations** (entity + action + context); no opaque `referer` redirects
- Inbox conversation entry works end-to-end (`/inbox?conversation=…`) — deep-link restores selection, URL survives refresh and back-navigation
- Capability model is the single source of access truth — no component reads raw session payload
- Core design-system primitives in place: shell frame, task-flow container, state shells (loading/empty/error/denied/unavailable/stale/retry), validated inputs, list/filter/table scaffold
- Routing model documented and enforced (the seven route classes in §6) with back/refresh/direct-entry behavior defined per class

### R1 — Jobs gates

- Jobs list restores on refresh, back, and copied URL (filters, scope, admin, label, pagination)
- Authoring preserves partial-save semantics and surfaces validation errors per section
- Authoring handles `resetWorkflow` with explicit downstream impact communicated to the user
- Authoring supports `jobRequisition` branching at create/edit time with minimum signoff/requisition adjacency needed for recruiter-core (full requisition **authoring** workflows stay in R5, but the create/edit branching cannot be deferred without breaking R1)
- Job detail hub renders for HC user, HC admin, and RA collaborator with correct action availability
- Every job-scoped overlay (bid, cv-view, schedule, offer, reject) is deep-linkable from notifications and defines close/refresh/back semantics
- Job status transitions (close/reopen/publish) refresh hub data correctly

### R2 — Candidate gates

- Candidate detail hub loads with correct job/step context from: notifications, jobs list, direct URL
- Section-level partial degradation works — one failed panel does not collapse the hub
- Every candidate action (schedule, offer, reject, move, hire/unhire, review) defines: entry, cancel, failure, success, and parent-refresh behavior
- Upload flow refreshes document truth (no stale previews; no unauthorized asset references)
- Capability evaluation is uniform regardless of entry point (direct link vs. jobs entry vs. notification)
- Prev/next candidate navigation respects ordering + filter context

### R3 — Public + external gates

- Token lifecycle is uniform across every public/external surface: valid, invalid, expired, used, inaccessible — each distinguishable to the user
- Upload-heavy flows (public application) preserve attachments through submission; recoverable on network failure
- External shell is distinct from authenticated shell — no leakage of internal nav or account context
- Careers page / application page / job listings configuration publishes correctly and is reflected in public surfaces

### R4 — Operations depth gates

- Settings subsections launched **subsection-by-subsection**, not as one monolithic "parameters" page
- Report exports and scheduling work end-to-end for every report family
- Billing payment-state model (subscription, upgrade, SMS add-on, card) handles success and recoverable failure
- Per-provider integration contracts traced and tested (not one generic integration flow)
- Team/users/favorites/marketplace launched only after dependent config (hiring flow, templates, custom fields) is stable

### R4 planning breakdown and sequencing

`R4` is no longer treated as one undifferentiated operations wave. The consolidated planning baseline is:

| Phase | Planning package | Core outcome | Opens first |
|---|---|---|---|
| `R4.1` | operational settings foundation | subsection registry, `/parameters` compatibility, settings save/retry/readiness contract | `r4-operational-settings-substrate` |
| `R4.2` | candidate database | canonical database route family, preserved URL state, database → detail handoff | `r4-candidate-database-contract-foundation` |
| `R4.4` | integrations setup | admin shell plus provider-family state model for integrations | `r4-integrations-shell` |
| `R4.5` | reports | report shell plus shared export/scheduling contract | `r4-reports-foundation` |
| `R4.3` | team/users/favorites | org-admin/team ownership, invite/membership scope, favorites ownership | after `R4.1` stabilizes |
| `R4.6` | billing + marketplace | commercial state model for billing and bounded RA marketplace planning | after config/admin boundaries stabilize |

Sequencing rule:
- `R4.1` must land first because it stabilizes the operational settings substrate used by later admin-heavy areas.
- `R4.2`, `R4.4`, and `R4.5` can advance in parallel planning once their route/capability contracts are frozen.
- `R4.3` and `R4.6` stay later because their ownership and access boundaries still depend on stable config/admin decisions from earlier `R4` planning.

Operational settings substrate rule:
- `/parameters` remains compatibility-only.
- dedicated `R4.1` settings routes consume one subsection registry plus one shared readiness/save/retry workflow contract.
- the first consumers are `hiring-flow`, `custom-fields`, `templates`, and `reject-reasons`.

### R5 — Platform + long-tail gates

- Platform (sysadmin) ownership cleanly separated from recruiter-core shell
- Requisition authoring integrates with Jobs without consuming the Jobs domain (the minimum `jobRequisition` branching in authoring shipped in R1; R5 completes the authoring workflows)
- All previously mapped route families from the screen inventory are addressable in the new frontend
- All historical entry contracts (notifications, email tokens, integration callbacks, deep links) are supported with typed destinations — no opaque redirects remain

---

## 3. Journey inventory (cross-release)

Prioritized flat list. **Criticality (Crit)**: H = breaks core product if missing at launch; M = breaks a role's daily work but workaroundable short-term; L = nice-to-have for that release.

### Auth + shell

| Journey | Release | Crit |
|---|---|---|
| Sign in + establish context | R0 | H |
| SSO/SAML callback completion | R0 | H |
| Token flows (reset/confirm/register) | R0 | H |
| Enter authenticated shell | R0 | H |
| Dashboard landing (valid recruiter-core landing route) | R0 | H |
| Open notifications list | R0 | H |
| Notification → target workflow | R0 | H |
| Inbox conversation entry | R0 | H |
| Logout / session-loss recovery | R0 | M |

### Jobs

| Journey | Release | Crit |
|---|---|---|
| Jobs list: search/filter/paginate | R1 | H |
| Jobs list: scope/admin/label switch | R1 | M |
| Create new job | R1 | H |
| Edit existing job (+ resetWorkflow) | R1 | H |
| Job detail hub navigation (sections) | R1 | H |
| Job status transitions (close/reopen/publish) | R1 | M |
| Job sharing / assignment | R1 | M |
| Job bid list + view | R1 | M |
| Job CV list + view | R1 | H |
| Job-scoped: schedule interview | R1 | H |
| Job-scoped: create offer | R1 | H |
| Job-scoped: reject CV | R1 | H |

### Candidate

| Journey | Release | Crit |
|---|---|---|
| Open candidate detail (job/step context) | R2 | H |
| Previous/next candidate navigation | R2 | M |
| Candidate: schedule interview | R2 | H |
| Candidate: create offer | R2 | H |
| Candidate: reject | R2 | H |
| Candidate: move stage / hire / unhire | R2 | H |
| Candidate comments + tags | R2 | M |
| Candidate CV upload/replace/preview | R2 | H |
| Candidate documents/forms summary | R2 | M |
| Candidate contracts summary + actions | R2 | M |
| Candidate surveys + custom fields | R2 | M |
| Candidate interview feedback | R2 | M |
| Candidate review request | R2 | M |

### Public + external

| Journey | Release | Crit |
|---|---|---|
| Public job application (token entry) | R3 | H |
| Shared/public job view | R3 | M |
| Public survey completion | R3 | M |
| External interview request (tokenized) | R3 | M |
| External review-candidate (tokenized) | R3 | M |
| External interview-feedback (tokenized) | R3 | M |
| Requisition approval (tokenized) | R3 | M |
| Provider integration callbacks (inbound from external providers) | R3 | M |
| Careers / application / job-listing settings | R3 | M |

### Operations depth

| Journey | Release | Crit |
|---|---|---|
| Candidate database search/browse | R4 | M |
| Candidate list → detail (preserve search) | R4 | M |
| Hiring flow settings | R4 | M |
| Custom fields settings | R4 | M |
| Templates (email/smart-q/diversity/scoring) | R4 | M |
| Reject reasons management | R4 | L |
| Reports (jobs/teams/candidates/diversity/source/hiring-process) | R4 | M |
| Billing + upgrade + SMS + card | R4 | M |
| Integrations setup (providers/HRIS/boards) | R4 | M |
| Team/users + invite | R4 | M |
| Favorites / favorite requests | R4 | L |
| Marketplace (RA) | R4 | M |

### Platform + long-tail

| Journey | Release | Crit |
|---|---|---|
| Parameters subsection completion | R5 | M |
| Sysadmin: hiring-companies/agencies CRUD | R5 | M |
| Sysadmin: subscriptions | R5 | M |
| Sysadmin: sectors/subsectors | R5 | L |
| Sysadmin: global users | R5 | L |
| Build-requisition + requisition workflows (completes branching started in R1) | R5 | M |
| API endpoints settings | R5 | L |
| Integration tokenized entries (cv/forms/job) | R5 | L |

---

## 4. Domain model essentials

These shapes anchor the domain packages. Greenfield canonical models, not legacy payloads.

### Jobs

- `JobSummary` — lightweight row for lists and references
- `JobAuthoringDraft` — create/edit form state (identity, details, location, salary, visibility, questions, workflow, assignments, boards, flags)
- `JobDetailView` — hub aggregate (summary, sections, sharing, workflowState, pipelineSummary, assignments, integrationStatus, actions)
- `JobTaskContext` — launch context for job-scoped actions (jobId, candidateOrCvId, source, returnTarget, entryMode, permissions)
- `JobAssignment` — recruiter/collaborator link on a job
- `JobListFilters` — URL-bound filter, scope, pagination state
- `JobWorkflowState` — lifecycle, requisition, publication state
- `JobRequisitionLink` — adjacency to requisition/signoff workflow

### Candidate

- `CandidateSummary` — lightweight row for navigation and ordering
- `CandidateDetailView` — hub aggregate (profile, jobContext, workflow, history, comments, forms/docs/contracts/interviews/surveys/customFields/scores/integrations, actions)
- `CandidateActionContext` — per-action launch context (ids, step, entryMode, returnTarget, capabilities)
- `CandidateDocumentsView` — CV + forms + documents + contracts + upload state
- `CandidateWorkflowState` — hiring-flow step + history + scoring summaries
- `CandidatePipelineEntry` — candidate-in-job-step aggregate for prev/next navigation
- `CandidateComment` / `CandidateTag` — collaboration primitives
- `CandidateCustomFieldAnswer` — per-field-type answer with upload-aware variants

---

## 5. Access control surface

### Roles

Seven distinct actors:
- 5 internal: HC user, HC admin, RA user, RA admin, SysAdmin
- 1 public (unauthenticated)
- 1 external-token participant (reviewer / interviewer / approver)

The `admin` concept is overloaded in the legacy product — must split into **platform admin**, **HC admin**, and **RA admin** from day one.

### Feature flags gating screens

Roughly 25 flags gate navigation or in-flow behavior for R0–R2, grouped as:

- **Group A — shell/identity**: `hc`, `ra`, `admin`, `sysAdmin`
- **Group B — job-core**: `jobRequisition`, `seeJobRequisition`
- **Group C — candidate-core**: `formsDocs`, `interviewFeedback`, `calendarIntegration`, `bulkSchedule`, `rejectionReason`, `opening`
- **Group D — boundary**: `seeCandidates`, `billingHidden`

~15+ additional flags gate later-release surfaces (`customFieldsBeta`, `surveysBeta`, `customSurveys`, `sourceReportsBeta`, `smsBeta`, `blindReviewBeta`, `candidateTags`, `booleanSearch`, `contractSigner`, `recruiters`, etc.).

### Permission primitives

The access model is **composite**, not flat RBAC. Primitives:

- **Identity**: `actor`, `organizationContext` (HC / RA / sysAdmin / mixed)
- **Admin levels**: `platformAdmin`, `hcAdmin`, `raAdmin`
- **Pivot visibility**: `seeJobRequisition`, `seeCandidates`, `seeRecruiters`, `seeFavorites`, `seeFormsDocuments`, `seeContracts`
- **Subscription capabilities**: `jobRequisition`, `formsDocs`, `interviewFeedback`, `calendarIntegration`, `bulkSchedule`, `rejectionReason`, `opening`, `contractSigner`, `candidateTags`, `booleanSearch`, `recruiters`, `billingHidden`
- **Rollouts** (separated from capabilities): beta flags
- **Config** (NOT flags): `coord`, `vatPercent`, `settings`, `availableContracts`
- **Domain capability decisions** consumed by UI: `canCreateJob`, `canEditJob(jobId)`, `canPublishToBoard`, `canLaunchCandidateTask`, `canScheduleInterview`, `canSendOffer`, `canRejectCandidate`, `canMoveCandidate`, `canEditCustomFields`, `canAccessContracts`, `canAccessFormsDocuments`, `canUseSurveyActions`

Capability decisions must be **server-evaluable and org-scoped** (e.g., "can edit job X in org Y").

---

## 6. Routing / modal classification

Seven route classes. Every route in the system must declare its class. R0 ships the classification as part of the routing package.

- **Page** — standalone route, standard history. Use for dashboard, notifications, basic settings.
- **PageWithStatefulUrl** — URL query/segments are part of the interaction contract. Use for jobs list, inbox (`?conversation`), job detail (`?section`), candidate detail. URL must restore on refresh, share, and back-return.
- **RoutedOverlay** — URL-addressable modal/drawer anchored to a parent hub. Use for schedule / offer / reject / bid-view / cv-view. **Must be URL-addressable** (notifications deep-link here). Close → parent; back = close layer (not exit hub); refresh = reconstruct parent context.
- **ShellOverlay** — shell-state overlay anchored to whichever page is current; optional URL alias. Use for user-profile and global account overlays. Shell state, not content route.
- **TaskFlow** — full page replacement for action flows too dense for an overlay. Use when the task cannot reasonably overlay a parent.
- **EmbeddedFlow** — no URL; purely local modal. Only for low-value helpers never entered externally.
- **Public/Token** — unauthenticated or tokenized routes outside the authenticated shell. Distinct shell, distinct error model (valid/invalid/expired/used/inaccessible must be distinguishable).

**URL-addressability rule**: any action reachable by notification, email, copied link, or browser refresh MUST own a URL with defined open/close/cancel/refresh/back semantics. Internal-only helpers may remain unaddressed.

---

## 7. External / public / token surface

Every surface that enters from outside the authenticated shell:

- `/` · `/forgot-password` · `/reset-password/:token` — auth recovery
- `/confirm-registration/:token` · `/register/:token` — invite / onboarding
- `/auth/cezanne/:tenantGuid` · `/auth/cezanne/callback` · `/auth/saml` — SSO / SAML handoff
- `/shared/{jobOrRole}/:token/:source` · `/{jobOrRole}/application/:token/:source` — public job view + application submit (upload-heavy)
- `/surveys/:surveyuuid/:jobuuid/:cvuuid` — tokenized candidate survey
- `/chat/:token/:user_id` — externally shared chat (dedicated external-chat contract, separate from inbox and external-review forms)
- `/interview-request/:scheduleUuid/:cvToken` — external interviewer accept/decline
- `/review-candidate/:code` — external reviewer assessment
- `/interview-feedback/:code` — external interviewer feedback
- `/job-requisition-approval?token` · `/job-requisition-forms/:id?download` — tokenized requisition approval and download
- `/integration/cv/:token/:action?` · `/integration/forms/:token` · `/integration/job/:token/:action?` — provider/integration tokenized callbacks

Notification-driven entry currently uses opaque `referer` redirects (cv-interview-feedback, cv-reviewed, user-mentioned). **Must be normalized as a typed destination contract** in R0.

---

## 8. Design system gaps to close in R0

Greenfield does not inherit a complete design system. Before R1 starts, these must exist.

**Blockers** (must exist before any page assembly):
1. Authenticated shell frame — layout, sidebar/topbar, role/flag-aware nav slots, notifications affordance, account menu
2. Task-flow container — one contract supporting overlay OR dedicated-page treatment; header/footer, close/cancel, loading/error/retry slots, parent-context display
3. Page/section state shells — loading, empty, error, permission-denied, unavailable-feature, stale-state, retry. **Degraded-section must isolate**, not collapse the hub
4. Core input primitives — validated inputs with validation-message, async-submit, and dirty-state slots
5. List/filter/table scaffold — filter bar + chips, search, pagination, sortable dense tables, row actions with permission-aware rendering, empty/partial states

**High priority** (before R2 expands Jobs/Candidate density):

6. Summary header + action-bar primitive (hub headers)
7. Status badges + workflow step markers + timeline/history rows
8. Document/upload row primitive (signed-URL handshake, preview, delete, download, stale-state)
9. Section-level form layout with dirty/unsaved-change affordance

**Design principle**: primitives expose behavior slots (loading/error/empty/disabled/denied/retry); they must not decide route ownership or entitlement policy. Those decisions live in the access-control and routing packages.

---

## 9. Top risks

Greenfield-relevant risks, ordered by severity. Legacy-parity-only risks are dropped.

1. **Candidate detail is not one page.** Treating it as one collapses edge actions (interviews, docs, contracts, surveys, reviews).
2. **Jobs is a cluster**, not list+detail. (list, authoring, hub, task-launcher, requisition adjacency.)
3. **Hidden business rules live in legacy controllers, route resolves, and modal onEnter.** Easy to drop when redesigning.
4. **URL-addressable action overlays need deep-link + back + refresh semantics** or notifications break.
5. **Access is composite** (identity × admin × pivot × subscription × beta × config). Flattening it to RBAC will break visibility.
6. **Notification-driven entry is a first-class contract**, not a nice-to-have.
7. **Public/token flows** have distinct auth/shell/error assumptions; under-specifying ships broken features.
8. **Parameters is a multi-module backoffice** masquerading as a settings page. Budgeting it as one page misses scope.
9. **Mixed REST/GraphQL + provider callbacks** will leak into the UI unless a domain API layer is defined in R0.
10. **Error-path coverage** (invalid/expired/inaccessible/partial/stale) is the bar. Happy-path-only ships regressions.

---

## 10. Edge cases that kill MVPs

Recurring failure modes. Every release's test matrix must include these.

1. Deep link lands on a route the current user cannot access — must degrade, not trap
2. Notification target entity deleted/archived/changed — must show missing-target state with recovery
3. URL-addressable action cannot reconstruct parent context on refresh or direct-open
4. Browser back closes the wrong layer (exits hub instead of closing overlay)
5. Candidate aggregate partially loads (core profile + one failed panel) — hub must isolate, not collapse
6. Entity state changes mid-flow (job closed while editing; candidate moved while scheduling) — must revalidate before commit
7. Action succeeds but parent refresh fails / returns stale — user must not be told "done" over stale data
8. Invalid vs expired token must be distinguishable (auth, review, approval, application)
9. Feature-gated subsection unavailable for one persona but present for another — must fail gracefully per-persona
10. File upload succeeds but summary/preview stays stale or points to unauthorized asset
11. Job create blocked by missing workflow prerequisites — must explain + provide next step
12. Partial save across multi-section edits — must distinguish saved from unsaved sections, not silently discard

---

## 11. Contract gaps (backend dependencies)

Frontend cannot work around these. They must be fixed server-side before certain releases can ship.

### R0 — Auth + shell + notifications

- Unified session/bootstrap contract (session creation, user refresh, feature flags, billing indicators, callback completion)
- One access-evaluation contract for navigation + domain capabilities (single source of truth for role × admin × pivot × subscription × beta)
- Typed notification destination resolver (entity + action + required context); eliminate opaque `referer` redirects; error payload when target is missing/inaccessible/feature-gated

### R1 — Jobs

- One draft model + save/update serializer; provider/board logic behind orchestration layer, not in UI
- Explicit `resetWorkflow` semantics (what changes downstream)
- Server-side partial-save + validation error model
- Aggregator/BFF returning `JobDetailView` as one view model (sections, workflow state, assignments, sharing, capabilities, linked tasks)
- Capability evaluation per-action, not per-section probes
- Launch contract for bid/CV/schedule/offer/reject with parent context + return target; deep-linkable from notifications

### R2 — Candidate

- Aggregator/BFF returning `CandidateDetailView` with section-level partial-unavailable semantics
- Stable `jobContext`/`stepContext`/prev-next navigation contract
- Per-action contracts (schedule/offer/reject/move/hire/unhire/review/forms/docs/contracts/uploads) with shared context + error model; capability evaluation server-side
- Upload workflow contract (signed URL + metadata + preview refresh + delete)

### R3 — Public + external

- Public application: submit + upload + survey + custom-field boundary
- Token-flow lifecycle (valid/invalid/expired/used/inaccessible) — uniform across every token surface

### R4 — Operations depth

- Provider-by-provider integration contracts (per-provider, not generic)
- Billing payment-state contract (card flow, SMS add-on, subscription transitions, failure recovery)
- Hiring flow + custom-field downstream-impact contract (config changes that affect jobs/candidates)

---

## 12. Cross-release principles

These apply regardless of release.

### Behavior parity, not visual parity

A journey is "done" when the user can enter through every valid entry path, the main task completes, side effects happen, and the highest-risk failure modes are handled. Visual completion alone is not done.

### Journey as the unit of delivery

Routes and components are implementation detail. The delivery unit is the journey (see §3). Scope, acceptance, and testing are journey-anchored.

### Access as product scope

Role checks and feature flags are part of product behavior. A route visible to the wrong user — or hidden from the right one — is a product defect.

### State ownership per the five-layer model

Route state, server state, domain UI state, transient task-flow state, shell/global state. Before introducing new state, pass through the decision table in `../../docs/frontend-2/frontend-state-management-strategy.md` §Decision table.

### Error-path coverage is non-negotiable

Every journey ships with tests for invalid entry, expired state, inaccessible entity, partial load, and stale-after-action. Happy-path-only is a regression risk.

---

## 13. What was intentionally discarded from frontend-2

Because greenfield has no legacy to coexist with:

- Coexistence strategy and routing handoff
- Migration rollout plan (phased legacy ownership transfer)
- Parity-against-legacy test harness (replaced by standard journey tests)
- Operational support and incident notes tied to mixed-ownership
- Wave terminology (replaced by Release)
- Scope statement's "deferred-scope handling" for legacy-owned flows

What was **kept** (and reinterpreted for greenfield):

- All journey catalogs → §3
- All domain specifications → §4
- Access control model → §5
- Routing/modal classification → §6
- Deep-link/external surface inventory → §7
- Design-system gap analysis → §8
- Risks and edge cases → §9, §10
- Contract gaps → §11
- State management strategy → §12

---

## 14. Open questions for the architecture document

Not decided in this roadmap; must be resolved next in `architecture.md`:

1. Monorepo (Turborepo) vs. single-app structure at R0 — recommendation: single-app, adopt monorepo when R3 extracts public-web
2. GraphQL-first vs. REST-first transport — depends on backend trajectory
3. Router choice (TanStack Router vs. React Router 7 data mode)
4. Feature flag provider (self-hosted vs. LaunchDarkly/OpenFeature)
5. How the access-control capability model is exposed to the UI (hook API, decision objects, route-loader contract)
6. How task-flow overlays are structured to satisfy §6 URL-addressability without tight coupling to hubs
7. Observability and journey-correlation-ID approach

---

## 15. Companion documents (to be written next)

1. `architecture.md` — stack decisions, package layout, state-management implementation, routing implementation, access-control implementation, testing strategy
2. `adrs/` — durable decisions per area, one file each
3. `release-r0-plan.md` — detailed R0 scoping once architecture is committed

R2 implementation status (confirmed in code): the Candidate route family is now registered in `src/app/router.tsx`, the shared route/capability layer recognizes candidate detail and candidate task flows, and the smoke + Vitest baseline now covers candidate direct entry, notification entry, parent-return behavior, and visible refresh after candidate actions.

## R4 integrations shell implementation note

The R4 integrations setup baseline now includes an internal admin shell for `/integrations` and `/integrations/:id`, with explicit provider states and parent-index fallback. Provider-specific setup slices remain follow-on work.
