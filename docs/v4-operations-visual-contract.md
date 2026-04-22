# V4 Operations Visual Contract

## Purpose

This document is the V4 visual-readiness package from `pre-figma-flow-review.md`. It prepares operational authenticated-shell modules for Figma/screen-flow work without using Figma as a source of product behavior.

V4 covers:
- settings and operational settings subsections;
- authenticated integrations provider setup/admin shell;
- reports and analytics families;
- billing, subscription upgrade, SMS add-on, and card management;
- team, recruiter visibility, and org invite management;
- org favorites and favorite requests;
- RA marketplace lists.

## Readiness status

| Family | Contract status | Visual status | Figma-ready? | Notes |
|---|---|---|---|---|
| Settings | Contract-reviewed | Evidence complete for current-app screen-flow basis | Yes | Route-base, compatibility, validation/save/retry/saved, forms/docs state, API endpoint, job-listing, and representative denied states are captured. |
| Integrations admin | Contract-reviewed | Evidence complete for current-app screen-flow basis | Yes | Provider index/detail, supported/unsupported states, save/auth/diagnostics/readiness outcomes, and safe logs-ready summaries are captured. |
| Reports | Contract-reviewed | Evidence complete for current-app screen-flow basis | Yes | Report index/family/result states, export/schedule success, failed/retryable command state, stale/partial blocking, unsupported scheduling, and compatibility entries are captured. |
| Billing | Contract-reviewed | Evidence complete for current-app screen-flow basis | Yes | Overview, upgrade, SMS, card variants, provider challenge, pending/success/failure/retry, stale/degraded/unavailable, card-blocked, and denied/hidden states are captured. |
| Team | Contract-reviewed | Evidence complete for current-app screen-flow basis | Yes | Org team, recruiter visibility, invite base states, empty/stale/unavailable/refresh-required states, action readiness, and denied/fallback examples are captured. |
| Favorites | Contract-reviewed | Evidence complete for current-app screen-flow basis | Yes | Org favorites list/detail/request workflows, empty/unavailable states, request terminal variants, and org/platform separation are captured. |
| Marketplace | Contract-reviewed | Evidence complete for current-app screen-flow basis | Yes | RA marketplace list types, empty state, unknown-type unavailable, and HC denied fallback are captured. |

## Evidence sources

| Evidence | Source | How it may be used | Limit |
|---|---|---|---|
| Route and state contracts | `pre-figma-flow-review.md`, `screens.md`, `modules.md`, `capabilities.md` | Canonical product behavior for V4 modules | Must not be overridden by screenshots. |
| OpenSpec specs | Settings, integrations, reports, billing, team, favorites, and marketplace specs under `../../openspec/specs` | Required state/action/error/parent-return coverage | Specs do not define final layout. |
| Operational specs | Provider setup/readiness, downstream impact, report export/schedule, payment, messaging, survey/review, ATS source specs | Operational state semantics consumed by V4 modules | Do not invent provider/payment/backend schemas. |
| Current greenfield source | `src/domains/settings/**`, `src/domains/integrations/**`, `src/domains/reports/**`, `src/domains/billing/**`, `src/domains/team/**`, `src/domains/favorites/**`, `src/domains/marketplace/**` | Runtime state and current UI behavior | Fixture-backed or adapter-backed data remains a seam. |
| Current visual evidence | `visual-evidence-v4-operations.md`, `visual-evidence-assets/v4/v4-capture-manifest.json`, `visual-evidence-assets/v4/interactive-2026-04-22/interactive-capture-manifest.json` | Current-app route-base, state-variant, and safe local-fixture interaction evidence for V4 operations | Promotes V4 current-app screen-flow bases to `Figma-ready`; backend/provider/schema details remain annotated as deferred. |

## Settings frame set

