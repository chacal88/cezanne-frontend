import { describe, expect, it } from 'vitest';
import { buildDashboardOperationalState, buildDashboardReentryState } from './dashboard-state';

describe('dashboard reentry state', () => {
  it('models normal, notification fallback, stale, denied, missing, unsupported, and platform landing', () => {
    expect(buildDashboardReentryState({}).reason).toBe('normal');
    expect(buildDashboardReentryState({ reason: 'notification-fallback' }).reason).toBe('notification-fallback');
    expect(buildDashboardReentryState({ reason: 'denied-target' }).reason).toBe('denied-target');
    expect(buildDashboardReentryState({ reason: 'stale-target' }).reason).toBe('stale-target');
    expect(buildDashboardReentryState({ reason: 'missing-target' }).reason).toBe('missing-target');
    expect(buildDashboardReentryState({ reason: 'unsupported-destination' }).reason).toBe('unsupported-destination');
    expect(buildDashboardReentryState({ platformMode: true }).reason).toBe('platform-landing');
  });

  it('surfaces safe actions for notification fallback and stale dashboard contexts', () => {
    expect(buildDashboardReentryState({ reason: 'notification-fallback', fallbackTarget: '/inbox' }).safeActions).toEqual([
      { kind: 'open-notifications', label: 'Review notifications', target: '/notifications' },
      { kind: 'return-to-fallback', label: 'Return to safe target', target: '/inbox', refreshIntent: 'target' },
    ]);
    expect(buildDashboardOperationalState({ reason: 'stale-target' })).toMatchObject({ sourceHealth: 'stale', refreshRequired: true });
  });

  it('documents fixture-backed adapter seams instead of inventing backend contracts', () => {
    const state = buildDashboardOperationalState({ notificationCount: 2, inboxConversationCount: 1 });
    expect(state.adapterContract).toBe('fixture');
    expect(state.unknownContracts).toContain('dashboard aggregate query');
    expect(state.notificationState).toBe('ready');
    expect(state.inboxState).toBe('ready');
  });
});
