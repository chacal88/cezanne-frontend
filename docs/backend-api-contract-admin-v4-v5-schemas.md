# Backend/API Contract: Admin V4/V5 Schemas

## Purpose

This document records the Phase 5 backend-facing contract draft for V4 operational/admin schemas and V5 SysAdmin/platform schemas.

It intentionally follows the shared provider/payment/report/file-transfer primitives in `backend-api-contract-provider-upload-download.md`, so admin table and mutation schemas do not fossilize fixture fields.

No route family becomes replacement-approved through this document.

## Confirmed Frontend Evidence

Current source-backed evidence:
- account settings and profile states are modeled in `src/domains/settings/account/support/account-settings-state.ts` with explicit unknown fields `profile-persistence-api` and `server-validation-schema`.
- careers/application/job-listing settings serialize current fixture payloads in `src/domains/settings/careers-application/support/models.ts` and consume job-board publishing readiness.
- forms/docs settings model schema id, version, requested documents, downstream impact, stale/degraded/unavailable, validation, save failure, retry, and success in `src/domains/settings/forms-docs-controls/support/models.ts`.
- API endpoint settings model endpoint URL, sandbox/production, token/header credential mode, validation, saving, saved, save-error, denied, and unavailable in `src/domains/settings/api-endpoints/support/api-endpoints-state.ts`.
- templates, reject reasons, custom fields, hiring-flow, and requisition workflows are fixture-backed settings slices.
- reports model families, filters, result states, command states, safe telemetry, and unknown result fields in `src/domains/reports/support/report-state.ts`.
- billing models overview, upgrade, SMS, card, provider challenge, stale/degraded/unavailable, pending/success/failure/retry, and `platformSubscriptionAdmin: false` in `src/domains/billing/support/billing-state.ts`.
- org team/invite/recruiter visibility models unknown contract fields `member.apiContract`, `member.roleWritePolicy`, and `recruiterVisibility.filterContract` in `src/domains/team/support/team-foundation.ts`.
- org favorites and org favorite requests are separate from platform favorite-request queues in `src/domains/favorites/support/favorites-state.ts`.
- marketplace list types are `fill`, `bidding`, `cvs`, and `assigned` in `src/domains/marketplace/support/marketplace-state.ts`.
- platform users `/users*` are platform-owned with URL-owned filters in `src/domains/sysadmin/users-and-requests/support/platform-users-state.ts`; `/users/invite` is explicitly excluded from platform return targets.
- platform favorite-request queue uses pending/resolved/rejected/stale/inaccessible/empty/error/action-failure states in `src/domains/sysadmin/users-and-requests/support/favorite-request-queue-state.ts`.
- platform master data covers hiring companies, recruitment agencies, subscriptions, and company subscription admin in `src/domains/sysadmin/master-data/support/master-data-state.ts`.
- platform taxonomy covers sectors and subsectors with list/detail/mutation states in `src/domains/sysadmin/taxonomy/support/taxonomy-state.ts`.

Current docs evidence:
- `v4-operations-visual-contract.md` keeps V4 Settings, Reports, Billing, Team, Favorites, and Marketplace Figma-ready only for current-app screen-flow bases; backend schemas remain deferred.
- `v5-sysadmin-platform-visual-contract.md` keeps platform users, favorite-request queues, master data, subscription admin, and taxonomy schemas deferred.
- `r4-team-and-favorites-open-points.md` separates org-scoped `/team`, `/team/recruiters`, `/users/invite`, `/favorites*`, and `/favorites/request*` from platform `/users*` and `/favorites-request*`.
- `r5-sysadmin-open-points.md` and `r5-master-plan.md` keep SysAdmin inside the existing app, with `/dashboard` as platform landing and platform route denial fallback.
- `backend-api-contract-provider-upload-download.md` owns payment tokenization/challenge, provider readiness, file-transfer, and report export/download primitives consumed by these admin schemas.

## Scope Boundary

In scope:
- V4 settings subsection read/update schemas and validation envelopes;
- V4 reports result/filter/command schema references, excluding export/download primitive details already defined in Phase 4;
- V4 billing org-commercial schemas, excluding payment-provider raw details already defined in Phase 4;
- V4 org team/invite/recruiter visibility schemas;
- V4 org favorites/request schemas and RA marketplace list/action schemas;
- V5 platform users, favorite-request queue, master data, company subscription admin, taxonomy, and platform dashboard aggregate decision.

Out of scope:
- provider credentials, payment secrets, signed URLs, raw diagnostics, and raw callback payloads;
- backend implementation;
- final visual design;
- replacement approval;
- moving org-owned routes into platform ownership or platform-owned routes into org ownership.

