# Backend/API Contract: Provider Readiness And File Transfer

## Purpose

This document records the Phase 4 backend-facing contract draft for provider setup/readiness, public/token integration callbacks, upload/download primitives, payment-provider boundaries, and report export delivery.

It converts the current frontend seams into backend/API questions without approving replacement of any route family. Confirmed facts come from `src/` and `docs/`; DTOs below are proposed target contracts unless marked as current.

## Confirmed Frontend Evidence

Current source-backed evidence:
- Authenticated provider setup lives in `src/domains/integrations/support/admin-state.ts` and `provider-setup-workflow.ts`.
- Authenticated provider setup routes are `/integrations` and `/integrations/:providerId`; public/token callback routes remain `/integration/cv/:token/:action?`, `/integration/forms/:token`, and `/integration/job/:token/:action?`.
- Current provider families are `calendar`, `ats`, `job-board`, `hris`, `assessment`, and `custom`.
- Current provider states are `connected`, `disconnected`, `blocked`, `degraded`, `reauth_required`, and `unavailable`.
- Current provider setup sections are `configuration`, `auth`, and `diagnostics`.
- Current readiness families are `scheduling`, `publishing`, `sync-workflow`, `ats-sync-import`, and `assessment-review-scoring`.
- Operational readiness gates are consumed by scheduling, publishing, HRIS/requisition, ATS import/sync, assessment review/scoring, messaging, and contract signing plans.
- Public application upload state is modeled in `src/domains/public-external/support/models.ts` with failure stages `validation`, `upload-handshake`, `binary-transfer`, `metadata-persistence`, and `submission`.
- Integration forms token entry uses `upload-handshake`, `binary-transfer`, and `submission` failure stages in `src/domains/integrations/support/models.ts`.
- Requisition forms download uses token-state, already-downloaded, unavailable, not-found, retryable download failure, and completed states in `src/domains/public-external/requisition-approval/support/forms-download.ts`.
- Reports model export/schedule commands and stale/partial blocking in `src/domains/reports/support/report-state.ts`, but result schema, row dimensions, metric definitions, export payload, schedule payload, and delivery/download lifecycle are unknown.
- Billing models card/provider-challenge, pending, success, failure, retry, card-blocked, stale, degraded, denied, and unavailable states in `src/domains/billing/support/billing-state.ts`; payment tokenization and provider challenge payloads remain unknown.
- Contract signing models template/document prerequisites, provider-blocked, send/retry/status refresh, downstream handoff, terminal outcomes, and parent refresh in `src/domains/contracts/signing/contract-signing.ts`.
- Calendar scheduling models safe slot DTOs, provider-blocked/degraded/unavailable gates, conflict, submit failure, submitted parent refresh, and safe telemetry in `src/domains/scheduling/support/calendar-scheduling.ts`.

Existing docs evidence:
- `provider-specific-integrations-depth-plan.md` keeps authenticated provider setup under `/integrations/:providerId` and keeps public/token `/integration/*` callbacks separate.
- `provider-readiness-operational-gates-plan.md` defines normalized readiness signals and forbids operational consumers from reading credentials, OAuth payloads, diagnostics logs, private tokens, signed URLs, tenant-sensitive identifiers, and provider callback payloads.
- `integration-operational-depth-sequence-plan.md` records the completed operational-depth sequence that consumes provider readiness without moving ownership out of the integrations domain.
- `backend-api-contract-jobs-candidates.md` already records candidate/job action aggregates that consume scheduling, document upload, and contract-signing primitives.

## Scope Boundary

In scope:
- normalized provider setup/readiness DTOs;
- provider configuration/auth/diagnostics mutation envelopes;
- operational readiness handoff DTOs for downstream routes;
- public/token integration callback lifecycle and family mismatch outcomes;
- file upload handshake, binary transfer, metadata persistence, retry, and terminal contracts;
- tokenized download lifecycle for requisition forms and similar document bundles;
- report export/schedule delivery lifecycle;
- payment tokenization/challenge/card persistence boundaries where provider-hosted UI is involved;
- telemetry allowlists and forbidden fields.

