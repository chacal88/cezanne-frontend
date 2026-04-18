# R3 Open Points

## Purpose

This document captures the unresolved points that must be clarified before `R3 — Public + external` implementation starts.

It is intentionally focused on scope boundaries, route ownership, token behavior, upload/submission contracts, and public-vs-internal separation.

## Status

- **Current readiness:** first-slice baseline implemented; broader R3 family still incomplete
- **Primary reason:** the first public/application slice is now archived and implemented in source, but additional `R3` families still need planning or execution alignment

## Canonical Source Baseline

Use these documents as the primary baseline for R3 discovery:

- `recruit-frontend/docs/roadmap.md`
- `docs/frontend-2/frontend-wave-2-and-wave-3-journey-catalog.md`
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `docs/frontend-2/frontend-migration-rollout-plan.md`
- `docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`
- `docs/frontend-2/frontend-file-upload-and-document-flow-inventory.md`
- `docs/frontend-2/frontend-contract-gap-inventory.md`
- `docs/frontend-2/frontend-edge-case-and-exception-catalog.md`

## Open Points

### 1. Missing executable planning package

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- The first executable R3 change, when opened, should target the frozen first public slice only.

**Confirmed decision**
- The first R3 change should be scoped to:
  - public job presentation
  - public application submission
  - public survey continuation
- It should not include:
  - external reviewer/interviewer token flows
  - careers/application/job-listing publishing
  - provider callbacks
- A future change name should follow this scope, for example:
  - `r3-public-application-slice`

**Operational note**
- The OpenSpec package does not exist yet, but the planning decision for what that first package must cover is now frozen.
- `R2` is now implemented and archived, so the first R3 package should treat the recruiter-internal candidate baseline as an existing dependency rather than a moving target.

---

### 2. R3 scope boundary is not frozen

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- While `R2` is still in implementation, freeze the **first executable R3 slice** as:
  - **public application**
  - **public survey continuation**
- Do **not** include tokenized reviewer/interviewer flows or careers/application/job-listing publishing in the first R3 change.

**Confirmed decision**
- Treat R3 as a family of external/public slices, not one oversized implementation package.
- The first R3 change should focus on the public candidate-facing application boundary because it is:
  - clearly documented
  - strongly separated from the authenticated recruiter shell
  - already defined as a standalone slice in the migration package
- Tokenized external review/interview journeys remain a follow-up R3 change.
- Careers/application/job-listing publishing remains a follow-up R3 change or later Wave 2 extraction decision.

**Why this is the correct first slice**
- `docs/frontend-2/frontend-wave-2-and-wave-3-journey-catalog.md` separates:
  - public application and survey intake
  - external collaboration/tokenized reviewer journeys
  - settings-adjacent domains
- `docs/frontend-2/frontend-public-application-slice-specification.md` already defines a complete standalone boundary for:
  - shared job views
  - application submission
  - survey continuation
  - upload-sensitive behavior
  - public completion/recovery states
- `docs/frontend-2/frontend-migration-rollout-plan.md` describes later-wave rollout as selected domain expansion, not one mandatory all-at-once package.
- `recruit-frontend/docs/roadmap.md` groups public/external surfaces under R3 as a release family, but does not require them to be implemented in one change.

**Scope included in the first R3 slice**
- shared/public job presentation
- public application entry
- application submission
- public upload workflow
- public completion/recovery states
- survey continuation where publicly entered

**Scope explicitly excluded from the first R3 slice**
- external interview request
- external review-candidate
- external interview-feedback
- requisition approval token flows
- provider integration callbacks
- careers/application/job-listing settings and publishing

**Operational rule after R2 completion**
- R3 planning and OpenSpec authoring may proceed against the implemented R2 baseline.
- R3 should reuse only the cross-slice primitives that are already explicit in source or docs; it should not retroactively widen the archived R2 scope.

**Evidence**
- `docs/frontend-2/frontend-wave-2-and-wave-3-journey-catalog.md`
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `docs/frontend-2/frontend-migration-rollout-plan.md`
- `docs/frontend-2/frontend-mvp-release-wave-definition.md`
- `recruit-frontend/docs/roadmap.md`

---

