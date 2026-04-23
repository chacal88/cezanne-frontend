# Frontend Greenfield Documentation Index

## Purpose

This folder contains the active greenfield planning and execution package for rebuilding the recruiter frontend.

It converts the migration analysis in `../../docs/frontend-2/` into an execution-ready baseline for:
- domain ownership
- module decomposition
- screen and route registration
- access and capability modeling
- notification routing
- release-by-release implementation planning

## Current execution status

Confirmed:
- **Final frontend debt inventory and High-priority implementation closeout are archived OpenSpec records**.
  - Historical release closeout statements below describe route/spec/foundation milestones already achieved.
  - They must not be read as proof that every documented product-depth, placeholder, fixture-backed, route metadata, public/token, provider, operational, or long-tail debt is implemented unless the matching archived spec/change and source implementation both exist.
  - The authoritative inventory evidence is the archived registry in `../../openspec/changes/archive/2026-04-21-frontend-all-gap-debt-closeout/closeout-registry.md`.
  - The authoritative High-priority implementation/deferred-follow-up evidence is `../../openspec/changes/archive/2026-04-21-frontend-high-gap-implementation-closeout/high-priority-closeout-registry.md`.
  - The latest docs-vs-code cleanup normalized capability aliases under archived OpenSpec change `../../openspec/changes/archive/2026-04-21-frontend-capability-alias-doc-normalization/`.
  - `openspec list --json` is expected to return no active changes after this closeout unless a new product slice has been intentionally opened.
- **R0 is closed in code** in `recruit-frontend`
- the current implementation includes build proof, route metadata coverage, typed-destination safety, smoke validation, and a GitHub Actions smoke workflow
- the repository now uses a **Git/GitHub workflow with the R0 smoke gate defined in source**
- **R0 and R1 are closed in code**
- a pre-R2 hardening pass is now in place for testing and browser-side request/security boundaries
- **R2 is closed in code**
- the current source also includes the initial archived **R3** baselines for:
  - public application / survey / shared job
  - tokenized chat
  - external review (interview request, review-candidate, interview-feedback)
  - requisition approval
  - provider integration callbacks
  - careers/application/job-listings settings
- the previously open provider integration callback family is now represented in source under the `integrations` domain token-entry slice
- **R4 is closed as a frontend foundation release**; its closeout and deferred product-depth boundary are consolidated in:
  - `r4-master-plan.md`
  - `r4-operational-settings-open-points.md`
  - `r4-candidate-database-open-points.md`
  - `r4-team-and-favorites-open-points.md`
  - `r4-integrations-open-points.md`
  - `r4-reports-open-points.md`
  - `r4-billing-marketplace-open-points.md`
- **R5 is closed in code/docs** and its planning/closeout records remain in:
  - `r5-decision-register.md`
  - `r5-master-plan.md`
  - `r5-sysadmin-open-points.md`
  - `r5-requisition-authoring-open-points.md`
  - `r5-settings-and-token-open-points.md`
- post-R5 provider setup and operational readiness now have completed baselines:
  - `provider-specific-integrations-depth-plan.md`
  - `provider-readiness-operational-gates-plan.md`
  - `calendar-scheduling-operational-depth-plan.md`
  - `job-board-publishing-operational-depth-plan.md`
  - `hris-requisition-operational-depth-plan.md`
  - `messaging-communication-operational-depth-plan.md`
  - `contract-signing-operational-depth-plan.md`
  - `ats-assessment-provider-setup-depth-plan.md`
  - `survey-review-scoring-operational-depth-plan.md`
  - `ats-candidate-source-operational-depth-plan.md`
  - `integration-operational-depth-closeout.md`
  - `screen-design-flow-matrix.md`
- all eight post-gate operational-depth/provider-setup changes are implemented and validated:
  - `calendar-scheduling-operational-depth`
  - `job-board-publishing-operational-depth`
  - `hris-requisition-operational-depth`
  - `messaging-communication-operational-depth`
  - `contract-signing-operational-depth`
  - `ats-assessment-provider-setup-depth`
  - `survey-review-scoring-operational-depth`
  - `ats-candidate-source-operational-depth`
