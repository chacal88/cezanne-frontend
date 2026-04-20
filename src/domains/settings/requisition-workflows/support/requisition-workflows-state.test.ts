import { buildRequisitionWorkflowSettingsState } from './requisition-workflows-state';

describe('requisition workflows settings state', () => {
  it('keeps workflow configuration in settings and execution in jobs', () => {
    expect(buildRequisitionWorkflowSettingsState()).toMatchObject({
      owner: 'settings.hiring-flow',
      executionOwner: 'jobs.workflow-state',
      parentTarget: '/settings/hiring-flow',
      activeExecutionState: false,
    });
  });

  it('allows retry for stale workflow settings states', () => {
    expect(buildRequisitionWorkflowSettingsState('stale-workflow')).toMatchObject({ kind: 'stale-workflow', canRetry: true });
  });
});
