import {
  buildBillingActionViewModel,
  buildBillingCardActionReadiness,
  buildBillingCardViewModel,
  buildBillingOverviewViewModel,
  buildBillingUpgradeActionReadiness,
  buildBillingUpgradeViewModel,
  buildSmsAddonActionReadiness,
  buildSmsAddonViewModel,
  billingRoutes,
} from './billing-state';

describe('billing foundation state', () => {
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
      planState: 'active',
      smsState: 'available',
      cardState: 'ready',
      parentTarget: '/dashboard',
      platformSubscriptionAdmin: false,
    });
  });

  it('blocks billing actions when billing is hidden', () => {
    expect(buildBillingOverviewViewModel('hidden').actions).toEqual([
      { action: 'upgrade', label: 'Upgrade subscription', state: 'blocked', reason: 'Billing is hidden for this organization' },
      { action: 'manage-sms', label: 'Manage SMS add-on', state: 'blocked', reason: 'Billing is hidden for this organization' },
      { action: 'manage-card', label: 'Manage payment card', state: 'blocked', reason: 'Billing is hidden for this organization' },
    ]);
  });

  it('models billing action and card fallback state', () => {
    expect(buildBillingActionViewModel('upgrade')).toMatchObject({
      state: 'available',
      parentTarget: '/billing',
      platformSubscriptionAdmin: false,
    });
    expect(buildBillingCardViewModel('card-primary')).toMatchObject({
      state: 'ready',
      card: { label: 'Primary card', role: 'primary' },
      parentTarget: '/billing',
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

  it('models add new backup expired and missing card states', () => {
    expect(buildBillingCardViewModel('new')).toMatchObject({
      state: 'add-new',
      card: { role: 'new', state: 'missing' },
      parentTarget: '/billing',
      platformSubscriptionAdmin: false,
    });
    expect(buildBillingCardViewModel('card-backup')).toMatchObject({
      state: 'ready',
      card: { role: 'backup' },
      platformSubscriptionAdmin: false,
    });
    expect(buildBillingCardViewModel('card-expired')).toMatchObject({
      state: 'expired',
      card: { role: 'backup' },
    });
    expect(buildBillingCardViewModel('card-missing')).toMatchObject({
      state: 'missing',
      card: { role: 'backup' },
    });
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
    expect(buildBillingCardActionReadiness({ id: 'expired', label: 'Expired', role: 'backup', state: 'expired' })).toContainEqual({
      action: 'make-default',
      label: 'Make default',
      state: 'blocked',
      reason: 'Expired cards cannot become default',
    });
  });

  it('models subscription upgrade plan-change readiness', () => {
    expect(buildBillingUpgradeViewModel()).toMatchObject({
      state: 'confirmation',
      currentPlan: { id: 'starter' },
      targetPlan: { id: 'growth' },
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

  it('models card-blocked submitted success and failure upgrade states', () => {
    expect(buildBillingUpgradeViewModel({ targetPlanId: 'enterprise', hasReadyCard: false })).toMatchObject({
      state: 'card-blocked',
      action: {
        state: 'blocked',
        nextTarget: '/billing/card/$cardId',
        params: { cardId: 'new' },
      },
      platformSubscriptionAdmin: false,
    });
    expect(buildBillingUpgradeViewModel({ forcedState: 'submitted' })).toMatchObject({ state: 'submitted', action: { state: 'pending' } });
    expect(buildBillingUpgradeViewModel({ forcedState: 'success' })).toMatchObject({ state: 'success', action: { state: 'success' } });
    expect(buildBillingUpgradeViewModel({ forcedState: 'failure' })).toMatchObject({
      state: 'failure',
      action: { state: 'failed', reason: 'Plan change could not be completed' },
    });
  });

  it('models SMS add-on usage and action readiness', () => {
    expect(buildSmsAddonViewModel()).toMatchObject({
      state: 'usage-warning',
      usage: { used: 850, limit: 1000, warningThreshold: 0.8 },
      hasReadyCard: true,
      parentTarget: '/billing',
      platformSubscriptionAdmin: false,
    });
    expect(buildSmsAddonActionReadiness({ state: 'inactive', hasReadyCard: true })).toContainEqual({
      action: 'enable',
      label: 'Enable SMS add-on',
      state: 'ready',
      nextState: 'active',
    });
  });

  it('models SMS card-blocked unavailable suspended and trial states', () => {
    expect(buildSmsAddonViewModel({ state: 'inactive', hasReadyCard: false })).toMatchObject({
      state: 'card-blocked',
      actions: [
        {
          action: 'enable',
          state: 'blocked',
          nextTarget: '/billing/card/$cardId',
          params: { cardId: 'new' },
        },
        expect.any(Object),
        expect.any(Object),
      ],
      platformSubscriptionAdmin: false,
    });
    expect(buildSmsAddonViewModel({ state: 'unavailable' })).toMatchObject({
      state: 'unavailable',
      platformSubscriptionAdmin: false,
    });
    expect(buildSmsAddonViewModel({ state: 'suspended' }).actions).toContainEqual({
      action: 'update-limit',
      label: 'Update SMS limit',
      state: 'blocked',
      reason: 'Suspended SMS add-ons cannot update limits',
    });
    expect(buildSmsAddonViewModel({ state: 'trial', usage: { used: 10, limit: 100, warningThreshold: 0.8 } })).toMatchObject({
      state: 'trial',
      hasReadyCard: true,
    });
  });
});
