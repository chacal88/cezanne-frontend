# Visual Evidence V3 Public External Token

## Purpose

This log records the first V3 visual evidence capture for public/external and integration token-entry flows.

It supports `v3-public-external-token-visual-contract.md` and keeps current-app screenshots as route/state evidence only. The captures do not define backend schemas, provider payloads, public application fields, survey/review answer models, message bodies, signed URLs, or final Figma layout.

## Capture metadata

| Field | Value |
|---|---|
| Capture date | 2026-04-22 |
| Viewport | Desktop `1440x900`, device scale factor `1` |
| Current app | `http://127.0.0.1:5173` |
| Capture manifest | `visual-evidence-assets/v3/v3-capture-manifest.json` |
| Screenshot directory | `visual-evidence-assets/v3/current/` |
| Screenshot count | 66 |
| V3-A lifecycle manifest | `visual-evidence-assets/v3/v3-a-lifecycle-manifest.json` |
| V3-A lifecycle screenshots | 14 captures across mobile `390x844` and narrow `768x900` |
| V3-B through V3-E follow-up manifest | `visual-evidence-assets/v3/v3-follow-up-manifest.json` |
| V3-B through V3-E follow-up screenshots | 42 captures across mobile `390x844` and narrow `768x900` |
| Total V3 screenshots | 122 |
| Token data policy | Captures use synthetic state-driving token strings only. No production credentials, raw auth tokens, provider payloads, signed URLs, message bodies, applicant documents, survey answers, or tenant-sensitive payloads are stored. |

## Evidence inventory

| Route/family | Evidence source | Captured screenshots | Captured states | Decision |
|---|---|---|---|---|
| `/chat/:token/:user_id` | Current greenfield | `greenfield-v3-external-chat-*` | ready grouped conversation, send failure, expired token, inaccessible/missing thread | Current evidence captured; final Figma-ready still pending chat empty/sent/mobile treatment and canonical public layout decision. |
| `/interview-request/:scheduleUuid/:cvToken` | Current greenfield | `greenfield-v3-interview-request-*` | ready, submit failure, terminal completion, missing context, invalid token | Current evidence captured; final Figma-ready pending accepted public external form layout. |
| `/review-candidate/:code` | Current greenfield | `greenfield-v3-review-candidate-*` | ready form, validation failure, submit failure, completed terminal, missing schema, expired token | Current evidence captured; schema and final review form layout remain non-inventable. |
| `/interview-feedback/:code` | Current greenfield | `greenfield-v3-interview-feedback-*` | ready form, submit failure, scoring-pending terminal, missing template | Current evidence captured; final feedback/scoring layout remains pending. |
| `/shared/:jobOrRole/:token/:source` | Current greenfield | `greenfield-v3-shared-job-*` | ready shared job, invalid source, unavailable closed job, used token | Current evidence captured; public job presentation fields remain adapter-backed examples. |
| `/:jobOrRole/application/:token/:source` | Current greenfield | `greenfield-v3-public-application-*` | ready application, validation failure, upload handshake failure, binary transfer failure, metadata persistence failure, submission failure, completion, inaccessible token | Current evidence captured; final applicant schema/upload progress must not be invented. |
| `/surveys/:surveyuuid/:jobuuid/:cvuuid` | Current greenfield | `greenfield-v3-public-survey-*` | ready survey, missing-answer validation, submit failure, completed terminal, missing schema, expired token | Current evidence captured; survey question schema remains backend/API unknown. |
| `/job-requisition-approval?token` | Current greenfield | `greenfield-v3-requisition-approval-*` | ready approval, rejection comment validation, submit failure, workflow drift, used/approved terminal, approve completion | Current evidence captured; reject terminal and used-on-submit conflict can be added when needed. |
| `/job-requisition-forms/:id?download` | Current greenfield | `greenfield-v3-requisition-forms-*` | view mode, download mode, download failure, downloaded completion, invalid token, not found, already downloaded | Current evidence captured; signed download/storage fields remain excluded. |
| `/integration/cv/:token/:action?` | Current greenfield | `greenfield-v3-integration-cv-*` | interview ready, validation failure, conflict, completion, offer ready, expired token | Current evidence captured; provider setup remains out of scope. |
| `/integration/forms/:token` | Current greenfield | `greenfield-v3-integration-forms-*` | step one, file-required validation, upload handshake failure, step two, completion, used token | Current evidence captured; requested form/document schemas remain non-inventable. |
| `/integration/job/:token/:action?` | Current greenfield | `greenfield-v3-integration-job-*` | ready job callback, action echo, locked/unavailable, invalid token | Current evidence captured; authenticated job shell must not be inferred. |

