import { resetCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import {
  buildContractActionTarget,
  buildContractDownstreamHandoff,
  buildContractSigningState,
  buildContractSigningTelemetry,
  contractSigningStates,
  refreshContractSigningStatus,
  resolveContractSendResult,
  retryContractSend,
  startContractSend,
} from './contract-signing';

const target = buildContractActionTarget({
  routeFamily: 'candidate',
  taskContext: 'candidate-offer-launcher',
  parentTarget: '/candidate/candidate-123',
  candidateId: 'candidate-123',
  contractId: 'contract-1',
});

const document = { documentId: 'doc-1', fileName: 'offer.pdf', version: 'v1', generatedAt: '2026-04-20T10:00:00Z' };
const signing = { templateId: 'template-1', providerReady: true, downstreamUrlAvailable: true };

describe('contract signing operational helpers', () => {
  it('models the deterministic contract signing lifecycle states', () => {
    expect(contractSigningStates).toEqual([
      'loading',
      'ready',
      'template-required',
      'document-required',
      'sending',
      'sent',
      'send-failed',
      'signing-pending',
      'signed',
      'declined',
      'expired',
      'voided',
      'status-stale',
      'provider-blocked',
      'degraded',
      'unavailable',
    ]);
  });

  it('separates document metadata from signing prerequisites and blocked states', () => {
    const templateRequired = buildContractSigningState({ actionTarget: target, document, signing: { providerReady: true } });
    const documentRequired = buildContractSigningState({ actionTarget: target, signing: { templateId: 'template-1', providerReady: true } });
    const providerBlocked = buildContractSigningState({ actionTarget: target, document, signing: { templateId: 'template-1', providerBlocked: true } });

    expect(templateRequired).toMatchObject({ kind: 'template-required', canSend: false, document: { documentId: 'doc-1' } });
    expect(documentRequired).toMatchObject({ kind: 'document-required', canSend: false, prerequisites: { hasTemplate: true, hasDocument: false } });
    expect(providerBlocked).toMatchObject({ kind: 'provider-blocked', canSend: false, prerequisites: { providerReady: false } });
  });

  it('handles send start, success refresh intent, retry failure, downstream handoff, and stale status', () => {
    const ready = buildContractSigningState({ actionTarget: target, document, signing });
    expect(ready).toMatchObject({ kind: 'ready', canSend: true, canLaunchDownstream: true });

    expect(startContractSend(ready)).toMatchObject({ kind: 'sending', canSend: false });

    const sent = resolveContractSendResult(ready, 'sent');
    expect(sent).toMatchObject({ kind: 'sent', canRefreshStatus: true, parentRefresh: { refreshCandidate: true, refreshJob: false, returnTarget: '/candidate/candidate-123' } });

    const failed = resolveContractSendResult(ready, 'send-failed');
    expect(failed).toMatchObject({ kind: 'send-failed', canRetry: true });
    expect(retryContractSend(failed)).toMatchObject({ kind: 'ready', canSend: true });

    expect(buildContractDownstreamHandoff(sent)).toMatchObject({ action: 'downstream-handoff', canLaunch: true, parentRefresh: { refreshCandidate: true } });
    expect(refreshContractSigningStatus(sent, 'status-stale')).toMatchObject({ kind: 'status-stale', canRetry: true, canRefreshStatus: true });
    expect(refreshContractSigningStatus(sent, 'signed')).toMatchObject({ kind: 'signed', terminalOutcome: 'signed', parentRefresh: { refreshCandidate: true } });
  });

  it('emits safe allowlisted telemetry payloads only', () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_contract_safe');
    const event = buildContractSigningTelemetry({
      routeFamily: 'job',
      action: 'terminal-outcome',
      contractState: 'signed',
      taskContext: 'job-offer-overlay',
      terminalOutcome: 'signed',
    });

    expect(event).toEqual({
      name: 'contract_signing_action',
      data: {
        routeFamily: 'job',
        action: 'terminal-outcome',
        contractState: 'signed',
        taskContext: 'job-offer-overlay',
        terminalOutcome: 'signed',
        correlationId: 'corr_contract_safe',
      },
    });
    expect(JSON.stringify(event.data)).not.toContain('documentId');
    expect(JSON.stringify(event.data)).not.toContain('signedUrl');
    expect(JSON.stringify(event.data)).not.toContain('token');
    expect(JSON.stringify(event.data)).not.toContain('providerPayload');
    expect(JSON.stringify(event.data)).not.toContain('tenant');
  });
});