- the full sequence is synchronized in `integration-operational-depth-sequence-plan.md`
- the release-hardening evidence and PR handoff summary are recorded in `integration-operational-depth-closeout.md`
- the roadmap now marks **visual evidence capture** as the current next phase after contract package creation and before Figma + screen-flow contracts
- product decision on 2026-04-22: the full replacement requires pixel parity with the legacy frontend wherever a legacy screen/state exists; `Figma-ready` allows Figma/screen-flow production but does not equal replacement approval
- `screen-design-flow-matrix.md` is the active contract-first bridge from implemented route/state depth to canonical Figma references
- `pre-figma-flow-review.md` is the active gate for visual-readiness: all 104 canonical route rows plus 4 alias/reference rows are contract-reviewed and V0-V5 visual contracts are prepared, but Figma/screen-flow production remains blocked until evidence capture marks the relevant rows `Figma-ready`
- V3 public/external and integration token flows now have complete screen-flow/base-frame visual evidence in `visual-evidence-v3-public-external-token.md`, `visual-evidence-assets/v3/v3-capture-manifest.json`, `visual-evidence-assets/v3/v3-a-lifecycle-manifest.json`, and `visual-evidence-assets/v3/v3-follow-up-manifest.json`; V3 covered rows may proceed to Figma with backend/API/schema details annotated as deferred
- V4 operations now has authenticated baseline plus final safe local-fixture interaction evidence in `visual-evidence-v4-operations.md`, `visual-evidence-assets/v4/v4-capture-manifest.json`, and `visual-evidence-assets/v4/interactive-2026-04-22/interactive-capture-manifest.json`; V4 may proceed to Figma for current-app screen-flow/base-frame work with backend/provider/schema unknowns annotated, but still needs legacy pixel-parity replacement signoff where legacy screens exist
- V5 SysAdmin/platform now has first-pass current-app visual evidence plus 124 state-hook screenshots in `visual-evidence-v5-sysadmin-platform.md`, `visual-evidence-assets/v5/v5-capture-manifest.json`, and `visual-evidence-assets/v5/state-hooks-2026-04-23/v5-state-hooks-manifest.json`; covered V5 rows may proceed to desktop current-app Figma drafting with backend/API schemas deferred
- The V1-V5 roadmap review requested on 2026-04-22 is recorded in `v1-v5-roadmap-review-2026-04-22.md`: build and test validation pass, V1/V3/V4/V5 are closed for their current screen-flow drafting bases, V2 remains candidate visual-parity blocked after the Finn/Diego/API-seed parity-pass recapture. None of these rows are replacement-approved until legacy pixel parity is confirmed where legacy exists.
- `figma-screen-flow-handoff-index.md` is the active V0-V5 Figma/screen-flow handoff index for evidence-covered drafting. It includes V0 covered auth/shell/dashboard sub-blocks, V1 Jobs rows, V3 public/external/token rows, V4 operations rows, and V5 desktop current-app SysAdmin/platform rows. It keeps V2 excluded from Figma-ready promotion and keeps every legacy-backed row except focused `/logout` and `/forgot-password` replacement approvals blocked from replacement approval.
- `figma-handoff-released-areas-change.md` defines the active design-production change for continuing the Figma handoff across V0 partial, V1 Jobs, V3 Public/External/Token, V4 Operations, and V5 Platform desktop. It is scoped to Figma/screen-flow production only; it does not expand replacement approval or backend/API readiness.
- `v0-auth-token-session-contract-closeout.md` records the current V0 auth/token/session contract closeout for backend handoff. It narrows auth blockers but does not approve any route beyond the already scoped `/logout` evidence record.

## Post-cleanup documentation semantics

Use these rules when comparing docs to source so future audits do not reopen false gaps:

