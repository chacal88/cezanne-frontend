# Greenfield Frontend Module Map

## Purpose

This document decomposes each greenfield frontend domain into implementation modules.

It answers:
- how each domain breaks into buildable slices
- which modules are route-owning versus supporting
- which modules are required in each release
- which modules provide the capability contracts consumed by `screens.md`

## Source baseline

Synthesized from:
- `./domains.md`
- `./roadmap.md`
- `../../docs/frontend-2/frontend-jobs-domain-specification.md`
- `../../docs/frontend-2/frontend-candidate-domain-specification.md`
- `../../docs/frontend-2/frontend-parameters-settings-domain-decomposition.md`
- `../../docs/frontend-2/frontend-screen-inventory.md`
- `../../docs/frontend-2/frontend-component-inventory-and-ownership-map.md`

## Module conventions

- **Route-owning** modules define route trees and URL contracts.
- **Task** modules define isolated action containers with explicit entry/cancel/success/refresh behavior.
- **Support** modules provide adapters, capability decisions, or shared domain state but do not own top-level routes.
- Capability names below are planning keys; implementation may namespace them by package.

## Domain-to-module inventory

### `auth`

| Module | Type | Owns | Core capabilities | Release |
|---|---|---|---|---|
| `entry` | Route-owning | sign-in and auth launch routes | `canStartSession` | R0 |
| `token-flows` | Route-owning | confirm registration, register, forgot/reset password | `canUseAuthTokenFlow` | R0 |
| `sso-callbacks` | Route-owning | cezanne + saml callback handling | `canCompleteSsoCallback` | R0 |
| `session-bootstrap` | Support | session normalization, post-auth handoff | `canResolvePostAuthLanding` | R0 |

### `shell`

| Module | Type | Owns | Core capabilities | Release |
|---|---|---|---|---|
| `frame` | Route-owning | authenticated app frame and route outlets | `canEnterShell` | R0 |
| `navigation` | Support | role-aware nav, section visibility, active-state rules | `canSeeNavSection` | R0 |
| `notifications` | Support | notification center, typed destination resolver | `canOpenNotifications`, `canResolveNotificationDestination` | R0 |
| `account-context` | Task | user-profile, company/agency profile, logout/session-loss | `canOpenAccountArea`, `canLogout` | R0 |
| `shell-overlays` | Task | shell-owned overlay classes and close/back policy | `canOpenShellOverlay` | R0 |

### `dashboard`

| Module | Type | Owns | Core capabilities | Release |
|---|---|---|---|---|
| `landing` | Route-owning | `/dashboard` and dashboard widgets | `canViewDashboard` | R0 |
| `re-entry` | Support | notification/deep-link return affordances | `canUseDashboardReentry` | R0 |

### `jobs`

| Module | Type | Owns | Core capabilities | Release |
|---|---|---|---|---|
| `list` | Route-owning | jobs list, filter/search/pagination URL state | `canViewJobsList` | R1 |
| `authoring-adapters` | Support | normalized Jobs draft inputs and serializers for create/edit | `canCreateJob`, `canEditJob`, `canResetJobWorkflow` | R1 |
| `authoring` | Route-owning | create/edit/copy/reset-workflow flows | `canCreateJob`, `canEditJob`, `canResetJobWorkflow` | R1 |
| `detail` | Route-owning | job hub, sections, linked summaries | `canViewJobDetail`, `canManageJobState` | R1 |
| `task-overlays` | Task | bid, cv view, schedule, offer, reject from job context | `canOpenJobTask`, `canScheduleInterviewFromJob`, `canCreateOfferFromJob`, `canRejectCvFromJob` | R1 |
| `workflow-state` | Support | requisition branching, publication, assignments, linked task context | `canUseJobRequisitionBranching`, `canManageJobAssignments` | R1-R5 |

### `candidates`