Out of scope:
- V4/V5 admin table schemas, which are Phase 5;
- backend implementation;
- raw provider SDK payloads;
- provider-specific credential field names unless backend publishes a safe config schema;
- replacement approval or pixel parity.

## Shared Envelopes

### ContractEnvelope

Every operation should return a domain envelope, even when the transport is provider-backed:

```ts
type ContractEnvelope<T> = {
  data: T | null;
  status: 'ok' | 'validation_error' | 'denied' | 'not_found' | 'stale' | 'conflict' | 'degraded' | 'unavailable' | 'provider_blocked' | 'terminal' | 'error';
  correlationId: string;
  warnings?: SafeWarningDto[];
  errors?: ContractErrorDto[];
};
```

### ContractErrorDto

```ts
type ContractErrorDto = {
  code: string;
  messageKey: string;
  field?: string;
  retryable: boolean;
  terminal?: boolean;
};
```

Rules:
- UI copy is resolved from `messageKey`; raw provider messages are not rendered directly.
- `correlationId` must match or propagate the request `x-correlation-id`.
- Provider secrets, signed URLs, raw logs, raw callbacks, tokens, message/document bodies, payment PAN/CVC, and webhook/private token values are never included.

## Authenticated Provider Setup

Transport decision:
- Proposed REST or GraphQL under backend/integrations ownership.
- Frontend adapter owner: `integrations.provider-index` and `integrations.provider-detail`.

### Provider Index Request

```ts
type ProviderIndexRequest = {
  organizationId?: string;
  families?: ProviderFamily[];
  includeReadiness?: boolean;
};

type ProviderFamily = 'calendar' | 'ats' | 'job_board' | 'hris' | 'assessment' | 'messaging' | 'contract_signing' | 'payment' | 'reporting' | 'custom';
```

### Provider Summary Response

```ts
type ProviderSummaryDto = {
  id: string;
  name: string;
  family: ProviderFamily;
  state: 'connected' | 'disconnected' | 'blocked' | 'degraded' | 'reauth_required' | 'unavailable';
  actionAvailability: ProviderActionAvailabilityDto;
  readinessSignals?: ProviderReadinessSignalDto[];
};

type ProviderActionAvailabilityDto = {
  canConfigure: boolean;
  canConnect: boolean;
  canReauthorize: boolean;
  canRunDiagnostics: boolean;
  canViewSafeLogs: boolean;
  blockedReasons: string[];
};
```

Mapping rule:
- frontend may continue using `job-board` internally, but backend DTO should choose one spelling. Proposed API spelling is `job_board`; the adapter maps to the current view model.

### Provider Detail Response

```ts
type ProviderDetailDto = ProviderSummaryDto & {
  parentTarget: '/integrations';
  sections: ProviderSetupSectionDto[];
  lastUpdatedAt?: string;
};

type ProviderSetupSectionDto = {
  id: 'configuration' | 'auth' | 'diagnostics';
  state:
    | 'loading'
    | 'ready'
    | 'validation_error'
    | 'saving'
    | 'saved'
    | 'save_error'
    | 'connect'
    | 'reauthorize'
    | 'auth_pending'
    | 'auth_failed'
    | 'connected'
    | 'disconnected'
    | 'degraded'
    | 'idle'
    | 'running'
    | 'passed'
    | 'failed'
    | 'logs_ready'
    | 'retry'
    | 'unavailable'
    | 'unimplemented';
  titleKey: string;
  descriptionKey: string;
  fields: ProviderConfigFieldDto[];
  actions: ProviderSetupActionDto[];
};

type ProviderConfigFieldDto = {
  id: string;
  labelKey: string;
  valueKind: 'display' | 'boolean' | 'select' | 'masked_secret' | 'status';
  value?: string | boolean;
  required: boolean;
  secret: boolean;
  validation?: ValidationRuleDto[];
};

type ProviderSetupActionDto = {
  id: 'configure' | 'connect' | 'reauthorize' | 'run_diagnostics' | 'view_logs';
  concern: 'configuration' | 'auth' | 'diagnostics';
  state: 'available' | 'blocked' | 'pending';
  reason?: string;
};
```

