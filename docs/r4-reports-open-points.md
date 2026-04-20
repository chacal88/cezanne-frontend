# R4 Reports Open Points

## Purpose

This document records the R4.5 reports closeout boundary after the shared reports foundation moved into implementation.

## Confirmed baseline

- Reports should start with a shared foundation, not a special-case report family.
- Export and scheduling are part of the core report contract, not optional follow-up extras.
- Jobs and hiring-process are the best candidates for the first non-specialized report family work.

## What must be frozen now

1. the shared report shell and route family
2. the shared filter/result-state contract
3. export and scheduling command contracts
4. compatibility treatment for `/hiring-company/report/:id?`

## R4 closeout status

Resolved by the R4 reports foundation:
- `/hiring-company/report/:id?` stays as explicit compatibility behavior that maps into the new report shell/family routes;
- the foundation freezes only the shared filters `period`, `owner`, and `team`; family-specific filters are deferred to their family slices;
- scheduling is a family-aware command contract with availability/success/failure states, not full scheduling CRUD.

Intentionally deferred beyond R4:
- actual report-family implementations beyond the foundation shell;
- jobs, hiring-process, teams, candidates, diversity, and source-specific data contracts;
- scheduling CRUD depth, recurrence editing, ownership, and API persistence;
- export generation and download integration beyond command-state modeling.

R5 sync:
- no R5 package currently owns report-family depth; follow-on report work should open dedicated R4-continuation or later report-family changes.

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
