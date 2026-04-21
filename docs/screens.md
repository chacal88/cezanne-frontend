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

## Canonical route path contract

The source of truth for implemented route registration is:

- `src/lib/routing/route-contracts.ts`
- `src/app/router.tsx`
- `src/lib/routing/route-metadata.ts`

This screen inventory may include shorthand or legacy examples from the old frontend inventory, such as `{id}`, `$id`, `...`, `*`, query-string examples, or optional suffixes. Treat those as **aliases/examples**, not additional required route registrations, unless a row explicitly says it is canonical.

Examples:

| Documentation shorthand | Canonical interpretation |
|---|---|
| `/job/$id/cv/{cv_id}` | use the registered job CV route family in `route-contracts.ts` |
| `/candidate/$id/.../cv/$cv_id/offer` | use the registered candidate detail/action route arrays |
| `/integration/cv/$token/$action?` | use the registered integration token-entry paths |
| `/parameters*` | use the registered `/parameters` compatibility path family |

Route ownership and capability checks must be validated against registered paths and route metadata, not by counting every shorthand example as a separate missing route.

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
| `/dashboard` | Page | dashboard | landing | HC User, HC Admin, RA User, RA Admin, SysAdmin | `canViewDashboard` | `hc` or `ra`; `sysAdmin` renders R5 platform mode when no HC/RA operational context is active | Resolves notifications, calendar integration, role-sensitive aggregate data, and SysAdmin platform-mode entry/fallback. | H | R0-R5 |
| `/notifications` | Page | shell | notifications | HC User, HC Admin, RA User, RA Admin, contextual SysAdmin | `canOpenNotifications` | authenticated shell identity | Destination handling must stay typed and cross-domain. | H | R0 |
| `/inbox?conversation=` | PageWithStatefulUrl | inbox | conversation-list | HC User, HC Admin, RA User, RA Admin | `canViewInbox`, `canOpenConversation` | `hc` or `ra` | Conversation selection is URL state; optional compose state also exists. | H | R0 |
| `/user-profile` | ShellOverlay | shell | account-context | HC User, HC Admin, RA User, RA Admin | `canOpenAccountArea` | authenticated shell identity | Route redirects back to current route or dashboard, then opens modal overlay. | M | R0 |
| `/hiring-company-profile` | Page | shell | account-context | HC Admin | `canOpenAccountArea` | `hc`, org ownership | Organization-scoped profile page. | M | R0 |
| `/recruitment-agency-profile` | Page | shell | account-context | RA Admin | `canOpenAccountArea` | `ra`, org ownership | Organization-scoped profile page. | M | R0 |
| `/logout` | ShellOverlay | shell | account-context | HC User, HC Admin, RA User, RA Admin, SysAdmin | `canLogout` | authenticated session | Must preserve redirect-after-login/session-loss semantics. | M | R0 |
| `/jobs/:type?page&search&asAdmin&label` | PageWithStatefulUrl | jobs | list | HC User, HC Admin | `canViewJobsList` | `hc`; jobs nav also shaped by `jobRequisition`, `seeJobRequisition` | Dynamic URL state for scope, pagination, search, admin-view, and label is confirmed and now implemented in the first R1 shell. | H | R1 |
| `/jobs/manage/:id?resetWorkflow` | Page | jobs | authoring | HC Admin, conditional HC User, conditional SysAdmin | `canCreateJob`, `canEditJob`, `canResetJobWorkflow` | `hc`, `admin` or delegated org rights; `jobRequisition` branching | Supports explicit create/edit entry, preserves `resetWorkflow`, serializes through a dedicated draft adapter boundary, and exposes job-board publishing readiness for publishing-adjacent actions without changing draft persistence. | H | R1 |
| `/job/:id?section` | PageWithStatefulUrl | jobs | detail | HC User, HC Admin, contextual RA User, contextual RA Admin, contextual SysAdmin | `canViewJobDetail`, `canManageJobState` | job-context access; may be affected by `jobRequisition` | Large aggregate hub route with section/deep-link behavior and a normalized hub view-model boundary. | H | R1 |
| `/job/:id/bid` | RoutedOverlay | jobs | task-overlays | HC User, HC Admin | `canOpenJobTask` | authenticated job access | Opens modal-style flow and returns to parent route on close. | M | R1 |
| `/job/:id/bid/:bid_id` | RoutedOverlay | jobs | task-overlays | HC User, HC Admin | `canOpenJobTask` | authenticated job access | View overlay with parent-return behavior. | M | R1 |
| `/job/:id/cv` | RoutedOverlay | jobs | task-overlays | HC User, HC Admin | `canOpenJobTask` | authenticated job access | Modal-style CV create/entry flow; right-side presentation today. | H | R1 |
| `/job/:id/cv/:cv_id` | RoutedOverlay | jobs | task-overlays | HC User, HC Admin | `canOpenJobTask` | authenticated job + candidate context | Modal view flow with resolved CV payload and parent return. | H | R1 |
| `/job/:id/cv-reject/:cv_id` | TaskFlow | jobs | task-overlays | HC User, HC Admin, contextual RA collaborators | `canRejectCvFromJob` | reject policy; `rejectionReason` may change flow | Reject flow is route-owned and returns to job on close. | H | R1 |
| `/job/:id/cv/:cv_id/schedule` | TaskFlow | jobs | task-overlays | HC User, HC Admin, contextual RA collaborators | `canScheduleInterviewFromJob` | `calendarIntegration`, `bulkSchedule`, `smsBeta` as applicable | Scheduling flow resolves canonical task context first, consumes calendar readiness gates before submit, and returns to an explicit parent route on close/success or blocked/degraded/unavailable remediation. | H | R1 |
| `/job/:id/cv/:cv_id/offer` | TaskFlow | jobs | task-overlays | HC User, HC Admin, contextual RA collaborators | `canCreateOfferFromJob` | offer capability and downstream commercial state | Offer flow is route-owned with modal-style parent return. | H | R1 |
| `/candidate/:id/:job?/:status?/:order?/:filters?/:interview?` | PageWithStatefulUrl | candidates | detail-hub | HC User, HC Admin, contextual RA User, contextual RA Admin, contextual SysAdmin | `canViewCandidateDetail`, `canNavigateCandidateSequence` | candidate/job access; dense entitlement mix starts here | Dense aggregate route with job/step context, comments, templates, settings, calendar integration, `smsBeta`, and custom fields. | H | R2 |
| `/candidate/:id/.../cv/:cv_id/schedule` | TaskFlow | candidates | action-launchers | HC User, HC Admin, contextual RA collaborators | `canScheduleInterviewFromCandidate` | `calendarIntegration`, `bulkSchedule`, `smsBeta` | Mirrors job-side scheduling pattern with parent-return behavior and consumes calendar readiness gates before submit; blocked/degraded/unavailable states remain route-local with provider setup recovery when known. | H | R2 |
| `/candidate/:id/.../cv/:cv_id/offer` | TaskFlow | candidates | action-launchers | HC User, HC Admin, contextual RA collaborators | `canCreateOfferFromCandidate` | offer capability and downstream commercial state | Mirrors job-side offer pattern with parent-return behavior. | H | R2 |
| `/candidate/:id/.../cv-reject/:cv_id` | TaskFlow | candidates | action-launchers | HC User, HC Admin, contextual RA collaborators | `canRejectCandidate` | `rejectionReason` | Mirrors job-side reject pattern with parent-return behavior. | H | R2 |
| `/candidates-old?query&page` | PageWithStatefulUrl | candidates | database-search | HC User, HC Admin | `canViewCandidateDatabase`, `canSearchCandidates` | `hc`, `seeCandidates` | Explicit `seeCandidates` permission gate in route definition. | M | R4 |
| `/candidates-database?query&page` | PageWithStatefulUrl | candidates | database-search | HC User, HC Admin | `canViewCandidateDatabase`, `canSearchCandidates` | `hc`, `seeCandidates`, `booleanSearch`, `candidateTags` as applicable | Explicit `seeCandidates` permission gate in route definition. | M | R4 |
| `/candidates-new?query&page` | PageWithStatefulUrl | candidates | database-search | HC User, HC Admin | `canViewCandidateDatabase`, `canSearchCandidates` | `hc`, `seeCandidates` | React-oriented candidate database variant with same permission gate. | M | R4 |
| `/jobmarket/:type` | PageWithStatefulUrl | marketplace | marketplace-list | RA User, RA Admin | `canViewMarketplace` | `ra` | RA-owned marketplace slice. | M | R4 |
| `/chat/:token/:user_id` | Public/Token | public-external | external-chat | External | `canUseExternalTokenizedChat` | valid external token plus eligible existing conversation | External chat/token flow with grouped conversation rendering, same-route send/retry behavior, and explicit inaccessible handling separate from internal inbox. | M | R3 |
| `/interview-request/:scheduleUuid/:cvToken` | Public/Token | public-external | external-review | External | `canUseExternalReviewFlow` | valid external token | Tokenized external interview request flow with accept/decline terminal outcomes, explicit invalid/expired/used states, and refresh-stable completion. | M | R3 |
| `/review-candidate/:code` | Public/Token | public-external | external-review | External | `canUseExternalReviewFlow` | valid external token | Loads candidate review aggregate via external code, not recruiter shell session, and owns retry/read-only behavior after submission. | M | R3 |
| `/interview-feedback/:code` | Public/Token | public-external | external-review | External | `canUseExternalReviewFlow` | valid external token; `interviewFeedback` when linked to internal capability | External interview-feedback aggregate route with its own adapter, retry behavior, and submitted read-only terminal state. | M | R3 |
| `/shared/:jobOrRole/:token/:source` | Public/Token | public-external | shared-job-view | Public | `canOpenSharedJob` | valid public token/source | Unsigned shared job route resolves tokenized job payload. | M | R3 |
| `/:jobOrRole/application/:token/:source` | Public/Token | public-external | public-application | Public | `canSubmitPublicApplication` | valid public token/source | Public application pulls careers/job-listing config plus applicant custom fields and surveys. | H | R3 |
| `/surveys/:surveyuuid/:jobuuid/:cvuuid` | Public/Token | public-external | public-survey | Public | `canCompletePublicSurvey` | valid survey access; `surveysBeta` where product-gated | Public survey/token contract. | M | R3 |
| `/users?page&search&hiringCompanyId&recruitmentAgencyId` | PageWithStatefulUrl | sysadmin | users | SysAdmin | `canManagePlatformUsers` | `sysAdmin` | Platform user administration list; org invite/membership stays in R4 team routes. | M | R5 |
| `/users/edit/:id` | Page | sysadmin | users | SysAdmin | `canManagePlatformUsers` | `sysAdmin` | Edit platform-managed user with sanitized list return. | M | R5 |
| `/users/new` | Page | sysadmin | users | SysAdmin | `canManagePlatformUsers` | `sysAdmin` | Create platform-managed user; org invite delivery stays at `/users/invite`. | M | R5 |
| `/users/:id` | Page | sysadmin | users | SysAdmin | `canManagePlatformUsers` | `sysAdmin` | Platform-managed user detail with sanitized list return. | M | R5 |
| `/team` | Page | team | org-team | HC Admin, RA Admin | `canViewOrgTeam` | org admin context | Org-scoped team index with member list, pending invite, role/status, empty, denied, unavailable, stale, degraded, retryable, and refresh-required states; separate from platform `/users*` CRUD. | M | R4 |
| `/team/recruiters` | Page | team | recruiter-visibility | HC Admin, RA Admin | `canViewRecruiterVisibility` | org admin context | Org-scoped recruiter visibility list with filters, assignment readiness, empty, denied, unavailable, stale, degraded, retryable, and `/team` parent-return states. | M | R4 |
| `/users/invite` | TaskFlow | team | invite-management | HC Admin, RA Admin | `canManageOrgInvites` | org admin context | Org-scoped invite send/resend/revoke and membership readiness surface; consumes `/team` and remains distinct from platform `/users*` CRUD and token acceptance. | M | R4 |
| `/users/invite-token` | Public/Token | auth | token-flows | Public | `canUseAuthTokenFlow` | valid invite token | Public acceptance side of invite flow. | M | R0 |
| `/favorites` | Page | favorites | org-favorites | HC User, HC Admin, RA User, RA Admin | `canViewOrgFavorites` | `seeFavorites`, `recruiters`, or `ra` | Org-scoped favorites list with personal, org-shared, recruiter-linked, empty, and unavailable states; separate from platform favorite-request queues. | L | R4 |
| `/favorites/:id` | Page | favorites | org-favorites | HC User, HC Admin, RA User, RA Admin | `canViewOrgFavorites` | `seeFavorites`, `recruiters`, or `ra` | Org-scoped favorite detail with unavailable state and `/favorites` return target. | L | R4 |
| `/favorites/request/:id?` | TaskFlow | favorites | org-favorite-requests | HC User, HC Admin, RA User, RA Admin | `canViewOrgFavorites` | favorite-request entitlement context | Org-scoped favorite request task flow with draft/submitted/pending/approved/rejected/unavailable states; separate from platform `/favorites-request*` queues. | L | R4 |
| `/favorites-request` | PageWithStatefulUrl | sysadmin | favorite-requests | SysAdmin | `canManageFavoriteRequests` | `sysAdmin` | Platform-admin favorite-request queue with pending/resolved/rejected/stale/inaccessible states. | L | R5 |
| `/favorites-request/:id` | Page | sysadmin | favorite-requests | SysAdmin | `canManageFavoriteRequests` | `sysAdmin` | Platform-admin request detail with approve/reject/reopen readiness. | L | R5 |
| `/recruiters` | Page | settings | agency-settings | HC User, HC Admin | `canManageAgencySettings` or recruiter-visibility capability | `hc`, `seeRecruiters`, `recruiters` | Entitlement-heavy team/recruiter area. | L | R4 |
| `/hiring-companies` | Page | sysadmin | companies | SysAdmin | `canManageHiringCompanies` | `sysAdmin` | Platform-admin list with deterministic list states from `r5-platform-master-data`. | M | R5 |
| `/hiring-companies/:id` | Page | sysadmin | companies | SysAdmin | `canManageHiringCompanies` | `sysAdmin` | Platform-admin detail page. | M | R5 |
| `/hiring-companies/edit/:id` | Page | sysadmin | companies | SysAdmin | `canManageHiringCompanies` | `sysAdmin` | Platform-admin edit page. | M | R5 |
| `/hiring-company/:id/subscription` | Page | sysadmin | companies | SysAdmin | `canManageHiringCompanies`, `canManagePlatformSubscriptions` | `sysAdmin` | Company-owned subscription administration; route entry uses `canManageHiringCompanies` and mutation readiness uses `canManagePlatformSubscriptions`. | M | R5 |
| `/recruitment-agencies` | Page | sysadmin | agencies | SysAdmin | `canManageRecruitmentAgencies` | `sysAdmin` | Platform-admin list. | M | R5 |
| `/recruitment-agencies/:id` | Page | sysadmin | agencies | SysAdmin | `canManageRecruitmentAgencies` | `sysAdmin` | Platform-admin detail page. | M | R5 |
| `/recruitment-agencies/edit/:id` | Page | sysadmin | agencies | SysAdmin | `canManageRecruitmentAgencies` | `sysAdmin` | Platform-admin edit page. | M | R5 |
| `/subscriptions` | Page | sysadmin | subscriptions | SysAdmin | `canManagePlatformSubscriptions` | `sysAdmin` | Platform-admin list. | M | R5 |
| `/subscriptions/:id` | Page | sysadmin | subscriptions | SysAdmin | `canManagePlatformSubscriptions` | `sysAdmin` | Platform-admin detail page. | M | R5 |
| `/sectors` | PageWithStatefulUrl | sysadmin | taxonomy | SysAdmin | `canManageTaxonomy` | `sysAdmin` | Platform taxonomy sector list foundation. | L | R5 |
| `/sectors/:id` | Page | sysadmin | taxonomy | SysAdmin | `canManageTaxonomy` | `sysAdmin` | Platform sector detail with `/sectors` parent. | L | R5 |
| `/sectors/:sector_id/subsectors` | PageWithStatefulUrl | sysadmin | taxonomy | SysAdmin | `canManageTaxonomy` | `sysAdmin` | Platform nested subsector list with sector-detail parent. | L | R5 |
| `/subsectors/:id` | Page | sysadmin | taxonomy | SysAdmin | `canManageTaxonomy` | `sysAdmin` | Platform subsector detail with `/sectors` fallback parent. | L | R5 |
| `/templates` | Page | settings | templates | HC User, HC Admin | `canManageTemplates` | `hc` | Templates family root; remains subsection-driven and consumes the operational settings substrate. | M | R4 |
| `/templates/:id` | Page | settings | templates | HC User, HC Admin | `canManageTemplates` | `hc` | Templates family detail variant; stays inside the same family contract. | M | R4 |
| `/templates/smart-questions` | Page | settings | templates | HC Admin | `canManageTemplates` | `hc`, `admin` | Admin-only templates subsection inside the shared family. | M | R4 |
| `/templates/diversity-questions` | Page | settings | templates | HC Admin | `canManageTemplates` | `hc`, `admin`, `surveysBeta`, `customSurveys` | Templates subsection gated by both beta and subscription capability. | M | R4 |
| `/templates/interview-scoring` | Page | settings | templates | HC Admin | `canManageTemplates`, `canViewInterviewFeedback` | `hc`, `admin`, `interviewFeedback` | Templates subsection whose visibility depends on interview-feedback capability. | M | R4 |
| `/parameters/:settings_id?/:section?/:subsection?` | PageWithStatefulUrl | settings | settings-container | HC User, HC Admin, RA User, RA Admin | `canEnterSettings` plus subsection-specific capabilities | `hc` or `ra`; recognized keys are `hiring-flow`, `custom-fields`, `templates`, `reject-reasons`, `api-endpoints`, and `forms-docs` | Compatibility resolver only: maps known and authorized subsections to dedicated routes, falls back for unknown/unauthorized/unavailable/unimplemented keys, replaces compatibility URLs when resolving, and does not become a monolithic settings page. | M | R4-R5 |
| `/settings/careers-page` | Page | settings | careers-application | HC Admin | `canManageCareersPage` | `hc`, `admin` | Separate admin route backed by company settings resolve. | M | R3 |
| `/settings/application-page/:settings_id?/:section?/:subsection?` | PageWithStatefulUrl | settings | careers-application | HC Admin | `canManageApplicationPage` | `hc`, `admin` | Stateful admin surface for application-page configuration. | M | R3 |
| `/settings/job-listings?tab&brand` | PageWithStatefulUrl | settings | careers-application | HC Admin | `canManageJobListings` | `hc`, `admin` | Stateful list route with `tab` and `brand` params plus company/settings resolves; publish/status actions consume job-board readiness gates without rendering provider setup UI. | M | R3 |
| `/settings/job-listings/edit/:uuid?new&brand` | Page | settings | careers-application | HC Admin | `canManageJobListings` | `hc`, `admin` | Editor entry supports new/edit variants and keeps provider setup recovery as a link to integrations when publish readiness blocks action. | M | R3 |
| `/settings/hiring-flow` | Page | settings | hiring-flow | HC Admin | `canManageHiringFlowSettings` | `hc`, `admin`, plus `jobRequisition` where relevant | Dedicated subsection route that consumes the operational settings substrate, keeps save/retry inside the route, and stops before `/requisition-workflows` authoring scope. | M | R4 |
| `/settings/custom-fields` | Page | settings | custom-fields | HC Admin | `canManageCustomFields` | `hc`, `admin`, `customFieldsBeta` | Dedicated subsection route that consumes the operational settings substrate, keeps beta gating explicit, and freezes custom-field admin without absorbing downstream candidate/public rendering. | M | R4 |
| `/settings/api-endpoints` | Page | settings | api-endpoints | HC Admin | `canManageApiEndpoints` | `hc`, `admin`; no integrations or SysAdmin capability grants route entry | Dedicated API endpoints settings foundation route with loading, ready, empty, validation-error, saving, saved, save-error, denied, and unavailable states; real private-token/webhook persistence remains outside the frontend foundation slice. | L | R5 |
| `/settings/forms-docs` | Page | settings | forms-docs-controls | HC Admin | `canManageFormsDocsSettings` | `hc`, `admin`, `formsDocs` | Dedicated forms/docs controls route with loading, ready, empty, denied, unavailable, stale, degraded, save/retry/success states; exposes downstream refresh intent for candidate documents/contracts and public/token forms consumers without owning their mutations. | L | R4-R5 |
| `/build-requisition` | TaskFlow | jobs | workflow-state | HC Admin | `canUseJobRequisitionBranching` | `hc`, `admin`, `jobRequisition` | Jobs-side requisition task-flow foundation with local draft, explicit save, and dashboard fallback. | M | R5 |
| `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` | PageWithStatefulUrl | jobs | workflow-state | HC Admin | `canUseJobRequisitionBranching` | `hc`, `admin`, `jobRequisition` | Jobs-side requisition workflow-state route with stale workflow and drift handling. | M | R5 |
| `/requisition-workflows` | Page | settings | hiring-flow | HC Admin | `canManageHiringFlowSettings` | `hc`, `admin` | Settings-owned requisition workflow administration; active authoring stays in Jobs workflow-state. | M | R5 |
| `/job-requisition-approval?token` | Public/Token | public-external | requisition-approval | External | `canApproveRequisitionByToken` | valid token; explicit invalid/expired/used/inaccessible handling; workflow-drift recovery when the requisition changed underneath the token | Unsigned approval-only route with token-resolved requisition summary, workflow-aware approve/reject actionability, stable approved/rejected terminal outcomes, and no authenticated-shell dependency. | M | R3 |
| `/job-requisition-forms/:id?download` | Public/Token | public-external | requisition-forms-download | External | `canDownloadRequisitionFormsByToken` | valid token/form access; explicit invalid/expired/inaccessible/unavailable/already-downloaded/not-found handling | Unsigned requisition-forms route with optional download-focused mode, explicit user-triggered download, and same-route retry for transient download failure. | L | R5 |
| `/reject-reasons` | Page | settings | reject-reasons | HC Admin | `canManageRejectReasons` | `hc`, `admin`, `rejectionReason` | Dedicated subsection route plus list/edit flow, owned by the route, backed by the operational settings substrate, and kept separate from downstream reject task flows. | M | R4 |
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
| `/integrations/:id` | Page | integrations | provider-detail | HC Admin | `canManageIntegrationProvider` | `hc`, `admin`, provider-specific entitlements; post-R5 setup depth starts with `calendar`, `job-board`, and `hris` | Provider detail route with `/integrations` parent return; post-R5 provider-specific depth adds configuration, auth, and diagnostics sections without changing public/token `/integration/*` callbacks. | M | R4 + post-R5 |
| `/integration/cv/:token/:action?` | Public/Token | integrations | token-entry | External, system actors | `canUseIntegrationTokenEntry` | valid integration token; explicit invalid/expired/used/inaccessible handling | Unsigned token flow for CV callback contract with interview confirmation, conflict recovery, and offer accept/reject outcomes. | L | R3 |
| `/integration/forms/:token` | Public/Token | integrations | token-entry | External, system actors | `canUseIntegrationTokenEntry` | valid integration token; explicit invalid/expired/used/inaccessible handling | Unsigned token flow for requested forms/documents with sequential upload/persistence/retry behavior and stable completion on reload. | L | R3 |
| `/integration/job/:token/:action?` | Public/Token | integrations | token-entry | External, system actors | `canUseIntegrationTokenEntry` | valid integration token; explicit invalid/expired/used/inaccessible handling | Unsigned token flow for normalized job callback presentation without recruiter-shell bootstrap. | L | R3 |

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

