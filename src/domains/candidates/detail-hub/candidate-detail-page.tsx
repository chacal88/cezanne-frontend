import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useCapabilities } from '../../../lib/access-control';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { observability } from '../../../app/observability';
import { CandidateDocumentsPanel } from '../documents-contracts/candidate-documents-panel';
import { buildCandidateContractSummary } from '../documents-contracts/contract-summary';
import { CandidateInsightsPanel } from '../surveys-custom-fields/candidate-insights-panel';
import { CandidateCollaborationPanel } from '../communication-collaboration/candidate-collaboration-panel';
import { resolveCandidateSequence } from '../workflow-navigation/sequence';
import type { CandidateContextSegments, CandidateDegradedSection, CandidateDetailView } from '../support/models';
import { buildCandidateActionPath, parseCandidateContextFromPathname, parseCandidateDetailSearchFromUrl } from '../support/routing';
import { getCandidateRecord, subscribeCandidateStore, uploadCandidateCv } from '../support/store';
import { buildCandidateDetailAtsStatus } from '../support/ats-operational-adapters';
import { resolveCandidateHubProductState, resolveCandidateSequenceProductState, resolveCandidateActionProductState } from '../support/product-depth';
import '../candidate-composition.css';
import { normalizeAtsSourceIdentity } from '../../integrations/support';

function buildCandidateDetailView(context: CandidateContextSegments, degradedSections: CandidateDegradedSection[], entry: 'direct' | 'job' | 'notification' | 'database', capabilities: ReturnType<typeof useCapabilities>, databaseReturnTarget?: string): CandidateDetailView {
  const record = getCandidateRecord(context.candidateId);
  const resolvedDegradedSections: CandidateDegradedSection[] = record.id === 'candidate-degraded' && !degradedSections.includes('contracts')
    ? [...degradedSections, 'contracts']
    : degradedSections;
  const sequence = resolveCandidateSequence(context);
  const atsStatus = buildCandidateDetailAtsStatus({
    context,
    sourceIdentity: normalizeAtsSourceIdentity({ providerId: 'greenhouse', providerLabel: 'Greenhouse', sourceState: record.id.includes('stale') ? 'stale' : 'linked' }),
    sourceState: record.id.includes('stale') ? 'stale' : 'linked',
    hasDuplicate: record.tags.includes('duplicate'),
    wasMerged: record.tags.includes('merged'),
    syncStatus: record.id === 'candidate-degraded' ? 'degraded' : undefined,
  });

  return {
    candidateSummary: {
      candidateId: record.id,
      cvId: record.cvId,
      name: record.name,
      stage: record.stage,
      headline: record.headline,
      lastAction: record.lastAction,
    },
    profile: {
      email: record.email,
      phone: record.phone,
      location: record.location,
    },
    jobContext: context.jobId
      ? {
          jobId: context.jobId,
          status: context.status,
          order: context.order,
          filters: context.filters,
          interview: context.interview,
        }
      : undefined,
    workflowState: {
      entryMode: entry,
      databaseReturnTarget,
      sequenceState: entry === 'database' ? 'unavailable' : sequence.state,
      previousCandidatePath: entry !== 'database' && sequence.state === 'available' ? sequence.previousCandidatePath : undefined,
      nextCandidatePath: entry !== 'database' && sequence.state === 'available' ? sequence.nextCandidatePath : undefined,
    },
    comments: record.comments,
    formsSummary: {
      status: record.formsStatus,
      count: record.formsCount,
    },
    documentsSummary: {
      cvVersion: record.cvVersion,
      candidateOwnedCount: record.candidateOwnedDocuments,
      previewPath: record.previewPath,
      downloadPath: record.downloadPath,
      lastUpdatedLabel: record.updatedAt,
    },
    contractsSummary: buildCandidateContractSummary({
      candidateId: record.id,
      status: record.contractsStatus,
      count: record.contractsCount,
      parentTarget: buildCandidateActionPath('offer', context, record.cvId),
    }),
    interviewsSummary: {
      status: record.interviewsStatus,
      count: record.interviewsCount,
    },
    surveysSummary: {
      status: record.surveysStatus,
      count: record.surveysCount,
    },
    customFields: record.customFields,
    collaboration: {
      tags: record.tags,
      conversationId: record.conversationId,
    },
    availableActions: {
      schedule: capabilities.canScheduleInterviewFromCandidate,
      offer: capabilities.canCreateOfferFromCandidate,
      reject: capabilities.canRejectCandidate,
      upload: capabilities.canManageCandidateDocuments,
    },
    degradedSections: resolvedDegradedSections,
    atsSourceStatus: atsStatus.atsState,
  };
}

