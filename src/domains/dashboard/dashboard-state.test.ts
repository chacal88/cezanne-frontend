import { describe, expect, it } from 'vitest';
import { buildDashboardCards, buildDashboardOperationalState, buildDashboardReentryState, buildDashboardViewModel } from './dashboard-state';

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

  it('builds validated dashboard summary cards', () => {
    const cards = buildDashboardCards({ liveJobsUuids: ['j1'], liveJobsCount: 1, liveCvsCount: 2, liveInterviewsScheduledCount: 3, users: [], auth: {}, calendarIntegrationState: 'ready' });
    expect(cards.map((card) => [card.kind, card.count])).toEqual([['jobs', 1], ['candidates', 2], ['interviews', 3]]);
  });

  it('documents fixture-backed adapter seams instead of inventing backend contracts', () => {
    const state = buildDashboardOperationalState({ notificationCount: 2, inboxConversationCount: 1 });
    expect(state.adapterContract).toBe('fixture');
    expect(state.unknownContracts).toContain('dashboard aggregate query');
    expect(state.notificationState).toBe('ready');
    expect(state.inboxState).toBe('ready');
  });

  it('normalizes the first real dashboard view model', () => {
    const view = buildDashboardViewModel({
      adapterContract: 'api',
      overview: {
        liveJobsUuids: ['j1'],
        liveJobsCount: 1,
        liveCvsCount: 2,
        liveInterviewsScheduledCount: 3,
        users: [],
        auth: { firstName: 'Ada', occupopEmailConfirmed: false, occupopEmailConfirmationLink: 'https://confirm.test' },
        calendarIntegrationState: 'degraded',
      },
    });
    expect(view.greetingName).toBe('Ada');
    expect(view.emailConfirmationRequired).toBe(true);
    expect(view.calendarReadiness).toBe('degraded');
    expect(view.unknownContracts).toEqual([]);
  });
});
