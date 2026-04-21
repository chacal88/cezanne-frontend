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

## Capability category semantics

Use these categories when auditing docs against route metadata:

| Category | Expected source usage | Examples |
|---|---|---|
| Route capability | may appear as `requiredCapability` in route metadata or an `AccessBoundary` | `canViewJobsList`, `canEnterSettings`, `canViewNotifications` |
| Mutation capability | may appear as `mutationCapability` or task-flow action gate | `canCreateJob`, `canRejectCvFromJob`, `canCreateOfferFromCandidate` |
| Action capability | consumed inside route-owned pages, workflows, or action launchers | `canCommentOnCandidate`, `canManageJobAssignments`, `canExportReport` |
| Navigation capability | controls shell/menu exposure without necessarily being route metadata | `canSeeNavSection`, platform navigation visibility capabilities |
| Resolver/destination capability | used by notification, inbox, redirect, or compatibility resolvers | `canResolveNotificationDestination`, `canOpenConversation` |
| Public/token capability | route-local public/token access that must not unlock authenticated shell | `canCompletePublicSurvey`, `canUseExternalReviewFlow`, `canApproveRequisitionByToken` |

A capability listed in this document is not missing from implementation merely because it is absent from route metadata as `requiredCapability`. First check whether it is action-level, navigation-level, resolver-level, mutation-level, or public/token route-local. Route metadata remains authoritative for route entry ownership; page modules and helper tests remain authoritative for action and resolver capability usage.

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
| `canViewNotifications` | Route access | authenticated identity | notifications | redirect to dashboard |
| `canResolveNotificationDestination` | Route access | notification payload + access context | shell notifications | typed fallback destination |
| `canOpenAccountArea` | Route access | authenticated identity + org context where applicable | user/company/agency profile and shell-owned account overlays | redirect to stable parent or dashboard |
| `canLogout` | Route access | authenticated session | logout | force signed-out state |
| `canViewDashboard` | Route access | `hc OR ra OR sysAdmin`; SysAdmin renders dashboard platform mode | dashboard | public entry when unauthenticated; `/dashboard` platform mode for platform fallbacks |
| Dashboard re-entry resolver | Internal resolver/fallback affordance | dashboard availability + typed destination support | notification/deep-link return flows | dashboard default state |
| `canUseInbox` | Route access | `hc OR ra` | inbox | redirect to dashboard |
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
| `canEnterSettings` | Route access | authenticated `hc OR ra`, compatibility-route context | `/parameters*` compatibility resolver | resolve to first available recognized subsection, or dashboard fallback when no subsection is available |
| `canViewUserSettings` | Route access | authenticated identity | user settings | dashboard fallback or deny |
| `canManageCompanySettings` | Action capability | `hc` + admin | company settings | hide subsection |
| `canManageAgencySettings` | Action capability | `ra` or recruiter-visibility entitlement where applicable | agency settings/recruiters | hide subsection |
| `canManageCareersPage` | Action capability | `hc` + admin | careers page settings | hide subsection |
| `canManageApplicationPage` | Action capability | `hc` + admin | application page settings | hide subsection |
| `canManageJobListings` | Action capability | `hc` + admin | job listings + editor | hide subsection |
| `canManageHiringFlowSettings` | Action capability | `hc` + admin, requisition capabilities where applicable | hiring flow settings in `R4`, with `/requisition-workflows` remaining a later distinct route | hide subsection or dashboard fallback |
| `canManageCustomFields` | Action capability | `hc` + admin + `customFieldsBeta` | custom-fields settings as an operational-settings subsection, with candidate/public custom-field usage treated as downstream dependency rather than route scope | hide subsection |
| `canManageTemplates` | Action capability | `hc`, with admin-only and subtype-specific gates layered on smart questions, diversity questions, and interview scoring where applicable | templates family and template subsections as operational-settings subsections | hide subsection |
| `canManageRejectReasons` | Action capability | `hc` + admin + `rejectionReason` | reject reasons as an operational-settings subsection, with job/candidate reject flows treated as downstream consumers rather than route scope | hide subsection |
| `canManageApiEndpoints` | Route/action capability | authenticated `hc` + admin; not granted by RA, SysAdmin, or integrations capabilities | `/settings/api-endpoints` and `api-endpoints` compatibility resolution | hide subsection or dashboard fallback; validation/save failures stay in-route |
| `canManageFormsDocsSettings` | Route/action capability | `hc` + admin + `formsDocs`; not inferred from candidate document capabilities | `/settings/forms-docs` and `forms-docs` compatibility resolution | hide subsection or dashboard fallback; settings save/retry stays in route while candidate/public consumers receive refresh intent |
| `canViewIntegrations` | Route access | `hc` + admin | integrations index | hide subsection or dashboard fallback |
| `canManageIntegrationProvider` | Action capability | integration access + provider entitlement | integration detail/edit plus provider-specific configuration/auth/diagnostics actions | return to integrations index |
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


