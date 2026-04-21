import { describe, expect, it } from 'vitest';
import { buildFormsDocsDownstreamImpactSignals } from './impact';
import { buildFormsDocsSettingsViewState, resolveFormsDocsReadiness } from './state';
import { getDefaultFormsDocsSettingsConfig } from './store';

function config(overrides = {}) {
  return { ...getDefaultFormsDocsSettingsConfig(), ...overrides };
}

describe('forms/docs settings state', () => {
  it('models ready, empty, denied, unavailable, stale, and degraded route states', () => {
    expect(resolveFormsDocsReadiness(config()).kind).toBe('ready');
    expect(resolveFormsDocsReadiness(config({ simulateEmpty: true })).kind).toBe('empty');
    expect(resolveFormsDocsReadiness(config(), { denied: true }).kind).toBe('denied');
    expect(resolveFormsDocsReadiness(config({ simulateUnavailable: true })).kind).toBe('unavailable');
    expect(resolveFormsDocsReadiness(config({ simulateStale: true })).kind).toBe('stale');
    expect(resolveFormsDocsReadiness(config({ simulateDegraded: true })).kind).toBe('degraded');
  });

  it('exposes downstream impact without moving mutation ownership out of settings', () => {
    const signals = buildFormsDocsDownstreamImpactSignals(config({ simulateStale: true }));

    expect(signals).toEqual(expect.arrayContaining([
      expect.objectContaining({ consumer: 'candidate-documents-contracts', state: 'stale', refreshIntent: 'refresh-on-next-open', mutationOwner: 'settings.forms-docs-controls' }),
      expect.objectContaining({ consumer: 'public-application', state: 'stale', refreshIntent: 'refresh-on-next-open', mutationOwner: 'settings.forms-docs-controls' }),
      expect.objectContaining({ consumer: 'integration-forms-token', state: 'stale', refreshIntent: 'refresh-on-next-open', mutationOwner: 'settings.forms-docs-controls' }),
    ]));
  });

  it('records unknown backend contract fields as validation gaps', () => {
    const state = buildFormsDocsSettingsViewState(config());

    expect(state.unknownContractFields).toContain('downstream refresh event delivery contract');
    expect(state.config.source).toBe('fixture-adapter');
  });
});
