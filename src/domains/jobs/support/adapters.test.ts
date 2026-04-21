import { describe, expect, it } from 'vitest';
import { buildProviderReadinessSignals } from '../../integrations/support';
import { buildJobAuthoringPublishingView, buildJobPublishingReadiness, buildJobsListViewModel, normalizeJobAuthoringDraft, serializeJobAuthoringDraft } from './adapters';

describe('job authoring publishing helpers', () => {
  it('keeps draft persistence separate when publishing is provider-blocked', () => {
    const draft = normalizeJobAuthoringDraft({ jobId: 'job-1', raw: { title: 'Platform Engineer' } });
    const serialized = serializeJobAuthoringDraft(draft);
    const [signal] = buildProviderReadinessSignals({ id: 'lever', name: 'Lever', family: 'job-board', state: 'reauth_required' });
    const publishing = buildJobAuthoringPublishingView({ draft, readinessGate: buildJobPublishingReadiness(signal) });

    expect(serialized).toMatchObject({ id: 'job-1', name: 'Platform Engineer' });
    expect(publishing).toMatchObject({
      draftId: 'job-1',
      canSaveDraft: true,
      canPublish: false,
      target: { routeFamily: 'job-authoring', targetType: 'job', targetReference: 'existing' },
      status: { state: 'provider-blocked', canProceed: false },
    });
    expect(publishing.status.remediation?.path).toBe('/integrations/lever');
  });

  it('exposes ready publishing without changing create draft serialization', () => {
    const draft = normalizeJobAuthoringDraft({ raw: { title: 'New Role' } });
    const [signal] = buildProviderReadinessSignals({ id: 'lever', name: 'Lever', family: 'job-board', state: 'connected' });
    const publishing = buildJobAuthoringPublishingView({ draft, readinessGate: buildJobPublishingReadiness(signal) });

    expect(serializeJobAuthoringDraft(draft)).toMatchObject({ name: 'New Role', isPublished: false });
    expect(publishing).toMatchObject({ canSaveDraft: true, canPublish: true, status: { state: 'ready' } });
    expect(publishing.target.targetReference).toBe('new');
  });
});


describe('ATS status-only jobs adapters', () => {
  it('adds jobs-list ATS sync status without changing list state or publishing filters', () => {
    const view = buildJobsListViewModel({ scope: 'assigned', page: 3, search: 'designer', asAdmin: true, label: 'urgent' }, false, { syncStatus: 'failed' });

    expect(view).toMatchObject({ scope: 'assigned', page: 3, search: 'designer', asAdmin: true, label: 'urgent', createPath: null });
    expect(view.atsStatus).toMatchObject({ kind: 'sync-failed', syncImportOutcome: 'sync-failed', refreshIntent: 'retry-sync' });
  });

  it('keeps job authoring draft persistence separate from ATS blocked status', () => {
    const draft = normalizeJobAuthoringDraft({ jobId: 'job-ats', raw: { title: 'ATS Linked Role' } });
    const [signal] = buildProviderReadinessSignals({ id: 'greenhouse', name: 'Greenhouse', family: 'ats', state: 'blocked' });
    const publishing = buildJobAuthoringPublishingView({ draft, atsReadinessGate: buildJobPublishingReadiness(signal) });

    expect(serializeJobAuthoringDraft(draft)).toMatchObject({ id: 'job-ats', name: 'ATS Linked Role', isPublished: true });
    expect(publishing.canSaveDraft).toBe(true);
    expect(publishing.atsStatus).toMatchObject({ kind: 'provider-blocked', recoveryTargetType: 'provider-setup' });
  });
});
