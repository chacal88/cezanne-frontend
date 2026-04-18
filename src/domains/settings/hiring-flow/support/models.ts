export type HiringFlowRequisitionMode = 'disabled' | 'optional' | 'required';

export type HiringFlowSettingsConfigView = {
  workflowId: string;
  workflowName: string;
  defaultStageName: string;
  stageCount: number;
  approvalsEnabled: boolean;
  requisitionMode: HiringFlowRequisitionMode;
  simulateSubmissionFailure: boolean;
};
