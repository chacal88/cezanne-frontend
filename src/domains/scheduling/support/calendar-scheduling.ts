import { ensureCorrelationId } from '../../../lib/observability';
import type { OperationalReadinessGateResult, OperationalReadinessGateState } from '../../integrations/support';

export type CalendarSchedulingRouteFamily = 'job' | 'candidate';

export type CalendarSchedulingStateKind =
  | 'loading'
  | 'ready'
  | 'validation-error'
  | 'slot-unavailable'
  | 'conflict'
  | 'submitting'
  | 'submitted'
  | 'submit-failed'
  | 'provider-blocked'
  | 'degraded'
  | 'unavailable';

export type CalendarSchedulingTelemetryAction = 'slot_selected' | 'submit_started' | 'conflict' | 'submit_failed' | 'submitted';

export type SafeCalendarSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
  timeZone: string;
  label: string;
};

export type CalendarScheduleDraft = {
  selectedSlotId?: string;
  note?: string;
};

export type CalendarSchedulingParentContext = {
  routeFamily: CalendarSchedulingRouteFamily;
  returnTarget: string;
  recoveryTarget?: string;
  jobId?: string;
  candidateId?: string;
};

export type CalendarSchedulingParentRefreshIntent = {
  refreshJob: boolean;
  refreshCandidate: boolean;
  returnTarget: string;
};

export type CalendarSchedulingState = {
  kind: CalendarSchedulingStateKind;
  routeFamily: CalendarSchedulingRouteFamily;
  parentContext: CalendarSchedulingParentContext;
  draft: CalendarScheduleDraft;
  slots: SafeCalendarSlot[];
  message: string;
  readinessOutcome?: OperationalReadinessGateState;
  retryAllowed: boolean;
  selectNewSlotAllowed: boolean;
  canSubmit: boolean;
  parentRefresh?: CalendarSchedulingParentRefreshIntent;
};

export type CalendarSchedulingSubmitOutcome = 'conflict' | 'failed' | 'submitted';

export type CalendarSchedulingTelemetryEvent = {
  name: 'calendar_scheduling_action';
  data: {
    routeFamily: CalendarSchedulingRouteFamily;
    action: CalendarSchedulingTelemetryAction;
    schedulingState: CalendarSchedulingStateKind;
    readinessOutcome?: OperationalReadinessGateState;
    correlationId: string;
  };
};

type RawSlotLike = Partial<SafeCalendarSlot> & Record<string, unknown>;

function isSafeSlot(input: RawSlotLike): input is SafeCalendarSlot {
  return ['id', 'startsAt', 'endsAt', 'timeZone', 'label'].every((key) => typeof input[key] === 'string' && input[key] !== '');
}

function mapGateState(readinessGate: OperationalReadinessGateResult): CalendarSchedulingStateKind {
  if (readinessGate.state === 'blocked') return 'provider-blocked';
  if (readinessGate.state === 'degraded') return 'degraded';
  return 'unavailable';
}

function buildParentRefreshIntent(parentContext: CalendarSchedulingParentContext): CalendarSchedulingParentRefreshIntent {
  return {
    refreshJob: parentContext.routeFamily === 'job' || Boolean(parentContext.jobId),
    refreshCandidate: parentContext.routeFamily === 'candidate' || Boolean(parentContext.candidateId),
    returnTarget: parentContext.returnTarget,
  };
}

function makeState(input: {
  kind: CalendarSchedulingStateKind;
  parentContext: CalendarSchedulingParentContext;
  slots: SafeCalendarSlot[];
  draft: CalendarScheduleDraft;
  message: string;
  readinessOutcome?: OperationalReadinessGateState;
  retryAllowed?: boolean;
  selectNewSlotAllowed?: boolean;
  canSubmit?: boolean;
  parentRefresh?: CalendarSchedulingParentRefreshIntent;
}): CalendarSchedulingState {
  return {
    kind: input.kind,
    routeFamily: input.parentContext.routeFamily,
    parentContext: input.parentContext,
    draft: input.draft,
    slots: input.slots,
    message: input.message,
    readinessOutcome: input.readinessOutcome,
    retryAllowed: input.retryAllowed ?? false,
    selectNewSlotAllowed: input.selectNewSlotAllowed ?? false,
    canSubmit: input.canSubmit ?? false,
    parentRefresh: input.parentRefresh,
  };
}

export function normalizeCalendarSlot(input: RawSlotLike): SafeCalendarSlot | undefined {
  const candidate = {
    id: input.id,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    timeZone: input.timeZone,
    label: input.label,
  };

  return isSafeSlot(candidate) ? candidate : undefined;
}

export function normalizeCalendarSlots(inputs: RawSlotLike[]): SafeCalendarSlot[] {
  return inputs.flatMap((slot) => {
    const safeSlot = normalizeCalendarSlot(slot);
    return safeSlot ? [safeSlot] : [];
  });
}

export function createCalendarScheduleDraft(input: Partial<CalendarScheduleDraft> = {}): CalendarScheduleDraft {
  return {
    selectedSlotId: typeof input.selectedSlotId === 'string' && input.selectedSlotId.length > 0 ? input.selectedSlotId : undefined,
    note: typeof input.note === 'string' && input.note.trim().length > 0 ? input.note.trim() : undefined,
  };
}

export function selectCalendarSlot(draft: CalendarScheduleDraft, slots: SafeCalendarSlot[], slotId: string): CalendarScheduleDraft {
  return createCalendarScheduleDraft({
    ...draft,
    selectedSlotId: slots.some((slot) => slot.id === slotId) ? slotId : undefined,
  });
}

