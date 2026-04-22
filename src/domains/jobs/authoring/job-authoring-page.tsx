import { useTranslation } from 'react-i18next';
import { useCapabilities } from '../../../lib/access-control';
import { buildJobAuthoringPublishingView, buildJobPublishingReadiness, normalizeJobAuthoringDraft, serializeJobAuthoringDraft } from '../support/adapters';

const allowedSaveStates = ['validating', 'dirty', 'saving', 'saved', 'failed'] as const;
const allowedPublishingStates = ['blocked', 'degraded', 'unavailable', 'partial'] as const;
type SaveState = (typeof allowedSaveStates)[number];
type PublishingFixtureState = (typeof allowedPublishingStates)[number];

export function validateJobAuthoringSearch(search: Record<string, unknown>) {
  return {
    resetWorkflow: search.resetWorkflow === true || search.resetWorkflow === 'true',
    copyFromJobId: typeof search.copyFromJobId === 'string' ? search.copyFromJobId : undefined,
    saveState: typeof search.saveState === 'string' && (allowedSaveStates as readonly string[]).includes(search.saveState) ? (search.saveState as SaveState) : undefined,
    publishingState: typeof search.publishingState === 'string' && (allowedPublishingStates as readonly string[]).includes(search.publishingState) ? (search.publishingState as PublishingFixtureState) : undefined,
  };
}

export function JobAuthoringPage({ jobId, resetWorkflow, copyFromJobId, saveState, publishingState }: { jobId?: string; resetWorkflow: boolean; copyFromJobId?: string; saveState?: SaveState; publishingState?: PublishingFixtureState }) {
  const capabilities = useCapabilities();
  const { t } = useTranslation('jobs');
  const draft = normalizeJobAuthoringDraft({ jobId, copyFromJobId });
  const serialized = serializeJobAuthoringDraft(draft);
  const readinessGate = publishingState && publishingState !== 'partial' ? buildJobPublishingReadiness({
    family: 'publishing',
    providerFamily: 'job-board',
    outcome: publishingState === 'blocked' ? 'blocked' : publishingState,
    reason: 'visual fixture state',
    setupTarget: { providerId: 'job-board-fixture', path: '/integrations/job-board-fixture', label: 'Job board provider setup' },
  }) : undefined;
  const publishing = buildJobAuthoringPublishingView({ draft, resetWorkflow, saveState, readinessGate });
  const publishingStateLabel = publishingState === 'partial' ? 'partially-published' : publishing.status.state;
  const branching = capabilities.canUseJobRequisitionBranching ? 'requisition-aware' : 'ordinary-jobs';

  return (
    <section>
      <h1>{jobId ? t('authoring.editTitle') : t('authoring.createTitle')}</h1>
      <p>{t('authoring.detail')}</p>
      <dl>
        <dt>{t('authoring.mode')}</dt>
        <dd data-testid="job-authoring-mode">{copyFromJobId ? 'copy' : jobId ? 'edit' : 'create'}</dd>
        <dt>{t('authoring.branching')}</dt>
        <dd data-testid="job-authoring-branching">{branching}</dd>
        <dt>{t('authoring.resetWorkflow')}</dt>
        <dd data-testid="job-authoring-reset-workflow">{String(resetWorkflow)}</dd>
        <dt>Authoring state</dt>
        <dd data-testid="job-authoring-state">{publishing.authoringState.kind}</dd>
        <dt>Draft title</dt>
        <dd data-testid="job-authoring-draft-title">{draft.title}</dd>
        <dt>Adapter payload name</dt>
        <dd data-testid="job-authoring-save-payload-name">{serialized.name}</dd>
      </dl>
      <p data-testid="job-authoring-state-message">{publishing.authoringState.message}</p>

      <h2>Publishing</h2>
      <dl>
        <dt>Publishing state</dt>
        <dd data-testid="job-authoring-publishing-state">{publishingStateLabel}</dd>
        <dt>Draft save available</dt>
        <dd data-testid="job-authoring-can-save-draft">{String(publishing.canSaveDraft)}</dd>
        <dt>ATS sync state</dt>
        <dd data-testid="job-authoring-ats-state">{publingAtsState(publishing.atsStatus?.kind)}</dd>
      </dl>
    </section>
  );
}

function publingAtsState(state: string | undefined) {
  return state ?? 'unavailable';
}