| Module | Type | Owns | Core capabilities | Release |
|---|---|---|---|---|
| `detail-hub` | Route-owning | candidate detail aggregate and section rendering | `canViewCandidateDetail` | R2 |
| `workflow-navigation` | Support | prev/next, ordering, filter-context preservation | `canNavigateCandidateSequence` | R2 |
| `action-launchers` | Task | schedule, offer, reject, move, hire/unhire, review | `canOpenCandidateAction`, `canScheduleInterviewFromCandidate`, `canCreateOfferFromCandidate`, `canRejectCandidate`, `canMoveCandidateStage`, `canHireCandidate`, `canRequestCandidateReview` | R2 |
| `documents-contracts` | Support | CV upload/replace/preview, forms/documents/contracts summaries | `canManageCandidateDocuments`, `canViewCandidateContracts` | R2 |
| `surveys-custom-fields` | Support | surveys, custom fields, interview feedback, scores | `canViewCandidateSurveys`, `canEditCandidateCustomFields`, `canViewInterviewFeedback` | R2 |
| `communication-collaboration` | Support | comments, tags, inbox handoff, lightweight collaboration | `canCommentOnCandidate`, `canTagCandidate`, `canOpenCandidateConversation` | R2 |
| `database-search` | Route-owning | candidate database/list surfaces and preserved search state | `canViewCandidateDatabase`, `canSearchCandidates` | R4 |

### `inbox`

| Module | Type | Owns | Core capabilities | Release |
|---|---|---|---|---|
| `conversation-list` | Route-owning | inbox list and selected conversation URL state | `canViewInbox` | R0 |
| `conversation-entry` | Support | open specific conversation from notification or linked context | `canOpenConversation` | R0 |

### `marketplace`

| Module | Type | Owns | Core capabilities | Release |
|---|---|---|---|---|
| `marketplace-list` | Route-owning | marketplace/fill/bidding/cvs/assigned slices | `canViewMarketplace` | R4 |
| `agency-collaboration` | Support | linked agency actions and recruiter assignment context | `canUseAgencyCollaboration` | R4 |

### `public-external`

| Module | Type | Owns | Core capabilities | Release |
|---|---|---|---|---|
| `shared-job-view` | Route-owning | shared/public job page, route-owned bootstrap, application launch handoff | `canOpenSharedJob` | R3 |
| `public-application` | Route-owning | application submission, attachments, recoverable submit, stable completion | `canSubmitPublicApplication` | R3 |
| `public-survey` | Route-owning | survey continuation, retry, stable completion | `canCompletePublicSurvey` | R3 |
| `external-chat` | Route-owning | tokenized external chat bootstrap, grouped conversation rendering, same-route send/retry flow, and explicit inaccessible token/conversation outcomes for `/chat/:token/:user_id` | `canUseExternalTokenizedChat` | R3 |
| `token-state-support` | Support | canonical `valid`/`invalid`/`expired`/`used`/`inaccessible` interpretation and recovery messaging | public route decision keys | R3 |
| `public-route-support` | Support | route helpers, adapters, serializers, notification-ownership rules, upload/submission workflow contract, correlation-aware request reuse | public route decision keys | R3 |
| `external-review` | Route-owning | interview request decision flow, review-candidate serializer/bootstrap, interview-feedback serializer/bootstrap, stable terminal read-only states | `canUseExternalReviewFlow` | R3 |
| `requisition-approval` | Route-owning | tokenized requisition approval route bootstrap, workflow-aware access/readiness, approve/reject submission, workflow-drift recovery, and stable terminal outcomes for `/job-requisition-approval?token` | `canApproveRequisitionByToken` | R3-R5 |
| `requisition-forms-download` | Route-owning | public requisition forms/download route bootstrap, token/form access states, explicit download action, same-route retry, and document-oriented already-downloaded state for `/job-requisition-forms/:id?download` | `canDownloadRequisitionFormsByToken` | R5 |

### `settings`

