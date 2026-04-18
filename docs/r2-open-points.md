# R2 Open Points

## Purpose

This document lists the unresolved points that must be addressed before `R2 — Candidate` implementation begins.

It is intentionally focused on implementation blockers, interpretation risks, and contract gaps.

## Status

- **Current readiness:** implemented baseline in source
- **Primary reason:** the original planning ambiguity has been resolved, the executable OpenSpec package was created and archived, and the route/capability baseline now exists in `recruit-frontend/src`

## Decision Register

### 1. Missing executable planning package

**Status:** Resolved  
**Priority:** Critical  
**Resolution summary:** The repository had the canonical discovery package for R2 in `docs/frontend-2/` plus the active `recruit-frontend/docs/` execution package. The executable implementation package was later created as `r2-candidate-core`, implemented, and archived.

**Confirmed decision**
- Use `docs/frontend-2/` as the canonical migration-analysis and scope baseline for R2 discovery.
- Use `recruit-frontend/docs/roadmap.md`, `modules.md`, and `screens.md` as the active execution-package baseline for the new app.
- Treat an **OpenSpec change** as mandatory before implementation starts.

**Canonical document set for R2 planning**
- `docs/frontend-2/frontend-migration-scope-statement.md`
- `docs/frontend-2/frontend-mvp-release-wave-definition.md`
- `docs/frontend-2/frontend-wave-1-journey-catalog.md`
- `docs/frontend-2/frontend-candidate-domain-specification.md`
- `docs/frontend-2/frontend-url-and-history-behavior-spec.md`
- `docs/frontend-2/frontend-domain-acceptance-checklists.md`
- `docs/frontend-2/frontend-open-decisions-log.md`
- `recruit-frontend/docs/roadmap.md`
- `recruit-frontend/docs/modules.md`
- `recruit-frontend/docs/screens.md`

**Implementation record**
- OpenSpec change created and completed:
  - `openspec/changes/archive/2026-04-18-r2-candidate-core/`
- Archived artifacts include:
  - `proposal.md`
  - `design.md`
  - `tasks.md`

**Operational rule**
- Discovery and decision resolution continue to use the documents above as the canonical planning baseline.
- Any future expansion of Candidate beyond the implemented R2 baseline should open a new OpenSpec change rather than reopening the archived package.

**Evidence**
- `docs/frontend-2/frontend-migration-documentation-plan.md` defines the canonical ownership map for scope, behavior, target architecture, acceptance gates, and open ambiguity.
- `docs/frontend-2/frontend-mvp-release-wave-definition.md` defines Wave 1 scope, including candidate detail hub and in-scope candidate task flows.
- `recruit-frontend/docs/README.md` and `recruit-frontend/docs/roadmap.md` define the active execution package and identify Candidate (`R2`) as the next slice.

---

### 2. Candidate URL and context model

**Status:** Resolved  
**Priority:** Critical  
**Resolution summary:** The canonical visible candidate hub route remains the contextual route already documented in the migration package.

**Confirmed decision**
- Preserve the candidate detail contract as:
  - `/candidate/:id/:job?/:status?/:order?/:filters?/:interview?`
- Do **not** switch the user-facing R2 contract to `/candidates/:id`.
- Treat the optional context values as part of the product behavior, not incidental implementation detail.
- Direct entry and refresh must reconstruct a usable candidate hub from route parameters and current server state.

**Operational rules**
- `id` is the primary candidate identifier.
- `job`, `status`, `order`, `filters`, and `interview` remain the candidate workflow/context signals for R2.
- Candidate/job/order/filter context must survive cancel/completion when relevant.
- If context cannot be fully reconstructed on refresh, fallback must preserve a stable candidate state rather than dumping the user to dashboard.

**Evidence**
- `docs/frontend-2/frontend-url-and-history-behavior-spec.md`
- `docs/frontend-2/frontend-candidate-domain-specification.md`
- `docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`
- `recruit-frontend/docs/screens.md`

---

### 3. R2 action scope is not frozen

**Status:** Resolved  
**Priority:** Critical  
**Resolution summary:** Freeze R2 scope to the candidate actions and summaries explicitly named by the roadmap and Wave 1 documents.