## Current R2 execution note

The current source tree registers the candidate hub and candidate schedule/offer/reject task routes under `src/app/router.tsx`, backed by the `src/domains/candidates/` module tree and candidate-focused tests.

## R5 SysAdmin foundation screen contract

The implemented R5 foundation freezes these screen-level rules:
- `/dashboard` is both recruiter-core landing and SysAdmin platform landing; platform mode is selected only for a SysAdmin access context with no active HC/RA operational context.
- `/hiring-companies` is now the implemented SysAdmin-only Platform / Master data list foundation with route id `sysadmin.master-data.hiring-companies`.
- Authenticated non-SysAdmin users entering Platform / Master data routes fall back to `/dashboard`; unauthenticated behavior continues to follow the existing public/auth entry boundary.
- Shell navigation must not expose live links to planned platform route-heavy pages before their implementation slices register page bodies.

## R4 candidate database implemented route contract

The candidate database route family now uses `/candidates-database` as the canonical `PageWithStatefulUrl` route. `/candidates-old` and `/candidates-new` are compatibility entries only and normalize to the canonical route. The URL-owned state contract is `query`, `page`, `sort`, `order`, `stage`, and `tags`. Candidate detail launched from database search uses `entry=database` plus a sanitized `returnTo` value instead of overloading job-pipeline segments.

