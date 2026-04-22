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
| Auth entry `/` | Contract-reviewed | Primary login reference exists; non-happy states runtime-hook reachable | No | Login parity has source evidence, and 2FA, SSO-required, bootstrap failure, activation/setup, submitting, and redirecting states are hook-reachable; canonical screenshots remain pending. |
| Auth token flows | Contract-reviewed | Runtime hooks added | No | Register, confirm, reset, forgot, and invite-token state hooks exist; visual confirmation remains pending. |
| SSO/callback/logout | Contract-reviewed | Runtime hooks added for callbacks and session-loss | No | Provider launch/callback waiting/failure and session-loss states are hook-reachable; logged-out is captured; canonical screenshots remain pending. |
| Shell/navigation/account | Contract-reviewed | Account profile runtime hooks added | No | Sidebar/topbar/account menu/profile states need canonical layout decisions across org and platform modes; profile state hooks exist for capture. |
| Dashboard | Contract-reviewed | Partial source/legacy visual evidence | No | Current API-backed dashboard exists; visual parity debt is intentionally deferred until this pass. |
| Notifications | Contract-reviewed | Pending | No | Notification resolver states need list/detail/fallback visual decisions. |
| Inbox | Contract-reviewed | Pending | No | Fixture-backed conversation states need visual decisions before live transport contracts are known. |

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
| Register token | missing/invalid/expired token, ready, password mismatch, submitting, success, failed, login redirect | Do not infer registration fields beyond source contract. |
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
