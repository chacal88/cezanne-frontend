# Figma Screen-Flow Handoff Index

## Purpose

This index is the Figma/screen-flow handoff package for the evidence-covered V0-V5 areas that are allowed for drafting.

It consolidates the visual contracts and evidence logs into route/family rows a designer can use to start canonical Figma frames without inventing product behavior. It does not grant production replacement approval.

Project-wide rule:
- `Figma-ready` means enough contract and visual evidence exists to draft canonical Figma screen flows.
- `Figma-ready` does not mean replacement-approved.
- Legacy-backed rows remain blocked from replacement until matched legacy/current/Figma pixel parity is confirmed or a product exception records the affected route/family/gap id. Focused route approvals may use existing Figma/auth references as complementary evidence when the legacy system is the canonical source and no new Figma production is created for the route.
- Backend payloads, provider schemas, permissions beyond the documented capability contract, and API fields remain deferred unless already confirmed in source/specs.

## Sources

| Source | Role |
|---|---|
| `figma-handoff-released-areas-change.md` | Active design-production change for the released V0 partial, V1, V3, V4, and V5 desktop handoff package |
| `pre-figma-flow-review.md` | Route-by-route review status and promotion gate |
| `visual-evidence-capture-plan.md` | Evidence schema and Figma-ready promotion rules |
| `v0-auth-shell-dashboard-visual-contract.md` through `v5-sysadmin-platform-visual-contract.md` | Version-owned visual contracts |
| `visual-evidence-v0-auth-shell-dashboard.md` | V0 evidence and sub-block decisions |
| `visual-evidence-v1-jobs.md` | V1 Jobs evidence and route decisions |
| `visual-evidence-v2-candidates.md` and `visual-evidence-v2-candidates-recapture-2026-04-22-parity-pass.md` | V2 behavior evidence and parity blockers |
| `visual-evidence-v3-public-external-token.md` | V3 public/external/token evidence |
| `visual-evidence-v4-operations.md` | V4 operations evidence |
| `visual-evidence-v5-sysadmin-platform.md` | V5 SysAdmin/platform evidence |
| `screen-design-flow-matrix.md` | Contract-first design-flow bridge |

## Evidence Manifests

| Version | Evidence assets | Status for this handoff |
|---|---|---|
| V0 | `visual-evidence-assets/v0/v0-capture-manifest.json`, `visual-evidence-assets/v0/v0-state-hooks-manifest.json` with 90 state-hook records, focused `/forgot-password` same-run manifest `visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/capture-manifest.json`, focused login/reset/session-loss manifest `visual-evidence-assets/v0/auth-same-run-2026-04-23/capture-manifest.json`, focused `/confirm-registration` same-run manifest `visual-evidence-assets/v0/confirm-registration-same-run-2026-04-23/capture-manifest.json`, focused register same-run manifest `visual-evidence-assets/v0/register-same-run-2026-04-23/capture-manifest.json`, focused invite-token current-only manifest `visual-evidence-assets/v0/invite-token-same-run-2026-04-23/capture-manifest.json`, and focused provider callback manifest `visual-evidence-assets/v0/provider-callback-same-run-2026-04-23/capture-manifest.json` | Covered sub-blocks may draft; `/logout` and `/forgot-password` are replacement-approved only by focused evidence records |
| V1 | `visual-evidence-assets/v1/v1-capture-manifest.json` with 37 targets plus current/legacy screenshots | Jobs rows may draft |
| V2 | `visual-evidence-assets/v2/v2-capture-manifest.json`, `visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/`, and same-run review assets under `visual-evidence-assets/v2/same-run-2026-04-23-side-by-side/` | Excluded from final Figma-ready promotion; structural blocker reduced to polish residual |
| V3 | `visual-evidence-assets/v3/v3-capture-manifest.json`, `v3-a-lifecycle-manifest.json`, `v3-follow-up-manifest.json`, 122 total screenshots | Public/external/token rows may draft |
| V4 | `visual-evidence-assets/v4/v4-capture-manifest.json`, `visual-evidence-assets/v4/interactive-2026-04-22/interactive-capture-manifest.json`, 163 total records | Operations rows may draft |
| V5 | `visual-evidence-assets/v5/v5-capture-manifest.json`, `visual-evidence-assets/v5/state-hooks-2026-04-23/v5-state-hooks-manifest.json` with 124 state-hook records | Desktop current-app SysAdmin/platform rows may draft |