## R4 integrations admin implemented route contract

The internal integrations admin route family now distinguishes `/integrations` from public/token `/integration/*` routes. `/integrations` is the provider index and `/integrations/:id` is the provider detail route. Detail direct entry and close/return behavior use `/integrations` as the stable parent-index fallback, including unknown providers rendered as explicit `unavailable` state.

## R4 reports implemented route contract

Reports now use `/report` as the canonical index and `/report/:family` as the canonical family route. `/hiring-company/report/:id?` is compatibility behavior and maps into the shared report shell. Report families render through shared filter/result state and shared export/scheduling command states.

Billing now uses `/billing` as the canonical HC-admin overview, `/billing/upgrade` as the upgrade task flow, `/billing/sms` as the SMS add-on task flow, and `/billing/card/:id` as the billing-owned card flow. These routes render commercial-state readiness without granting Platform navigation or platform subscription administration.

## R4 org team/users implemented route contract

Org team/users routes are now separated from platform user CRUD: `/team` owns the product-depth org team index, `/team/recruiters` owns product-depth recruiter visibility, and `/users/invite` is an org invite-management compatibility path under the team domain. These routes are org-admin scoped and do not grant Platform navigation or platform user-management.

`/users/invite` now consumes `/team`, `canManageOrgInvites`, and recruiter-core fallback for deterministic invite send/resend/revoke plus membership role/status readiness states. Route-heavy `/users`, `/users/new`, `/users/edit/:id`, and `/users/:id` are R5 platform-owned routes and remain outside this R4 slice.

