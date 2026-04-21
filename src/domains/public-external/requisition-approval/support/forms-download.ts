import { withCorrelationHeaders } from '../../../../lib/api-client';
import { interpretPublicTokenState, type PublicTokenState } from '../../support';

export type RequisitionFormsDownloadMode = 'view' | 'download';
export type RequisitionFormsReadiness = 'ready' | 'token-state' | 'unavailable' | 'already-downloaded' | 'not-found' | 'download-failed' | 'downloaded';

export type RequisitionFormsDownloadSearch = {
  token: string;
  download: boolean;
};

export type RequisitionFormsAccess = {
  capabilityKey: 'canDownloadRequisitionFormsByToken';
  tokenState: PublicTokenState;
  readiness: Exclude<RequisitionFormsReadiness, 'download-failed' | 'downloaded'>;
  canView: boolean;
  canDownload: boolean;
  reason?: string;
};

export type RequisitionFormsDownloadViewModel = {
  route: {
    formId: string;
    token: string;
    mode: RequisitionFormsDownloadMode;
  };
  access: RequisitionFormsAccess;
  title: string;
  summary: string;
  fileName: string;
  documentCount: number;
};

export type RequisitionFormsDownloadResult =
  | {
      status: 'completed';
      fileName: string;
      requestHeaders: Record<string, string>;
    }
  | {
      status: 'failed';
      stage: 'access' | 'download';
      message: string;
      retryable: boolean;
    }
  | {
      status: 'token-state';
      tokenState: PublicTokenState;
      message: string;
    };

function headersToRecord(headers: Headers) {
  return Object.fromEntries(headers.entries());
}

export function validateRequisitionFormsDownloadSearch(search: Record<string, unknown>): RequisitionFormsDownloadSearch {
  const rawDownload = search.download;
  const download = rawDownload === '' || rawDownload === true || rawDownload === 'true' || rawDownload === '1';

  return {
    token: typeof search.token === 'string' ? search.token : '',
    download,
  };
}

export function buildRequisitionFormsDownloadPath(input: { formId: string; token?: string; download?: boolean }) {
  const params = new URLSearchParams();
  if (input.token) params.set('token', input.token);
  if (input.download) params.set('download', 'true');
  const search = params.toString();
  return `/job-requisition-forms/${input.formId}${search ? `?${search}` : ''}`;
}

export function evaluateRequisitionFormsDownloadAccess(input: { formId: string; token: string; isAvailable?: boolean }): RequisitionFormsAccess {
  const normalizedFormId = input.formId.trim().toLowerCase();
  const normalizedToken = input.token.trim() || 'invalid-missing-token';
  const tokenState = interpretPublicTokenState(normalizedToken);

  if (tokenState === 'used' || normalizedToken.toLowerCase().startsWith('downloaded')) {
    return {
      capabilityKey: 'canDownloadRequisitionFormsByToken',
      tokenState: 'used',
      readiness: 'already-downloaded',
      canView: false,
      canDownload: false,
      reason: 'already-downloaded',
    };
  }

  if (tokenState !== 'valid') {
    return {
      capabilityKey: 'canDownloadRequisitionFormsByToken',
      tokenState,
      readiness: 'token-state',
      canView: false,
      canDownload: false,
      reason: tokenState,
    };
  }

  if (!normalizedFormId || normalizedFormId.includes('not-found') || normalizedFormId.includes('missing')) {
    return {
      capabilityKey: 'canDownloadRequisitionFormsByToken',
      tokenState,
      readiness: 'not-found',
      canView: false,
      canDownload: false,
      reason: 'not-found',
    };
  }

  if (input.isAvailable === false || normalizedFormId.includes('unavailable') || normalizedToken.toLowerCase().includes('unavailable')) {
    return {
      capabilityKey: 'canDownloadRequisitionFormsByToken',
      tokenState,
      readiness: 'unavailable',
      canView: true,
      canDownload: false,
      reason: 'unavailable',
    };
  }

  return {
    capabilityKey: 'canDownloadRequisitionFormsByToken',
    tokenState,
    readiness: 'ready',
    canView: true,
    canDownload: true,
  };
}

export function buildRequisitionFormsDownloadViewModel(input: { formId: string; token: string; download: boolean }): RequisitionFormsDownloadViewModel {
  const access = evaluateRequisitionFormsDownloadAccess({ formId: input.formId, token: input.token });
  const label = input.formId || 'unknown-form';

  return {
    route: {
      formId: input.formId,
      token: input.token,
      mode: input.download ? 'download' : 'view',
    },
    access,
    title: input.download ? 'Download requisition forms' : 'Requisition forms',
    summary: 'This public forms route owns token validation, document availability, explicit download action, and retryable download failures.',
    fileName: `${label}.pdf`,
    documentCount: label.toLowerCase().includes('bundle') ? 3 : 1,
  };
}

export async function runRequisitionFormsDownload(input: { view: RequisitionFormsDownloadViewModel }): Promise<RequisitionFormsDownloadResult> {
  if (input.view.access.readiness === 'token-state') {
    return {
      status: 'token-state',
      tokenState: input.view.access.tokenState,
      message: `Download cannot continue because the token state is ${input.view.access.tokenState}.`,
    };
  }

  if (!input.view.access.canDownload) {
    return {
      status: 'failed',
      stage: 'access',
      message: input.view.access.reason === 'not-found' ? 'The requested requisition forms were not found.' : 'The requisition forms are not available for download.',
      retryable: false,
    };
  }

  if (input.view.route.formId.toLowerCase().includes('download-fail') || input.view.route.token.toLowerCase().includes('download-fail')) {
    return {
      status: 'failed',
      stage: 'download',
      message: 'The requisition forms download failed. Try again.',
      retryable: true,
    };
  }

  const request = withCorrelationHeaders({ method: 'GET' });
  return {
    status: 'completed',
    fileName: input.view.fileName,
    requestHeaders: headersToRecord(new Headers(request.headers)),
  };
}