## V0 Covered Auth, Shell, Dashboard Sub-Blocks

| Route/sub-block | Source evidence | Target Figma drafting status | Deferred unknowns | Replacement blockers |
|---|---|---|---|---|
| Primary login `/` desktop plus deterministic non-happy login states | `visual-evidence-v0-auth-shell-dashboard.md`; current and legacy login captures; `v0-state-hooks-manifest.json` login records | Figma-ready for covered current-app states | Auth error taxonomy, 2FA delivery/lockout, SSO-mandatory policy copy, activation/setup reason payloads | Final legacy/current/Figma pixel parity and backend policy/copy |
| Token-flow state map for `/forgot-password`, `/reset-password/:token`, `/confirm-registration/:token`, `/register`, `/register/:token`, `/users/invite-token` | V0 evidence log; 45 token-flow state-hook screenshots; focused `/forgot-password` same-run capture; focused `/reset-password` same-run capture; focused `/confirm-registration` same-run capture; focused register same-run capture; focused invite-token current-only capture | Figma-ready as current-app state map; `/forgot-password` is Pixel-parity-approved for focused desktop states; `/reset-password` remains blocked; `/confirm-registration` continuation decision/evidence exists but replacement remains blocked; register evidence exists but replacement remains blocked; `/users/invite-token` is current-only until canonical alias status is confirmed | Invite continuation field parity, token backend schemas outside approved confirm-registration continuation and approved `/forgot-password` enum, final reset-token lifecycle enum | Legacy terminal/continuation parity where a matching legacy route exists, final matched Figma comparison, register/confirm/invite Figma evidence, and backend/product/Figma closure for token routes other than `/forgot-password` |
| Cezanne and SAML launch/callback transitions | V0 evidence log; SAML launch/error captures; Cezanne missing-tenant/callback captures; 15 SSO/callback hook screenshots; focused provider callback same-run/reference capture | Figma-ready as current-app transition map; replacement remains blocked | Provider popup framing, provider-specific payload/error copy, callback exchange contracts | Final legacy/reference parity where the legacy state exists, matched Figma comparison, and backend/provider closure |
| Logout and session loss | `/logout` post-handoff login capture; `/session-lost` state-hook capture; focused `/session-lost` current capture plus legacy route probe | Figma-ready for covered transitions; `/logout` Pixel-parity-approved only for explicit handoff | Session expiry policy and final copy | `/session-lost` and every non-logout auth state remain unapproved |
| Shell/account profile states for `/user-profile`, `/hiring-company-profile`, `/recruitment-agency-profile` | V0 evidence log; 21 user/company/agency profile hook screenshots | Figma-ready as current-app state map | Persistence APIs, server validation schemas, account-menu interaction details | Sidebar/topbar/account-menu parity and matched legacy/current/Figma review |
| Dashboard `/dashboard` desktop base | Current API-backed dashboard capture and authenticated legacy dashboard seeded capture | Figma-ready for desktop base | Final dashboard aggregates, calendar source, activity feed source, inbox summary source | Live data parity, shell/dashboard layout parity, breakpoint parity |
| Notifications `/notifications` resolver categories | Current seeded notification resolver screenshots; explicit V0 fixture acceptance | Figma-ready for fixture-backed resolver map | Live notification API and destination payload contract | Replacement parity and live backend-backed resolver evidence |
| Inbox `/inbox?conversation=` empty/selected states | Current seeded empty and selected-conversation screenshots; explicit V0 fixture acceptance | Figma-ready for fixture-backed empty/selected map | Live conversation list/detail/send transport, provider-blocked send states | Replacement parity and live transport evidence |

