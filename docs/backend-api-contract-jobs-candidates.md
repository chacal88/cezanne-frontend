# Backend/API Contract: Jobs and Candidates Aggregates and Mutations

## Purpose

This document is the Phase 3 contract draft for `backend-api-contract-change-plan.md`.

It converts the V1 Jobs and V2 Candidates backend/API backlog rows into a backend-facing contract proposal for aggregates, list queries, task/action mutations, upload/document handshakes, and parent-refresh semantics.

This document does not approve replacement for Jobs or Candidates. It does not infer backend payloads from visual evidence.

## Scope

In scope:
- Jobs list query/result contract;
- Jobs authoring draft serialization and save/resetWorkflow/publish adjacency;
- Job detail aggregate and section degradation;
- Job task overlays for bid, CV, schedule, offer, and reject;
- requisition/workflow handoff contracts consumed by Jobs;
- Candidate database query/result/search/facet/bulk contracts;
- Candidate detail aggregate, sequence context, and panel degradation;
- Candidate action mutations for schedule, offer, reject, move, hire/unhire, and review request;
- Candidate documents/CV/forms/contracts/surveys/custom-fields/collaboration contracts;
- shared mutation result, validation, stale/conflict, and parent-refresh envelopes.

Out of scope:
- provider setup implementation details, credentials, OAuth payloads, diagnostics logs, board mappings, HRIS mappings, ATS raw records, contract documents, survey answers, scoring rubrics, and signed URLs in telemetry/docs artifacts;
- public/token route contracts, except where parent-refresh/public-boundary separation must be preserved;
- visual replacement approval;
- backend implementation.

## Confirmed Current Frontend Evidence

Confirmed Jobs code evidence:
- `src/domains/jobs/support/adapters.ts` owns fixture-backed Jobs list, authoring draft normalization/serialization, job hub normalization, publishing readiness, and ATS status-only seams.
- `src/domains/jobs/support/implementation-closeout.ts` records unknown backend fields for Jobs list, authoring, detail, task overlays, and requisition handoff.
- `src/domains/jobs/task-overlays/job-task-context.ts` owns job task parent-return, direct-entry, submit outcomes, parent-refresh intent, scheduling readiness, and offer contract-signing state.
- `src/domains/jobs/support/publishing.ts` models job-board publish/unpublish states separately from draft persistence.

Confirmed Candidate code evidence:
- `src/domains/candidates/database/candidate-database-api.ts` fetches `/v2/cv` with `include`, `page`, `per_page`, `scope`, optional `search`, and optional `status`, then maps rows into frontend database rows.
- `src/domains/candidates/detail-hub/candidate-detail-api.ts` fetches a GraphQL candidate detail aggregate and candidate comments, then maps it into a `CandidateRecord`.
- `src/domains/candidates/support/store.ts` still owns fixture-backed candidate action completion and CV upload seams with correlation-aware request init, not production endpoint paths.
- `src/domains/candidates/action-launchers/candidate-action-context.ts` owns candidate task return targets, schedule readiness, offer contract-signing state, and reject/review-scoring readiness.
- `src/domains/candidates/support/product-depth.ts` defines candidate database, hub, sequence, action, summary, and safe telemetry states.

## Shared Operational Envelope

Jobs and Candidates endpoints should use structured envelopes:

```ts
type DomainEnvelope<TData = unknown> = {
  status: 'ok' | 'error';
  code: string;
  data?: TData;
  errors?: ValidationError[];
  retryable?: boolean;
  correlationId?: string;
  refresh?: ParentRefreshDirective;
};

type ValidationError = {
  path: string;
  code: string;
  message?: string;
};

type ParentRefreshDirective = {
  required: boolean;
  targets: Array<
    | 'jobs-list'
    | 'job-detail'
    | 'job-authoring'
    | 'candidate-database'
    | 'candidate-detail'
    | 'candidate-sequence'
    | 'candidate-documents'
    | 'candidate-collaboration'
    | 'reports-or-dashboard-summary'
  >;
  reason:
    | 'mutation-succeeded'
    | 'partial-mutation'
    | 'stale-parent'
    | 'provider-status-changed'
    | 'upload-metadata-saved'
    | 'workflow-state-changed';
};
```

Rules:
- `code` is the behavior key; UI must not parse display copy.
- mutation responses must say whether parent refresh is required.
- validation errors must remain route-local unless the mutation invalidates the parent entity.
- DTOs must pass through domain adapters before UI components consume them.

## Jobs List Contract