## Confirmed visual observations

- V3 public/token routes render outside the authenticated shell and do not expose sidebar, account menu, org navigation, or authenticated route chrome.
- The shared `PublicTokenStatePanel` is the current visual treatment for invalid, expired, used, inaccessible, and unavailable token outcomes across public/external and integration token routes.
- Route-specific terminal panels are used for application completion, survey completion, external review/feedback completion, requisition approval terminal states, requisition forms downloaded state, and integration callback completion.
- Current greenfield UI is intentionally state-contract-first and sparse. It proves public/token boundary separation and state coverage, but does not establish final public-brand visual design.
- Upload/download flows expose retryable failure states without showing signed URLs, binary payloads, document bodies, or provider storage internals.
- External chat captures grouped messages and composer failure, but message content is synthetic fixture text and must not be treated as production data.

## Accepted deviations in this pass

- Current greenfield screenshots are accepted as V3 route/state evidence, not final visual parity or production schema evidence.
- Synthetic state-driving route params are accepted as capture inputs because they are fixture controls, not real user tokens.
- Lack of legacy/reference screenshots is accepted for this first V3 pass because the purpose is to establish current public-token state coverage before canonical Figma frames.

## Deferred visual debt

- Define canonical public layout treatment for V3 token screens, including typography, spacing, error panels, terminal panels, and mobile/narrow viewport behavior.
- Capture or explicitly omit external chat empty, sent/post-refresh, draft-preserved, and mobile states before full chat Figma readiness.
- Capture inaccessible states for external review/feedback and integration token families where they differ from generic token-state handling.
- Capture reject terminal and used-on-submit conflict variants for requisition approval if those are selected for Figma frames.
- Decide whether public application upload progress, survey schemas, review questions, requisition form metadata, and integration form steps remain placeholder examples or need backend-confirmed schema contracts before final visual design.

## Proposed canonical frame set

This is the proposed V3 frame set for the next Figma handoff pass. It keeps route-specific product states visible while reusing shared token/error/terminal components where behavior is identical.

| Family | Canonical frames to create | Reuse/annotate instead of separate frames | Follow-up capture needed |
|---|---|---|---|
| Shared public token lifecycle | `token-invalid`, `token-expired`, `token-used/completed`, `token-inaccessible`, `resource-unavailable`, `retryable-failure`, `terminal-success` | Reuse the same token-state component across public application, survey, review, requisition, and integration token routes when the route action is not visible. | Narrow/mobile component treatment. |
| External chat | Ready grouped conversation, empty conversation, draft/composing, send failed, sent/post-refresh, token terminal | Token expired/inaccessible may reuse shared lifecycle component. | Empty, sent/post-refresh, draft-preserved, and mobile captures. |
| Interview request | Awaiting decision, submit failed, completed terminal, missing context, token terminal | Accept and decline can share the same decision frame with different terminal copy unless product asks for separate review. | Optional decline terminal capture if copy/layout differs from accept. |
| Review candidate | Ready review form, validation failure, submit failed, completed terminal, missing schema, token terminal | Saved draft can be annotated on ready form until draft-specific UI differs. | Inaccessible token variant only if it differs from shared lifecycle. |
| Interview feedback | Ready feedback form, submit failed, scoring-pending terminal, missing template/schema, token terminal | Validation failure can reuse review-candidate validation pattern unless feedback-specific copy/layout differs. | Validation failure and inaccessible/expired captures if selected. |
| Shared job | Ready shared job, invalid source, unavailable/closed job, used token | Invalid/expired/inaccessible token uses shared lifecycle component. | Mobile public job presentation if public job is selected for first Figma batch. |
| Public application | Ready form, required validation, upload handshake failure, binary transfer failure, metadata persistence failure, submission failure, completion, token terminal | Upload progress remains annotated only until backend progress semantics are confirmed. | Mobile/narrow form capture; optional uploaded-file persisted state if needed. |
| Public survey | Ready survey, missing answer validation, submit failed, completed terminal, schema unavailable, token terminal | Question schemas remain examples; do not create schema-specific variants until backend confirms field types. | Mobile capture; inaccessible/degraded only if selected. |
| Requisition approval | Awaiting decision, rejection-comment validation, submit failed, workflow drift, already terminal, approve/reject terminal, token terminal | Approve and reject can share terminal structure with copy/status swap. | Reject terminal and used-on-submit conflict capture if included in first Figma batch. |
| Requisition forms | View mode, download mode, download failed, downloaded terminal, not found, already downloaded, token terminal | Signed URL/storage details remain excluded and annotated only. | Unavailable state if it differs from not-found/already-downloaded. |
| Integration CV token | Interview ready, unavailable-reason validation, conflict, completion, offer ready, token terminal | Provider setup/remediation is out of scope and should be linked/annotated only. | Offer reject terminal and inaccessible/used token only if selected. |
| Integration forms token | Step one, file-required validation, upload handshake failure, step two/progress, completion, token terminal | Exact requested form/document schemas remain examples. | Binary transfer and persistence failure if first Figma batch includes upload-depth frames. |
| Integration job token | Ready job callback, action echo, locked/unavailable, invalid token | Authenticated job shell is never represented from this route. | Mobile job callback only if public job callback is selected. |

