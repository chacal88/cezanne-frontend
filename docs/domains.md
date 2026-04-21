# Greenfield Frontend Domain Map

## Purpose

This document defines the greenfield frontend domain boundaries that sit between the roadmap and implementation.

It answers:
- which domains exist in the target frontend
- what each domain owns and explicitly does not own
- which modules are expected to live inside each domain
- which domain-to-domain dependencies must be treated as first-class architecture inputs before R0

## Source baseline

Synthesized from:
- `../../docs/frontend-2/frontend-screen-inventory.md`
- `../../docs/frontend-2/frontend-role-to-screen-matrix.md`
- `../../docs/frontend-2/frontend-feature-flag-to-screen-matrix.md`
- `../../docs/frontend-2/frontend-jobs-domain-specification.md`
- `../../docs/frontend-2/frontend-candidate-domain-specification.md`
- `../../docs/frontend-2/frontend-parameters-settings-domain-decomposition.md`
- `../../docs/frontend-2/frontend-modal-and-child-route-classification.md`
- `./roadmap.md`
- `./architecture.md`

## Boundary rules

- **Domain** = a durable ownership boundary for routes, models, adapters, capabilities, and release slicing.
- **Module** = a cohesive implementation slice inside a domain.
- **Shell** owns framing, navigation, entry, and cross-domain resolution; it does not own business workflows.
- **Shared primitives** live below domains; they are not domains.
- **A route belongs to exactly one domain**, even when it launches cross-domain work.
- **Capability decisions are computed at domain or shell boundaries**, never inside low-level components.

## Definitive domain list

| Domain | Primary responsibility | Primary personas | Release center | Notes |
|---|---|---|---|---|
| `auth` | unauthenticated entry, token auth flows, SSO/SAML callbacks, API-first session bootstrap | Public, all internal personas | R0 | Public shell only; login adapts auth `/login`, REST `/authenticate`, and GraphQL enrichment validated from `frontend` |
| `shell` | authenticated frame, nav, notification resolution, account/context entry, route handoff | HC, RA, SysAdmin | R0 | cross-domain orchestration layer |
| `dashboard` | authenticated landing and re-entry hub | HC, RA, limited SysAdmin | R0 | API-backed first dashboard flow with validated aggregate query; not placeholder |
| `jobs` | job list, authoring, detail hub, job-scoped action entry | HC primary, RA contextual | R1 | recruiter-core domain |
| `candidates` | candidate detail, workflow context, candidate actions, docs/contracts/surveys summaries | HC primary, RA contextual | R2 | recruiter-core domain |
| `inbox` | conversation selection and recruiter messaging entry | HC, RA | R0 | shell-adjacent but operationally distinct |
| `marketplace` | RA marketplace and agency collaboration surfaces | RA primary | R4 | separate from recruiter-core HC ownership |
| `public-external` | public application and tokenized external participant flows | Public, external participants | R3 | no authenticated recruiter shell |
| `settings` | user/company/agency settings, careers/application config, hiring flow, custom fields, API endpoints | HC admin, RA admin | R3-R5 | decomposed by subsection, not monolithic |
| `integrations` | provider setup and tokenized integration entry routes | HC admin, external systems | R4-R5 | separated from generic settings due provider-specific risk |
| `reports` | analytics, export, scheduling, report navigation | HC admin | R4 | standalone operational domain |
| `billing` | subscription, upgrade, SMS add-on, card management | HC admin | R4 | monetization and payment-state domain |
| `sysadmin` | platform master data and global administration | SysAdmin | R5 | distinct shell ownership from recruiter-core |

## Domain boundaries

### 1. `auth`

Owns:
- sign-in entry through the API sequence validated from `frontend` (`/login` -> `/authenticate` -> GraphQL enrichment)
- registration / confirm / reset flows
- SSO and SAML initiation/callback completion
- token validation and session bootstrap handoff

Does not own:
- authenticated nav
- recruiter business routes after session establishment

Depends on:
- `shell` for post-auth landing resolution
- `dashboard` for default recruiter landing

### 2. `shell`

