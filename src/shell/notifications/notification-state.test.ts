import { describe, expect, it } from 'vitest';
import { buildNotificationCenterState, buildNotificationCenterViewModel, buildShellNotificationTelemetry, foundationNotifications } from './notification-state';

describe('notification center depth state', () => {
  it('normalizes ready, inbox, unsupported, unknown, stale, and fallback notification destinations', () => {
    const state = buildNotificationCenterState(foundationNotifications);
    expect(state.map((item) => item.state)).toContain('ready');
    expect(state.find((item) => item.destinationKind === 'inbox.conversation')).toMatchObject({ fallbackTarget: '/inbox', entryMode: 'notification' });
    expect(state.find((item) => item.destinationKind === 'billing.overview')).toMatchObject({ state: 'unsupported-destination', fallbackTarget: '/dashboard' });
    expect(state.find((item) => item.destinationKind === 'unknown')).toMatchObject({ state: 'unknown-destination', fallbackTarget: '/dashboard' });
    expect(state.find((item) => item.id === 'n-6')).toMatchObject({ state: 'stale-target', refreshRequired: true });
  });

  it('builds a center-level adapter-backed degraded state without inventing notification APIs', () => {
    const center = buildNotificationCenterViewModel();
    expect(center).toMatchObject({ state: 'degraded', unreadCount: 4, adapterContract: 'fixture' });
    expect(center.unknownContracts).toContain('notification list API');
    expect(buildNotificationCenterViewModel({ adapter: { contract: 'api', load: () => [] } })).toMatchObject({ state: 'empty', adapterContract: 'api', unknownContracts: [] });
  });

  it('denies inbox destinations at the notification boundary when inbox capability is unavailable', () => {
    const state = buildNotificationCenterState(foundationNotifications, { canResolveNotificationDestination: true, canUseInbox: false });
    expect(state.find((item) => item.destinationKind === 'inbox.conversation')).toMatchObject({ state: 'denied-target', target: expect.stringContaining('reason=denied-target') });
  });

  it('emits safe notification telemetry without raw payload fields', () => {
    const telemetry = buildShellNotificationTelemetry({ state: 'denied-target', destinationKind: 'billing.overview', entryMode: 'notification' });
    const payload = JSON.stringify(telemetry);
    expect(payload).toContain('billing.overview');
    expect(payload).not.toContain('raw');
    expect(payload).not.toContain('messageBody');
    expect(payload).not.toContain('token');
  });
});