## Proposed V3 promotion slices

Promote V3 in slices rather than as one all-or-nothing block:

| Slice | Rows/families | Promotion target | Remaining blocker |
|---|---|---|---|
| V3-A shared lifecycle | Shared token-state and terminal components across public/token routes | Component-level `Figma-ready` once desktop + mobile token panels are accepted | Mobile/narrow treatment. |
| V3-B public application package | Shared job plus public application | Route-family `Figma-ready` for public job/application base states | Mobile form capture and explicit upload-progress omission. |
| V3-C external review package | Interview request, review candidate, interview feedback, public survey | Route-family `Figma-ready` for form/terminal bases | Decide inaccessible/degraded omissions and final schema-placeholder rules. |
| V3-D requisition package | Approval plus forms download | Route-family `Figma-ready` for approval/download bases | Reject terminal and used-on-submit conflict decision. |
| V3-E integration token package | Integration CV/forms/job callbacks | Route-family `Figma-ready` for callback bases | Decide whether upload-depth failures beyond handshake are in first Figma batch. |

Follow-up action completed: V3-A mobile/narrow lifecycle plus V3-B through V3-E selected missing states are captured below.

## Backend/API unknowns

- External chat participant identity fields, live transport, empty-thread reason, and delivery error taxonomy remain unknown.
- Public job presentation fields, applicant schema, upload provider fields, upload progress, metadata persistence schema, and final application submission payload remain unknown.
- Survey question schema, review/feedback answer schema, scoring outcome taxonomy, and terminal read-only backend fields remain unknown.
- Requisition approval summary fields, workflow drift taxonomy, approval mutation payload, forms download document schema, and storage/download provider details remain unknown.
- Integration CV action payloads, provider conflict taxonomy, requested forms/documents schema, integration job payload, and provider setup remediation details remain unknown.

## Figma readiness decision

| Area | Decision | Reason |
|---|---|---|
| Public token lifecycle | Figma-ready for shared lifecycle bases | Valid, invalid, expired, used, inaccessible, unavailable, retry, terminal, mobile, and narrow states are captured. |
| External chat | Figma-ready for screen-flow bases | Ready, send failure, expired/inaccessible token handling, empty, sent/post-refresh, draft-preserved, mobile, and narrow states are captured. |
| External review/interview | Figma-ready for screen-flow bases | Ready, validation/submission failure, missing schema/context/template, token, terminal, inaccessible, mobile, and narrow states are captured or explicitly reusable through shared lifecycle. |
| Shared job + public application | Figma-ready for screen-flow bases | Public presentation, application validation, upload failures, submission failure, completion, token states, uploaded-file re-entry, mobile, and narrow states are captured. |
| Public survey | Figma-ready for screen-flow bases | Ready, validation, submit failure, completion, schema unavailable, degraded, token, mobile, and narrow states are captured or reusable through shared lifecycle. |
| Requisition approval/forms | Figma-ready for screen-flow bases | Approval, validation, workflow drift, terminal, reject terminal, used-on-submit, forms view/download/failure/unavailable states are captured. |
| Integration token entry | Figma-ready for screen-flow bases | CV, forms, and job callback bases include action, validation, conflict, upload, persistence, terminal, token, unavailable, mobile, and narrow evidence. |

V3 can proceed to Figma for canonical screen-flow/base-frame work. Backend/API unknowns remain annotated below and must not be resolved by inventing fields in Figma.

## V3-A lifecycle follow-up capture