Current route-owned state:
- `scope`: `open`, `draft`, `archived`, `assigned`;
- `page`;
- `search`;
- `asAdmin`;
- `label`.

Target request:

```ts
type JobsListRequest = {
  scope: 'open' | 'draft' | 'archived' | 'assigned';
  page: number;
  perPage?: number;
  search?: string;
  asAdmin?: boolean;
  label?: string;
  sort?: string;
};
```

Target response:

```ts
type JobsListResponse = DomainEnvelope<{
  rows: JobListRowDto[];
  pageInfo: PageInfo;
  filters: {
    labels: Array<{ id: string; label: string; count?: number }>;
    scopes: Array<{ scope: JobsListRequest['scope']; count?: number }>;
  };
  sourceHealth?: SourceHealthDto;
}>;

type JobListRowDto = {
  jobId: string;
  title: string;
  status: 'draft' | 'active' | 'closed' | 'archived';
  label?: string;
  assignedRecruiter?: UserSummaryDto;
  candidateCount?: number;
  cvCount?: number;
  unreadActivityCount?: number;
  actionAvailability: JobRowActionAvailability;
  atsStatus?: AtsSourceStatusDto;
  updatedAt?: string;
};

type JobRowActionAvailability = {
  canViewDetail: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canClose: boolean;
  canReopen: boolean;
};
```

Target state codes:
- `ready`;
- `empty`;
- `filtered_empty`;
- `denied`;
- `stale_filters`;
- `degraded`;
- `unavailable`.

Open backend decisions:
- canonical endpoint name;
- pagination metadata shape;
- server-side label vocabulary;
- row action availability ownership;
- ATS source/status fields for list rows.

## Job Authoring Contract

Current frontend serialized draft:

```ts
type JobAuthoringSerializedDraft = {
  id?: string;
  name: string;
  isPublished: boolean;
  sectorCodes: string[];
  assignments: Array<{ userId: string }>;
  favoriteFlow: 'enabled' | 'disabled';
};
```

Target request:

```ts
type JobDraftMutationRequest = {
  mode: 'create' | 'edit' | 'copy';
  resetWorkflow?: boolean;
  sourceJobId?: string;
  draft: JobDraftDto;
  publishIntent?: JobPublishIntentDto;
};

type JobDraftDto = {
  jobId?: string;
  title: string;
  status?: 'draft' | 'active';
  sectorCodes: string[];
  assignmentUserIds: string[];
  favoritesEnabled: boolean;
  fields: Record<string, unknown>;
};
```

Target response:

```ts
type JobDraftMutationResponse = DomainEnvelope<{
  jobId: string;
  draftVersion: string;
  status: 'draft' | 'active' | 'closed' | 'archived';
  resetWorkflowImpact?: ResetWorkflowImpactDto;
  publishStatus?: JobBoardPublishingDto;
}>;
```

Required authoring codes:
- `saved`;
- `validation_failed`;
- `save_failed`;
- `conflict`;
- `stale_draft`;
- `reset_workflow_requires_confirmation`;
- `publish_blocked`;
- `partial_publish`;
- `unavailable`;
- `denied`.

Reset workflow impact shape:

```ts
type ResetWorkflowImpactDto = {
  affectedCandidates?: number;
  removedStages?: string[];
  requiredAcknowledgement: boolean;
  downstreamRefreshTargets: ParentRefreshDirective['targets'];
};
```

Rules:
- draft save remains separate from publishing readiness/result;
- job-board provider setup and diagnostics stay outside Jobs DTOs;
- server validation errors must be field-addressable.

## Job Detail Aggregate Contract

Current frontend view model expects:
- selected section;
- workflow state;
- assignments;
- share state;
- summaries for candidates/CVs/bids/interviews/forms-documents;
- transitions for close/reopen/publish;
- section-level degradation.

Target request:

```ts
type JobDetailRequest = {
  jobId: string;
  section?: 'overview' | 'candidates' | 'workflow' | 'activity';
};
```

Target response:

```ts
type JobDetailResponse = DomainEnvelope<{
  job: JobDetailDto;
  summaries: JobHubSummaryDto[];
  assignments: AssignmentDto[];
  shareState: 'private' | 'shared' | 'unavailable';
  transitions: Array<{ action: 'close' | 'reopen' | 'publish'; state: 'ready' | 'denied' | 'degraded'; reason?: string }>;
  degradedSections?: Array<'overview' | 'candidates' | 'workflow' | 'activity'>;
}>;
```

Required detail codes:
- `ready`;
- `partial_degraded`;
- `section_degraded`;
- `not_found`;
- `denied`;
- `stale`;
- `unavailable`.