| Surface | Required states | Visual rule | Backend/API unknowns |
|---|---|---|---|
| `/settings/agency-settings` | ready, dirty, saving, saved, save-failed, retry, denied, degraded, stale | Canonical RA settings route; legacy `/recruiters` is not a standalone screen. | Persistence schema unknown. |
| `/templates` and details/subsections | index/detail/subsection, ready, validation, save failure/retry, success, unavailable subsection | Smart/diversity/interview scoring subsections must remain template-owned. | Template schema unknown. |
| `/parameters/:settings_id?/:section?/:subsection?` | canonical subsection mapping, unknown/unimplemented/unauthorized fallback, dashboard fallback | Compatibility container, not a monolithic settings screen. | Legacy subsection payloads unknown. |
| Careers/application/job-listings settings | brand/headline editing, application settings, job listing list/editor, draft/save/publish/unpublish, provider-blocked, public reflection pending/confirmed | Public reflection panel must show pending/confirmed intent without claiming instant public sync. | Public preview/job listing schema unknown. |
| Hiring flow/custom fields/reject reasons | list/config editing, validation, submission failure/retry, success, downstream impact note | Show downstream impact explicitly; do not execute jobs/candidates flow here. | Mutation schemas unknown. |
| API endpoints | loading, ready, empty, validation error, saving, saved, save error, denied, unavailable | Show HTTPS/header validation without exposing secret values. | Credential storage contract unknown. |
| Forms/docs controls | ready, empty, unavailable, stale, degraded, denied, validation, failure/retry, success with refresh-required | Surface downstream impact and unknown contract fields. | File/form schema unknown. |
| Requisition workflows | settings-owned config, loading, empty, saving, saved, error, denied, stale-workflow, HRIS readiness | Keep separate from jobs-side requisition execution. | HRIS mapping schema unknown. |

## Integrations admin frame set

| Surface | Required states | Visual rule | Backend/API unknowns |
|---|---|---|---|
| `/integrations` | provider list, supported/unsupported provider families, connected/disconnected/degraded/unavailable, denied | Authenticated provider setup index only. | Provider list schema unknown. |
| `/integrations/:id` configuration | ready, dirty, validation error, saving, save error, saved | Do not expose raw credentials; masked/sealed fields only. | Credential shape/storage unknown. |
| Provider auth lifecycle | disconnected, auth pending, auth failure, connected, reauth required, unavailable | Auth launch/callback state must remain setup-owned. | Provider OAuth details unknown. |
| Diagnostics/readiness | diagnostics passed/failed/logs-ready/unavailable, readiness ready/degraded/blocked/unavailable | Operational consumers may link to setup remediation but must not inline setup. | Diagnostic log schema unknown. |
| Unsupported provider | unsupported provider family, not implemented custom provider | Show controlled unsupported state, not placeholder debt. | None. |

## Reports frame set

| Surface | Required states | Visual rule | Backend/API unknowns |
|---|---|---|---|
| `/hiring-company/report/:id?` | compatibility redirect/index, known report family target, unknown id fallback | Visuals should use canonical `/report/:family`, not a separate legacy report screen. | Legacy report id mapping unknown. |
| `/report/jobs` | filters, loading, ready, empty, partial, stale, degraded, denied, unavailable, export, schedule | Jobs report family-specific filters and result panels. | Metrics/dimensions schema unknown. |
| `/report/hiring-process` | period/owner/team filters, result states, export/schedule lifecycle | Keep command failures separate from result failures. | Export/schedule payload unknown. |
| `/report/teams` | team/owner filters, result states, stale/partial command blocking | Parent `/report` must be explicit. | Team metric schema unknown. |
| `/report/candidates` | candidate-report filters, result states, retryable command failure | Do not infer candidate metric fields. | Result schema unknown. |
| `/report/diversity` and `/report/source` | beta signal, result states, export available, schedule unsupported | Unsupported scheduling is intentional, not an error. | Metrics/dimensions schema unknown. |

## Billing frame set

| Surface | Required states | Visual rule | Backend/API unknowns |
|---|---|---|---|
| `/billing` overview | loading, ready, empty, denied, unavailable, stale, degraded, pending-change, plan/SMS/card summaries | Org commercial billing, not SysAdmin platform subscription admin. | Invoice/tax/payment history unknown. |
| `/billing/upgrade` | same-plan blocked, card-blocked, confirmation, submitted, success, failure, retry, provider challenge, stale/degraded/denied/unavailable | Selected plan preservation and parent refresh must be explicit. | Payment/provider challenge details unknown. |
| `/billing/sms` | inactive, trial, active, usage-warning, suspended, card-blocked, pending, success, partial-success, failed, retry, stale/degraded/denied/unavailable | Usage threshold and enable/disable/update-limit readiness must be visible. | SMS billing payload unknown. |
| `/billing/card/:id` | existing/backup/primary/new, missing, expired, unavailable, validation failed, provider challenge, pending, saved, failed, retry | Shell-aware card route; final modal/drawer/full-frame decision pending. | Tokenization/card provider fields unknown. |