Owns:
- authenticated frame
- sidebar/top-nav composition
- notification center and typed destination resolution
- account menu and shell-scoped overlays
- logout and session-loss handling

Does not own:
- jobs or candidate business decisions
- provider-specific setup flows
- report logic

Depends on:
- `auth` for session state
- every routed domain for destination resolution contracts

### 3. `dashboard`

Owns:
- authenticated landing experience
- role-correct quick entry and re-entry surfaces
- dashboard-specific summaries and widgets backed by the validated GraphQL dashboard aggregate

Does not own:
- notification routing
- jobs or candidate workflows themselves

Depends on:
- `shell`
- `jobs`, `candidates`, `inbox`, `reports` for linked destinations

### 4. `jobs`

Owns:
- jobs list and URL-bound list state
- job authoring and edit branching
- job detail hub
- job-scoped task launch points
- job workflow/publication state within recruiter-core scope

Does not own:
- candidate detail hub
- generalized interview/offer/contracts infrastructure
- shell notifications
- full requisition platform workflows beyond the minimum branching needed in recruiter-core

Depends on:
- `shell` for entry and notifications
- `candidates` for candidate-owned deep detail
- `settings` for workflow/config inputs
- `integrations` for provider-backed publishing/scheduling adjacencies

### 5. `candidates`

Owns:
- candidate detail hub in hiring context
- candidate workflow/navigation context
- candidate-scoped actions and return behavior
- candidate documents/contracts/forms/surveys/custom-fields summaries
- candidate collaboration primitives in candidate context

Does not own:
- jobs list/authoring
- shell inbox infrastructure
- tokenized external review/interview surfaces
- standalone provider configuration

Depends on:
- `jobs` for parent job context
- `shell` for entry and notifications
- `inbox` for conversation handoff
- `settings` and `integrations` for downstream capabilities

### 6. `inbox`

Owns:
- inbox route and conversation selection
- conversation-focused URL state
- message-thread entry contract from notifications and linked surfaces

Does not own:
- shell nav
- candidate or job workflow decisions

Depends on:
- `shell` for notification handoff
- `candidates` when conversation entry comes from candidate context

### 7. `marketplace`

Owns:
- recruitment-agency marketplace views
- RA operational list slices such as filled, bidding, cvs, assigned
- agency-side collaboration surfaces rooted in marketplace context

Does not own:
- HC jobs ownership
- generic inbox infrastructure

Depends on:
- `shell`
- `jobs` and `candidates` for linked entity destinations where applicable

### 8. `public-external`

Owns:
- shared job views
- public application
- public surveys
- interview request, review-candidate, interview-feedback token routes
- requisition approval public/token flow

Does not own:
- authenticated recruiter shell
- internal jobs/candidate hubs

Depends on:
- `auth` only for boundary separation, not authenticated shell composition
- `integrations` for provider callback/token contracts when applicable
- `settings` for public configuration inputs

### 9. `settings`

Owns:
- user settings
- company settings
- agency settings
- careers/application/job-listing configuration
- hiring-flow settings
- custom-fields settings
- API endpoints settings
- settings container routing and subsection decomposition

Does not own:
- provider-specific setup state machines
- billing/payment state
- sysadmin master data

Depends on:
- `shell`
- `jobs`, `candidates`, `public-external`, `reports`, `billing`, `integrations` as downstream consumers of configuration

### 10. `integrations`

Owns:
- integrations list/detail for setup
- provider validation/retry/degraded-state handling
- tokenized inbound integration routes for cv/forms/job entry

Does not own:
- generic settings shell
- jobs/candidate business hubs

Depends on:
- `settings` for admin discoverability
- `jobs`, `candidates`, `public-external` for downstream behavior impact

### 11. `reports`

Owns:
- report navigation
- report family pages
- export/scheduling/report-state handling

Does not own:
- settings configuration
- billing

Depends on:
- `shell`
- `settings` for report-enabling configuration inputs where applicable

### 12. `billing`

Owns:
- billing overview
- upgrade flow
- SMS add-on flow
- card management

Does not own:
- generic settings
- platform subscriptions management for sysadmin

