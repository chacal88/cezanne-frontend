# R3 External Review Open Points

## Purpose

This document captures the decision register for the next `R3` slice covering external reviewer/interviewer journeys.

It is focused on route ownership, token lifecycle, reviewer/interviewer workflow boundaries, notification handoff, and public-vs-internal separation.

## Status

- **Current readiness:** initial implementation baseline landed for the first external-review slice
- **Primary reason:** route registration, token-state handling, retry behavior, observability hooks, and validation now exist for interview request, review-candidate, and interview-feedback

## Canonical Source Baseline

Use these documents as the primary baseline for discovery and execution planning:

- `recruit-frontend/docs/roadmap.md`
- `recruit-frontend/docs/modules.md`
- `recruit-frontend/docs/screens.md`
- `recruit-frontend/docs/notification-destinations.md`
- `docs/frontend-2/frontend-wave-2-and-wave-3-journey-catalog.md`
- `docs/frontend-2/frontend-migration-scope-statement.md`
- `docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`
- `docs/frontend-2/frontend-feature-to-api-ownership-matrix.md`
- `docs/frontend-2/frontend-rewrite-matrix.md`
- `docs/frontend-2/frontend-notification-destination-inventory.md`
- `docs/frontend-2/frontend-provider-by-provider-integration-inventory.md`

## Decision Register

### 1. Missing executable planning package

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- The next executable package should be a dedicated external-review change opened after the first public-application slice, not mixed into the existing `r3-public-application-slice`.

**Confirmed decision**
- Open a separate OpenSpec change for the reviewer/interviewer slice.
- Treat it as a follow-up R3 package under the `public-external` domain.
- Recommended change shape:
  - `r3-external-review-core`

**Why this is the right package boundary**
- `recruit-frontend/docs/modules.md` defines `external-review` as its own route-owning module.
- `docs/frontend-2/frontend-migration-scope-statement.md` explicitly treats these routes as later-wave and deliberately scoped.
- `docs/frontend-2/frontend-wave-2-and-wave-3-journey-catalog.md` separates public application from external collaboration/tokenized reviewer journeys.

---

### 2. External-review slice scope is not frozen

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- The first external-review slice should include:
  - `/interview-request/:scheduleUuid/:cvToken`
  - `/review-candidate/:code`
  - `/interview-feedback/:code`
- `/chat/:token/:user_id` is explicitly deferred to a separate follow-up slice.

**Confirmed decision**
- Freeze the first external-review change to the three review/interview token routes.
- Do **not** include tokenized chat in the first change.

**Why this is the correct split**
- `recruit-frontend/docs/modules.md` describes `external-review` as owning interview request, review-candidate, and interview-feedback token flows, but does not list chat in the module description.
- `recruit-frontend/docs/screens.md` lists chat in the same release family, but explicitly notes it should be treated as a separate contract from internal inbox.
- `docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md` classifies `/chat/:token/:user_id` differently (`E1 or E6`) from the other three tokenized participant routes (`E1`).

**Operational rule**
- First external-review slice:
  - interview request
  - review candidate
  - interview feedback
- Deferred follow-up:
  - tokenized external chat

---

### 3. External shell contract is not frozen for reviewer/interviewer journeys

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Reuse the same public/external shell boundary established for the first public-application slice.
- Do not introduce a second shell model for reviewer/interviewer routes.

**Confirmed decision**
- Reviewer/interviewer routes remain `Public/Token`.
- They stay outside the authenticated shell.
- They reuse the same public/external shell contract, while allowing route-specific content states inside that shell.

**Why this is correct**
- `recruit-frontend/docs/roadmap.md` freezes one `Public/Token` route class with distinct shell and distinct error model.
- `docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md` states public, tokenized, and reviewer/interviewer routes must not inherit internal-shell assumptions.
- Nothing in the docs justifies creating a second public shell before behavior is proven.

**Rule**
- one public/external shell boundary
- route-specific content and completion states
- no recruiter-shell reuse

---

### 4. Token lifecycle semantics are not specific enough for reviewer/interviewer flows

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- Keep the shared five-state token lifecycle:
  - `valid`
  - `invalid`
  - `expired`
  - `used`
  - `inaccessible`
- Freeze route-specific terminal meaning for each included route family.

**Confirmed decision**
- **Interview request**
  - `used` means the invite has already been accepted/declined or otherwise consumed by a terminal response.
- **Review candidate**
  - `used` means the review token has already reached terminal submission.
  - before terminal submission, partial progress may remain recoverable if the backend contract allows it.
- **Interview feedback**
  - `used` means the feedback submission is complete and the token no longer opens an editable workflow.
- **Chat**
  - deferred; its token lifecycle is not part of the first slice.

