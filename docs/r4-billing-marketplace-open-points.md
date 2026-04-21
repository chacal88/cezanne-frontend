# R4 Billing and Marketplace Open Points

## Purpose

This document records the R4.6 billing and marketplace closeout boundary after HC-admin billing and RA marketplace foundation slices moved into implementation.

## Confirmed baseline

- Billing and marketplace both belong to `R4` in the roadmap.
- They should not be implemented as one shared execution package.
- Billing is HC-admin and commercial-state heavy.
- Marketplace is a bounded RA domain and should not be blocked artificially on billing.

## What must be frozen before implementation

1. the billing commercial state model for overview, upgrade, SMS, and card flows
2. the final route-class and return behavior for `/billing/card/:id`
3. marketplace ownership as a bounded RA domain
4. capability separation between billing visibility/actionability and marketplace access

## R4 closeout status

Resolved by the R4 billing and marketplace slices:
- billing commercial state is documented in this R4 register and implemented through billing foundation, card, upgrade, and SMS state models; no separate state-machine doc is required for R4 closeout;
- marketplace is an RA-owned route family and does not depend on org-admin/team visibility decisions from R4.3;
- billing state changes are modeled as local action/readiness outcomes only and do not imply app-shell capability refresh or platform subscription administration.

Intentionally deferred beyond R4:
- real billing persistence, payment-processor API integration, invoices, receipts, and subscription mutation side effects;
- app-shell capability refresh driven by backend billing changes;
- marketplace API integration, bidding workflows, CV handoff, assignment persistence, and provider-backed marketplace actions.

R5 sync:
- HC-admin billing remains separate from R5 SysAdmin platform subscription administration.
- RA marketplace remains outside R5 platform administration unless a future marketplace-specific change promotes it.

## Recommended follow-on change order

- `r4-billing-foundation`
- `r4-payment-method-and-card-states`
- `r4-subscription-upgrade-and-plan-change`
- `r4-sms-addon`
- `r4-marketplace-ra`

## Billing foundation decisions implemented

The R4 billing foundation resolves the first billing ownership boundary:
- `/billing` is the HC-admin billing overview.
- `/billing/upgrade` is the subscription-upgrade task flow.
- `/billing/sms` is the SMS add-on task flow.
- `/billing/card/:id` is the billing-owned card flow with `/billing` as parent.
- Billing capabilities are `canViewBilling`, `canUpgradeSubscription`, `canManageSmsBilling`, and `canManageBillingCard`.
- Billing access does not grant Platform navigation or `canManagePlatformSubscriptions`.
- Billing state models now cover ready, hidden, unavailable, action readiness, and card unavailable cases.

Recommended follow-on order now starts with `r4-payment-method-and-card-states`, then `r4-subscription-upgrade-and-plan-change`.

## Payment method and card-state decisions implemented

The R4 payment-method/card slice resolves the first card-management boundary:
- `/billing/card/:id` remains the billing-owned card route.
- `/billing/card/new` is the add-card readiness state through the same route contract.
- Card states are primary, backup, expired, missing, add-new, and unavailable.
- Card actions are edit, remove, and make-default with deterministic available/blocked reasons.
- Card readiness does not add payment processor persistence or platform subscription administration.

Recommended follow-on order now starts with `r4-subscription-upgrade-and-plan-change`, then `r4-sms-addon`.

## Subscription upgrade and plan-change decisions implemented

The R4 subscription-upgrade slice resolves the first plan-change boundary:
- `/billing/upgrade` remains the HC-admin upgrade route.
- Upgrade states are same-plan, card-blocked, confirmation, submitted, success, and failure.
- Plan state includes current plan, target plan, and a local catalog.
- Upgrade readiness consumes payment-card readiness and points card-blocked users to `/billing/card/new`.
- Upgrade readiness does not add checkout persistence or platform subscription administration.

Recommended follow-on order now starts with `r4-sms-addon`, then `r4-marketplace-ra`.

## SMS add-on decisions implemented

The R4 SMS add-on slice resolves the SMS commercial-state boundary:
- `/billing/sms` remains the HC-admin SMS add-on route.
- SMS states are unavailable, inactive, trial, active, suspended, usage-warning, and card-blocked.
- SMS actions are enable, disable, and update-limit with deterministic readiness/blocked reasons.
- SMS readiness consumes payment-card readiness and points card-blocked users to `/billing/card/new`.
- SMS readiness does not add provider configuration, message sending, billing persistence, or platform subscription administration.

Recommended follow-on order now starts with `r4-marketplace-ra`.

## Marketplace RA decisions implemented

The R4 marketplace slice resolves the bounded RA marketplace boundary:
- `/jobmarket/:type` is the RA-owned marketplace route family.
- Supported marketplace types are `fill`, `bidding`, `cvs`, and `assigned`.
- Marketplace states are ready, empty, and unavailable.
- Marketplace access is gated by `canViewMarketplace` for RA contexts.
- Marketplace access does not grant billing, HC-admin, or platform capabilities.

## Billing product-depth follow-up implemented

The `billing-payment-product-depth` follow-up expands the R4 billing foundation from readiness-only screens into route-owned product-depth states:
- overview fixtures now distinguish loading, ready, empty, denied, unavailable, stale, degraded, and pending subscription-refresh states;
- upgrade and SMS task flows preserve selected plan/add-on context across recoverable failure and retry states;
- card setup states include provider challenge, pending, saved, failed, validation-failed, and retry outcomes without treating provider challenge as subscription success;
- adapter fixtures document replaceable seams until stable backend billing contracts are validated;
- `/billing` remains the authenticated HC-admin overview, while public/token payment routes, provider setup, and SysAdmin subscription administration remain outside this route family.
