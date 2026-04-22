# V3 Public External and Token Visual Contract

## Purpose

This document is the V3 visual-readiness package from `pre-figma-flow-review.md`. It prepares public/token and integration-token routes for Figma/screen-flow work without using Figma as a source of product behavior.

V3 covers:
- tokenized external chat;
- external interview request, review-candidate, and interview-feedback flows;
- shared job view and public application submission;
- public survey continuation;
- requisition approval and requisition forms download;
- integration token callbacks for CV, forms, and job token entries.

## Readiness status

| Family | Contract status | Visual status | Figma-ready? | Notes |
|---|---|---|---|---|
| External chat | Figma-ready for screen-flow bases | Evidence complete | Yes | Desktop, mobile, and narrow captures cover ready, send failure, expired/inaccessible token handling, empty, sent/post-refresh, and draft-preserved states. |
| External review/interview | Figma-ready for screen-flow bases | Evidence complete | Yes | Desktop, mobile, and narrow captures cover decision/review/feedback bases, validation/submission failure, completed/scoring-pending terminal states, missing context/schema/template, inaccessible/token failures, and decline terminal. |
| Shared job + public application | Figma-ready for screen-flow bases | Evidence complete | Yes | Desktop, mobile, and narrow captures cover shared presentation, invalid source, unavailable/used token, application validation, upload failures, submission failure, completion, uploaded-file re-entry, and inaccessible token. |
| Public survey | Figma-ready for screen-flow bases | Evidence complete | Yes | Desktop, mobile, and narrow captures cover ready, missing-answer validation, submit failure, completion, missing schema, degraded, and expired token. |
| Requisition approval/forms | Figma-ready for screen-flow bases | Evidence complete | Yes | Desktop, mobile, and narrow captures cover approval, rejection-comment validation, submission failure, workflow drift, terminal approval/rejection, used-on-submit, forms view/download, retryable download failure, invalid token, not-found, unavailable, and already-downloaded. |
| Integration token entry | Figma-ready for screen-flow bases | Evidence complete | Yes | Desktop, mobile, and narrow captures cover CV interview/offer states, validation/conflict/completion/token failure, offer reject terminal, forms steps/upload validation/binary/persistence/completion/used token, and job callback ready/action/locked/invalid states. |

## Evidence sources

| Evidence | Source | How it may be used | Limit |
|---|---|---|---|
| Route and state contracts | `pre-figma-flow-review.md`, `screens.md`, `modules.md`, `capabilities.md` | Canonical product behavior for public/token flows | Must not be overridden by screenshots. |
| OpenSpec specs | `public-token-lifecycle`, `public-token-product-depth`, `external-tokenized-chat`, `external-interview-request`, `external-review-candidate`, `external-interview-feedback`, `public-job-presentation`, `public-application-submission`, `public-survey-continuation`, `requisition-approval-token-flow`, `requisition-forms-download-route`, `integration-cv-token-entry`, `integration-forms-token-entry`, `integration-job-token-entry`, `integration-token-entry-implementation-depth-closeout` | Required state/action/error/parent-return coverage | Specs do not define final layout. |
| Operational specs | `survey-review-scoring-operational-depth`, `messaging-communication-operational-depth`, `provider-readiness-operational-gates` | Shared review/survey/messaging/readiness semantics | Do not expose provider setup internals in public/token screens. |
| Current greenfield source | `src/domains/public-external/**` and `src/domains/integrations/**` token pages | Runtime state and current UI behavior | Adapter-backed token payloads remain seams. |
| Current V3 evidence log | `visual-evidence-v3-public-external-token.md` plus the V3 capture manifests | Desktop, mobile, narrow, lifecycle, and follow-up route/state captures for V3 public/token families | Evidence is not a backend schema or final Figma layout contract. |

## Public token lifecycle frame set

Every V3 public/token screen must share a consistent token-state treatment.

