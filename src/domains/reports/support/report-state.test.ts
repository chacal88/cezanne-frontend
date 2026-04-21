import {
  buildReportFamilyViewModel,
  buildSafeReportTelemetryPayload,
  legacyReportCompatibilityTarget,
  parseReportFiltersFromUrl,
  reportFamilies,
  runReportCommand,
  type ReportCommandState,
  type ReportResultState,
} from './report-state';

describe('report product-depth state helpers', () => {
  it('maps report families, shared filters, export support, and schedule support', () => {
    expect(reportFamilies.map((family) => family.family)).toEqual(['jobs', 'hiring-process', 'teams', 'candidates', 'diversity', 'source']);
    expect(parseReportFiltersFromUrl('?period=last-quarter&owner=alex&team=product')).toEqual({
      period: 'last-quarter',
      owner: 'alex',
      team: 'product',
      result: undefined,
      command: undefined,
    });

    expect(buildReportFamilyViewModel('jobs', { period: 'last-quarter', owner: 'alex' })).toMatchObject({
      family: 'jobs',
      resultState: 'ready',
      parentTarget: '/report',
      exportCommand: { kind: 'export', state: 'available' },
      scheduleCommand: { kind: 'schedule', state: 'available' },
    });
    expect(buildReportFamilyViewModel('diversity').scheduleCommand).toEqual({
      kind: 'schedule',
      state: 'unsupported',
      message: 'schedule is not supported for this report family.',
    });
  });

  it.each<ReportResultState>(['loading', 'ready', 'empty', 'denied', 'unavailable', 'degraded', 'partial', 'stale', 'retryable', 'unsupported'])(
    'renders %s as a route-owned result state without pretending backend contracts are known',
    (result) => {
      const view = buildReportFamilyViewModel('jobs', { result });

      expect(view.resultState).toBe(result);
      expect(view.result.message).toEqual(expect.any(String));
      expect(view.result.unknownContractFields).toEqual(['backendResultSchema', 'rowDimensions', 'metricDefinitions']);
      expect(view.telemetry).toMatchObject({ routeId: 'reports.family', familyId: 'jobs', resultState: result });
    },
  );

  it('keeps result and command adapters replaceable', () => {
    const view = buildReportFamilyViewModel(
      'jobs',
      { period: 'last-7-days' },
      {
        resultAdapter: () => ({ state: 'degraded', message: 'Adapter degraded.', rowsKnown: false, unknownContractFields: ['adapterField'], refreshIntent: 'manual-refresh' }),
        commandAdapter: ({ kind }) => ({ kind, state: 'blocked', message: 'Adapter blocked.' }),
      },
    );

    expect(view.result).toMatchObject({ state: 'degraded', unknownContractFields: ['adapterField'] });
    expect(view.exportCommand).toEqual({ kind: 'export', state: 'blocked', message: 'Adapter blocked.' });
    expect(view.scheduleCommand).toEqual({ kind: 'schedule', state: 'blocked', message: 'Adapter blocked.' });
  });

  it.each<ReportCommandState>(['available', 'unsupported', 'blocked', 'submitting', 'scheduled', 'exported', 'failed', 'retryable', 'stale-result', 'partial-result'])(
    'models %s command lifecycle state',
    (command) => {
      const view = buildReportFamilyViewModel('jobs', { command });
      expect(view.exportCommand.state).toBe(command);
      expect(view.scheduleCommand.state).toBe(command);
    },
  );

  it('derives command states from result state and command execution outcome', () => {
    expect(buildReportFamilyViewModel('jobs', { result: 'stale' }).exportCommand.state).toBe('stale-result');
    expect(buildReportFamilyViewModel('jobs', { result: 'partial' }).scheduleCommand.state).toBe('partial-result');
    expect(runReportCommand({ family: 'jobs', kind: 'export' })).toEqual({ kind: 'export', state: 'exported', message: 'export completed.' });
    expect(runReportCommand({ family: 'jobs', kind: 'schedule' })).toEqual({ kind: 'schedule', state: 'scheduled', message: 'schedule completed.' });
    expect(runReportCommand({ family: 'jobs', kind: 'schedule', shouldFail: true })).toEqual({
      kind: 'schedule',
      state: 'retryable',
      message: 'schedule failed. Try again.',
    });
  });

  it('emits only allowlisted report telemetry fields', () => {
    const telemetry = buildSafeReportTelemetryPayload({
      routeId: 'reports.family',
      familyId: 'jobs',
      commandKind: 'export',
      resultState: 'ready',
      capabilityOutcome: 'allowed',
      filters: { period: 'custom-range:tenant-123', owner: 'alex@example.com', team: 'executive-search' },
    });

    expect(telemetry).toEqual({
      routeId: 'reports.family',
      familyId: 'jobs',
      commandKind: 'export',
      resultState: 'ready',
      capabilityOutcome: 'allowed',
      safeFilterSummary: {
        period: 'custom',
        hasOwnerFilter: true,
        hasTeamFilter: true,
        requestedResultState: undefined,
        requestedCommandState: undefined,
      },
    });
    expect(JSON.stringify(telemetry)).not.toContain('alex@example.com');
    expect(JSON.stringify(telemetry)).not.toContain('executive-search');
    expect(JSON.stringify(telemetry)).not.toContain('tenant-123');
  });

  it('maps legacy aggregate report entries into explicit compatibility targets', () => {
    expect(legacyReportCompatibilityTarget()).toBe('/report');
    expect(legacyReportCompatibilityTarget('hiring-process')).toBe('/report/hiring-process');
    expect(legacyReportCompatibilityTarget('unknown')).toBe('/report/jobs');
  });
});
