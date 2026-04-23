# V0 Auth, Shell, and Dashboard Visual Contract

## Purpose

This document is the first visual-readiness package from `pre-figma-flow-review.md`. It prepares the R0 anchor flows for Figma/screen-flow work without using Figma as a source of product behavior.

Project-wide pixel-parity rule: wherever a legacy screen/state exists, the final Figma and implementation replacement must match the legacy frontend at the matched viewport and data/state. `Figma-ready` is not replacement approval; unapproved visual differences are blockers until fixed or recorded as an explicit product exception.

V0 covers:
- auth entry and token flows;
- SSO callback and logout/session transitions;
- authenticated shell navigation and account/profile surfaces;
- dashboard, notifications, and inbox entry surfaces.

## Readiness status

| Family | Contract status | Visual status | Figma-ready? | Notes |
|---|---|---|---|---|
| Auth entry `/` | Contract-reviewed | Primary login reference plus current-app state-hook screenshots captured | Partial | Login parity has source evidence, and submitting, 2FA, SSO-required, activation/setup, bootstrap failure, and redirecting states are visually captured as deterministic current-app hooks. Backend policy/copy remains deferred. |
| Auth token flows | Contract-reviewed | Current-app token state-hook screenshots captured | Partial | Register, confirm, reset, forgot, and invite-token hooks are implemented/tested; representative screenshots cover missing/invalid/expired/valid/success/failure/retry/pending-approval/bootstrap-failure. Legacy continuation details remain deferred. |
| SSO/callback/logout | Contract-reviewed | Current-app callback, missing-tenant, session-loss, and logout screenshots captured | Partial | Cezanne launch, Cezanne callback, SAML launch, SAML callback, missing tenant, missing code, exchange, failure, success, session-loss, and logged-out states are covered. Provider popup behavior and backend payload details remain deferred. |
| Shell/navigation/account | Contract-reviewed | Account profile current-app state-hook screenshots captured | Partial | User, hiring-company, and recruitment-agency profile dirty/saving/saved/save-failed/retry/degraded/denied states plus close target are visually captured. Sidebar/topbar/account-menu parity still needs canonical layout decisions. |
| Dashboard | Contract-reviewed | Partial source/legacy visual evidence | No | Current API-backed dashboard exists; visual parity debt is intentionally deferred until this pass. |
| Notifications | Contract-reviewed | Fixture-backed current-app resolver screenshots captured | Partial | Destination categories are accepted for V0 screen-flow input; live notification API and final replacement parity remain deferred. |
| Inbox | Contract-reviewed | Fixture-backed empty/selected current-app screenshots captured | Partial | Conversation list/detail basics are accepted for V0 screen-flow input; send/provider-blocked/live transport remain deferred. |

## Evidence sources

| Evidence | Source | How it may be used | Limit |
|---|---|---|---|
| Route and state contracts | `pre-figma-flow-review.md`, `screens.md`, `modules.md`, `capabilities.md` | Canonical product behavior for V0 flows | Must not be overridden by screenshots. |
| Auth/login reference | `screen-design-flow-matrix.md` design reference file `Z3PdFzZu8uahyibzALIAN0`, node `1:2` | Typography, spacing, login card composition, link placement, provider button ordering | Only covers primary login surface. |
| Dashboard reference | `screen-design-flow-matrix.md` design reference file `Z3PdFzZu8uahyibzALIAN0`, node `6:2` | Shell/dashboard composition, sidebar/topbar/content/activity/calendar comparison | Does not prove backend schemas or final card counts. |
| Current greenfield source | `src/domains/auth`, `src/shell`, `src/domains/dashboard`, `src/domains/inbox` | Runtime route/state evidence and current UI behavior | Fixture-backed surfaces remain adapter seams. |
| OpenSpec specs | Accepted specs under `../../openspec/specs` | Required state families, boundaries, telemetry exclusions | Specs do not create visual layout by themselves. |

## Auth entry frame set

| Frame/state | Required behavior | Visual notes | Backend/API unknowns |
|---|---|---|---|
| Empty login | Email/password entry, Google/Microsoft launch links, forgot-password, sign-up | Match legacy typography/spacing before creating a new style. | None; uses current auth adapter seam. |
| Filled login | User-entered email/password without exposing password | Preserve password masking and field affordances. | None. |
| Submitting | Login action pending | Disable duplicate submit and preserve card layout. | Exact latency/progress copy may vary. |
| Invalid credentials | Failed email/password result | Recoverable inline error; do not clear email. | Exact backend error code copy unknown. |
| 2FA required | Second factor required after primary login | Separate from invalid credentials and SSO-required. | Exact 2FA delivery/setup fields are not confirmed. |
| 2FA failed | Verification failed | Retryable inline error. | Exact retry/lockout policy unknown. |
| SSO mandatory | User must use provider login | Provider CTA state instead of password retry loop. | Provider-family list may be backend-driven. |
| Activation/approval/setup required | Auth succeeded but shell entry blocked | Terminal or admin-pending message with return to login. | Exact approval/setup backend reason payload unknown. |
| Bootstrap failure | Login succeeded but session/bootstrap failed | Retry or safe return to login; no raw token display. | Bootstrap response details unknown. |
| Redirecting | Session ready and redirect target sanitized | Lightweight transition; no sensitive data. | None. |