**Mandatory R2 action family**
- schedule interview
- create offer
- reject
- move-related work
- hire / unhire
- review-related work
- CV upload / replace / preview

**Mandatory R2 candidate-hub support surfaces**
- comments and tags
- forms/documents summary
- contracts summary
- surveys summary
- custom fields
- interview feedback

**Explicit scope rule**
- Candidate owns the hub, action launch points, candidate context, and visible refresh behavior.
- Downstream specialized modules such as full contract sending/signing or forms/document workflows remain downstream modules behind explicit adapters; R2 requires the candidate hub to surface correct status and actionability, not to absorb every downstream subsystem.
- Lower-frequency candidate actions not named in the Wave 1/R2 documents are deferred and must not be silently implied.

**Evidence**
- `recruit-frontend/docs/roadmap.md`
- `docs/frontend-2/frontend-migration-scope-statement.md`
- `docs/frontend-2/frontend-wave-1-journey-catalog.md`
- `docs/frontend-2/frontend-candidate-domain-specification.md`
- `docs/frontend-2/frontend-mvp-release-wave-definition.md`

---

### 4. Task-flow recovery fallback

**Status:** Resolved  
**Priority:** High  
**Resolution summary:** Candidate task-flow recovery falls back to the candidate hub first, with explicit unavailable/missing/denied handling when necessary.

**Confirmed decision**
- If a candidate action route can reconstruct enough candidate/action context, it stays usable after refresh.
- If it cannot reconstruct full task context, it must recover to the relevant candidate hub context.
- It must **not** silently fall back to dashboard or jobs list.

**Fallback policy**
- preferred recovery: candidate hub with preserved candidate/job/workflow context
- if target entity is inaccessible: denied/unavailable state with a route back to an allowed shell destination
- if target entity no longer exists: missing-target recovery to notifications or relevant parent domain

**User-facing rule**
- recovery must explain what was lost
- recovery must preserve the candidate hub whenever possible

**Evidence**
- `docs/frontend-2/frontend-url-and-history-behavior-spec.md`
- `docs/frontend-2/frontend-edge-case-and-exception-catalog.md`
- `docs/frontend-2/frontend-domain-acceptance-checklists.md`

---

### 5. Candidate route inventory and metadata

**Status:** Resolved  
**Priority:** High  
**Resolution summary:** The minimum R2 route inventory is frozen from the screen and URL/history docs.

**Confirmed route inventory**
- candidate detail hub:
  - `/candidate/:id/:job?/:status?/:order?/:filters?/:interview?`
  - class: `PageWithStatefulUrl`
- candidate actions:
  - `/candidate/.../cv/{cv_id}/schedule`
  - `/candidate/.../cv/{cv_id}/offer`
  - `/candidate/.../cv-reject/{cv_id}`
  - class: `TaskFlow`

**Metadata rules**
- each candidate route must have:
  - route id
  - route class
  - domain = `candidates`
  - module ownership
  - direct-entry policy
  - parent-target behavior

**Freeze rule**
- No additional candidate route may be treated as in-scope R2 behavior unless it is added to the route inventory explicitly through the execution package/OpenSpec.

**Evidence**
- `recruit-frontend/docs/screens.md`
- `docs/frontend-2/frontend-url-and-history-behavior-spec.md`
- `docs/frontend-2/frontend-wave-1-journey-catalog.md`

---

### 6. Candidate capability contract

**Status:** Resolved  
**Priority:** High  
**Resolution summary:** Candidate access must use a route-boundary capability model with server-authoritative decisions where business state matters.

**Minimum R2 capability surface**
- `canViewCandidateDetail`
- `canNavigateCandidateSequence`
- `canScheduleInterviewFromCandidate`
- `canCreateOfferFromCandidate`
- `canRejectCandidate`
- `canMoveCandidateStage`
- `canHireCandidate`
- `canRequestCandidateReview`
- `canManageCandidateDocuments`
- `canViewCandidateContracts`
- `canCommentOnCandidate`
- `canTagCandidate`
- `canOpenCandidateConversation`

**Capability rules**
- route guards decide entry
- hubs receive precomputed section/action capability sets
- contextual actions use server-backed capability inputs where business state matters
- unsupported actions are hidden or explained consistently across jobs, candidate, and notifications

