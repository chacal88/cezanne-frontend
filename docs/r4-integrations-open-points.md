# R4 Integrations Open Points

## Purpose

This document records the R4.4 integrations closeout boundary after the authenticated admin shell moved into implementation.

## Confirmed baseline

- Integrations admin setup must not be collapsed into one generic provider form.
- The common shell belongs in the `integrations` domain, but provider-family contracts remain distinct.
- Token-entry routes already exist in source and are not part of the new admin setup shell.

## What must be frozen now

1. `/integrations` and `/integrations/:id` as the internal admin route family
2. the provider state model:
   - `connected`
   - `disconnected`
   - `degraded`
   - `reauth_required`
   - `unavailable`
3. the split between:
   - admin configuration
   - auth/reauth
   - diagnostics/health
4. family-level planning for HRIS, job boards, and other provider types

## R4 closeout status

Resolved by the R4 integrations shell:
- provider detail is a page-like route at `/integrations/:id` with `/integrations` as its parent-index fallback;
- the R4 shell freezes provider states and action taxonomy, but does not select a first functional provider family;
- diagnostics are represented as provider actions in the shell and reserved for provider-specific implementation depth.

Intentionally deferred beyond R4:
- provider-specific setup flows;
- auth and reauth execution beyond route/action modeling;
- diagnostics execution, logs, and health checks;
- job-board and HRIS workflow implementations.

R5 sync:
- R5 only keeps integration token leftovers as conditional scope after reconciliation; authenticated provider setup depth remains outside R5 unless a new provider-specific change is opened.

## First change from this area

- `r4-integrations-shell`

## Foundation decisions implemented

The R4 integrations shell resolves the first route/state decisions:
- Internal admin index: `/integrations`.
- Internal provider detail: `/integrations/:id`.
- Detail parent fallback: `/integrations`; unknown providers render explicit `unavailable` state with the same parent-index return.
- Provider states: `connected`, `disconnected`, `degraded`, `reauth_required`, and `unavailable`.
- Action taxonomy: configuration (`configure`), auth (`connect`, `reauthorize`), and diagnostics (`run_diagnostics`, `view_logs`).
- Public/token callback routes under `/integration/*` remain separate from authenticated admin setup routes.

Follow-on provider-family implementation must consume this shell/state model and add provider-specific configuration/auth/diagnostics behavior without collapsing all providers into one generic form.
