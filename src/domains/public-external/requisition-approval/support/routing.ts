export type RequisitionApprovalSearch = {
  token: string;
};

export function validateRequisitionApprovalSearch(search: Record<string, unknown>): RequisitionApprovalSearch {
  return {
    token: typeof search.token === 'string' ? search.token : '',
  };
}
