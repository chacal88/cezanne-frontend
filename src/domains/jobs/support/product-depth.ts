import type { JobHubSection, JobTaskKind, JobsListScope } from './models';

export type JobsListProductStateKind = 'loading' | 'ready' | 'empty' | 'filtered-empty' | 'denied' | 'stale-filters' | 'degraded' | 'unavailable';
export type JobAuthoringProductStateKind = 'create' | 'edit' | 'copy' | 'reset-workflow' | 'validating' | 'dirty-draft' | 'saving' | 'saved' | 'save-failed' | 'publish-blocked' | 'partial-publish' | 'retry' | 'denied' | 'unavailable';
export type JobDetailProductStateKind = 'loading' | 'ready' | 'section-degraded' | 'status-transition' | 'assignment-share' | 'denied' | 'unavailable';
export type JobTaskProductStateKind = 'ready' | 'submitting' | 'succeeded' | 'failed' | 'retryable' | 'cancelled' | 'parent-refresh-required' | 'denied' | 'unavailable' | 'degraded';

export function resolveJobsListProductState(input: { loading?: boolean; denied?: boolean; unavailable?: boolean; degraded?: boolean; total: number; filtered: boolean; stale?: boolean; scope: JobsListScope }) {
  if (input.loading) return { kind: 'loading' as const, scope: input.scope, message: 'Loading jobs.' };
  if (input.denied) return { kind: 'denied' as const, scope: input.scope, message: 'You do not have access to this jobs list.' };
  if (input.unavailable) return { kind: 'unavailable' as const, scope: input.scope, message: 'Jobs are currently unavailable.', retryAvailable: true };
  if (input.degraded) return { kind: 'degraded' as const, scope: input.scope, message: 'Jobs loaded with degraded downstream status.', retryAvailable: true };
  if (input.stale) return { kind: 'stale-filters' as const, scope: input.scope, message: 'Filters are stale; refresh to reload current jobs.', retryAvailable: true };
  if (input.total === 0 && input.filtered) return { kind: 'filtered-empty' as const, scope: input.scope, message: 'No jobs match the current filters.' };
  if (input.total === 0) return { kind: 'empty' as const, scope: input.scope, message: 'No jobs are available for this scope.' };
  return { kind: 'ready' as const, scope: input.scope, message: 'Jobs list is ready.' };
}

export function resolveJobAuthoringProductState(input: { mode: 'create' | 'edit' | 'copy'; resetWorkflow?: boolean; denied?: boolean; unavailable?: boolean; validating?: boolean; dirty?: boolean; saving?: boolean; saved?: boolean; saveFailed?: boolean; publishing?: 'blocked' | 'partial' | 'none' }) {
  if (input.denied) return { kind: 'denied' as const, message: 'You do not have access to this job draft.' };
  if (input.unavailable) return { kind: 'unavailable' as const, message: 'Job draft data is unavailable.', retryAvailable: true };
  if (input.saveFailed) return { kind: 'save-failed' as const, message: 'Draft save failed. Retry without losing route context.', retryAvailable: true };
  if (input.saving) return { kind: 'saving' as const, message: 'Saving job draft.' };
  if (input.saved) return { kind: 'saved' as const, message: 'Job draft saved.' };
  if (input.validating) return { kind: 'validating' as const, message: 'Validating job draft.' };
  if (input.publishing === 'blocked') return { kind: 'publish-blocked' as const, message: 'Publishing is blocked separately from draft save.', retryAvailable: true };
  if (input.publishing === 'partial') return { kind: 'partial-publish' as const, message: 'Publishing partially completed and can be retried.', retryAvailable: true };
  if (input.dirty) return { kind: 'dirty-draft' as const, message: 'Draft contains unsaved changes.', retryAvailable: true };
  if (input.resetWorkflow) return { kind: 'reset-workflow' as const, message: 'Reset workflow entry is active.' };
  if (input.mode === 'copy') return { kind: 'copy' as const, message: 'Copying an existing job into a new draft.' };
  return { kind: input.mode, message: `${input.mode === 'edit' ? 'Editing' : 'Creating'} job draft.` };
}

export function resolveJobDetailProductState(input: { section: JobHubSection; loading?: boolean; denied?: boolean; degradedSections?: JobHubSection[]; unavailable?: boolean; transition?: boolean; assignment?: boolean }) {
  if (input.loading) return { kind: 'loading' as const, section: input.section, message: 'Loading job hub.' };
  if (input.denied) return { kind: 'denied' as const, section: input.section, message: 'You do not have access to this job hub.' };
  if (input.unavailable) return { kind: 'unavailable' as const, section: input.section, message: 'Job hub is unavailable.', retryAvailable: true };
  if (input.transition) return { kind: 'status-transition' as const, section: input.section, message: 'Job status transition is ready.' };
  if (input.assignment) return { kind: 'assignment-share' as const, section: input.section, message: 'Assignment/share state is ready.' };
  if (input.degradedSections?.includes(input.section)) return { kind: 'degraded' as const, section: input.section, message: `${input.section} section is degraded.`, retryAvailable: true };
  return { kind: 'ready' as const, section: input.section, message: 'Job hub section is ready.' };
}

export function resolveJobTaskProductState(input: { kind: JobTaskKind; denied?: boolean; unavailable?: boolean; degraded?: boolean; outcome?: 'submit' | 'success' | 'fail' | 'retry' | 'cancel'; parentRefresh?: boolean; parentTarget: string }) {
  if (input.denied) return { kind: 'denied' as const, taskKind: input.kind, parentTarget: input.parentTarget, message: 'You do not have access to this job task.' };
  if (input.unavailable) return { kind: 'unavailable' as const, taskKind: input.kind, parentTarget: input.parentTarget, message: 'Job task is unavailable.', retryAvailable: true };
  if (input.degraded) return { kind: 'degraded' as const, taskKind: input.kind, parentTarget: input.parentTarget, message: 'Job task is degraded by a downstream provider.', retryAvailable: true };
  if (input.parentRefresh) return { kind: 'parent-refresh-required' as const, taskKind: input.kind, parentTarget: input.parentTarget, message: 'Parent hub refresh is required.', retryAvailable: false };
  if (input.outcome === 'submit') return { kind: 'submitting' as const, taskKind: input.kind, parentTarget: input.parentTarget, message: 'Submitting job task.' };
  if (input.outcome === 'success') return { kind: 'succeeded' as const, taskKind: input.kind, parentTarget: input.parentTarget, message: 'Job task completed successfully.' };
  if (input.outcome === 'fail') return { kind: 'failed' as const, taskKind: input.kind, parentTarget: input.parentTarget, message: 'Job task failed.', retryAvailable: true };
  if (input.outcome === 'retry') return { kind: 'retryable' as const, taskKind: input.kind, parentTarget: input.parentTarget, message: 'Job task can be retried.', retryAvailable: true };
  if (input.outcome === 'cancel') return { kind: 'cancelled' as const, taskKind: input.kind, parentTarget: input.parentTarget, message: 'Job task was cancelled.' };
  return { kind: 'ready' as const, taskKind: input.kind, parentTarget: input.parentTarget, message: 'Job task is ready.' };
}
