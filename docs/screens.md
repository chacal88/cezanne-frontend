# Greenfield Frontend Screen Inventory

## Purpose

This document is the executable screen manifest for the greenfield frontend.

It answers, for every route family that must exist in the target product:
- canonical URL
- greenfield route class
- owning domain and module
- visible personas
- primary capability decisions
- feature/entitlement dependencies
- release target
- operational criticality

## Source baseline

Synthesized from:
- `../../docs/frontend-2/frontend-screen-inventory.md`
- `../../docs/frontend-2/frontend-role-to-screen-matrix.md`
- `../../docs/frontend-2/frontend-feature-flag-to-screen-matrix.md`
- `../../docs/frontend-2/frontend-modal-and-child-route-classification.md`
- `./domains.md`
- `./modules.md`
- `./roadmap.md`

## Route-class legend

Greenfield route classes from the roadmap/architecture set:
- `Page`
- `PageWithStatefulUrl`
- `RoutedOverlay`
- `ShellOverlay`
- `TaskFlow`
- `EmbeddedFlow`
- `Public/Token`

## Persona legend

- `Public`
- `External`
- `HC User`
- `HC Admin`
- `RA User`
- `RA Admin`
- `SysAdmin`

## Design-reference contract

Figma is a complementary input to this document, not the canonical source of route coverage.

Use it to:
- validate page vs overlay vs task-flow intent
- confirm screen composition inside a mapped module
- capture visual evidence for already-inventoried routes

Do not use it to:
- replace the route manifest
- infer release ownership by itself
- override documented domain ownership without an explicit update to `domains.md` and `modules.md`

When a relevant Figma frame exists, add a lightweight reference near the route entry using this format:
- `Design ref: Figma file <fileKey>, node <nodeId>`

Initial confirmed examples from `Recruit App Design`:
- Login/auth surface: file `Z3PdFzZu8uahyibzALIAN0`, node `1:2`
- Dashboard/shell surface: file `Z3PdFzZu8uahyibzALIAN0`, node `6:2`
- User-profile shell overlay: file `Z3PdFzZu8uahyibzALIAN0`, node `0:1327`

## Current Figma coverage by domain

Status values:
- `Confirmed` = a concrete frame/node has already been identified
- `Partial` = the shared file appears to contain the surface, but exact screen-to-node mapping is still pending
- `Pending` = no concrete visual evidence has been attached yet

| Domain | Coverage status | Current Figma evidence | Planning note |
|---|---|---|---|
| `auth` | Confirmed | file `Z3PdFzZu8uahyibzALIAN0`, node `1:2` | login/auth entry is visually confirmed |
| `shell` | Confirmed | file `Z3PdFzZu8uahyibzALIAN0`, nodes `6:2`, `0:1327` | shell frame and user-profile overlay are visually confirmed |
| `dashboard` | Confirmed | file `Z3PdFzZu8uahyibzALIAN0`, node `6:2` | dashboard landing is visually confirmed |
| `jobs` | Partial | same shared file; exact jobs nodes to be attached per screen as implementation starts | use Figma to validate list/detail/overlay composition, not route ownership |
| `candidates` | Partial | same shared file; exact candidate nodes to be attached per screen as implementation starts | use Figma to validate hub/list/action composition |
| `inbox` | Partial | same shared file; shell/nav evidence exists, conversation surface not yet attached | route and URL contract remain document-first |
| `marketplace` | Pending | none attached yet | attach when RA-specific surfaces are selected |
| `public-external` | Pending | none attached yet | attach when public/token flows are selected |
| `settings` | Partial | same shared file; user-profile/settings-adjacent overlay confirmed indirectly | decompose by subsection before attaching nodes |
| `integrations` | Pending | none attached yet | provider flows likely need per-provider references |
| `reports` | Partial | same shared file likely contains report-family surfaces; exact nodes pending | attach per report family as needed |
| `billing` | Partial | same shared file likely contains billing-adjacent surfaces; exact nodes pending | card flow should be attached as shell/overlay evidence when confirmed |
| `sysadmin` | Pending | none attached yet | attach only when platform-long-tail implementation starts |

## Business-rule confirmations from `frontend/`

These confirmations come from the current route definitions and access primitives in `frontend/src/app/`.

### Confirmed route and behavior rules

