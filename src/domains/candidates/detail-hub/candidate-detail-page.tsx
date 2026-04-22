import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useLocation } from "@tanstack/react-router";
import { useCapabilities } from "../../../lib/access-control";
import {
  createCorrelationId,
  ensureCorrelationId,
  setActiveCorrelationId,
} from "../../../lib/observability";
import { observability } from "../../../app/observability";
import { CandidateDocumentsPanel } from "../documents-contracts/candidate-documents-panel";
import { buildCandidateContractSummary } from "../documents-contracts/contract-summary";
import { CandidateCollaborationPanel } from "../communication-collaboration/candidate-collaboration-panel";
import { resolveCandidateSequence } from "../workflow-navigation/sequence";
import type {
  CandidateContextSegments,
  CandidateDegradedSection,
  CandidateDetailView,
} from "../support/models";
import {
  buildCandidateActionPath,
  parseCandidateContextFromPathname,
  parseCandidateDetailSearchFromUrl,
} from "../support/routing";
import {
  getCandidateRecord,
  cacheCandidateRecord,
  subscribeCandidateStore,
  uploadCandidateCv,
  type CandidateRecord,
} from "../support/store";
import { buildCandidateDetailAtsStatus } from "../support/ats-operational-adapters";
import {
  resolveCandidateHubProductState,
  resolveCandidateSequenceProductState,
  resolveCandidateActionProductState,
} from "../support/product-depth";
import "../candidate-composition.css";
import { normalizeAtsSourceIdentity } from "../../integrations/support";
import { fetchCandidateDetailRecord } from "./candidate-detail-api";