## V1 Jobs Rows

| Route/family | Source evidence | Target Figma drafting status | Deferred unknowns | Replacement blockers |
|---|---|---|---|---|
| `/jobs/:type?page&search&asAdmin&label` | `visual-evidence-v1-jobs.md`; `v1-capture-manifest.json`; current list ready/loading/empty/degraded/stale/unavailable/denied captures; legacy list reference | Figma-ready for Jobs list screen-flow/base-frame rows | Final table columns, production aggregates, pagination contract, source-health payload | Legacy/current/Figma pixel parity and backend table schema confirmation |
| `/jobs/manage/:id?resetWorkflow` and create/copy variants | V1 evidence log; current create/copy/reset/save lifecycle captures; legacy authoring reference | Figma-ready for authoring base-frame rows | Full job form schema, validation copy, copy/reset payloads, publish provider result payloads | Legacy form/layout parity and backend form/provider contract confirmation |
| `/job/:id?section` | V1 evidence log; current overview/section/degraded/unavailable/transition/assignment captures; legacy detail reference | Figma-ready for detail hub base-frame rows | Job aggregate schema, section payloads, final activity/calendar fields | Legacy detail composition parity and backend aggregate contract confirmation |
| `/job/:id/bid` and `/job/:id/bid/:bid_id` | V1 evidence log; bid create/view captures | Figma-ready for task-shell rows | Bid create/detail payloads | Legacy task parity if a legacy state exists and backend bid contract confirmation |
| `/job/:id/cv` and `/job/:id/cv/:cv_id` | V1 evidence log; CV create/view captures | Figma-ready for task-shell rows | CV payload, document body/schema, signed asset behavior | Legacy task parity if a legacy state exists and document/backend contract confirmation |
| `/job/:id/cv-reject/:cv_id` | V1 evidence log; reject ready and failure/retry captures | Figma-ready for task-shell row | Reject reason catalog and mutation payload | Legacy reject parity and backend reason contract confirmation |
| `/job/:id/cv/:cv_id/schedule` | V1 evidence log; schedule ready/failure captures; schedule readiness fixture hooks runtime-covered | Figma-ready for task-shell/base-frame row | Slot selection, conflicts, provider-blocked/degraded/unavailable labels, remediation copy | Legacy schedule parity and provider/calendar contract confirmation |
| `/job/:id/cv/:cv_id/offer` | V1 evidence log; offer ready and success/parent-refresh captures | Figma-ready for task-shell/base-frame row | Offer payload, contract document details, signing downstream status | Legacy offer parity and contract-signing backend confirmation |
| `/build-requisition` | V1 evidence log; build requisition capture | Figma-ready for route-state base-frame row | Requisition payload, data-loss warning specifics, HRIS readiness labels | Replacement parity and requisition/HRIS contract confirmation |
| `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` | V1 evidence log; workflow/stage and stale-workflow captures | Figma-ready for route-state base-frame row | Workflow/stage payloads, drift taxonomy, HRIS mapping details | Replacement parity and workflow/HRIS backend contract confirmation |

## V2 Candidate Rows

V2 is still intentionally excluded from final Figma-ready promotion in this handoff, but the latest same-run review no longer treats Candidates as a broad structural parity miss. The remaining blocker is now a polish-level residual centered on `database-ready`, plus smaller detail/action refinements that still need explicit acceptance or one more parity pass.

