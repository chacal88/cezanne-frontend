import { useEffect, useMemo, useState } from 'react';
import { observability } from '../../../app/observability';
import { createCorrelationId, ensureCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { PublicTokenStatePanel } from '../token-state/public-token-state-panel';
import { buildRequisitionFormsDownloadViewModel, runRequisitionFormsDownload, type RequisitionFormsDownloadResult } from './support';

function FormsUnavailablePanel({ state, reason }: { state: 'unavailable' | 'not-found' | 'already-downloaded'; reason?: string }) {
  const title = state === 'not-found' ? 'Forms not found' : state === 'already-downloaded' ? 'Forms already downloaded' : 'Forms unavailable';
  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
      <h1>{title}</h1>
      <p data-testid="requisition-forms-state">{state}</p>
      {reason ? <p>{reason}</p> : null}
    </section>
  );
}

export function RequisitionFormsDownloadPage({ formId, token, download }: { formId: string; token: string; download: boolean }) {
  const [result, setResult] = useState<RequisitionFormsDownloadResult | null>(null);
  const view = useMemo(() => buildRequisitionFormsDownloadViewModel({ formId, token, download }), [download, formId, token]);

  useEffect(() => {
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'requisition_forms_opened',
      data: {
        tokenState: view.access.tokenState,
        readiness: view.access.readiness,
        mode: view.route.mode,
        correlationId: ensureCorrelationId(),
      },
    });
  }, [view.access.readiness, view.access.tokenState, view.route.mode]);

  async function handleDownload() {
    setResult(null);
    setActiveCorrelationId(createCorrelationId());
    observability.telemetry.track({
      name: 'requisition_forms_download_started',
      data: { mode: view.route.mode, correlationId: ensureCorrelationId() },
    });

    const nextResult = await runRequisitionFormsDownload({ view });
    setResult(nextResult);

    if (nextResult.status === 'completed') {
      observability.telemetry.track({
        name: 'requisition_forms_download_completed',
        data: { documentCount: view.documentCount, correlationId: ensureCorrelationId() },
      });
      return;
    }

    if (nextResult.status === 'token-state') {
      observability.telemetry.track({
        name: 'requisition_forms_token_state_resolved',
        data: { tokenState: nextResult.tokenState, correlationId: ensureCorrelationId() },
      });
      return;
    }

    observability.telemetry.track({
      name: 'requisition_forms_download_failed',
      data: { stage: nextResult.stage, retryable: nextResult.retryable, correlationId: ensureCorrelationId() },
    });
  }

  if (view.access.readiness === 'token-state') {
    return <PublicTokenStatePanel family="requisition-forms-download" tokenState={view.access.tokenState} reason={view.access.reason} />;
  }

  if (view.access.readiness === 'already-downloaded') {
    return <PublicTokenStatePanel family="requisition-forms-download" tokenState="used" reason={view.access.reason} />;
  }

  if (view.access.readiness === 'not-found') {
    return <FormsUnavailablePanel state="not-found" reason="The requested requisition forms could not be found." />;
  }

  if (view.access.readiness === 'unavailable') {
    return <FormsUnavailablePanel state="unavailable" reason="The requested requisition forms are not available yet." />;
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'grid', gap: 12 }}>
      <h1>{view.title}</h1>
      <p data-testid="requisition-forms-summary">{view.summary}</p>
      <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: 8 }}>
        <dt>Form id</dt>
        <dd data-testid="requisition-forms-id">{view.route.formId}</dd>
        <dt>Mode</dt>
        <dd data-testid="requisition-forms-mode">{view.route.mode}</dd>
        <dt>File</dt>
        <dd data-testid="requisition-forms-file">{view.fileName}</dd>
        <dt>Documents</dt>
        <dd data-testid="requisition-forms-document-count">{view.documentCount}</dd>
      </dl>
      <button type="button" onClick={handleDownload} disabled={!view.access.canDownload} data-testid="requisition-forms-download-button">
        Download forms
      </button>
      {result?.status === 'failed' ? <p data-testid="requisition-forms-download-error">{result.message}</p> : null}
      {result?.status === 'completed' ? <p data-testid="requisition-forms-download-completed">{result.fileName}</p> : null}
    </section>
  );
}