- **Canonical routes** are the paths registered in `src/lib/routing/route-contracts.ts`, `src/app/router.tsx`, and `src/lib/routing/route-metadata.ts`. Shorthand examples in docs that use `{id}`, `$id`, `...`, `*`, query strings, or optional suffixes are aliases/examples unless this package explicitly marks them as canonical.
- **Capabilities have categories and canonical names**. Not every capability in `capabilities.md` is expected to appear as a route metadata `requiredCapability`; action, navigation, resolver, notification, and telemetry-safe internal capabilities can be consumed inside pages/helpers instead. Documentation should use canonical runtime names such as `canViewNotifications`, `canUseInbox`, `canViewUserSettings`, and `canOpenAccountArea`; dashboard re-entry is resolver/fallback behavior rather than a standalone route capability.
- **Fixture-backed code can be implementation evidence** when it is an explicit replaceable adapter seam with tests for loading/ready/unavailable/degraded/retry/terminal/unknown-contract states. It is not evidence of a missing backend API unless the owning spec requires a confirmed API contract.

## Recommended reading order

### 1. Start here: scope and target architecture

1. `roadmap.md` — release slicing, journey priority, and release gates
2. `architecture.md` — target technical architecture and execution contract

### 2. Then define what exists

3. `domains.md` — definitive domain boundaries and dependencies
4. `modules.md` — implementation modules inside each domain
5. `screens.md` — executable route/screen manifest with personas, capabilities, flags, and release targets

### 3. Then define how access and routing work

6. `access-model.md` — canonical access categories and precedence rules
7. `capabilities.md` — `canXxx` catalog, decision layers, and deny behavior
8. `notification-destinations.md` — typed notification destination contract
9. `navigation-and-return-behavior.md` — deep-link, refresh, back, and close/cancel behavior
10. `observability.md` — observability model, telemetry layers, and capture rules
11. `telemetry-events.md` — event taxonomy
12. `correlation-id-policy.md` — correlation creation and propagation policy
13. `aws-observability-strategy.md` — recommended AWS-backed observability approach
14. `observability-implementation-plan.md` — R0 implementation order for telemetry, boundaries, and AWS activation
15. `testing.md` — current Vitest + Testing Library + Playwright contract
16. `security.md` — browser-side header and request-hardening baseline
17. `localization-strategy.md` — i18n and Crowdin readiness strategy for the app
18. `i18n-implementation-plan.md` — concrete implementation plan for i18n runtime, locale files, and Crowdin sync
19. `skills.md` — recommended repository-local AI skills for planning and implementation
20. `release-skill-workflow.md` — skill usage by release phase (`R0`, `R1`, `R2`)
21. `implementation-readiness-checklist.md` — go/no-go checklist before implementation starts
22. `r0-execution-plan.md` — final R0 execution record and handoff into `R1`
23. `r0-code-closeout-checklist.md` — final executable closeout evidence for R0

### 4. Then move into the next implementation slice