## R4 org favorites implemented route contract

Favorites routes are now separated from platform favorite-request queues: `/favorites` owns the org favorites list and `/favorites/:id` owns org favorite detail. These routes use `canViewOrgFavorites`, fall back to `/dashboard` when denied, and do not grant Platform navigation or `canManageFavoriteRequests`.

Favorites state models cover personal, org-shared, recruiter-linked, empty, and unavailable cases. `/favorites/request/:id?` and `/favorites-request*` remain out of this slice for explicit favorite-request follow-on work.

## R4 org favorite requests implemented route contract

Org favorite request task-flow routes are now separated from platform queues: `/favorites/request` starts a request and `/favorites/request/:id` opens request state. These routes use `canViewOrgFavorites`, return to `/favorites`, fall back to `/dashboard` when denied, and do not grant `canManageFavoriteRequests`.

Request state models cover draft, submitted, pending, approved, rejected, and unavailable cases with deterministic submit, cancel, and resubmit action readiness. Platform `/favorites-request` and `/favorites-request/:id` are R5 platform queue routes and remain outside this R4 org task-flow slice.

## R4 billing foundation implemented route contract

Billing routes are separated from SysAdmin subscription administration: `/billing`, `/billing/upgrade`, `/billing/sms`, and `/billing/card/:id` are HC-admin billing routes. Billing overview falls back to `/dashboard` when denied; billing action and card routes use `/billing` as parent/fallback.