| Route/family | Source evidence | Target Figma drafting status | Deferred unknowns | Replacement blockers |
|---|---|---|---|---|
| `/candidate/:id/:job?/:status?/:order?/:filters?/:interview?` | `visual-evidence-v2-candidates.md`; parity-pass recapture; legacy candidate detail references | Not Figma-ready; behavior evidence only | Candidate aggregate schema, panel payloads, document/CV schemas, survey/custom-field/collaboration fields | Side-by-side legacy parity still blocked for shell width, profile/card details, hiring flow, CV/tab proportions, action/menu details, and missing denied/unavailable/stale/mobile coverage |
| `/candidates-database?query&page` | V2 evidence log; parity-pass database recapture; legacy database reference | Not Figma-ready; behavior evidence only | Database columns, facets, advanced query DSL, bulk mutation schemas, ATS duplicate/import payloads | Side-by-side legacy parity still blocked for exact icons, column widths, bulk toolbar geometry, menu spacing, selected-column behavior, data/state coverage |
| Candidate schedule action routes | V2 evidence log; parity-pass schedule modal route; legacy schedule reference | Not Figma-ready; behavior evidence only | Calendar provider readiness labels, slots, conflicts, submission payloads | Exact legacy wizard dimensions, header/stepper, card internals, copy, metadata, footer behavior |
| Candidate offer action routes | V2 evidence log; parity-pass offer modal route | Not Figma-ready; behavior evidence only | Offer/contract payloads, terminal/read-only variants | Authenticated legacy offer comparison and exact modal composition parity |
| Candidate reject action routes | V2 evidence log; parity-pass reject modal route; legacy reject references | Not Figma-ready; behavior evidence only | Reject reason catalog, editor payload, terminal/read-only variants | Exact editor controls, chip layout, modal dimensions, reject action/footer behavior |
| Candidate detail modal/action hooks for email, review request, move, hire, unhire, upload CV, score now | V2 parity-pass recapture and safe fixture hooks | Not Figma-ready; behavior evidence only | Mutation payloads, upload API, review/move/hire/unhire schemas | Exact legacy action/modal parity and destructive mutation boundaries |

## V3 Public, External, and Token Rows

| Route/family | Source evidence | Target Figma drafting status | Deferred unknowns | Replacement blockers |
|---|---|---|---|---|
| Shared public token lifecycle components | `visual-evidence-v3-public-external-token.md`; V3 capture, lifecycle, and follow-up manifests | Figma-ready for shared lifecycle base frames | Route-specific token payloads and terminal copy details | Legacy/reference parity where a matching legacy state exists |
| `/chat/:token/:user_id` | V3 evidence log; desktop, mobile, narrow, empty, sent, draft-preserved, send-failed captures | Figma-ready for screen-flow/base frames | Participant identity fields, live transport, delivery error taxonomy | Replacement parity if legacy/reference chat exists |
| `/interview-request/:scheduleUuid/:cvToken` | V3 evidence log; ready, failure, terminal, missing context, invalid/decline captures | Figma-ready for screen-flow/base frames | Schedule context fields, decision payloads, terminal copy | Replacement parity where legacy/reference exists |
| `/review-candidate/:code` | V3 evidence log; ready, validation, submission failure, completed, missing schema, inaccessible captures | Figma-ready for screen-flow/base frames | Review schema, answer payloads, scoring outcome fields | Replacement parity where legacy/reference exists |
| `/interview-feedback/:code` | V3 evidence log; ready, validation/submission failure, scoring-pending, missing template captures | Figma-ready for screen-flow/base frames | Feedback schema, scoring taxonomy, answer payloads | Replacement parity where legacy/reference exists |
| `/shared/:jobOrRole/:token/:source` | V3 evidence log; shared job ready, invalid source, unavailable, used token, responsive captures | Figma-ready for screen-flow/base frames | Public job presentation fields and source payload | Replacement parity where legacy/reference exists |
| `/:jobOrRole/application/:token/:source` | V3 evidence log; ready, validation, upload failures, submission failure, completion, uploaded-file re-entry, responsive captures | Figma-ready for screen-flow/base frames | Applicant schema, upload provider fields, upload progress semantics, metadata persistence schema | Replacement parity where legacy/reference exists |
| `/surveys/:surveyuuid/:jobuuid/:cvuuid` | V3 evidence log; ready, validation, submit failure, completion, missing schema, degraded, expired captures | Figma-ready for screen-flow/base frames | Survey question schema and answer payloads | Replacement parity where legacy/reference exists |
| `/job-requisition-approval?token` | V3 evidence log; approval, rejection validation, submit failure, workflow drift, terminal, used-on-submit captures | Figma-ready for screen-flow/base frames | Approval summary fields, workflow drift taxonomy, mutation payloads | Replacement parity where legacy/reference exists |
| `/job-requisition-forms/:id?download` | V3 evidence log; view/download, failure, invalid/not-found/unavailable/already-downloaded captures | Figma-ready for screen-flow/base frames | Document schema, signed download/storage fields | Replacement parity where legacy/reference exists |
| `/integration/cv/:token/:action?` | V3 evidence log; interview/offer/action/validation/conflict/completion/token captures | Figma-ready for screen-flow/base frames | CV action payloads, provider conflict taxonomy | Replacement parity where legacy/reference exists |
| `/integration/forms/:token` | V3 evidence log; step, validation, upload handshake/binary/persistence failure, completion/used token captures | Figma-ready for screen-flow/base frames | Requested forms/documents schemas and upload provider details | Replacement parity where legacy/reference exists |
| `/integration/job/:token/:action?` | V3 evidence log; ready, action echo, locked/unavailable, invalid token, responsive captures | Figma-ready for screen-flow/base frames | Integration job payload and provider action fields | Replacement parity where legacy/reference exists |