### 3. Public slice vs authenticated shell boundary

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- The first R3 slice is a **public/public-token boundary outside the authenticated recruiter shell**.
- For implementation planning, treat it as a **separate layout in the same app/repo**, with strong architectural boundaries and no dependency on recruiter-shell state.
- This decision does **not** require a separate deployable app now; it preserves that option for later extraction.

**Confirmed decision**
- Public routes use a dedicated public/external layout, not authenticated shell chrome.
- Public routes do not inherit:
  - recruiter navigation state
  - internal notifications/inbox context
  - recruiter-role permission assumptions
  - hidden shell/global state for route reconstruction
- Public routes are modeled as `Public/Token` routes with their own error model and direct-entry contract.

**Allowed sharing**
- shared low-level primitives are allowed:
  - `src/lib/**`
  - `src/ui/**`
  - shared i18n/runtime helpers where they are shell-agnostic
- public routes must not import from `src/shell/**`
- public progress state, draft state, upload progress, and submission state belong to the public slice boundary

**Execution rule**
- implement the first R3 slice inside the existing repo/app structure
- enforce the boundary through layout separation and import discipline
- leave future extraction into a dedicated public-web app as a later optimization, not a prerequisite for the first R3 slice

**Why this remains the correct decision after R2 completion**
- it keeps the public slice independent from the authenticated recruiter shell that already exists in source
- it still freezes the most important R3 invariant: public flows must stand on their own and must not depend on recruiter-shell context

**Evidence**
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `recruit-frontend/docs/architecture.md`
- `recruit-frontend/docs/roadmap.md`
- `docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`

---

### 4. External shell contract is not explicit enough

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Freeze one **external/public shell contract** for the first R3 slice: a dedicated public layout with public-state ownership, separate from the authenticated shell.

**Confirmed decision**
- The first R3 slice uses one dedicated public/external layout contract.
- That layout owns:
  - public route framing
  - public recovery and completion messaging
  - public-facing validation and error presentation
- It does not own:
  - recruiter navigation
  - recruiter account state
  - recruiter notifications/inbox state

**Forward-compatibility rule**
- later tokenized external routes may reuse the same public/external shell contract
- they may specialize content states, but they should not invent a second authenticated-style shell model

**Evidence**
- `recruit-frontend/docs/roadmap.md`
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `recruit-frontend/docs/architecture.md`

---

### 5. Token lifecycle contract must be frozen

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- Freeze one uniform token lifecycle model across the first R3 slice.
- Every public/token route must distinguish these token states explicitly:
  - `valid`
  - `invalid`
  - `expired`
  - `used`
  - `inaccessible`
- These states must not collapse into one generic error state.

**Confirmed route-level behavior**
- `valid`
  - route boots normally and loads the public/tokenized workflow
- `invalid`
  - show a distinct invalid-entry state
  - provide a recovery path that matches the route family
- `expired`
  - show a distinct expired-entry state
  - provide next-step guidance or retry/restart where appropriate
- `used`
  - show a distinct already-used state when the flow semantics support one-time completion
  - do not pretend the flow is still actionable
- `inaccessible`
  - show a distinct unavailable/inaccessible state
  - do not leak internal ownership assumptions or shell navigation

**Uniformity rule**
- token lifecycle behavior is part of the `Public/Token` route class contract
- the visible meaning of `invalid`, `expired`, `used`, and `inaccessible` must be consistent across:
  - public application entry
  - public survey continuation
  - later tokenized external routes

**Recovery rule for the first R3 slice**
- public application and survey routes must define stable public recovery states
- they must not hand off implicitly to recruiter-shell destinations
- retry/restart guidance may differ by flow, but token-state labels must remain distinct

**Why this is the correct decision now**
- it freezes a cross-slice public contract without forcing implementation of later tokenized reviewer/interviewer flows into the first public slice
- it matches the explicit roadmap gate for R3 and avoids a later redesign of public error states

