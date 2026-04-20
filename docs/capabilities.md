# Greenfield Frontend Capability Catalog

## Purpose

This document defines the canonical capability layer for the greenfield frontend.

It answers:
- which capability decisions exist
- which inputs each decision consumes
- which layer owns the decision
- which routes and modules depend on it
- what deny/fallback behavior is expected

## Source baseline

Synthesized from:
- `./domains.md`
- `./modules.md`
- `./screens.md`
- `../../docs/frontend-2/frontend-permission-decision-model.md`
- `../../docs/frontend-2/frontend-role-to-screen-matrix.md`
- `../../docs/frontend-2/frontend-feature-flag-to-screen-matrix.md`
- `../../docs/frontend-2/frontend-notification-destination-inventory.md`
- `../../frontend/src/app/domain/login/login.service.js`
- `../../frontend/src/app/domain/utils/menu.service.js`

## Decision layers

| Layer | Meaning | Examples |
|---|---|---|
| `Identity` | who the user is | `hc`, `ra`, `admin`, `sysAdmin` |
| `Entitlement` | durable product access | `seeCandidates`, `jobRequisition`, `formsDocs` |
| `Route access` | may enter this route | `canViewJobsList`, `canEnterSettings` |
| `Entity capability` | may operate on this entity/context | `canViewJobDetail`, `canViewCandidateDetail` |
| `Action capability` | may perform this action now | `canScheduleInterviewFromJob`, `canRejectCandidate` |
| `Display/config` | UI-shaping values, not permission | VAT, user settings fragments, available contracts |

## Inputs

All capability evaluation must be based on normalized inputs.

### `AccessContext`

Suggested fields:
- `isAuthenticated`
- `organizationType` (`hc`, `ra`, `none`)
- `isAdmin`
- `isSysAdmin`
- `pivotEntitlements`
- `subscriptionCapabilities`
- `rolloutFlags`

### `RouteContext`

Suggested fields:
- `routeId`
- `routeClass`
- `entryMode` (`menu`, `notification`, `direct-url`, `token`, `redirect`)
- `searchParams`
- `pathParams`

### `EntityContext`

Suggested fields:
- `jobId`
- `candidateId`
- `cvId`
- `conversationId`
- `currentStepId`
- `entityVisibility`
- `serverCapabilityPayload`

## Capability catalog

### 1. Shell and auth capabilities

| Capability | Layer | Main inputs | Used by | Deny/fallback |
|---|---|---|---|---|
| `canStartSession` | Route access | public state | auth entry routes | stay in public auth shell |
| `canUseAuthTokenFlow` | Route access | token validity, public state | confirm/reset/register/invite-token | token error page/state |
| `canCompleteSsoCallback` | Route access | callback params, provider status | SSO/SAML routes | auth failure state then public entry |
| `canEnterShell` | Route access | authenticated identity | authenticated shell | redirect to public entry |
| `canSeeNavSection` | Route access | identity + entitlements | shell navigation | hide nav item |
| `canOpenNotifications` | Route access | authenticated identity | notifications | redirect to dashboard |
| `canResolveNotificationDestination` | Route access | notification payload + access context | shell notifications | typed fallback destination |
| `canOpenAccountArea` | Route access | authenticated identity + org context where applicable | user/company/agency profile | redirect to dashboard |
| `canLogout` | Route access | authenticated session | logout | force signed-out state |
| `canOpenShellOverlay` | Route access | authenticated identity | shell overlays | redirect to stable parent |
| `canViewDashboard` | Route access | `hc OR ra OR sysAdmin`; SysAdmin renders dashboard platform mode | dashboard | public entry when unauthenticated; `/dashboard` platform mode for platform fallbacks |
| `canUseDashboardReentry` | Route access | dashboard availability + typed destination support | dashboard re-entry | redirect to dashboard default state |
| `canViewInbox` | Route access | `hc OR ra` | inbox | redirect to dashboard |
| `canOpenConversation` | Entity capability | inbox access + conversation context | inbox deep links, notifications | inbox route without selection or notifications |

### 2. Jobs capabilities