## Shared Admin Envelope

```ts
type AdminEnvelope<T> = {
  data: T | null;
  status: 'ok' | 'validation_error' | 'denied' | 'not_found' | 'stale' | 'conflict' | 'degraded' | 'unavailable' | 'partial' | 'error';
  correlationId: string;
  pageInfo?: AdminPageInfoDto;
  warnings?: AdminWarningDto[];
  errors?: AdminErrorDto[];
  refresh?: AdminRefreshDirectiveDto;
};

type AdminErrorDto = {
  code: string;
  messageKey: string;
  field?: string;
  retryable: boolean;
};

type AdminPageInfoDto = {
  page: number;
  perPage: number;
  totalCount?: number;
  hasNextPage: boolean;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
};

type AdminRefreshDirectiveDto = {
  refreshParent: boolean;
  targets: string[];
  returnTarget?: string;
};
```

Rules:
- raw backend/provider errors must be normalized to `AdminErrorDto`.
- table filters, pagination, sort, and route return targets must be explicit.
- `x-correlation-id` must propagate.
- telemetry must be safe and aggregate-oriented.

## V4 Settings Schemas

Adapter owner:
- `settings.*` route-family adapters.

### Account/Profile Settings

```ts
type AccountSettingsRouteKind =
  | 'user_settings'
  | 'company_settings'
  | 'agency_settings'
  | 'hiring_company_profile'
  | 'recruitment_agency_profile'
  | 'user_profile';

type AccountSettingsDto = {
  routeKind: AccountSettingsRouteKind;
  owner: 'settings.user_settings' | 'settings.company_settings' | 'settings.agency_settings' | 'shell.account';
  canEdit: boolean;
  profile: {
    displayName?: string;
    email?: string;
    locale?: string;
    organizationName?: string;
    phone?: string;
    address?: string;
  };
  version: string;
};
```

Open decisions:
- field ownership per user/company/agency;
- server validation schema;
- stale/conflict behavior;
- account-menu parity.

### Careers/Application/Job Listings Settings

```ts
type CareersPageSettingsDto = {
  brandSlug: string;
  companyName: string;
  headline: string;
  featuredJobsEnabled: boolean;
  featureEnabled: boolean;
  publicReflection: PublicReflectionDto;
};

type ApplicationPageSettingsDto = {
  settingsId: string;
  section: 'intro' | 'questions' | 'consent';
  subsection: 'header' | 'fields' | 'privacy';
  introTitle: string;
  collectPhone: boolean;
  consentRequired: boolean;
  featureEnabled: boolean;
  publicReflection: PublicReflectionDto;
};

type JobListingSettingsDto = {
  uuid: string;
  brand: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  publishReady: boolean;
  publishingStatus: {
    state: string;
    canPublish: boolean;
    publicReflectionIntent: 'none' | 'pending' | 'confirmed' | 'refresh_required';
  };
};

type PublicReflectionDto = {
  state: 'none' | 'pending' | 'confirmed' | 'failed' | 'stale';
  refreshTarget?: 'shared_job' | 'public_application' | 'job_listing';
};
```

Rules:
- job-board publish status consumes Phase 4 provider readiness; it is not embedded credential state.
- save and publish are separate mutations.

### Forms/Docs, Templates, Reject Reasons, Custom Fields, Hiring Flow

```ts
type FormsDocsSettingsDto = {
  schemaId: string;
  source: 'backend';
  version: number;
  requestedDocuments: Array<{
    id: string;
    label: string;
    consumer: 'candidate_documents' | 'public_application' | 'integration_forms';
    required: boolean;
  }>;
  publicUploadsEnabled: boolean;
  downstreamImpact: Array<{
    consumer: 'candidate_documents_contracts' | 'public_application' | 'integration_forms_token';
    state: 'fresh' | 'stale' | 'degraded' | 'unavailable';
    refreshIntent: 'none' | 'refresh_on_next_open' | 'refresh_now';
  }>;
};

type TemplateSettingsDto = {
  templates: Array<{ id: string; title: string; kind: 'generic' | 'smart_questions' | 'diversity_questions' | 'interview_scoring' }>;
  version: string;
};

type RejectReasonCatalogDto = {
  reasons: Array<{ id: string; label: string; active: boolean; sortOrder?: number }>;
  version: string;
};

type CustomFieldSchemaDto = {
  schemaId: string;
  fields: Array<{
    id: string;
    label: string;
    scope: 'candidate' | 'public_application';
    required: boolean;
    fieldType: 'text' | 'number' | 'date' | 'select' | 'boolean';
    options?: string[];
  }>;
  version: string;
};

type HiringFlowSettingsDto = {
  workflowId: string;
  workflowName: string;
  defaultStageName: string;
  stageCount: number;
  approvalsEnabled: boolean;
  requisitionMode: 'disabled' | 'optional' | 'required';
  version: string;
};
```

