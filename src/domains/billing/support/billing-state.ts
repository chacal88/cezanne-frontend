export type BillingCommercialState = 'ready' | 'hidden' | 'unavailable';
export type BillingRouteStateKind =
  | 'loading'
  | 'ready'
  | 'empty'
  | 'denied'
  | 'unavailable'
  | 'stale'
  | 'degraded'
  | 'saving'
  | 'submitting'
  | 'failed'
  | 'retry'
  | 'success'
  | 'pending'
  | 'challenge-required';
export type BillingActionKind = 'upgrade' | 'manage-sms' | 'manage-card';
export type BillingCardRole = 'primary' | 'backup' | 'new';
export type BillingCardActionKind = 'edit' | 'remove' | 'make-default';
export type BillingPlanId = 'starter' | 'growth' | 'enterprise';
export type BillingUpgradeState = 'same-plan' | 'card-blocked' | 'confirmation' | 'submitted' | 'success' | 'failure' | 'retry' | 'challenge-required' | 'stale' | 'degraded' | 'denied' | 'unavailable';
export type SmsAddonState = 'unavailable' | 'inactive' | 'trial' | 'active' | 'suspended' | 'usage-warning' | 'card-blocked' | 'pending' | 'success' | 'partial-success' | 'failed' | 'retry' | 'stale' | 'degraded' | 'denied';
export type SmsAddonActionKind = 'enable' | 'disable' | 'update-limit';
export type BillingRefreshIntent = 'none' | 'refresh-subscription' | 'retry-mutation' | 'return-to-parent' | 'provider-challenge' | 'contact-support';
export type BillingEntryMode = 'direct' | 'parent' | 'notification';

export type BillingAction = {
  action: BillingActionKind;
  label: string;
  state: 'available' | 'blocked';
  target?: '/billing/upgrade' | '/billing/sms' | '/billing/card/$cardId';
  params?: { cardId: string };
  reason?: string;
};

export type BillingCard = {
  id: string;
  label: string;
  role: BillingCardRole;
  state: 'ready' | 'expired' | 'missing' | 'unavailable' | 'validation-failed' | 'provider-challenge' | 'pending' | 'saved' | 'failed' | 'retry';
};

export type BillingCardAction = {
  action: BillingCardActionKind;
  label: string;
  state: 'available' | 'blocked' | 'saving' | 'pending' | 'failed' | 'success';
  reason?: string;
  nextState?: BillingRouteStateKind;
  refreshIntent?: BillingRefreshIntent;
};

export type BillingPlan = {
  id: BillingPlanId;
  label: string;
  monthlyPrice: number;
  requiresReadyCard: boolean;
};

export type BillingUpgradeAction = {
  label: string;
  state: 'ready' | 'pending' | 'success' | 'failed' | 'blocked' | 'challenge' | 'retry';
  nextState?: BillingUpgradeState;
  reason?: string;
  nextTarget?: '/billing/card/$cardId';
  params?: { cardId: string };
  refreshIntent?: BillingRefreshIntent;
};

export type SmsAddonAction = {
  action: SmsAddonActionKind;
  label: string;
  state: 'ready' | 'blocked' | 'pending' | 'success' | 'failed' | 'retry';
  nextState?: SmsAddonState;
  reason?: string;
  nextTarget?: '/billing/card/$cardId';
  params?: { cardId: string };
  refreshIntent?: BillingRefreshIntent;
};

export type SmsUsage = {
  used: number;
  limit: number;
  warningThreshold: number;
};

export type BillingPendingChange = {
  kind: 'plan-change' | 'sms-change' | 'card-change';
  label: string;
  state: 'pending' | 'failed' | 'retry' | 'success' | 'partial-success';
};

