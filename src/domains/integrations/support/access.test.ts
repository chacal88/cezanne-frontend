import { describe, expect, it } from 'vitest';
import { evaluateIntegrationTokenEntry } from './access';

describe('integration token access', () => {
  it('keeps provider token entry separate from recruiter-shell capability assumptions', () => {
    const decision = evaluateIntegrationTokenEntry({
      family: 'integration-cv',
      token: 'valid-token',
      workflowType: 'cv-action',
      matchesRouteFamily: true,
      isAvailable: true,
      isReadyForSubmission: true,
    });

    expect(decision.capabilityKey).toBe('canUseIntegrationTokenEntry');
    expect(decision.canProceed).toBe(true);
    expect(decision.readiness).toBe('ready');
  });

  it('keeps completed forms read-only with explicit terminal readiness', () => {
    const decision = evaluateIntegrationTokenEntry({
      family: 'integration-forms',
      token: 'used-token',
      workflowType: 'forms-documents',
      matchesRouteFamily: true,
      isAvailable: true,
      isCompleted: false,
      isReadyForSubmission: true,
    });

    expect(decision.readiness).toBe('completed');
    expect(decision.reason).toContain('forms/documents');
  });

  it('keeps mismatched token families inaccessible', () => {
    const decision = evaluateIntegrationTokenEntry({
      family: 'integration-job',
      token: 'forms-token',
      workflowType: 'job-presentation',
      matchesRouteFamily: false,
      isAvailable: true,
    });

    expect(decision.tokenState).toBe('inaccessible');
    expect(decision.readiness).toBe('token-state');
  });
});