export function buildInitialCalendarSchedulingState(input: {
  parentContext: CalendarSchedulingParentContext;
  readinessGate?: OperationalReadinessGateResult;
  slots?: RawSlotLike[];
  draft?: Partial<CalendarScheduleDraft>;
  loading?: boolean;
}): CalendarSchedulingState {
  const slots = normalizeCalendarSlots(input.slots ?? []);
  const draft = createCalendarScheduleDraft(input.draft);

  if (input.loading) {
    return makeState({ kind: 'loading', parentContext: input.parentContext, slots, draft, message: 'Loading available interview slots.' });
  }

  if (input.readinessGate && !input.readinessGate.canProceed) {
    return makeState({
      kind: mapGateState(input.readinessGate),
      parentContext: input.parentContext,
      slots,
      draft,
      message: input.readinessGate.message,
      readinessOutcome: input.readinessGate.state,
    });
  }

  if (slots.length === 0) {
    return makeState({ kind: 'slot-unavailable', parentContext: input.parentContext, slots, draft, message: 'No safe calendar slots are currently available.', selectNewSlotAllowed: true });
  }

  return makeState({
    kind: 'ready',
    parentContext: input.parentContext,
    slots,
    draft,
    message: 'Select an available interview slot.',
    readinessOutcome: input.readinessGate?.state,
    canSubmit: Boolean(draft.selectedSlotId),
    selectNewSlotAllowed: true,
  });
}

export function validateCalendarScheduleDraft(input: {
  parentContext: CalendarSchedulingParentContext;
  draft: CalendarScheduleDraft;
  slots: SafeCalendarSlot[];
  readinessGate?: OperationalReadinessGateResult;
}): CalendarSchedulingState | undefined {
  if (input.readinessGate && !input.readinessGate.canProceed) {
    return buildInitialCalendarSchedulingState({ parentContext: input.parentContext, readinessGate: input.readinessGate, slots: input.slots, draft: input.draft });
  }

  if (!input.draft.selectedSlotId) {
    return makeState({ kind: 'validation-error', parentContext: input.parentContext, slots: input.slots, draft: input.draft, message: 'Select a calendar slot before submitting.', selectNewSlotAllowed: true });
  }

  if (!input.slots.some((slot) => slot.id === input.draft.selectedSlotId)) {
    return makeState({ kind: 'slot-unavailable', parentContext: input.parentContext, slots: input.slots, draft: input.draft, message: 'The selected calendar slot is no longer available.', selectNewSlotAllowed: true });
  }

  return undefined;
}

export function startCalendarSchedulingSubmit(input: {
  parentContext: CalendarSchedulingParentContext;
  draft: CalendarScheduleDraft;
  slots: SafeCalendarSlot[];
  readinessGate?: OperationalReadinessGateResult;
}): CalendarSchedulingState {
  const invalid = validateCalendarScheduleDraft(input);
  if (invalid) return invalid;

  return makeState({
    kind: 'submitting',
    parentContext: input.parentContext,
    slots: input.slots,
    draft: input.draft,
    message: 'Submitting the interview schedule.',
    readinessOutcome: input.readinessGate?.state,
  });
}

export function resolveCalendarSchedulingSubmitResult(input: {
  outcome: CalendarSchedulingSubmitOutcome;
  parentContext: CalendarSchedulingParentContext;
  draft: CalendarScheduleDraft;
  slots: SafeCalendarSlot[];
  readinessGate?: OperationalReadinessGateResult;
}): CalendarSchedulingState {
  if (input.outcome === 'conflict') {
    return makeState({
      kind: 'conflict',
      parentContext: input.parentContext,
      slots: input.slots,
      draft: input.draft,
      message: 'The selected calendar slot was taken before submission completed.',
      readinessOutcome: input.readinessGate?.state,
      retryAllowed: true,
      selectNewSlotAllowed: true,
    });
  }

  if (input.outcome === 'failed') {
    return makeState({
      kind: 'submit-failed',
      parentContext: input.parentContext,
      slots: input.slots,
      draft: input.draft,
      message: 'Scheduling failed before confirmation. Try submitting again.',
      readinessOutcome: input.readinessGate?.state,
      retryAllowed: true,
    });
  }

  return makeState({
    kind: 'submitted',
    parentContext: input.parentContext,
    slots: input.slots,
    draft: input.draft,
    message: 'Interview scheduled. Refresh the parent context before returning.',
    readinessOutcome: input.readinessGate?.state,
    parentRefresh: buildParentRefreshIntent(input.parentContext),
  });
}

export function retryCalendarScheduling(state: CalendarSchedulingState): CalendarSchedulingState {
  return makeState({
    kind: 'ready',
    parentContext: state.parentContext,
    slots: state.slots,
    draft: state.draft,
    message: 'Retry scheduling with the current draft or select a different slot.',
    readinessOutcome: state.readinessOutcome,
    canSubmit: Boolean(state.draft.selectedSlotId),
    selectNewSlotAllowed: true,
  });
}

export function buildCalendarSchedulingTelemetry(input: {
  routeFamily: CalendarSchedulingRouteFamily;
  action: CalendarSchedulingTelemetryAction;
  schedulingState: CalendarSchedulingStateKind;
  readinessOutcome?: OperationalReadinessGateState;
}): CalendarSchedulingTelemetryEvent {
  return {
    name: 'calendar_scheduling_action',
    data: {
      routeFamily: input.routeFamily,
      action: input.action,
      schedulingState: input.schedulingState,
      readinessOutcome: input.readinessOutcome,
      correlationId: ensureCorrelationId(),
    },
  };
}