**Important note**
- The exact backend rules are still implementation-time adapter work.
- The decision above is a planning freeze inferred from:
  - `docs/frontend-2/frontend-wave-2-and-wave-3-journey-catalog.md`
  - `docs/frontend-2/frontend-rewrite-matrix.md`
  - `recruit-frontend/docs/roadmap.md`
- That source set consistently requires explicit token lifecycle plus submission/retry behavior for these journeys.

**Operational rule**
- The visible meaning of `used` is terminal completion for the first three routes.
- Recovery before terminal completion is route-specific but must stay explicit and public-slice-owned.

---

### 5. Route inventory is documented, but route contracts are not executable

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- The executable inventory for the first external-review slice is frozen to three route families:
  - `/interview-request/:scheduleUuid/:cvToken`
  - `/review-candidate/:code`
  - `/interview-feedback/:code`

**Confirmed decision**
- Each route must receive:
  - route id
  - registered path
  - route metadata
  - route class = `Public/Token`
  - domain = `public-external`
  - module = `external-review`
  - direct-entry policy
  - public bootstrap contract

**Why this is correct**
- `recruit-frontend/docs/screens.md` and `modules.md` already freeze these routes under `public-external.external-review`.
- `recruit-frontend/docs/roadmap.md` requires every directly-entered public/token action to own a URL and explicit behavior contract.

---

### 6. Workflow ownership per route is not frozen

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Freeze a distinct workflow type for each included route family.

**Confirmed decision**
- `/interview-request/:scheduleUuid/:cvToken`
  - **decision flow**
  - accept / decline / respond-style terminal action
- `/review-candidate/:code`
  - **schema-driven review form flow**
  - review aggregate + scoring/assessment submission
- `/interview-feedback/:code`
  - **schema-driven feedback form flow**
  - interview feedback aggregate + submission
- `/chat/:token/:user_id`
  - **conversational flow**
  - deferred from the first slice

**Why this is correct**
- `recruit-frontend/docs/screens.md` distinguishes interview request, review-candidate, and interview-feedback as separate route surfaces with different notes.
- `docs/frontend-2/frontend-provider-by-provider-integration-inventory.md` groups survey/review/feedback as schema-sensitive flows.
- `docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md` already treats chat differently from the three review/interview routes.

---

### 7. Reviewer/interviewer access model is not frozen

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- External-review routes require a public-facing external-participant access model, separate from recruiter capabilities.

**Confirmed decision**
- The source capability key may remain a planning/export name such as `canUseExternalReviewFlow`.
- The actual access model must be driven by:
  - token validity
  - route family
  - participant role/context carried by backend/token contract
  - workflow availability
  - already-completed / already-consumed state
  - route-specific submission readiness

**Rule**
- Do not reuse recruiter capability keys such as:
  - `canViewCandidateDetail`
  - `canRequestCandidateReview`
  - `canViewInterviewFeedback`
- External-participant access is token-and-workflow based, not recruiter-org based.

**Why this is correct**
- `recruit-frontend/docs/roadmap.md` explicitly separates the external-token participant actor from internal recruiter actors.
- `docs/frontend-2/frontend-rewrite-matrix.md` identifies token validity and external access rules as core gating behavior.

---

### 8. Notification handoff and typed-destination ownership are unresolved

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- Internal recruiter notifications must not implicitly reveal or generate external token destinations.
- Referer-driven notification families must be normalized into typed ownership decisions.

**Confirmed decision**
- `cv-interview-feedback`
  - default ownership remains recruiter-internal until an explicit external-review destination contract is introduced
- `cv-reviewed`
  - default ownership remains recruiter-internal candidate/review context until explicit external-review routing is defined
- `user-mentioned`
  - resolve to recruiter-internal entity or inbox ownership, not tokenized external routes

**Hard rule**
- Notification entry from the recruiter shell must not mint, expose, or reconstruct external-token URLs implicitly.
- If an external-review route is ever notification-addressable, it must be modeled as an explicit typed destination family.

**Why this is correct**
- `recruit-frontend/docs/notification-destinations.md` explicitly says opaque referer redirects must be eliminated.
- The current replacement plan points `cv-interview-feedback` to typed `candidate.detail` or explicit future review destination.
- `docs/frontend-2/frontend-notification-destination-inventory.md` marks these referer-driven notifications as high-risk because the frontend does not yet own typed mapping.

---

### 9. External-review aggregate and adapter boundaries are not defined

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- The external-review slice requires explicit adapter/view-model boundaries per route family.

**Confirmed decision**
- Define dedicated route-facing models for:
  - `InterviewRequestView`
  - `ReviewCandidateView`
  - `InterviewFeedbackView`