**Deny behavior**
- unauthorized candidate routes or actions must fail gracefully
- candidate visibility and action availability must be consistent regardless of entry point

**Evidence**
- `docs/frontend-2/frontend-permission-decision-model.md`
- `docs/frontend-2/frontend-domain-acceptance-checklists.md`
- `recruit-frontend/docs/modules.md`
- `recruit-frontend/docs/screens.md`

---

### 7. Candidate hub aggregate contract

**Status:** Resolved  
**Priority:** High  
**Resolution summary:** `CandidateDetailView` is the canonical frontend-facing aggregate for the candidate hub.

**Confirmed contract**
- `CandidateDetailView` includes:
  - `candidateSummary`
  - `profile`
  - `jobContext`
  - `workflowState`
  - `history`
  - `comments`
  - `formsSummary`
  - `documentsSummary`
  - `contractsSummary`
  - `interviewsSummary`
  - `surveysSummary`
  - `customFields`
  - `scores`
  - `integrations`
  - `entryContext`
  - `availableActions`

**R2 section rule**
- core identity, access, and candidate context are route-critical
- summaries and optional downstream panels may degrade independently
- the hub must remain an operational hub, not a passive profile page

**Evidence**
- `docs/frontend-2/frontend-candidate-domain-specification.md`
- `docs/frontend-2/frontend-data-shape-and-frontend-adapter-inventory.md`
- `docs/frontend-2/frontend-contract-gap-inventory.md`

---

### 8. Candidate action context contract

**Status:** Resolved  
**Priority:** High  
**Resolution summary:** `CandidateActionContext` is the required action-launch contract for candidate actions.

**Confirmed contract**
- `CandidateActionContext` includes:
  - `candidateId`
  - `candidateUuid`
  - `cvId`
  - `cvUuid`
  - `jobId`
  - `jobUuid`
  - `currentStepId`
  - `entryMode`
  - `returnTarget`
  - `permissions`
  - `capabilities`

**Approved entry modes**
- candidate-page
- job-page
- notification
- direct-url
- routed overlay

**Behavior rules**
- candidate actions must define entry, cancel, failure, success, and parent-refresh behavior
- successful action completion must refresh candidate and job state before presenting completion
- cancel/close must return to the correct candidate context

**Evidence**
- `docs/frontend-2/frontend-candidate-domain-specification.md`
- `docs/frontend-2/frontend-wave-1-journey-catalog.md`
- `docs/frontend-2/frontend-edge-case-and-exception-catalog.md`

---

### 9. Section-level partial degradation rules

**Status:** Resolved  
**Priority:** High  
**Resolution summary:** Candidate hub failures are sectional by default, route-fatal only for core access/identity/context failures.

**Confirmed rules**
- optional feature-dependent subsections such as surveys, contracts, documents, or feedback must render subsection-level unavailable states
- one failed panel must not collapse the whole hub by default
- distinguish save failure from refresh failure
- avoid implying consistency when refresh is stale or incomplete

**Route-fatal failures**
- inaccessible candidate
- missing candidate
- route-level identity/access/context cannot be established

**Sectional failures**
- surveys
- contracts
- documents/forms
- feedback
- other downstream summaries

**Evidence**
- `recruit-frontend/docs/roadmap.md`
- `docs/frontend-2/frontend-edge-case-and-exception-catalog.md`
- `docs/frontend-2/frontend-domain-acceptance-checklists.md`

---

### 10. Prev/next navigation contract

**Status:** Resolved  
**Priority:** High  
**Resolution summary:** Prev/next navigation is contextual and depends on route-carried workflow state.

**Confirmed rules**
- ordering/filter context comes from the candidate route context signals:
  - `job`
  - `status`
  - `order`
  - `filters`
  - `interview`
- prev/next is valid when meaningful workflow/navigation context exists
- if ordering context is stale or missing, recompute it or remove invalid navigation affordances
- do not navigate unpredictably when context is degraded

**Operational rule**
- direct entry into candidate detail is valid even without full navigation context
- navigation affordances are contextual, not universal

**Evidence**
- `docs/frontend-2/frontend-candidate-domain-specification.md`
- `docs/frontend-2/frontend-url-and-history-behavior-spec.md`
- `docs/frontend-2/frontend-edge-case-and-exception-catalog.md`
- `recruit-frontend/docs/roadmap.md`

