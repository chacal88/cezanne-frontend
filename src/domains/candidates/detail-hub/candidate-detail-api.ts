import { graphqlRequest } from "../../../lib/api-client";
import { loadAuthToken } from "../../auth/api/local-session";
import type { CandidateRecord } from "../support/store";

const candidateDetailQuery = `query CandidateDetail($candidateUuid: String!) {
  monolith {
    candidate(uuid: $candidateUuid, single: true) {
      id
      uuid
      status
      fullName
      firstName
      lastName
      email
      phone
      profile
      sourceName
      sourceType
      createdAt
      receivedAt
      updatedAt
      totalScore
      questionsScore
      interviewsScore
      hiringFlowStep { id uuid name group }
      location { cityFullName city state country }
      file { name url previews externalPreview }
      tags { name }
      job { id uuid title }
      forms { uuid title sentAt answeredAt }
      documents { uuid title fileName url createdAt }
      interviewForms { code score createdAt interviewedAt }
    }
    candidateComments(uuid: $candidateUuid) { message createdAt }
  }
}`;

type RawCandidateDetail = {
  id?: number | string;
  uuid?: string;
  status?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  profile?: string | null;
  sourceName?: string | null;
  sourceType?: string | null;
  createdAt?: string;
  receivedAt?: string;
  updatedAt?: string;
  totalScore?: number | null;
  questionsScore?: number | null;
  interviewsScore?: number | null;
  hiringFlowStep?: { id?: number | string; uuid?: string; name?: string; group?: string } | null;
  location?: { cityFullName?: string; city?: string; state?: string; country?: string } | null;
  file?: { name?: string; url?: string; previews?: string[] | null; externalPreview?: string | null } | null;
  tags?: Array<{ name?: string }> | null;
  job?: { id?: number | string; uuid?: string; title?: string } | null;
  forms?: Array<{ uuid?: string; title?: string; sentAt?: string | null; answeredAt?: string | null }> | null;
  documents?: Array<{ uuid?: string; title?: string; fileName?: string; url?: string; createdAt?: string }> | null;
  interviewForms?: Array<{ code?: string; score?: number | null; createdAt?: string; interviewedAt?: string | null }> | null;
};

type CandidateDetailGraphqlResponse = {
  data?: {
    monolith?: {
      candidate?: RawCandidateDetail[];
      candidateComments?: Array<{ message?: string; createdAt?: string }>;
    };
  };
};

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function compact(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

function formatLocation(location: RawCandidateDetail["location"]): string {
  if (!location) return "—";
  return (
    location.cityFullName ||
    compact([location.city ?? "", location.state ?? "", location.country ?? ""]).join(", ") ||
    "—"
  );
}

function formatCandidateName(candidate: RawCandidateDetail): string {
  return (
    candidate.fullName ||
    compact([candidate.firstName ?? "", candidate.lastName ?? ""]).join(" ") ||
    `Candidate ${candidate.uuid ?? candidate.id ?? "unknown"}`
  );
}

function buildHeadline(candidate: RawCandidateDetail): string {
  const source = candidate.sourceName || candidate.sourceType || "candidate source";
  const jobTitle = candidate.job?.title;
  if (jobTitle) return `${jobTitle} candidate from ${source}`;
  return `Candidate from ${source}`;
}

export function mapCandidateDetailToRecord(
  candidate: RawCandidateDetail,
  comments: Array<{ message?: string }> = [],
): CandidateRecord {
  const uuid = asString(candidate.uuid) || asString(candidate.id) || "unknown-candidate";
  const numericCvId = asString(candidate.id) || uuid;
  const documents = candidate.documents ?? [];
  const forms = candidate.forms ?? [];
  const interviewForms = candidate.interviewForms ?? [];
  const previewPath =
    candidate.file?.externalPreview ||
    candidate.file?.previews?.[0] ||
    candidate.file?.url ||
    `/assets/${uuid}-cv-v1.pdf`;
  const tags = (candidate.tags ?? [])
    .map((tag) => tag.name ?? "")
    .filter(Boolean);

  return {
    id: uuid,
    cvId: numericCvId,
    name: formatCandidateName(candidate),
    stage: candidate.hiringFlowStep?.name || candidate.status || "—",
    headline: buildHeadline(candidate),
    email: candidate.email ?? "",
    phone: candidate.phone || "—",
    location: formatLocation(candidate.location),
    lastAction: candidate.updatedAt ? `Updated ${candidate.updatedAt}` : "Loaded from candidate API",
    comments: comments.map((comment) => comment.message ?? "").filter(Boolean),
    tags,
    conversationId: `candidate-${uuid}`,
    formsCount: forms.length,
    formsStatus: forms.some((form) => form.answeredAt) ? "answered" : forms.length ? "sent" : "not-started",
    candidateOwnedDocuments: documents.length,
    contractsCount: 0,
    contractsStatus: "not-started",
    interviewsCount: interviewForms.length,
    interviewsStatus: interviewForms.some((form) => form.score !== null && form.score !== undefined) ? "scored" : interviewForms.length ? "pending" : "not-started",
    surveysCount: 0,
    surveysStatus: "not-started",
    customFields: [
      { label: "Job", value: candidate.job?.title ?? "—" },
      { label: "Source", value: candidate.sourceName || candidate.sourceType || "—" },
      { label: "Total score", value: candidate.totalScore === null || candidate.totalScore === undefined ? "—" : String(candidate.totalScore) },
    ],
    cvVersion: 1,
    previewPath,
    downloadPath: candidate.file?.url || previewPath,
    updatedAt: candidate.updatedAt || candidate.receivedAt || candidate.createdAt || new Date().toISOString(),
  };
}

export async function fetchCandidateDetailRecord(candidateId: string): Promise<CandidateRecord> {
  const token = loadAuthToken();
  if (!token) throw new Error("Missing auth token for candidate detail API.");

  const response = await graphqlRequest<CandidateDetailGraphqlResponse>(
    candidateDetailQuery,
    { candidateUuid: candidateId },
    { token, language: "en" },
  );
  const candidate = response.data?.monolith?.candidate?.[0];
  if (!candidate) throw new Error("Candidate detail API returned no candidate.");

  return mapCandidateDetailToRecord(
    candidate,
    response.data?.monolith?.candidateComments ?? [],
  );
}