Open decision:
- backend must decide whether configuration fields are dynamic per provider or fixed per provider family. The frontend contract supports dynamic safe fields, but any `secret: true` field must be write-only or masked.

## Provider Mutations

### Save Configuration

```ts
type SaveProviderConfigurationRequest = {
  providerId: string;
  sectionVersion?: string;
  fields: Array<{
    id: string;
    value: string | boolean | number | null;
  }>;
};

type SaveProviderConfigurationResponse = {
  provider: ProviderDetailDto;
  refreshReadiness: boolean;
};
```

Failure states:
- `validation_error`: field-level errors are safe and displayable.
- `conflict` or `stale`: user must refresh provider detail before retrying.
- `unimplemented`: custom provider or unsupported family remains visible but not configurable.
- `unavailable`: setup service is unavailable.

### Start Auth

```ts
type StartProviderAuthRequest = {
  providerId: string;
  action: 'connect' | 'reauthorize';
  returnTarget: `/integrations/${string}`;
};

type StartProviderAuthResponse = {
  state: 'auth_pending' | 'auth_failed' | 'connected' | 'reauth_required';
  redirect?: {
    kind: 'same_window' | 'popup' | 'provider_hosted';
    url: string;
    expiresAt: string;
  };
  provider: ProviderDetailDto;
};
```

Safety:
- OAuth authorization URLs are allowed only as immediate navigation targets in runtime memory.
- OAuth codes, callback payloads, refresh tokens, access tokens, and provider account identifiers are forbidden from telemetry/docs artifacts.

### Diagnostics

```ts
type RunProviderDiagnosticsRequest = {
  providerId: string;
  requestedChecks?: string[];
};

type ProviderDiagnosticsSummaryDto = {
  state: 'running' | 'passed' | 'failed' | 'logs_ready' | 'degraded' | 'unavailable' | 'retry';
  checks: Array<{
    id: string;
    state: 'passed' | 'failed' | 'warning' | 'skipped';
    severity: 'info' | 'warning' | 'critical';
    messageKey: string;
    remediationKey?: string;
  }>;
  safeLogExcerptAvailable: boolean;
  rawLogAvailableToFrontend: false;
};
```

Rules:
- diagnostics logs visible to the frontend must be safe summaries, not raw provider logs.
- `view_logs` may display summarized check history only.

## Readiness Handoff

Frontend consumers must receive normalized readiness outputs. They must not inspect provider setup fields.

```ts
type ProviderReadinessSignalDto = {
  family:
    | 'scheduling'
    | 'publishing'
    | 'sync_workflow'
    | 'ats_sync_import'
    | 'assessment_review_scoring'
    | 'messaging_delivery'
    | 'contract_signing'
    | 'payment'
    | 'report_delivery';
  providerFamily: ProviderFamily;
  outcome: 'ready' | 'blocked' | 'degraded' | 'unavailable' | 'unimplemented';
  reasonKey: string;
  setupTarget?: {
    providerId: string;
    path: `/integrations/${string}`;
    labelKey: string;
  };
  evaluatedAt: string;
  ttlSeconds?: number;
};
```

Consumer mapping:

| Readiness family | Current consumers | Contract implication |
|---|---|---|
| `scheduling` | job/candidate scheduling | slots and submit mutations may run only when `ready`; conflict remains scheduling-owned. |
| `publishing` | job authoring, job listings settings | publish mutations must return partial/failure provider outcomes separately from draft save. |
| `sync_workflow` | requisition authoring/workflow | HRIS auth/mapping drift is separate from workflow/stage drift. |
| `ats_sync_import` | candidate database/source status | source freshness, import status, duplicate handling, and stale refresh use safe source metadata. |
| `assessment_review_scoring` | surveys/reviews/scoring | schema/template/callback readiness stays separate from answer/scoring payload. |
| `messaging_delivery` | inbox/external chat | provider blocked/degraded delivery is route-local and does not expose provider internals. |
| `contract_signing` | candidate/job offer/contract flows | signer launch/status refresh uses contract state, not provider credentials. |
| `payment` | billing card/upgrade/SMS | provider challenge and tokenization state stay payment-boundary owned. |
| `report_delivery` | report export/schedule | export file readiness and scheduled delivery are lifecycle states, not direct storage details. |

