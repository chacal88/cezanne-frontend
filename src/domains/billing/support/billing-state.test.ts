import {
  buildBillingAdapterSnapshot,
  buildBillingActionViewModel,
  buildBillingCardActionReadiness,
  buildBillingCardViewModel,
  buildBillingOverviewViewModel,
  buildBillingUpgradeActionReadiness,
  buildBillingUpgradeViewModel,
  buildSmsAddonActionReadiness,
  buildSmsAddonViewModel,
  billingRoutes,
  normalizeBillingAdapterSnapshot,
} from './billing-state';

describe('billing product-depth state', () => {
  it('models billing overview commercial state outside platform subscription admin', () => {
    expect(billingRoutes).toEqual({
      overview: '/billing',
      upgrade: '/billing/upgrade',
      sms: '/billing/sms',
      card: '/billing/card/$cardId',
      fallback: '/dashboard',
    });
    expect(buildBillingOverviewViewModel()).toMatchObject({
      state: 'ready',
      commercialState: 'ready',
      planState: 'active',
      smsState: 'usage-warning',
      cardState: 'ready',
      parentTarget: '/dashboard',
      refreshIntent: 'none',
      platformSubscriptionAdmin: false,
    });
  });

  it('blocks billing actions when billing is hidden and separates denied from unavailable', () => {
    expect(buildBillingOverviewViewModel('hidden')).toMatchObject({ state: 'denied', commercialState: 'hidden' });
    expect(buildBillingOverviewViewModel('hidden').actions).toEqual([
      { action: 'upgrade', label: 'Upgrade subscription', state: 'blocked', reason: 'Billing is hidden for this organization' },
      { action: 'manage-sms', label: 'Manage SMS add-on', state: 'blocked', reason: 'Billing is hidden for this organization' },
      { action: 'manage-card', label: 'Manage payment card', state: 'blocked', reason: 'Billing is hidden for this organization' },
    ]);
    expect(buildBillingOverviewViewModel('unavailable')).toMatchObject({ state: 'unavailable', commercialState: 'unavailable', refreshIntent: 'contact-support' });
  });

  it('exposes adapter fixtures for loading empty stale degraded and pending subscription states', () => {
    expect(buildBillingAdapterSnapshot('loading')).toMatchObject({ routeState: 'loading', cards: [] });
    expect(buildBillingAdapterSnapshot('empty')).toMatchObject({ routeState: 'empty', hasReadyCard: false });
    expect(buildBillingOverviewViewModel(buildBillingAdapterSnapshot('stale'))).toMatchObject({ state: 'stale', refreshIntent: 'refresh-subscription' });
    expect(buildBillingOverviewViewModel(buildBillingAdapterSnapshot('degraded'))).toMatchObject({ state: 'degraded', refreshIntent: 'contact-support' });
    expect(buildBillingOverviewViewModel(buildBillingAdapterSnapshot('pending-change')).pendingChanges).toContainEqual({ kind: 'plan-change', label: 'Growth plan activation pending', state: 'pending' });
    expect(normalizeBillingAdapterSnapshot({ platformSubscriptionAdmin: false, pendingChanges: [{ kind: 'sms-change', label: 'SMS pending', state: 'pending' }] })).toMatchObject({
      routeState: 'ready',
      pendingChanges: [{ kind: 'sms-change', label: 'SMS pending', state: 'pending' }],
      platformSubscriptionAdmin: false,
    });
  });

  it('models billing action and card fallback state', () => {
    expect(buildBillingActionViewModel('upgrade')).toMatchObject({
      state: 'available',
      parentTarget: '/billing',
      refreshIntent: 'none',
      platformSubscriptionAdmin: false,
    });
    expect(buildBillingCardViewModel('card-primary')).toMatchObject({
      state: 'ready',
      card: { label: 'Primary card', role: 'primary' },
      parentTarget: '/billing',
      refreshIntent: 'none',
      platformSubscriptionAdmin: false,
    });
    expect(buildBillingCardViewModel('missing')).toMatchObject({
      state: 'unavailable',
      card: null,
      parentTarget: '/billing',
      platformSubscriptionAdmin: false,
      unavailableReason: 'Billing card is unavailable or outside the current organization context',
    });
  });

  it('models add new backup expired missing challenge pending and failed card states', () => {
    expect(buildBillingCardViewModel('new')).toMatchObject({
      state: 'add-new',
      card: { role: 'new', state: 'missing' },
      parentTarget: '/billing',
      refreshIntent: 'return-to-parent',
      platformSubscriptionAdmin: false,
    });
    expect(buildBillingCardViewModel('card-backup')).toMatchObject({ state: 'ready', card: { role: 'backup' } });
    expect(buildBillingCardViewModel('card-expired')).toMatchObject({ state: 'expired', card: { role: 'backup' } });
    expect(buildBillingCardViewModel('card-missing')).toMatchObject({ state: 'missing', card: { role: 'backup' } });
    expect(buildBillingCardViewModel('card-challenge')).toMatchObject({ state: 'provider-challenge', refreshIntent: 'provider-challenge' });
    expect(buildBillingCardViewModel('card-pending')).toMatchObject({ state: 'pending', refreshIntent: 'refresh-subscription' });
    expect(buildBillingCardViewModel('card-failed')).toMatchObject({ state: 'failed', refreshIntent: 'retry-mutation' });
  });

  it('models card edit remove and make-default readiness', () => {
    expect(buildBillingCardActionReadiness({ id: 'backup', label: 'Backup', role: 'backup', state: 'ready' })).toEqual([
      { action: 'edit', label: 'Edit card', state: 'available' },
      { action: 'remove', label: 'Remove card', state: 'available' },
      { action: 'make-default', label: 'Make default', state: 'available' },
    ]);
    expect(buildBillingCardActionReadiness({ id: 'primary', label: 'Primary', role: 'primary', state: 'ready' })).toContainEqual({
      action: 'remove',
      label: 'Remove card',
      state: 'blocked',
      reason: 'Primary card cannot be removed until another card is default',
    });
    expect(buildBillingCardActionReadiness({ id: 'challenge', label: 'Challenge', role: 'backup', state: 'provider-challenge' })).toContainEqual({
      action: 'make-default',
      label: 'Make default',
      state: 'blocked',
      reason: 'Provider challenge does not confirm subscription success',
    });
  });

  it('models subscription upgrade plan-change readiness', () => {
    expect(buildBillingUpgradeViewModel()).toMatchObject({
      state: 'confirmation',
      currentPlan: { id: 'starter' },
      targetPlan: { id: 'growth' },
      selectedPlan: { id: 'growth' },
      hasReadyCard: true,
      action: { state: 'ready', nextState: 'confirmation' },
      parentTarget: '/billing',
      platformSubscriptionAdmin: false,
    });

    expect(buildBillingUpgradeActionReadiness({ currentPlanId: 'growth', targetPlanId: 'growth' })).toMatchObject({
      state: 'blocked',
      nextState: 'same-plan',
      reason: 'Target plan is already active',
    });
  });

  it('models card-blocked submitted success failure retry challenge stale and degraded upgrade states', () => {
    expect(buildBillingUpgradeViewModel({ targetPlanId: 'enterprise', hasReadyCard: false })).toMatchObject({
      state: 'card-blocked',
      action: { state: 'blocked', nextTarget: '/billing/card/$cardId', params: { cardId: 'new' } },
    });
    expect(buildBillingUpgradeViewModel({ forcedState: 'submitted' })).toMatchObject({ state: 'submitted', action: { state: 'pending' }, refreshIntent: 'refresh-subscription' });
    expect(buildBillingUpgradeViewModel({ forcedState: 'success' })).toMatchObject({ state: 'success', action: { state: 'success' }, refreshIntent: 'return-to-parent' });
    expect(buildBillingUpgradeViewModel({ forcedState: 'failure', targetPlanId: 'enterprise' })).toMatchObject({
      state: 'failure',
      selectedPlan: { id: 'enterprise' },
      action: { state: 'failed', reason: 'Plan change could not be completed' },
    });
    expect(buildBillingUpgradeViewModel({ forcedState: 'retry', targetPlanId: 'enterprise' })).toMatchObject({ state: 'retry', selectedPlan: { id: 'enterprise' }, refreshIntent: 'retry-mutation' });
    expect(buildBillingUpgradeViewModel({ forcedState: 'challenge-required' })).toMatchObject({ state: 'challenge-required', refreshIntent: 'provider-challenge' });
    expect(buildBillingUpgradeViewModel({ forcedState: 'stale' })).toMatchObject({ state: 'stale', refreshIntent: 'refresh-subscription' });
    expect(buildBillingUpgradeViewModel({ forcedState: 'degraded' })).toMatchObject({ state: 'degraded', refreshIntent: 'contact-support' });
  });

  it('models SMS add-on usage and action readiness', () => {
    expect(buildSmsAddonViewModel()).toMatchObject({
      state: 'usage-warning',
      usage: { used: 850, limit: 1000, warningThreshold: 0.8 },
      hasReadyCard: true,
      parentTarget: '/billing',
      refreshIntent: 'none',
      platformSubscriptionAdmin: false,
    });
    expect(buildSmsAddonActionReadiness({ state: 'inactive', hasReadyCard: true })).toContainEqual({
      action: 'enable',
      label: 'Enable SMS add-on',
      state: 'ready',
      nextState: 'active',
    });
  });

  it('models SMS card-blocked unavailable suspended trial failed retry and partial-success states', () => {
    expect(buildSmsAddonViewModel({ state: 'inactive', hasReadyCard: false })).toMatchObject({
      state: 'card-blocked',
      actions: [{ action: 'enable', state: 'blocked', nextTarget: '/billing/card/$cardId', params: { cardId: 'new' } }, expect.any(Object), expect.any(Object)],
    });
    expect(buildSmsAddonViewModel({ state: 'unavailable' })).toMatchObject({ state: 'unavailable', platformSubscriptionAdmin: false });
    expect(buildSmsAddonViewModel({ state: 'suspended' }).actions).toContainEqual({
      action: 'update-limit',
      label: 'Update SMS limit',
      state: 'blocked',
      reason: 'Suspended SMS add-ons cannot update limits',
    });
    expect(buildSmsAddonViewModel({ state: 'trial', usage: { used: 10, limit: 100, warningThreshold: 0.8 } })).toMatchObject({ state: 'trial', hasReadyCard: true });
    expect(buildSmsAddonViewModel({ state: 'failed' })).toMatchObject({ state: 'failed', refreshIntent: 'retry-mutation' });
    expect(buildSmsAddonViewModel({ state: 'retry' })).toMatchObject({ state: 'retry', refreshIntent: 'retry-mutation' });
    expect(buildSmsAddonViewModel({ state: 'partial-success' })).toMatchObject({ state: 'partial-success', parentRefreshRequired: true });
    expect(buildSmsAddonViewModel({ state: 'stale' })).toMatchObject({ state: 'stale', refreshIntent: 'refresh-subscription' });
    expect(buildSmsAddonViewModel({ state: 'degraded' })).toMatchObject({ state: 'degraded', refreshIntent: 'contact-support' });
  });
});
