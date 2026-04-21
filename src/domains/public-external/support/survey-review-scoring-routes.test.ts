import { resolveCandidateActionContext } from '../../candidates/action-launchers/candidate-action-context';
import { buildInterviewFeedbackViewModel, buildPublicSurveyViewModel, buildReviewCandidateViewModel } from './adapters';
import { runInterviewFeedbackWorkflow, runPublicSurveyCompletion, runReviewCandidateWorkflow } from './workflow';

describe('survey review scoring route consumers', () => {
  it('wires candidate review launchers with parent return and parent refresh intent', () => {
    const context = resolveCandidateActionContext({
      kind: 'reject',
      pathname: '/candidate/candidate-123/job-456/screening/2/remote/interview-1/cv/cv-123/reject',
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
    });

    expect(context.returnTarget).toBe('/candidate/candidate-123/job-456/screening/2/remote/interview-1');
    expect(context.surveyReviewScoringState).toMatchObject({
      kind: 'ready',
      routeFamily: 'candidate-review-launcher',
      parentContext: { returnTarget: context.returnTarget, candidateId: 'candidate-123', jobId: 'job-456' },
    });
  });

  it('blocks candidate review launchers route-locally when schema readiness is missing', () => {
    const context = resolveCandidateActionContext({
      kind: 'reject',
      pathname: '/candidate/candidate-123/cv/cv-123/reject',
      context: { candidateId: 'candidate-123' },
      cvId: 'cv-123',
      entryMode: 'direct',
      reviewReadiness: { schemaReady: false, templateReady: true, reviewerReady: true, tokenBoundary: 'authenticated' },
    });

    expect(context.returnTarget).toBe('/candidate/candidate-123');
    expect(context.surveyReviewScoringState).toMatchObject({ kind: 'schema-required', canSubmit: false });
  });

  it('maps external review candidate readiness and terminal reloads to route-local states', async () => {
    const missing = buildReviewCandidateViewModel({ code: 'valid-missing-schema-review-route' });
    expect(missing.operationalState).toMatchObject({ kind: 'schema-required', canSubmit: false });

    const completed = await runReviewCandidateWorkflow(
      { code: 'valid-review-terminal-route' },
      'Alex Reviewer',
      { score: '4', summary: 'Strong communication', recommendation: 'yes' },
    );
    expect(completed.status).toBe('completed');

    const reloaded = buildReviewCandidateViewModel({ code: 'valid-review-terminal-route' });
    expect(reloaded.completion?.kind).toBe('review-submitted');
    expect(reloaded.operationalState).toMatchObject({ kind: 'read-only', readOnly: true });
  });

  it('maps external interview feedback retry and scoring-pending terminal behavior', async () => {
    const retry = await runInterviewFeedbackWorkflow(
      { code: 'valid-feedback-retry-route' },
      'Jamie Interviewer',
      { score: '5', summary: 'submit-fail summary', recommendation: 'yes' },
    );
    expect(retry).toMatchObject({ status: 'failed', stage: 'submission' });

    const completed = await runInterviewFeedbackWorkflow(
      { code: 'valid-feedback-scoring-route' },
      'Jamie Interviewer',
      { score: '5', summary: 'Clear technical depth', recommendation: 'yes' },
    );
    expect(completed.status).toBe('completed');

    const reloaded = buildInterviewFeedbackViewModel({ code: 'valid-feedback-scoring-route' });
    expect(reloaded.operationalState).toMatchObject({ kind: 'scoring-pending', canRefreshScoring: true, readOnly: true });
  });

  it('maps public survey schema readiness and terminal reloads inside the public boundary', async () => {
    const missing = buildPublicSurveyViewModel({ surveyuuid: 'valid-missing-schema-survey-route', jobuuid: 'job-1', cvuuid: 'cv-1' });
    expect(missing.operationalState).toMatchObject({ kind: 'schema-required', canSubmit: false });

    const completed = await runPublicSurveyCompletion({ surveyuuid: 'valid-survey-terminal-route', jobuuid: 'job-1', cvuuid: 'cv-1' }, 'A safe answer');
    expect(completed.status).toBe('completed');

    const reloaded = buildPublicSurveyViewModel({ surveyuuid: 'valid-survey-terminal-route', jobuuid: 'job-1', cvuuid: 'cv-1' });
    expect(reloaded.completion?.kind).toBe('survey-complete');
    expect(reloaded.operationalState).toMatchObject({ kind: 'read-only', readOnly: true });
  });
});