export type BillingAdapterSnapshot = {
  routeState: BillingRouteStateKind;
  commercialState: BillingCommercialState;
  currentPlanId?: BillingPlanId;
  targetPlanId?: BillingPlanId;
  cards: BillingCard[];
  smsState: SmsAddonState;
  smsUsage: SmsUsage;
  hasReadyCard: boolean;
  pendingChanges: BillingPendingChange[];
  refreshIntent: BillingRefreshIntent;
  entryMode: BillingEntryMode;
  platformSubscriptionAdmin: false;
  unavailableReason?: string;
};

export type BillingFixtureName = 'ready' | 'loading' | 'empty' | 'denied' | 'unavailable' | 'stale' | 'degraded' | 'pending-change';

const cardFixtures: BillingCard[] = [
  { id: 'card-primary', label: 'Primary card', role: 'primary', state: 'ready' },
  { id: 'card-backup', label: 'Backup card', role: 'backup', state: 'ready' },
  { id: 'card-expired', label: 'Expired backup card', role: 'backup', state: 'expired' },
  { id: 'card-missing', label: 'Missing card details', role: 'backup', state: 'missing' },
  { id: 'card-challenge', label: 'Card awaiting challenge', role: 'backup', state: 'provider-challenge' },
  { id: 'card-pending', label: 'Card pending confirmation', role: 'backup', state: 'pending' },
  { id: 'card-failed', label: 'Failed card setup', role: 'backup', state: 'failed' },
];

export const billingPlans: BillingPlan[] = [
  { id: 'starter', label: 'Starter', monthlyPrice: 0, requiresReadyCard: false },
  { id: 'growth', label: 'Growth', monthlyPrice: 249, requiresReadyCard: true },
  { id: 'enterprise', label: 'Enterprise', monthlyPrice: 799, requiresReadyCard: true },
];

export const billingRoutes = {
  overview: '/billing',
  upgrade: '/billing/upgrade',
  sms: '/billing/sms',
  card: '/billing/card/$cardId',
  fallback: '/dashboard',
} as const;

export function buildBillingAdapterSnapshot(fixture: BillingFixtureName = 'ready'): BillingAdapterSnapshot {
  const base: BillingAdapterSnapshot = {
    routeState: 'ready',
    commercialState: 'ready',
    currentPlanId: 'starter',
    targetPlanId: 'growth',
    cards: cardFixtures,
    smsState: 'active',
    smsUsage: { used: 850, limit: 1000, warningThreshold: 0.8 },
    hasReadyCard: true,
    pendingChanges: [],
    refreshIntent: 'none',
    entryMode: 'direct',
    platformSubscriptionAdmin: false,
  };

  if (fixture === 'loading') return { ...base, routeState: 'loading', cards: [], smsState: 'inactive', hasReadyCard: false };
  if (fixture === 'empty') return { ...base, routeState: 'empty', cards: [], smsState: 'inactive', smsUsage: { used: 0, limit: 0, warningThreshold: 0.8 }, hasReadyCard: false };
  if (fixture === 'denied') return { ...base, routeState: 'denied', commercialState: 'hidden', hasReadyCard: false, unavailableReason: 'Billing is hidden for this organization' };
  if (fixture === 'unavailable') return { ...base, routeState: 'unavailable', commercialState: 'unavailable', refreshIntent: 'contact-support', unavailableReason: 'Billing service is unavailable' };
  if (fixture === 'stale') return { ...base, routeState: 'stale', refreshIntent: 'refresh-subscription', pendingChanges: [{ kind: 'plan-change', label: 'Plan refresh required', state: 'pending' }] };
  if (fixture === 'degraded') return { ...base, routeState: 'degraded', smsState: 'degraded', refreshIntent: 'contact-support', pendingChanges: [{ kind: 'card-change', label: 'Payment method sync degraded', state: 'retry' }] };
  if (fixture === 'pending-change') return { ...base, routeState: 'pending', refreshIntent: 'refresh-subscription', pendingChanges: [{ kind: 'plan-change', label: 'Growth plan activation pending', state: 'pending' }] };
  return base;
}

