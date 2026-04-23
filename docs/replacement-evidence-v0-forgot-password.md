# V0 `/forgot-password` Replacement Evidence Record

## Purpose

This focused record captures the next V0 auth replacement candidate after `/logout`.

It approves `/forgot-password` only for the states and viewport named below. It does not approve `/`, reset-password, registration, provider callbacks, `/logout`, `/session-lost`, or any other route.

## Decision

| Field | Value |
|---|---|
| Route | `/forgot-password` |
| Version | V0 / R0 |
| Owner | `auth` / `password-recovery` |
| Route ownership change | None |
| Target viewport | Desktop `1440x900`, device scale factor `1` |
| Data/session state | Public route; seeded email for `mail_sent`; synthetic non-sensitive emails for `mail_not_found` and `mail_error` |
| Replacement decision | `Pixel-parity-approved` |
| Pixel-parity-approved | Yes, for `/forgot-password` only |
| Other routes approved | No |
| Approval basis | Matched legacy/current evidence plus source-backed legacy frontend/backend behavior; existing Figma/auth references are complementary only |
| Approver/date | Product owner request in this thread, 2026-04-23 |

## Required Sources Read

| Source | Evidence used |
|---|---|
| `docs/replacement-approval-audit-v0-v5.md` | Names V0 `/forgot-password` as the second-best approval candidate and lists the required capture checklist. |
| `docs/v0-auth-shell-dashboard-visual-contract.md` | Defines token-flow states and keeps replacement approval separate from Figma-ready/current-app state coverage. |
| `docs/visual-evidence-v0-auth-shell-dashboard.md` | Records previous ready/current state-hook evidence and the remaining backend/API blockers. |
| `docs/auth-replacement-readiness-inventory.md` | Classifies `/forgot-password` states as legacy-backed and replacement-approved for the focused desktop scope. |
| `/Users/kauesantos/Documents/recruit/frontend/src/app/domain/login/forgot-password/` | Confirms legacy one-field form, loading spinner, `mail_sent`, `mail_not_found`, `mail_error`, toast handling, and `mail_sent` redirect to home. |
| `/Users/kauesantos/Documents/recruit/backend/app/Http/Controllers/UserController.php` | Confirms `UserController@forgotPassword` returns `mail_not_found`, `mail_sent`, or `mail_error`. |
| `/Users/kauesantos/Documents/recruit/backend/app/Http/routes.php` | Confirms backend route registration for `POST /user/forgot-password`. |
| OpenSpec archive `2026-04-23-v0-forgot-password-replacement-approval` | Records the route-specific approval model: legacy/current is canonical, existing Figma/auth evidence is complementary, and no new Figma production is required for this route. |

## Same-Run Evidence

| State | Legacy screenshot | Current screenshot | Result |
|---|---|---|---|
| Ready | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/legacy/legacy-forgot-password-ready-1440x900.png` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/current/current-forgot-password-ready-1440x900.png` | Current ready state was aligned closer to legacy for title copy, field icon, card sizing, vertical placement, and return-link copy. |
| Submitting | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/legacy/legacy-forgot-password-submitting-1440x900.png` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/current/current-forgot-password-submitting-1440x900.png` | Current submit button now uses an icon-only spinner like legacy. |
| `mail_sent` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/legacy/legacy-forgot-password-mail-sent-1440x900.png` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/current/current-forgot-password-mail-sent-1440x900.png` | Current now follows legacy direction: redirect to `/` with top-right success flash. |
| `mail_not_found` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/legacy/legacy-forgot-password-mail-not-found-1440x900.png` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/current/current-forgot-password-mail-not-found-1440x900.png` | Current follows legacy placement with top-right error flash. Account-existence disclosure is intentionally preserved for this parity approval. |
| `mail_error` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/legacy/legacy-forgot-password-mail-error-1440x900.png` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/current/current-forgot-password-mail-error-1440x900.png` | Current now follows legacy placement with top-right error flash. |

Manifest: `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/capture-manifest.json`.

## Current Runtime Fixes Made

| Area | Change |
|---|---|
| Ready copy | Changed current title from generic forgot-password wording to the legacy-backed instruction copy. |
| Layout | Scoped `/forgot-password` card sizing and vertical placement closer to the legacy desktop capture. |
| Field treatment | Added the legacy-style envelope icon treatment to the email field. |
| Loading state | Changed current submitting button content to an icon-only spinner. |
| Return link | Changed the forgot-password return link copy to match legacy wording more closely. |
| Outcome flash | Added reusable `FlashToast` / session flash utilities and wired forgot-password success/error outcomes through the legacy-style top-right flash placement. |
| Success redirect | Changed `mail_sent` handling to store a flash message and redirect to `/`, matching the legacy handoff direction. |

## Resolved Approval Questions

| Question | Resolution | Evidence |
|---|---|---|
| Account-existence disclosure | Preserve legacy behavior for this route approval. A neutral-copy security change must be a future product exception/change. | Legacy frontend controller and same-run `mail_not_found` captures. |
| Backend response enum | Source-backed as `mail_sent`, `mail_not_found`, and `mail_error` for `POST /user/forgot-password`. | `UserController@forgotPassword` and `routes.php`. |
| Figma frames | No new Figma production is required for this route-specific approval. Existing Figma/auth references remain complementary; legacy/current parity controls when state-specific Figma is absent. | OpenSpec archive `2026-04-23-v0-forgot-password-replacement-approval`. |
| Reset-token lifecycle | Out of scope for this route approval beyond the visible `mail_sent` handoff. Reset token expiry, used-token, throttling, rate limiting, and reset submit semantics remain owned by reset-password/backend work. | Approval scope table above. |

## Side-by-Side Parity Review

| Check | Decision | Notes |
|---|---|---|
| Public shell/card composition | Pass | Current ready/submitting captures follow the legacy public auth shell/card placement for the approved viewport. |
| Field treatment | Pass | Current uses the legacy-style single email field with envelope icon and `Email` placeholder. |
| Submit/loading treatment | Pass | Current uses the disabled/loading submit with icon-only spinner like legacy. |
| Success outcome | Pass | Current redirects to `/` after `mail_sent` and renders a top-right success flash. |
| Not-found outcome | Pass | Current renders top-right error flash and preserves legacy account-existence disclosure. |
| Generic failure outcome | Pass | Current renders top-right generic error flash for `mail_error`/unknown failure. |
| Return-to-login action | Pass | Current return link points to `/` with legacy-aligned copy. |
| Sensitive data | Pass | Manifest excludes passwords, auth tokens, reset tokens, provider payloads, and signed URLs. |

## Final Determination

Decision: `Pixel-parity-approved`.

`/forgot-password` has same-run legacy/current desktop evidence for ready, submitting, `mail_sent`, `mail_not_found`, and `mail_error`, source-backed backend enum evidence, and current presentation follows the legacy direction for ready, loading, success redirect, not-found/failure flash placement, and return-to-login behavior.

Approval is scoped to `/forgot-password` at desktop `1440x900` for the states above. No other route is approved by this record.