- If chat is later included, define a separate `ExternalChatView`.
- Submission serializers must remain per workflow family, not one generic serializer.

**Why this is correct**
- `docs/frontend-2/frontend-feature-to-api-ownership-matrix.md` marks the area as mixed/composite transport.
- `docs/frontend-2/frontend-provider-by-provider-integration-inventory.md` says review/feedback behavior is schema-sensitive and route-entry sensitive.
- This matches the already-frozen adapter rule used in R2 and the first R3 public-application slice.

---

### 10. Completion, retry, and handoff rules are not frozen

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- The first external-review slice will keep terminal outcomes inside the public/external boundary.

**Confirmed decision**
- **Interview request**
  - terminal state stays on a stable accept/decline outcome page/state
- **Review candidate**
  - terminal state stays on a stable submitted/read-only outcome page/state
- **Interview feedback**
  - terminal state stays on a stable submitted/read-only outcome page/state
- None of these routes should hand off implicitly to the authenticated recruiter shell.

**Retry rule**
- Recoverable failures stay on the same public/token route.
- Terminal success consumes the route into a stable external outcome.

**Why this is correct**
- `docs/frontend-2/frontend-wave-2-and-wave-3-journey-catalog.md` calls out submission/retry behavior as first-class for external collaboration journeys.
- `recruit-frontend/docs/roadmap.md` requires public/token routes to define explicit URL/back/refresh semantics and distinct terminal states.

---

### 11. Data/API ownership is still composite and failure-mode driven

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- The slice should be planned as a route-by-route contract map, not as one generic external-review backend.

**Confirmed decision**
- Before implementation, each included route family must be mapped independently for:
  - bootstrap endpoint(s)
  - token validation source
  - submit endpoint(s)
  - retry/reload semantics
  - terminal truth source

**Why this is correct**
- `docs/frontend-2/frontend-feature-to-api-ownership-matrix.md` explicitly marks external collaboration as mixed transport with composite ownership.
- `docs/frontend-2/frontend-rewrite-matrix.md` says failure modes and token lifecycle must be specified before UI implementation.

---

### 12. Validation baseline is not yet defined for this slice

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Freeze the minimum validation baseline for the first external-review slice.

**Required proof**
- direct URL entry
- browser refresh
- token-state handling per route family
- route-specific submission/retry behavior
- stable terminal outcome
- no dependency on recruiter-shell bootstrap
- notification ownership proof for referer-driven families where relevant

**Blocking scenarios**
- token states collapse into a generic error
- refresh loses route meaning
- terminal completion still looks editable
- retry exits the public/external boundary
- notification ownership becomes ambiguous between recruiter and external routes

**Evidence**
- `docs/frontend-2/frontend-rewrite-matrix.md`
- `docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`
- `recruit-frontend/docs/roadmap.md`

---

### 13. Observability baseline is not yet defined for this slice

**Status:** Resolved  
**Priority:** Medium

**Resolution summary**
- Freeze the minimum observability baseline for external-review routes.

**Required event areas**
- route opened
- bootstrap succeeded / failed
- token state resolved
- submission started / succeeded / failed
- terminal journey outcome
- correlation-id propagation across retries

**Required context**
- `routeId`
- `routeClass`
- `domain`
- `module`
- `entryMode`
- `correlationId`

**Why this is correct**
- The repository already freezes route-aware observability for recruiter-core and the first public-application slice.
- External token routes are operationally sensitive and need lifecycle visibility from first rollout.

## Confirmed Current-Code State

These are confirmed current-code facts for the implemented first slice:

- `src/domains/public-external/external-review/**` now exists in source
- external-review route registrations now exist in `src/app/router.tsx` for:
  - `/interview-request/$scheduleUuid/$cvToken`
  - `/review-candidate/$code`
  - `/interview-feedback/$code`
- route ids and route metadata now exist in:
  - `src/lib/routing/route-contracts.ts`
  - `src/lib/routing/route-metadata.ts`
- external-review support models, adapters, routing helpers, workflow helpers, and tests now exist in:
  - `src/domains/public-external/support/**`
- notification referer-driven destinations still remain intentionally internal by default unless a future typed external-token destination family is defined explicitly

## Recommended Resolution Order

1. keep docs synchronized with the implemented external-review baseline
2. preserve typed notification ownership rules for internal referer-driven notifications
3. open a dedicated follow-up planning package for tokenized chat if it becomes active

## Ready-to-Start Condition

This implemented slice should be treated as the baseline for any follow-up work, and any future expansion should only proceed when:

- chat inclusion/exclusion is explicit
- notification ownership remains explicit
- any new route family gets its own OpenSpec package
