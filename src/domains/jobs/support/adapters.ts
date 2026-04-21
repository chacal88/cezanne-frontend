import { buildAtsCandidateSourceState, buildOperationalGateInput, evaluateOperationalReadinessGate, resolveAtsSyncImportOutcome } from '../../integrations/support';
import type { IntegrationProviderReadinessSignal } from '../../integrations/support';
import type {
  JobAuthoringDraft,
  JobAuthoringSerializedDraft,
  JobAuthoringPublishingView,
  JobHubSection,
  JobHubViewModel,
  JobsListItem,
  JobsListState,
  JobsListViewModel,
} from './models';
import { resolveJobAuthoringProductState, resolveJobDetailProductState, resolveJobsListProductState } from './product-depth';
import { buildJobBoardPublishingStatus, normalizeJobBoardPublishTarget } from './publishing';

const jobsListFixture: JobsListItem[] = [
  { id: 'job-101', title: 'Platform Engineer', status: 'active', label: 'engineering', assignedRecruiter: 'owner-1' },
  { id: 'job-102', title: 'Product Designer', status: 'draft', label: 'design', assignedRecruiter: 'recruiter-2' },
  { id: 'job-103', title: 'People Partner', status: 'closed', label: 'people', assignedRecruiter: 'owner-1' },
  { id: 'job-104', title: 'Archived Analyst', status: 'archived', label: 'analytics', assignedRecruiter: 'recruiter-3' },
];

function resolveListItems(state: JobsListState) {
  const scoped = jobsListFixture.filter((job) => {
    if (state.scope === 'open') return job.status === 'active';
    if (state.scope === 'draft') return job.status === 'draft';
    if (state.scope === 'archived') return job.status === 'archived' || job.status === 'closed';
    return Boolean(job.assignedRecruiter);
  });

  return scoped.filter((job) => {
    const searchMatch = !state.search || job.title.toLowerCase().includes(state.search.toLowerCase()) || job.id === state.search;
    const labelMatch = !state.label || job.label === state.label;
    return searchMatch && labelMatch;
  });
}

export function buildJobsListViewModel(
  state: JobsListState,
  canCreateJob: boolean,
  atsInput: { readinessGate?: ReturnType<typeof buildJobPublishingReadiness>; syncStatus?: 'idle' | 'pending' | 'failed' | 'degraded'; stale?: boolean } = {},
): JobsListViewModel {
  const items = resolveListItems(state);
  const filtered = Boolean(state.search || state.label || state.asAdmin);
  const unavailable = state.search === 'unavailable';
  const loading = state.search === 'loading';
  const denied = state.search === 'denied';
  const degraded = state.search === 'degraded' || atsInput.syncStatus === 'degraded';
  const stale = Boolean(atsInput.stale || state.search === 'stale');
  const stateModel = resolveJobsListProductState({
    loading,
    denied,
    unavailable,
    degraded,
    stale,
    total: unavailable || loading || denied ? 0 : items.length,
    filtered,
    scope: state.scope,
  });

  return {
    ...state,
    createPath: canCreateJob && !denied ? '/jobs/manage' : null,
    atsStatus: buildAtsCandidateSourceState({
      routeFamily: 'jobs-list',
      gate: atsInput.readinessGate,
      sourceState: stale ? 'stale' : undefined,
      syncImportOutcome: resolveAtsSyncImportOutcome({ kind: 'sync', status: atsInput.syncStatus }),
    }),
    items: stateModel.kind === 'ready' || stateModel.kind === 'degraded' || stateModel.kind === 'stale-filters' ? items : [],
    total: items.length,
    state: stateModel,
  };
}