Open decisions:
- whether templates/reject reasons/custom fields share one configuration endpoint or per-subsection endpoints;
- delete/reorder semantics;
- downstream invalidation when forms/docs/custom fields change.

### API Endpoints

```ts
type ApiEndpointSettingsDto = {
  endpointUrl: string;
  environment: 'sandbox' | 'production';
  credentialMode: 'token' | 'headers';
  headerCount: number;
  credentialState: 'not_set' | 'set' | 'rotating' | 'expired';
};
```

Rules:
- private token/header values are write-only and never returned.
- production endpoints must use HTTPS unless backend explicitly rejects the mutation.
- webhook/private token persistence is not a SysAdmin contract.

## V4 Reports Schemas

Adapter owner:
- `reports.*`.

```ts
type ReportFamily = 'jobs' | 'hiring_process' | 'teams' | 'candidates' | 'diversity' | 'source';

type ReportQueryRequest = {
  family: ReportFamily;
  filters: {
    period: string;
    ownerId?: string;
    teamId?: string;
    [key: string]: string | number | boolean | undefined;
  };
  page?: number;
  perPage?: number;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
};

type ReportResultDto = {
  family: ReportFamily;
  state: 'ready' | 'empty' | 'denied' | 'unavailable' | 'degraded' | 'partial' | 'stale' | 'retryable' | 'unsupported';
  metrics: Array<{ id: string; label: string; value: number | string; unit?: string }>;
  dimensions: Array<{ id: string; label: string }>;
  rows: Array<Record<string, string | number | boolean | null>>;
  resultVersion: string;
};
```

Rules:
- export/schedule delivery lifecycle consumes Phase 4 report export primitive.
- stale/partial results must block commands unless backend explicitly marks partial export supported.
- filter telemetry uses safe filter summaries only.

## V4 Billing Schemas

Adapter owner:
- `billing.*`.

```ts
type BillingSnapshotDto = {
  routeState: 'loading' | 'ready' | 'empty' | 'denied' | 'unavailable' | 'stale' | 'degraded' | 'pending';
  commercialState: 'ready' | 'hidden' | 'unavailable';
  currentPlanId?: 'starter' | 'growth' | 'enterprise';
  targetPlanId?: 'starter' | 'growth' | 'enterprise';
  cards: BillingCardDto[];
  sms: SmsAddonDto;
  pendingChanges: Array<{ kind: 'plan_change' | 'sms_change' | 'card_change'; state: 'pending' | 'failed' | 'retry' | 'success' | 'partial_success'; labelKey: string }>;
  platformSubscriptionAdmin: false;
};

type BillingCardDto = {
  id: string;
  label: string;
  role: 'primary' | 'backup' | 'new';
  state: 'ready' | 'expired' | 'missing' | 'unavailable' | 'validation_failed' | 'provider_challenge' | 'pending' | 'saved' | 'failed' | 'retry';
  actionAvailability: Array<{ action: 'edit' | 'remove' | 'make_default'; state: 'available' | 'blocked' | 'saving' | 'pending' | 'failed' | 'success'; reasonKey?: string }>;
};

type SmsAddonDto = {
  state: 'unavailable' | 'inactive' | 'trial' | 'active' | 'suspended' | 'usage_warning' | 'card_blocked' | 'pending' | 'success' | 'partial_success' | 'failed' | 'retry' | 'stale' | 'degraded' | 'denied';
  usage: { used: number; limit: number; warningThreshold: number };
};
```

Rules:
- payment tokenization/challenge is Phase 4 and must remain runtime-only.
- org billing must not grant or imply `canManagePlatformSubscriptions`.
- platform subscription admin is modeled separately under V5 master data.

## V4 Team, Favorites, Marketplace

### Org Team And Invites

```ts
type OrgTeamSnapshotDto = {
  members: Array<{
    id: string;
    name: string;
    role: 'admin' | 'recruiter';
    state: 'active' | 'pending_invite' | 'disabled';
  }>;
  invites: Array<{
    id: string;
    email: string;
    state: 'draft' | 'pending' | 'sent' | 'revoked' | 'blocked';
    blockedReasonKey?: string;
  }>;
  recruiters: Array<{
    id: string;
    name: string;
    role: 'admin' | 'recruiter';
    visibility: 'visible' | 'limited' | 'hidden';
    assignmentReadiness: 'ready' | 'pending' | 'blocked';
    linkedFavoriteCount: number;
  }>;
  loadState: 'ready' | 'empty' | 'partial' | 'stale' | 'unavailable' | 'refresh_required';
};
```