| Capability | Layer | Main inputs | Used by | Deny/fallback |
|---|---|---|---|---|
| `canViewJobsList` | Route access | `hc`, jobs nav branching state | jobs list | hide nav; redirect dashboard if direct URL denied |
| `canCreateJob` | Route access | `hc`, admin/delegated rights, workflow settings | job authoring | denied state or jobs list |
| `canEditJob` | Entity capability | job context + org rights | job authoring | denied state or job detail |
| `canResetJobWorkflow` | Action capability | edit context + workflow state | job authoring | hide/disable with explanation |
| `canViewJobDetail` | Entity capability | job visibility + collaborator context | job hub | denied state or jobs list |
| `canManageJobState` | Action capability | job workflow/publication state | job hub | hide/disable with explanation |
| `canOpenJobTask` | Route access | job detail access + task route context | job overlays | return to job hub |
| `canScheduleInterviewFromJob` | Action capability | job access + `calendarIntegration` + task context | job schedule flow | disabled action or job hub fallback |
| `canCreateOfferFromJob` | Action capability | job access + commercial capability + task context | job offer flow | disabled action or job hub fallback |
| `canRejectCvFromJob` | Action capability | job access + rejection policy | job reject flow | disabled action or job hub fallback |
| `canUseJobRequisitionBranching` | Route access | `hc` + admin + `jobRequisition` | jobs branching, requisition authoring routes | jobs/dashboard fallback |
| `canManageJobAssignments` | Action capability | assignment rights + job context | job detail and authoring | disabled action |

### 3. Candidate capabilities

| Capability | Layer | Main inputs | Used by | Deny/fallback |
|---|---|---|---|---|
| `canViewCandidateDetail` | Entity capability | candidate/job visibility + org context | candidate hub | denied state or parent job |
| `canNavigateCandidateSequence` | Entity capability | candidate ordering/filter/job-step context | candidate hub | stay on current candidate without sequence |
| `canOpenCandidateAction` | Route access | candidate hub access + task context | candidate action routes | return to candidate hub |
| `canScheduleInterviewFromCandidate` | Action capability | candidate action context + `calendarIntegration` | candidate schedule flow | disabled action or candidate hub |
| `canCreateOfferFromCandidate` | Action capability | candidate action context + commercial capability | candidate offer flow | disabled action or candidate hub |
| `canRejectCandidate` | Action capability | candidate action context + rejection policy | candidate reject flow | disabled action or candidate hub |
| `canMoveCandidateStage` | Action capability | current step + workflow rules | candidate actions | disabled action |
| `canHireCandidate` | Action capability | current step + hire rules | candidate actions | disabled action |
| `canRequestCandidateReview` | Action capability | review-enabled state | candidate actions | disabled action |
| `canManageCandidateDocuments` | Action capability | candidate doc visibility + upload capability | candidate docs/contracts | section-level deny |
| `canViewCandidateContracts` | Entity capability | contracts entitlement + candidate context | candidate contracts section | hide section |
| `canViewCandidateSurveys` | Entity capability | surveys entitlement + candidate context | candidate surveys section | hide section |
| `canEditCandidateCustomFields` | Action capability | custom-fields entitlement + candidate context | candidate custom fields | section read-only or hidden |
| `canViewInterviewFeedback` | Entity capability | `interviewFeedback` + candidate context | candidate scoring/interview sections, settings | hide section |
| `canCommentOnCandidate` | Action capability | candidate context + collaboration access | candidate collaboration | disable composer |
| `canTagCandidate` | Action capability | `candidateTags` + candidate context | candidate tags | hide/disable tagging |
| `canOpenCandidateConversation` | Action capability | inbox access + candidate context | candidate-to-inbox handoff | open candidate without conversation |
| `canViewCandidateDatabase` | Route access | `hc` + `seeCandidates` | candidate database routes | hide nav; dashboard fallback |
| `canSearchCandidates` | Action capability | database access + search entitlements like `booleanSearch` | candidate database | limited/basic search |

### 4. Settings, integrations, reports, billing, sysadmin capabilities

