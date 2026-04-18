import { buildCancelTarget, buildCloseTarget, buildSuccessTarget } from './navigation-helpers';

describe('navigation helpers', () => {
  it('resolves parent targets from registered job task routes', () => {
    const pathname = '/job/job-123/cv/candidate-456/schedule';

    expect(buildCloseTarget(pathname)).toBe('/job/job-123');
    expect(buildCancelTarget(pathname)).toBe('/job/job-123');
    expect(buildSuccessTarget(pathname)).toBe('/job/job-123');
  });

  it('resolves parent targets from contextual candidate task routes', () => {
    const pathname = '/candidate/candidate-123/job-456/screening/2/remote/interview-1/cv/cv-123/schedule';

    expect(buildCloseTarget(pathname)).toBe('/candidate/candidate-123/job-456/screening/2/remote/interview-1');
    expect(buildCancelTarget(pathname)).toBe('/candidate/candidate-123/job-456/screening/2/remote/interview-1');
    expect(buildSuccessTarget(pathname)).toBe('/candidate/candidate-123/job-456/screening/2/remote/interview-1');
  });

  it('prefers explicit parent targets for routed tasks', () => {
    const pathname = '/job/job-123/cv/candidate-456/offer';
    const explicitParent = '/job/job-123?section=candidates';

    expect(buildCloseTarget(pathname, '/dashboard', explicitParent)).toBe(explicitParent);
  });

  it('falls back to dashboard for unknown routes', () => {
    expect(buildCloseTarget('/not-registered')).toBe('/dashboard');
  });
});
