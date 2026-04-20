export type ReportFamily = 'jobs' | 'hiring-process' | 'teams' | 'candidates' | 'diversity' | 'source';
export type ReportResultState = 'loading' | 'empty' | 'denied' | 'error' | 'data-ready';
export type ReportCommandKind = 'export' | 'schedule';
export type ReportCommandState = 'available' | 'disabled' | 'unavailable' | 'success' | 'failure';

export type ReportFilterState = {
  period: string;
  owner?: string;
  team?: string;
};

export type ReportFamilyDefinition = {
  family: ReportFamily;
  label: string;
  supportsExport: boolean;
  supportsScheduling: boolean;
  betaFlag?: string;
};

export type ReportFamilyViewModel = ReportFamilyDefinition & {
  filters: ReportFilterState;
  resultState: ReportResultState;
  parentTarget: '/report';
  exportCommand: ReportCommandViewModel;
  scheduleCommand: ReportCommandViewModel;
};

export type ReportCommandViewModel = {
  kind: ReportCommandKind;
  state: ReportCommandState;
  message: string;
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

export function isReportFamily(value: string): value is ReportFamily {
  return reportFamilies.some((family) => family.family === value);
}

export function validateReportFilters(search: Record<string, unknown>): ReportFilterState {
  const period = typeof search.period === 'string' && search.period.trim() ? search.period.trim().slice(0, 40) : 'last-30-days';
  const owner = typeof search.owner === 'string' && search.owner.trim() ? search.owner.trim().slice(0, 80) : undefined;
  const team = typeof search.team === 'string' && search.team.trim() ? search.team.trim().slice(0, 80) : undefined;
  return { period, owner, team };
}

export function parseReportFiltersFromUrl(searchValue: string): ReportFilterState {
  const params = new URLSearchParams(searchValue);
  return validateReportFilters(Object.fromEntries(params.entries()));
}

function commandFor(kind: ReportCommandKind, supported: boolean): ReportCommandViewModel {
  if (!supported) return { kind, state: 'unavailable', message: `${kind} is not supported for this report family.` };
  return { kind, state: 'available', message: `${kind} is available.` };
}

export function buildReportFamilyViewModel(family: ReportFamily, filters: Partial<ReportFilterState> = {}): ReportFamilyViewModel {
  const definition = reportFamilies.find((item) => item.family === family) ?? reportFamilies[0];
  const normalizedFilters = validateReportFilters(filters);
  const resultState: ReportResultState = normalizedFilters.period === 'empty' ? 'empty' : 'data-ready';
  return {
    ...definition,
    filters: normalizedFilters,
    resultState,
    parentTarget: reportIndexPath,
    exportCommand: commandFor('export', definition.supportsExport),
    scheduleCommand: commandFor('schedule', definition.supportsScheduling),
  };
}

export function runReportCommand(input: { family: ReportFamily; kind: ReportCommandKind; shouldFail?: boolean }): ReportCommandViewModel {
  const view = buildReportFamilyViewModel(input.family);
  const base = input.kind === 'export' ? view.exportCommand : view.scheduleCommand;
  if (base.state !== 'available') return base;
  if (input.shouldFail) return { kind: input.kind, state: 'failure', message: `${input.kind} failed. Try again.` };
  return { kind: input.kind, state: 'success', message: `${input.kind} completed.` };
}

export function legacyReportCompatibilityTarget(reportId?: string) {
  return reportId ? `/report/${isReportFamily(reportId) ? reportId : 'jobs'}` : reportIndexPath;
}
