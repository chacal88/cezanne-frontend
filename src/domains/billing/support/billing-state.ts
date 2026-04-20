export type BillingCommercialState = 'ready' | 'hidden' | 'unavailable';
export type BillingActionKind = 'upgrade' | 'manage-sms' | 'manage-card';
export type BillingCardRole = 'primary' | 'backup' | 'new';
export type BillingCardActionKind = 'edit' | 'remove' | 'make-default';
export type BillingPlanId = 'starter' | 'growth' | 'enterprise';
export type BillingUpgradeState = 'same-plan' | 'card-blocked' | 'confirmation' | 'submitted' | 'success' | 'failure';
export type SmsAddonState = 'unavailable' | 'inactive' | 'trial' | 'active' | 'suspended' | 'usage-warning' | 'card-blocked';
export type SmsAddonActionKind = 'enable' | 'disable' | 'update-limit';

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
  state: 'ready' | 'expired' | 'missing' | 'unavailable';
};

export type BillingCardAction = {
  action: BillingCardActionKind;
  label: string;
  state: 'available' | 'blocked';
  reason?: string;
};

export type BillingPlan = {
  id: BillingPlanId;
  label: string;
  monthlyPrice: number;
  requiresReadyCard: boolean;
};

export type BillingUpgradeAction = {
  label: string;
  state: 'ready' | 'pending' | 'success' | 'failed' | 'blocked';
  nextState?: BillingUpgradeState;
  reason?: string;
  nextTarget?: '/billing/card/$cardId';
  params?: { cardId: string };
};

export type SmsAddonAction = {
  action: SmsAddonActionKind;
  label: string;
  state: 'ready' | 'blocked';
  nextState?: SmsAddonState;
  reason?: string;
  nextTarget?: '/billing/card/$cardId';
  params?: { cardId: string };
};

export type SmsUsage = {
  used: number;
  limit: number;
  warningThreshold: number;
};

const cards: BillingCard[] = [
  { id: 'card-primary', label: 'Primary card', role: 'primary', state: 'ready' },
  { id: 'card-backup', label: 'Backup card', role: 'backup', state: 'ready' },
  { id: 'card-expired', label: 'Expired backup card', role: 'backup', state: 'expired' },
  { id: 'card-missing', label: 'Missing card details', role: 'backup', state: 'missing' },
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

export function buildBillingActions(state: BillingCommercialState): BillingAction[] {
  if (state !== 'ready') {
    const reason = state === 'hidden' ? 'Billing is hidden for this organization' : 'Billing is unavailable';
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

export function buildBillingOverviewViewModel(state: BillingCommercialState = 'ready') {
  return {
    state,
    planState: state === 'ready' ? 'active' : state,
    smsState: state === 'ready' ? 'available' : state,
    cardState: state === 'ready' ? 'ready' : state,
    actions: buildBillingActions(state),
    parentTarget: '/dashboard' as const,
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
    platformSubscriptionAdmin: false,
  };
}

export function buildBillingCardViewModel(cardId: string) {
  if (cardId === 'new') {
    const addCard: BillingCard = { id: 'new', label: 'Add payment method', role: 'new', state: 'missing' };
    return {
      state: 'add-new' as const,
      card: addCard,
      actions: buildBillingCardActionReadiness(addCard),
      parentTarget: '/billing' as const,
      platformSubscriptionAdmin: false,
    };
  }

  const card = cards.find((candidate) => candidate.id === cardId);
  if (!card) {
    const unavailableCard: BillingCard = { id: cardId, label: 'Billing card unavailable', role: 'backup', state: 'unavailable' };
    return {
      state: 'unavailable' as const,
      card: null,
      actions: buildBillingCardActionReadiness(unavailableCard),
      parentTarget: '/billing' as const,
      platformSubscriptionAdmin: false,
      unavailableReason: 'Billing card is unavailable or outside the current organization context',
    };
  }

  return {
    state: card.state,
    card,
    actions: buildBillingCardActionReadiness(card),
    parentTarget: '/billing' as const,
    platformSubscriptionAdmin: false,
  };
}

export function buildBillingCardActionReadiness(card: BillingCard): BillingCardAction[] {
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
  forcedState?: 'submitted' | 'success' | 'failure';
} = {}): BillingUpgradeAction {
  const targetPlan = billingPlans.find((plan) => plan.id === targetPlanId) ?? billingPlans[0];

  if (forcedState === 'submitted') {
    return { label: 'Upgrade submitted', state: 'pending', nextState: 'submitted' };
  }

  if (forcedState === 'success') {
    return { label: 'Upgrade complete', state: 'success', nextState: 'success' };
  }

  if (forcedState === 'failure') {
    return { label: 'Retry upgrade', state: 'failed', nextState: 'failure', reason: 'Plan change could not be completed' };
  }

  if (currentPlanId === targetPlanId) {
    return { label: 'Current plan selected', state: 'blocked', nextState: 'same-plan', reason: 'Target plan is already active' };
  }

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
  forcedState?: 'submitted' | 'success' | 'failure';
} = {}) {
  const currentPlan = billingPlans.find((plan) => plan.id === currentPlanId) ?? billingPlans[0];
  const targetPlan = billingPlans.find((plan) => plan.id === targetPlanId) ?? currentPlan;
  const action = buildBillingUpgradeActionReadiness({ currentPlanId: currentPlan.id, targetPlanId: targetPlan.id, hasReadyCard, forcedState });

  return {
    state: action.nextState ?? 'confirmation',
    currentPlan,
    targetPlan,
    plans: billingPlans,
    hasReadyCard,
    action,
    parentTarget: '/billing' as const,
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
  if (state === 'unavailable') {
    const reason = 'SMS add-on is unavailable for this organization';
    return [
      { action: 'enable', label: 'Enable SMS add-on', state: 'blocked', reason },
      { action: 'disable', label: 'Disable SMS add-on', state: 'blocked', reason },
      { action: 'update-limit', label: 'Update SMS limit', state: 'blocked', reason },
    ];
  }

  if (!hasReadyCard && (state === 'inactive' || state === 'trial')) {
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
  const actions = buildSmsAddonActionReadiness({ state: resolvedState, hasReadyCard });

  return {
    state: !hasReadyCard && (state === 'inactive' || state === 'trial') ? 'card-blocked' as SmsAddonState : resolvedState,
    usage,
    usageRatio,
    hasReadyCard,
    actions,
    parentTarget: '/billing' as const,
    platformSubscriptionAdmin: false,
  };
}
