import { resetCorrelationId, setActiveCorrelationId } from '../../../../lib/observability';
import {
  buildSurveyReviewScoringState,
  buildSurveyReviewScoringTelemetry,
  createSurveyReviewScoringDraft,
  refreshSurveyReviewScoringStatus,
  resolveSurveyReviewScoringSubmitResult,
  retrySurveyReviewScoringSubmit,
  startSurveyReviewScoringSubmit,
  surveyReviewScoringStates,
  validateSurveyReviewScoringDraft,
} from './survey-review-scoring';

describe('survey review scoring operational helpers', () => {
  it('models the required deterministic state set', () => {
    expect(surveyReviewScoringStates).toEqual([
      'loading',
      'ready',
      'schema-required',
      'template-required',
      'reviewer-required',
      'submitting',
      'submitted',
      'submit-failed',
      'partially-submitted',
      'scoring-pending',
      'scored',
      'read-only',
      'token-invalid',
      'token-expired',
      'inaccessible',
      'provider-blocked',
      'degraded',
      'unavailable',
    ]);
  });

  it('separates readiness outcomes from safe draft summaries', () => {
    const schemaRequired = buildSurveyReviewScoringState({
      routeFamily: 'external-review-candidate',
      taskContext: 'external-review-candidate',
      readiness: { tokenBoundary: 'public', tokenState: 'valid', schemaReady: false },
      draft: { answerCount: 3, requiredAnswerCount: 3, hasScore: true, hasRecommendation: true },
    });
    const templateRequired = buildSurveyReviewScoringState({
      routeFamily: 'external-interview-feedback',
      taskContext: 'external-interview-feedback',
      readiness: { tokenBoundary: 'public', tokenState: 'valid', schemaReady: true, templateReady: false },
      draft: { answerCount: 3, requiredAnswerCount: 3 },
    });
    const providerBlocked = buildSurveyReviewScoringState({
      routeFamily: 'candidate-review-launcher',
      taskContext: 'candidate-review-launcher',
      readiness: { tokenBoundary: 'authenticated', schemaReady: true, templateReady: true, reviewerReady: true, providerBlocked: true },
      draft: { answerCount: 1, requiredAnswerCount: 1 },
    });

    expect(schemaRequired).toMatchObject({ kind: 'schema-required', canSubmit: false });
    expect(templateRequired).toMatchObject({ kind: 'template-required', canSubmit: false });
    expect(providerBlocked).toMatchObject({ kind: 'provider-blocked', canSubmit: false });
    expect(JSON.stringify([schemaRequired.draft, templateRequired.readiness])).not.toMatch(/answer text|rubric|providerPayload|raw|token-secret/i);
  });

  it('validates drafts, preserves retry context, and records parent refresh intent for terminal outcomes', () => {
    const ready = buildSurveyReviewScoringState({
      routeFamily: 'candidate-review-launcher',
      taskContext: 'candidate-review-launcher',
      readiness: { tokenBoundary: 'authenticated', schemaReady: true, templateReady: true, reviewerReady: true },
      draft: createSurveyReviewScoringDraft({ answerCount: 1, requiredAnswerCount: 1, hasRecommendation: true }),
      parentContext: { returnTarget: '/candidate/candidate-123', candidateId: 'candidate-123' },
    });
    const invalid = buildSurveyReviewScoringState({
      routeFamily: 'public-survey',
      taskContext: 'public-survey',
      readiness: { tokenBoundary: 'public', tokenState: 'valid', schemaReady: true },
      draft: { answerCount: 0, requiredAnswerCount: 1 },
    });

    expect(validateSurveyReviewScoringDraft(ready)).toBeUndefined();
    expect(validateSurveyReviewScoringDraft(invalid)).toMatchObject({ kind: 'schema-required', canSubmit: false });
    expect(startSurveyReviewScoringSubmit(ready)).toMatchObject({ kind: 'submitting', canSubmit: false });

    const failed = resolveSurveyReviewScoringSubmitResult(ready, 'submit-failed');
    expect(failed).toMatchObject({ kind: 'submit-failed', canRetry: true });
    expect(retrySurveyReviewScoringSubmit(failed)).toMatchObject({ kind: 'ready', canSubmit: true });

    const partial = resolveSurveyReviewScoringSubmitResult(ready, 'partially-submitted');
    expect(partial).toMatchObject({ kind: 'partially-submitted', canRetry: true, terminalOutcome: 'partially-submitted' });

    const submitted = resolveSurveyReviewScoringSubmitResult(ready, 'submitted');
    expect(submitted).toMatchObject({
      kind: 'submitted',
      readOnly: true,
      parentRefresh: { refreshCandidate: true, refreshJob: false, returnTarget: '/candidate/candidate-123' },
    });
  });

  it('supports scoring refresh without claiming scored completion early', () => {
    const pending = buildSurveyReviewScoringState({
      routeFamily: 'external-interview-feedback',
      taskContext: 'external-interview-feedback',
      readiness: { tokenBoundary: 'public', tokenState: 'valid', schemaReady: true, templateReady: true, reviewerReady: true },
      draft: { answerCount: 3, requiredAnswerCount: 3, hasScore: true, hasRecommendation: true },
    });

    const scoringPending = resolveSurveyReviewScoringSubmitResult(pending, 'scoring-pending');
    expect(scoringPending).toMatchObject({ kind: 'scoring-pending', canRefreshScoring: true, terminalOutcome: 'scoring-pending' });
    expect(refreshSurveyReviewScoringStatus(scoringPending, 'scored')).toMatchObject({ kind: 'scored', terminalOutcome: 'scored', readOnly: true });
  });

  it('emits safe allowlisted telemetry only', () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_survey_review_safe');

    const event = buildSurveyReviewScoringTelemetry({
      routeFamily: 'public-survey',
      action: 'terminal-outcome',
      operationalState: 'read-only',
      taskContext: 'public-survey',
      tokenState: 'valid',
      terminalOutcome: 'submitted',
    });

    expect(event).toEqual({
      name: 'survey_review_scoring_action',
      data: {
        routeFamily: 'public-survey',
        action: 'terminal-outcome',
        operationalState: 'read-only',
        taskContext: 'public-survey',
        tokenState: 'valid',
        terminalOutcome: 'submitted',
        correlationId: 'corr_survey_review_safe',
      },
    });
    expect(JSON.stringify(event.data)).not.toMatch(/answer|rubric|private|raw|provider|tenant|callback/i);
  });
});
