import { Link } from '@tanstack/react-router';
import { buildBillingCardViewModel, buildBillingOverviewViewModel, buildBillingUpgradeViewModel, buildSmsAddonViewModel } from './support/billing-state';

export function BillingOverviewPage() {
  const view = buildBillingOverviewViewModel();

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
  const view = buildBillingUpgradeViewModel();

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
  const view = buildSmsAddonViewModel();

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