24. `r0-route-registration-plan.md` — reference contract that later slices should extend, not redefine
25. `conventions.md` — coding conventions and default implementation patterns
26. `adrs/README.md` — durable architectural decisions that should not be re-debated feature-by-feature
27. `roadmap.md` + `modules.md` + `screens.md` — primary starting point for Candidate (`R2`) and later slices
28. `r4-master-plan.md` — consolidated sequencing, dependencies, and first-change queue for `R4`
29. `r4-*-open-points.md` — per-area R4 closeout registers, including decisions implemented and product depth intentionally deferred
30. `r5-decision-register.md` — decision register for platform and long-tail planning before opening executable `R5` changes
31. `r5-master-plan.md` — consolidated R5 sequencing and first OpenSpec queue
32. `r5-sysadmin-open-points.md` — SysAdmin foundation, master-data, users, favorite-request, and taxonomy decisions
33. `r5-requisition-authoring-open-points.md` — requisition authoring and hiring-flow workflow boundary decisions
34. `r5-settings-and-token-open-points.md` — settings leftovers, public/token leftovers, and integration token reconciliation decisions
35. `provider-specific-integrations-depth-plan.md` — post-R5 provider-specific integrations setup depth plan
36. `provider-readiness-operational-gates-plan.md` — completed operational gate baseline
37. `calendar-scheduling-operational-depth-plan.md` — completed calendar scheduling operational-depth baseline
38. `job-board-publishing-operational-depth-plan.md` — completed job-board publishing operational-depth baseline
39. `hris-requisition-operational-depth-plan.md` — completed HRIS requisition operational-depth baseline
40. `messaging-communication-operational-depth-plan.md` — completed messaging communication operational-depth baseline
41. `integration-operational-depth-sequence-plan.md` — synchronized operational-depth implementation sequence
42. `survey-review-scoring-operational-depth-plan.md` — completed survey/review/scoring operational-depth baseline
43. `ats-candidate-source-operational-depth-plan.md` — completed ATS candidate source operational-depth baseline
44. `integration-operational-depth-closeout.md` — final validation, safety, diff, and PR handoff evidence for the operational-depth wave
45. `screen-design-flow-matrix.md` — active contract-first route/flow/state/design-readiness matrix for high-risk operational screens before Figma handoff
46. `pre-figma-flow-review.md` — mandatory pre-Figma gate covering every route row from `screens.md`, including aliases/reference rows, completed contract review, and the visual-readiness pass
47. `v0-auth-shell-dashboard-visual-contract.md` — first visual-readiness package for auth, shell, dashboard, notifications, and inbox before Figma frames are produced
48. `v1-jobs-visual-contract.md` — visual-readiness package for jobs list, authoring, detail, task overlays, and requisition routes before Figma frames are produced
49. `v2-candidates-visual-contract.md` — visual-readiness package for candidate hub, database, action launchers, and panel boundaries before Figma frames are produced
50. `v3-public-external-token-visual-contract.md` — visual-readiness package for public/external and integration token-entry flows before Figma frames are produced
51. `v4-operations-visual-contract.md` — visual-readiness package for settings, integrations admin, reports, billing, team, favorites, and marketplace before Figma frames are produced
52. `v5-sysadmin-platform-visual-contract.md` — visual-readiness package for SysAdmin/platform users, queues, master data, subscriptions, and taxonomy before Figma frames are produced
53. `visual-evidence-capture-plan.md` — operational plan for capturing current/legacy visual evidence before promoting rows to `Figma-ready`
54. `visual-evidence-v0-auth-shell-dashboard.md` — captured V0 evidence log for primary login, dashboard, logout, notifications, inbox, and deferred auth/token states
55. `visual-evidence-v1-jobs.md` — captured V1 evidence log for jobs list, authoring, detail, task overlays, and requisition route-state bases
56. `visual-evidence-v2-candidates.md` — captured V2 evidence log for candidate database/detail/action routes, including legacy references and side-by-side parity blockers
57. `visual-evidence-v2-candidates-recapture-2026-04-22-parity-pass.md` — greenfield V2 recapture after the first explicit legacy-parity pass, now seeded with comparable Finn/Diego/API-seed data; current-app evidence only, not final parity signoff
58. `visual-evidence-v3-public-external-token.md` — completed V3 evidence log for public/external and integration token screen-flow bases
59. `visual-evidence-v4-operations.md` — first-pass current-app evidence log for settings, integrations admin, reports, billing, team, favorites, and marketplace route-state bases
60. `visual-evidence-v5-sysadmin-platform.md` — first-pass current-app evidence log for SysAdmin/platform route-state bases
61. `v1-v5-roadmap-review-2026-04-22.md` — audit closeout for the completed V1-V5 roadmap pass, including verification commands, item-level status, and remaining Figma/backend follow-ups
62. `figma-screen-flow-handoff-index.md` — consolidated V0-V5 Figma/screen-flow handoff index for evidence-covered drafting rows, with V2 parity-blocked and only focused `/logout` and `/forgot-password` replacement approvals granted
63. `figma-handoff-released-areas-change.md` — active Figma production change for V0 partial, V1, V3, V4, and V5 desktop handoff work, keeping V2 excluded and replacement approval blocked except `/logout`
64. `backend-api-contract-backlog.md` — V0-V5 backend/API/provider/schema blocker backlog for the next implementation phase, keeping backend readiness separate from Figma drafting and replacement approval
65. `backend-api-contract-change-plan.md` — active planning package for closing Auth/token/session, Notifications/inbox, Jobs/Candidates, provider/upload/download, and V4/V5 admin schema contracts
66. `backend-api-contract-auth-token-session.md` — Phase 1 backend-facing Auth/token/session contract draft with current frontend calls, target envelopes, open backend decisions, and safety rules
67. `backend-api-contract-notifications-inbox.md` — Phase 2 backend-facing Notifications/inbox contract draft with typed destinations, read-state mutation, inbox transport, send/retry semantics, and deliverability readiness
68. `backend-api-contract-jobs-candidates.md` — Phase 3 backend-facing Jobs and Candidates aggregate/mutation contract draft with list/detail aggregates, task/action mutations, uploads, parent-refresh semantics, and safety rules
69. `backend-api-contract-provider-upload-download.md` — Phase 4 backend-facing provider readiness/setup and upload/download primitive contract draft with public/token callbacks, report export delivery, payment challenge boundaries, and safety rules
70. `backend-api-contract-admin-v4-v5-schemas.md` — Phase 5 backend-facing V4/V5 admin schema contract draft with Settings, Reports, Billing, Team, Favorites, Marketplace, SysAdmin/platform schemas, and safety rules
71. `replacement-approval-audit-v0-v5.md` — V0-V5 replacement approval checklist, including backend/API readiness, visual parity readiness, responsive readiness, product-exception needs, and the recommended first approval target
72. `replacement-approval-evidence-template.md` — reusable evidence-pack template/checklist for future replacement approval records; the template itself does not grant approval
73. `replacement-evidence-v0-logout.md` — first focused V0 `/logout` replacement evidence record; decision is Pixel-parity-approved for `/logout` only
74. `auth-replacement-readiness-inventory.md` — OpenSpec-driven inventory of auth route/state replacement-readiness classifications and blockers
75. `replacement-evidence-v0-forgot-password.md` — focused V0 `/forgot-password` evidence record with same-run captures; decision is Pixel-parity-approved for `/forgot-password` only
76. `replacement-evidence-v0-auth-entry.md` — focused V0 auth-entry evidence record; decision remains blocked
77. `replacement-evidence-v0-reset-password.md` — focused V0 reset-password evidence record; decision remains blocked
78. `replacement-evidence-v0-confirm-registration.md` — focused V0 confirm-registration evidence record; decision remains blocked
79. `replacement-evidence-v0-register-invite-token.md` — focused V0 register/invite-token evidence record; decision remains blocked
80. `replacement-evidence-v0-provider-callbacks.md` — focused V0 provider callback evidence record; decision remains blocked
81. `replacement-evidence-v0-session-loss.md` — focused V0 session-loss evidence record; decision remains blocked