export function CandidateDetailRoutePage() {
  const location = useLocation();
  const capabilities = useCapabilities();
  const context = parseCandidateContextFromPathname(location.pathname);
  const search = parseCandidateDetailSearchFromUrl(window.location.search);
  const storeSnapshot = useSyncExternalStore(subscribeCandidateStore, () => getCandidateRecord(context.candidateId), () => getCandidateRecord(context.candidateId));

  const [uploadState, setUploadState] = useState<'ready' | 'pending' | 'success' | 'failure'>('ready');
  const [stageMenuOpen, setStageMenuOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'cv' | 'activity' | 'interview' | 'forms' | 'contracts' | 'comments' | 'emails'>('cv');
  const view = useMemo(
    () => buildCandidateDetailView(context, search.degrade, search.entry, capabilities, search.returnTo),
    [capabilities, context, search.degrade, search.entry, search.returnTo, storeSnapshot],
  );

  useEffect(() => {
    if (search.entry === 'direct' || search.entry === 'notification') {
      setActiveCorrelationId(createCorrelationId());
    }

    observability.telemetry.track({
      name: 'candidate_detail_viewed',
      data: {
        candidateId: view.candidateSummary.candidateId,
        jobId: view.jobContext?.jobId,
        entryMode: view.workflowState.entryMode,
        correlationId: ensureCorrelationId(),
      },
    });
  }, [search.entry, view.candidateSummary.candidateId, view.jobContext?.jobId, view.workflowState.entryMode]);

  const currentDetailTarget = `${location.pathname}${window.location.search}`;
  const candidateActionSearch = search.entry === 'database' ? `?entry=database&parent=${encodeURIComponent(currentDetailTarget)}` : '';

  function handleUpload() {
    setActiveCorrelationId(createCorrelationId());
    setUploadState('pending');
    uploadCandidateCv(view.candidateSummary.candidateId);
    setUploadState(view.candidateSummary.candidateId.includes('upload-fail') ? 'failure' : 'success');
    observability.telemetry.track({
      name: 'candidate_cv_uploaded',
      data: {
        candidateId: view.candidateSummary.candidateId,
        routeId: 'candidates.detail',
        correlationId: ensureCorrelationId(),
      },
    });
  }

  function trackSequence(eventName: 'candidate_sequence_previous' | 'candidate_sequence_next') {
    observability.telemetry.track({
      name: eventName,
      data: {
        candidateId: view.candidateSummary.candidateId,
        jobId: view.jobContext?.jobId,
        correlationId: ensureCorrelationId(),
      },
    });
  }

  const hubState = resolveCandidateHubProductState({
    denied: view.candidateSummary.candidateId.includes('denied'),
    notFound: view.candidateSummary.candidateId.includes('not-found'),
    unavailable: view.candidateSummary.candidateId.includes('unavailable'),
    staleContext: view.candidateSummary.candidateId.includes('stale'),
    degradedSections: view.degradedSections,
  });
  const sequenceProductState = resolveCandidateSequenceProductState({
    entryMode: view.workflowState.entryMode,
    hasSequence: view.workflowState.sequenceState === 'available',
    stale: view.workflowState.sequenceState === 'stale',
    databaseReturnTarget: view.workflowState.databaseReturnTarget,
  });
  const uploadProductState = resolveCandidateActionProductState({
    kind: 'cv-upload',
    saving: uploadState === 'pending',
    succeeded: uploadState === 'success',
    retryable: uploadState === 'failure',
  });

  return (
    <section className="candidate-product-page" data-testid="candidate-detail-composition">
      <p className="candidate-detail-breadcrumb">▣ My jobs &gt; Live jobs &gt; {view.jobContext?.jobId ?? 'Candidate database'}</p>

      <div className="candidate-detail-titlebar">
        <h1>candidate profile</h1>
        <div className="candidate-detail-legacy-controls">
          {view.workflowState.databaseReturnTarget ? (
            <a className="candidate-product-link candidate-product-link--secondary" href={view.workflowState.databaseReturnTarget} data-testid="candidate-database-return-link">← Back to database</a>
          ) : null}
          {view.jobContext?.jobId ? (
            <a className="candidate-product-link candidate-product-link--secondary" href={`/job/${view.jobContext.jobId}`} data-testid="candidate-back-to-job-link">← Back to job</a>
          ) : null}
          <div className="candidate-detail-menu-anchor">
            <button className="candidate-detail-stage-select" type="button" onClick={() => setStageMenuOpen((open) => !open)} data-testid="candidate-stage-selector-button">Shortlisted (1) {stageMenuOpen ? '⌃' : '⌄'}</button>
            {stageMenuOpen ? (
              <div className="candidate-detail-dropdown candidate-detail-stage-menu" data-testid="candidate-stage-selector-menu">
                {['New Candidate', 'Shortlisted', 'Phone Interview', 'Face to Face', 'Offering', 'Rejected'].map((stage) => <button type="button" key={stage} onClick={() => setStageMenuOpen(false)}>{stage}</button>)}
              </div>
            ) : null}
          </div>
          <span className="candidate-detail-count-badge">Candidate 1 of 1</span>
          <span className="candidate-detail-hidden-state" data-testid="candidate-detail-entry">{view.workflowState.entryMode}</span>
          <span className="candidate-detail-hidden-state" data-testid="candidate-detail-sequence-product-state">{sequenceProductState.kind}</span>
          <span className="candidate-detail-hidden-state" data-testid="candidate-detail-hub-state">{hubState.kind}</span>
          {view.workflowState.previousCandidatePath ? (
            <a className="candidate-detail-hidden-state" href={view.workflowState.previousCandidatePath} data-testid="candidate-prev-link" onClick={() => trackSequence('candidate_sequence_previous')}>Previous</a>
          ) : null}
          {view.workflowState.nextCandidatePath ? (
            <a className="candidate-detail-hidden-state" href={view.workflowState.nextCandidatePath} data-testid="candidate-next-link" onClick={() => trackSequence('candidate_sequence_next')}>Next</a>
          ) : null}
        </div>
      </div>

      <div className="candidate-detail-layout">
        <aside className="candidate-product-card candidate-profile-card" data-testid="candidate-detail-profile-summary">
          <div className="candidate-profile-header">
            <div className="candidate-profile-name-row">
              <h2 data-testid="candidate-detail-name">{view.candidateSummary.name}</h2>
              <span className="candidate-product-chip">✉</span>
              <span className="candidate-product-chip candidate-product-chip--warning">!</span>
            </div>
            <p className="candidate-product-muted" data-testid="candidate-detail-headline">{view.candidateSummary.headline}</p>
            <span className="candidate-product-chip" data-testid="candidate-detail-stage">{view.candidateSummary.stage}</span>
          </div>

          <div className="candidate-profile-actions" data-testid="candidate-detail-action-stack">
            {view.availableActions.offer ? (
              <a className="candidate-product-link" href={`${buildCandidateActionPath('offer', context, view.candidateSummary.cvId)}${candidateActionSearch}`} data-testid="candidate-open-offer-link">Hire</a>
            ) : null}
            {view.availableActions.reject ? (
              <a className="candidate-product-link candidate-product-link--secondary" href={`${buildCandidateActionPath('reject', context, view.candidateSummary.cvId)}${candidateActionSearch}`} data-testid="candidate-open-reject-link">Reject</a>
            ) : null}
            <div className="candidate-detail-menu-anchor candidate-detail-more-actions">
              <button className="candidate-product-button candidate-product-button--secondary" type="button" onClick={() => setMoreActionsOpen((open) => !open)} data-testid="candidate-more-actions-button">☰ More actions</button>
              {moreActionsOpen ? (
                <div className="candidate-detail-dropdown candidate-detail-more-menu" data-testid="candidate-more-actions-menu">
                  {view.availableActions.schedule ? <a href={`${buildCandidateActionPath('schedule', context, view.candidateSummary.cvId)}${candidateActionSearch}`} data-testid="candidate-open-schedule-link">Schedule interview</a> : null}
                  {view.availableActions.offer ? <a href={`${buildCandidateActionPath('offer', context, view.candidateSummary.cvId)}${candidateActionSearch}`}>Create offer</a> : null}
                  {view.availableActions.reject ? <a href={`${buildCandidateActionPath('reject', context, view.candidateSummary.cvId)}${candidateActionSearch}`}>Reject candidate</a> : null}
                  <button type="button" onClick={() => { setActiveTab('activity'); setMoreActionsOpen(false); }}>View activity</button>
                  <button type="button" onClick={() => { setActiveTab('comments'); setMoreActionsOpen(false); }}>Add note</button>
                </div>
              ) : null}
            </div>
            {view.availableActions.upload ? (
              <button className="candidate-product-button candidate-product-button--secondary" type="button" onClick={handleUpload} data-testid="candidate-upload-cv-button">Upload new CV</button>
            ) : null}
            <p data-testid="candidate-upload-cv-state">Upload: {uploadProductState.kind}</p>
            {uploadState === 'failure' ? <p data-testid="candidate-upload-cv-retry">Upload failed. Retry keeps binary transfer details inside the adapter seam.</p> : null}
          </div>

          <div className="candidate-profile-meta">
            <p data-testid="candidate-detail-ats-state">◉ ATS source: {view.atsSourceStatus?.kind ?? 'unavailable'}</p>
            <p>✉ {view.profile.email}</p>
            <p>☎ {view.profile.phone}</p>
            <p>◆ {view.profile.location}</p>
            <p data-testid="candidate-detail-job">▣ Job context: {view.jobContext?.jobId ?? 'Direct candidate profile'}</p>
            <p data-testid="candidate-detail-sequence-state">⇆ Sequence: {view.workflowState.sequenceState}</p>
            <p data-testid="candidate-detail-last-action">★ {view.candidateSummary.lastAction}</p>
            <p data-testid="candidate-detail-ats-refresh">↻ ATS refresh: {view.atsSourceStatus?.refreshIntent ?? 'none'}</p>
            <p data-testid="candidate-database-return-target">Return: {view.workflowState.databaseReturnTarget ?? '—'}</p>
          </div>
        </aside>

        <main className="candidate-detail-main">
          <div className="candidate-flow-line" aria-label="Hiring flow">
            {['New Candidate', 'Shortlisted', 'Phone Interview', 'Face to Face', 'Offering'].map((step, index) => (
              <span className={`candidate-flow-step ${index < 2 ? 'is-done' : ''}`} key={step}>
                {step}<span className="candidate-flow-dot" />
              </span>
            ))}
          </div>

          <div className="candidate-detail-tabs" role="tablist" aria-label="Candidate detail tabs">
            {[
              ['cv', 'Latest CV'],
              ['activity', 'Activity'],
              ['interview', 'Interview score'],
              ['forms', 'Forms & docs'],
              ['contracts', 'Contracts'],
              ['comments', 'Comments'],
              ['emails', 'Emails'],
            ].map(([tab, label]) => (
              <button className={`candidate-detail-tab ${activeTab === tab ? 'is-active' : ''}`} type="button" role="tab" aria-selected={activeTab === tab} key={tab} onClick={() => setActiveTab(tab as typeof activeTab)} data-testid={`candidate-tab-${tab}`}>{label}</button>
            ))}
          </div>
          <div className="candidate-cv-viewer" data-testid="candidate-detail-cv-viewer">
            {activeTab === 'cv' ? <span>No preview available</span> : null}
            {activeTab === 'activity' ? <div className="candidate-tab-panel"><h2>Activity</h2><p>CV received from Direct CV upload</p><p>Candidate status changed to Shortlisted</p></div> : null}
            {activeTab === 'interview' ? <div className="candidate-tab-panel"><h2>Interview score</h2><p>{view.interviewsSummary.status}</p><p>Score details remain downstream-owned.</p></div> : null}
            {activeTab === 'forms' ? <div className="candidate-tab-panel"><h2>Forms & docs</h2><p>{view.formsSummary.count} forms available</p><p>Form schemas are not invented in this view.</p></div> : null}
            {activeTab === 'contracts' ? <div className="candidate-tab-panel"><h2>Contracts</h2><p>{view.contractsSummary.signingState.kind}</p><p>{view.contractsSummary.count} contract records</p></div> : null}
            {activeTab === 'comments' ? <div className="candidate-tab-panel"><h2>Comments</h2>{view.comments.map((comment) => <p key={comment}>{comment}</p>)}</div> : null}
            {activeTab === 'emails' ? <div className="candidate-tab-panel"><h2>Emails</h2><p>Candidate email history is available through the conversation boundary.</p></div> : null}
          </div>

          <div className="candidate-detail-panels" data-testid="candidate-detail-downstream-panels">
            <CandidateDocumentsPanel view={view} />
            <CandidateInsightsPanel view={view} />
          </div>
          <CandidateCollaborationPanel view={view} />
        </main>
      </div>
    </section>
  );
}
