import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useCapabilities } from '../../../lib/access-control';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { observability } from '../../../app/observability';
import { CandidateDocumentsPanel } from '../documents-contracts/candidate-documents-panel';
import { CandidateInsightsPanel } from '../surveys-custom-fields/candidate-insights-panel';
import { CandidateCollaborationPanel } from '../communication-collaboration/candidate-collaboration-panel';
import { resolveCandidateSequence } from '../workflow-navigation/sequence';
import type { CandidateContextSegments, CandidateDegradedSection, CandidateDetailView } from '../support/models';
import { buildCandidateActionPath, parseCandidateContextFromPathname, parseCandidateDetailSearchFromUrl } from '../support/routing';
import { getCandidateRecord, subscribeCandidateStore, uploadCandidateCv } from '../support/store';

function buildCandidateDetailView(context: CandidateContextSegments, degradedSections: CandidateDegradedSection[], entry: 'direct' | 'job' | 'notification' | 'database', capabilities: ReturnType<typeof useCapabilities>, databaseReturnTarget?: string): CandidateDetailView {
  const record = getCandidateRecord(context.candidateId);
  const resolvedDegradedSections: CandidateDegradedSection[] = record.id === 'candidate-degraded' && !degradedSections.includes('contracts')
    ? [...degradedSections, 'contracts']
    : degradedSections;
  const sequence = resolveCandidateSequence(context);

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
    contractsSummary: {
      status: record.contractsStatus,
      count: record.contractsCount,
    },
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
  };
}

export function CandidateDetailRoutePage() {
  const location = useLocation();
  const capabilities = useCapabilities();
  const context = parseCandidateContextFromPathname(location.pathname);
  const search = parseCandidateDetailSearchFromUrl(window.location.search);
  const storeSnapshot = useSyncExternalStore(subscribeCandidateStore, () => getCandidateRecord(context.candidateId), () => getCandidateRecord(context.candidateId));

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
    uploadCandidateCv(view.candidateSummary.candidateId);
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

  return (
    <section>
      <h1>Candidate hub</h1>
      <p data-testid="candidate-detail-entry">{view.workflowState.entryMode}</p>
      <p data-testid="candidate-detail-name">{view.candidateSummary.name}</p>
      <p data-testid="candidate-detail-stage">{view.candidateSummary.stage}</p>
      <p data-testid="candidate-detail-last-action">{view.candidateSummary.lastAction}</p>
      <p data-testid="candidate-detail-headline">{view.candidateSummary.headline}</p>
      <p data-testid="candidate-detail-job">{view.jobContext?.jobId ?? '—'}</p>
      <p data-testid="candidate-detail-sequence-state">{view.workflowState.sequenceState}</p>
      <p data-testid="candidate-database-return-target">{view.workflowState.databaseReturnTarget ?? '—'}</p>
      {view.workflowState.databaseReturnTarget ? (
        <a href={view.workflowState.databaseReturnTarget} data-testid="candidate-database-return-link">
          Return to candidate database
        </a>
      ) : null}
      <div style={{ display: 'flex', gap: 12 }}>
        {view.workflowState.previousCandidatePath ? (
          <a href={view.workflowState.previousCandidatePath} data-testid="candidate-prev-link" onClick={() => trackSequence('candidate_sequence_previous')}>
            Previous candidate
          </a>
        ) : null}
        {view.workflowState.nextCandidatePath ? (
          <a href={view.workflowState.nextCandidatePath} data-testid="candidate-next-link" onClick={() => trackSequence('candidate_sequence_next')}>
            Next candidate
          </a>
        ) : null}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        {view.availableActions.schedule ? (
          <a href={`${buildCandidateActionPath('schedule', context, view.candidateSummary.cvId)}${candidateActionSearch}`} data-testid="candidate-open-schedule-link">
            Open schedule flow
          </a>
        ) : null}
        {view.availableActions.offer ? (
          <a href={`${buildCandidateActionPath('offer', context, view.candidateSummary.cvId)}${candidateActionSearch}`} data-testid="candidate-open-offer-link">
            Open offer flow
          </a>
        ) : null}
        {view.availableActions.reject ? (
          <a href={`${buildCandidateActionPath('reject', context, view.candidateSummary.cvId)}${candidateActionSearch}`} data-testid="candidate-open-reject-link">
            Open reject flow
          </a>
        ) : null}
        {view.availableActions.upload ? (
          <button type="button" onClick={handleUpload} data-testid="candidate-upload-cv-button">
            Upload replacement CV
          </button>
        ) : null}
      </div>
      <CandidateDocumentsPanel view={view} />
      <CandidateInsightsPanel view={view} />
      <CandidateCollaborationPanel view={view} />
    </section>
  );
}
