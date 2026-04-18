# Greenfield Frontend R0 Route Registration Plan

## Purpose

This document defines the minimum route-registration plan required for R0.

It answers:
- which route roots must exist in R0
- how routes are grouped by shell class
- which later-wave routes must still reserve typed contracts in R0

## Source baseline

Synthesized from:
- `./roadmap.md`
- `./domains.md`
- `./modules.md`
- `./screens.md`
- `./notification-destinations.md`

## R0 build set

R0 must register the following route roots and route classes.

### 1. Public / unsigned root

Routes:
- `/`
- `/confirm-registration/:token`
- `/forgot-password`
- `/reset-password/:token`
- `/register/:token`
- `/auth/cezanne/:tenantGuid`
- `/auth/cezanne/callback?code`
- `/auth/saml?code&error`
- `/users/invite-token`

Requirements:
- public shell only
- token/callback outcomes explicit
- no dependency on authenticated layout

### 2. Authenticated shell root

Routes:
- `/dashboard`
- `/notifications`
- `/inbox?conversation=`
- `/user-profile`
- `/hiring-company-profile`
- `/recruitment-agency-profile`
- `/logout`

Requirements:
- authenticated shell bootstrap
- capability-based nav registration
- shell overlays distinct from domain task flows

### 3. Reserved typed destination families (register contracts in R0 even if UI lands later)

These do not all need full implementation in R0, but the route ids and typed destination shapes must be reserved:
- `job.detail`
- `job.bid.view`
- `job.cv.view`
- `job.schedule`
- `job.offer`
- `candidate.detail`
- `billing.overview`

## Route registration sequence

1. `auth` public routes
2. shell frame route and bootstrap providers
3. dashboard
4. notifications
5. inbox
6. shell-owned overlays/account routes
7. typed destination registry
8. denied/not-found state shells
9. later-wave route stubs or destination placeholders where needed for notification safety

## Route-class mapping for R0

| Route family | Class | R0 expectation |
|---|---|---|
| public auth/token routes | `Public/Token` | fully implemented |
| dashboard | `Page` | fully implemented |
| notifications | `Page` | fully implemented |
| inbox | `PageWithStatefulUrl` | fully implemented |
| user-profile/logout | `ShellOverlay` | fully implemented |
| job/candidate destinations | reserved `PageWithStatefulUrl` / `TaskFlow` families | typed registration contract required |

## Required infrastructure in R0

- route-id registry
- route-class registry
- shell vs task-flow container split
- not-found and access-denied states
- typed notification destination resolver
- query-param preservation helpers for stateful URLs

## Explicit non-goal

R0 does not need to ship every recruiter-core screen, but it does need to register enough of the routing model that later releases do not redefine route ownership ad hoc.
