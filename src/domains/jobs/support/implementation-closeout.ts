export type JobsCloseoutPrerequisiteSpec = {
  capability: string;
  currentSpecPath: string;
  archivedChangePaths: string[];
};

export type JobsCloseoutBackendContract = {
  routeFamily: 'jobs-list' | 'job-authoring' | 'job-detail' | 'job-task' | 'requisition-handoff';
  confirmedBoundary: string;
  unknownFields: string[];
};

export const jobsDocsToCodeGaps = [
  'Jobs list previously rendered a single example detail link instead of list-owned records, empty, stale, unavailable, and denied states.',
  'Job authoring previously exposed a serialized payload preview instead of route-owned save, validation, retry, and publishing-readiness states.',
  'Job detail previously rendered only summary fields and task links instead of section-level degradation and assignment/share/status-transition state.',
  'Job task routes previously exposed close/complete links without submit, failed, retry, success, direct-entry, and parent-refresh intent states.',
] as const;

export const jobsCloseoutPrerequisiteSpecs: JobsCloseoutPrerequisiteSpec[] = [
  {
    capability: 'jobs-list',
    currentSpecPath: 'openspec/specs/jobs-list/spec.md',
    archivedChangePaths: [
      'openspec/changes/archive/2026-04-18-r1-jobs-core/specs/jobs-list/spec.md',
      'openspec/changes/archive/2026-04-21-ats-candidate-source-operational-depth/specs/jobs-list/spec.md',
    ],
  },
  {
    capability: 'job-authoring',
    currentSpecPath: 'openspec/specs/job-authoring/spec.md',
    archivedChangePaths: [
      'openspec/changes/archive/2026-04-18-r1-jobs-core/specs/job-authoring/spec.md',
      'openspec/changes/archive/2026-04-21-job-board-publishing-operational-depth/specs/job-authoring/spec.md',
      'openspec/changes/archive/2026-04-21-provider-readiness-operational-gates/specs/job-authoring/spec.md',
      'openspec/changes/archive/2026-04-21-ats-candidate-source-operational-depth/specs/job-authoring/spec.md',
    ],
  },
  {
    capability: 'job-detail-hub',
    currentSpecPath: 'openspec/specs/job-detail-hub/spec.md',
    archivedChangePaths: ['openspec/changes/archive/2026-04-18-r1-jobs-core/specs/job-detail-hub/spec.md'],
  },
  {
    capability: 'job-task-overlays',
    currentSpecPath: 'openspec/specs/job-task-overlays/spec.md',
    archivedChangePaths: [
      'openspec/changes/archive/2026-04-18-r1-jobs-core/specs/job-task-overlays/spec.md',
      'openspec/changes/archive/2026-04-21-calendar-scheduling-operational-depth/specs/job-task-overlays/spec.md',
      'openspec/changes/archive/2026-04-21-contract-signing-operational-depth/specs/job-task-overlays/spec.md',
      'openspec/changes/archive/2026-04-21-provider-readiness-operational-gates/specs/job-task-overlays/spec.md',
    ],
  },
  {
    capability: 'jobs-product-depth',
    currentSpecPath: 'openspec/specs/jobs-product-depth/spec.md',
    archivedChangePaths: ['openspec/changes/archive/2026-04-21-r1-jobs-product-depth/specs/jobs-product-depth/spec.md'],
  },
  {
    capability: 'jobs-requisition-branching',
    currentSpecPath: 'openspec/specs/jobs-requisition-branching/spec.md',
    archivedChangePaths: [
      'openspec/changes/archive/2026-04-18-r1-jobs-core/specs/jobs-requisition-branching/spec.md',
      'openspec/changes/archive/2026-04-21-hris-requisition-operational-depth/specs/jobs-requisition-branching/spec.md',
    ],
  },
  {
    capability: 'job-board-publishing-operational-depth',
    currentSpecPath: 'openspec/specs/job-board-publishing-operational-depth/spec.md',
    archivedChangePaths: ['openspec/changes/archive/2026-04-21-job-board-publishing-operational-depth/specs/job-board-publishing-operational-depth/spec.md'],
  },
];

export const jobsCloseoutBackendContracts: JobsCloseoutBackendContract[] = [
  {
    routeFamily: 'jobs-list',
    confirmedBoundary: 'The route owns scope, search, page, asAdmin, and label state. The replaceable adapter returns normalized job rows and ATS status only.',
    unknownFields: ['Canonical list endpoint name', 'Backend pagination metadata shape', 'Server-side label vocabulary', 'Per-row ATS source status fields'],
  },
  {
    routeFamily: 'job-authoring',
    confirmedBoundary: 'The route owns draft mode and resetWorkflow state. The adapter normalizes raw job payload fragments before UI use and serializes draft persistence separately from publishing.',
    unknownFields: ['Create/update endpoint paths', 'Validation error envelope', 'Copy source payload shape', 'Published-vs-draft backend status enum'],
  },
  {
    routeFamily: 'job-detail',
    confirmedBoundary: 'The route owns the selected hub section. The adapter returns normalized summaries, workflow state, assignment/share state, and section-level degradation.',
    unknownFields: ['Aggregate hub endpoint path', 'Candidate/CV/bid/interview summary field names', 'Assignment sharing permission envelope', 'Close/reopen transition response shape'],
  },
  {
    routeFamily: 'job-task',
    confirmedBoundary: 'The route owns parent return, task identity, direct-entry fallback, submit outcome, and parent refresh intent. Calendar and contract provider details remain behind their adapters.',
    unknownFields: ['Bid/CV submit endpoint paths', 'Offer send response shape', 'Reject reason validation payload', 'Notification direct-entry source marker'],
  },
  {
    routeFamily: 'requisition-handoff',
    confirmedBoundary: 'Jobs only evaluates whether a requisition-aware handoff is available; requisition workflow authoring remains in the requisition route family.',
    unknownFields: ['HRIS readiness response fields for handoff blocking', 'Workflow drift payload fields'],
  },
];
