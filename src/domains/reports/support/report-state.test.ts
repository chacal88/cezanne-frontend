import { buildReportFamilyViewModel, legacyReportCompatibilityTarget, parseReportFiltersFromUrl, runReportCommand } from './report-state';

describe('report foundation state helpers', () => {
  it('sanitizes shared report filters and resolves data-ready state', () => {
    expect(parseReportFiltersFromUrl('?period=last-quarter&owner=alex&team=product')).toEqual({
      period: 'last-quarter',
      owner: 'alex',
      team: 'product',
    });

    expect(buildReportFamilyViewModel('jobs', { period: 'last-quarter', owner: 'alex' })).toMatchObject({
      family: 'jobs',
      resultState: 'data-ready',
      parentTarget: '/report',
      exportCommand: { kind: 'export', state: 'available' },
      scheduleCommand: { kind: 'schedule', state: 'available' },
    });
  });

  it('keeps command availability family-aware while sharing one command contract', () => {
    expect(buildReportFamilyViewModel('diversity').scheduleCommand).toEqual({
      kind: 'schedule',
      state: 'unavailable',
      message: 'schedule is not supported for this report family.',
    });

    expect(runReportCommand({ family: 'jobs', kind: 'export' })).toEqual({ kind: 'export', state: 'success', message: 'export completed.' });
    expect(runReportCommand({ family: 'jobs', kind: 'schedule', shouldFail: true })).toEqual({
      kind: 'schedule',
      state: 'failure',
      message: 'schedule failed. Try again.',
    });
  });

  it('maps legacy aggregate report entries into explicit compatibility targets', () => {
    expect(legacyReportCompatibilityTarget()).toBe('/report');
    expect(legacyReportCompatibilityTarget('hiring-process')).toBe('/report/hiring-process');
    expect(legacyReportCompatibilityTarget('unknown')).toBe('/report/jobs');
  });
});
