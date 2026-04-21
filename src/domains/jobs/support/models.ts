import type { OperationalReadinessGateResult } from '../../integrations/support';
import type { CalendarSchedulingState } from '../../scheduling/support';
import type { ContractSigningState } from '../../contracts/signing';
import type { AtsCandidateSourceOperationalState } from '../../integrations/support';
export type JobsListScope = 'open' | 'draft' | 'archived' | 'assigned';
export type JobHubSection = 'overview' | 'candidates' | 'workflow' | 'activity';
export type JobTaskKind = 'bid-create' | 'bid-view' | 'cv-create' | 'cv-view' | 'schedule' | 'offer' | 'reject';

export type JobsListState = {
  scope: JobsListScope;
  page: number;
  search?: string;
  asAdmin: boolean;
  label?: string;
};

export type JobsListViewModel = JobsListState & {
  createPath: '/jobs/manage' | null;
  atsStatus?: AtsCandidateSourceOperationalState;
};

export type JobHubViewModel = {
  jobId: string;
  section: JobHubSection;
  summary: string;
  workflowState: 'draft' | 'active';
  assignments: string[];
};

export type JobAuthoringDraft = {
  id?: string;
  title: string;
  status: 'draft' | 'active';
  sectors: string[];
  assigneeIds: string[];
  favoritesEnabled: boolean;
};

export type JobPublishingReadiness = OperationalReadinessGateResult;

export type JobAuthoringPublishingView = {
  draftId?: string;
  canSaveDraft: true;
  canPublish: boolean;
  target: import('./publishing').JobBoardPublishingTarget;
  status: import('./publishing').JobBoardPublishingStatus;
  atsStatus?: AtsCandidateSourceOperationalState;
};

export type JobAuthoringSerializedDraft = {
  id?: string;
  name: string;
  isPublished: boolean;
  sectorCodes: string[];
  assignments: { userId: string }[];
  favoriteFlow: 'enabled' | 'disabled';
};

export type JobTaskContext = {
  kind: JobTaskKind;
  jobId: string;
  candidateId?: string;
  bidId?: string;
  section?: JobHubSection;
  parentTarget: string;
  readinessGate?: OperationalReadinessGateResult;
  schedulingState?: CalendarSchedulingState;
  contractSigningState?: ContractSigningState;
};

export type {
  JobBoardPublishingAction,
  JobBoardPublishingPublicReflectionIntent,
  JobBoardPublishingResult,
  JobBoardPublishingRouteFamily,
  JobBoardPublishingState,
  JobBoardPublishingStatus,
  JobBoardPublishingTarget,
  JobBoardPublishingTargetType,
  JobBoardPublishingTelemetryEvent,
} from './publishing';