Open backend decisions:
- aggregate endpoint path;
- candidate/CV/bid/interview summary fields;
- assignment/share permission envelope;
- activity schema;
- close/reopen transition response shape.

## Job Task Overlay Mutation Contract

Task kinds:
- bid create/view;
- CV create/view;
- schedule;
- offer;
- reject.

Target task request:

```ts
type JobTaskMutationRequest = {
  taskKind: 'bid-create' | 'bid-view' | 'cv-create' | 'cv-view' | 'schedule' | 'offer' | 'reject';
  jobId: string;
  cvId?: string;
  candidateId?: string;
  bidId?: string;
  payload: Record<string, unknown>;
  parentTarget: string;
  idempotencyKey?: string;
};
```

Target task response:

```ts
type JobTaskMutationResponse = DomainEnvelope<{
  taskKind: JobTaskMutationRequest['taskKind'];
  jobId: string;
  cvId?: string;
  candidateId?: string;
  resultState:
    | 'submitted'
    | 'succeeded'
    | 'failed'
    | 'retryable'
    | 'cancelled'
    | 'parent_refresh_required'
    | 'provider_blocked'
    | 'degraded'
    | 'unavailable';
  updatedEntities?: Array<{ type: 'job' | 'candidate' | 'cv' | 'bid' | 'interview' | 'offer'; id: string }>;
}>;
```

Rules:
- every task response must include `refresh.required`;
- direct notification entry source markers must be safe and optional;
- schedule consumes calendar readiness/slot contracts but does not expose provider setup internals;
- offer consumes contract-signing readiness/status but does not expose contract document bodies or signer payloads;
- reject consumes reject reason catalog/validation but remains parent-return local.

## Requisition Handoff Contract

Jobs consumes requisition/workflow handoff state but does not own provider setup or Settings workflow administration.

Target response:

```ts
type RequisitionHandoffDto = {
  available: boolean;
  routeTarget?: string;
  workflowUuid?: string;
  stageUuid?: string;
  hrisState?: HrisReadinessSummaryDto;
  workflowDrift?: WorkflowDriftDto;
};
```

Required codes:
- `ready`;
- `mapping_required`;
- `mapping_drift`;
- `sync_pending`;
- `sync_degraded`;
- `sync_failed`;
- `workflow_drift`;
- `stale_workflow`;
- `unavailable`.

Rules:
- HRIS mapping details and provider diagnostics stay outside Jobs;
- workflow drift and HRIS mapping drift remain distinct.

## Candidate Database Contract

Confirmed current REST source:
- `GET /v2/cv`;
- query params: `include`, `page`, `per_page`, `scope`, optional `search`, optional `status`;
- current include: `job,job.subsector,job.subsector.sector`;
- current scope: `withScore,filterByTags`.

Current mapped row fields:
- `id`, `numericId`, `cvId`, `jobId`, `statusId`, `status`;
- `name`, `email`, `location`, `stage`, `tags`, `source`;
- `createdAt`, `score`;
- `canSchedule`, `canOffer`.

Target request:

```ts
type CandidateDatabaseRequest = {
  page: number;
  perPage: number;
  query?: string;
  status?: string;
  tags?: string[];
  savedListId?: string;
  savedFilterId?: string;
  sort?: string;
  advancedQuery?: CandidateAdvancedQueryDto;
};
```

Target response:

```ts
type CandidateDatabaseResponse = DomainEnvelope<{
  rows: CandidateDatabaseRowDto[];
  pageInfo: PageInfo;
  facets?: CandidateDatabaseFacetsDto;
  savedFilters?: SavedFilterDto[];
  savedLists?: SavedListDto[];
  sourceHealth?: SourceHealthDto;
}>;

type CandidateDatabaseRowDto = {
  candidateId: string;
  numericId?: number;
  cvId: string;
  jobId?: string;
  statusId?: string;
  status?: string;
  name: string;
  email?: string;
  location?: string;
  stage?: string;
  tags: string[];
  source?: string;
  createdAt?: string;
  score?: number;
  actionAvailability: {
    canViewDetail: boolean;
    canSchedule: boolean;
    canOffer: boolean;
    canReject?: boolean;
    canBulkSelect?: boolean;
  };
  atsStatus?: AtsSourceStatusDto;
};
```

Required database codes:
- `ready`;
- `empty`;
- `denied`;
- `stale`;
- `degraded`;
- `retryable_failure`;
- `unavailable`;
- `invalid_query`;
- `unsupported_query`.