export function normalizeBillingAdapterSnapshot(snapshot: Partial<BillingAdapterSnapshot> = {}): BillingAdapterSnapshot {
  const base = buildBillingAdapterSnapshot('ready');
  return {
    ...base,
    ...snapshot,
    cards: snapshot.cards ?? base.cards,
    smsUsage: snapshot.smsUsage ?? base.smsUsage,
    pendingChanges: snapshot.pendingChanges ?? base.pendingChanges,
    platformSubscriptionAdmin: false,
  };
}

function getPlan(planId: BillingPlanId | undefined, fallback: BillingPlan = billingPlans[0]) {
  return billingPlans.find((plan) => plan.id === planId) ?? fallback;
}

function stateReason(state: BillingCommercialState) {
  if (state === 'hidden') return 'Billing is hidden for this organization';
  if (state === 'unavailable') return 'Billing is unavailable';
  return undefined;
}

export function buildBillingActions(state: BillingCommercialState): BillingAction[] {
  if (state !== 'ready') {
    const reason = stateReason(state);
    return [
      { action: 'upgrade', label: 'Upgrade subscription', state: 'blocked', reason },
      { action: 'manage-sms', label: 'Manage SMS add-on', state: 'blocked', reason },
      { action: 'manage-card', label: 'Manage payment card', state: 'blocked', reason },
    ];
  }

  return [
    { action: 'upgrade', label: 'Upgrade subscription', state: 'available', target: '/billing/upgrade' },
    { action: 'manage-sms', label: 'Manage SMS add-on', state: 'available', target: '/billing/sms' },
    { action: 'manage-card', label: 'Manage payment card', state: 'available', target: '/billing/card/$cardId', params: { cardId: 'card-primary' } },
  ];
}

export function buildBillingOverviewViewModel(input: BillingCommercialState | Partial<BillingAdapterSnapshot> = 'ready') {
  const snapshot = typeof input === 'string' ? buildBillingAdapterSnapshot(input === 'hidden' ? 'denied' : input === 'unavailable' ? 'unavailable' : 'ready') : normalizeBillingAdapterSnapshot(input);
  const commercialState = typeof input === 'string' ? input : snapshot.commercialState;
  const planState = snapshot.routeState === 'ready' ? 'active' : snapshot.routeState;
  const smsState = snapshot.routeState === 'ready' ? buildSmsAddonViewModel({ state: snapshot.smsState, usage: snapshot.smsUsage, hasReadyCard: snapshot.hasReadyCard }).state : snapshot.routeState;
  const cardState = snapshot.routeState === 'ready' ? (snapshot.hasReadyCard ? 'ready' : 'empty') : snapshot.routeState;

  return {
    state: snapshot.routeState,
    commercialState,
    planState,
    smsState,
    cardState,
    actions: buildBillingActions(commercialState),
    parentTarget: '/dashboard' as const,
    refreshIntent: snapshot.refreshIntent,
    pendingChanges: snapshot.pendingChanges,
    entryMode: snapshot.entryMode,
    unavailableReason: snapshot.unavailableReason,
    platformSubscriptionAdmin: false,
  };
}

export function buildBillingActionViewModel(kind: BillingActionKind, state: BillingCommercialState = 'ready') {
  const action = buildBillingActions(state).find((candidate) => candidate.action === kind);
  return {
    kind,
    state: action?.state ?? 'blocked',
    label: action?.label ?? 'Billing action unavailable',
    reason: action?.reason,
    parentTarget: '/billing' as const,
    refreshIntent: state === 'ready' ? 'none' as const : 'contact-support' as const,
    platformSubscriptionAdmin: false,
  };
}

