import { withCorrelationHeaders } from '../../../../lib/api-client';
import type { OperationalSettingsMutationState, OperationalSettingsReadiness, OperationalSettingsSubmittingState } from './models';

function headersToRecord(headers: Headers) {
  return Object.fromEntries(headers.entries());
}

export function resolveOperationalSettingsReadiness(input: {
  isLoading?: boolean;
  isBlocked?: boolean;
  isRetryableError?: boolean;
  reason?: string;
}): OperationalSettingsReadiness {
  if (input.isLoading) {
    return { kind: 'loading', canEdit: false, canRetry: false };
  }

  if (input.isBlocked) {
    return { kind: 'blocked', canEdit: false, canRetry: false, reason: input.reason ?? 'This subsection is unavailable.' };
  }

  if (input.isRetryableError) {
    return { kind: 'retryable-error', canEdit: false, canRetry: true, reason: input.reason ?? 'Retry is available.' };
  }

  return { kind: 'ready', canEdit: true, canRetry: false };
}

export function createOperationalSettingsMutationRequest(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'PUT') {
  const request = withCorrelationHeaders({ method });
  return headersToRecord(new Headers(request.headers));
}

export function startOperationalSettingsMutation(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'PUT'): OperationalSettingsSubmittingState {
  return {
    kind: 'submitting',
    canRetry: false,
    requestHeaders: createOperationalSettingsMutationRequest(method),
  };
}

export function completeOperationalSettingsMutationSuccess(
  requestHeaders: Record<string, string>,
  outcome: 'stable' | 'refresh-required' = 'stable',
): OperationalSettingsMutationState {
  return {
    kind: 'success',
    canRetry: false,
    requestHeaders,
    outcome,
  };
}

export function completeOperationalSettingsMutationValidationError(
  requestHeaders: Record<string, string>,
  fieldErrors: string[],
): OperationalSettingsMutationState {
  return {
    kind: 'validation-error',
    canRetry: false,
    requestHeaders,
    fieldErrors,
  };
}

export function completeOperationalSettingsMutationFailure(
  requestHeaders: Record<string, string>,
  reason: string,
): OperationalSettingsMutationState {
  return {
    kind: 'submission-error',
    canRetry: true,
    requestHeaders,
    reason,
  };
}

export async function runOperationalSettingsMutation<T>(options: {
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  execute: (requestHeaders: Record<string, string>) => Promise<
    | { ok: true; outcome?: 'stable' | 'refresh-required'; value: T }
    | { ok: false; type: 'validation'; fieldErrors: string[] }
    | { ok: false; type: 'submission'; reason: string }
  >;
}): Promise<{ state: OperationalSettingsMutationState; value?: T }> {
  const submitting: OperationalSettingsSubmittingState = startOperationalSettingsMutation(options.method);
  const result = await options.execute(submitting.requestHeaders);

  if (result.ok) {
    return {
      state: completeOperationalSettingsMutationSuccess(submitting.requestHeaders, result.outcome ?? 'stable'),
      value: result.value,
    };
  }

  if (result.type === 'validation') {
    return {
      state: completeOperationalSettingsMutationValidationError(submitting.requestHeaders, result.fieldErrors),
    };
  }

  return {
    state: completeOperationalSettingsMutationFailure(submitting.requestHeaders, result.reason),
  };
}
