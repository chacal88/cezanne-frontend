export type RejectReasonItem = {
  id: string;
  label: string;
  active: boolean;
};

export type RejectReasonsSettingsConfigView = {
  reasons: RejectReasonItem[];
  simulateSubmissionFailure: boolean;
};