## V4 Operations Rows

| Route/family | Source evidence | Target Figma drafting status | Deferred unknowns | Replacement blockers |
|---|---|---|---|---|
| `/settings/agency-settings` | `visual-evidence-v4-operations.md`; baseline and interactive settings captures | Figma-ready for current-app screen-flow base | Agency settings persistence schema | Legacy parity where legacy-backed and backend schema confirmation |
| `/settings/careers-page`, `/settings/application-page`, `/settings/job-listings`, `/settings/job-listings/edit/:uuid` | V4 evidence log; settings and job listing save/publish captures | Figma-ready for current-app screen-flow base | Public reflection payload, job listing schema, publish/unpublish payloads | Replacement parity where legacy-backed and public reflection contract confirmation |
| `/templates` and template detail/subsections | V4 evidence log; baseline plus save failure/retry/saved interaction captures | Figma-ready for current-app screen-flow base | Template schemas, smart/diversity/interview scoring subsection payloads | Replacement parity where legacy-backed and backend schema confirmation |
| `/parameters/:settings_id?/:section?/:subsection?` | V4 evidence log; compatibility captures | Figma-ready as compatibility annotation to canonical settings targets | Legacy subsection payload mappings | Do not create standalone monolithic `/parameters` replacement frames |
| Hiring flow, custom fields, reject reasons settings | V4 evidence log; validation/save/retry/saved captures | Figma-ready for current-app screen-flow base | Mutation schemas and downstream impact payloads | Replacement parity where legacy-backed and backend schema confirmation |
| API endpoints settings | V4 evidence log; validation, save error, saved captures | Figma-ready for current-app screen-flow base | Credential storage and header/endpoint schema | Replacement parity where legacy-backed; no secret fields in Figma |
| Forms/docs controls | V4 evidence log; empty, stale, degraded, unavailable, save failure/retry/saved captures | Figma-ready for current-app screen-flow base | File/form schemas and downstream document contracts | Replacement parity where legacy-backed and backend schema confirmation |
| Requisition workflow settings | V4 evidence log; baseline settings captures | Figma-ready for current-app screen-flow base | HRIS mapping and workflow config schemas | Must stay separate from jobs-side requisition execution |
| `/integrations` and `/integrations/:id` | V4 evidence log; provider index/detail, config, auth, diagnostics, readiness, unsupported captures | Figma-ready for current-app screen-flow base | Provider list/config schemas, credential storage, diagnostic log schema, OAuth details | Replacement parity where legacy-backed; no raw credentials/logs/provider payloads |
| `/hiring-company/report/:id?` and `/report/:family` rows | V4 evidence log; report index/family/result/export/schedule captures | Figma-ready for current-app screen-flow base | Metrics/dimensions, export/schedule payloads, legacy report id mappings | Replacement parity where legacy-backed and backend report contract confirmation |
| `/billing`, `/billing/upgrade`, `/billing/sms`, `/billing/card/:id` | V4 evidence log; billing overview, upgrade, SMS, card, challenge/failure/retry captures | Figma-ready for current-app screen-flow base | Payment provider challenge details, card tokenization fields, invoice/tax/history schemas | Replacement parity where legacy-backed; provider-owned payment fields remain placeholders |
| `/team`, `/team/recruiters`, `/users/invite` | V4 evidence log; team, recruiter visibility, invite, empty/stale/unavailable/denied captures | Figma-ready for current-app screen-flow base | Member schemas, role write policy, recruiter visibility filter contract, invite mutation payload | Replacement parity where legacy-backed and org membership backend confirmation |
| `/favorites`, `/favorites/:id`, `/favorites/request/:id?` | V4 evidence log; list/detail/request and terminal/unavailable captures | Figma-ready for current-app screen-flow base | Favorite ownership fields and request mutation payloads | Replacement parity where legacy-backed; keep separate from platform favorite-request queue |
| `/jobmarket/:type` | V4 evidence log; RA marketplace fill/bidding/cvs/assigned/unknown captures | Figma-ready for current-app screen-flow base | Marketplace item schemas, bidding/CV/assignment actions | Replacement parity where legacy-backed and marketplace contract confirmation |

