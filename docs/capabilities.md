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
| `canViewDashboard` | Route access | `hc OR ra` with sysadmin handoff rule | dashboard | redirect to platform or public entry |
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
| `canUseJobRequisitionBranching` | Route access | `jobRequisition`, `seeJobRequisition`, admin context where required | jobs branching, requisition routes | jobs/dashboard fallback |
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
| `canEnterSettings` | Route access | `hc OR ra`, subsection-specific entitlements | parameters/templates/settings | subsection deny or dashboard fallback |
| `canManageUserSettings` | Action capability | authenticated identity | user settings | read-only or deny |
| `canManageCompanySettings` | Action capability | `hc` + admin | company settings | hide subsection |
| `canManageAgencySettings` | Action capability | `ra` or recruiter-visibility entitlement where applicable | agency settings/recruiters | hide subsection |
| `canManageCareersPage` | Action capability | `hc` + admin | careers page settings | hide subsection |
| `canManageApplicationPage` | Action capability | `hc` + admin | application page settings | hide subsection |
| `canManageJobListings` | Action capability | `hc` + admin | job listings + editor | hide subsection |
| `canManageHiringFlowSettings` | Action capability | `hc` + admin, requisition capabilities where applicable | hiring flow / requisition workflows | hide subsection or dashboard fallback |
| `canManageCustomFields` | Action capability | `hc` + admin + `customFieldsBeta` | custom-fields settings | hide subsection |
| `canManageApiEndpoints` | Action capability | `hc` + admin | API endpoints settings | hide subsection |
| `canManageFormsDocsSettings` | Action capability | `hc` + admin + `formsDocs` | forms/docs settings | hide subsection |
| `canViewIntegrations` | Route access | `hc` + admin | integrations index | hide subsection or dashboard fallback |
| `canManageIntegrationProvider` | Action capability | integration access + provider entitlement | integration detail/edit | return to integrations index |
| `canUseIntegrationTokenEntry` | Route access | token validity + integration contract | unsigned integration routes | token error state |
| `canViewReports` | Route access | `hc` + admin | reports index | hide nav or dashboard fallback |
| `canViewReportFamily` | Route access | report family entitlement | report pages | report index fallback |
| `canExportReport` | Action capability | report family access + export support | report exports | disable export |
| `canScheduleReport` | Action capability | report family access + schedule support | report scheduling | disable scheduling |
| `canViewBilling` | Route access | `hc` + admin + `!billingHidden` | billing | hide nav or dashboard fallback |
| `canUpgradeSubscription` | Action capability | billing access | billing upgrade | billing overview fallback |
| `canManageSmsBilling` | Action capability | billing access + SMS commercial state | billing SMS flow | billing overview fallback |
| `canManageBillingCard` | Action capability | billing access + card context | billing card overlay | billing overview fallback |
| `canManageHiringCompanies` | Route access | `sysAdmin` | sysadmin companies | platform dashboard fallback |
| `canManageRecruitmentAgencies` | Route access | `sysAdmin` | sysadmin agencies | platform dashboard fallback |
| `canManagePlatformSubscriptions` | Route access | `sysAdmin` | sysadmin subscriptions | platform dashboard fallback |
| `canManageTaxonomy` | Route access | `sysAdmin` | sectors/subsectors | platform dashboard fallback |
| `canManagePlatformUsers` | Route access | `sysAdmin` or org-admin user-management context | users | org/platform fallback |
| `canManageFavoriteRequests` | Route access | `sysAdmin` or favorite entitlements depending on route | favorite requests | route-specific fallback |

## Deny semantics

All denied decisions must resolve to one of four explicit outcomes:
- `hide` — do not show the nav item/section/action
- `disabled_explained` — show but explain why unavailable
- `route_redirect` — redirect to a stable fallback route
- `denied_state` — render a typed access-denied state inside the route shell

## Planning rule

A route is not ready for implementation unless its primary capability decisions are defined here or in a directly referenced extension to this catalog.
