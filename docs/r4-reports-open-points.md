# R4 Reports Open Points

## Purpose

This document records the planning boundary for `R4.5` reports.

## Confirmed baseline

- Reports should start with a shared foundation, not a special-case report family.
- Export and scheduling are part of the core report contract, not optional follow-up extras.
- Jobs and hiring-process are the best candidates for the first non-specialized report family work.

## What must be frozen now

1. the shared report shell and route family
2. the shared filter/result-state contract
3. export and scheduling command contracts
4. compatibility treatment for `/hiring-company/report/:id?`

## Still open

- whether the legacy aggregate report route stays as a compatibility shell or redirects
- which filters are mandatory in the first report family beyond the baseline shared set
- how much scheduling CRUD belongs in the foundation versus a dedicated later slice

## First change from this area

- `r4-reports-foundation`

## Foundation decisions implemented

The R4 reports foundation resolves the first route/state decisions:
- Canonical index: `/report`.
- Canonical families: `/report/jobs`, `/report/hiring-process`, `/report/teams`, `/report/candidates`, `/report/diversity`, and `/report/source`.
- Legacy aggregate compatibility: `/hiring-company/report/:id?` maps to the new report shell/family routes.
- Shared filters: `period`, `owner`, and `team`.
- Result states: `loading`, `empty`, `denied`, `error`, and `data-ready`.
- Shared commands: `export` and `schedule`, with family-aware availability and visible success/failure states.

Follow-on report-family slices should consume this shell/filter/result/command model. Jobs and hiring-process remain the preferred first non-specialized families; diversity and source remain more specialized and beta-sensitive.
