import { buildAtsCandidateSourceState, buildOperationalGateInput, evaluateOperationalReadinessGate, resolveAtsSyncImportOutcome } from '../../integrations/support';
import type { IntegrationProviderReadinessSignal } from '../../integrations/support';
import type {
  JobAuthoringDraft,
  JobAuthoringSerializedDraft,
  JobAuthoringPublishingView,
  JobHubSection,
  JobHubViewModel,
  JobsListState,
  JobsListViewModel,
} from './models';
import { buildJobBoardPublishingStatus, normalizeJobBoardPublishTarget } from './publishing';

export function buildJobsListViewModel(state: JobsListState, canCreateJob: boolean, atsInput: { readinessGate?: ReturnType<typeof buildJobPublishingReadiness>; syncStatus?: 'idle' | 'pending' | 'failed' | 'degraded'; stale?: boolean } = {}): JobsListViewModel {
  return {
    ...state,
    createPath: canCreateJob ? '/jobs/manage' : null,
    atsStatus: buildAtsCandidateSourceState({
      routeFamily: 'jobs-list',
      gate: atsInput.readinessGate,
      sourceState: atsInput.stale ? 'stale' : undefined,
      syncImportOutcome: resolveAtsSyncImportOutcome({ kind: 'sync', status: atsInput.syncStatus }),
    }),
  };
}

export function normalizeJobHub(input: { jobId: string; section: JobHubSection }): JobHubViewModel {
  return {
    jobId: input.jobId,
    section: input.section,
    summary: `Normalized hub model for ${input.jobId}`,
    workflowState: input.section === 'workflow' ? 'active' : 'draft',
    assignments: ['owner-1', 'recruiter-2'],
  };
}

export function normalizeJobAuthoringDraft(input: { jobId?: string; raw?: Record<string, unknown> }): JobAuthoringDraft {
  return {
    id: input.jobId,
    title: typeof input.raw?.title === 'string' ? input.raw.title : input.jobId ? `Job ${input.jobId}` : 'New job',
    status: input.jobId ? 'active' : 'draft',
    sectors: ['engineering'],
    assigneeIds: ['owner-1'],
    favoritesEnabled: true,
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
  };
}