---

### 11. Notification entry normalization

**Status:** Resolved  
**Priority:** Medium  
**Resolution summary:** Candidate notifications normalize to the candidate hub with candidate + job context unless the current notification family is explicitly job-task-oriented.

**Confirmed candidate-hub notification mappings**
- `cv-received`
- `cv-received-integration`
- `cv-answered-forms`
- `interview-accepted`
- `interview-accepted-integration`
- `interview-rejected`
- `interview-rejected-integration`
- `interview-schedule-cancelled-integration`
- `interview-scheduled-integration`

**Normalization rules**
- candidate-hub notifications land on `candidate({ id, job })`
- notifications that are truly job-task-oriented may still land on the job task route
- `referer`-only notification contracts must be replaced with typed destination contracts where feasible

**Fallback behavior**
- inaccessible target: unavailable state with recovery route
- missing target: missing-target state with recovery to notifications or relevant parent domain

**Evidence**
- `docs/frontend-2/frontend-notification-destination-inventory.md`
- `docs/frontend-2/frontend-wave-1-journey-catalog.md`
- `docs/frontend-2/frontend-edge-case-and-exception-catalog.md`

---

### 12. Upload and document truth contract

**Status:** Resolved  
**Priority:** High  
**Resolution summary:** Upload is a workflow, not a field type, and document truth must refresh visibly after upload, delete, replace, or downstream contract/document actions.

**Confirmed workflow**
1. user selects file
2. frontend validates file and permission state
3. upload handshake / signed URL acquisition
4. binary upload
5. metadata persistence / downstream state update
6. candidate summary and preview state refresh

**Parity rules**
- after upload, delete, or replacement, the user must see the latest file state without rediscovering the candidate manually
- if upload succeeds but preview or summary stays stale, parity is not met
- unauthorized or stale preview/download links must surface explicit unavailable/unauthorized behavior

**Evidence**
- `docs/frontend-2/frontend-file-upload-and-document-flow-inventory.md`
- `docs/frontend-2/frontend-candidate-domain-specification.md`
- `recruit-frontend/docs/roadmap.md`

---

### 13. Candidate documents/contracts/forms scope

**Status:** Resolved  
**Priority:** Medium  
**Resolution summary:** R2 includes summaries for forms, documents, and contracts as candidate-hub responsibilities; full downstream workflow ownership remains outside Candidate where already specified.

**Confirmed R2 scope**
- forms/documents summary is required
- contracts summary is required
- visible refresh after successful downstream actions is required

**Boundary rule**
- Candidate owns candidate-facing summary state and actionability
- downstream modules own their specialized workflow internals where the docs already separate ownership

**Evidence**
- `docs/frontend-2/frontend-candidate-domain-specification.md`
- `docs/frontend-2/frontend-file-upload-and-document-flow-inventory.md`
- `recruit-frontend/docs/roadmap.md`

---

### 14. Surveys, custom fields, and interview feedback scope

**Status:** Resolved  
**Priority:** Medium  
**Resolution summary:** Surveys, custom fields, scores, and interview feedback are in-scope R2 candidate surfaces, with subsection degradation allowed when downstream dependencies are unavailable.

**Confirmed scope**
- surveys summary
- custom fields
- scores
- interview feedback

**Behavior rules**
- custom-field edit/persistence is part of the candidate domain responsibilities
- read/write behavior is capability-gated
- downstream absence or feature gating degrades the subsection; it does not collapse the route by default

**Evidence**
- `docs/frontend-2/frontend-candidate-domain-specification.md`
- `recruit-frontend/docs/modules.md`
- `recruit-frontend/docs/roadmap.md`
- `docs/frontend-2/frontend-edge-case-and-exception-catalog.md`

---

### 15. Communication and collaboration baseline

**Status:** Resolved  
**Priority:** Medium  
**Resolution summary:** R2 includes comments, tags, and inbox/message entry as the minimum candidate communication baseline.

**Confirmed baseline**
- comments are mandatory
- tags are mandatory
- inbox/message entry is mandatory as a handoff/navigation concern

**Boundary rule**
- Candidate owns collaboration signals and candidate-context launch points
- Candidate does not absorb shell inbox infrastructure