| State | Required behavior | Visual rule |
|---|---|---|
| Valid/ready | Token accepted and route-specific content can render | Show only route-specific safe context. |
| Missing/invalid | Token or required params missing/invalid | Terminal or retry-safe message; never display raw token. |
| Expired | Token expired | Terminal or restart guidance; no authenticated-shell fallback. |
| Used/completed | Token already consumed or terminal action completed | Read-only terminal state. |
| Inaccessible | Token valid but user/context cannot access requested resource | Do not leak resource details. |
| Unavailable/degraded | Backend or route resource unavailable/degraded | Retryable where contract allows; keep state route-local. |
| Submission/download/upload failure | Recoverable task failure | Preserve entered data where contract allows and show retry. |

## External chat frame set

| Frame/state | Required behavior | Visual notes | Backend/API unknowns |
|---|---|---|---|
| Ready chat | Tokenized participant/partner context and grouped messages | Public layout; no authenticated shell. | Exact participant identity fields unknown. |
| Empty chat | No messages but composer available | Keep composer and context visible. | Empty reason unknown. |
| Draft/composing | User edits message | Do not include message body in telemetry. | None. |
| Sending/sent | Send pending/succeeded with refresh intent | Avoid duplicate send. | Live transport details unknown. |
| Send failed/retry | Recoverable send failure | Preserve draft if allowed. | Error taxonomy unknown. |
| Token invalid/expired/used/inaccessible | Lifecycle terminal states | Do not show chat content when inaccessible. | None. |

## External review and interview frame set

| Route/family | Required states | Visual rule |
|---|---|---|
| `/interview-request/:scheduleUuid/:cvToken` | awaiting decision, accept/decline, required context missing, submission failure/retry, completed terminal, invalid/expired/inaccessible token | Keep accept/decline decision separate from review/feedback form flows. |
| `/review-candidate/:code` | ready review form, saved draft, validation failure, submission failure/retry, completed terminal, invalid/expired/inaccessible token | Do not expose raw review answers in telemetry or visual artifacts. |
| `/interview-feedback/:code` | ready feedback form, scoring-pending terminal outcome, saved draft, validation failure, submission failure/retry, invalid/expired/inaccessible token | Keep scoring-pending distinct from failed submission. |

## Shared job and public application frame set

| Frame/state | Required behavior | Visual notes | Backend/API unknowns |
|---|---|---|---|
| Shared job ready | Job/role presentation from token/source | Public layout and start-application handoff. | Final public job fields unknown. |
| Invalid source/token | Source/token invalid or inaccessible | Route-local terminal state. | None. |
| Shared job unavailable | Token valid but job presentation unavailable | Retry or unavailable state per contract. | Resource error taxonomy unknown. |
| Application ready | Applicant form from token/source | Do not infer extra fields beyond contract. | Applicant schema unknown. |
| Required validation | Required applicant fields missing | Route-local validation. | Validation schema unknown. |
| Upload handshake failure | File upload cannot obtain/upload target | Retryable; do not expose signed URL. | Upload provider fields unknown. |
| Binary transfer failure | File transfer failed | Retryable; preserve selected state where allowed. | Transfer error taxonomy unknown. |
| Metadata persistence failure | Upload succeeded but metadata persistence failed | Retry/repair state. | Metadata schema unknown. |
| Submission failure/retry | Final submission failed | Preserve user input where allowed. | Submission payload unknown. |
| Completed | Application submitted | Terminal success with safe next action. | None. |

## Public survey frame set

| Frame/state | Required behavior | Visual rule |
|---|---|---|
| Ready survey | Survey questions/rendering from token context | Do not infer question schema beyond contract. |
| Missing-answer validation | Required response missing | Route-local validation. |
| Submission failure/retry | Recoverable submit failure | Preserve answers where contract allows. |
| Completed terminal | Survey already completed or just submitted | Read-only terminal state. |
| Invalid/expired/inaccessible/degraded | Token/source operational states | Consistent public token lifecycle treatment. |

## Requisition public frame set

| Route/family | Required states | Visual rule |
|---|---|---|
| `/job-requisition-approval?token` | token validation, awaiting decision, approve/reject, rejection comment required, submission failure/retry, workflow drift, used-on-submit, already approved/rejected, unavailable workflow | Keep workflow drift and already-terminal states visually distinct from generic failure. |
| `/job-requisition-forms/:id?download` | view mode, download mode, ready download, invalid/expired/used token, already downloaded, not found, unavailable, retryable download failure, completed download | Do not expose signed download URLs or storage internals. |