Billing foundation state models cover ready, hidden, unavailable, upgrade action readiness, SMS action readiness, and card detail/unavailable states. Platform `/subscriptions*` and `/hiring-company/:id/subscription` remain out of this R4 billing foundation.

## R4 payment method and card-state implemented route contract

Payment-method/card behavior remains inside the billing card route family. `/billing/card/:id` now models primary, backup, expired, missing, add-new (`/billing/card/new`), and unavailable card states. Card actions expose deterministic edit, remove, and make-default readiness while preserving `/billing` as parent/fallback.

These card states do not introduce payment processor persistence or SysAdmin subscription behavior; they are HC-admin billing readiness states for later card, upgrade, and SMS follow-ons.

## R4 subscription upgrade and plan-change implemented route contract

Subscription upgrade behavior remains inside `/billing/upgrade`. The upgrade flow now models current plan, target plan, plan catalog, same-plan blocked state, card-blocked state, confirmation, submitted, success, and failure readiness. Upgrade state consumes payment-method readiness and uses `/billing` as parent/fallback.

These upgrade states do not add billing persistence, checkout, invoices, or SysAdmin subscription administration. Platform `/subscriptions*` and `/hiring-company/:id/subscription` remain outside the R4 HC-admin billing flow.

## R4 SMS add-on implemented route contract

