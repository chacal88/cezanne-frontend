import { loadAuthToken } from "../../auth/api/local-session";
import { restApiGetJson } from "../../../lib/api-client";
import type { CandidateDatabaseRouteState } from "../support/candidate-database-routing";

export type CandidateDatabaseApiRow = {
  id: string;
  numericId?: number;
  cvId: string;
  jobId?: string;
  statusId?: string;
  status?: string;
  name: string;
  email: string;
  location: string;
  stage: string;
  tags: string;
  source?: string;
  createdAt?: string;
  score?: number;
  canSchedule: boolean;
  canOffer: boolean;
};

export type CandidateDatabaseApiResult = {
  rows: CandidateDatabaseApiRow[];
  currentPage: number;
  perPage: number;
  total: number;
  from?: number;
  to?: number;
};

type RawCvRow = Record<string, unknown>;

type CvListResponse = {
  data?: RawCvRow[];
  current_page?: number;
  per_page?: number | string;
  total?: number;
  from?: number;
  to?: number;
};

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

function buildCvListPath(state: CandidateDatabaseRouteState): string {
  const params = new URLSearchParams({
    include: "job,job.subsector,job.subsector.sector",
    page: String(state.page),
    per_page: "16",
    scope: "withScore,filterByTags",
  });

  if (state.query) params.set("search", state.query);
  if (state.stage) params.set("status", state.stage);

  return `/v2/cv?${params.toString()}`;
}

function normalizeCvRow(row: RawCvRow): CandidateDatabaseApiRow {
  const numericId = asNumber(row.id);
  const uuid =
    asString(row.uuid) || (numericId ? String(numericId) : "unknown-candidate");
  const firstName = asString(row.first_name);
  const lastName = asString(row.last_name);
  const displayName =
    asString(row.name) ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    `Candidate ${uuid}`;
  const statusId = asString(row.hiring_flow_step_id);
  const status = asString(row.status);
  const source = asString(row.source);
  const score = asNumber(row.total_score);

  return {
    id: uuid,
    numericId,
    cvId: numericId ? String(numericId) : asString(row.cv_id) || uuid,
    jobId: asString(row.job_id) || undefined,
    statusId: statusId || undefined,
    status: status || undefined,
    name: displayName,
    email: asString(row.email),
    location:
      asString(row.city_name) ||
      [asString(row.city_real_city), asString(row.city_real_state)]
        .filter(Boolean)
        .join(", "),
    stage: status || statusId || "—",
    tags: source || "—",
    source: source || undefined,
    createdAt: asString(row.created_at) || undefined,
    score,
    canSchedule: asBoolean(row.is_scheduling),
    canOffer: asBoolean(row.is_offering),
  };
}

export async function fetchCandidateDatabaseRows(
  state: CandidateDatabaseRouteState,
): Promise<CandidateDatabaseApiResult> {
  const token = loadAuthToken();
  if (!token) throw new Error("Missing auth token for candidate database API.");

  const response = await restApiGetJson<CvListResponse>(
    buildCvListPath(state),
    { token, language: "en" },
  );
  const rows = Array.isArray(response.data)
    ? response.data.map(normalizeCvRow)
    : [];
  const currentPage = asNumber(response.current_page) ?? state.page;
  const perPage = asNumber(response.per_page) ?? rows.length;

  return {
    rows,
    currentPage,
    perPage,
    total: asNumber(response.total) ?? rows.length,
    from: asNumber(response.from),
    to: asNumber(response.to),
  };
}