export function buildBillingCardViewModel(cardId: string, input: Partial<BillingAdapterSnapshot> = {}) {
  const snapshot = normalizeBillingAdapterSnapshot(input);

  if (snapshot.routeState === 'loading' || snapshot.routeState === 'denied' || snapshot.routeState === 'unavailable' || snapshot.routeState === 'degraded') {
    return {
      state: snapshot.routeState,
      card: null,
      actions: buildBillingCardActionReadiness({ id: cardId, label: 'Billing card unavailable', role: 'backup', state: 'unavailable' }),
      parentTarget: '/billing' as const,
      refreshIntent: snapshot.refreshIntent,
      entryMode: snapshot.entryMode,
      platformSubscriptionAdmin: false,
      unavailableReason: snapshot.unavailableReason ?? 'Billing card is unavailable or outside the current organization context',
    };
  }

  if (cardId === 'new') {
    const addCard: BillingCard = { id: 'new', label: 'Add payment method', role: 'new', state: 'missing' };
    return {
      state: 'add-new' as const,
      card: addCard,
      actions: buildBillingCardActionReadiness(addCard),
      parentTarget: '/billing' as const,
      refreshIntent: 'return-to-parent' as const,
      entryMode: snapshot.entryMode,
      platformSubscriptionAdmin: false,
    };
  }

  const card = snapshot.cards.find((candidate) => candidate.id === cardId);
  if (!card) {
    const unavailableCard: BillingCard = { id: cardId, label: 'Billing card unavailable', role: 'backup', state: 'unavailable' };
    return {
      state: 'unavailable' as const,
      card: null,
      actions: buildBillingCardActionReadiness(unavailableCard),
      parentTarget: '/billing' as const,
      refreshIntent: 'contact-support' as const,
      entryMode: snapshot.entryMode,
      platformSubscriptionAdmin: false,
      unavailableReason: 'Billing card is unavailable or outside the current organization context',
    };
  }

  return {
    state: card.state,
    card,
    actions: buildBillingCardActionReadiness(card),
    parentTarget: '/billing' as const,
    refreshIntent: card.state === 'provider-challenge' ? 'provider-challenge' as const : card.state === 'pending' || card.state === 'saved' ? 'refresh-subscription' as const : card.state === 'failed' || card.state === 'retry' ? 'retry-mutation' as const : 'none' as const,
    entryMode: snapshot.entryMode,
    platformSubscriptionAdmin: false,
  };
}

export function buildBillingCardActionReadiness(card: BillingCard): BillingCardAction[] {
  if (card.state === 'provider-challenge') {
    return [
      { action: 'edit', label: 'Complete provider challenge', state: 'pending', nextState: 'challenge-required', refreshIntent: 'provider-challenge' },
      { action: 'remove', label: 'Remove card', state: 'blocked', reason: 'Provider challenge must finish before card removal' },
      { action: 'make-default', label: 'Make default', state: 'blocked', reason: 'Provider challenge does not confirm subscription success' },
    ];
  }

  if (card.state === 'pending') {
    return [
      { action: 'edit', label: 'Card setup pending', state: 'pending', nextState: 'pending', refreshIntent: 'refresh-subscription' },
      { action: 'remove', label: 'Remove card', state: 'blocked', reason: 'Pending cards cannot be removed until confirmation resolves' },
      { action: 'make-default', label: 'Make default', state: 'blocked', reason: 'Pending cards cannot become default' },
    ];
  }

  if (card.state === 'failed' || card.state === 'retry' || card.state === 'validation-failed') {
    return [
      { action: 'edit', label: card.state === 'validation-failed' ? 'Fix card validation' : 'Retry card setup', state: 'failed', nextState: 'retry', refreshIntent: 'retry-mutation' },
      { action: 'remove', label: 'Remove card', state: 'available' },
      { action: 'make-default', label: 'Make default', state: 'blocked', reason: 'Failed cards cannot become default' },
    ];
  }

  if (card.state === 'saved') {
    return [
      { action: 'edit', label: 'Card saved', state: 'success', nextState: 'success', refreshIntent: 'refresh-subscription' },
      { action: 'remove', label: 'Remove card', state: 'available' },
      { action: 'make-default', label: 'Make default', state: 'available' },
    ];
  }

  if (card.role === 'new') {
    return [
      { action: 'edit', label: 'Add card details', state: 'available' },
      { action: 'remove', label: 'Remove card', state: 'blocked', reason: 'New card has not been saved' },
      { action: 'make-default', label: 'Make default', state: 'blocked', reason: 'New card must be saved before it can become default' },
    ];
  }

  if (card.state === 'unavailable') {
    return [
      { action: 'edit', label: 'Edit card', state: 'blocked', reason: 'Card is unavailable' },
      { action: 'remove', label: 'Remove card', state: 'blocked', reason: 'Card is unavailable' },
      { action: 'make-default', label: 'Make default', state: 'blocked', reason: 'Card is unavailable' },
    ];
  }

  if (card.state === 'missing') {
    return [
      { action: 'edit', label: 'Add missing card details', state: 'available' },
      { action: 'remove', label: 'Remove card', state: 'available' },
      { action: 'make-default', label: 'Make default', state: 'blocked', reason: 'Missing card details must be completed first' },
    ];
  }

  if (card.role === 'primary') {
    return [
      { action: 'edit', label: 'Edit card', state: 'available' },
      { action: 'remove', label: 'Remove card', state: 'blocked', reason: 'Primary card cannot be removed until another card is default' },
      { action: 'make-default', label: 'Make default', state: 'blocked', reason: 'Card is already default' },
    ];
  }

  if (card.state === 'expired') {
    return [
      { action: 'edit', label: 'Update expired card', state: 'available' },
      { action: 'remove', label: 'Remove card', state: 'available' },
      { action: 'make-default', label: 'Make default', state: 'blocked', reason: 'Expired cards cannot become default' },
    ];
  }

  return [
    { action: 'edit', label: 'Edit card', state: 'available' },
    { action: 'remove', label: 'Remove card', state: 'available' },
    { action: 'make-default', label: 'Make default', state: 'available' },
  ];
}