| Capability | Layer | Main inputs | Used by | Deny/fallback |
|---|---|---|---|---|
| `canEnterSettings` | Route access | `hc OR ra`, subsection-specific entitlements, compatibility-route context | parameters/templates/settings | subsection deny or stable subsection fallback, then dashboard fallback when no subsection is available |
| `canManageUserSettings` | Action capability | authenticated identity | user settings | read-only or deny |
| `canManageCompanySettings` | Action capability | `hc` + admin | company settings | hide subsection |
| `canManageAgencySettings` | Action capability | `ra` or recruiter-visibility entitlement where applicable | agency settings/recruiters | hide subsection |
| `canManageCareersPage` | Action capability | `hc` + admin | careers page settings | hide subsection |
| `canManageApplicationPage` | Action capability | `hc` + admin | application page settings | hide subsection |
| `canManageJobListings` | Action capability | `hc` + admin | job listings + editor | hide subsection |
| `canManageHiringFlowSettings` | Action capability | `hc` + admin, requisition capabilities where applicable | hiring flow settings in `R4`, with `/requisition-workflows` remaining a later distinct route | hide subsection or dashboard fallback |
| `canManageCustomFields` | Action capability | `hc` + admin + `customFieldsBeta` | custom-fields settings as an operational-settings subsection, with candidate/public custom-field usage treated as downstream dependency rather than route scope | hide subsection |
| `canManageTemplates` | Action capability | `hc`, with admin-only and subtype-specific gates layered on smart questions, diversity questions, and interview scoring where applicable | templates family and template subsections as operational-settings subsections | hide subsection |
| `canManageRejectReasons` | Action capability | `hc` + admin + `rejectionReason` | reject reasons as an operational-settings subsection, with job/candidate reject flows treated as downstream consumers rather than route scope | hide subsection |
| `canManageApiEndpoints` | Action capability | `hc` + admin | API endpoints settings | hide subsection |
| `canManageFormsDocsSettings` | Action capability | `hc` + admin + `formsDocs` | forms/docs settings | hide subsection |
| `canViewIntegrations` | Route access | `hc` + admin | integrations index | hide subsection or dashboard fallback |
| `canManageIntegrationProvider` | Action capability | integration access + provider entitlement | integration detail/edit | return to integrations index |
| `canUseIntegrationTokenEntry` | Route access | token validity + integration contract | unsigned integration routes | token error state |
| `canViewReports` | Route access | `hc` + admin | reports index | hide nav or dashboard fallback |
| `canViewReportFamily` | Route access | report family entitlement | report pages | report index fallback |
| `canExportReport` | Action capability | report family access + export support | report exports | disable export |
| `canScheduleReport` | Action capability | report family access + schedule support | report scheduling | disable scheduling |
| `canViewOrgFavorites` | Route access | org context with `seeFavorites`, `recruiters`, or RA context | favorites list/detail | dashboard fallback |
| `canViewBilling` | Route access | `hc` + admin + `!billingHidden` | billing | hide nav or dashboard fallback |
| `canUpgradeSubscription` | Action capability | billing access | billing upgrade | billing overview fallback |
| `canManageSmsBilling` | Action capability | billing access + SMS commercial state | billing SMS flow | billing overview fallback |
| `canManageBillingCard` | Action capability | billing access + card context | billing card overlay | billing overview fallback |
| `canViewMarketplace` | Route access | `ra` | marketplace | hide nav or dashboard fallback |
| `canViewPlatformNavigation` | Route access | `sysAdmin` plus at least one platform route capability | shell Platform navigation group | hide Platform group |
| `canViewPlatformMasterDataNav` | Route access | `sysAdmin` plus `canManageHiringCompanies` or `canManageRecruitmentAgencies` or `canManagePlatformSubscriptions` | Platform / Master data nav group | hide nav group |
| `canViewPlatformUsersAndRequestsNav` | Route access | `sysAdmin` plus platform-scoped `canManagePlatformUsers` or platform-scoped `canManageFavoriteRequests` | Platform / Users and requests nav group | hide nav group |
| `canViewPlatformTaxonomyNav` | Route access | `sysAdmin` plus `canManageTaxonomy` | Platform / Taxonomy nav group | hide nav group |
| `canManageHiringCompanies` | Route access | `sysAdmin` | sysadmin companies | `/dashboard` platform-mode fallback |
| `canManageRecruitmentAgencies` | Route access | `sysAdmin` | sysadmin agencies | `/dashboard` platform-mode fallback |
| `canManagePlatformSubscriptions` | Route/action access | `sysAdmin` | sysadmin subscriptions and company-subscription mutation readiness | `/dashboard` platform-mode fallback or blocked mutation action |
| `canManageTaxonomy` | Route access | `sysAdmin` | sectors/subsectors | `/dashboard` platform-mode fallback |
| `canManagePlatformUsers` | Route access | `sysAdmin` for platform `/users*` routes; org invite/membership remains a separate R4 team contract | platform users | `/dashboard` platform-mode fallback |
| `canManageFavoriteRequests` | Route/action access | `sysAdmin` for platform `/favorites-request*`; org favorite entitlements remain a separate contract for `/favorites*` and `/favorites/request*` | platform favorite requests | `/dashboard` platform-mode fallback |