## R5 public/token requisition forms capability contract

For `r5-public-token-leftovers`:
- `canDownloadRequisitionFormsByToken` is the public/token route capability key for `/job-requisition-forms/:id?download`.
- Access is derived from route token/form context, not authenticated shell roles, SysAdmin status, integrations admin access, or approval workflow mutation rights.
- Valid links can render the forms view and enable the explicit download action.
- Invalid, expired, inaccessible, unavailable, already-downloaded, and not-found states render public/external route-local messages.
- Retryable download failures remain in-route and do not consume or mutate approval terminal state.

## R5 settings leftovers capability contract

For `r5-settings-leftovers`:
- `canEnterSettings` is the route gate for `/parameters/:settings_id?/:section?/:subsection?` compatibility entry.
- `canEnterSettings` allows authenticated HC/RA contexts to enter the resolver, but the resolver must still evaluate the resolved subsection capability before exposing controls.
- Recognized compatibility subsection keys are `hiring-flow`, `custom-fields`, `templates`, `reject-reasons`, `api-endpoints`, and `forms-docs`.
- Unknown, unauthorized, unavailable, and unimplemented subsection keys fall back to the first available recognized subsection for the actor, or `/dashboard` when none is available.
- `canManageApiEndpoints` is granted only to authenticated HC Admin contexts. It is not granted by `canViewIntegrations`, `canManageIntegrationProvider`, SysAdmin platform capabilities, or RA context.
- API endpoint validation and save failures remain route-local states; components must not inspect raw role/session payloads directly.

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

## Provider-specific integrations depth capability contract

For `provider-specific-integrations-depth`:
- `canViewIntegrations` remains the route gate for `/integrations`.
- `canManageIntegrationProvider` remains the route/action gate for `/integrations/:id`, including configuration, auth, and diagnostics sections.
- `canUseIntegrationTokenEntry` must not grant access to authenticated provider setup actions.
- first implemented provider-family depth is limited to `calendar`, `job-board`, and `hris`; unsupported families render unavailable/unimplemented provider-family states.
- provider configuration/auth/diagnostics failures remain route-local and return to `/integrations` as parent.
- Provider setup exposes normalized readiness signals for scheduling, publishing, and HRIS sync/workflow consumers; operational routes must not inspect raw provider setup details.

## Provider readiness operational gates capability contract

Provider readiness gates are action-readiness checks, not route-access capabilities.

Rules:
- Existing route capabilities still decide whether the user can enter the operational route.
- Readiness gates decide whether a scheduling, publishing, or HRIS workflow action can proceed inside an already-authorized route. Calendar scheduling then keeps validation, conflict, retry, submit-failed, and submitted parent-refresh behavior route-local for authenticated job/candidate task flows.
- `blocked`, `degraded`, `unavailable`, and `unimplemented` outcomes do not grant or remove route access; they render route-local remediation.
- Operational routes must not derive provider setup permissions from raw provider configuration, credentials, diagnostics, OAuth payloads, or token-entry capabilities.
- Recovery actions may link to `/integrations/:providerId` only when the normalized signal supplies a safe setup target and the current user can access integrations setup.

## Integration operational-depth capability contract

The operational-depth sequence is synchronized in `integration-operational-depth-sequence-plan.md`; all eight packages are implemented and validated.