Open backend decisions:
- whether `/v2/cv` remains the production source;
- final row schema and column ownership;
- facets/saved filters/saved lists;
- advanced query DSL;
- bulk mutation schemas;
- ATS duplicate/import/sync metadata.

## Candidate Detail Aggregate Contract

Confirmed current GraphQL source:
- query `CandidateDetail($candidateUuid: String!)`;
- reads candidate, hiring flow step, location, file, tags, job, forms, documents, interview forms, and candidate comments.

Current mapped `CandidateRecord` fields:
- identity/profile: `id`, `cvId`, `name`, `stage`, `headline`, `email`, `phone`, `location`;
- collaboration: `comments`, `tags`, `conversationId`;
- panels: forms, documents, contracts, interviews, surveys, custom fields;
- CV/document paths: `previewPath`, `downloadPath`;
- `updatedAt`.

Target request:

```ts
type CandidateDetailRequest = {
  candidateId: string;
  jobId?: string;
  status?: string;
  order?: string;
  filters?: string;
  interview?: string;
  entryMode: 'direct' | 'job' | 'notification' | 'database';
};
```

Target response:

```ts
type CandidateDetailResponse = DomainEnvelope<{
  candidate: CandidateDetailDto;
  jobContext?: CandidateJobContextDto;
  sequence?: CandidateSequenceDto;
  panels: CandidatePanelDto;
  actionAvailability: CandidateActionAvailabilityDto;
  degradedSections?: Array<'documents' | 'contracts' | 'surveys' | 'custom-fields' | 'collaboration' | 'feedback'>;
  atsStatus?: AtsSourceStatusDto;
}>;
```

Required detail codes:
- `ready`;
- `partial_degraded`;
- `denied`;
- `not_found`;
- `stale_context`;
- `unavailable`;
- `mobile_unsupported` if mobile scope is explicitly denied.

Sequence contract:

```ts
type CandidateSequenceDto = {
  state: 'available' | 'stale' | 'unavailable';
  previousCandidateId?: string;
  nextCandidateId?: string;
  orderingVersion?: string;
  returnTarget?: string;
};
```

Rules:
- database-origin detail must preserve sanitized `returnTo`;
- stale sequence degrades navigation instead of redirecting to unrelated routes;
- panel failures must be partial and typed.

## Candidate Action Mutation Contract

Action kinds:
- schedule;
- offer;
- reject;
- move;
- hire;
- unhire;
- review-request.

Target request:

```ts
type CandidateActionMutationRequest = {
  action:
    | 'schedule'
    | 'offer'
    | 'reject'
    | 'move'
    | 'hire'
    | 'unhire'
    | 'review_request';
  candidateId: string;
  cvId?: string;
  jobId?: string;
  payload: Record<string, unknown>;
  parentTarget: string;
  idempotencyKey?: string;
};
```

Target response:

```ts
type CandidateActionMutationResponse = DomainEnvelope<{
  action: CandidateActionMutationRequest['action'];
  candidateId: string;
  cvId?: string;
  jobId?: string;
  resultState:
    | 'succeeded'
    | 'failed'
    | 'retryable'
    | 'cancelled'
    | 'terminal'
    | 'parent_refresh_required'
    | 'provider_blocked'
    | 'degraded'
    | 'unavailable';
  updatedEntities?: Array<{ type: 'candidate' | 'cv' | 'job' | 'interview' | 'offer' | 'review' | 'contract'; id: string }>;
}>;
```

Action-specific required contracts:
- schedule: slot/conflict/submit payload, provider-blocked state, calendar readiness, parent-refresh;
- offer: offer payload, contract/signing status, signer handoff boundary, parent-refresh;
- reject: reject reason catalog, template/message validation, terminal/read-only behavior;
- move: job/stage search/select payload, conflict/stale workflow behavior;
- hire/unhire: state transition response and audit-safe terminal states;
- review-request: reviewer/schema/template readiness and submitted/read-only terminal state.

## Candidate Documents, Upload, Forms, Contracts, Surveys, Custom Fields

Target upload phases:

```ts
type CandidateUploadHandshakeResponse = DomainEnvelope<{
  uploadId: string;
  uploadUrl: string;
  method: 'PUT' | 'POST';
  headers?: Record<string, string>;
  expiresAt: string;
  maxBytes?: number;
  acceptedMimeTypes?: string[];
}>;

type CandidateUploadMetadataRequest = {
  uploadId: string;
  candidateId: string;
  cvId?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  documentType: 'cv' | 'form' | 'document' | 'contract_attachment';
};

type CandidateUploadMetadataResponse = DomainEnvelope<{
  document: CandidateDocumentDto;
  refresh: ParentRefreshDirective;
}>;
```