## Integration token-entry frame set

| Route/family | Required states | Visual rule |
|---|---|---|
| `/integration/cv/:token/:action?` | interview-slot response, unavailable reason validation, offer accept/reject, conflict, submission failure/retry, completed terminal, invalid/expired/used/inaccessible token | Preserve integration token flow as public/token callback, separate from authenticated provider setup. |
| `/integration/forms/:token` | multi-step requested forms/documents, progress/current step, answer validation, file-required validation, upload handshake failure, transfer failure, persistence/submission failure, advanced-to-next-step, completed terminal, token states | Step/progress visuals must not invent provider form schemas. |
| `/integration/job/:token/:action?` | tokenized job presentation, action echo, invalid/expired/used/inaccessible token, unavailable/inaccessible route-family handling, read-only presentation | Do not create authenticated job shell from this public token entry. |

## Boundary and telemetry rules

- Public/token routes must not depend on authenticated shell layout, authenticated nav, account menu, or route capabilities beyond the public token capability contract.
- No raw token, auth code, provider payload, signed URL, message body, survey/review answer, applicant document content, or tenant-sensitive raw payload may appear in telemetry or design annotations.
- Provider setup screens are out of scope; token callback failures may link to safe support/remediation copy only if the route contract allows it.
- Public/token visual states should be reusable across flows while preserving route-specific actions.

## Responsive assumptions

| Viewport | Requirement |
|---|---|
| Desktop primary | Public/token flows should be readable without authenticated shell chrome. |
| Narrow desktop/tablet | Forms, token state panels, and upload/download actions must remain usable. |
| Mobile | Covered for V3 screen-flow/base-frame handoff by the current mobile evidence set; final mobile product polish can still be refined without reopening route ownership. |

## Non-goals

- Do not design final backend schemas for public applications, survey questions, review answers, chat messages, requisition approvals/forms, integration forms, CV token actions, or job token payloads.
- Do not design provider setup or authenticated integrations administration in V3.
- Do not merge public/token flows into authenticated shell frames.
- Do not create canonical frames for integration alias rows separate from their token-entry canonical families.
- Do not change implementation code from this visual contract.

## Required outputs before marking V3 rows `Figma-ready`

1. Shared public token lifecycle visual treatment covering valid, invalid, expired, used/completed, inaccessible, unavailable/degraded, and retryable failure states.
2. External chat visual map for ready/empty/grouped messages/composer/send failed/token states.
3. External review/interview visual map for decision, validation, retry, completed, scoring-pending, and token states.
4. Shared job and public application visual map for presentation, application form, upload/submission failures, and completion.
5. Public survey and requisition visual maps for validation, terminal, workflow drift, and download states.
6. Integration token-entry visual map for CV/forms/job callback states with provider setup separation preserved.
7. Updated `pre-figma-flow-review.md` rows from `Contract-reviewed` to `Figma-ready` only for states covered by the evidence above.

## Promotion slices

Use `visual-evidence-v3-public-external-token.md` as the working decision log. V3 should promote in slices:

| Slice | Scope | Required before promotion |
|---|---|---|
| `V3-A` shared lifecycle | Shared token-state, retryable failure, and terminal components | Complete for Figma screen-flow/base-frame handoff. |
| `V3-B` public application | Shared job and public application | Complete for Figma screen-flow/base-frame handoff; upload-progress omission documented. |
| `V3-C` external review | Interview request, review candidate, interview feedback, public survey | Complete for Figma screen-flow/base-frame handoff; schema-placeholder and inaccessible/degraded reuse documented. |
| `V3-D` requisition | Requisition approval and requisition forms download | Complete for Figma screen-flow/base-frame handoff; reject terminal and used-on-submit conflict captured. |
| `V3-E` integration token | Integration CV, forms, and job callback routes | Complete for Figma screen-flow/base-frame handoff; provider setup separation and upload-depth omissions documented. |