export function buildBillingUpgradeActionReadiness({
  currentPlanId = 'starter',
  targetPlanId = 'growth',
  hasReadyCard = true,
  forcedState,
}: {
  currentPlanId?: BillingPlanId;
  targetPlanId?: BillingPlanId;
  hasReadyCard?: boolean;
  forcedState?: 'submitted' | 'success' | 'failure' | 'retry' | 'challenge-required' | 'stale' | 'degraded' | 'denied' | 'unavailable';
} = {}): BillingUpgradeAction {
  const targetPlan = getPlan(targetPlanId);

  if (forcedState === 'submitted') return { label: 'Upgrade submitted', state: 'pending', nextState: 'submitted', refreshIntent: 'refresh-subscription' };
  if (forcedState === 'success') return { label: 'Upgrade complete', state: 'success', nextState: 'success', refreshIntent: 'return-to-parent' };
  if (forcedState === 'failure') return { label: 'Retry upgrade', state: 'failed', nextState: 'failure', reason: 'Plan change could not be completed', refreshIntent: 'retry-mutation' };
  if (forcedState === 'retry') return { label: `Retry ${targetPlan.label} plan`, state: 'retry', nextState: 'retry', reason: 'Recoverable payment failure preserved the selected plan', refreshIntent: 'retry-mutation' };
  if (forcedState === 'challenge-required') return { label: 'Complete payment challenge', state: 'challenge', nextState: 'challenge-required', reason: 'Payment provider challenge is required before subscription confirmation', refreshIntent: 'provider-challenge' };
  if (forcedState === 'stale') return { label: 'Refresh subscription', state: 'blocked', nextState: 'stale', reason: 'Subscription state is stale; refresh before submitting', refreshIntent: 'refresh-subscription' };
  if (forcedState === 'degraded') return { label: 'Upgrade unavailable', state: 'blocked', nextState: 'degraded', reason: 'Billing payments are degraded', refreshIntent: 'contact-support' };
  if (forcedState === 'denied') return { label: 'Upgrade denied', state: 'blocked', nextState: 'denied', reason: 'Billing is hidden for this organization' };
  if (forcedState === 'unavailable') return { label: 'Upgrade unavailable', state: 'blocked', nextState: 'unavailable', reason: 'Billing service is unavailable', refreshIntent: 'contact-support' };

  if (currentPlanId === targetPlanId) return { label: 'Current plan selected', state: 'blocked', nextState: 'same-plan', reason: 'Target plan is already active' };

  if (targetPlan.requiresReadyCard && !hasReadyCard) {
    return {
      label: 'Add payment method',
      state: 'blocked',
      nextState: 'card-blocked',
      reason: 'A ready payment card is required before changing to this plan',
      nextTarget: '/billing/card/$cardId',
      params: { cardId: 'new' },
    };
  }

  return { label: `Confirm ${targetPlan.label} plan`, state: 'ready', nextState: 'confirmation' };
}

