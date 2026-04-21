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

export type JobsProductStateKind =
  | 'loading'
  | 'ready'
  | 'empty'
  | 'filtered-empty'
  | 'denied'
  | 'unavailable'
  | 'stale-filters'
  | 'degraded'
  | 'validating'
  | 'dirty-draft'
  | 'saving'
  | 'saved'
  | 'save-failed'
  | 'submitting'
  | 'succeeded'
  | 'failed'
  | 'retryable'
  | 'cancelled'
  | 'parent-refresh-required'
  | 'publish-blocked'
  | 'partial-publish'
  | 'reset-workflow'
  | 'copy'
  | 'create'
  | 'edit'
  | 'status-transition'
  | 'assignment-share';

export type JobsRouteState = {
  kind: JobsProductStateKind;
  message: string;
  retryAvailable?: boolean;
  parentTarget?: string;
};

export type JobsListItem = {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'closed' | 'archived';
  label?: string;
  assignedRecruiter?: string;
};

export type JobsListViewModel = JobsListState & {
  createPath: '/jobs/manage' | null;
  atsStatus?: AtsCandidateSourceOperationalState;
  items: JobsListItem[];
  total: number;
  state: JobsRouteState;
};

export type JobHubSummary = {
  key: 'candidates' | 'cvs' | 'bids' | 'interviews' | 'forms-documents';
  label: string;
  count?: number;
  state: 'ready' | 'degraded' | 'unavailable';
};

export type JobHubViewModel = {
  jobId: string;
  section: JobHubSection;
  summary: string;
  workflowState: 'draft' | 'active' | 'closed';
  assignments: string[];
  shareState: 'private' | 'shared' | 'unavailable';
  sectionState: JobsRouteState;
  summaries: JobHubSummary[];
  transitions: Array<{ action: 'close' | 'reopen' | 'publish'; state: 'ready' | 'denied' | 'degraded' }>;
};

export type JobAuthoringDraft = {
  id?: string;
  title: string;
  status: 'draft' | 'active';
  sectors: string[];
  assigneeIds: string[];
  favoritesEnabled: boolean;
  sourceJobId?: string;
};

export type JobPublishingReadiness = OperationalReadinessGateResult;

export type JobAuthoringPublishingView = {
  draftId?: string;
  canSaveDraft: true;
  canPublish: boolean;
  target: import('./publishing').JobBoardPublishingTarget;
  status: import('./publishing').JobBoardPublishingStatus;
  atsStatus?: AtsCandidateSourceOperationalState;
  authoringState: JobsRouteState;
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
  directEntry: boolean;
  parentRefreshIntent: boolean;
  operationState: JobsRouteState;
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
