import { describe, expect, it } from 'vitest';
import { evaluateCapabilities, type AccessContext } from '../../../../lib/access-control';
import { resolveTemplatesRouteState } from './routing';

function buildAccessContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    isAuthenticated: true,
    organizationType: 'hc',
    isAdmin: true,
    isSysAdmin: false,
    pivotEntitlements: ['jobRequisition', 'seeCandidates'],
    subscriptionCapabilities: ['calendarIntegration', 'formsDocs', 'surveys', 'customFields', 'candidateTags', 'reviewRequests', 'interviewFeedback', 'inbox'],
    rolloutFlags: [],
    ...overrides,
  };
}

describe('templates routing helpers', () => {
  it('keeps detail and index inside the templates family', () => {
    const access = buildAccessContext();
    const capabilities = evaluateCapabilities(access);

    expect(resolveTemplatesRouteState({ kind: 'index' }, access, capabilities)).toEqual({
      requested: 'index',
      active: 'index',
      fallbackReason: 'matched',
    });
    expect(resolveTemplatesRouteState({ kind: 'detail', templateId: 'template-1' }, access, capabilities)).toEqual({
      requested: 'detail',
      active: 'detail',
      fallbackReason: 'matched',
    });
  });

  it('falls back to the templates index when a subsection is unavailable', () => {
    const access = buildAccessContext({ isAdmin: false });
    const capabilities = evaluateCapabilities(access);

    expect(resolveTemplatesRouteState({ kind: 'smart-questions' }, access, capabilities)).toEqual({
      requested: 'smart-questions',
      active: 'index',
      fallbackReason: 'fallback_unavailable',
    });
  });
});