Depends on:
- `shell`
- `integrations` only where commercial capability gates provider-backed flows

### 13. `sysadmin`

Owns:
- hiring companies CRUD
- recruitment agencies CRUD
- subscriptions
- sectors/subsectors
- global users and favorite-request administration
- platform-only management shell behavior

Does not own:
- recruiter-core shell
- organization-scoped settings

Depends on:
- `auth` and `shell` only for entry/handoff; no recruiter-core dependency should be required

## Domain dependency matrix

Legend:
- `Primary` = direct dependency required for normal operation
- `Adjacency` = linked but not required on every route
- blank = no direct dependency expected

| From \ To | auth | shell | dashboard | jobs | candidates | inbox | marketplace | public-external | settings | integrations | reports | billing | sysadmin |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| auth |  | Primary | Primary |  |  |  |  | Primary |  |  |  |  | Primary |
| shell | Primary |  | Primary | Primary | Primary | Primary | Primary |  | Primary | Adjacency | Adjacency | Adjacency | Adjacency |
| dashboard |  | Primary |  | Adjacency | Adjacency | Adjacency |  |  |  |  | Adjacency |  |  |
| jobs |  | Primary |  |  | Primary | Adjacency |  |  | Primary | Adjacency |  |  |  |
| candidates |  | Primary |  | Primary |  | Adjacency |  |  | Primary | Adjacency |  |  |  |
| inbox |  | Primary |  | Adjacency | Adjacency |  |  |  |  |  |  |  |  |
| marketplace |  | Primary |  | Adjacency | Adjacency | Adjacency |  |  |  |  |  |  |  |
| public-external | Adjacency |  |  |  |  |  |  |  | Primary | Adjacency |  |  |  |
| settings |  | Primary |  | Adjacency | Adjacency |  |  | Primary |  | Primary | Adjacency | Adjacency |  |
| integrations |  | Adjacency |  | Adjacency | Adjacency |  |  | Adjacency | Primary |  |  | Adjacency |  |
| reports |  | Primary | Adjacency |  |  |  |  |  | Adjacency |  |  |  |  |
| billing |  | Primary |  |  |  |  |  |  | Adjacency | Adjacency |  |  |  |
| sysadmin | Primary | Adjacency |  |  |  |  |  |  |  |  |  |  |  |

## R0 implications

Before R0 implementation starts, the codebase must be able to answer these domain-level questions without ambiguity:
- which route tree roots belong to each domain
- which domain exports capability decisions for each route family
- which routes are shell-owned overlays versus domain-owned task flows
- which later-wave domains must still contribute capability or typed-destination unions in R0

If those answers are not explicit, routing, access, notification resolution, and release slicing will drift during implementation.

## Current-business-rule anchors from `frontend/`

These points are confirmed against the current `frontend/src/app/` code and should constrain greenfield interpretation:

- `auth` owns public entry plus tokenized confirm/reset/register and SSO/SAML callback completion.
- `shell` owns modal-style account entry such as `user-profile`, which currently redirects back to the active route and then opens as an overlay.
- `dashboard` is not static chrome; it already depends on notifications, calendar integration, and role-sensitive aggregate data.
- `jobs` owns both list and hub behavior, but its behavior is materially shaped by `jobRequisition` and `seeJobRequisition`.
- `candidates` owns a very large hiring-context aggregate and action launch points that depend on settings, calendar integration, `smsBeta`, and custom fields.
- `inbox` is a true route-owning domain because conversation selection is URL state, not only local component state.
- `public-external` already mixes multiple tokenized surfaces with different data contracts: shared job, application, review, interview feedback, and requisition approval.
- `settings` is confirmed as an overloaded admin container that already resolves HRIS integrations, surveys, custom fields, settings, user settings, sectors, calendar integration, and custom fields in one route.
- `integrations` is split between internal admin setup routes and unsigned/token entry routes.
- `reports` and `billing` are distinct operational domains; both already have dedicated route families and dedicated resolve logic.
- `sysadmin` visibility is driven primarily by navigation and identity predicates, not by generic recruiter-core assumptions.