export function buildBillingUpgradeViewModel({
  currentPlanId = 'starter',
  targetPlanId = 'growth',
  hasReadyCard = true,
  forcedState,
}: {
  currentPlanId?: BillingPlanId;
  targetPlanId?: BillingPlanId;
  hasReadyCard?: boolean;
  forcedState?: 'submitted' | 'success' | 'failure' | 'retry' | 'challenge-required' | 'stale' | 'degraded' | 'denied' | 'unavailable';
} = {}) {
  const currentPlan = getPlan(currentPlanId);
  const targetPlan = getPlan(targetPlanId, currentPlan);
  const action = buildBillingUpgradeActionReadiness({ currentPlanId: currentPlan.id, targetPlanId: targetPlan.id, hasReadyCard, forcedState });

  return {
    state: action.nextState ?? 'confirmation',
    currentPlan,
    targetPlan,
    selectedPlan: targetPlan,
    plans: billingPlans,
    hasReadyCard,
    action,
    parentTarget: '/billing' as const,
    refreshIntent: action.refreshIntent ?? 'none' as const,
    platformSubscriptionAdmin: false,
  };
}

export function buildSmsAddonActionReadiness({
  state = 'inactive',
  hasReadyCard = true,
}: {
  state?: SmsAddonState;
  hasReadyCard?: boolean;
} = {}): SmsAddonAction[] {
  if (state === 'denied' || state === 'unavailable' || state === 'degraded') {
    const reason = state === 'denied' ? 'SMS billing is hidden for this organization' : state === 'degraded' ? 'SMS billing is degraded' : 'SMS add-on is unavailable for this organization';
    const refreshIntent: BillingRefreshIntent = state === 'degraded' ? 'contact-support' : 'none';
    return [
      { action: 'enable', label: 'Enable SMS add-on', state: 'blocked', reason, refreshIntent },
      { action: 'disable', label: 'Disable SMS add-on', state: 'blocked', reason, refreshIntent },
      { action: 'update-limit', label: 'Update SMS limit', state: 'blocked', reason, refreshIntent },
    ];
  }

  if (state === 'pending') {
    return [
      { action: 'enable', label: 'SMS change pending', state: 'pending', nextState: 'pending', refreshIntent: 'refresh-subscription' },
      { action: 'disable', label: 'Disable SMS add-on', state: 'blocked', reason: 'Pending SMS changes must finish before another mutation' },
      { action: 'update-limit', label: 'Update SMS limit', state: 'blocked', reason: 'Pending SMS changes must finish before limits can change' },
    ];
  }

  if (state === 'success' || state === 'partial-success') {
    return [
      { action: 'enable', label: state === 'partial-success' ? 'Partially enabled SMS add-on' : 'SMS add-on updated', state: 'success', nextState: state, refreshIntent: 'return-to-parent' },
      { action: 'disable', label: 'Disable SMS add-on', state: 'ready', nextState: 'inactive' },
      { action: 'update-limit', label: 'Update SMS limit', state: 'ready', nextState: 'active' },
    ];
  }

  if (state === 'failed' || state === 'retry') {
    return [
      { action: 'enable', label: 'Retry SMS add-on', state: 'retry', nextState: 'retry', reason: 'Recoverable SMS billing failure preserved the selected add-on', refreshIntent: 'retry-mutation' },
      { action: 'disable', label: 'Disable SMS add-on', state: 'blocked', reason: 'Resolve the failed SMS change before disabling' },
      { action: 'update-limit', label: 'Retry SMS limit update', state: 'retry', nextState: 'retry', refreshIntent: 'retry-mutation' },
    ];
  }

  if (state === 'stale') {
    const reason = 'SMS subscription state is stale; refresh before submitting';
    return [
      { action: 'enable', label: 'Refresh SMS state', state: 'blocked', reason, refreshIntent: 'refresh-subscription' },
      { action: 'disable', label: 'Refresh SMS state', state: 'blocked', reason, refreshIntent: 'refresh-subscription' },
      { action: 'update-limit', label: 'Refresh SMS state', state: 'blocked', reason, refreshIntent: 'refresh-subscription' },
    ];
  }

  if (state === 'card-blocked' || (!hasReadyCard && (state === 'inactive' || state === 'trial'))) {
    return [
      {
        action: 'enable',
        label: 'Add payment method',
        state: 'blocked',
        nextState: 'card-blocked',
        reason: 'A ready payment card is required before enabling SMS billing',
        nextTarget: '/billing/card/$cardId',
        params: { cardId: 'new' },
      },
      { action: 'disable', label: 'Disable SMS add-on', state: 'blocked', reason: 'SMS add-on is not active' },
      { action: 'update-limit', label: 'Update SMS limit', state: 'blocked', reason: 'SMS add-on must be active before limits can change' },
    ];
  }

  if (state === 'inactive') {
    return [
      { action: 'enable', label: 'Enable SMS add-on', state: 'ready', nextState: 'active' },
      { action: 'disable', label: 'Disable SMS add-on', state: 'blocked', reason: 'SMS add-on is not active' },
      { action: 'update-limit', label: 'Update SMS limit', state: 'blocked', reason: 'SMS add-on must be active before limits can change' },
    ];
  }

  if (state === 'suspended') {
    return [
      { action: 'enable', label: 'Enable SMS add-on', state: 'blocked', reason: 'Suspended SMS add-ons require support review' },
      { action: 'disable', label: 'Disable SMS add-on', state: 'ready', nextState: 'inactive' },
      { action: 'update-limit', label: 'Update SMS limit', state: 'blocked', reason: 'Suspended SMS add-ons cannot update limits' },
    ];
  }

  return [
    { action: 'enable', label: 'Enable SMS add-on', state: 'blocked', reason: 'SMS add-on is already active or trialing' },
    { action: 'disable', label: 'Disable SMS add-on', state: 'ready', nextState: 'inactive' },
    { action: 'update-limit', label: 'Update SMS limit', state: 'ready', nextState: 'active' },
  ];
}

export function buildSmsAddonViewModel({
  state = 'active',
  hasReadyCard = true,
  usage = { used: 850, limit: 1000, warningThreshold: 0.8 },
}: {
  state?: SmsAddonState;
  hasReadyCard?: boolean;
  usage?: SmsUsage;
} = {}) {
  const usageRatio = usage.limit > 0 ? usage.used / usage.limit : 0;
  const resolvedState: SmsAddonState = state === 'active' && usageRatio >= usage.warningThreshold ? 'usage-warning' : state;
  const routeState: SmsAddonState = !hasReadyCard && (state === 'inactive' || state === 'trial') ? 'card-blocked' : resolvedState;
  const actions = buildSmsAddonActionReadiness({ state: routeState, hasReadyCard });
  const refreshIntent = actions.find((action) => action.refreshIntent)?.refreshIntent ?? 'none';

  return {
    state: routeState,
    usage,
    usageRatio,
    hasReadyCard,
    actions,
    parentTarget: '/billing' as const,
    refreshIntent,
    parentRefreshRequired: refreshIntent === 'refresh-subscription' || refreshIntent === 'return-to-parent',
    platformSubscriptionAdmin: false,
  };
}
