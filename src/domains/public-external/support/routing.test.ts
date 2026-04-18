import { describe, expect, it } from 'vitest';
import {
  buildInterviewFeedbackPath,
  buildInterviewRequestPath,
  buildPublicApplicationPath,
  buildPublicSurveyPath,
  buildReviewCandidatePath,
  buildSharedJobPath,
} from './routing';
import { matchRouteMetadata } from '../../../lib/routing';

describe('public routing helpers', () => {
  it('builds canonical public route paths', () => {
    expect(buildSharedJobPath({ jobOrRole: 'designer', token: 'valid-token', source: 'email' })).toBe('/shared/designer/valid-token/email');
    expect(buildPublicApplicationPath({ jobOrRole: 'designer', token: 'valid-token', source: 'email' })).toBe('/designer/application/valid-token/email');
    expect(buildPublicSurveyPath({ surveyuuid: 'survey-1', jobuuid: 'job-1', cvuuid: 'cv-1' })).toBe('/surveys/survey-1/job-1/cv-1');
    expect(buildInterviewRequestPath({ scheduleUuid: 'schedule-1', cvToken: 'valid-token' })).toBe('/interview-request/schedule-1/valid-token');
    expect(buildReviewCandidatePath({ code: 'valid-review' })).toBe('/review-candidate/valid-review');
    expect(buildInterviewFeedbackPath({ code: 'valid-feedback' })).toBe('/interview-feedback/valid-feedback');
  });

  it('registers public route metadata for all first-slice families', () => {
    expect(matchRouteMetadata('/shared/designer/valid-token/email')?.metadata.routeId).toBe('public-external.shared-job');
    expect(matchRouteMetadata('/designer/application/valid-token/email')?.metadata.routeId).toBe('public-external.application');
    expect(matchRouteMetadata('/surveys/survey-1/job-1/cv-1')?.metadata.routeId).toBe('public-external.survey');
    expect(matchRouteMetadata('/interview-request/schedule-1/valid-token')?.metadata.routeId).toBe('public-external.external-review.interview-request');
    expect(matchRouteMetadata('/review-candidate/valid-review')?.metadata.routeId).toBe('public-external.external-review.review-candidate');
    expect(matchRouteMetadata('/interview-feedback/valid-feedback')?.metadata.routeId).toBe('public-external.external-review.interview-feedback');
  });
});
