import { describe, expect, it } from 'vitest';
import { getDefaultFormsDocsSettingsConfig } from './store';
import { runFormsDocsSettingsSave } from './workflow';


describe('forms/docs settings workflow', () => {
  it('saves through a replaceable fixture seam and returns refresh-required impact', async () => {
    const result = await runFormsDocsSettingsSave(getDefaultFormsDocsSettingsConfig());

    expect(result.mutation).toMatchObject({ kind: 'success', outcome: 'refresh-required' });
    expect(result.config.version).toBe(2);
    expect(result.downstreamImpact.every((impact) => impact.refreshIntent === 'refresh-now')).toBe(true);
  });

  it('keeps recoverable failures in route with retry state', async () => {
    const result = await runFormsDocsSettingsSave({ ...getDefaultFormsDocsSettingsConfig(), simulateSaveFailure: true });

    expect(result.mutation).toMatchObject({ kind: 'retry', canRetry: true });
    expect(result.readiness.kind).toBe('ready');
  });

  it('does not save invalid document labels as fabricated contracts', async () => {
    const config = getDefaultFormsDocsSettingsConfig();
    const result = await runFormsDocsSettingsSave({
      ...config,
      requestedDocuments: [{ ...config.requestedDocuments[0], label: ' ' }],
    });

    expect(result.mutation).toMatchObject({ kind: 'validation-error', fieldErrors: ['requestedDocuments.label'] });
  });
});