Upload rules:
- signed URLs stay out of telemetry, screenshots, and docs artifacts;
- handshake, binary transfer, metadata persistence, retry, and success/failure are distinct phases;
- metadata persistence success must refresh candidate documents and candidate detail panels.

Panel DTOs required:
- `CandidateDocumentDto`;
- `CandidateFormDto`;
- `CandidateContractDto`;
- `CandidateSurveyDto`;
- `CandidateCustomFieldDto`;
- `CandidateCommentDto`;
- `CandidateTagDto`.

Rules:
- contract document metadata is distinct from downstream signing status;
- survey answers and scoring rubrics must not be included in telemetry;
- comments/message bodies follow the Notifications/inbox body-safety rules;
- tags/custom fields must expose validation and unauthorized states separately.

## Shared Primitive DTOs

```ts
type PageInfo = {
  page?: number;
  perPage?: number;
  total?: number;
  from?: number;
  to?: number;
  cursor?: string;
  nextCursor?: string;
  hasNextPage?: boolean;
};

type UserSummaryDto = {
  userId: string;
  displayName: string;
};

type SourceHealthDto = {
  state: 'ready' | 'degraded' | 'stale' | 'unavailable';
  reason?: string;
  refreshedAt?: string;
};

type AtsSourceStatusDto = {
  state:
    | 'source-linked'
    | 'source-unlinked'
    | 'duplicate-detected'
    | 'duplicate-merged'
    | 'sync-pending'
    | 'sync-failed'
    | 'stale-source'
    | 'provider-blocked'
    | 'degraded'
    | 'unavailable'
    | 'unimplemented';
  providerFamily?: 'ats' | 'unknown';
  safeProviderLabel?: string;
  refreshIntent?: 'refresh-source' | 'retry-sync' | 'none';
};
```

## Telemetry and Security Rules

Required event families:
- `jobs_list_viewed`;
- `jobs_filter_changed`;
- `job_authoring_opened`;
- `job_authoring_saved`;
- `job_authoring_failed`;
- `job_detail_viewed`;
- `taskflow_opened`;
- `taskflow_submitted`;
- `taskflow_succeeded`;
- `taskflow_failed`;
- `candidate_detail_viewed`;
- `candidate_sequence_next`;
- `candidate_sequence_previous`;
- `candidate_action_opened`;
- `candidate_action_succeeded`;
- `candidate_action_failed`;
- `candidate_cv_uploaded`;
- `calendar_scheduling_action`;
- `job_board_publishing_action`;
- `hris_requisition_sync_action`;
- `contract_signing_action` if enabled by the contract-signing slice;
- `provider_readiness_gate_evaluated` for normalized provider readiness gates.

Allowed telemetry fields:
- route family;
- action/task kind;
- normalized state code;
- safe entity ids when already part of route context;
- provider family;
- readiness outcome;
- parent-refresh required flag;
- correlation id.

Forbidden telemetry fields:
- raw provider setup values;
- credentials, OAuth secrets, private tokens, webhook secrets;
- signed URLs;
- raw diagnostics logs;
- HRIS mappings;
- ATS raw records;
- message bodies;
- contract documents;
- survey answers;
- scoring rubrics;
- CV/document bodies;
- public route tokens.

## Remaining Blockers

P0 backend blockers:
- Jobs list endpoint and row/action/pagination schema;
- Jobs create/update/copy/resetWorkflow endpoints and validation envelope;
- Job task mutation endpoints for bid/CV/schedule/offer/reject;
- Candidate database production source decision and row/facet/bulk/search schemas;
- Candidate detail aggregate, sequence API, and panel degradation taxonomy;
- Candidate action mutation endpoints and parent-refresh semantics;
- Candidate document upload handshake, transfer, metadata persistence, and retry/success contracts.

P1 schema blockers:
- Job detail section payloads and activity schema;
- requisition workflow aggregate/handoff payloads;
- candidate forms/documents/contracts/surveys/custom-field panel schemas;
- comments/tags/collaboration mutation payloads;
- ATS duplicate/import/sync status fields.

P2 provider/transport blockers:
- calendar slot/conflict/submit contract;
- job-board publish/unpublish result contract;
- contract-signing status/signer handoff contract;
- HRIS mapping/readiness summary;
- ATS source/import/sync readiness summary.

P3 replacement blockers:
- visual/parity evidence remains required for Jobs and Candidates route families before replacement approval.