## Team frame set

| Surface | Required states | Visual rule | Backend/API unknowns |
|---|---|---|---|
| `/team` | active/pending/disabled members, pending invites, ready, empty, denied, unavailable, degraded, stale, retryable, refresh-required | Org-scoped; no platform user administration. | Member schema/role write policy unknown. |
| `/team/recruiters` | filters all/visible/limited/hidden, counts, assignment ready/pending/blocked, empty/denied/unavailable/degraded/stale/retryable | Runtime canonical recruiter visibility route; legacy `/recruiters` is not standalone. | Recruiter visibility filter contract unknown. |
| `/users/invite` | draft, pending, sent, revoked, blocked, resend/revoke readiness, membership adjacency, denied/unavailable | Org invite task flow; public invite acceptance is `/users/invite-token`; platform users are `/users*`. | Invite mutation payload unknown. |

## Favorites frame set

| Surface | Required states | Visual rule | Backend/API unknowns |
|---|---|---|---|
| `/favorites` | personal/org-shared/recruiter-linked favorites, ready, empty, unavailable, create request link | Org-scoped favorites, separate from platform request queue. | Ownership fields unknown. |
| `/favorites/:id` | ready detail, unavailable/outside-org fallback, parent return | Do not leak outside-org favorite data. | Detail schema unknown. |
| `/favorites/request/:id?` | draft, submitted, pending, approved, rejected, unavailable, submit/cancel/resubmit readiness | Org request workflow, not SysAdmin queue. | Request mutation payload unknown. |

## Marketplace frame set

| Surface | Required states | Visual rule | Backend/API unknowns |
|---|---|---|---|
| `/jobmarket/:type` | supported types `fill`, `bidding`, `cvs`, `assigned`, ready, empty, unavailable, unknown type unavailable | RA-scoped marketplace list; not billing or platform admin. | Item schema, bidding actions, CV handoff, assignment collaboration unknown. |

## Cross-family visual rules

- Keep settings configuration separate from operational execution routes in jobs/candidates/public flows.
- Keep authenticated provider setup separate from public integration token callbacks and operational provider-blocked states.
- Keep org billing separate from SysAdmin platform subscription administration.
- Keep org team/invites/favorites separate from platform user CRUD and platform favorite-request queues.
- Keep report compatibility routes as compatibility/redirect annotations unless a canonical report frame is explicitly required.
- Do not show raw credentials, provider payloads, diagnostic logs, payment tokens, card PAN data, report raw exports, invite identifiers, or tenant-sensitive backend payloads.

## Responsive assumptions

| Viewport | Requirement |
|---|---|
| Desktop primary | V4 modules are desktop-first authenticated shell admin/operations screens. |
| Narrow desktop/tablet | Preserve tab/subsection navigation, tables/cards, save/retry actions, parent return, and blocked-state remediations. |
| Mobile | Out of scope for V4 Figma-ready unless product confirms mobile parity. |

## Non-goals

- Do not design final backend schemas for settings payloads, provider credentials, diagnostics logs, report metrics, export/schedule jobs, payment/card tokenization, team members, favorites, or marketplace items.
- Do not implement code from this visual contract.
- Do not convert legacy aliases into standalone screens.
- Do not merge setup/configuration screens with operational task execution.

## Required outputs before marking V4 rows `Figma-ready`

1. Settings visual map for all route families, compatibility container behavior, save/validation/retry, stale/degraded, and downstream-impact states.
2. Integrations admin visual map for provider index/detail/config/auth/diagnostics/readiness/unsupported states.
3. Reports visual map for family filters/results/export/schedule/unsupported scheduling and compatibility route handling.
4. Billing visual map for overview/upgrade/SMS/card states, including provider challenge and card-blocked paths.
5. Team/favorites visual map for org membership, recruiter visibility, invites, org favorites, and request workflows.
6. Marketplace visual map for supported list types, empty/unavailable, and unknown-type handling.
7. Updated `pre-figma-flow-review.md` rows from `Contract-reviewed` to `Figma-ready` only for states covered by the evidence above.
