import { buildProviderReadinessSignals } from '../../integrations/support';
import { resolveCandidateActionContext } from './candidate-action-context';

describe('resolveCandidateActionContext', () => {
  it('preserves the contextual candidate route as the return target by default', () => {
    const context = resolveCandidateActionContext({
      kind: 'schedule',
      pathname: '/candidate/candidate-123/job-456/screening/2/remote/interview-1/cv/cv-123/schedule',
      context: {
        candidateId: 'candidate-123',
        jobId: 'job-456',
        status: 'screening',
        order: '2',
        filters: 'remote',
        interview: 'interview-1',
      },
      cvId: 'cv-123',
      entryMode: 'job',
    });

    expect(context.returnTarget).toBe('/candidate/candidate-123/job-456/screening/2/remote/interview-1');
    expect(context.recoveryTarget).toBe('/candidate/candidate-123/job-456/screening/2/remote/interview-1');
    expect(context.capabilityKey).toBe('canScheduleInterviewFromCandidate');
  });

  it('prefers an explicit parent target when the launcher provides one', () => {
    const context = resolveCandidateActionContext({
      kind: 'offer',
      pathname: '/candidate/candidate-123/cv/cv-123/offer',
      context: { candidateId: 'candidate-123' },
      cvId: 'cv-123',
      parent: '/candidate/candidate-123/job-456/screening/2/remote/interview-1',
      entryMode: 'notification',
    });

    expect(context.returnTarget).toBe('/candidate/candidate-123/job-456/screening/2/remote/interview-1');
    expect(context.recoveryTarget).toBe('/candidate/candidate-123');
    expect(context.capabilityKey).toBe('canCreateOfferFromCandidate');
  });

  it('keeps database-origin detail search as the explicit task return target', () => {
    const context = resolveCandidateActionContext({
      kind: 'offer',
      pathname: '/candidate/candidate-123/cv/cv-123/offer',
      context: { candidateId: 'candidate-123' },
      cvId: 'cv-123',
      parent: '/candidate/candidate-123?entry=database&returnTo=%2Fcandidates-database%3Fquery%3Dalex%26page%3D2',
      entryMode: 'database',
    });

    expect(context.returnTarget).toBe('/candidate/candidate-123?entry=database&returnTo=%2Fcandidates-database%3Fquery%3Dalex%26page%3D2');
    expect(context.recoveryTarget).toBe('/candidate/candidate-123');
  });

  it('preserves candidate direct entry while exposing calendar readiness for schedule actions', () => {
    const [signal] = buildProviderReadinessSignals({ id: 'google-calendar', name: 'Google Calendar', family: 'calendar', state: 'unavailable' });
    const context = resolveCandidateActionContext({
      kind: 'schedule',
      pathname: '/candidate/candidate-123/cv/cv-123/schedule',
      context: { candidateId: 'candidate-123' },
      cvId: 'cv-123',
      entryMode: 'direct',
      readinessSignal: signal,
    });

    expect(context.returnTarget).toBe('/candidate/candidate-123');
    expect(context.readinessGate).toMatchObject({ canProceed: false, state: 'unavailable' });
    expect(context.readinessGate?.setupTarget).toBeUndefined();
    expect(context.schedulingState).toMatchObject({ kind: 'unavailable', routeFamily: 'candidate', canSubmit: false });
    expect(context.schedulingState?.parentContext.returnTarget).toBe('/candidate/candidate-123');
  });
});


  it('attaches candidate-scoped scheduling ready state while preserving direct-entry recovery and parent return', () => {
    const [signal] = buildProviderReadinessSignals({ id: 'google-calendar', name: 'Google Calendar', family: 'calendar', state: 'connected' });
    const context = resolveCandidateActionContext({
      kind: 'schedule',
      pathname: '/candidate/candidate-123/job-456/screening/2/remote/interview-1/cv/cv-123/schedule',
      context: {
        candidateId: 'candidate-123',
        jobId: 'job-456',
        status: 'screening',
        order: '2',
        filters: 'remote',
        interview: 'interview-1',
      },
      cvId: 'cv-123',
      entryMode: 'direct',
      parent: '/candidate/candidate-123/job-456/screening/2/remote/interview-1',
      readinessSignal: signal,
      calendarSlots: [{ id: 'slot-1', startsAt: '2026-04-21T13:00:00Z', endsAt: '2026-04-21T13:30:00Z', timeZone: 'UTC', label: 'Tue 13:00' }],
    });

    expect(context.returnTarget).toBe('/candidate/candidate-123/job-456/screening/2/remote/interview-1');
    expect(context.recoveryTarget).toBe('/candidate/candidate-123/job-456/screening/2/remote/interview-1');
    expect(context.schedulingState).toMatchObject({ kind: 'ready', routeFamily: 'candidate', readinessOutcome: 'ready' });
    expect(context.schedulingState?.parentContext).toMatchObject({ returnTarget: context.returnTarget, recoveryTarget: context.recoveryTarget, candidateId: 'candidate-123', jobId: 'job-456' });
  });

it('attaches candidate-scoped contract signing state to offer launchers while preserving parent return', () => {
  const context = resolveCandidateActionContext({
    kind: 'offer',
    pathname: '/candidate/candidate-123/cv/cv-123/offer',
    context: { candidateId: 'candidate-123' },
    cvId: 'cv-123',
    parent: '/candidate/candidate-123?entry=database&returnTo=%2Fcandidates-database',
    entryMode: 'database',
  });

  expect(context.returnTarget).toBe('/candidate/candidate-123?entry=database&returnTo=%2Fcandidates-database');
  expect(context.contractSigningState).toMatchObject({
    kind: 'ready',
    routeFamily: 'candidate',
    taskContext: 'candidate-offer-launcher',
    canSend: true,
    actionTarget: { parentTarget: context.returnTarget, candidateId: 'candidate-123' },
  });
});
