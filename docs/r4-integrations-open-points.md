# R4 Integrations Open Points

## Purpose

This document records the planning boundary for `R4.4` integrations setup.

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

## Still open

- whether provider detail remains page-like or becomes a routed overlay over the integrations index
- which family should become the first functional integrations slice after the shell
- how much diagnostics behavior belongs in the first provider shell versus a dedicated later slice

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