- `jobs` is a stateful list route with URL-owned `type`, `page`, `search`, `asAdmin`, and `label` parameters; page/search/admin/label are explicitly dynamic route state.
- `jobs` also resolves company settings, requisition-required state, current scope remapping, and a GraphQL aggregate before the screen renders.
- `jobs/manage/:id?resetWorkflow` supports both edit and copy-like entry through route params and resolves sectors, favorites, settings, and `resetWorkflow`.
- `job/:id?section` is a hub route backed by a large GraphQL aggregate and job-scoped child routes open modal-style task flows.
- Job task routes (`bid`, `cv`, `cv/:id`, `cv-reject/:id`, `cv/:id/schedule`, `cv/:id/offer`) currently close back to the parent route and several use right-side modal presentation.
- Candidate detail is a dense aggregate route: it resolves candidate detail, optional job-step context, comments, template/forms data, settings, calendar integration, `smsBeta`, and candidate custom fields.
- Candidate task routes (`schedule`, `offer`, `cv-reject`) follow the same parent-return modal pattern as job-scoped tasks.
- Candidate database routes are explicitly permission-gated by `seeCandidates`.
- Inbox uses URL-owned `conversation` selection and optional compose state.
- `user-profile` is confirmed shell overlay behavior: entering the route redirects back to the current route or dashboard, then opens a modal.
- Dashboard resolves notifications, calendar integration, and a role-sensitive GraphQL query where admin users receive extra user data.

### Confirmed access and entitlement rules

- Top-level navigation is driven by `MenuService`, not static route exposure.
- Jobs navigation branches in two shapes depending on `jobRequisition` + `seeJobRequisition`.
- Candidate database navigation requires `hc` + `seeCandidates`.
- Inbox navigation requires `hc OR ra`.
- Reports, billing, and most company settings areas require `hc` + `admin`, with additional feature-capability gates in some subsections.
- `LoginService.feature()` mixes identity, pivot visibility, subscription capability, beta flag, and convenience/data checks in one resolver today.

### Greenfield implication

The greenfield route manifest remains correct, but implementation must preserve these current business behaviors:
- URL-owned state for list and detail re-entry
- parent-return semantics for routed overlays/task flows
- capability evaluation at route/domain boundary
- job/candidate behavior that is shaped by subscription and pivot entitlements, not by role alone

## Screen manifest