SMS add-on behavior remains inside `/billing/sms`. The SMS flow now models unavailable, inactive, trial, active, suspended, usage-warning, and card-blocked states, plus deterministic enable, disable, and update-limit action readiness. SMS state consumes billing/card readiness and uses `/billing` as parent/fallback.

These SMS states do not add SMS provider configuration, message sending, billing persistence, or SysAdmin subscription administration.

## R4 marketplace RA implemented route contract

Marketplace now uses `/jobmarket/:type` as the RA-owned `PageWithStatefulUrl` route family. Supported marketplace types are `fill`, `bidding`, `cvs`, and `assigned`; unknown types render a stable unavailable state.

Marketplace state models cover ready, empty, and unavailable list states. Marketplace access is RA-scoped through `canViewMarketplace` and does not grant billing, HC-admin, or platform administration capabilities.

## Provider-specific integrations depth screen contract

`/integrations/:id` now renders provider-family setup sections for configuration, auth, and diagnostics. Calendar, job-board, HRIS, ATS, and assessment providers expose family-specific setup fields and readiness signals; custom/unsupported families remain visible as unavailable/unimplemented provider-family states with `/integrations` as the parent return. Public/token `/integration/*` routes are unchanged.

## Provider readiness operational gates screen contract

Scheduling, publishing, and HRIS/requisition screens must render operational readiness states from normalized provider signals:

