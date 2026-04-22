import { Link } from '@tanstack/react-router';
import {
  buildBillingAdapterSnapshot,
  buildBillingCardViewModel,
  buildBillingOverviewViewModel,
  buildBillingUpgradeViewModel,
  buildSmsAddonViewModel,
  type BillingFixtureName,
  type BillingPlanId,
  type BillingUpgradeState,
  type SmsAddonState,
} from './support/billing-state';

const billingFixtures = new Set<BillingFixtureName>(['ready', 'loading', 'empty', 'denied', 'unavailable', 'stale', 'degraded', 'pending-change']);
const upgradeStates = new Set<BillingUpgradeState>(['same-plan', 'card-blocked', 'confirmation', 'submitted', 'success', 'failure', 'retry', 'challenge-required', 'stale', 'degraded', 'denied', 'unavailable']);
const smsStates = new Set<SmsAddonState>(['unavailable', 'inactive', 'trial', 'active', 'suspended', 'usage-warning', 'card-blocked', 'pending', 'success', 'partial-success', 'failed', 'retry', 'stale', 'degraded', 'denied']);
const planIds = new Set<BillingPlanId>(['starter', 'growth', 'enterprise']);

function getSearchParam(name: string) {
  return new URLSearchParams(window.location.search).get(name);
}

function billingFixtureFromSearch() {
  const value = getSearchParam('fixture');
  return value && billingFixtures.has(value as BillingFixtureName) ? (value as BillingFixtureName) : undefined;
}

function billingUpgradeStateFromSearch() {
  const value = getSearchParam('state');
  return value && upgradeStates.has(value as BillingUpgradeState) ? (value as BillingUpgradeState) : undefined;
}

function smsStateFromSearch() {
  const value = getSearchParam('state');
  return value && smsStates.has(value as SmsAddonState) ? (value as SmsAddonState) : undefined;
}

function planIdFromSearch(name: string) {
  const value = getSearchParam(name);
  return value && planIds.has(value as BillingPlanId) ? (value as BillingPlanId) : undefined;
}

