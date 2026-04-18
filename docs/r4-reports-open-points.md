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
