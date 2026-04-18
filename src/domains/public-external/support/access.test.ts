import { describe, expect, it } from 'vitest';
import { evaluateExternalParticipantAccess, evaluatePublicApplicationAccess, evaluatePublicSurveyAccess, evaluateSharedJobEntry, interpretPublicTokenState } from './access';

describe('public access contracts', () => {
  it('maps token prefixes to canonical token states', () => {
    expect(interpretPublicTokenState('invalid-123')).toBe('invalid');
    expect(interpretPublicTokenState('expired-123')).toBe('expired');
    expect(interpretPublicTokenState('used-123')).toBe('used');
    expect(interpretPublicTokenState('inaccessible-123')).toBe('inaccessible');
    expect(interpretPublicTokenState('valid-token')).toBe('valid');
  });

  it('keeps shared job access separate from recruiter capabilities', () => {
    const decision = evaluateSharedJobEntry({ token: 'valid-token', source: 'email', isAvailable: true });
    expect(decision.capabilityKey).toBe('canOpenSharedJob');
    expect(decision.canProceed).toBe(true);
  });

  it('marks public application completion as a distinct readiness state', () => {
    const decision = evaluatePublicApplicationAccess({ token: 'valid-token', source: 'email', isAvailable: true, isCompleted: true });
    expect(decision.readiness).toBe('completed');
    expect(decision.canProceed).toBe(false);
  });

  it('keeps public survey invalid access visible', () => {
    const decision = evaluatePublicSurveyAccess({ surveyuuid: 'expired-survey', isAvailable: true });
    expect(decision.tokenState).toBe('expired');
    expect(decision.readiness).toBe('token-state');
  });

  it('uses an external-participant access contract for external review flows', () => {
    const decision = evaluateExternalParticipantAccess({
      family: 'external-review-candidate',
      token: 'valid-review',
      workflowType: 'review-form',
      matchesRouteFamily: true,
      isAvailable: true,
      isReadyForSubmission: true,
    });

    expect(decision.capabilityKey).toBe('canUseExternalReviewFlow');
    expect(decision.workflowType).toBe('review-form');
    expect(decision.canProceed).toBe(true);
  });

  it('keeps terminal external review states read-only without recruiter capability keys', () => {
    const decision = evaluateExternalParticipantAccess({
      family: 'external-interview-feedback',
      token: 'used-feedback',
      workflowType: 'feedback-form',
      matchesRouteFamily: true,
      isAvailable: true,
      isReadyForSubmission: true,
    });

    expect(decision.readiness).toBe('completed');
    expect(decision.reason).toContain('submission already completed');
    expect(decision.capabilityKey).toBe('canUseExternalReviewFlow');
  });
});
