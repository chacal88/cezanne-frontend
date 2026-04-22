# Visual Evidence V0 Auth, Shell, and Dashboard

## Purpose

This log records the first V0 visual evidence capture pass for auth, shell, and dashboard surfaces before any Figma/screen-flow production.

It supports `v0-auth-shell-dashboard-visual-contract.md` and keeps evidence separate from product truth: screenshots may confirm layout, spacing, and visible state patterns, but they do not create backend contracts or final data rules.

## Capture metadata

| Field | Value |
|---|---|
| Capture date | 2026-04-21; runtime hook update 2026-04-22 |
| Viewport | Desktop `1440x900`, device scale factor `1` |
| Current app | `http://localhost:5173` |
| Legacy/reference app | `http://localhost:4000` |
| Capture tool | Local Playwright script from `@playwright/test` dependency |
| Manifest | `visual-evidence-assets/v0/v0-capture-manifest.json` |
| Security exclusions | No credentials, raw tokens, auth codes, provider payloads, signed URLs, or message bodies are stored in this log. The seeded dashboard screenshot uses a non-sensitive dev-only visual evidence token. |
| Local seed | `local-dev/scripts/seed-api-data.sh` with owner `kauemsc@gmail.com`, company `Warner Brothers`, 6 candidates, job id `12`, job uuid `be52b884-c06a-4d05-86e3-afb244c69c7b`. Passwords and auth tokens are intentionally omitted. |

## Evidence inventory