## Deny semantics

All denied decisions must resolve to one of four explicit outcomes:
- `hide` — do not show the nav item/section/action
- `disabled_explained` — show but explain why unavailable
- `route_redirect` — redirect to a stable fallback route
- `denied_state` — render a typed access-denied state inside the route shell

## Planning rule

A route is not ready for implementation unless its primary capability decisions are defined here or in a directly referenced extension to this catalog.

## R5 SysAdmin foundation capability contract

Implemented platform capabilities are platform-scoped, not org-scoped:
- `canViewPlatformNavigation` requires a SysAdmin platform context plus at least one platform route-family capability.
- `canViewPlatformMasterDataNav`, `canViewPlatformUsersAndRequestsNav`, and `canViewPlatformTaxonomyNav` gate the `Platform` child groups.
- `canManageHiringCompanies`, `canManageRecruitmentAgencies`, `canManagePlatformSubscriptions`, `canManagePlatformUsers`, `canManageFavoriteRequests`, and `canManageTaxonomy` are granted only for the SysAdmin platform context in this foundation baseline.
- Org-admin user-management access and org favorite access must not grant `Platform` navigation.
- Denied platform-only route entry uses `/dashboard` as the authenticated fallback.

## R4 candidate database implemented capability contract

Candidate database access is now represented in source by:
- `canViewCandidateDatabase`: route access for HC contexts with `seeCandidates`. Denied direct entry falls back to `/dashboard`.
- `canSearchCandidates`: search action capability derived from candidate database route access in the foundation baseline. Later advanced search slices may further distinguish boolean/tag search affordances without changing the base route gate.

RA contexts and HC contexts without `seeCandidates` do not receive candidate database access.

## R4 integrations admin implemented capability contract

Integrations admin access is now represented in source by:
- `canViewIntegrations`: route access for HC admin contexts to `/integrations`.
- `canManageIntegrationProvider`: provider detail/action access derived from integrations admin access in the foundation baseline.

Denied direct entry falls back to `/dashboard` for the shell route gate. Provider detail itself preserves `/integrations` as the parent-index return target.

## R4 reports implemented capability contract

Reports access is now represented in source by:
- `canViewReports`: HC admin route access for `/report` and legacy compatibility entries.
- `canViewReportFamily`: family route access for `/report/:family`, falling back to `/report`.
- `canExportReport`: shared export command capability in the foundation baseline.
- `canScheduleReport`: shared scheduling command capability in the foundation baseline.

Family-specific entitlement and beta decisions can narrow these capabilities in later report-family slices without replacing the shared command contract.

## R4 org team/users implemented capability contract

Org team/users access is now represented in source by:
- `canViewOrgTeam`: HC/RA org-admin access to `/team`.
- `canViewRecruiterVisibility`: recruiter visibility access derived from org team access.
- `canManageOrgInvites`: org-scoped invite send/resend/revoke and membership-management readiness access derived from org team access.

These capabilities do not grant `canViewPlatformNavigation` or `canManagePlatformUsers`; platform user administration remains separate. `/users/invite` is retained as the compatibility invite path, but its route metadata and access contract consume `/team`, `canManageOrgInvites`, and recruiter-core fallback instead of route-heavy `/users*` CRUD.

## R4 org favorites implemented capability contract

Org favorites access is now represented in source by:
- `canViewOrgFavorites`: HC users with `seeFavorites` or `recruiters` entitlement, plus RA users, can access `/favorites`, `/favorites/:id`, `/favorites/request`, and `/favorites/request/:id`.

This capability does not grant `canViewPlatformNavigation` or `canManageFavoriteRequests`; platform favorite-request queues remain separate.

## R4 billing foundation implemented capability contract

Billing access is now represented in source by:
- `canViewBilling`: HC admin access to `/billing` when billing is not hidden.
- `canUpgradeSubscription`: upgrade task-flow access derived from billing access.
- `canManageSmsBilling`: SMS add-on task-flow access derived from billing access.
- `canManageBillingCard`: card-management access derived from billing access.

These capabilities do not grant `canViewPlatformNavigation` or `canManagePlatformSubscriptions`; platform subscription administration remains separate.

## R4 marketplace RA implemented capability contract

Marketplace access is now represented in source by:
- `canViewMarketplace`: RA user/admin access to `/jobmarket/:type`.

This capability does not grant billing, HC-admin, or Platform navigation capabilities.