**Evidence**
- `recruit-frontend/docs/roadmap.md`
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`
- `docs/frontend-2/frontend-edge-case-and-exception-catalog.md`

---

### 6. Public route inventory is not frozen

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Freeze the first R3 slice to exactly three public route families:
  - `/shared/{jobOrRole}/:token/:source`
  - `/{jobOrRole}/application/:token/:source`
  - `/surveys/:surveyuuid/:jobuuid/:cvuuid`
- All three are treated as `Public/Token` routes outside the authenticated shell.

**Confirmed route inventory for the first R3 slice**
1. **Public job presentation**
   - `/shared/{jobOrRole}/:token/:source`
2. **Public application submission**
   - `/{jobOrRole}/application/:token/:source`
3. **Public survey continuation**
   - `/surveys/:surveyuuid/:jobuuid/:cvuuid`

**Route-class decision**
- each route family is classified as `Public/Token`
- none of them inherit authenticated shell behavior
- none of them are `ShellOverlay`, `RoutedOverlay`, or internal `TaskFlow` routes

**Behavior rules**
- direct URL entry is required
- browser refresh is required
- invalid/expired/inaccessible token handling is required where applicable
- completion behavior must be explicit and public-slice-owned
- route-carried context such as token, source, survey id, job id, and candidate id remains part of the contract

**Explicit exclusion from the first R3 route inventory**
- `/interview-request/:scheduleUuid/:cvToken`
- `/review-candidate/:code`
- `/interview-feedback/:code`
- any requisition approval token route
- provider callback routes

**Operational rule**
- if a public/external route family is not listed above, it is not part of the first R3 change
- later tokenized external flows remain follow-up R3 planning items

**Evidence**
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`
- `recruit-frontend/docs/roadmap.md`

---

### 7. Public bootstrap contract is not yet executable

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Freeze the first R3 slice as **route-owned public bootstrap**.
- Each public route must bootstrap from its own route-carried context and downstream public contracts only.
- No public route may require authenticated-shell bootstrap, hidden recruiter state, or recruiter session context to render correctly after direct entry or refresh.

**Minimum bootstrap contract by route family**
1. **Public job presentation**
   - required route context:
     - `jobOrRole`
     - `token`
     - `source`
   - must load:
     - public job presentation state
     - route-validity/token state
     - application-entry availability

2. **Public application submission**
   - required route context:
     - `jobOrRole`
     - `token`
     - `source`
   - must load:
     - public application schema/defaults
     - route-validity/token state
     - upload/submission readiness inputs

3. **Public survey continuation**
   - required route context:
     - `surveyuuid`
     - `jobuuid`
     - `cvuuid`
   - must load:
     - survey continuation schema/state
     - route-validity/token state
     - public progress/completion eligibility

**Bootstrap rules**
- route state owns public context
- direct URL entry is first-class
- browser refresh is first-class
- candidate-facing progress state is local to the public slice
- public completion state must be explicit and public-slice-owned

**Bootstrap failure states**
- invalid token
- expired token
- inaccessible/unavailable entry
- unavailable job / closed application
- schema/bootstrap load failure with explicit retry or recovery state

**Execution rule**
- the route must finish enough bootstrap work before rendering the core public workflow UI
- if bootstrap cannot establish a valid public context, render a public recovery/error state instead of partial recruiter-oriented UI

**Why this is the correct decision now**
- it freezes the behavioral contract needed for R3 planning without forcing repository splits or touching the R2 internal shell implementation
- it aligns with the already-documented requirement that public routes be true first-class direct-entry routes