| State | Mobile screenshot | Narrow screenshot | Decision |
|---|---|---|---|
| `token-invalid` | `visual-evidence-assets/v3/mobile/v3-a-token-invalid-390x844.png` | `visual-evidence-assets/v3/narrow/v3-a-token-invalid-768x900.png` | Captured for shared lifecycle review. |
| `token-expired` | `visual-evidence-assets/v3/mobile/v3-a-token-expired-390x844.png` | `visual-evidence-assets/v3/narrow/v3-a-token-expired-768x900.png` | Captured for shared lifecycle review. |
| `token-used` | `visual-evidence-assets/v3/mobile/v3-a-token-used-390x844.png` | `visual-evidence-assets/v3/narrow/v3-a-token-used-768x900.png` | Captured for shared lifecycle review. |
| `token-inaccessible` | `visual-evidence-assets/v3/mobile/v3-a-token-inaccessible-390x844.png` | `visual-evidence-assets/v3/narrow/v3-a-token-inaccessible-768x900.png` | Captured for shared lifecycle review. |
| `resource-unavailable` | `visual-evidence-assets/v3/mobile/v3-a-resource-unavailable-390x844.png` | `visual-evidence-assets/v3/narrow/v3-a-resource-unavailable-768x900.png` | Captured for shared lifecycle review. |
| `retryable-failure` | `visual-evidence-assets/v3/mobile/v3-a-retryable-failure-390x844.png` | `visual-evidence-assets/v3/narrow/v3-a-retryable-failure-768x900.png` | Captured through public application submission failure; can represent retryable public-token task failures if copy remains route-specific. |
| `terminal-success` | `visual-evidence-assets/v3/mobile/v3-a-terminal-success-390x844.png` | `visual-evidence-assets/v3/narrow/v3-a-terminal-success-768x900.png` | Captured through public application completion; can represent terminal success structure with route-specific copy/actions. |

V3-A now has desktop, mobile, and narrow current-app evidence for the shared lifecycle component set and is accepted as the reusable V3 lifecycle base for Figma handoff.

## V3-B through V3-E follow-up capture

| Slice | Captured follow-up states | Evidence | Decision |
|---|---|---|---|
| `V3-B` public application | Shared job ready, public application ready, validation failure, uploaded-file/completed re-entry state | `visual-evidence-assets/v3/follow-up/v3-b-*` | Figma-ready for public job/application screen-flow bases; upload progress is explicitly omitted until backend progress semantics are confirmed. |
| `V3-C` external review | Chat empty, chat sent/post-refresh, chat draft-preserved, interview request decline terminal, review inaccessible, feedback validation, survey degraded | `visual-evidence-assets/v3/follow-up/v3-c-*` | Figma-ready for external review/chat/survey screen-flow bases; schema-specific question layouts remain examples until backend contracts are confirmed. |
| `V3-D` requisition | Reject terminal, used-on-submit approved, used-on-submit rejected, requisition forms unavailable | `visual-evidence-assets/v3/follow-up/v3-d-*` | Figma-ready for requisition approval/forms screen-flow bases; signed URL/storage internals remain excluded. |
| `V3-E` integration token | CV offer reject terminal, CV used token, CV inaccessible/family mismatch token, forms binary-transfer failure, forms persistence failure, integration job responsive ready | `visual-evidence-assets/v3/follow-up/v3-e-*` | Figma-ready for integration token callback screen-flow bases; provider setup and provider remediation UX remain out of scope. |

## Final V3 decision

| Area | Decision | Reason |
|---|---|---|
| `V3-A` shared lifecycle | Figma-ready for shared lifecycle component bases | Desktop, mobile, and narrow captures cover invalid, expired, used, inaccessible, unavailable, retryable failure, and terminal success states. |
| `V3-B` public application | Figma-ready for screen-flow bases | Public job/application ready, validation, upload failure families, completion, token states, and responsive bases are covered; upload progress remains intentionally omitted. |
| `V3-C` external review | Figma-ready for screen-flow bases | Chat, interview request, review candidate, interview feedback, and survey bases now include ready, validation/retry, terminal, token, degraded, empty, sent, and draft-preserved evidence. |
| `V3-D` requisition | Figma-ready for screen-flow bases | Approval/download ready, validation, failure, workflow drift, terminal, used-on-submit, unavailable, and download states are covered. |
| `V3-E` integration token | Figma-ready for screen-flow bases | CV, forms, and job callback bases now include action, validation, conflict, upload failure, persistence failure, terminal, token, unavailable, and responsive ready evidence. |

V3 is now complete for canonical Figma/screen-flow handoff at the route/state level. Remaining backend/API unknowns below are deferred field/schema details and must stay annotated in Figma; they do not block V3 screen-flow base promotion.
