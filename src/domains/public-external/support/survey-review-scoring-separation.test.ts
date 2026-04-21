import { matchRouteMetadata } from '../../../lib/routing';
import { buildIntegrationCvPath, buildIntegrationFormsPath, buildIntegrationJobPath, runProviderDiagnostics } from '../../integrations/support';
import { buildSurveyReviewScoringTelemetry } from '../../candidates/surveys-custom-fields/support';

describe('survey review scoring public and integration separation', () => {
  it('does not change public/token integration callback route metadata', () => {
    expect(buildIntegrationCvPath({ token: 'valid-token' })).toBe('/integration/cv/valid-token');
    expect(buildIntegrationFormsPath({ token: 'valid-token' })).toBe('/integration/forms/valid-token');
    expect(buildIntegrationJobPath({ token: 'valid-token', action: 'preview' })).toBe('/integration/job/valid-token/preview');

    expect(matchRouteMetadata('/integration/cv/valid-token')?.metadata).toMatchObject({
      routeId: 'integrations.token-entry.cv',
      routeClass: 'Public/Token',
      domain: 'integrations',
      module: 'token-entry',
      directEntry: 'full',
    });
    expect(matchRouteMetadata('/integration/forms/valid-token')?.metadata).toMatchObject({
      routeId: 'integrations.token-entry.forms',
      routeClass: 'Public/Token',
      domain: 'integrations',
      module: 'token-entry',
      directEntry: 'full',
    });
    expect(matchRouteMetadata('/integration/job/valid-token/preview')?.metadata).toMatchObject({
      routeId: 'integrations.token-entry.job',
      routeClass: 'Public/Token',
      domain: 'integrations',
      module: 'token-entry',
      directEntry: 'full',
    });
  });

  it('keeps survey review scoring routes out of authenticated provider setup ownership', () => {
    for (const path of ['/surveys/valid-survey/job-1/cv-1', '/review-candidate/valid-review', '/interview-feedback/valid-feedback']) {
      expect(matchRouteMetadata(path)?.metadata).toMatchObject({ routeClass: 'Public/Token', domain: 'public-external' });
      expect(matchRouteMetadata(path)?.metadata).not.toHaveProperty('requiredCapability', 'canManageIntegrationProvider');
      expect(matchRouteMetadata(path)?.metadata).not.toMatchObject({ routeId: 'integrations.admin.detail', parentTarget: '/integrations' });
    }

    expect(matchRouteMetadata('/integrations/codility')?.metadata).toMatchObject({
      routeId: 'integrations.admin.detail',
      routeClass: 'Page',
      requiredCapability: 'canManageIntegrationProvider',
      parentTarget: '/integrations',
    });
  });

  it('does not leak callback/provider setup payloads through survey review scoring telemetry', () => {
    const assessmentDiagnostics = runProviderDiagnostics({ id: 'codility', name: 'Codility', family: 'assessment', state: 'connected' });
    const surveyEvent = buildSurveyReviewScoringTelemetry({
      routeFamily: 'external-interview-feedback',
      action: 'scoring-refresh',
      operationalState: 'scoring-pending',
      taskContext: 'external-interview-feedback',
      tokenState: 'valid',
      correlationId: 'corr_separation',
    });

    expect(assessmentDiagnostics.telemetry.data).toMatchObject({ providerFamily: 'assessment', section: 'diagnostics' });
    expect(surveyEvent.data).toEqual({
      routeFamily: 'external-interview-feedback',
      action: 'scoring-refresh',
      operationalState: 'scoring-pending',
      taskContext: 'external-interview-feedback',
      tokenState: 'valid',
      terminalOutcome: undefined,
      correlationId: 'corr_separation',
    });
    expect(JSON.stringify(surveyEvent.data)).not.toMatch(/providerFamily|diagnostics|credential|secret|raw|callback|\/integration\//i);
  });
});