**Evidence**
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`
- `recruit-frontend/docs/roadmap.md`

---

### 8. Upload and submission workflow contract is not frozen

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- Freeze public application upload/submission as one coherent workflow rather than separate utilities.
- The first R3 slice treats attachments, metadata persistence, and submission completion as one public task-flow contract.

**Confirmed workflow stages**
1. file selection
2. validation
3. upload handshake / signed URL acquisition
4. binary upload
5. metadata persistence or inclusion in submission payload
6. visible submission/completion state refresh

**Core rule**
- Public application parity is not met unless upload, validation, submission, retry, and visible completion state behave coherently together.

**Recovery and retry rules**
- upload failures are recoverable within the same public route state
- submission failures are recoverable within the same public slice
- successful submission must resolve to one stable public completion state
- completion must not hand off implicitly to recruiter-shell ownership

**Adapter rule**
- public application requires:
  - a public-facing view-model adapter
  - a submission serializer
  - an upload workflow abstraction
- signed URL mechanics, raw binary upload, and metadata persistence must not leak into page-level UI logic

**Parity rules**
- submitted application must reflect uploaded files and validation outcomes
- if upload succeeds but metadata is lost or completion state drifts, parity is not met
- preview/download/delete behavior for public-facing attachments must be treated as first-class where the public flow exposes them

**Evidence**
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `docs/frontend-2/frontend-file-upload-and-document-flow-inventory.md`
- `docs/frontend-2/frontend-data-shape-and-frontend-adapter-inventory.md`

---

### 9. Public completion/recovery state is not frozen

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Freeze public completion and recovery as public-slice-owned route states.
- The first R3 slice must expose explicit outcome states instead of implicit redirects or recruiter-shell handoffs.

**Required outcome states**
1. **Success**
   - one stable public completion state after successful application submission or successful public survey completion
   - must be direct-entry stable if re-opened through the same route outcome

2. **Retryable failure**
   - submission, upload, or bootstrap failure that can be retried in place
   - must preserve as much user progress as is safe within the public slice

3. **Invalid token/context**
   - distinct invalid-entry state

4. **Expired token/context**
   - distinct expired-entry state with next-step guidance

5. **Inaccessible / unavailable**
   - distinct state when the target exists but is not available to this public route

6. **Unavailable job / closed application**
   - distinct public-facing closed/unavailable state for job/application entry routes

**Behavior rules**
- completion must be page/state based, not modal dependent
- completion must not hand off implicitly to the authenticated recruiter shell
- retry must remain within the public slice where the failure is recoverable
- recovery messaging must be public-facing and self-contained

**Why this is the correct decision now**
- it completes the first public-route contract without forcing implementation of later external token flows
- it aligns with the public-application spec requirement that success, failure, retry, and invalid-entry states be first-class behaviors

**Evidence**
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `docs/frontend-2/frontend-edge-case-and-exception-catalog.md`
- `recruit-frontend/docs/roadmap.md`

---

### 10. Survey continuation ownership needs confirmation

**Status:** Resolved  
**Priority:** Medium

**Resolution summary**
- Publicly entered survey continuation is part of the **first R3 slice**.
- It shares the same public boundary, layout discipline, bootstrap rules, and token-state model as the public application slice.

**Confirmed decision**
- `/surveys/:surveyuuid/:jobuuid/:cvuuid` is in-scope for the first R3 change.
- Survey continuation is owned by the public slice when entered publicly.
- It does not inherit recruiter-shell assumptions, candidate-detail assumptions, or hidden internal context.

**Route-context preservation rules**
- preserve:
  - `surveyuuid`
  - `jobuuid`
  - `cvuuid`
- these identifiers are part of the route contract and must survive direct entry and refresh

**Behavior rules**
- survey continuation has its own bootstrap and invalid-entry states
- survey/custom-field schema handling remains part of the public slice adapter/rendering contract
- completion/recovery remains public-slice-owned

**Evidence**
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`

---

### 11. External reviewer/interviewer flow scope is not frozen

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- External reviewer/interviewer tokenized flows are **not** part of the first R3 change.
- They remain a follow-up R3 planning family under the same public/token lifecycle framework.

**Confirmed out-of-scope routes for the first R3 change**
- `/interview-request/:scheduleUuid/:cvToken`
- `/review-candidate/:code`
- `/interview-feedback/:code`

**Future-slice rule**
- these routes should reuse:
  - the public/token route class
  - the five-state token lifecycle model
  - the public/external shell contract
- but they require their own dedicated journey, retry, and submission contracts before implementation

**Evidence**
- `docs/frontend-2/frontend-wave-2-and-wave-3-journey-catalog.md`
- `docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`
- `recruit-frontend/docs/roadmap.md`

---

### 12. Careers/job-listing/application publishing boundary is not frozen

**Status:** Resolved  
**Priority:** Medium

**Resolution summary**
- Careers/application/job-listing publishing does **not** enter the first R3 change.
- It remains a later R3/Wave 2 settings-adjacent extraction concern.

**Confirmed decision**
- the first R3 change focuses on public consumption flows, not publishing/admin configuration
- careers/job-listing/application publishing should be planned as a separate later change once the public application slice is stable

**Boundary rule**
- first R3 slice:
  - public job presentation
  - application submit
  - public survey continuation
- later R3 publishing/config change:
  - settings/admin configuration
  - public-surface reflection proof

