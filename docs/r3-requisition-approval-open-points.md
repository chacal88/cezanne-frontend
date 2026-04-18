# R3 Requisition Approval Open Points

## Purpose

This document captures the decision register for the `R3` requisition-approval slice.

It is focused on tokenized approval entry, requisition forms/download behavior, workflow ownership, jobs-domain coupling, and public-vs-internal separation.

## Status

- **Current readiness:** initial implementation baseline landed in `recruit-frontend`
- **Validation baseline:** `npm test`, `npm run build`, and `npm run smoke:r0`
- **Execution note:** the implemented slice now covers the approval-only route family:
  - `/job-requisition-approval?token`

## Canonical Source Baseline

Use these documents as the primary baseline for discovery and execution planning:

- `recruit-frontend/docs/roadmap.md`
- `recruit-frontend/docs/modules.md`
- `recruit-frontend/docs/screens.md`
- `docs/frontend-2/frontend-wave-2-and-wave-3-journey-catalog.md`
- `docs/frontend-2/frontend-migration-scope-statement.md`
- `docs/frontend-2/frontend-feature-to-api-ownership-matrix.md`
- `docs/frontend-2/frontend-rewrite-matrix.md`
- `docs/frontend-2/frontend-jobs-domain-specification.md`
- `docs/frontend-2/frontend-screen-inventory.md`

## Decision Register

### 1. Missing executable planning package

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- Requisition approval should be opened as its own dedicated OpenSpec change after planning is frozen.

**Confirmed decision**
- Use a dedicated package for requisition approval.
- Do not mix it into the public-application or external-review packages.
- Recommended change shape:
  - `r3-requisition-approval-core`

**Why this is the right package boundary**
- `recruit-frontend/docs/modules.md` already defines `requisition-approval` as its own route-owning module.
- `docs/frontend-2/frontend-rewrite-matrix.md` groups approval and requisition forms as a distinct migration family with its own risk profile.

---

### 2. Requisition-approval slice scope is not frozen

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- The first requisition-approval slice should include only:
  - `/job-requisition-approval?token`
- It should exclude:
  - `/job-requisition-forms/:id?download`
  - `/reject-reasons`

**Confirmed decision**
- First requisition-approval slice = approval token route only.
- Forms/download remain a follow-up slice.
- Reject reasons remain settings/admin adjacency, not part of the first public-token approval slice.

**Why this is the correct split**
- `recruit-frontend/docs/screens.md` places `/job-requisition-approval?token` in `R3`, while `/job-requisition-forms/:id?download` is explicitly `R5`.
- `docs/frontend-2/frontend-rewrite-matrix.md` groups approval token route, requisition forms, and reject reasons together as a migration family, but not as a mandatory same-change package.
- `docs/frontend-2/frontend-wave-2-and-wave-3-journey-catalog.md` places requisition approval under later requisition/admin completion, reinforcing that the slice should stay narrow.

**Operational rule**
- First change:
  - approval token route only
- Deferred follow-up:
  - requisition forms/download
  - any reject-reason adjacency

---

### 3. Public/external shell contract is not explicit enough for approval journeys

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Requisition approval reuses the same public/external shell boundary already frozen for other `Public/Token` slices.

**Confirmed decision**
- Approval route remains `Public/Token`.
- It stays outside the authenticated shell.
- It reuses the public/external shell boundary, while allowing approval-specific content, summary, and terminal states inside that shell.

**Why this is correct**
- `recruit-frontend/docs/roadmap.md` freezes one `Public/Token` class with separate shell/error semantics.
- The route is explicitly listed as a public-external route in `screens.md`.
- Nothing in the repo docs justifies inventing a requisition-only shell.

---

### 4. Token lifecycle semantics are not frozen for requisition approval

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- Requisition approval uses the same shared five-state token model:
  - `valid`
  - `invalid`
  - `expired`
  - `used`
  - `inaccessible`
- The first slice freezes route-specific terminal meaning for approval.

**Confirmed decision**
- `used` means the approval token already reached a terminal decision outcome.
- A valid token may allow approve or reject, depending on workflow state and backend rules.
- If the underlying workflow is no longer actionable, the route must resolve to `used`, `expired`, or `inaccessible` explicitly rather than a generic failure.
- Forms/download token semantics are not part of the first slice.

**Why this is correct**
- `recruit-frontend/docs/roadmap.md` requires public/token routes to distinguish those five outcomes.
- `docs/frontend-2/frontend-rewrite-matrix.md` identifies public/token sensitivity as a core approval risk.

---

### 5. Workflow ownership is not frozen

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Freeze the first requisition-approval slice as a **decision flow**.

**Confirmed decision**
- `/job-requisition-approval?token`
  - approval decision flow
  - summary + approve/reject actionability + terminal outcome
- `/job-requisition-forms/:id?download`
  - supporting form/download flow
  - explicitly deferred

**Why this is correct**
- `recruit-frontend/docs/screens.md` describes the approval route as token-resolved workflow payload entry, while forms/download is a separate route with download semantics.
- `docs/frontend-2/frontend-rewrite-matrix.md` says approval/forms involve public-like entry plus document and rejection side-flow behavior, which supports separating the initial decision flow from later document access behavior.

---

### 6. Jobs/requisition coupling boundary is not explicit enough

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- Requisition approval is a **public-external entry surface** with **jobs/requisition workflow dependencies** behind explicit adapters.

**Confirmed decision**
- Do not treat approval as a standalone public feature with no jobs coupling.
- Do not absorb requisition build/list/workflow admin surfaces into this slice.
- Approval depends on requisition/workflow state from the jobs side, but exposes that through route-facing adapters and token bootstrap rather than internal jobs shell state.