## Public/Token Integration Callbacks

Authenticated provider setup and public/token callbacks remain separate.

Route families:
- `/integration/cv/:token/:action?`
- `/integration/forms/:token`
- `/integration/job/:token/:action?`

### Token Bootstrap

```ts
type IntegrationTokenBootstrapRequest = {
  family: 'integration_cv' | 'integration_forms' | 'integration_job';
  token: string;
  action?: string;
};

type IntegrationTokenBootstrapDto = {
  family: 'integration_cv' | 'integration_forms' | 'integration_job';
  tokenState: 'valid' | 'invalid' | 'expired' | 'used' | 'inaccessible';
  readiness: 'ready' | 'token_state' | 'unavailable' | 'completed' | 'recoverable_error';
  canProceed: boolean;
  completionState: 'actionable' | 'terminal';
  submissionReadiness: 'ready' | 'missing_context' | 'not_applicable';
  familyMatch: 'matched' | 'mismatch';
  reasonKey?: string;
  context?: IntegrationTokenContextDto;
};

type IntegrationTokenContextDto = {
  candidateDisplayName?: string;
  jobTitle?: string;
  companyName?: string;
  workflowType: 'cv_action' | 'forms_documents' | 'job_presentation';
  schemaVersion?: string;
  requestedDocuments?: RequestedDocumentDto[];
};
```

Family mismatch:
- must return `familyMatch: 'mismatch'`, `canProceed: false`, and a safe `reasonKey`;
- must not redirect into another public/token family automatically;
- must not bootstrap authenticated shell state.

### CV Action Submission

```ts
type IntegrationCvActionRequest = {
  token: string;
  action: 'interview_confirmation' | 'offer_response';
  selection: 'slot_1' | 'slot_2' | 'unavailable' | 'accept' | 'reject';
  reason?: string;
};

type IntegrationCvActionResponse = {
  completion:
    | 'integration_cv_interview_confirmed'
    | 'integration_cv_unavailable_confirmed'
    | 'integration_cv_offer_accepted'
    | 'integration_cv_offer_rejected';
  tokenState: 'used';
};
```

### Forms/Documents Submission

Uses the shared upload contract below. Metadata persistence is a distinct phase from binary transfer.

## Upload Primitive

The same primitive should support:
- candidate CV/document uploads;
- public application CV uploads;
- integration requested forms/documents;
- contract document handoff when backend-generated documents are not enough;
- settings forms/docs template uploads, if later approved in Phase 5.

### Upload Handshake

```ts
type UploadHandshakeRequest = {
  owner:
    | 'candidate_document'
    | 'public_application'
    | 'integration_forms'
    | 'requisition_forms'
    | 'contract_document'
    | 'settings_template';
  parentId?: string;
  token?: string;
  file: {
    name: string;
    size: number;
    mimeType: string;
    checksum?: string;
  };
  purpose: string;
};

type UploadHandshakeResponse = {
  uploadId: string;
  transfer: {
    method: 'PUT' | 'POST';
    url: string;
    headers: Record<string, string>;
    expiresAt: string;
    maxBytes: number;
  };
  metadata: UploadMetadataDraftDto;
};

type UploadMetadataDraftDto = {
  uploadId: string;
  displayName: string;
  purpose: string;
  owner: UploadHandshakeRequest['owner'];
  parentId?: string;
  tokenScoped: boolean;
};
```

Rules:
- `transfer.url` and transfer headers are runtime-only and forbidden from telemetry/docs artifacts.
- frontend may log only owner, file extension family, size bucket, stage, result, and correlation id.
- backend must define size/mime validation and virus-scan/policy outcomes.

### Upload Lifecycle