**Evidence**
- `docs/frontend-2/frontend-candidate-domain-specification.md`
- `recruit-frontend/docs/modules.md`
- `recruit-frontend/docs/roadmap.md`

---

### 16. Validation baseline for R2

**Status:** Resolved  
**Priority:** High  
**Resolution summary:** R2 validation must prove route/history behavior, candidate journeys, permission behavior, notification entry, and visible refresh after actions.

**Required proof**
- route/history coverage:
  - direct URL entry
  - refresh
  - back/close behavior
  - route-carried context restoration
- journey coverage:
  - candidate detail direct entry and context preservation
  - candidate action routes
  - candidate detail → candidate action → visible refresh
  - notifications → candidate target workflow
- access coverage:
  - representative roles
  - feature-gated sections
  - unauthorized route fallback behavior

**Blocking scenarios**
- notification to wrong or inaccessible target
- candidate detail context loss on direct entry
- action-route refresh/close/back breakage
- action completion without visible state refresh

**Evidence**
- `docs/frontend-2/frontend-parity-test-strategy.md`
- `docs/frontend-2/frontend-test-coverage-map.md`
- `docs/frontend-2/frontend-domain-acceptance-checklists.md`

---

### 17. Candidate observability baseline

**Status:** Resolved  
**Priority:** Medium  
**Resolution summary:** Candidate journeys must ship with route/journey telemetry, candidate action events, and correlation-id propagation.

**Required telemetry contract**
- standard context includes:
  - `routeId`
  - `correlationId`
  - journey context
- H-critical journeys emit:
  - `journey_started`
  - meaningful step events where applicable
  - terminal success/failure/cancel event

**Candidate-specific events**
- `candidate_detail_viewed`
- `candidate_sequence_next`
- `candidate_sequence_previous`
- `candidate_action_opened`
- `candidate_action_succeeded`
- `candidate_action_failed`
- `candidate_cv_uploaded`

**Correlation rules**
- create a correlation id for direct entry into a critical H-journey
- propagate `x-correlation-id` through candidate API requests
- preserve correlation across route transitions inside the same journey

**Evidence**
- `recruit-frontend/docs/observability.md`
- `recruit-frontend/docs/telemetry-events.md`
- `recruit-frontend/docs/correlation-id-policy.md`

## Post-Implementation Synchronization Notes

The original route/capability foundation gaps are now closed in source:

- `src/domains/candidates/` now contains executable R2 modules
- candidate routes are registered in `src/app/router.tsx`
- candidate route contracts and metadata exist in:
  - `src/lib/routing/route-contracts.ts`
  - `src/lib/routing/route-metadata.ts`
- candidate capabilities exist in:
  - `src/lib/access-control/types.ts`
  - `src/lib/access-control/evaluate-capabilities.ts`
- typed destination resolution now treats the implemented candidate route family as available

The remaining follow-up deltas are narrower and should be treated as post-R2 scope clarifications rather than missing foundation:

- dedicated Candidate task routes are implemented for:
  - schedule
  - offer
  - reject
- move / hire-unhire / review remain represented in the capability and planning model, but do **not** yet have dedicated route-owned task implementations in the archived R2 baseline
- the current Candidate baseline uses local adapter/store scaffolding for route/bootstrap/demo behavior, so future slices must not assume that recruiter-core and public-external flows already share production-grade backend adapters

## R2 → R3 Synchronization Rules

R3 planning should treat the following Candidate invariants as fixed because they are now implemented:

- candidate detail remains the canonical recruiter-internal hub for candidate context
- candidate route state carries:
  - candidate id
  - optional job/status/order/filters/interview workflow context
- candidate task-flow recovery returns to candidate hub context rather than dashboard/jobs list
- candidate document truth requires visible summary refresh after upload/action completion
- candidate journey telemetry and correlation-id propagation are part of the active recruiter-core baseline

R3 must **not** assume that R2 already delivered:

- public/external candidate-facing route families
- public token lifecycle UI states
- public upload/submission orchestration
- external reviewer/interviewer token flows
- dedicated recruiter-internal move / hire-unhire / review route flows

## Implementation status update

- **Current readiness:** implemented baseline in source
- Candidate routing, candidate task fallback, document refresh behavior, and candidate observability now have executable source and automated validation coverage.