**Why this is correct**
- `docs/frontend-2/frontend-feature-to-api-ownership-matrix.md` marks requisition build/list as closely coupled to jobs ownership.
- `docs/frontend-2/frontend-jobs-domain-specification.md` explicitly treats requisition approval public flows as adjacent and out of scope for the jobs core document, meaning the public approval slice needs explicit dependency boundaries rather than full jobs ownership.

---

### 7. Approver access/readiness model is not frozen

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- Requisition approval requires a public-facing approver access/readiness model separate from recruiter capabilities.

**Confirmed decision**
- The planning/source key may remain `canApproveRequisitionByToken`.
- The real access model must be driven by:
  - token validity
  - approval workflow state
  - approver authorization encoded in token/backend contract
  - already-approved / already-rejected / already-consumed state
  - reject-reason requirement state if applicable
  - approval readiness for the current workflow stage

**Rule**
- Do not reuse recruiter-shell capability keys.
- Approver access is token-and-workflow based, not organization/session based.

**Why this is correct**
- `recruit-frontend/docs/screens.md` models the actor as `External`, not a recruiter role.
- `recruit-frontend/docs/roadmap.md` explicitly separates external-token participants from internal actors.

---

### 8. Adapter and API boundaries are not defined

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- The first requisition-approval slice requires explicit route-facing adapter boundaries.

**Confirmed decision**
- Define at least:
  - `RequisitionApprovalView`
  - `RequisitionApprovalDecisionSerializer`
  - approval token-state mapper
- Defer requisition forms/download view models to the follow-up forms slice.

**Why this is correct**
- `docs/frontend-2/frontend-feature-to-api-ownership-matrix.md` marks approval and requisition forms as mixed/composite ownership.
- `docs/frontend-2/frontend-jobs-domain-specification.md` reinforces the rule that the frontend should not expose raw workflow payloads directly to UI components.

---

### 9. Completion, retry, and terminal states are not frozen

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- The first requisition-approval slice keeps terminal approval outcomes inside the public/external boundary.

**Confirmed decision**
- Approve → stable approved outcome state/page
- Reject → stable rejected outcome state/page
- Recoverable failure stays on the same approval route with explicit retry/recovery guidance
- No implicit handoff to recruiter shell after terminal outcome

**Note**
- If reject reason is required by backend/workflow rules, it is part of the same approval decision journey only when needed for terminal rejection completion; it does not enlarge the slice into the admin reject-reasons module.

**Why this is correct**
- `recruit-frontend/docs/roadmap.md` requires explicit terminal states for public/token routes.
- `docs/frontend-2/frontend-rewrite-matrix.md` identifies rejection side-flow parity as part of the family risk, which means terminal approve/reject behavior must be explicit.

---

### 10. Validation baseline is not defined for the slice

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Freeze the minimum validation baseline for the first requisition-approval slice.

**Required proof**
- direct URL entry
- browser refresh
- token-state handling
- approve/reject submission behavior
- stable terminal outcome
- recovery when requisition/workflow state changed underneath the token
- no dependency on authenticated shell bootstrap

**Blocking scenarios**
- token states collapse into a generic error
- refresh loses approval context
- approve/reject success does not produce a stable terminal state
- workflow-state drift produces a broken or ambiguous recovery path

**Evidence**
- `docs/frontend-2/frontend-rewrite-matrix.md`
- `recruit-frontend/docs/screens.md`
- `recruit-frontend/docs/roadmap.md`

---

### 11. Observability baseline is not defined for the slice

**Status:** Resolved  
**Priority:** Medium

**Resolution summary**
- Freeze the minimum observability baseline for requisition approval.

**Required event areas**
- route opened
- bootstrap succeeded / failed
- token-state resolved
- approval started / succeeded / failed
- rejection started / succeeded / failed
- terminal journey outcome
- correlation-id propagation

**Required context**
- `routeId`
- `routeClass`
- `domain`
- `module`
- `entryMode`
- `correlationId`

**Why this is correct**
- The repository already freezes route-aware telemetry for recruiter-core and public-token slices.
- Tokenized approval failures are operationally sensitive and need lifecycle visibility from first rollout.

## Confirmed Current-Code State

These are confirmed current-code facts relevant to planning:

- `src/domains/public-external/` now exists for the first public-application slice
- current source files under that boundary include:
  - `shared-job`
  - `public-application`
  - `public-survey`
  - `token-state`
  - shared support modules
- requisition-approval route implementation now exists in source under:
  - `src/domains/public-external/requisition-approval/**`
- route ids and metadata now exist for the approval route in:
  - `src/lib/routing/route-contracts.ts`
  - `src/lib/routing/route-metadata.ts`
- the approval route is now registered in:
  - `src/app/router.tsx`
- forms/download remains out of the implemented slice and still aligns with later follow-up planning

## Recommended Resolution Order

1. open the dedicated requisition-approval OpenSpec change
2. encode the approval-only route boundary
3. encode token-state semantics and approver access model
4. encode route-facing adapters and decision serializer
5. encode terminal approve/reject behavior
6. encode validation and observability proof

## Ready-to-Start Condition

This slice should be treated as ready for implementation only when:

- approval-only scope is explicit
- jobs/requisition coupling is explicit
- token-state semantics are explicit
- approver access/readiness model is explicit
- adapter/API boundaries are explicit
- completion/retry behavior is explicit
- validation and observability proof are explicit
- the OpenSpec package exists
