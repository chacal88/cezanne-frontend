import { afterEach, describe, expect, it, vi } from 'vitest';
import { dashboardOverviewQuery, loadDashboardOverview, normalizeDashboardGraphqlResponse } from './dashboard-api';

describe('dashboard API adapter', () => {
  afterEach(() => vi.restoreAllMocks());

  it('normalizes the validated dashboard GraphQL aggregate', () => {
    expect(normalizeDashboardGraphqlResponse({ data: { dashboard: { liveJobsUuids: ['j1'], liveJobsCount: 1, liveCvsCount: 2, liveInterviewsScheduledCount: 3 }, monolith: { users: [{ uuid: 'u1', firstName: 'Ada' }], auth: { firstName: 'Ada', occupopEmailConfirmed: false, occupopEmailConfirmationLink: 'https://confirm.test', calendarIntegration: { status: 'connected' } } } } })).toMatchObject({
      liveJobsUuids: ['j1'],
      liveJobsCount: 1,
      liveCvsCount: 2,
      liveInterviewsScheduledCount: 3,
      users: [{ uuid: 'u1', firstName: 'Ada' }],
      auth: { firstName: 'Ada', occupopEmailConfirmed: false },
      calendarIntegrationState: 'ready',
    });
  });

  it('uses shared GraphQL transport with bearer token and language headers', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ data: { dashboard: { liveJobsCount: 4, liveCvsCount: 5, liveInterviewsScheduledCount: 6 }, monolith: { auth: { firstName: 'Kai' } } } }), { status: 200 }));

    await expect(loadDashboardOverview('dashboard-token')).resolves.toMatchObject({ liveJobsCount: 4, auth: { firstName: 'Kai' } });

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get('authorization')).toBe('Bearer dashboard-token');
    expect(headers.get('content-language')).toBe('en');
    expect(JSON.parse(String(init.body)).query).toBe(dashboardOverviewQuery);
  });
});
