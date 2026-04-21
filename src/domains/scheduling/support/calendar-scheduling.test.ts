import { resetCorrelationId, setActiveCorrelationId } from '../../../lib/observability';
import { buildProviderReadinessSignals } from '../../integrations/support';
import { buildOperationalGateInput, evaluateOperationalReadinessGate } from '../../integrations/support';
import {
  buildCalendarSchedulingTelemetry,
  buildInitialCalendarSchedulingState,
  createCalendarScheduleDraft,
  normalizeCalendarSlot,
  normalizeCalendarSlots,
  resolveCalendarSchedulingSubmitResult,
  retryCalendarScheduling,
  selectCalendarSlot,
  startCalendarSchedulingSubmit,
  validateCalendarScheduleDraft,
} from './calendar-scheduling';

const parentContext = {
  routeFamily: 'job' as const,
  returnTarget: '/job/job-1?section=candidates',
  jobId: 'job-1',
  candidateId: 'candidate-1',
};

const slots = [
  { id: 'slot-1', startsAt: '2026-04-21T13:00:00Z', endsAt: '2026-04-21T13:30:00Z', timeZone: 'UTC', label: 'Tue 13:00' },
  { id: 'slot-2', startsAt: '2026-04-21T14:00:00Z', endsAt: '2026-04-21T14:30:00Z', timeZone: 'UTC', label: 'Tue 14:00' },
];

describe('calendar scheduling operational helpers', () => {
  it('normalizes safe slot summaries without exposing raw provider payloads', () => {
    const safe = normalizeCalendarSlot({ ...slots[0], providerPayload: { credential: 'secret', token: 'private' }, signedUrl: 'https://example.test/signed' });

    expect(safe).toEqual(slots[0]);
    expect(JSON.stringify(safe)).not.toContain('credential');
    expect(JSON.stringify(safe)).not.toContain('token');
    expect(JSON.stringify(safe)).not.toContain('signedUrl');
    expect(normalizeCalendarSlots([{ id: 'missing' }, slots[1]])).toEqual([slots[1]]);
  });

  it('models loading, ready, validation, and slot-unavailable states deterministically', () => {
    expect(buildInitialCalendarSchedulingState({ parentContext, loading: true }).kind).toBe('loading');

    const draft = selectCalendarSlot(createCalendarScheduleDraft({ note: ' Candidate intro ' }), slots, 'slot-1');
    const ready = buildInitialCalendarSchedulingState({ parentContext, slots, draft });

    expect(draft).toEqual({ selectedSlotId: 'slot-1', note: 'Candidate intro' });
    expect(ready).toMatchObject({ kind: 'ready', canSubmit: true, selectNewSlotAllowed: true });
    expect(validateCalendarScheduleDraft({ parentContext, slots, draft: createCalendarScheduleDraft() })?.kind).toBe('validation-error');
    expect(validateCalendarScheduleDraft({ parentContext, slots, draft: createCalendarScheduleDraft({ selectedSlotId: 'missing' }) })?.kind).toBe('slot-unavailable');
    expect(buildInitialCalendarSchedulingState({ parentContext, slots: [] }).kind).toBe('slot-unavailable');
  });

  it('maps non-ready readiness gates to route-local blocked, degraded, and unavailable states', () => {
    const [blockedSignal] = buildProviderReadinessSignals({ id: 'google-calendar', name: 'Google Calendar', family: 'calendar', state: 'reauth_required' });
    const [degradedSignal] = buildProviderReadinessSignals({ id: 'google-calendar', name: 'Google Calendar', family: 'calendar', state: 'degraded' });
    const [unavailableSignal] = buildProviderReadinessSignals({ id: 'google-calendar', name: 'Google Calendar', family: 'calendar', state: 'unavailable' });

    expect(buildInitialCalendarSchedulingState({ parentContext, readinessGate: evaluateOperationalReadinessGate(buildOperationalGateInput(blockedSignal, 'job-schedule')), slots }).kind).toBe('provider-blocked');
    expect(buildInitialCalendarSchedulingState({ parentContext, readinessGate: evaluateOperationalReadinessGate(buildOperationalGateInput(degradedSignal, 'job-schedule')), slots }).kind).toBe('degraded');
    expect(buildInitialCalendarSchedulingState({ parentContext, readinessGate: evaluateOperationalReadinessGate(buildOperationalGateInput(unavailableSignal, 'job-schedule')), slots }).kind).toBe('unavailable');
  });

  it('handles submit start, conflict retry, submit failure, and submitted parent refresh intent', () => {
    const draft = createCalendarScheduleDraft({ selectedSlotId: 'slot-1' });

    expect(startCalendarSchedulingSubmit({ parentContext, slots, draft }).kind).toBe('submitting');

    const conflict = resolveCalendarSchedulingSubmitResult({ outcome: 'conflict', parentContext, slots, draft });
    expect(conflict).toMatchObject({ kind: 'conflict', retryAllowed: true, selectNewSlotAllowed: true });
    expect(retryCalendarScheduling(conflict)).toMatchObject({ kind: 'ready', draft, canSubmit: true });

    expect(resolveCalendarSchedulingSubmitResult({ outcome: 'failed', parentContext, slots, draft })).toMatchObject({ kind: 'submit-failed', retryAllowed: true });
    expect(resolveCalendarSchedulingSubmitResult({ outcome: 'submitted', parentContext, slots, draft })).toMatchObject({
      kind: 'submitted',
      parentRefresh: { refreshJob: true, refreshCandidate: true, returnTarget: '/job/job-1?section=candidates' },
    });
  });

  it('emits safe scheduling telemetry payloads only', () => {
    resetCorrelationId();
    setActiveCorrelationId('corr_calendar_schedule');

    expect(buildCalendarSchedulingTelemetry({ routeFamily: 'candidate', action: 'submitted', schedulingState: 'submitted', readinessOutcome: 'ready' })).toEqual({
      name: 'calendar_scheduling_action',
      data: {
        routeFamily: 'candidate',
        action: 'submitted',
        schedulingState: 'submitted',
        readinessOutcome: 'ready',
        correlationId: 'corr_calendar_schedule',
      },
    });
  });
});
