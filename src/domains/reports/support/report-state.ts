export type ReportFamily = 'jobs' | 'hiring-process' | 'teams' | 'candidates' | 'diversity' | 'source';
export type ReportResultState = 'loading' | 'ready' | 'empty' | 'denied' | 'unavailable' | 'degraded' | 'partial' | 'stale' | 'retryable' | 'unsupported';
export type ReportCommandKind = 'export' | 'schedule';
export type ReportCommandState = 'available' | 'unsupported' | 'blocked' | 'submitting' | 'scheduled' | 'exported' | 'failed' | 'retryable' | 'stale-result' | 'partial-result';
export type ReportCapabilityOutcome = 'allowed' | 'denied' | 'unsupported';

export type ReportFilterState = {
  period: string;
  owner?: string;
  team?: string;
  result?: ReportResultState;
  command?: ReportCommandState;
};

export type ReportFamilyDefinition = {
  family: ReportFamily;
  label: string;
  supportsExport: boolean;
  supportsScheduling: boolean;
  betaFlag?: string;
};

export type ReportResultPayload = {
  state: ReportResultState;
  message: string;
  rowsKnown: boolean;
  unknownContractFields: string[];
  refreshIntent?: 'initial-load' | 'manual-refresh' | 'retry' | 'fallback-to-index';
};

export type ReportCommandViewModel = {
  kind: ReportCommandKind;
  state: ReportCommandState;
  message: string;
};

export type ReportFamilyViewModel = ReportFamilyDefinition & {
  filters: ReportFilterState;
  result: ReportResultPayload;
  resultState: ReportResultState;
  parentTarget: '/report';
  exportCommand: ReportCommandViewModel;
  scheduleCommand: ReportCommandViewModel;
  telemetry: ReportTelemetryPayload;
};

export type ReportAdapterInput = {
  family: ReportFamilyDefinition;
  filters: ReportFilterState;
};

export type ReportResultAdapter = (input: ReportAdapterInput) => ReportResultPayload;
export type ReportCommandAdapter = (input: ReportAdapterInput & { kind: ReportCommandKind }) => ReportCommandViewModel;

export type ReportTelemetryPayload = {
  routeId: 'reports.index' | 'reports.family' | 'reports.legacy.compat';
  familyId?: ReportFamily;
  commandKind?: ReportCommandKind;
  resultState?: ReportResultState;
  capabilityOutcome: ReportCapabilityOutcome;
  safeFilterSummary: {
    period: string;
    hasOwnerFilter: boolean;
    hasTeamFilter: boolean;
    requestedResultState?: ReportResultState;
    requestedCommandState?: ReportCommandState;
  };
};

export const reportIndexPath = '/report' as const;
export const legacyReportIndexPath = '/hiring-company/report' as const;

export const reportFamilies: ReportFamilyDefinition[] = [
  { family: 'jobs', label: 'Jobs report', supportsExport: true, supportsScheduling: true },
  { family: 'hiring-process', label: 'Hiring process report', supportsExport: true, supportsScheduling: true },
  { family: 'teams', label: 'Teams report', supportsExport: true, supportsScheduling: true },
  { family: 'candidates', label: 'Candidates report', supportsExport: true, supportsScheduling: true },
  { family: 'diversity', label: 'Diversity report', supportsExport: true, supportsScheduling: false, betaFlag: 'surveysBeta' },
  { family: 'source', label: 'Source report', supportsExport: true, supportsScheduling: false, betaFlag: 'sourceReportsBeta' },
];

const reportResultStates: ReportResultState[] = ['loading', 'ready', 'empty', 'denied', 'unavailable', 'degraded', 'partial', 'stale', 'retryable', 'unsupported'];
const commandStates: ReportCommandState[] = ['available', 'unsupported', 'blocked', 'submitting', 'scheduled', 'exported', 'failed', 'retryable', 'stale-result', 'partial-result'];
const knownPeriods = new Set(['today', 'last-7-days', 'last-30-days', 'last-quarter', 'empty']);

export function isReportFamily(value: string): value is ReportFamily {
  return reportFamilies.some((family) => family.family === value);
}

export function isReportResultState(value: string): value is ReportResultState {
  return reportResultStates.includes(value as ReportResultState);
}

export function isReportCommandState(value: string): value is ReportCommandState {
  return commandStates.includes(value as ReportCommandState);
}

function safePeriod(value: string) {
  return knownPeriods.has(value) ? value : 'custom';
}

export function validateReportFilters(search: Record<string, unknown>): ReportFilterState {
  const period = typeof search.period === 'string' && search.period.trim() ? search.period.trim().slice(0, 40) : 'last-30-days';
  const owner = typeof search.owner === 'string' && search.owner.trim() ? search.owner.trim().slice(0, 80) : undefined;
  const team = typeof search.team === 'string' && search.team.trim() ? search.team.trim().slice(0, 80) : undefined;
  const result = typeof search.result === 'string' && isReportResultState(search.result) ? search.result : undefined;
  const command = typeof search.command === 'string' && isReportCommandState(search.command) ? search.command : undefined;
  return { period, owner, team, result, command };
}

export function parseReportFiltersFromUrl(searchValue: string): ReportFilterState {
  const params = new URLSearchParams(searchValue);
  return validateReportFilters(Object.fromEntries(params.entries()));
}

