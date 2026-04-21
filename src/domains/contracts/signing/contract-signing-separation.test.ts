import { matchRouteMetadata } from '../../../lib/routing/route-metadata';
import { buildContractSigningTelemetry } from './contract-signing';

describe('contract signing ownership separation', () => {
  it('does not alter public token integration route metadata', () => {
    expect(matchRouteMetadata('/integration/forms/token-123')?.metadata).toMatchObject({
      routeId: 'integrations.token-entry.forms',
      routeClass: 'Public/Token',
      domain: 'integrations',
      module: 'token-entry',
      directEntry: 'full',
    });
    expect(matchRouteMetadata('/integration/cv/token-123/offer')?.metadata).toMatchObject({
      routeId: 'integrations.token-entry.cv',
      routeClass: 'Public/Token',
      domain: 'integrations',
      module: 'token-entry',
      directEntry: 'full',
    });
  });

  it('keeps contract telemetry free of standalone signer and public callback payloads', () => {
    const event = buildContractSigningTelemetry({
      routeFamily: 'candidate',
      action: 'downstream-handoff',
      contractState: 'signing-pending',
      taskContext: 'candidate-offer-launcher',
      correlationId: 'corr_public_separation',
    });

    expect(event.data).toEqual({
      routeFamily: 'candidate',
      action: 'downstream-handoff',
      contractState: 'signing-pending',
      taskContext: 'candidate-offer-launcher',
      terminalOutcome: undefined,
      correlationId: 'corr_public_separation',
    });
    expect(JSON.stringify(event.data)).not.toContain('/integration/');
    expect(JSON.stringify(event.data)).not.toContain('signedUrl');
    expect(JSON.stringify(event.data)).not.toContain('signature');
    expect(JSON.stringify(event.data)).not.toContain('callback');
  });
});