## Package roles

| Document | Primary role |
|---|---|
| `roadmap.md` | defines why and when |
| `architecture.md` | defines how the target frontend is built |
| `domains.md` | defines ownership boundaries |
| `modules.md` | defines implementation slices |
| `screens.md` | defines what must be routed and shipped |
| `access-model.md` | defines access categories and precedence |
| `capabilities.md` | defines concrete capability decisions |
| `notification-destinations.md` | defines notification destination typing |
| `navigation-and-return-behavior.md` | defines browser and return-path behavior |
| `observability.md` | defines telemetry layers and observability rules |
| `telemetry-events.md` | defines the initial event taxonomy |
| `correlation-id-policy.md` | defines correlation id creation and propagation |
| `aws-observability-strategy.md` | defines the recommended AWS observability mapping |
| `observability-implementation-plan.md` | defines the R0 delivery order for observability |
| `testing.md` | defines the current testing contract and validation commands |
| `security.md` | defines the browser-side security and request-hardening baseline |
| `localization-strategy.md` | defines the i18n and Crowdin readiness contract |
| `i18n-implementation-plan.md` | defines the concrete implementation order for i18n and Crowdin sync |
| `skills.md` | defines the recommended repository-local skill shortlist |
| `release-skill-workflow.md` | defines how the skill shortlist should be used across `R0`, `R1`, and `R2` |
| `implementation-readiness-checklist.md` | defines the go/no-go checklist before implementation starts |
| `r0-execution-plan.md` | records the final R0 execution state and R1 handoff |
| `r0-code-closeout-checklist.md` | records the executable closeout evidence for R0 |
| `r0-route-registration-plan.md` | defines the minimum R0 route-registration contract |
| `conventions.md` | defines implementation conventions and default patterns |
| `figma-handoff-released-areas-change.md` | defines the active Figma/screen-flow production change for the currently released V0 partial, V1, V3, V4, and V5 desktop areas |
| `r5-decision-register.md` | records R5 platform and long-tail decisions before executable planning starts |
| `r5-master-plan.md` | consolidates R5 sequencing, dependencies, and first OpenSpec queue |
| `r5-sysadmin-open-points.md` | records SysAdmin open decisions before R5 platform implementation starts |
| `r5-requisition-authoring-open-points.md` | records requisition authoring and hiring-flow workflow open decisions before R5 implementation starts |
| `r5-settings-and-token-open-points.md` | records settings leftovers, public/token leftovers, and integration token reconciliation decisions before R5 implementation starts |
| `provider-specific-integrations-depth-plan.md` | records the next authenticated integrations setup-depth package after R4/R5 closeout |
| `provider-readiness-operational-gates-plan.md` | defines the operational follow-up that consumes provider readiness in scheduling, publishing, and HRIS workflow routes |
| `calendar-scheduling-operational-depth-plan.md` | defines the scoped authenticated job/candidate scheduling lifecycle, conflict/retry, submitted parent-refresh intent, and safety boundaries |
| `job-board-publishing-operational-depth-plan.md` | defines the scoped Job Authoring and Job Listings publishing lifecycle, retry, partial outcome, public-reflection intent, and safety boundaries |
| `hris-requisition-operational-depth-plan.md` | defines the scoped HRIS requisition sync, mapping drift, workflow drift separation, route ownership, and safety boundaries |
| `messaging-communication-operational-depth-plan.md` | defines the scoped authenticated inbox, notification entry, candidate handoff, send/retry/stale refresh, and external chat separation boundaries |
| `contract-signing-operational-depth-plan.md` | scopes authenticated candidate/job contract signing states, downstream signer separation, and parent refresh intent |
| `ats-assessment-provider-setup-depth-plan.md` | records the implemented ATS and assessment authenticated provider setup expansion while keeping custom provider setup deferred |
| `survey-review-scoring-operational-depth-plan.md` | defines the scoped survey/review/scoring readiness, submit/retry, terminal read-only, scoring refresh, public-boundary, and telemetry baseline |
| `ats-candidate-source-operational-depth-plan.md` | defines the scoped ATS source identity, import/sync, duplicate, stale-source, jobs status-only, and telemetry baseline |
| `integration-operational-depth-sequence-plan.md` | synchronizes all post-gate operational-depth changes, flow boundaries, validation rules, and sequencing |
| `integration-operational-depth-closeout.md` | records final validation results, safety review, deferred items, and PR-ready handoff for the operational-depth wave |
| `screen-design-flow-matrix.md` | maps high-risk screens to route ownership, flow states, telemetry, parent return, and design-reference status |
| `pre-figma-flow-review.md` | tracks route-by-route review readiness and blocks Figma production until flow contracts, state coverage, parent return, API/data expectations, telemetry safety, and visual reference status are confirmed |
| `v0-auth-shell-dashboard-visual-contract.md` | defines the first visual-readiness package for the R0 auth/shell/dashboard anchor flows before canonical Figma frames are created |
| `v1-jobs-visual-contract.md` | defines the visual-readiness package for jobs list/detail/authoring/task-overlay/requisition flows before canonical Figma frames are created |
| `v2-candidates-visual-contract.md` | defines the visual-readiness package for candidate hub/database/action-launcher/panel flows before canonical Figma frames are created |
| `v3-public-external-token-visual-contract.md` | defines the visual-readiness package for public/external and integration token-entry flows before canonical Figma frames are created |
| `v4-operations-visual-contract.md` | defines the visual-readiness package for operational authenticated-shell modules before canonical Figma frames are created |
| `v5-sysadmin-platform-visual-contract.md` | defines the visual-readiness package for SysAdmin/platform routes before canonical Figma frames are created |
| `visual-evidence-capture-plan.md` | defines the evidence schema, capture order, and promotion rules for moving rows from `Contract-reviewed` to `Figma-ready` |
| `visual-evidence-v0-auth-shell-dashboard.md` | records V0 current/legacy screenshot evidence, local seed scope, accepted fixture-backed decisions, deferred states, and sub-block Figma-ready decisions |
| `visual-evidence-v1-jobs.md` | records V1 current/legacy screenshot evidence, accepted jobs fixture/reference decisions, deferred provider/form/schema details, and Figma-ready screen-flow decisions |
| `visual-evidence-v2-candidates.md` | records V2 current/legacy screenshot evidence, candidate alias/reference decisions, side-by-side parity blockers, and remaining work before final Figma-ready promotion |
| `visual-evidence-v2-candidates-recapture-2026-04-22-parity-pass.md` | records the current greenfield recapture after the first V2 parity pass for database density, detail legacy modal entries, route-owned action modal surfaces, and comparable Finn/Diego/API-seed capture data; it is not legacy parity signoff |
| `visual-evidence-v3-public-external-token.md` | records V3 desktop, mobile, narrow, lifecycle, and follow-up evidence for public/external and integration token flows, plus deferred backend/API unknowns for Figma annotation |
| `visual-evidence-v4-operations.md` | records V4 authenticated baseline and safe local-fixture interaction screenshot evidence, captured route/state families, deferred product-depth/backend/API unknowns, and the Figma-ready decision for current-app screen-flow bases; replacement approval still requires legacy pixel-parity signoff where legacy screens exist |
| `visual-evidence-v5-sysadmin-platform.md` | records V5 first-pass current-app screenshot evidence and 2026-04-23 state-hook screenshot evidence for SysAdmin/platform routes, backend/API unknowns, and the desktop current-app Figma-ready decision |
| `v1-v5-roadmap-review-2026-04-22.md` | records the V1-V5 audit result, validation commands, release-by-release verification matrix, and follow-ups before deeper Figma/backend work |
| `figma-screen-flow-handoff-index.md` | consolidates the Figma/screen-flow handoff rows for every V0-V5 area that is evidence-covered and allowed for drafting, while explicitly excluding V2 and preserving replacement-approval blockers |
| `backend-api-contract-backlog.md` | records the actionable V0-V5 backend/API/provider/schema blocker matrix and recommended backend decision order for the next implementation phase |
| `backend-api-contract-change-plan.md` | records the planned execution package, phase order, acceptance criteria, deliverables, and task list for closing backend/API/provider/schema contracts |
| `backend-api-contract-auth-token-session.md` | records the Phase 1 backend-facing Auth/token/session contract draft, including current frontend calls, target envelopes, open decisions, telemetry/security rules, and remaining blockers |
| `backend-api-contract-notifications-inbox.md` | records the Phase 2 backend-facing Notifications/inbox contract draft, including typed destination DTOs, notification read-state mutation, inbox conversation/send contracts, deliverability readiness, realtime policy, and safety rules |
| `backend-api-contract-jobs-candidates.md` | records the Phase 3 backend-facing Jobs and Candidates aggregate/mutation contract draft, including list/detail aggregates, draft persistence, task/action mutations, candidate database/detail APIs, upload phases, parent-refresh semantics, and safety rules |
| `backend-api-contract-provider-upload-download.md` | records the Phase 4 backend-facing provider readiness/setup and upload/download primitive contract draft, including provider setup mutations, readiness handoff, public/token callbacks, file-transfer lifecycles, report export delivery, payment challenge boundaries, and safety rules |
| `backend-api-contract-admin-v4-v5-schemas.md` | records the Phase 5 backend-facing V4/V5 admin schema contract draft, including Settings, Reports, Billing, Team, Favorites, Marketplace, platform users, favorite requests, master data, company subscription admin, taxonomy, platform dashboard, and safety rules |
| `replacement-approval-audit-v0-v5.md` | records focused `/logout` and `/forgot-password` replacement approvals and defines the checklist/shortest path for future pixel-parity approval packages |
| `replacement-approval-evidence-template.md` | provides the reusable route/family evidence-pack template for future matched legacy/current/Figma approval records; copying or completing the template does not approve replacement without an explicit final decision |
| `replacement-evidence-v0-logout.md` | records the first route-specific replacement evidence pack; `/logout` is Pixel-parity-approved after login-field parity recapture |
| `auth-replacement-readiness-inventory.md` | records the auth route/state inventory, `/login` alias finding, replacement-readiness classifications, and blockers for OpenSpec change `auth-replacement-readiness-package` |
| `replacement-evidence-v0-forgot-password.md` | records the focused `/forgot-password` same-run evidence pack, scoped runtime parity fixes, source-backed backend enum, and Pixel-parity approval for `/forgot-password` only |
| `replacement-evidence-v0-auth-entry.md` | records the focused auth-entry evidence pack and remaining blockers; it does not approve replacement |
| `replacement-evidence-v0-reset-password.md` | records the focused reset-password evidence pack and remaining blockers; it does not approve replacement |
| `replacement-evidence-v0-confirm-registration.md` | records the focused confirm-registration evidence pack and remaining blockers; it does not approve replacement |
| `replacement-evidence-v0-register-invite-token.md` | records the focused register/invite-token evidence pack and remaining blockers; it does not approve replacement |
| `replacement-evidence-v0-provider-callbacks.md` | records the focused provider callback evidence pack and remaining blockers; it does not approve replacement |
| `replacement-evidence-v0-session-loss.md` | records the focused session-loss evidence pack and remaining blockers; it does not approve replacement |

## Source relationship

- `../../docs/frontend-2/` remains the primary migration-analysis evidence base.
- `recruit-frontend/docs/` is the active greenfield execution package derived from that evidence.
- `../../frontend/` remains the source of truth for current business behavior and pixel-parity visual reference until replacement code is explicitly approved.
- Figma is complementary visual evidence, not the canonical source of route or capability truth.

## Active implementation-depth package note

Use `screen-design-flow-matrix.md` for design/flow readiness and `pre-figma-flow-review.md` as the mandatory gate before Figma production. They complement `screens.md`; they do not replace the route manifest. Active product-depth OpenSpec changes distinguish route registration from complete product behavior. Figma handoff should start only from rows that already define route ownership, state groups, actions, error/retry states, parent return behavior, telemetry boundaries, public/token or provider setup exclusions, data/API expectations, and visual-reference status.

## Current visual evidence status

V0 visual evidence now covers login primary, dashboard, logout, notifications, and inbox sub-blocks. Token-flow, SSO success/exchange, 2FA, and session-loss variants remain deferred until separately captured or explicitly accepted.