export function buildSafeReportTelemetryPayload(input: {
  routeId: ReportTelemetryPayload['routeId'];
  familyId?: ReportFamily;
  commandKind?: ReportCommandKind;
  resultState?: ReportResultState;
  capabilityOutcome: ReportCapabilityOutcome;
  filters: ReportFilterState;
}): ReportTelemetryPayload {
  return {
    routeId: input.routeId,
    familyId: input.familyId,
    commandKind: input.commandKind,
    resultState: input.resultState,
    capabilityOutcome: input.capabilityOutcome,
    safeFilterSummary: {
      period: safePeriod(input.filters.period),
      hasOwnerFilter: Boolean(input.filters.owner),
      hasTeamFilter: Boolean(input.filters.team),
      requestedResultState: input.filters.result,
      requestedCommandState: input.filters.command,
    },
  };
}

function resultMessage(state: ReportResultState) {
  const messages: Record<ReportResultState, string> = {
    loading: 'Loading report results.',
    ready: 'Report results are ready.',
    empty: 'No report results match these filters.',
    denied: 'You do not have access to this report family.',
    unavailable: 'This report family is temporarily unavailable.',
    degraded: 'Report results are degraded. Refresh to request the latest data.',
    partial: 'Partial report results are available. Refresh to complete the report.',
    stale: 'Report results may be stale. Refresh before acting on them.',
    retryable: 'Report loading failed but can be retried.',
    unsupported: 'This report family is not supported for your workspace.',
  };
  return messages[state];
}

export const fixtureReportResultAdapter: ReportResultAdapter = ({ family, filters }) => {
  const state = filters.result ?? (filters.period === 'empty' ? 'empty' : 'ready');
  return {
    state,
    message: resultMessage(state),
    rowsKnown: state === 'ready' || state === 'empty',
    unknownContractFields: ['backendResultSchema', 'rowDimensions', 'metricDefinitions'],
    refreshIntent: state === 'loading' ? 'initial-load' : state === 'unsupported' || state === 'unavailable' ? 'fallback-to-index' : state === 'retryable' ? 'retry' : state === 'partial' || state === 'degraded' || state === 'stale' ? 'manual-refresh' : undefined,
  };
};

export const fixtureReportCommandAdapter: ReportCommandAdapter = ({ family, filters, kind }) => {
  const supported = kind === 'export' ? family.supportsExport : family.supportsScheduling;
  if (!supported) return { kind, state: 'unsupported', message: `${kind} is not supported for this report family.` };
  if (filters.result === 'denied') return { kind, state: 'blocked', message: `${kind} is blocked until report access is restored.` };
  if (filters.result === 'stale') return { kind, state: 'stale-result', message: `${kind} needs a refreshed result before submission.` };
  if (filters.result === 'partial' || filters.result === 'degraded') return { kind, state: 'partial-result', message: `${kind} is waiting for complete report results.` };
  return { kind, state: filters.command ?? 'available', message: `${kind} is available.` };
};

export function buildReportFamilyViewModel(
  family: ReportFamily,
  filters: Partial<ReportFilterState> = {},
  adapters: { resultAdapter?: ReportResultAdapter; commandAdapter?: ReportCommandAdapter } = {},
): ReportFamilyViewModel {
  const definition = reportFamilies.find((item) => item.family === family) ?? reportFamilies[0];
  const normalizedFilters = validateReportFilters(filters);
  const result = (adapters.resultAdapter ?? fixtureReportResultAdapter)({ family: definition, filters: normalizedFilters });
  const adapterInput = { family: definition, filters: normalizedFilters };
  return {
    ...definition,
    filters: normalizedFilters,
    result,
    resultState: result.state,
    parentTarget: reportIndexPath,
    exportCommand: (adapters.commandAdapter ?? fixtureReportCommandAdapter)({ ...adapterInput, kind: 'export' }),
    scheduleCommand: (adapters.commandAdapter ?? fixtureReportCommandAdapter)({ ...adapterInput, kind: 'schedule' }),
    telemetry: buildSafeReportTelemetryPayload({
      routeId: 'reports.family',
      familyId: definition.family,
      resultState: result.state,
      capabilityOutcome: result.state === 'denied' ? 'denied' : result.state === 'unsupported' ? 'unsupported' : 'allowed',
      filters: normalizedFilters,
    }),
  };
}

export function runReportCommand(input: { family: ReportFamily; kind: ReportCommandKind; shouldFail?: boolean; filters?: Partial<ReportFilterState> }): ReportCommandViewModel {
  const view = buildReportFamilyViewModel(input.family, input.filters);
  const base = input.kind === 'export' ? view.exportCommand : view.scheduleCommand;
  if (base.state !== 'available') return base;
  if (input.shouldFail) return { kind: input.kind, state: 'retryable', message: `${input.kind} failed. Try again.` };
  return input.kind === 'export'
    ? { kind: input.kind, state: 'exported', message: 'export completed.' }
    : { kind: input.kind, state: 'scheduled', message: 'schedule completed.' };
}

export function legacyReportCompatibilityTarget(reportId?: string) {
  return reportId ? `/report/${isReportFamily(reportId) ? reportId : 'jobs'}` : reportIndexPath;
}
