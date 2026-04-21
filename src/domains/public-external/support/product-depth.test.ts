import { describe, expect, it } from 'vitest';
import { buildPublicTokenSafeTelemetry, resolveExternalParticipantProductState, resolvePublicSubmissionProductState, resolvePublicTokenProductState } from './product-depth';

describe('public/token product-depth state', () => {
  it('models route-specific token and terminal outcomes', () => {
    expect(resolvePublicTokenProductState({ family: 'public-application', tokenState: 'expired' })).toMatchObject({ kind: 'expired' });
    expect(resolvePublicTokenProductState({ family: 'external-review-candidate', tokenState: 'valid', terminalReadOnly: true })).toMatchObject({ kind: 'terminal-read-only' });
    expect(resolvePublicTokenProductState({ family: 'requisition-forms-download', tokenState: 'valid', completed: true })).toMatchObject({ kind: 'already-completed' });
  });

  it('models recoverable public submission and external participant states', () => {
    expect(resolvePublicSubmissionProductState({ stage: 'metadata-persistence', recoverable: true })).toMatchObject({ kind: 'retryable', failedStage: 'metadata-persistence' });
    expect(resolveExternalParticipantProductState({ tokenState: 'used' })).toMatchObject({ kind: 'already-used' });
    expect(resolveExternalParticipantProductState({ retryable: true })).toMatchObject({ kind: 'retryable' });
  });

  it('keeps telemetry safe and shell-free', () => {
    const payload = JSON.stringify(buildPublicTokenSafeTelemetry({ family: 'public-application', action: 'token-failed', outcome: 'expired' }));
    expect(payload).not.toContain('rawToken');
    expect(payload).not.toContain('canEnterShell');
    expect(payload).not.toContain('messageBody');
    expect(payload).not.toContain('surveyAnswer');
    expect(payload).not.toContain('signedUrl');
  });
});