- `ready`: action can proceed through the existing route/action helper.
- `blocked`: route-local remediation with provider setup recovery when known.
- `degraded`: non-proceeding for mutation/submit actions; status-only surfaces may show warning context.
- `unavailable`: route-local unavailable state without automatic redirect.
- `unimplemented`: explicit unsupported provider-family or action state.

These states apply first to job scheduling, candidate scheduling, job authoring/publishing adjacency, job listings publish/status, and requisition/workflow HRIS adjacency. Public/token `/integration/*` route behavior is unchanged.

## Integration operational-depth screen contract

The operational-depth sequence is synchronized in `integration-operational-depth-sequence-plan.md`; all eight packages are implemented and validated.

Screen and route implications:
- Scheduling screens under job and candidate task routes must show loading, ready, validation-error, slot-unavailable, conflict, retry, submitting, submit-failed, submitted, and parent-refresh states after calendar readiness is ready.
- Job authoring and job-listings screens must show publish/unpublish, partially-published, retry, and provider-blocked states without coupling draft persistence to publishing.
- Requisition screens must distinguish HRIS mapping drift from workflow drift and keep sync retry/remediation route-local.
- Inbox and notification-entry screens must preserve `/inbox?conversation=` as URL-owned selected conversation state and keep `/chat/:token/:user_id` public-token behavior separate.
- Candidate contract and offer-adjacent screens must separate document metadata from signing status and expose status-stale/downstream handoff behavior without rendering signer workflow internals.
- Survey/review/scoring screens must preserve public-token boundaries for `/surveys/*`, `/review-candidate/*`, and `/interview-feedback/*` while exposing schema readiness, submit/retry, read-only terminal, and scoring-pending/scored states.
- Candidate database, candidate detail, jobs list, and job authoring screens may expose ATS source/sync status, duplicate outcomes, stale-source refresh, and status-only ATS context without changing core route ownership.