Open decisions:
- role write policy;
- invite mutation payloads and resend/revoke lifecycle;
- recruiter visibility filter semantics.

Boundary:
- `/users/invite` is org-scoped invite management.
- platform `/users*` is V5 SysAdmin and must not consume this DTO.

### Org Favorites And Requests

```ts
type OrgFavoriteDto = {
  id: string;
  label: string;
  ownership: 'personal' | 'org_shared' | 'recruiter_linked';
  recruiterId?: string;
  recruiterName?: string;
};

type OrgFavoriteRequestDto = {
  id: string;
  favoriteId?: string;
  state: 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'unavailable';
  title: string;
  actionAvailability: Array<{ action: 'submit' | 'cancel' | 'resubmit'; state: 'ready' | 'pending' | 'success' | 'blocked'; reasonKey?: string }>;
};
```

Boundary:
- org `/favorites/request*` is not platform `/favorites-request*`.

### Marketplace

```ts
type MarketplaceListRequest = {
  type: 'fill' | 'bidding' | 'cvs' | 'assigned';
  page?: number;
  perPage?: number;
};

type MarketplaceItemDto = {
  id: string;
  title: string;
  type: MarketplaceListRequest['type'];
  actionAvailability?: Array<{ action: 'assign' | 'bid' | 'submit_cv' | 'view'; state: 'available' | 'blocked'; reasonKey?: string }>;
};
```

Open decisions:
- RA assignment/bid/CV payloads;
- marketplace item fields by type;
- terminal outcomes and stale/unavailable taxonomy.

## V5 Platform Users

Adapter owner:
- `sysadmin.users`.

```ts
type PlatformUserListRequest = {
  page: number;
  search?: string;
  hiringCompanyId?: string;
  recruitmentAgencyId?: string;
  role?: string;
  state?: 'active' | 'invited' | 'disabled' | 'locked';
};

type PlatformUserDto = {
  id: string;
  displayName: string;
  email: string;
  state: 'active' | 'invited' | 'disabled' | 'locked';
  roles: Array<{ id: string; label: string; scope: 'platform' | 'hiring_company' | 'recruitment_agency' }>;
  tenants: Array<{ id: string; type: 'hiring_company' | 'recruitment_agency'; label: string }>;
  updatedAt: string;
};

type PlatformUserMutationRequest = {
  displayName: string;
  email: string;
  state?: PlatformUserDto['state'];
  roleIds: string[];
  tenantAssignments: Array<{ tenantId: string; tenantType: 'hiring_company' | 'recruitment_agency' }>;
  version?: string;
};
```

Rules:
- platform `/users`, `/users/new`, `/users/edit/:id`, and `/users/:id` are not org invite/team routes.
- `/users/invite` must be rejected as a platform return target.
- create/edit validation must return field-level errors.

## V5 Platform Favorite Requests

Adapter owner:
- `sysadmin.favorite-requests`.

```ts
type PlatformFavoriteRequestDto = {
  id: string;
  state: 'pending' | 'resolved' | 'rejected' | 'stale' | 'inaccessible' | 'empty' | 'error' | 'action_failure';
  organization: { id: string; type: 'hiring_company' | 'recruitment_agency'; label: string };
  requester?: { id: string; displayName: string };
  favorite?: { id: string; label: string };
  auditTrail: Array<{ id: string; action: string; actorLabel: string; createdAt: string }>;
  actionAvailability: Array<{ action: 'approve' | 'reject' | 'reopen'; available: boolean; blockedReason?: string }>;
};

type PlatformFavoriteRequestActionRequest = {
  action: 'approve' | 'reject' | 'reopen';
  reason?: string;
  version?: string;
};
```

Boundary:
- this queue is platform-owned and must not use org favorite request mutation payloads.

## V5 Master Data And Subscription Admin

Adapter owner:
- `sysadmin.master-data`.