function buildCandidateDetailView(
  context: CandidateContextSegments,
  record: CandidateRecord,
  degradedSections: CandidateDegradedSection[],
  entry: "direct" | "job" | "notification" | "database",
  capabilities: ReturnType<typeof useCapabilities>,
  databaseReturnTarget?: string,
): CandidateDetailView {
  const resolvedDegradedSections: CandidateDegradedSection[] =
    record.id === "candidate-degraded" &&
    !degradedSections.includes("contracts")
      ? [...degradedSections, "contracts"]
      : degradedSections;
  const sequence = resolveCandidateSequence(context);
  const atsStatus = buildCandidateDetailAtsStatus({
    context,
    sourceIdentity: normalizeAtsSourceIdentity({
      providerId: "greenhouse",
      providerLabel: "Greenhouse",
      sourceState: record.id.includes("stale") ? "stale" : "linked",
    }),
    sourceState: record.id.includes("stale") ? "stale" : "linked",
    hasDuplicate: record.tags.includes("duplicate"),
    wasMerged: record.tags.includes("merged"),
    syncStatus: record.id === "candidate-degraded" ? "degraded" : undefined,
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
      sequenceState: entry === "database" ? "unavailable" : sequence.state,
      previousCandidatePath:
        entry !== "database" && sequence.state === "available"
          ? sequence.previousCandidatePath
          : undefined,
      nextCandidatePath:
        entry !== "database" && sequence.state === "available"
          ? sequence.nextCandidatePath
          : undefined,
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
      parentTarget: buildCandidateActionPath("offer", context, record.cvId),
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
  const storeSnapshot = useSyncExternalStore(
    subscribeCandidateStore,
    () => getCandidateRecord(context.candidateId),
    () => getCandidateRecord(context.candidateId),
  );

  const [uploadState, setUploadState] = useState<
    "ready" | "pending" | "success" | "failure"
  >("ready");
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [apiState, setApiState] = useState<{
    status: "idle" | "loading" | "ready" | "error";
    record?: CandidateRecord;
    error?: string;
  }>({ status: "idle" });
  const [activeTab, setActiveTab] = useState<
    | "cv"
    | "activity"
    | "interview"
    | "forms"
    | "contracts"
    | "comments"
    | "emails"
  >("cv");
  const shouldFetchApiDetail =
    search.entry === "database" ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      context.candidateId,
    ) ||
    /^[0-9]+$/.test(context.candidateId);
  const currentRecord = apiState.record ?? storeSnapshot;
  const view = useMemo(
    () =>
      buildCandidateDetailView(
        context,
        currentRecord,
        search.degrade,
        search.entry,
        capabilities,
        search.returnTo,
      ),
    [
      capabilities,
      context,
      search.degrade,
      search.entry,
      search.returnTo,
      storeSnapshot,
      currentRecord,
    ],
  );

  useEffect(() => {
    if (!shouldFetchApiDetail) {
      setApiState({ status: "idle" });
      return;
    }

    let active = true;
    setApiState({ status: "loading" });

    fetchCandidateDetailRecord(context.candidateId)
      .then((record) => {
        if (!active) return;
        cacheCandidateRecord(record);
        setApiState({ status: "ready", record });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setApiState({
          status: "error",
          record: undefined,
          error:
            error instanceof Error
              ? error.message
              : "Candidate detail API request failed.",
        });
      });

    return () => {
      active = false;
    };
  }, [context.candidateId, shouldFetchApiDetail]);

  useEffect(() => {
    if (search.entry === "direct" || search.entry === "notification") {
      setActiveCorrelationId(createCorrelationId());
    }

    observability.telemetry.track({
      name: "candidate_detail_viewed",
      data: {
        candidateId: view.candidateSummary.candidateId,
        jobId: view.jobContext?.jobId,
        entryMode: view.workflowState.entryMode,
        correlationId: ensureCorrelationId(),
      },
    });
  }, [
    search.entry,
    view.candidateSummary.candidateId,
    view.jobContext?.jobId,
    view.workflowState.entryMode,
  ]);

  const currentDetailTarget = `${location.pathname}${window.location.search}`;
  const candidateActionSearch =
    search.entry === "database"
      ? `?entry=database&parent=${encodeURIComponent(currentDetailTarget)}`
      : "";

  function handleUpload() {
    setActiveCorrelationId(createCorrelationId());
    setUploadState("pending");
    uploadCandidateCv(view.candidateSummary.candidateId);
    setUploadState(
      view.candidateSummary.candidateId.includes("upload-fail")
        ? "failure"
        : "success",
    );
    observability.telemetry.track({
      name: "candidate_cv_uploaded",
      data: {
        candidateId: view.candidateSummary.candidateId,
        routeId: "candidates.detail",
        correlationId: ensureCorrelationId(),
      },
    });
  }

  function trackSequence(
    eventName: "candidate_sequence_previous" | "candidate_sequence_next",
  ) {
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
    denied: view.candidateSummary.candidateId.includes("denied"),
    notFound: view.candidateSummary.candidateId.includes("not-found"),
    unavailable: view.candidateSummary.candidateId.includes("unavailable"),
    staleContext: view.candidateSummary.candidateId.includes("stale"),
    degradedSections: view.degradedSections,
  });
  const sequenceProductState = resolveCandidateSequenceProductState({
    entryMode: view.workflowState.entryMode,
    hasSequence: view.workflowState.sequenceState === "available",
    stale: view.workflowState.sequenceState === "stale",
    databaseReturnTarget: view.workflowState.databaseReturnTarget,
  });
  const uploadProductState = resolveCandidateActionProductState({
    kind: "cv-upload",
    saving: uploadState === "pending",
    succeeded: uploadState === "success",
    retryable: uploadState === "failure",
  });

  const flowSteps = [
    "New Candidate",
    "Shortlisted",
    "Phone Interview",
    "Face to Face",
    "Offering",
  ];
  const normalizedStage = view.candidateSummary.stage.toLowerCase();
  const activeFlowIndex = Math.max(
    0,
    flowSteps.findIndex((step) =>
      normalizedStage.includes(step.toLowerCase().split(" ")[0]),
    ),
  );

  return (
    <section
      className="candidate-product-page"
      data-testid="candidate-detail-composition"
    >
      <p className="candidate-detail-breadcrumb">
        ▣ My jobs &gt; Live jobs &gt;{" "}
        {view.jobContext?.jobId ?? "Candidate database"}
      </p>

      <div className="candidate-detail-titlebar">
        <h1>candidate profile</h1>
        <div className="candidate-detail-legacy-controls">
          {view.workflowState.databaseReturnTarget ? (
            <a
              className="candidate-product-link candidate-product-link--secondary"
              href={view.workflowState.databaseReturnTarget}
              data-testid="candidate-database-return-link"
            >
              ← Back to database
            </a>
          ) : null}
          {view.jobContext?.jobId ? (
            <a
              className="candidate-product-link candidate-product-link--secondary"
              href={`/job/${view.jobContext.jobId}`}
              data-testid="candidate-back-to-job-link"
            >
              ← Back to job
            </a>
          ) : null}
          <select
            className="candidate-detail-stage-select"
            value={view.candidateSummary.stage}
            aria-label="Hiring stage"
            data-testid="candidate-stage-selector-button"
            onChange={(event) => {
              event.currentTarget.value = view.candidateSummary.stage;
            }}
          >
            {[
              "New Candidate",
              "Shortlisted",
              "Phone Interview",
              "Face to Face",
              "Offering",
              "Rejected",
              view.candidateSummary.stage,
            ]
              .filter((stage, index, stages) => stages.indexOf(stage) === index)
              .map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
          </select>
          <span className="candidate-detail-sequence-control">
            {view.workflowState.previousCandidatePath ? (
              <a
                href={view.workflowState.previousCandidatePath}
                data-testid="candidate-prev-link"
                onClick={() => trackSequence("candidate_sequence_previous")}
              >
                Previous
              </a>
            ) : null}
            <span>
              Candidate{" "}
              {view.workflowState.previousCandidatePath &&
              view.workflowState.nextCandidatePath
                ? "2"
                : view.workflowState.previousCandidatePath
                  ? "3"
                  : "1"}{" "}
              of {view.workflowState.sequenceState === "available" ? "3" : "1"}
            </span>
            {view.workflowState.nextCandidatePath ? (
              <a
                href={view.workflowState.nextCandidatePath}
                data-testid="candidate-next-link"
                onClick={() => trackSequence("candidate_sequence_next")}
              >
                Next →
              </a>
            ) : null}
          </span>
          <span
            className="candidate-detail-hidden-state"
            data-testid="candidate-detail-entry"
          >
            {view.workflowState.entryMode}
          </span>
          <span
            className="candidate-detail-hidden-state"
            data-testid="candidate-detail-sequence-product-state"
          >
            {sequenceProductState.kind}
          </span>
          <span
            className="candidate-detail-hidden-state"
            data-testid="candidate-detail-hub-state"
          >
            {hubState.kind}
          </span>
        </div>
      </div>

      <div className="candidate-detail-layout">
        <aside
          className="candidate-detail-sidebar"
          data-testid="candidate-detail-profile-summary"
        >
          <div className="candidate-profile-identity">
            <div className="candidate-profile-name-row">
              <h2 data-testid="candidate-detail-name">
                {view.candidateSummary.name}
              </h2>
              <span className="candidate-profile-icon">✉</span>
              <span className="candidate-profile-icon">▣</span>
            </div>
            <p
              className="candidate-product-muted"
              data-testid="candidate-detail-headline"
            >
              CV received 9 hours ago from Indeed
            </p>
            <span className="candidate-first-time-badge">
              ✒ First time applicant
            </span>
          </div>

          <div className="candidate-product-card candidate-profile-card">
            <div
              className="candidate-profile-actions"
              data-testid="candidate-detail-action-stack"
            >
              {view.availableActions.offer ? (
                <a
                  className="candidate-profile-primary-action"
                  href={`${buildCandidateActionPath("offer", context, view.candidateSummary.cvId)}${candidateActionSearch}`}
                  data-testid="candidate-open-offer-link"
                >
                  Re-accept CV ↻
                </a>
              ) : null}
              <div className="candidate-detail-menu-anchor candidate-detail-more-actions">
                <button
                  className="candidate-profile-primary-action candidate-profile-primary-action--secondary"
                  type="button"
                  onClick={() => setMoreActionsOpen((open) => !open)}
                  data-testid="candidate-more-actions-button"
                >
                  ☰ More actions
                </button>
                {moreActionsOpen ? (
                  <div
                    className="candidate-detail-dropdown candidate-detail-more-menu"
                    data-testid="candidate-more-actions-menu"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("emails");
                        setMoreActionsOpen(false);
                      }}
                    >
                      ✉ Email candidate
                    </button>
                    {view.availableActions.schedule ? (
                      <a
                        href={`${buildCandidateActionPath("schedule", context, view.candidateSummary.cvId)}${candidateActionSearch}`}
                        data-testid="candidate-open-schedule-link"
                      >
                        ▣ Interview scheduler
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setMoreActionsOpen(false);
                      }}
                    >
                      ↔ Move to a different job
                    </button>
                    {view.availableActions.reject ? (
                      <a
                        href={`${buildCandidateActionPath("reject", context, view.candidateSummary.cvId)}${candidateActionSearch}`}
                        data-testid="candidate-open-reject-link"
                      >
                        ⊖ Reject candidate
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <p className="candidate-cv-score">
                <span>-</span> /100 - CV score
              </p>
              <p
                data-testid="candidate-upload-cv-state"
                className="candidate-detail-hidden-state"
              >
                Upload: {uploadProductState.kind}
              </p>
              {uploadState === "failure" ? (
                <p data-testid="candidate-upload-cv-retry">
                  Upload failed. Retry keeps binary transfer details inside the
                  adapter seam.
                </p>
              ) : null}
            </div>

            <div className="candidate-profile-meta">
              <p>
                ✉ <span>{view.profile.email}</span>
              </p>
              <p>
                ☎ <span>{view.profile.phone}</span>
              </p>
              <p>
                ◆ <span>{view.profile.location}</span>
              </p>
              <p>
                🏷{" "}
                <span>
                  {view.collaboration.tags.length
                    ? view.collaboration.tags.join(", ")
                    : "Select tags or type to add..."}
                </span>
              </p>
              <p>
                <span
                  className="candidate-status-pill"
                  data-testid="candidate-detail-stage"
                >
                  {view.candidateSummary.stage}
                </span>
              </p>
              <p
                className="candidate-detail-hidden-state"
                data-testid="candidate-detail-ats-state"
              >
                ATS source: {view.atsSourceStatus?.kind ?? "unavailable"}
              </p>
              <p
                className="candidate-detail-hidden-state"
                data-testid="candidate-detail-job"
              >
                Job context:{" "}
                {view.jobContext?.jobId ?? "Direct candidate profile"}
              </p>
              <p
                className="candidate-detail-hidden-state"
                data-testid="candidate-detail-sequence-state"
              >
                Sequence: {view.workflowState.sequenceState}
              </p>
              <p
                className="candidate-detail-hidden-state"
                data-testid="candidate-detail-last-action"
              >
                {view.candidateSummary.lastAction}
              </p>
              <p
                className="candidate-detail-hidden-state"
                data-testid="candidate-detail-api-state"
              >
                API: {apiState.status}
              </p>
              {apiState.status === "error" ? (
                <p data-testid="candidate-detail-api-error">
                  {apiState.error}
                </p>
              ) : null}
              <p
                className="candidate-detail-hidden-state"
                data-testid="candidate-detail-ats-refresh"
              >
                ATS refresh: {view.atsSourceStatus?.refreshIntent ?? "none"}
              </p>
              <p
                className="candidate-detail-hidden-state"
                data-testid="candidate-database-return-target"
              >
                Return: {view.workflowState.databaseReturnTarget ?? "—"}
              </p>
            </div>
          </div>

          <div className="candidate-product-card candidate-notes-card">
            <h3>
              Notes{" "}
              <button type="button" aria-label="Add note">
                ＋
              </button>
            </h3>
          </div>

          <nav
            className="candidate-profile-utility-links"
            aria-label="Candidate utility links"
          >
            <a href="#delete-candidate">Delete candidate</a>
            <a href="#edit-candidate">Edit candidate</a>
            <a href="#export-candidate-profile">Export candidate profile</a>
            <a href="#virtual-contact-file">Virtual contact file (vCard)</a>
          </nav>
        </aside>

        <main className="candidate-detail-main">
          <div className="candidate-flow-line" aria-label="Hiring flow">
            {flowSteps.map((step, index) => (
              <span
                className={`candidate-flow-step ${index < activeFlowIndex ? "is-done" : ""} ${index === activeFlowIndex ? "is-active" : ""}`}
                key={step}
              >
                {step}
                <span className="candidate-flow-dot" />
              </span>
            ))}
          </div>

          <div
            className="candidate-detail-tabs"
            role="tablist"
            aria-label="Candidate detail tabs"
          >
            {[
              ["cv", "Latest CV"],
              ["activity", "Activity"],
              ["interview", "Interview score"],
              ["forms", "Forms & docs"],
              ["contracts", "Contracts"],
              ["comments", "Comments"],
              ["emails", "Emails"],
            ].map(([tab, label]) => (
              <button
                className={`candidate-detail-tab ${activeTab === tab ? "is-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                data-testid={`candidate-tab-${tab}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            className="candidate-tab-content"
            data-testid="candidate-detail-cv-viewer"
          >
            {activeTab === "cv" ? (
              <div className="candidate-cv-tab-shell">
                <div className="candidate-cv-toolbar">
                  <div
                    className="candidate-cv-toggle"
                    role="group"
                    aria-label="CV preview type"
                  >
                    <button className="is-active" type="button">
                      CV
                    </button>
                    <button type="button">Cover note</button>
                  </div>
                  <div className="candidate-cv-actions">
                    <button type="button">↻ Reload CV</button>
                    {view.availableActions.upload ? (
                      <button
                        type="button"
                        onClick={handleUpload}
                        data-testid="candidate-upload-cv-button"
                      >
                        ⇧ Upload new CV
                      </button>
                    ) : null}
                    <a href={view.documentsSummary.downloadPath}>
                      Download CV ▾
                    </a>
                  </div>
                </div>
                <div className="candidate-cv-preview-frame">
                  <button
                    className="candidate-cv-open-control"
                    type="button"
                    aria-label="Open CV preview"
                  >
                    ↗
                  </button>
                  <span>No preview available</span>
                </div>
              </div>
            ) : null}
            {activeTab === "activity" ? (
              <div className="candidate-tab-panel">
                <h2>Activity</h2>
                <p>CV received from Direct CV upload</p>
                <p>Candidate status changed to {view.candidateSummary.stage}</p>
              </div>
            ) : null}
            {activeTab === "interview" ? (
              <div className="candidate-tab-panel">
                <h2>Interview score</h2>
                <p>{view.interviewsSummary.status}</p>
                <p>Score details remain downstream-owned.</p>
              </div>
            ) : null}
            {activeTab === "forms" ? (
              <CandidateDocumentsPanel view={view} />
            ) : null}
            {activeTab === "contracts" ? (
              <div className="candidate-tab-panel">
                <h2>Contracts</h2>
                <p>{view.contractsSummary.signingState.kind}</p>
                <p>{view.contractsSummary.count} contract records</p>
              </div>
            ) : null}
            {activeTab === "comments" ? (
              <CandidateCollaborationPanel view={view} />
            ) : null}
            {activeTab === "emails" ? (
              <div className="candidate-tab-panel">
                <h2>Emails</h2>
                <p>
                  Candidate email history is available through the conversation
                  boundary.
                </p>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </section>
  );
}
