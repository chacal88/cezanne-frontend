# V0 `/forgot-password` Replacement Evidence Record

## Purpose

This focused record captures the next V0 auth replacement candidate after `/logout`.

It does not approve `/forgot-password`, `/`, reset-password, registration, provider callbacks, `/logout`, `/session-lost`, or any other route. It records same-run evidence, visible deltas, and remaining blockers.

## Decision

| Field | Value |
|---|---|
| Route | `/forgot-password` |
| Version | V0 / R0 |
| Owner | `auth` / `password-recovery` |
| Route ownership change | None |
| Target viewport | Desktop `1440x900`, device scale factor `1` |
| Data/session state | Public route; seeded email for `mail_sent`; synthetic non-sensitive emails for `mail_not_found` and `mail_error` |
| Replacement decision | `blocked` |
| Pixel-parity-approved | No |
| Other routes approved | No |

## Required Sources Read

| Source | Evidence used |
|---|---|
| `docs/replacement-approval-audit-v0-v5.md` | Names V0 `/forgot-password` as the second-best approval candidate and lists the required capture checklist. |
| `docs/v0-auth-shell-dashboard-visual-contract.md` | Defines token-flow states and keeps replacement approval separate from Figma-ready/current-app state coverage. |
| `docs/visual-evidence-v0-auth-shell-dashboard.md` | Records previous ready/current state-hook evidence and the remaining backend/API blockers. |
| `docs/auth-replacement-readiness-inventory.md` | Classifies `/forgot-password` states as legacy-backed and backend-blocked. |
| `/Users/kauesantos/Documents/recruit/frontend/src/app/domain/login/forgot-password/` | Confirms legacy one-field form, loading spinner, `mail_sent`, `mail_not_found`, `mail_error`, toast handling, and `mail_sent` redirect to home. |

## Same-Run Evidence

| State | Legacy screenshot | Current screenshot | Result |
|---|---|---|---|
| Ready | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/legacy/legacy-forgot-password-ready-1440x900.png` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/current/current-forgot-password-ready-1440x900.png` | Current ready state was aligned closer to legacy for title copy, field icon, card sizing, vertical placement, and return-link copy. |
| Submitting | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/legacy/legacy-forgot-password-submitting-1440x900.png` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/current/current-forgot-password-submitting-1440x900.png` | Current submit button now uses an icon-only spinner like legacy. |
| `mail_sent` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/legacy/legacy-forgot-password-mail-sent-1440x900.png` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/current/current-forgot-password-mail-sent-1440x900.png` | Current now follows legacy direction: redirect to `/` with top-right success flash. |
| `mail_not_found` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/legacy/legacy-forgot-password-mail-not-found-1440x900.png` | `docs/visual-evidence-assets/v0/forgot-password-same-run-2026-04-23/current/current-forgot-password-mail-not-found-1440x900.png` | Current now follows legacy placement with top-right error flash. Product/security must still confirm account-existence disclosure. |
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

## Remaining Blockers

| Blocker | Owner | Notes |
|---|---|---|
| Account-existence disclosure | Product/Security | Legacy exposes `mail_not_found`; replacement needs confirmation or an explicit product exception. |
| Backend response enum | Backend/Auth | `mail_sent`, `mail_not_found`, and `mail_error` are locally source-backed, but final structured contract remains unresolved. |
| Figma frames | Design/Product | No same-state Figma frame/node references are attached for ready, submitting, success, not-found, or failure. |

## Final Determination

Decision: `blocked`.

`/forgot-password` now has same-run legacy/current desktop evidence for ready, submitting, `mail_sent`, `mail_not_found`, and `mail_error`, and the current presentation follows the legacy direction for ready, loading, success redirect, and top-right outcome flash placement. Replacement approval remains blocked by account-existence disclosure, backend enum confirmation, and missing Figma frame references.

No route is approved by this record.