## V5 Desktop Current-App SysAdmin/Platform Rows

| Route/family | Source evidence | Target Figma drafting status | Deferred unknowns | Replacement blockers |
|---|---|---|---|---|
| `/users?page&search&hiringCompanyId&recruitmentAgencyId` | `visual-evidence-v5-sysadmin-platform.md`; baseline users list; 124-record state-hook manifest family subset | Figma-ready for desktop current-app screen-flow/base frame | User columns, role schema, tenant assignment fields | Backend schema, responsive/mobile scope, legacy parity where applicable |
| `/users/new` | V5 evidence log; create route shell and create lifecycle hooks | Figma-ready for desktop current-app base frame | Create payload and validation schema | Backend schema, responsive/mobile scope, legacy parity where applicable |
| `/users/:id` | V5 evidence log; detail shell and not-found/stale/permission-denied hooks | Figma-ready for desktop current-app base frame | Detail schema and permission payloads | Backend schema, responsive/mobile scope, legacy parity where applicable |
| `/users/edit/:id` | V5 evidence log; edit shell and saving/success/cancelled/error/permission-denied hooks | Figma-ready for desktop current-app base frame | Update payload, role/tenant assignment schema | Backend schema, responsive/mobile scope, legacy parity where applicable |
| `/favorites-request` | V5 evidence log; queue pending/resolved/rejected/stale/inaccessible/empty/error/action-failure hooks | Figma-ready for desktop current-app base frame | Queue item schema and action readiness payloads | Backend schema, responsive/mobile scope, legacy parity where applicable |
| `/favorites-request/:id` | V5 evidence log; detail pending/resolved/rejected/action-failure hooks | Figma-ready for desktop current-app base frame | Detail schema, approve/reject/reopen payloads | Backend schema, responsive/mobile scope, legacy parity where applicable |
| `/hiring-companies`, `/hiring-companies/:id`, `/hiring-companies/edit/:id` | V5 evidence log; baseline and state hooks for list/detail/edit | Figma-ready for desktop current-app base frame | Company list/detail/update schemas | Backend schema, responsive/mobile scope, legacy parity where applicable |
| `/recruitment-agencies`, `/recruitment-agencies/:id`, `/recruitment-agencies/edit/:id` | V5 evidence log; baseline and state hooks for list/detail/edit | Figma-ready for desktop current-app base frame | Agency list/detail/update schemas | Backend schema, responsive/mobile scope, legacy parity where applicable |
| `/subscriptions`, `/subscriptions/:id` | V5 evidence log; baseline and state hooks for list/detail | Figma-ready for desktop current-app base frame | Subscription list/detail schemas | Backend schema, responsive/mobile scope, legacy parity where applicable |
| `/hiring-company/:id/subscription` | V5 evidence log; route-vs-mutation capability labels and mutation hooks | Figma-ready for desktop current-app base frame | Subscription mutation payload and error schema | Backend schema, responsive/mobile scope, legacy parity where applicable |
| `/sectors`, `/sectors/:id` | V5 evidence log; sector list/detail ready/loading/empty/error/denied/not-found/stale/mutation hooks | Figma-ready for desktop current-app base frame | Sector list/detail/update schemas | Backend schema, responsive/mobile scope, legacy parity where applicable |
| `/sectors/:sector_id/subsectors`, `/subsectors/:id` | V5 evidence log; subsector list/detail ready/loading/empty/error/denied/not-found/stale/mutation hooks | Figma-ready for desktop current-app base frame | Subsector list/detail/update schemas and parent-context schema | Backend schema, responsive/mobile scope, legacy parity where applicable |