export function normalizeJobHub(input: {
  jobId: string;
  section: JobHubSection;
  degradedSections?: JobHubSection[];
  unavailable?: boolean;
  denied?: boolean;
  transition?: boolean;
  assignment?: boolean;
}): JobHubViewModel {
  const sectionState = resolveJobDetailProductState(input);
  return {
    jobId: input.jobId,
    section: input.section,
    summary: `Normalized hub model for ${input.jobId}`,
    workflowState: input.transition ? 'closed' : input.section === 'workflow' ? 'active' : 'draft',
    assignments: input.assignment ? ['owner-1', 'recruiter-2', 'shared-hiring-manager'] : ['owner-1', 'recruiter-2'],
    shareState: input.unavailable ? 'unavailable' : input.assignment ? 'shared' : 'private',
    sectionState,
    summaries: [
      { key: 'candidates', label: 'Candidates', count: 12, state: input.degradedSections?.includes('candidates') ? 'degraded' : 'ready' },
      { key: 'cvs', label: 'CVs', count: 9, state: 'ready' },
      { key: 'bids', label: 'Bids', count: 3, state: 'ready' },
      { key: 'interviews', label: 'Interviews', count: 4, state: input.degradedSections?.includes('activity') ? 'degraded' : 'ready' },
      { key: 'forms-documents', label: 'Forms/documents', count: 2, state: input.unavailable ? 'unavailable' : 'ready' },
    ],
    transitions: [
      { action: 'close', state: input.denied ? 'denied' : input.unavailable ? 'degraded' : 'ready' },
      { action: 'reopen', state: input.denied ? 'denied' : 'ready' },
      { action: 'publish', state: input.unavailable ? 'degraded' : 'ready' },
    ],
  };
}

export function normalizeJobAuthoringDraft(input: { jobId?: string; raw?: Record<string, unknown>; copyFromJobId?: string }): JobAuthoringDraft {
  return {
    id: input.jobId,
    title: typeof input.raw?.title === 'string' ? input.raw.title : input.jobId ? `Job ${input.jobId}` : input.copyFromJobId ? `Copy of ${input.copyFromJobId}` : 'New job',
    status: input.jobId ? 'active' : 'draft',
    sectors: ['engineering'],
    assigneeIds: ['owner-1'],
    favoritesEnabled: true,
    sourceJobId: input.copyFromJobId,
  };
}

export function serializeJobAuthoringDraft(draft: JobAuthoringDraft): JobAuthoringSerializedDraft {
  return {
    id: draft.id,
    name: draft.title,
    isPublished: draft.status === 'active',
    sectorCodes: draft.sectors,
    assignments: draft.assigneeIds.map((userId) => ({ userId })),
    favoriteFlow: draft.favoritesEnabled ? 'enabled' : 'disabled',
  };
}

export function buildJobPublishingReadiness(signal: IntegrationProviderReadinessSignal) {
  return evaluateOperationalReadinessGate(buildOperationalGateInput(signal, 'job-publishing'));
}

export function buildJobAuthoringPublishingView(input: {
  draft: JobAuthoringDraft;
  resetWorkflow?: boolean;
  mode?: 'create' | 'edit' | 'copy';
  saveState?: 'validating' | 'dirty' | 'saving' | 'saved' | 'failed';
  unavailable?: boolean;
  denied?: boolean;
  readinessGate?: ReturnType<typeof buildJobPublishingReadiness>;
  atsReadinessGate?: ReturnType<typeof buildJobPublishingReadiness>;
  atsSyncStatus?: 'idle' | 'pending' | 'failed' | 'degraded';
  atsStale?: boolean;
}): JobAuthoringPublishingView {
  const target = normalizeJobBoardPublishTarget({
    routeFamily: 'job-authoring',
    targetType: 'job',
    hasExistingTarget: Boolean(input.draft.id),
  });
  const status = buildJobBoardPublishingStatus({ readinessGate: input.readinessGate });
  const authoringState = resolveJobAuthoringProductState({
    mode: input.mode ?? (input.draft.sourceJobId ? 'copy' : input.draft.id ? 'edit' : 'create'),
    resetWorkflow: input.resetWorkflow,
    denied: input.denied,
    unavailable: input.unavailable,
    validating: input.saveState === 'validating',
    dirty: input.saveState === 'dirty',
    saving: input.saveState === 'saving',
    saved: input.saveState === 'saved',
    saveFailed: input.saveState === 'failed',
    publishing: status.state === 'provider-blocked' || status.state === 'degraded' || status.state === 'unavailable' ? 'blocked' : status.state === 'partially-published' ? 'partial' : 'none',
  });

  return {
    draftId: input.draft.id,
    canSaveDraft: true,
    canPublish: status.canProceed,
    target,
    status,
    atsStatus: buildAtsCandidateSourceState({
      routeFamily: 'job-authoring',
      gate: input.atsReadinessGate,
      sourceState: input.atsStale ? 'stale' : undefined,
      syncImportOutcome: resolveAtsSyncImportOutcome({ kind: 'sync', status: input.atsSyncStatus }),
    }),
    authoringState,
  };
}