```ts
type UploadLifecycleState =
  | 'handshake_pending'
  | 'handshake_failed'
  | 'transfer_pending'
  | 'transfer_failed'
  | 'metadata_pending'
  | 'metadata_failed'
  | 'scan_pending'
  | 'completed'
  | 'terminal';

type PersistUploadMetadataRequest = {
  uploadId: string;
  owner: UploadHandshakeRequest['owner'];
  parentId?: string;
  token?: string;
  formStepId?: string;
  displayName?: string;
};

type UploadResultDto = {
  uploadId: string;
  state: UploadLifecycleState;
  retryable: boolean;
  terminalReason?: 'token_used' | 'token_expired' | 'policy_rejected' | 'scan_failed' | 'parent_closed';
  safeFile: {
    name: string;
    size: number;
    mimeType: string;
  };
};
```

Current frontend stages map as:
- `upload-handshake` -> `handshake_failed`;
- `binary-transfer` -> `transfer_failed`;
- `metadata-persistence` -> `metadata_failed`;
- `submission` -> owning workflow mutation failure.

Open decisions:
- progress transport: browser direct upload progress vs backend-reported status polling;
- whether virus scan completion is blocking or post-submit degraded status;
- whether token-scoped uploads consume the token at metadata persistence or final submission.

## Download Primitive

The same primitive should support:
- requisition forms tokenized download;
- report export download;
- contract/downloadable document retrieval;
- later admin/template downloads.

### Download Bootstrap

```ts
type DownloadBootstrapRequest = {
  owner: 'requisition_forms' | 'report_export' | 'contract_document' | 'candidate_document' | 'settings_template';
  documentId?: string;
  exportId?: string;
  token?: string;
  mode: 'view' | 'download';
};

type DownloadBootstrapDto = {
  readiness: 'ready' | 'token_state' | 'unavailable' | 'already_downloaded' | 'not_found' | 'download_failed' | 'downloaded';
  tokenState?: 'valid' | 'invalid' | 'expired' | 'used' | 'inaccessible';
  canView: boolean;
  canDownload: boolean;
  fileName?: string;
  documentCount?: number;
  retryable: boolean;
  reasonKey?: string;
};
```

### Start Download

```ts
type StartDownloadResponse = {
  downloadId: string;
  transfer?: {
    method: 'GET';
    url: string;
    headers?: Record<string, string>;
    expiresAt: string;
  };
  lifecycle: 'started' | 'completed' | 'failed' | 'already_downloaded' | 'terminal';
};
```

Rules:
- signed download URLs are runtime-only and forbidden from telemetry/docs artifacts.
- tokenized downloads must define whether `downloaded` consumes a token after first successful transfer or after first bootstrap.
- already-downloaded behavior must be explicit for requisition forms.

## Report Export And Schedule Delivery

Report result schemas are Phase 5/admin-adjacent, but export/download primitives are Phase 4.

```ts
type ReportExportRequest = {
  family: 'jobs' | 'hiring_process' | 'teams' | 'candidates' | 'diversity' | 'source';
  filters: Record<string, unknown>;
  format: 'csv' | 'xlsx' | 'pdf';
  resultVersion?: string;
};

type ReportExportLifecycleDto = {
  exportId: string;
  state: 'queued' | 'running' | 'ready' | 'failed' | 'expired' | 'blocked_stale_result' | 'blocked_partial_result';
  download?: DownloadBootstrapDto;
  retryable: boolean;
};

type ReportScheduleRequest = {
  family: ReportExportRequest['family'];
  filters: Record<string, unknown>;
  format: ReportExportRequest['format'];
  cadence: 'daily' | 'weekly' | 'monthly';
  deliveryTarget: 'email' | 'inbox';
};
```

Rules:
- stale or partial report results block export/schedule until refreshed unless backend explicitly supports partial exports.
- delivery target details must avoid exposing private email bodies or provider internals in telemetry.

## Payment Provider Boundary

Billing schemas are Phase 5, but payment-provider primitives must be settled first.