**Evidence**
- `docs/frontend-2/frontend-wave-2-and-wave-3-journey-catalog.md`
- `recruit-frontend/docs/roadmap.md`
- `docs/frontend-2/frontend-migration-rollout-plan.md`

---

### 13. Public/public-facing capability model is unclear

**Status:** Resolved  
**Priority:** Medium

**Resolution summary**
- The first R3 slice uses a **public access decision model**, not the recruiter-shell capability model.
- Public access is evaluated from route context, token state, and backend/public-flow availability rather than recruiter identity/organization roles.

**Confirmed public access layers**
1. **Route context validity**
   - are the required route identifiers present and structurally valid?
2. **Token/access state**
   - valid / invalid / expired / used / inaccessible
3. **Public-flow availability**
   - is the shared job/application/survey still available for this route?
4. **Action readiness**
   - can the user continue upload, submit, retry, or complete the public workflow right now?

**UI mapping rules**
- invalid/expired/used/inaccessible are distinct public states
- unavailable job / closed application is a distinct public state
- retryable submission/upload failures are distinct from access denial

**Boundary rule**
- do not reuse recruiter role/capability objects for public flows
- public routes may still expose route-scoped decision objects, but those objects are public-flow-specific

**Evidence**
- `docs/frontend-2/frontend-permission-decision-model.md`
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `recruit-frontend/docs/roadmap.md`

---

### 14. Public data and adapter boundaries need to be frozen

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- The first R3 slice requires explicit public-slice adapters instead of page-level orchestration.
- Public routes must not consume raw backend payloads directly in page components.

**Confirmed adapter boundaries**
1. **Public application view-model adapter**
   - normalizes public job/application state into UI-friendly route models
2. **Submission serializer**
   - converts applicant answers, custom fields, survey values, and uploaded-file references into backend submission input
3. **Upload workflow adapter**
   - owns signed URL acquisition, binary upload, metadata persistence, and upload-state transitions
4. **Survey/custom-field rendering adapter**
   - maps schema-driven survey/custom-field definitions into renderable public form models

**Implementation rule**
- signed-url mechanics, metadata persistence, and schema normalization belong in adapters/serializers
- public page components consume normalized models and decision objects, not raw transport-specific payloads

**Why this is required**
- the existing docs already identify public application as an aggregator + serializer + upload-adapter problem
- preserving endpoint calls without preserving adapter rules will silently break submission correctness

**Evidence**
- `docs/frontend-2/frontend-data-shape-and-frontend-adapter-inventory.md`
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `docs/frontend-2/frontend-file-upload-and-document-flow-inventory.md`

---

### 15. Validation baseline for R3 is not frozen

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Freeze the first R3 slice validation baseline around direct-entry safety, token-state distinction, upload/submission correctness, and stable public completion/recovery states.

**Required proof categories**
1. **Route/history proof**
   - direct URL entry
   - browser refresh
   - route-carried context restoration
   - public completion state remains stable on reload where applicable

2. **Token-state proof**
   - `valid`
   - `invalid`
   - `expired`
   - `used`
   - `inaccessible`

3. **Bootstrap-independence proof**
   - public routes render without recruiter-shell bootstrap
   - no hidden internal state is required for route recovery

4. **Upload/submission proof**
   - validation
   - upload handshake
   - binary upload
   - metadata persistence
   - submission success
   - recoverable failure and retry

5. **Completion/recovery proof**
   - success state
   - retryable failure state
   - invalid/expired/inaccessible state
   - unavailable job / closed-application state

**Blocking scenarios**
- direct entry works only after prior internal navigation
- refresh loses public route context
- invalid and expired token states collapse into a generic error
- upload succeeds but submission or metadata state drifts
- submission succeeds but no stable public completion state is shown
- recoverable failures force the user out of the public slice

**Execution rule**
- no first-slice R3 route should be considered ready unless these proof categories are assigned to concrete tests or explicit owned manual checks

**Evidence**
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `docs/frontend-2/frontend-test-coverage-map.md`
- `docs/frontend-2/frontend-parity-test-strategy.md`
- `docs/frontend-2/frontend-edge-case-and-exception-catalog.md`
- `docs/frontend-2/frontend-migration-rollout-plan.md`

---

### 16. Observability baseline for public/external journeys is not frozen

**Status:** Resolved  
**Priority:** Medium

