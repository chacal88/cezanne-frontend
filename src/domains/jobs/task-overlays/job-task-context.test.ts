import { resolveJobTaskContext } from './job-task-context';
import { buildProviderReadinessSignals } from '../../integrations/support';

describe('resolveJobTaskContext', () => {
  it('preserves job parent return while exposing calendar readiness for schedule actions', () => {
    const [signal] = buildProviderReadinessSignals({ id: 'google-calendar', name: 'Google Calendar', family: 'calendar', state: 'degraded' });

    const context = resolveJobTaskContext({
      kind: 'schedule',
      pathname: '/job/job-1/cv/cv-1/schedule',
      jobId: 'job-1',
      candidateId: 'candidate-1',
      section: 'candidates',
      readinessSignal: signal,
    });

    expect(context.parentTarget).toBe('/job/job-1?section=candidates');
    expect(context.readinessGate).toMatchObject({ canProceed: false, state: 'degraded' });
    expect(context.readinessGate?.setupTarget?.path).toBe('/integrations/google-calendar');
    expect(context.schedulingState).toMatchObject({ kind: 'degraded', routeFamily: 'job', canSubmit: false });
    expect(context.schedulingState?.parentContext.returnTarget).toBe('/job/job-1?section=candidates');
  });

  it('does not attach readiness gates to non-scheduling job tasks', () => {
    const [signal] = buildProviderReadinessSignals({ id: 'google-calendar', name: 'Google Calendar', family: 'calendar', state: 'connected' });

    const context = resolveJobTaskContext({ kind: 'offer', pathname: '/job/job-1/cv/cv-1/offer', jobId: 'job-1', candidateId: 'candidate-1', readinessSignal: signal });

    expect(context.readinessGate).toBeUndefined();
  });
});


  it('attaches job-scoped scheduling ready and success-refresh context without changing parent return', () => {
    const [signal] = buildProviderReadinessSignals({ id: 'google-calendar', name: 'Google Calendar', family: 'calendar', state: 'connected' });

    const context = resolveJobTaskContext({
      kind: 'schedule',
      pathname: '/job/job-1/cv/cv-1/schedule',
      jobId: 'job-1',
      candidateId: 'candidate-1',
      parent: '/job/job-1?section=activity',
      readinessSignal: signal,
      calendarSlots: [{ id: 'slot-1', startsAt: '2026-04-21T13:00:00Z', endsAt: '2026-04-21T13:30:00Z', timeZone: 'UTC', label: 'Tue 13:00' }],
    });

    expect(context.parentTarget).toBe('/job/job-1?section=activity');
    expect(context.schedulingState).toMatchObject({ kind: 'ready', routeFamily: 'job', readinessOutcome: 'ready' });
    expect(context.schedulingState?.parentContext).toMatchObject({ returnTarget: '/job/job-1?section=activity', jobId: 'job-1', candidateId: 'candidate-1' });
  });

it('attaches job-scoped contract signing state to offer overlays without changing parent return', () => {
  const context = resolveJobTaskContext({
    kind: 'offer',
    pathname: '/job/job-1/cv/cv-1/offer',
    jobId: 'job-1',
    candidateId: 'candidate-1',
    parent: '/job/job-1?section=candidates',
  });

  expect(context.parentTarget).toBe('/job/job-1?section=candidates');
  expect(context.contractSigningState).toMatchObject({
    kind: 'ready',
    routeFamily: 'job',
    taskContext: 'job-offer-overlay',
    canSend: true,
    actionTarget: { parentTarget: '/job/job-1?section=candidates', jobId: 'job-1', candidateId: 'candidate-1' },
  });
});
