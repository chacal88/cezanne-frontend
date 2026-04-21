import type { PublicRouteFamily, PublicTokenState } from './models';

export type PublicTokenProductStateKind = PublicTokenState | 'not-found' | 'unavailable' | 'already-completed' | 'terminal-read-only';
export type PublicSubmissionProductStateKind = 'validation' | 'upload-handshake' | 'binary-transfer' | 'metadata-persistence' | 'submitting' | 'retryable' | 'completed' | 'unrecoverable-failure';
export type ExternalParticipantProductStateKind = 'ready' | 'sending' | 'submitting' | 'failed' | 'retryable' | 'terminal-read-only' | 'already-used' | 'inaccessible' | 'expired';

export function resolvePublicTokenProductState(input: { family: PublicRouteFamily; tokenState: PublicTokenState; completed?: boolean; terminalReadOnly?: boolean; unavailable?: boolean; notFound?: boolean }) {
  if (input.terminalReadOnly) return { kind: 'terminal-read-only' as const, family: input.family };
  if (input.completed) return { kind: 'already-completed' as const, family: input.family };
  if (input.unavailable) return { kind: 'unavailable' as const, family: input.family };
  if (input.notFound) return { kind: 'not-found' as const, family: input.family };
  return { kind: input.tokenState, family: input.family };
}

export function resolvePublicSubmissionProductState(input: { stage?: PublicSubmissionProductStateKind; recoverable?: boolean; completed?: boolean }) {
  if (input.completed) return { kind: 'completed' as const };
  if (input.recoverable) return { kind: 'retryable' as const, failedStage: input.stage };
  return { kind: input.stage ?? 'validation' };
}

export function resolveExternalParticipantProductState(input: { tokenState?: PublicTokenState; sending?: boolean; submitting?: boolean; failed?: boolean; retryable?: boolean; terminal?: boolean; alreadyUsed?: boolean }) {
  if (input.tokenState === 'expired') return { kind: 'expired' as const };
  if (input.tokenState === 'inaccessible') return { kind: 'inaccessible' as const };
  if (input.alreadyUsed || input.tokenState === 'used') return { kind: 'already-used' as const };
  if (input.terminal) return { kind: 'terminal-read-only' as const };
  if (input.sending) return { kind: 'sending' as const };
  if (input.submitting) return { kind: 'submitting' as const };
  if (input.retryable) return { kind: 'retryable' as const };
  if (input.failed) return { kind: 'failed' as const };
  return { kind: 'ready' as const };
}

export function buildPublicTokenSafeTelemetry(input: { family: PublicRouteFamily; action: string; outcome: string }) {
  return {
    name: 'public_token_product_depth_event' as const,
    data: {
      routeFamily: input.family,
      action: input.action,
      tokenOutcome: input.outcome,
      correlationBoundary: 'public-token',
    },
  };
}