| Route family | Route class | Domain | Module | Personas | Primary capability keys | Feature / entitlement dependencies | Behavior notes | Crit | Release |
|---|---|---|---|---|---|---|---|---|---|
| `/` | Public/Token | auth | entry | Public | `canStartSession` | none | Public login entry under unsigned shell. | H | R0 |
| `/confirm-registration/:token` | Public/Token | auth | token-flows | Public | `canUseAuthTokenFlow` | valid token contract | Valid token can establish session and redirect to dashboard. | H | R0 |
| `/forgot-password` | Public/Token | auth | token-flows | Public | `canUseAuthTokenFlow` | none | Standalone public recovery flow. | H | R0 |
| `/reset-password/:token` | Public/Token | auth | token-flows | Public | `canUseAuthTokenFlow` | valid/expired token handling | Must distinguish valid vs expired/invalid token. | H | R0 |
| `/register/:token` | Public/Token | auth | token-flows | Public | `canUseAuthTokenFlow` | valid invitation token | Invitation/token flow, not generic public signup. | H | R0 |
| `/auth/cezanne/:tenantGuid` | Public/Token | auth | sso-callbacks | Public | `canCompleteSsoCallback` | SSO provider enabled | SSO launch entry. | H | R0 |
| `/auth/cezanne/callback?code` | Public/Token | auth | sso-callbacks | Public | `canCompleteSsoCallback` | SSO callback state | Callback exchanges code for token and redirects to dashboard. | H | R0 |
| `/auth/saml?code&error` | Public/Token | auth | sso-callbacks | Public | `canCompleteSsoCallback` | SAML callback state | Must surface callback error explicitly before redirect behavior. | H | R0 |
| `/dashboard` | Page | dashboard | landing | HC User, HC Admin, RA User, RA Admin, limited SysAdmin | `canViewDashboard` | `hc` or `ra`; sysadmin handoff policy | Resolves notifications, calendar integration, and role-sensitive aggregate data. | H | R0 |
| `/notifications` | Page | shell | notifications | HC User, HC Admin, RA User, RA Admin, contextual SysAdmin | `canOpenNotifications` | authenticated shell identity | Destination handling must stay typed and cross-domain. | H | R0 |
| `/inbox?conversation=` | PageWithStatefulUrl | inbox | conversation-list | HC User, HC Admin, RA User, RA Admin | `canViewInbox`, `canOpenConversation` | `hc` or `ra` | Conversation selection is URL state; optional compose state also exists. | H | R0 |
| `/user-profile` | ShellOverlay | shell | account-context | HC User, HC Admin, RA User, RA Admin | `canOpenAccountArea` | authenticated shell identity | Route redirects back to current route or dashboard, then opens modal overlay. | M | R0 |
| `/hiring-company-profile` | Page | shell | account-context | HC Admin | `canOpenAccountArea` | `hc`, org ownership | Organization-scoped profile page. | M | R0 |
| `/recruitment-agency-profile` | Page | shell | account-context | RA Admin | `canOpenAccountArea` | `ra`, org ownership | Organization-scoped profile page. | M | R0 |
| `/logout` | ShellOverlay | shell | account-context | HC User, HC Admin, RA User, RA Admin, SysAdmin | `canLogout` | authenticated session | Must preserve redirect-after-login/session-loss semantics. | M | R0 |
| `/jobs/:type?page&search&asAdmin&label` | PageWithStatefulUrl | jobs | list | HC User, HC Admin | `canViewJobsList` | `hc`; jobs nav also shaped by `jobRequisition`, `seeJobRequisition` | Dynamic URL state for scope, pagination, search, admin-view, and label is confirmed. | H | R1 |
| `/jobs/manage/:id?resetWorkflow` | Page | jobs | authoring | HC Admin, conditional HC User, conditional SysAdmin | `canCreateJob`, `canEditJob`, `canResetJobWorkflow` | `hc`, `admin` or delegated org rights; `jobRequisition` branching | Supports edit/copy-style entry and resolves sectors, favorites, settings, and `resetWorkflow`. | H | R1 |
| `/job/:id?section` | PageWithStatefulUrl | jobs | detail | HC User, HC Admin, contextual RA User, contextual RA Admin, contextual SysAdmin | `canViewJobDetail`, `canManageJobState` | job-context access; may be affected by `jobRequisition` | Large aggregate hub route with section/deep-link behavior. | H | R1 |
| `/job/:id/bid` | RoutedOverlay | jobs | task-overlays | HC User, HC Admin | `canOpenJobTask` | authenticated job access | Opens modal-style flow and returns to parent route on close. | M | R1 |
| `/job/:id/bid/:bid_id` | RoutedOverlay | jobs | task-overlays | HC User, HC Admin | `canOpenJobTask` | authenticated job access | View overlay with parent-return behavior. | M | R1 |
| `/job/:id/cv` | RoutedOverlay | jobs | task-overlays | HC User, HC Admin | `canOpenJobTask` | authenticated job access | Modal-style CV create/entry flow; right-side presentation today. | H | R1 |
| `/job/:id/cv/:cv_id` | RoutedOverlay | jobs | task-overlays | HC User, HC Admin | `canOpenJobTask` | authenticated job + candidate context | Modal view flow with resolved CV payload and parent return. | H | R1 |
| `/job/:id/cv-reject/:cv_id` | TaskFlow | jobs | task-overlays | HC User, HC Admin, contextual RA collaborators | `canRejectCvFromJob` | reject policy; `rejectionReason` may change flow | Reject flow is route-owned and returns to job on close. | H | R1 |
| `/job/:id/cv/:cv_id/schedule` | TaskFlow | jobs | task-overlays | HC User, HC Admin, contextual RA collaborators | `canScheduleInterviewFromJob` | `calendarIntegration`, `bulkSchedule`, `smsBeta` as applicable | Scheduling flow resolves templates and CV, then returns to parent route. | H | R1 |
| `/job/:id/cv/:cv_id/offer` | TaskFlow | jobs | task-overlays | HC User, HC Admin, contextual RA collaborators | `canCreateOfferFromJob` | offer capability and downstream commercial state | Offer flow is route-owned with modal-style parent return. | H | R1 |
| `/candidate/:id/:job?/:status?/:order?/:filters?/:interview?` | PageWithStatefulUrl | candidates | detail-hub | HC User, HC Admin, contextual RA User, contextual RA Admin, contextual SysAdmin | `canViewCandidateDetail`, `canNavigateCandidateSequence` | candidate/job access; dense entitlement mix starts here | Dense aggregate route with job/step context, comments, templates, settings, calendar integration, `smsBeta`, and custom fields. | H | R2 |
| `/candidate/:id/.../cv/:cv_id/schedule` | TaskFlow | candidates | action-launchers | HC User, HC Admin, contextual RA collaborators | `canScheduleInterviewFromCandidate` | `calendarIntegration`, `bulkSchedule`, `smsBeta` | Mirrors job-side scheduling pattern with parent-return behavior. | H | R2 |
| `/candidate/:id/.../cv/:cv_id/offer` | TaskFlow | candidates | action-launchers | HC User, HC Admin, contextual RA collaborators | `canCreateOfferFromCandidate` | offer capability and downstream commercial state | Mirrors job-side offer pattern with parent-return behavior. | H | R2 |
| `/candidate/:id/.../cv-reject/:cv_id` | TaskFlow | candidates | action-launchers | HC User, HC Admin, contextual RA collaborators | `canRejectCandidate` | `rejectionReason` | Mirrors job-side reject pattern with parent-return behavior. | H | R2 |
| `/candidates-old?query&page` | PageWithStatefulUrl | candidates | database-search | HC User, HC Admin | `canViewCandidateDatabase`, `canSearchCandidates` | `hc`, `seeCandidates` | Explicit `seeCandidates` permission gate in route definition. | M | R4 |
| `/candidates-database?query&page` | PageWithStatefulUrl | candidates | database-search | HC User, HC Admin | `canViewCandidateDatabase`, `canSearchCandidates` | `hc`, `seeCandidates`, `booleanSearch`, `candidateTags` as applicable | Explicit `seeCandidates` permission gate in route definition. | M | R4 |
| `/candidates-new?query&page` | PageWithStatefulUrl | candidates | database-search | HC User, HC Admin | `canViewCandidateDatabase`, `canSearchCandidates` | `hc`, `seeCandidates` | React-oriented candidate database variant with same permission gate. | M | R4 |
| `/jobmarket/:type` | PageWithStatefulUrl | marketplace | marketplace-list | RA User, RA Admin | `canViewMarketplace` | `ra` | RA-owned marketplace slice. | M | R4 |
| `/chat/:token/:user_id` | Public/Token | public-external | external-review | External | `canUseExternalReviewFlow` | valid external token | External chat/token flow; treat as separate contract from internal inbox. | M | R3 |
| `/interview-request/:scheduleUuid/:cvToken` | Public/Token | public-external | external-review | External | `canUseExternalReviewFlow` | valid external token | Tokenized external interview request flow. | M | R3 |
| `/review-candidate/:code` | Public/Token | public-external | external-review | External | `canUseExternalReviewFlow` | valid external token | Loads candidate review aggregate via external code, not recruiter shell session. | M | R3 |
| `/interview-feedback/:code` | Public/Token | public-external | external-review | External | `canUseExternalReviewFlow` | valid external token; `interviewFeedback` when linked to internal capability | External interview-feedback aggregate route with its own data contract. | M | R3 |
| `/shared/:jobOrRole/:token/:source` | Public/Token | public-external | shared-job-view | Public | `canOpenSharedJob` | valid public token/source | Unsigned shared job route resolves tokenized job payload. | M | R3 |
| `/:jobOrRole/application/:token/:source` | Public/Token | public-external | public-application | Public | `canSubmitPublicApplication` | valid public token/source | Public application pulls careers/job-listing config plus applicant custom fields and surveys. | H | R3 |
| `/surveys/:surveyuuid/:jobuuid/:cvuuid` | Public/Token | public-external | public-survey | Public | `canCompletePublicSurvey` | valid survey access; `surveysBeta` where product-gated | Public survey/token contract. | M | R3 |
| `/users?page&search&hiringCompanyId&recruitmentAgencyId` | PageWithStatefulUrl | sysadmin | users | HC Admin, RA Admin, SysAdmin | `canManagePlatformUsers` or org-scoped user-management capability | `admin` and org or platform context | Mixed org-admin/platform-admin area; keep capability split explicit. | M | R5 |
| `/users/edit/:id` | Page | sysadmin | users | HC Admin, RA Admin, SysAdmin | `canManagePlatformUsers` | `admin` and org or platform context | Admin-managed edit page. | M | R5 |
| `/users/new` | Page | sysadmin | users | HC Admin, RA Admin, SysAdmin | `canManagePlatformUsers` | `admin` and org or platform context | Admin-managed create page. | M | R5 |
| `/users/:id` | Page | sysadmin | users | HC Admin, RA Admin, SysAdmin | `canManagePlatformUsers` | `admin` and org or platform context | Admin-managed view page. | M | R5 |
| `/users/invite` | TaskFlow | sysadmin | users | HC Admin, RA Admin | `canManagePlatformUsers` | org admin context | Invite flow should remain distinct from token acceptance. | M | R4 |
| `/users/invite-token` | Public/Token | auth | token-flows | Public | `canUseAuthTokenFlow` | valid invite token | Public acceptance side of invite flow. | M | R0 |
| `/favorites` | Page | sysadmin | favorite-requests | HC User, HC Admin, RA User, RA Admin, contextual SysAdmin | `canManageFavoriteRequests` or org favorite capability | `seeFavorites`, `recruiters`, or `ra` | Access is entitlement-heavy and not pure sysadmin. | L | R4 |
| `/favorites/:id` | Page | sysadmin | favorite-requests | HC User, HC Admin, RA User, RA Admin, contextual SysAdmin | `canManageFavoriteRequests` or org favorite capability | `seeFavorites`, `recruiters`, or `ra` | Detail page for favorite grouping/request handling. | L | R4 |
| `/favorites/request/:id?` | TaskFlow | sysadmin | favorite-requests | HC User, HC Admin, RA User, RA Admin | `canManageFavoriteRequests` or org favorite capability | favorite-request entitlement context | Task-style request flow. | L | R4 |
| `/favorites-request` | Page | sysadmin | favorite-requests | SysAdmin | `canManageFavoriteRequests` | `sysAdmin` | Platform-admin request queue. | L | R5 |
| `/favorites-request/:id` | Page | sysadmin | favorite-requests | SysAdmin | `canManageFavoriteRequests` | `sysAdmin` | Platform-admin detail page. | L | R5 |
| `/recruiters` | Page | settings | agency-settings | HC User, HC Admin | `canManageAgencySettings` or recruiter-visibility capability | `hc`, `seeRecruiters`, `recruiters` | Entitlement-heavy team/recruiter area. | L | R4 |
| `/hiring-companies` | Page | sysadmin | companies | SysAdmin | `canManageHiringCompanies` | `sysAdmin` | Platform-admin list. | M | R5 |
| `/hiring-companies/:id` | Page | sysadmin | companies | SysAdmin | `canManageHiringCompanies` | `sysAdmin` | Platform-admin detail page. | M | R5 |
| `/hiring-companies/edit/:id` | Page | sysadmin | companies | SysAdmin | `canManageHiringCompanies` | `sysAdmin` | Platform-admin edit page. | M | R5 |
| `/hiring-company/:id/subscription` | Page | sysadmin | companies | SysAdmin | `canManageHiringCompanies`, `canManagePlatformSubscriptions` | `sysAdmin` | Company subscription administration. | M | R5 |
| `/recruitment-agencies` | Page | sysadmin | agencies | SysAdmin | `canManageRecruitmentAgencies` | `sysAdmin` | Platform-admin list. | M | R5 |
| `/recruitment-agencies/:id` | Page | sysadmin | agencies | SysAdmin | `canManageRecruitmentAgencies` | `sysAdmin` | Platform-admin detail page. | M | R5 |
| `/recruitment-agencies/edit/:id` | Page | sysadmin | agencies | SysAdmin | `canManageRecruitmentAgencies` | `sysAdmin` | Platform-admin edit page. | M | R5 |
| `/subscriptions` | Page | sysadmin | subscriptions | SysAdmin | `canManagePlatformSubscriptions` | `sysAdmin` | Platform-admin list. | M | R5 |
| `/subscriptions/:id` | Page | sysadmin | subscriptions | SysAdmin | `canManagePlatformSubscriptions` | `sysAdmin` | Platform-admin detail page. | M | R5 |
| `/sectors` | Page | sysadmin | taxonomy | SysAdmin | `canManageTaxonomy` | `sysAdmin` | Platform-admin taxonomy surface. | L | R5 |
| `/sectors/:id` | Page | sysadmin | taxonomy | SysAdmin | `canManageTaxonomy` | `sysAdmin` | Platform-admin taxonomy detail. | L | R5 |
| `/sectors/:sector_id/subsectors` | Page | sysadmin | taxonomy | SysAdmin | `canManageTaxonomy` | `sysAdmin` | Platform-admin nested taxonomy view. | L | R5 |
| `/subsectors/:id` | Page | sysadmin | taxonomy | SysAdmin | `canManageTaxonomy` | `sysAdmin` | Platform-admin taxonomy detail. | L | R5 |
| `/templates` | Page | settings | settings-container | HC User, HC Admin | `canEnterSettings` | `hc` | Template area remains subsection-driven, not standalone settings replacement. | M | R4 |
| `/templates/:id` | Page | settings | settings-container | HC User, HC Admin | `canEnterSettings` | `hc` | Template detail variant. | M | R4 |
| `/templates/smart-questions` | Page | settings | settings-container | HC Admin | `canEnterSettings` | `hc`, `admin` | Admin-only template subsection. | M | R4 |
| `/templates/diversity-questions` | Page | settings | settings-container | HC Admin | `canEnterSettings` | `hc`, `admin`, `surveysBeta`, `customSurveys` | Subsection is gated by both beta and subscription capability. | M | R4 |
| `/templates/interview-scoring` | Page | settings | settings-container | HC Admin | `canEnterSettings`, `canViewInterviewFeedback` | `hc`, `admin`, `interviewFeedback` | Interview feedback capability changes visibility. | M | R4 |
| `/parameters/:settings_id?/:section?/:subsection?` | PageWithStatefulUrl | settings | settings-container | HC User, HC Admin, RA User, RA Admin | `canEnterSettings` | `hc` or `ra`; subsection entitlements vary | Legacy route resolves HRIS integrations, surveys, custom fields, settings, user settings, sectors, calendar integration, and candidate custom fields. | M | R4-R5 |
| `/settings/careers-page` | Page | settings | careers-application | HC Admin | `canManageCareersPage` | `hc`, `admin` | Separate admin route backed by company settings resolve. | M | R3 |
| `/settings/application-page/:settings_id?/:section?/:subsection?` | PageWithStatefulUrl | settings | careers-application | HC Admin | `canManageApplicationPage` | `hc`, `admin` | Stateful admin surface for application-page configuration. | M | R3 |
| `/settings/job-listings?tab&brand` | PageWithStatefulUrl | settings | careers-application | HC Admin | `canManageJobListings` | `hc`, `admin` | Stateful list route with `tab` and `brand` params plus company/settings resolves. | M | R3 |
| `/settings/job-listings/edit/:uuid?new&brand` | Page | settings | careers-application | HC Admin | `canManageJobListings` | `hc`, `admin` | Editor entry supports new/edit variants. | M | R3 |
| `/settings/hiring-flow` | Page | settings | hiring-flow | HC Admin | `canManageHiringFlowSettings` | `hc`, `admin`, plus `jobRequisition` where relevant | Workflow settings influence recruiter-core behavior. | M | R4 |
| `/settings/custom-fields` | Page | settings | custom-fields | HC Admin | `canManageCustomFields` | `hc`, `admin`, `customFieldsBeta` | Beta-gated custom field administration. | M | R4 |
| `/settings/api-endpoints` | Page | settings | api-endpoints | HC Admin | `canManageApiEndpoints` | `hc`, `admin` | Admin-only settings slice. | L | R5 |
| `/build-requisition` | TaskFlow | jobs | workflow-state | HC Admin | `canUseJobRequisitionBranching` | `hc`, `admin`, `jobRequisition` | Hard guard redirects to dashboard unless requisition capabilities are enabled. | M | R5 |
| `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` | PageWithStatefulUrl | jobs | workflow-state | HC Admin | `canUseJobRequisitionBranching` | `hc`, `admin`, `jobRequisition`, `seeJobRequisition` | Requisition flow remains distinct from base jobs list. | M | R5 |
| `/requisition-workflows` | Page | settings | hiring-flow | HC Admin | `canManageHiringFlowSettings` | `hc`, `admin`, `jobRequisition` | Hard guard redirects to dashboard without requisition + admin capability. | M | R5 |
| `/job-requisition-approval?token` | Public/Token | public-external | requisition-approval | External | `canApproveRequisitionByToken` | valid token | Unsigned approval route with token-resolved job workflow payload. | M | R3 |
| `/job-requisition-forms/:id?download` | Public/Token | public-external | requisition-approval | External | `canApproveRequisitionByToken` | valid token/form access | Unsigned requisition-forms contract with download variant. | L | R5 |
| `/reject-reasons` | Page | settings | settings-container | HC Admin | `canEnterSettings` | `hc`, `admin`, `rejectionReason` | List page with edit as routed overlay. | M | R4 |
| `/hiring-company/report/:id?` | Page | reports | report-index | HC Admin | `canViewReports` | `hc`, `admin` | Legacy aggregate report route with saved period/filter session behavior. | M | R4 |
| `/report/jobs` | Page | reports | report-family-pages | HC Admin | `canViewReportFamily` | `hc`, `admin` | Dedicated report family page. | M | R4 |
| `/report/hiring-process` | Page | reports | report-family-pages | HC Admin | `canViewReportFamily` | `hc`, `admin` | Dedicated report family page. | M | R4 |
| `/report/teams` | Page | reports | report-family-pages | HC Admin | `canViewReportFamily` | `hc`, `admin` | Dedicated report family page. | M | R4 |
| `/report/candidates` | Page | reports | report-family-pages | HC Admin | `canViewReportFamily` | `hc`, `admin` | Dedicated report family page. | M | R4 |
| `/report/diversity` | Page | reports | report-family-pages | HC Admin | `canViewReportFamily` | `hc`, `admin`, `surveysBeta` | Diversity reporting remains beta-sensitive. | L | R4 |
| `/report/source` | Page | reports | report-family-pages | HC Admin | `canViewReportFamily` | `hc`, `admin`, `sourceReportsBeta` | Source reporting remains beta-sensitive. | L | R4 |
| `/billing` | Page | billing | overview | HC Admin | `canViewBilling` | `hc`, `admin`, `!billingHidden` | Route-level permission plus multiple billing resolves. | M | R4 |
| `/billing/upgrade` | TaskFlow | billing | upgrade | HC Admin | `canUpgradeSubscription` | `hc`, `admin`, `!billingHidden` | Dedicated upgrade page flow. | M | R4 |
| `/billing/sms` | TaskFlow | billing | sms | HC Admin | `canManageSmsBilling` | `hc`, `admin`, `!billingHidden`, `smsBeta` as applicable | Dedicated SMS billing flow. | M | R4 |
| `/billing/card/:id` | ShellOverlay | billing | cards | HC Admin | `canManageBillingCard` | `hc`, `admin`, `!billingHidden` | Nested routed modal under billing that returns to parent on close. | M | R4 |
| `/integrations` | Page | integrations | provider-index | HC Admin | `canViewIntegrations` | `hc`, `admin` | Internal admin index with resolved integrations list. | M | R4 |
| `/integrations/:id` | Page | integrations | provider-detail | HC Admin | `canManageIntegrationProvider` | `hc`, `admin`, provider-specific entitlements | Edit/detail is currently modal-style overlay launched from the index. | M | R4 |
| `/integration/cv/:token/:action?` | Public/Token | integrations | token-entry | External, system actors | `canUseIntegrationTokenEntry` | valid integration token | Unsigned token flow for CV contract. | L | R5 |
| `/integration/forms/:token` | Public/Token | integrations | token-entry | External, system actors | `canUseIntegrationTokenEntry` | valid integration token | Unsigned token flow for requested forms/documents. | L | R5 |
| `/integration/job/:token/:action?` | Public/Token | integrations | token-entry | External, system actors | `canUseIntegrationTokenEntry` | valid integration token | Unsigned token flow for job contract. | L | R5 |

## R0-critical registration set

The following route families must be formally registered, typed, and capability-bound before R0 starts implementation of feature screens:
- auth entry and token routes
- dashboard
- notifications
- inbox with stateful conversation selection
- shell-owned account/logout overlays
- typed destination contracts for jobs, candidates, inbox, and dashboard re-entry

## Planning rule

If a screen cannot be assigned all of the following, it is not ready for implementation planning:
- owning domain
- owning module
- route class
- primary capability keys
- persona visibility rule
- release target

If a Figma reference exists, it should additionally be mapped as:
- file key
- node id
- evidence type (`page`, `overlay`, `partial`, or `exploratory`)
