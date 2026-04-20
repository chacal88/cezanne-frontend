import { matchRouteMetadata } from '../../../../lib/routing';

describe('requisition authoring routing', () => {
  it('registers Jobs-side requisition authoring routes', () => {
    expect(matchRouteMetadata('/build-requisition')?.metadata).toMatchObject({
      routeId: 'jobs.requisition.build',
      domain: 'jobs',
      module: 'workflow-state',
      requiredCapability: 'canUseJobRequisitionBranching',
      implementationState: 'implemented',
    });
    expect(matchRouteMetadata('/job-requisitions/workflow-1')?.metadata).toMatchObject({
      routeId: 'jobs.requisition.workflow',
      parentTarget: '/jobs/open',
      requiredCapability: 'canUseJobRequisitionBranching',
    });
    expect(matchRouteMetadata('/job-requisitions/workflow-1/stage-1')?.metadata).toMatchObject({
      routeId: 'jobs.requisition.workflow',
      parentTarget: '/job-requisitions/$jobWorkflowUuid',
    });
  });

  it('registers workflow administration as settings-owned', () => {
    expect(matchRouteMetadata('/requisition-workflows')?.metadata).toMatchObject({
      routeId: 'settings.hiring-flow.requisition-workflows',
      domain: 'settings',
      module: 'hiring-flow',
      requiredCapability: 'canManageHiringFlowSettings',
      parentTarget: '/settings/hiring-flow',
    });
  });
});