| Module | Type | Owns | Core capabilities | Release |
|---|---|---|---|---|
| `settings-container` | Route-owning | `/parameters` compatibility entry, closed recognized subsection inventory, matched/unknown/unauthorized/unavailable/unimplemented resolution, stable fallback, and subsection-level deny behavior without owning feature UI | `canEnterSettings` plus resolved subsection capability | R3-R5 |
| `operational-settings-substrate` | Support | shared subsection registry, compatibility parsing, dedicated-route metadata, and save/retry/readiness workflow helpers for operational settings | `canEnterSettings` plus subsection-specific capabilities | R4 |
| `user-settings` | Route-owning | profile/preferences/personal controls | `canManageUserSettings` | R4 |
| `company-settings` | Route-owning | company-wide recruiter configuration | `canManageCompanySettings` | R4 |
| `agency-settings` | Route-owning | RA-specific settings | `canManageAgencySettings` | R4 |
| `careers-application` | Route-owning | careers page, application page, job listings | `canManageCareersPage`, `canManageApplicationPage`, `canManageJobListings` | R3 |
| `hiring-flow` | Route-owning | hiring flow and workflow settings as a consumer of the operational settings substrate, including requisition adjacency but not requisition authoring | `canManageHiringFlowSettings` | R4 |
| `custom-fields` | Route-owning | custom-field admin as a consumer of the operational settings substrate, with downstream candidate/public consumers kept explicit but outside this route slice | `canManageCustomFields` | R4 |
| `templates` | Route-owning | shared templates family, including list/detail plus smart-questions, diversity, and interview-scoring subsections as substrate consumers | `canManageTemplates` | R4 |
| `reject-reasons` | Route-owning | reject reasons list/edit flow as a consumer of the operational settings substrate, with downstream reject task flows kept explicit but outside this route slice | `canManageRejectReasons` | R4 |
| `api-endpoints` | Route-owning | API endpoints settings foundation, route-local readiness/validation/save/retry states, and private-token/webhook configuration surface without provider setup ownership | `canManageApiEndpoints` | R5 |
| `forms-docs-controls` | Route-owning | settings subsections for forms/documents and related controls | `canManageFormsDocsSettings` | R4-R5 |

### `integrations`

| Module | Type | Owns | Core capabilities | Release |
|---|---|---|---|---|
| `provider-index` | Route-owning | integrations list | `canViewIntegrations` | R4 |
| `provider-detail` | Route-owning | provider setup/detail/validation plus provider-specific configuration/auth/diagnostics depth for scoped provider families | `canManageIntegrationProvider` | R4 + post-R5 follow-on |
| `provider-family-support` | Support | calendar, job-board, and HRIS configuration schemas, auth lifecycle states, diagnostics summaries, safe log/readiness models | `canManageIntegrationProvider` | post-R5 follow-on |
| `token-entry` | Route-owning | `/integration/cv`, `/integration/forms`, `/integration/job` | `canUseIntegrationTokenEntry` | R3 |

### `reports`

| Module | Type | Owns | Core capabilities | Release |
|---|---|---|---|---|
| `report-index` | Route-owning | report landing and family selection | `canViewReports` | R4 |
| `report-family-pages` | Route-owning | jobs, hiring-process, teams, candidates, diversity, source | `canViewReportFamily` | R4 |
| `exports-scheduling` | Support | export and schedule flows | `canExportReport`, `canScheduleReport` | R4 |

### `billing`

| Module | Type | Owns | Core capabilities | Release |
|---|---|---|---|---|
| `overview` | Route-owning | billing overview | `canViewBilling` | R4 |
| `upgrade` | Route-owning | plan upgrade | `canUpgradeSubscription` | R4 |
| `sms` | Route-owning | SMS add-on management | `canManageSmsBilling` | R4 |
| `cards` | Task | card add/edit/manage flow | `canManageBillingCard` | R4 |

### `sysadmin`

| Module | Type | Owns | Core capabilities | Release |
|---|---|---|---|---|
| `companies` | Route-owning | hiring companies list/detail/edit/subscription | `canManageHiringCompanies` | R5 |
| `agencies` | Route-owning | recruitment agencies list/detail/edit | `canManageRecruitmentAgencies` | R5 |
| `subscriptions` | Route-owning | subscription admin | `canManagePlatformSubscriptions` | R5 |
| `taxonomy` | Route-owning | sectors and subsectors | `canManageTaxonomy` | R5 |
| `users` | Route-owning | global users and related admin surfaces | `canManagePlatformUsers` | R5 |
| `favorite-requests` | Route-owning | favorite request admin surfaces | `canManageFavoriteRequests` | R5 |