```ts
type PaymentTokenizationRequest = {
  cardId?: string;
  role: 'primary' | 'backup' | 'new';
  returnTarget: '/billing' | '/billing/upgrade' | `/billing/card/${string}`;
};

type PaymentTokenizationDto = {
  tokenizationId: string;
  state: 'ready' | 'pending' | 'provider_challenge' | 'saved' | 'failed' | 'retry' | 'unavailable';
  providerHosted?: {
    kind: 'iframe' | 'redirect' | 'popup';
    url: string;
    expiresAt: string;
  };
  refreshIntent: 'none' | 'refresh_subscription' | 'retry_mutation' | 'return_to_parent' | 'provider_challenge' | 'contact_support';
};
```

Rules:
- PAN, CVC, raw payment provider payloads, challenge payloads, and tokenization secrets must never pass through app telemetry or docs.
- frontend can receive provider-hosted UI launch metadata, safe card state, and refresh intent only.
- subscription/SMS/card mutations in Phase 5 consume these states instead of embedding payment-provider fields in admin schemas.

## Contract Signing Boundary

Contract signing consumes provider readiness and file/download primitives but owns its own state.

Required backend contract:
- template readiness;
- document readiness;
- provider readiness;
- send result;
- downstream signer handoff;
- status refresh;
- terminal outcomes: `signed`, `declined`, `expired`, `voided`;
- parent refresh intent for candidate/job contexts.

Forbidden:
- signer private URLs in telemetry;
- document bodies;
- raw provider webhooks;
- provider account identifiers.

## Telemetry Allowlist

Allowed fields:
- route family;
- provider family;
- normalized provider/readiness state;
- action id;
- safe diagnostics check id and severity;
- workflow owner;
- upload/download stage;
- file size bucket and safe extension family;
- retryable/terminal boolean;
- result state;
- correlation id.

Forbidden fields:
- signed upload/download URLs;
- OAuth codes, access tokens, refresh tokens, private tokens, webhook secrets, credentials;
- raw diagnostics logs;
- raw provider callback payloads;
- payment PAN/CVC/tokenization secrets/challenge payloads;
- document bodies or message bodies;
- survey/review answers or scoring rubrics;
- tenant-sensitive identifiers not already approved for telemetry;
- user-entered free text from provider config, application forms, messages, reports, or diagnostics.

## Adapter Rules

- Raw provider/API DTOs must be mapped inside domain adapters before reaching route components.
- Authenticated provider setup state is not shared with public/token callbacks.
- Public/token operations must not set authenticated shell/session state.
- Operational consumers receive `ProviderReadinessSignalDto` and action availability only.
- Upload/download transfer URLs are used immediately and discarded.
- Mutation responses must declare refresh intent and parent target where the route returns to a parent context.

## Remaining Backend Decisions

P0:
- provider index/detail transport, endpoint ownership, and canonical provider-family spelling;
- provider configuration schema strategy: dynamic safe fields vs family-specific fixed schemas;
- auth start/callback envelope for authenticated provider setup;
- diagnostics summary schema and safe log policy;
- readiness TTL and invalidation semantics;
- upload handshake, transfer, metadata persistence, scan, and token consumption policy;
- download token consumption and already-downloaded semantics;
- payment tokenization and challenge launch/return contract.

P1:
- report export lifecycle, download ownership, and partial/stale export policy;
- provider-specific readiness fields for messaging, contract signing, reporting, and payment if they become first-class provider families;
- contract-signing downstream signer return semantics.

P2:
- progress reporting transport for large uploads/downloads;
- custom provider lifecycle, if custom providers become configurable rather than unavailable/unimplemented.

## Acceptance Checklist

- [ ] backend publishes provider index/detail DTOs and mutation envelopes.
- [ ] backend publishes normalized readiness signal DTOs for all operational consumers.
- [ ] upload handshake and metadata persistence contracts are confirmed.
- [ ] download lifecycle and already-downloaded semantics are confirmed.
- [ ] public/token integration family mismatch and terminal token behavior are confirmed.
- [ ] payment tokenization/challenge runtime-only fields are isolated from telemetry.
- [ ] report export/download lifecycle is explicit before V4 report schema work proceeds.
- [ ] all signed URLs, secrets, raw logs, raw callback payloads, document bodies, payment data, and user free text remain out of telemetry/docs artifacts.