Rules:
- Operational-depth checks are action-readiness or status-readiness decisions; they do not replace existing route access capabilities.
- Scheduling, publishing, HRIS, messaging, contract/signing, survey/review/scoring, and ATS source/sync packages must preserve the existing route capabilities listed above.
- Non-ready operational states such as blocked, degraded, unavailable, unimplemented, schema-required, template-required, document-required, reviewer-required, stale-source, status-stale, duplicate-detected, send-failed, publish-failed, submit-failed, and sync-failed must render route-local recovery without granting new route access.
- Recovery links to `/integrations/:providerId` are allowed only when a normalized readiness/status signal supplies a safe setup target and the actor already has the relevant integrations capability.
- Public/token capabilities remain separate from authenticated recruiter-shell capabilities; internal inbox, contract, ATS, or candidate review capabilities must not grant access to `/chat/*`, `/surveys/*`, `/review-candidate/*`, `/interview-feedback/*`, or `/integration/*` beyond their existing token contracts.

### Job-board publishing operational depth

Publishing depth does not introduce new route capabilities. Job Authoring continues to use job authoring capabilities for draft create/edit, and Job Listings continues to use `canManageJobListings`. Provider readiness gates are preconditions for publish/unpublish actions only and never authorize provider setup outside `/integrations/:providerId`.

## HRIS requisition operational depth implementation note

`hris-requisition-operational-depth` is implemented as the HRIS-specific follow-on to provider readiness gates. It scopes `/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` as Jobs-side consumers and `/requisition-workflows` as a Settings-side administration consumer. The model covers ready, mapping-required, mapping-drift, sync-pending, sync-degraded, sync-failed, retrying, synced, auth-required, provider-blocked, unavailable, and unimplemented outcomes without exposing raw HRIS mappings, OAuth payloads, provider diagnostics, or tenant-sensitive data.

Mapping drift and workflow drift remain separate: HRIS mapping remediation points to HRIS/workflow administration, while existing requisition workflow drift remains authoritative for removed stages, changed required fields, reassigned approvals, and stale workflow route repair. Public/token `/job-requisition-approval`, `/job-requisition-forms`, and `/integration/*` routes remain unchanged.

## Contract signing operational depth capabilities

Offer/contract actions continue to use the existing candidate and job task capabilities, but now consume contract prerequisites before proceeding. Missing template, missing document, provider-blocked, degraded, unavailable, and status-stale outcomes deny send/launch locally without re-authorizing standalone signer or public token routes.


## ATS and assessment provider setup capability note

ATS and assessment setup uses the existing authenticated integrations capabilities (`canViewIntegrations` and `canManageIntegrationProvider`). These capabilities do not grant public/token route access and do not implement custom provider setup.

## Auth foundation capability note

Auth foundation keeps `canStartSession`, `canUseAuthTokenFlow`, and `canCompleteSsoCallback` on public/token route classes. `canEnterShell` remains authenticated-shell only, so invalid/expired/used/inaccessible auth token states stay public and cannot unlock shell capabilities.

## Product-depth capability boundaries

Shell product-depth consumes authenticated shell capabilities for navigation and account-context visibility only. Jobs product-depth consumes Jobs capabilities without taking ownership of provider setup or Candidate actions. Candidate product-depth consumes Candidate capabilities without taking ownership of public/token, signer-facing, provider setup, or inbox send mechanics. Public/token product-depth does not require `canEnterShell`, account context, or authenticated navigation.

## Implementation-depth capability note

Capability keys are ownership and access boundaries, not proof of complete product behavior. The active depth packages add validation for auth/session, shell notification resolution, Jobs product-depth, Candidate product-depth, and public/token product-depth while preserving provider setup and operational flow separation.

## Email deliverability capability boundary

No `canManageEmailDeliverability`, `canManageSenderDomain`, `canVerifySenderDomain`, or `canManageSenderSignature` frontend route capability is currently defined. Sender-domain verification, managed sender-domain lifecycle, DNS/provider setup, manual revalidation, and sender-signature setup remain backend-only/no-UI.

Operational routes may use their existing capabilities (`canUseInbox`, `canOpenConversation`, `canViewNotifications`, and candidate communication capabilities) to render normalized email readiness states. Those capabilities do not grant setup ownership and must not expose raw provider, DNS, domain, signature, token, or message payload data.