```ts
type MasterDataEntity = 'hiring_company' | 'recruitment_agency' | 'subscription';

type MasterDataListRequest = {
  entity: MasterDataEntity;
  page?: number;
  perPage?: number;
  search?: string;
  state?: string;
};

type HiringCompanyDto = {
  id: string;
  name: string;
  state: 'active' | 'inactive' | 'suspended';
  subscriptionId?: string;
  updatedAt: string;
};

type RecruitmentAgencyDto = {
  id: string;
  name: string;
  state: 'active' | 'inactive' | 'suspended';
  updatedAt: string;
};

type SubscriptionDto = {
  id: string;
  planId: 'starter' | 'growth' | 'enterprise';
  state: 'active' | 'trial' | 'past_due' | 'cancelled' | 'suspended';
  ownerCompanyId?: string;
};

type CompanySubscriptionAdminDto = {
  companyId: string;
  routeCapability: 'canManageHiringCompanies';
  mutationCapability: 'canManagePlatformSubscriptions';
  canMutateSubscription: boolean;
  blockedReason?: 'missing_hiring_company_capability' | 'missing_platform_subscription_capability' | 'stale_company' | 'not_found';
  subscription?: SubscriptionDto;
};
```

Rules:
- route entry and subscription mutation capability are separate.
- org billing routes do not mutate platform subscriptions.
- mutation success refreshes company detail, company subscription, and subscriptions list.

## V5 Taxonomy

Adapter owner:
- `sysadmin.taxonomy`.

```ts
type SectorDto = {
  id: string;
  label: string;
  state: 'active' | 'inactive';
  sortOrder: number;
  version: string;
};

type SubsectorDto = {
  id: string;
  sectorId: string;
  label: string;
  state: 'active' | 'inactive';
  sortOrder: number;
  version: string;
};

type TaxonomyMutationRequest = {
  label: string;
  state?: 'active' | 'inactive';
  sortOrder?: number;
  parentSectorId?: string;
  version?: string;
};
```

Open decisions:
- create/update/delete/reorder mutation set;
- duplicate/conflict behavior;
- whether inactive sectors hide or disable child subsectors.

Boundary:
- taxonomy is not a settings subsection and not generic master data.

## Platform Dashboard Decision

Open decision:
- whether platform `/dashboard` mode remains navigation-only or receives backend aggregates.

If aggregates are added:

```ts
type PlatformDashboardDto = {
  widgets: Array<{
    id: string;
    label: string;
    value: number | string;
    drilldownTarget?: string;
  }>;
  activity: Array<{ id: string; kind: string; label: string; createdAt: string }>;
};
```

Rules:
- dashboard widgets must not leak tenant-sensitive identifiers.
- drilldown targets must respect platform capabilities.

## Telemetry Allowlist

Allowed:
- route family;
- admin scope: `org` or `platform`;
- entity kind;
- normalized state;
- action kind;
- capability outcome;
- safe counts;
- page number/per-page;
- safe filter presence booleans;
- retryable/terminal booleans;
- correlation id.

Forbidden:
- personal emails in telemetry;
- private tokens, headers, webhook secrets, payment data, signed URLs;
- raw provider payloads;
- message/document bodies;
- survey/review answers;
- user-entered free text from settings, reports, marketplace, team, favorites, or platform admin forms;
- tenant-sensitive identifiers unless explicitly approved for telemetry.

## Remaining Backend Decisions

P0:
- settings persistence endpoints and validation schemas per subsection;
- report result row/metric/dimension schema;
- billing org-commercial snapshot, subscription/SMS/card mutation envelopes, and failure taxonomy;
- team member/invite/recruiter visibility schemas and mutation policies;
- platform users list/detail/create/edit schemas, role assignment, and tenant assignment payloads;
- platform favorite-request queue/detail/action schemas;
- platform master data and company subscription admin schemas.

P1:
- org favorites/request payloads and terminal semantics;
- marketplace item/action schemas by list type;
- taxonomy mutation set and duplicate/conflict behavior;
- platform dashboard aggregate decision.

P2:
- shared admin table schema reuse across V4/V5;
- scheduled report delivery admin UX once Phase 4 delivery primitives are backend-confirmed.

## Acceptance Checklist

- [ ] settings schemas identify endpoint ownership, validation envelope, and downstream refresh behavior.
- [ ] report result schemas define metrics, dimensions, rows, filters, stale/partial policy, and export/schedule handoff.
- [ ] billing schemas keep org billing separate from platform subscription admin.
- [ ] team/favorites schemas keep org flows separate from platform `/users*` and `/favorites-request*`.
- [ ] marketplace schemas define per-type item/action payloads.
- [ ] platform users schemas define list/detail/create/edit, role assignment, tenant assignment, and conflict/stale behavior.
- [ ] platform favorite-request queue schemas define item/detail/action/audit trail fields.
- [ ] master data, company subscription admin, and taxonomy schemas define list/detail/mutation envelopes.
- [ ] telemetry allowlists exclude secrets, signed URLs, payment data, personal emails, raw payloads, and free text.