## Auth token-flow frame set

| Flow | Required states | Visual rule |
|---|---|---|
| Forgot password | ready, submitting, sent, not-found/default failed, retry, return to login | Do not disclose account existence beyond existing contract behavior. |
| Reset password | missing token, validating, invalid, expired, password mismatch, submitting, success, failed, return to login | Keep token hidden; show password rules only if contract/source confirms them. |
| Confirm registration | missing token, validating, invalid, token valid, pending approval, bootstrap failed, dashboard/login landing | Separate token validity from session/bootstrap success. |
| Register public/token | `/register` public companion plus `/register/:token`, missing/invalid/expired token, ready, password mismatch, submitting, success, failed, login redirect | Do not infer registration fields beyond source contract; `/register` remains public/token and must not grant authenticated shell access. |
| Invite token | missing/invalid/expired, ready/continuation, failed, terminal/return | Exact continuation visual remains pending; do not invent invite payload fields. |

## SSO, callback, and logout frame set

| Flow | Required states | Visual rule |
|---|---|---|
| Cezanne launch | ready/launching, missing tenant, launch failed | Represent provider launch separately from callback processing. |
| Cezanne callback | provider error, missing code, exchanging, exchange failed, bootstrap failed, success redirect | Do not show auth code, raw token, or provider payload. |
| SAML launch/callback | email launch, provider error, missing code, exchanging, failed, success redirect | SAML launch may be a route-local form; callback is a separate state. |
| Logout/session loss | authenticated logout entry, clearing local session, logged out, public-entry fallback | Runtime canonical route is shell/session `Page`, not account overlay. |

## Shell/navigation/account frame set

| Surface | Required states | Visual rule |
|---|---|---|
| Shell org mode | HC/RA nav, active route, hidden denied routes, topbar, notification bell, account menu | Navigation visibility must follow runtime capabilities, not visual convenience. |
| Shell platform mode | Platform-specific nav and dashboard landing | Keep platform admin routes separate from org billing/team/favorites. |
| User profile overlay | ready, dirty, saving, saved, save-failed, retry, degraded, denied, close target | Shell-aware overlay; parent/close target must be explicit. |
| Hiring company profile | ready, dirty, saved, denied, stale/degraded, refresh intent | Route access uses `canViewHiringCompanyProfile`; mutation uses `canManageCompanySettings`. |
| Recruitment agency profile | ready, dirty, saved, denied, stale/degraded, refresh intent | Route access uses `canViewRecruitmentAgencyProfile`; mutation uses `canManageAgencySettings`. |
| Access denied/fallback | denied child route, dashboard fallback, public fallback where applicable | Do not leak unavailable route data. |

## Dashboard, notifications, and inbox frame set

| Surface | Required states | Visual rule |
|---|---|---|
| Dashboard loading | skeleton/loading source health | Avoid showing fake counts as final backend truth. |
| Dashboard ready | cards, calendar, activity, source health, safe actions | Current card count mismatch remains visual/data parity debt; do not block V0 contract. |
| Dashboard degraded | partial source failure, notification fallback, stale/missing target | Show source-specific degradation without inventing backend error payloads. |
| Notifications list | loading, empty, ready, degraded, unavailable | Destination resolver output must be visible enough for safe fallback. |
| Notification destination fallback | unknown, missing, unsupported, denied, stale | Fallback should land on dashboard with reason, not broken deep links. |
| Inbox list/detail | loading, empty, selected conversation, inaccessible, not found, stale | Fixture-backed conversation model; do not invent live transport schemas. |
| Inbox send | composing, sending, sent, send failed, provider blocked, retry | No message bodies in telemetry or visual contract artifacts. |

## Responsive assumptions

| Viewport | Requirement |
|---|---|
| Desktop primary | Use the legacy/dashboard comparison viewport as the primary V0 reference. |
| Narrow desktop/tablet | Preserve auth card readability and shell navigation access; exact responsive nav behavior needs confirmation before Figma-ready. |
| Mobile | Required only for legacy-backed mobile states that product includes in replacement scope; otherwise document the omission explicitly. |

## Non-goals

- Do not design exact backend user, notification, dashboard aggregate, calendar, or inbox transport schemas.
- Do not create canonical Figma frames for R1+ routes in this V0 pass.
- Do not convert legacy aliases into standalone screens.
- Do not change implementation code from this visual contract.
- Do not store or display raw credentials, auth codes, tokens, message bodies, provider payloads, or signed URLs.

