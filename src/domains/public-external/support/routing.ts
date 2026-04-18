export type SharedJobRouteParams = {
  jobOrRole: string;
  token: string;
  source: string;
};

export type PublicApplicationRouteParams = SharedJobRouteParams;

export type PublicSurveyRouteParams = {
  surveyuuid: string;
  jobuuid: string;
  cvuuid: string;
};

export type InterviewRequestRouteParams = {
  scheduleUuid: string;
  cvToken: string;
};

export type ExternalReviewRouteParams = {
  code: string;
};

export function buildSharedJobPath(params: SharedJobRouteParams): string {
  return `/shared/${params.jobOrRole}/${params.token}/${params.source}`;
}

export function buildPublicApplicationPath(params: PublicApplicationRouteParams): string {
  return `/${params.jobOrRole}/application/${params.token}/${params.source}`;
}

export function buildPublicSurveyPath(params: PublicSurveyRouteParams): string {
  return `/surveys/${params.surveyuuid}/${params.jobuuid}/${params.cvuuid}`;
}

export function buildInterviewRequestPath(params: InterviewRequestRouteParams): string {
  return `/interview-request/${params.scheduleUuid}/${params.cvToken}`;
}

export function buildReviewCandidatePath(params: ExternalReviewRouteParams): string {
  return `/review-candidate/${params.code}`;
}

export function buildInterviewFeedbackPath(params: ExternalReviewRouteParams): string {
  return `/interview-feedback/${params.code}`;
}

export type RequisitionApprovalRouteParams = {
  token: string;
};

export function buildRequisitionApprovalPath(params: RequisitionApprovalRouteParams): string {
  return `/job-requisition-approval?token=${encodeURIComponent(params.token)}`;
}