V5 platform dashboard capture validates platform landing/navigation only. It is not a standalone Figma-ready replacement target in this handoff because platform dashboard copy/polish, denied/unavailable variants, and responsive scope remain unresolved.

## Final V0-V5 Matrix

| Version | Included in this handoff? | Figma drafting status | Replacement approval | Primary remaining blockers |
|---|---|---|---|---|
| V0 | Yes, covered auth/shell/dashboard sub-blocks | Covered sub-blocks may draft | `/logout` explicit handoff and `/forgot-password` focused desktop states only | Backend auth/token/provider/live notification/inbox/dashboard contracts; shell/dashboard/account-menu parity; all non-approved routes remain unapproved |
| V1 | Yes, Jobs screen-flow/base-frame rows | Jobs rows may draft | None approved | Backend job/task/provider/requisition schemas; legacy/current/Figma parity |
| V2 | No | Not Figma-ready | None approved | Candidate database `database-ready` polish residual, smaller detail/action parity refinements, remaining open gaps (`V2-GAP-003`, `013`, `022`, `023`, `031`), and backend/provider schemas |
| V3 | Yes, public/external/token rows | Rows may draft | None approved | Backend schemas and legacy/reference parity where a legacy state exists |
| V4 | Yes, operations rows | Current-app operations rows may draft | None approved | Backend/provider/payment/report/team/favorites/marketplace schemas; legacy parity where legacy-backed |
| V5 | Yes, desktop current-app SysAdmin/platform rows covered by state hooks | Covered desktop rows may draft | None approved | Backend schemas, responsive/mobile scope, platform dashboard polish, legacy parity where applicable |

## Handoff Constraints

- Do not mark any additional legacy-backed route as replacement-approved from this package except focused `/logout` and `/forgot-password` approvals recorded in their dedicated evidence records.
- Do not create standalone Figma frames for alias/reference rows such as legacy `/parameters*`, `/recruiters`, or candidate alias examples.
- Do not infer backend payloads, provider schemas, API fields, final table columns, payment-provider fields, signed URLs, diagnostic logs, message bodies, document bodies, raw tokens, auth codes, or raw provider payloads.
- Public/token rows must stay outside authenticated shell frames.
- Authenticated provider setup must stay separate from public integration token callbacks and operational provider-blocked task states.
- Org billing/team/favorites must stay separate from SysAdmin platform subscriptions/users/favorite-request queues.
- V2 remains blocked from final Figma-ready promotion and must not be used as a canonical Candidates source until a later parity review explicitly resolves or accepts the remaining residual gaps.