**Resolution summary**
- Freeze the first R3 slice observability contract around route-aware public journey telemetry, token-state visibility, upload/submission lifecycle, and correlation-id propagation.

**Required event context**
- `routeId`
- `routeClass`
- `domain`
- `module`
- `entryMode`
- `correlationId`

**Required public journey coverage**
- public route opened
- public route bootstrap succeeded/failed
- token-state outcome resolved
- upload lifecycle events
- submission started/succeeded/failed
- public journey finished with `success`, `failure`, `cancel`, or `abandon`

**Required first-slice event families**
- `journey_started`
- `journey_step`
- `journey_finished`
- token-state events using the existing token-flow vocabulary
- upload/submission lifecycle events for the public application flow

**Correlation rules**
- create a correlation id at the start of each top-level public/token journey
- reuse the correlation id across:
  - route bootstrap
  - public API calls
  - upload retries inside the same operational attempt
  - submission retries inside the same operational attempt
- do not rotate correlation ids on every render or minor click

**Execution rule**
- public observability must remain provider-agnostic through the existing observability ports
- public product code must not import vendor SDKs directly
- the first R3 slice should add only the minimum event set needed for operational debugging and rollout safety

**Why this is the correct decision now**
- it gives the first R3 slice enough traceability for token, upload, and submission failures without forcing a full later-wave event taxonomy up front

**Evidence**
- `recruit-frontend/docs/observability.md`
- `recruit-frontend/docs/telemetry-events.md`
- `recruit-frontend/docs/correlation-id-policy.md`
- `docs/frontend-2/frontend-public-application-slice-specification.md`
- `docs/frontend-2/frontend-migration-rollout-plan.md`

## Confirmed Architectural Rules from Existing Docs

These are already strongly established and should be treated as fixed unless explicitly changed:

- public routes are first-class direct-entry routes
- route state owns public context such as token and source
- public progress state belongs to the public slice, not recruiter global state
- public completion must be explicit and stable
- token/source semantics are part of the route contract
- upload is a workflow, not a utility
- external/public shell must be distinct from the authenticated shell

## R2 Synchronization Check

The recruiter-internal baseline that R3 must now sync against is confirmed in source:

- candidate route family exists in:
  - `src/app/router.tsx`
  - `src/lib/routing/route-contracts.ts`
  - `src/lib/routing/route-metadata.ts`
- candidate capability surface exists in:
  - `src/lib/access-control/types.ts`
  - `src/lib/access-control/evaluate-capabilities.ts`
- candidate task flows already establish the recruiter-side pattern for:
  - route-owned action context
  - candidate-hub fallback
  - visible parent refresh
  - correlation-aware journey telemetry
- a distinct public shell already exists in source:
  - `src/shell/layout/public-shell.tsx`

These existing R2 decisions should be treated as fixed inputs for the first R3 change:

- recruiter-internal candidate context stays on `/candidate/...`
- public routes remain outside the authenticated shell
- public routes should not reuse recruiter-only capability keys such as:
  - `canViewCandidateDetail`
  - `canOpenCandidateAction`
  - `canScheduleInterviewFromCandidate`
- public upload/submission flows should borrow only shell-agnostic primitives such as correlation-aware request helpers, not recruiter-only candidate-store scaffolding

## Remaining R3 Planning / Execution Gaps

The first public/application slice is now archived and represented in source. Tokenized chat and provider integration callbacks now both have dedicated planning and implementation slices in `recruit-frontend`, so the remaining meaningful R3 work is mostly cross-doc consistency:

- overview docs must stay synchronized with the archived R3 changes and current source baseline
- provider integration callback docs must continue to reflect the implemented token-entry slice for:
  - `/integration/cv/:token/:action?`
  - `/integration/forms/:token`
  - `/integration/job/:token/:action?`

## Recommended Resolution Order

1. keep the archived first-slice/public docs synchronized with current source
2. keep provider integration callback docs synchronized with the implemented token-entry slice
3. validate whether any remaining R3 route families need narrower sub-slicing before implementation

## Ready-to-Start Condition

Any remaining R3 follow-up family should be treated as ready for implementation only when:

- its route family boundary is explicit
- its token/capability/bootstrap contract is explicit where applicable
- validation and observability proof are explicit
- the corresponding OpenSpec package exists