### Job-board publishing operational depth

Job Authoring and Job Listings now share a publishing lifecycle model for not-ready, ready, validating, publishing, published, publish-failed, partially-published, unpublish-ready, unpublishing, unpublished, unpublish-failed, provider-blocked, degraded, and unavailable. Job Authoring keeps draft save/create/edit persistence separate. Job Listings keeps list/editor continuity. Public shared job routes remain downstream read-only consumers.

## HRIS requisition operational depth implementation note

`hris-requisition-operational-depth` is implemented as the HRIS-specific follow-on to provider readiness gates. It scopes `/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` as Jobs-side consumers and `/requisition-workflows` as a Settings-side administration consumer. The model covers ready, mapping-required, mapping-drift, sync-pending, sync-degraded, sync-failed, retrying, synced, auth-required, provider-blocked, unavailable, and unimplemented outcomes without exposing raw HRIS mappings, OAuth payloads, provider diagnostics, or tenant-sensitive data.

Mapping drift and workflow drift remain separate: HRIS mapping remediation points to HRIS/workflow administration, while existing requisition workflow drift remains authoritative for removed stages, changed required fields, reassigned approvals, and stale workflow route repair. Public/token `/job-requisition-approval`, `/job-requisition-forms`, and `/integration/*` routes remain unchanged.

## Contract signing operational depth screens

Candidate document/contract summaries show document context separately from signing state. Candidate offer/contract launchers and job offer/contract overlays show route-local blocked, retry, status-stale, sent, signing-pending, and terminal signing outcomes while preserving parent return. Standalone signer and public/token integration screens remain unchanged.


## ATS and assessment provider setup screen note

`/integrations/:id` supports ATS and assessment provider detail setup sections for eligible integration admins. The screen keeps `/integrations` as its parent return target, keeps custom providers unavailable/unimplemented, and does not alter public survey, review, interview-feedback, or `/integration/*` token-entry screens.

## Auth foundation state contract

Auth public/token screens now carry deterministic state groups: `ready`, `failed`, `session-bootstrapping`, `session-ready`, `session-expired`, and `logged-out`. Confirm-registration, register, reset-password, and invite-token routes use normalized `valid`, `invalid`, `expired`, `used`, and `inaccessible` token outcomes. Cezanne/SAML callback screens use `callback-error`, `callback-exchanging`, `callback-succeeded`, and `callback-failed` without rendering raw codes.

## Screen design-flow matrix handoff

`screen-design-flow-matrix.md` complements this route manifest with flow/state/design-readiness depth for high-risk operational screens. This file remains the source of truth for route pattern, route class, domain, and module ownership.

## Product-depth completion boundaries

Foundation-only route registration is not the same as product-depth completion. Shell routes are product-depth complete when navigation mode, active/hidden items, account entries, notification fallback, and dashboard re-entry states are modeled. Jobs routes are product-depth complete when list, authoring, detail, and task overlay states are modeled. Candidate routes are product-depth complete when hub, sequence, action lifecycle, and summary degradation states are modeled. Public/token routes are product-depth complete when token, retry, terminal, upload/submission, and safe fallback states are modeled without shell entry.

## Design-flow and implementation-depth note

For design handoff and product-depth readiness, use `screen-design-flow-matrix.md` together with this route manifest. This route manifest remains the route truth; OpenSpec specs remain the state truth. Registered routes with foundation or deterministic fixture behavior are not complete product-depth implementations until their corresponding product-depth change is complete.

## Email deliverability route ownership

Current ownership decision: email deliverability setup is **backend-only/no-UI** for greenfield frontend route registration. The screen manifest intentionally does not include Settings, Integrations, Inbox, or public/token routes for sender-domain verification, managed sender-domain lifecycle, DNS/provider setup, manual revalidation, or sender-signature setup.

Existing operational routes may show normalized readiness only:
- `/inbox` (`inbox.home`) may show blocked/degraded/unavailable send readiness.
- `/notifications` and candidate communication handoff may resolve to Inbox readiness states.

No admin recovery target is defined. Future admin UI requires a new manifest entry with route class, domain, module, capability, parent target, fallback target, adapter seam, and safe telemetry contract.