## Required outputs before marking V0 rows `Figma-ready`

1. Auth login screenshot/reference comparison with pixel-parity blockers or product-approved typography, spacing, and provider-button exceptions.
2. Auth token-flow visual state map covering forgot/reset/confirm/register/invite-token.
3. SSO/callback/logout transition state map.
4. Shell layout/account visual contract for org and platform modes.
5. Dashboard pixel-parity debt list with explicit blockers and product-approved exceptions only.
6. Notifications and inbox visual state map.
7. Updated `pre-figma-flow-review.md` rows from `Contract-reviewed` to `Figma-ready` only for states covered by the evidence above.

## Current V0 Evidence Status Matrix

| Area | Confirmed implemented states | Visual evidence captured | Deferred backend/API states | Replacement approval |
|---|---|---|---|---|
| Auth entry | empty, filled, invalid credentials, submitting, 2FA required, 2FA failed, SSO mandatory, activation required, setup required, bootstrap failure, redirecting | Current and legacy primary login; current state hooks in `visual-evidence-assets/v0/v0-state-hooks-manifest.json` | final auth error taxonomy, 2FA delivery/lockout, activation/setup reason payloads | Not replacement-approved |
| Token flows | missing, invalid, expired, valid, success, failure, retry, pending approval, bootstrap failure across forgot-password, reset-password, confirm-registration, register, and invite-token hook families | Existing forgot/reset/register/invite captures plus 45 current-app token state hooks in `visual-evidence-assets/v0/v0-state-hooks-manifest.json` | invite continuation payload, registration approval semantics, token backend schemas | Not replacement-approved |
| SSO/callback/session | Cezanne launch, missing tenant, Cezanne provider error, Cezanne missing code, Cezanne exchanging, Cezanne exchange failure, Cezanne bootstrap failure, Cezanne success, SAML launch, SAML provider error, SAML missing code, SAML exchanging, SAML exchange failure, SAML bootstrap failure, SAML success, explicit logout, session loss | Existing SAML/error/logout captures plus 15 current-app SSO/callback hooks and session-loss hook in `visual-evidence-assets/v0/v0-state-hooks-manifest.json` | provider popup framing, provider-specific error copy, callback exchange payload | Not replacement-approved |
| Shell/account profiles | user profile, hiring-company profile, recruitment-agency profile ready/dirty/saving/saved/save-failed/retry/degraded/denied and dashboard close target | Current state-hook manifest | persistence API, server validation schema, exact account-menu interaction parity | Not replacement-approved |
| Dashboard/notifications/inbox | dashboard ready/degraded/fallback, notification resolver categories, inbox empty/selected conversation | Existing V0 captures | live notification API, live inbox transport, final dashboard aggregates/calendar source | Not replacement-approved |

## V0 sub-block promotion matrix

| Sub-block | Figma drafting promotion | Promotion basis | Remaining blockers |
|---|---|---|---|
| Primary login desktop | Promote covered states | Legacy/current primary login captures plus deterministic current-app hooks for submitting, 2FA required/failed, SSO mandatory, activation/setup required, bootstrap failure, and redirecting | Backend auth policy/copy, 2FA delivery and lockout rules, final pixel parity |
| Token flows | Promote current-app state map only | 45 deterministic screenshots across forgot/reset/confirm/register/invite-token for missing, invalid, expired, valid, success, failure, retry, pending approval, and bootstrap failure | Backend token continuation payloads, invite semantics, approval semantics, final legacy parity |
| Cezanne and SAML callback flows | Promote current-app transition map only | Launch/provider-error/missing-code/exchanging/exchange-failure/bootstrap-failure/success hooks for Cezanne, plus launch/callback hooks for SAML | Provider popup framing, provider-specific payload/error copy, backend callback contracts |
| Logout and session loss | Promote covered states | Stable `/logout` capture and separate `/session-lost` hook | Final copy/policy parity for session expiry |
| Shell/account profile states | Promote current-app state map only | User, hiring-company, and recruitment-agency profile dirty/saving/saved/save-failed/retry/degraded/denied captures with dashboard close target | Persistence API, server validation schema, account-menu/sidebar/topbar parity |
| Dashboard | Promote desktop base only | Current API-backed dashboard and authenticated legacy dashboard seeded captures | Final dashboard aggregate, calendar, activity, breakpoint, and pixel-parity review |
| Notifications | Promote fixture-backed resolver map only | Accepted V0 fixture evidence for available, unknown, unsupported, denied/stale destination categories | Live notification API and replacement parity |
| Inbox | Promote fixture-backed empty/selected map only | Accepted V0 fixture evidence for no-conversation and selected conversation | Live conversation transport, send failure/provider-blocked states, replacement parity |

No V0 sub-block is replacement-approved by this package. Promotion means Figma/screen-flow drafting may start with the blockers above annotated.