| Route/family | Visual contract | Evidence source | Screenshot | Captured states | Decision |
|---|---|---|---|---|---|
| `/` login | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v0/current/greenfield-root-1440x900.png` | Empty login, provider buttons, forgot-password link, sign-up link, ready marker | Partial evidence only |
| `/` login | `v0-auth-shell-dashboard-visual-contract.md` | Legacy/reference app | `visual-evidence-assets/v0/legacy/legacy-root-1440x900.png` | Empty login, provider buttons, forgot-password link, sign-up link | Partial evidence only |
| `/` login filled | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app with local API seed user | `visual-evidence-assets/v0/current/greenfield-login-filled-seeded-user-1440x900.png` | Filled login without exposing password; primary login submission target | Covered for primary desktop login state only |
| `/` login invalid | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v0/current/greenfield-login-invalid-credentials-1440x900.png` | Invalid credentials inline failure | Covered for primary desktop invalid-credentials state only |
| `/` login success redirect | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app with local API seed user | `visual-evidence-assets/v0/current/greenfield-login-after-submit-seeded-user-1440x900.png` | API-backed success, local session save, dashboard redirect | Covered for primary desktop success handoff only |
| `/dashboard` denied | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app without session | `visual-evidence-assets/v0/current/greenfield-dashboard-1440x900.png` | Access denied fallback | Partial evidence only |
| `/dashboard` seeded shell | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app with dev-seeded local session | `visual-evidence-assets/v0/current/greenfield-dashboard-seeded-session-1440x900.png` | Authenticated shell, dashboard loading/degraded/ready-ish card shell, calendar, activity entry links | Partial evidence only; not production-auth proof |
| `/dashboard` unauthenticated legacy redirect | `v0-auth-shell-dashboard-visual-contract.md` | Legacy/reference app without authenticated session | `visual-evidence-assets/v0/legacy/legacy-dashboard-1440x900.png` | Dashboard redirects to public login | Partial evidence only |
| `/dashboard` authenticated legacy | `v0-auth-shell-dashboard-visual-contract.md` | Legacy/reference app after local API seed login | `visual-evidence-assets/v0/legacy/legacy-dashboard-authenticated-seeded-user-clean-1440x900.png` | Authenticated legacy shell, seeded dashboard cards, calendar, activity feed, popup dismissed | Covered for desktop legacy dashboard reference |
| `/dashboard` authenticated greenfield | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app after local API seed login | `visual-evidence-assets/v0/current/greenfield-dashboard-api-login-seeded-user-1440x900.png` | API-backed login redirect, shell, dashboard cards, calendar, activity feed | Covered for desktop dashboard base; visual parity debt remains tracked |
| `/forgot-password` | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v0/current/greenfield-forgot-password-1440x900.png` | Ready forgot-password form | Partial evidence only |
| `/forgot-password` | `v0-auth-shell-dashboard-visual-contract.md` | Legacy/reference app | `visual-evidence-assets/v0/legacy/legacy-forgot-password-1440x900.png` | Ready forgot-password form | Partial evidence only |
| `/forgot-password` submitted | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app with local API seed user email | `visual-evidence-assets/v0/current/greenfield-forgot-password-submitted-1440x900.png` | Submitted/sent password reset email state | Covered for ready/sent states |
| `/register/null` | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v0/current/greenfield-register-null-1440x900.png` | Register form ready with organization selector | Partial evidence only |
| `/register/null` | `v0-auth-shell-dashboard-visual-contract.md` | Legacy/reference app | `visual-evidence-assets/v0/legacy/legacy-register-null-1440x900.png` | Invalid token redirect/message and login surface | Partial evidence only |
| `/register/valid-register-token` mismatch | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v0/current/greenfield-register-token-mismatch-1440x900.png` | Registration password mismatch validation | Partial evidence only; success state remains deferred |
| `/reset-password/expired-reset-token` | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v0/current/greenfield-reset-expired-1440x900.png` | Expired/invalid reset token state | Partial evidence only |
| `/reset-password/valid-reset-token` mismatch | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v0/current/greenfield-reset-password-mismatch-1440x900.png` | Password mismatch validation | Partial evidence only; success state remains deferred |
| `/confirm-registration/invalid-token` | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v0/current/greenfield-confirm-invalid-1440x900.png` | Redirect to login for invalid confirmation token | Partial evidence only |
| `/users/invite-token` | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v0/current/greenfield-invite-missing-1440x900.png` | Missing/invalid invite token | Partial evidence only |
| `/auth/saml` | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v0/current/greenfield-saml-launch-1440x900.png` | SAML launch form ready | Partial evidence only |
| `/auth/cezanne/callback` missing code | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v0/current/greenfield-cezanne-callback-missing-code-1440x900.png` | Missing callback code state | Partial evidence only |
| `/auth/cezanne/callback?error` | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v0/current/greenfield-cezanne-callback-error-1440x900.png` | Provider error state | Partial evidence only |
| `/auth/saml?error` | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v0/current/greenfield-saml-callback-error-1440x900.png` | SAML provider error state | Partial evidence only |
| `/notifications` | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app with dev-seeded local session | `visual-evidence-assets/v0/current/greenfield-notifications-seeded-session-1440x900.png` | Notification list, destination available/unknown/unsupported/stale fallback states | Partial evidence only; fixture-backed resolver proof, not live API proof |
| `/inbox` | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app with dev-seeded local session | `visual-evidence-assets/v0/current/greenfield-inbox-seeded-session-1440x900.png` | Inbox empty/no-conversation state, fixture adapter contract, URL search-param note | Partial evidence only; fixture-backed inbox proof, not live transport proof |
| `/inbox?conversation=conversation-123` | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app with dev-seeded local session | `visual-evidence-assets/v0/current/greenfield-inbox-selected-conversation-1440x900.png` | Selected conversation fixture state and direct-url entry mode | Covered for fixture-backed list/detail state; live send remains deferred |
| `/logout` stable logged-out | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app after route fix | `visual-evidence-assets/v0/current/greenfield-logout-stable-logged-out-1440x900.png` | Stable logged-out page, return to login, local session cleared | Covered |
| `/` login visual-state hooks | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield runtime | Pending screenshot capture | `?visualState=submitting`, `two-factor-required`, `two-factor-failed`, `sso-mandatory`, `activation-required`, `setup-required`, `bootstrap-failure`, `redirecting` | Runtime/test-hook covered; visual capture pending |
| Auth token visual-state hooks | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield runtime | Pending screenshot capture | `?visualState=missing`, `invalid`, `expired`, `valid`, `success`, `failure`, `retry`, `pending-approval`, `bootstrap-failure` on forgot/reset/confirm/register/invite flows where applicable | Runtime/test-hook covered; backend schemas deferred |
| SSO/callback visual-state hooks | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield runtime | Pending screenshot capture | `?visualState=launch`, `missing-tenant`, `missing-code`, `provider-error`, `exchanging`, `exchange-failure`, `bootstrap-failure`, `success-redirect` | Runtime/test-hook covered; provider payloads deferred |
| `/session-lost` | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield runtime | Pending screenshot capture | Session-loss transition separate from explicit `/logout`, clears local session, returns to public entry | Runtime/test-hook covered |
| Shell/account profile hooks | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield runtime | Pending screenshot capture | `?fixtureState=ready`, `dirty`, `saving`, `saved`, `save-failed`, `retry`, `degraded`, `denied` on `/user-profile`, `/hiring-company-profile`, and `/recruitment-agency-profile`; close/parent target remains visible | Runtime/test-hook covered |

## Superseded captures

These files are retained for audit trail only and must not be used for implementation:

| File | Reason | Replacement |
|---|---|---|
| `visual-evidence-assets/v0/superseded/greenfield-logout-seeded-session-1440x900.png` | Captured the pre-fix logout handoff that fell through to access denied. | `visual-evidence-assets/v0/current/greenfield-logout-stable-logged-out-1440x900.png` |
| `visual-evidence-assets/v0/superseded/legacy-dashboard-authenticated-seeded-user-1440x900.png` | Popup-obscured legacy dashboard capture. | `visual-evidence-assets/v0/legacy/legacy-dashboard-authenticated-seeded-user-clean-1440x900.png` |

## Confirmed visual observations

- The current login page and legacy login page are visually close for the primary desktop login card, including card placement, logo, provider button order, and secondary link placement.
- The current app preserves the public/auth surface separation: unauthenticated `/dashboard` does not render authenticated dashboard content.
- The current seeded shell confirms that the authenticated navigation frame exists and that dashboard content is visually grouped into cards, calendar, and activity areas.
- The current notifications page exposes resolver categories for available, unknown, unsupported, and stale destinations; this is useful route-state evidence but remains fixture-backed.
- The current inbox page exposes empty/no-conversation state and adapter seams; this is useful state evidence but remains fixture-backed.
- The current logout capture reveals an unstable visual handoff: session clearing occurs before a dedicated logged-out frame is captured, leaving access-denied fallback as the observable post-click state.
- Forgot-password has both current and legacy visual references.
- Register-token behavior differs between current and legacy for `null` token: current renders a form, while legacy redirects to login with invalid-token messaging.
- Local API seeding now provides matching authenticated dashboard evidence for current and legacy apps: both show seeded open jobs/candidates/activity from the Warner Brothers seed slice. The canonical legacy dashboard evidence uses the clean capture with the calendar-connect popup dismissed.
- The logout visual handoff was corrected so `/logout` is captured as a stable public/session page instead of falling through to access-denied.
- Runtime now exposes deterministic V0 visual-state hooks for missing auth/token/SSO states and a separate `/session-lost` route. These are current-app test hooks only until screenshots are captured.

## Accepted deviations in this pass

- Dashboard card counts and calendar events remain technical/visual parity debt and are not accepted as final data truth.
- The seeded dashboard screenshot is accepted only as shell/layout evidence. It is not accepted as proof of live production authentication, live dashboard aggregates, or backend payload shape.
- Legacy dashboard evidence is limited because an authenticated legacy session was not captured in this pass.
- Notifications and inbox greenfield evidence is accepted as fixture-backed state coverage only, not as proof of live notification/inbox APIs.
- Explicit V0 decision: fixture-backed notification resolver visuals are accepted as temporary Figma input for destination categories because route ownership and resolver states are already contract-reviewed; live API replacement must preserve the same state categories.
- Explicit V0 decision: fixture-backed inbox list/detail visuals are accepted as temporary Figma input for conversation empty/selected states because live message transport remains outside V0; send/error/provider-blocked frames stay deferred.

## Deferred visual debt

- Capture dashboard with live API-backed aggregates once backend data parity is intentionally addressed.
- Capture the new login visual-state hooks for submitting, 2FA-required, 2FA-failed, SSO-mandatory, activation/setup required, bootstrap failure, and redirecting states.
- Capture the new token-flow visual-state hooks for reset/confirm/register/invite missing/invalid/expired/valid/success/failure/retry/pending-approval/bootstrap-failure states with confirmed legacy behavior where legacy exists.
- Capture the new Cezanne/SAML launch/callback visual-state hooks without exposing provider payloads.
- Capture `/session-lost` separately from explicit logout.
- Replace notification resolver fixtures with live API-backed data when available, preserving accepted categories.
- Capture inbox send/provider-blocked states when live transport or a confirmed adapter contract is available.

## Backend/API unknowns

- Final auth error codes/copy, 2FA policy, account activation/setup reason payloads, bootstrap failure payloads, and provider-family availability remain backend/API-owned.
- Dashboard aggregate counts, calendar event source, activity feed payloads, and source-health semantics must not be invented from screenshots.
- Notification destination resolver payloads and inbox transport schemas remain non-inventable until implementation/backend contracts confirm them.

## Figma-ready decision

| Area | Decision | Reason |
|---|---|---|
| Login primary desktop | Figma-ready sub-block | Empty, filled, invalid-credentials, provider button ordering, secondary links, and API-backed success redirect are captured. 2FA/SSO-mandatory/bootstrap-failure remain separate deferred states, so the aggregate `/` row should not claim full auth-state coverage. |
| Auth token flows | Runtime hooks covered; not visual-ready | Forgot-password ready/sent and reset/register validation states are captured; missing variants are now navigable through `visualState` hooks but still need screenshots/legacy confirmation. |
| SSO/callback | Runtime hooks covered; not visual-ready | SAML launch plus Cezanne/SAML provider-error states are captured; missing variants are now navigable through `visualState` hooks but still need screenshots/legacy confirmation. |
| Logout | Figma-ready sub-block | `/logout` now has a stable logged-out page capture and return-to-login handoff. Session-loss remains separate debt. |
| Session loss | Runtime hooks covered; not visual-ready | `/session-lost` separates session expiry from explicit logout and is covered by tests; screenshot evidence remains pending. |
| Shell/dashboard | Figma-ready sub-block | Current API-backed dashboard and authenticated legacy dashboard are captured against local seed data. Visual/data parity refinements remain tracked as debt, not a V0 blocker. |
| Notifications | Figma-ready sub-block | Fixture-backed resolver states are explicitly accepted for V0 Figma input; live API replacement remains deferred. |
| Inbox | Figma-ready sub-block | Fixture-backed empty and selected-conversation states are explicitly accepted for V0 Figma input; send/provider-blocked states remain deferred. |

Only covered V0 sub-blocks may be promoted. Full auth/token/SSO/session-loss coverage remains `Contract-reviewed` until the deferred states above are captured or explicitly accepted.
