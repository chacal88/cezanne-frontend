# Billing Product-Depth Contract Notes

## Purpose

This note records the confirmed source-to-code gap for the `billing-payment-product-depth` change and keeps confirmed facts separate from validation gaps while the frontend runs on deterministic adapter fixtures.

## Confirmed frontend route ownership

- `/billing` is the HC-admin billing overview route.
- `/billing/upgrade` is the HC-admin subscription upgrade/change task flow.
- `/billing/sms` is the HC-admin SMS add-on task flow.
- `/billing/card/:id` is the billing-owned card add/edit/manage flow with `/billing` as parent return.
- Billing capabilities are separate from SysAdmin subscription administration:
  - `canViewBilling`
  - `canUpgradeSubscription`
  - `canManageSmsBilling`
  - `canManageBillingCard`
- Public/token payment routes, provider setup, SMS provider configuration, and SysAdmin `/subscriptions*` administration are outside this route family.

## Archived prerequisite specs

- `billing-foundation` confirms route ownership, capability separation, parent/fallback behavior, and deterministic readiness before backend billing APIs are wired.
- `payment-method-card-states` extends the billing foundation with primary, backup, expired, missing, add-new, and unavailable card readiness.
- `subscription-upgrade-plan-change` extends the billing foundation with same-plan, card-blocked, confirmation, submitted, success, and failure upgrade readiness.
- `sms-addon-billing` extends the billing foundation with unavailable, inactive, trial, active, suspended, usage-warning, and card-blocked SMS readiness.

## Confirmed backend contracts

Confirmed from the current frontend execution package:

- No stable backend billing mutation API is wired in `recruit-frontend` for plan change, SMS add-on mutation, or card persistence.
- The current implementation must therefore expose adapter seams and deterministic fixtures that can be replaced later.
- Route state must not imply subscription mutation success until a billing adapter returns confirmed subscription state.

## Unknown fields to validate before real API wiring

The following fields are intentionally represented as adapter fixture inputs, not invented API contracts:

- subscription identifier, plan catalog identifiers, pricing, currency, billing interval, renewal date, cancellation/pending-change state, and stale-refresh token/version;
- SMS package/add-on identifier, included quota, overage rules, usage window, partial-success semantics, and provider billing linkage;
- payment method identifier, provider setup-intent/challenge state, card validation errors, retry tokens, and default-card mutation semantics;
- SCA-like challenge and pending-state status names returned by the payment provider;
- authorization semantics for hidden billing versus billing service unavailable/degraded;
- parent-shell refresh signals after successful or partially successful billing mutations.

## Product-depth acceptance focus

The frontend should render loading, ready, empty, denied, unavailable, stale, degraded, saving/submitting, failed, retry, and success states where applicable. Failed upgrade and SMS flows must preserve selected plan/add-on context for retry. Card setup challenge or pending state must not imply subscription success until the billing adapter confirms subscription state.
