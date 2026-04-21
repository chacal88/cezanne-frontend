import { matchRouteMetadata } from '../../../lib/routing';
import { buildIntegrationCvPath, buildIntegrationFormsPath, buildIntegrationJobPath } from '../../integrations/support';
import { buildInterviewRequestPath } from '../../public-external/support';
import { buildInitialCalendarSchedulingState } from './calendar-scheduling';

describe('calendar scheduling public/token route separation', () => {
  it('keeps authenticated scheduling depth separate from public/token integration and interview-request routes', () => {
    const state = buildInitialCalendarSchedulingState({
      parentContext: { routeFamily: 'job', returnTarget: '/job/job-1', jobId: 'job-1', candidateId: 'candidate-1' },
      slots: [{ id: 'slot-1', startsAt: '2026-04-21T13:00:00Z', endsAt: '2026-04-21T13:30:00Z', timeZone: 'UTC', label: 'Tue 13:00' }],
    });

    expect(state.routeFamily).toBe('job');
    expect(buildIntegrationCvPath({ token: 'valid-token' })).toBe('/integration/cv/valid-token');
    expect(buildIntegrationFormsPath({ token: 'valid-token' })).toBe('/integration/forms/valid-token');
    expect(buildIntegrationJobPath({ token: 'valid-token', action: 'preview' })).toBe('/integration/job/valid-token/preview');
    expect(buildInterviewRequestPath({ scheduleUuid: 'schedule-1', cvToken: 'valid-token' })).toBe('/interview-request/schedule-1/valid-token');
    expect(matchRouteMetadata('/integration/cv/valid-token')?.metadata.routeClass).toBe('Public/Token');
    expect(matchRouteMetadata('/interview-request/schedule-1/valid-token')?.metadata).toMatchObject({
      routeId: 'public-external.external-review.interview-request',
      routeClass: 'Public/Token',
    });
  });
});
