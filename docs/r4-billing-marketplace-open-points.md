# R4 Billing and Marketplace Open Points

## Purpose

This document records the unresolved planning boundary for `R4.6` billing and marketplace.

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

## Still open

- whether billing needs a dedicated doc for its commercial state machine
- whether marketplace depends on any org-admin/team visibility decisions from `R4.3`
- how much billing state change should immediately affect capability refresh in the app shell

## Recommended follow-on change order

- `r4-billing-foundation`
- `r4-payment-method-and-card-states`
- `r4-subscription-upgrade-and-plan-change`
- `r4-sms-addon`
- `r4-marketplace-ra`