export function BillingOverviewPage() {
  const fixture = billingFixtureFromSearch();
  const view = fixture ? buildBillingOverviewViewModel(buildBillingAdapterSnapshot(fixture)) : buildBillingOverviewViewModel();

  return (
    <section>
      <h1>Billing</h1>
      <p>HC-admin billing product depth</p>
      <p data-testid="billing-state">{view.state}</p>
      <p data-testid="billing-commercial-state">{view.commercialState}</p>
      <p data-testid="billing-plan-state">{view.planState}</p>
      <p data-testid="billing-sms-state">{view.smsState}</p>
      <p data-testid="billing-card-state">{view.cardState}</p>
      <p data-testid="billing-refresh-intent">{view.refreshIntent}</p>
      <p data-testid="billing-entry-mode">{view.entryMode}</p>
      <p data-testid="billing-platform-subscription-admin">{String(view.platformSubscriptionAdmin)}</p>
      {view.unavailableReason ? <p data-testid="billing-unavailable-reason">{view.unavailableReason}</p> : null}
      <ul aria-label="Pending billing changes">
        {view.pendingChanges.map((change) => (
          <li key={`${change.kind}-${change.label}`} data-testid={`billing-pending-${change.kind}`}>
            {change.label}: {change.state}
          </li>
        ))}
      </ul>
      <ul aria-label="Billing actions">
        {view.actions.map((action) => (
          <li key={action.action} data-testid={`billing-action-${action.action}`}>
            {action.target === '/billing/card/$cardId' ? (
              <Link to="/billing/card/$cardId" params={{ cardId: action.params?.cardId ?? 'card-primary' }}>{action.label}</Link>
            ) : action.target ? (
              <Link to={action.target}>{action.label}</Link>
            ) : action.label}: {action.state}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BillingUpgradePage() {
  const state = billingUpgradeStateFromSearch();
  const currentPlanId = planIdFromSearch('currentPlan');
  const targetPlanId = planIdFromSearch('targetPlan');
  const hasReadyCard = getSearchParam('readyCard') === 'false' ? false : true;
  const view = buildBillingUpgradeViewModel({
    currentPlanId,
    targetPlanId,
    hasReadyCard,
    forcedState: state && state !== 'same-plan' && state !== 'card-blocked' && state !== 'confirmation' ? state : undefined,
  });

  return (
    <section>
      <p>Billing upgrade</p>
      <h1>Upgrade subscription</h1>
      <p data-testid="billing-upgrade-state">{view.state}</p>
      <p data-testid="billing-upgrade-current-plan">{view.currentPlan.id}</p>
      <p data-testid="billing-upgrade-target-plan">{view.targetPlan.id}</p>
      <p data-testid="billing-upgrade-selected-plan">{view.selectedPlan.id}</p>
      <p data-testid="billing-upgrade-ready-card">{String(view.hasReadyCard)}</p>
      <p data-testid="billing-upgrade-action-state">{view.action.state}</p>
      <p data-testid="billing-upgrade-refresh-intent">{view.refreshIntent}</p>
      <p data-testid="billing-upgrade-platform-subscription-admin">{String(view.platformSubscriptionAdmin)}</p>
      {view.action.reason ? <p data-testid="billing-upgrade-reason">{view.action.reason}</p> : null}
      <ul>
        {view.plans.map((plan) => (
          <li key={plan.id} data-testid={`billing-plan-${plan.id}`}>
            {plan.label}: {plan.monthlyPrice}
          </li>
        ))}
      </ul>
      <Link to={view.parentTarget} data-testid="billing-upgrade-parent-link">
        Back to billing
      </Link>
    </section>
  );
}

export function BillingSmsPage() {
  const state = smsStateFromSearch();
  const hasReadyCard = getSearchParam('readyCard') === 'false' ? false : true;
  const usage = state === 'active' ? { used: 200, limit: 1000, warningThreshold: 0.8 } : undefined;
  const view = buildSmsAddonViewModel({ state, hasReadyCard, usage });

  return (
    <section>
      <p>SMS billing</p>
      <h1>SMS add-on</h1>
      <p data-testid="billing-sms-state">{view.state}</p>
      <p data-testid="billing-sms-ready-card">{String(view.hasReadyCard)}</p>
      <p data-testid="billing-sms-usage">{view.usage.used}</p>
      <p data-testid="billing-sms-limit">{view.usage.limit}</p>
      <p data-testid="billing-sms-refresh-intent">{view.refreshIntent}</p>
      <p data-testid="billing-sms-parent-refresh-required">{String(view.parentRefreshRequired)}</p>
      <p data-testid="billing-sms-platform-subscription-admin">{String(view.platformSubscriptionAdmin)}</p>
      <ul>
        {view.actions.map((action) => (
          <li key={action.action} data-testid={`billing-sms-action-${action.action}`}>
            {action.label}: {action.state}
          </li>
        ))}
      </ul>
      <Link to={view.parentTarget} data-testid="billing-sms-parent-link">
        Back to billing
      </Link>
    </section>
  );
}

export function BillingCardPage({ cardId }: { cardId: string }) {
  const view = buildBillingCardViewModel(cardId);

  return (
    <section>
      <p>Billing card</p>
      <h1>{view.card?.label ?? 'Billing card unavailable'}</h1>
      <p data-testid="billing-card-detail-state">{view.state}</p>
      {view.card ? <p data-testid="billing-card-role">{view.card.role}</p> : null}
      <p data-testid="billing-card-refresh-intent">{view.refreshIntent}</p>
      <p data-testid="billing-card-entry-mode">{view.entryMode}</p>
      <p data-testid="billing-card-platform-subscription-admin">{String(view.platformSubscriptionAdmin)}</p>
      {view.unavailableReason ? <p data-testid="billing-card-unavailable-reason">{view.unavailableReason}</p> : null}
      <ul>
        {view.actions.map((action) => (
          <li key={action.action} data-testid={`billing-card-action-${action.action}`}>
            {action.label}: {action.state}
          </li>
        ))}
      </ul>
      <Link to={view.parentTarget} data-testid="billing-card-parent-link">
        Back to billing
      </Link>
    </section>
  );
}
