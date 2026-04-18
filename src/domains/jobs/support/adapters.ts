import type {
  JobAuthoringDraft,
  JobAuthoringSerializedDraft,
  JobHubSection,
  JobHubViewModel,
  JobsListState,
  JobsListViewModel,
} from './models';

export function buildJobsListViewModel(state: JobsListState, canCreateJob: boolean): JobsListViewModel {
  return {
    ...state,
    createPath: canCreateJob ? '/jobs/manage' : null,
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