## Cross-domain modules that must be formalized in R0

These modules block clean R0 execution even when their full UI lands later:

| Module | Why R0 needs it |
|---|---|
| `shell.notifications` | typed destination union must exist before any later route is added |
| `shell.navigation` | top-level discoverability depends on domain and capability registration |
| `jobs.workflow-state` | `jobRequisition` branching changes route topology from the start |
| `candidates.workflow-navigation` | candidate hub URL and return semantics must be designed before R2 |
| `settings.settings-container` | settings cannot remain a single undifferentiated route family |
| `integrations.token-entry` | tokenized route class must be part of the routing model before long-tail implementation |
| `billing.cards` | shell/task-flow route class needs one concrete shell-owned example |

## Planning rule

No release should be planned directly from journeys alone.
Implementation slices must be scheduled at the **module** level, because modules are the smallest units that own:
- route contracts
- capability exports
- adapter boundaries
- explicit success/cancel/refresh behavior

## Current-business-rule anchors from `frontend/`

These module-level confirmations come from the current route definitions and should be preserved in greenfield planning:

- `jobs.list` must preserve dynamic URL state for scope, pagination, search, admin-view, and label filtering.
- `jobs.authoring` must preserve edit/create/copy-style entry, `resetWorkflow`, and resolved dependencies such as sectors, favorites, and company settings.
- `jobs.task-overlays` currently use route-owned modal entry with explicit parent-return semantics; the current R1 code resolves a canonical `JobTaskContext` with a stable parent target before rendering.
- `jobs.workflow-state` is not optional later-wave detail: requisition branching already changes jobs navigation and guarded route access.
- `candidates.detail-hub` must assume a dense aggregate, not a lightweight profile page.
- `candidates.action-launchers` share the same routed modal/parent-return behavior pattern used in jobs task routes.
- `candidates.database-search` is permission-gated today by `seeCandidates` and must remain capability-bound.
- `inbox.conversation-list` must preserve URL-owned conversation selection.
- `settings.settings-container` must be treated as a decomposition target because the legacy route already bundles many unrelated operational concerns.
- `settings.operational-settings-substrate` must freeze subsection routing, fallback, and workflow-state helpers before the first R4 settings pages land.
- `settings.careers-application` is confirmed as a separate route family with stateful job-listings variants and editor entry.
- `settings.hiring-flow`, `settings.custom-fields`, `settings.templates`, and `settings.reject-reasons` must consume the shared substrate rather than invent custom admin shells.
- `integrations.provider-detail` currently behaves like a routed overlay/edit flow over the integrations index.
- `integrations.token-entry` already has multiple unsigned token contracts (`cv`, `forms`, `job`) and should not be collapsed into one generic flow.
- `reports.report-index` and `reports.report-family-pages` already exist as a family, with one legacy aggregate report route plus dedicated family routes.
- `billing.cards` is confirmed as a routed modal flow nested under billing.

## R4 reports foundation module note

The reports modules now have source-level foundation coverage: `report-index` owns `/report`, `report-family-pages` owns `/report/:family`, and `exports-scheduling` owns the shared export/schedule command contract consumed by report family pages.

## R4 org team/users foundation module note

The team/users foundation now has a source-level route-owning module boundary: org team index (`/team`), recruiter visibility (`/team/recruiters`), and invite foundation (`/users/invite`). Invite/membership and favorites follow-on modules must consume this foundation.

## Provider-specific integrations depth implementation note

The `integrations.provider-detail` and `integrations.provider-family-support` modules now include family-aware configuration, auth lifecycle, diagnostics, safe telemetry helpers, and normalized readiness signals for scheduling, publishing, and HRIS sync/workflow consumers. `integrations.token-entry` remains separate and unchanged.
