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
});
