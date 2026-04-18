import { describe, expect, it } from 'vitest';
import { resetCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { runInterviewFeedbackWorkflow, runInterviewRequestDecisionWorkflow, runPublicApplicationWorkflow, runReviewCandidateWorkflow } from './workflow';
import { resolveExternalReviewNotificationOwnership } from './notification-ownership';

describe('public application workflow', () => {
  it('serializes successful submissions and reuses hardened request headers for uploads', async () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_test_public');

    const result = await runPublicApplicationWorkflow(
      { jobOrRole: 'product-designer', token: 'valid-token', source: 'email' },
      { firstName: 'Alex', email: 'alex@example.com', phone: '', motivation: 'Interested', fileName: 'resume.pdf' },
    );

    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.payload.route.jobOrRole).toBe('product-designer');
    expect(result.uploadedFiles[0]?.requestHeaders['x-correlation-id']).toBe('corr_test_public');
    expect(result.uploadedFiles[0]?.requestHeaders['x-requested-with']).toBe('XMLHttpRequest');
  });

  it('keeps upload failures recoverable inside the route workflow', async () => {
    const result = await runPublicApplicationWorkflow(
      { jobOrRole: 'product-designer', token: 'valid-token', source: 'email' },
      { firstName: 'Alex', email: 'alex@example.com', phone: '', motivation: 'Interested', fileName: 'upload-fail.pdf' },
    );

    expect(result).toEqual({
      status: 'failed',
      stage: 'binary-transfer',
      message: 'Binary upload failed.',
    });
  });
});

describe('external review workflows', () => {
  it('keeps interview request decisions inside the same hardened route workflow', async () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_test_interview_request');

    const result = await runInterviewRequestDecisionWorkflow({ scheduleUuid: 'schedule-1', cvToken: 'valid-token' }, 'Alex Reviewer', 'accept');

    expect(result.status).toBe('completed');
    if (result.status !== 'completed') return;
    expect(result.payload.decision).toBe('accept');
    expect(result.requestHeaders['x-correlation-id']).toBe('corr_test_interview_request');
    expect(result.requestHeaders['x-requested-with']).toBe('XMLHttpRequest');
  });

  it('keeps review and feedback submission failures recoverable', async () => {
    const reviewResult = await runReviewCandidateWorkflow(
      { code: 'valid-review' },
      'Alex Reviewer',
      { score: '4', summary: 'submit-fail summary', recommendation: 'yes' },
    );
    const feedbackResult = await runInterviewFeedbackWorkflow(
      { code: 'valid-feedback' },
      'Jamie Interviewer',
      { score: '5', summary: 'submit-fail summary', recommendation: 'yes' },
    );

    expect(reviewResult).toEqual({
      status: 'failed',
      stage: 'submission',
      message: 'Candidate review submission failed. Try again.',
    });
    expect(feedbackResult).toEqual({
      status: 'failed',
      stage: 'submission',
      message: 'Interview feedback submission failed. Try again.',
    });
  });

  it('serializes external review submissions through dedicated route-facing serializers', async () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_test_external_review');

    const reviewResult = await runReviewCandidateWorkflow(
      { code: 'valid-review' },
      'Alex Reviewer',
      { score: '4', summary: 'Strong communication', recommendation: 'yes' },
    );
    const feedbackResult = await runInterviewFeedbackWorkflow(
      { code: 'valid-feedback' },
      'Jamie Interviewer',
      { score: '5', summary: 'Clear technical depth', recommendation: 'yes' },
    );

    expect(reviewResult.status).toBe('completed');
    expect(feedbackResult.status).toBe('completed');
    if (reviewResult.status !== 'completed' || feedbackResult.status !== 'completed') return;
    expect(reviewResult.payload.schemaVersion).toBe('review-v1');
    expect(feedbackResult.payload.schemaVersion).toBe('feedback-v1');
    expect(reviewResult.requestHeaders['x-correlation-id']).toBe('corr_test_external_review');
    expect(feedbackResult.requestHeaders['x-correlation-id']).toBe('corr_test_external_review');
  });

  it('keeps recruiter notifications on explicit internal ownership rules', () => {
    expect(resolveExternalReviewNotificationOwnership('cv-interview-feedback')).toEqual({
      family: 'cv-interview-feedback',
      owner: 'candidate.detail',
      allowsExternalTokenDestination: false,
      reason: 'Interview feedback notifications remain recruiter-internal until an explicit external destination contract exists.',
    });
    expect(resolveExternalReviewNotificationOwnership('cv-reviewed').allowsExternalTokenDestination).toBe(false);
    expect(resolveExternalReviewNotificationOwnership('user-mentioned').owner).toBe('inbox');
  });
});
