# Visual Evidence V0 Auth, Shell, and Dashboard

## Purpose

This log records the first V0 visual evidence capture pass for auth, shell, and dashboard surfaces before any Figma/screen-flow production.

It supports `v0-auth-shell-dashboard-visual-contract.md` and keeps evidence separate from product truth: screenshots may confirm layout, spacing, and visible state patterns, but they do not create backend contracts or final data rules.

## Capture metadata

| Field | Value |
|---|---|
| Capture date | 2026-04-21; runtime hook update 2026-04-22; expanded state-hook visual capture and `/logout` parity recapture 2026-04-23 |
| Viewport | Desktop `1440x900`, device scale factor `1` |
| Current app | `http://localhost:5173`; expanded state-hook recapture used `V0_CAPTURE_BASE_URL=http://127.0.0.1:5174` because `5173` was already occupied locally |
| Legacy/reference app | `http://localhost:4000` |
| Capture tool | Local Playwright script from `@playwright/test` dependency; reusable script `scripts/capture-v0-state-evidence.mjs` |
| Manifest | `visual-evidence-assets/v0/v0-capture-manifest.json`; expanded state-hook manifest `visual-evidence-assets/v0/v0-state-hooks-manifest.json` with 90 records |
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
| `/logout` legacy-style handoff | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield app after redirect and login-field parity alignment | `visual-evidence-assets/v0/current/greenfield-logout-post-handoff-login-1440x900.png` | Clears local session and immediately hands off to `/`, matching the legacy action-route direction; manifest final URL is `/`, `storageCleared: true`, and the observable login field placeholder/icon treatment now matches the legacy reference | Pixel-parity-approved for `/logout` only |
| `/` login visual-state hooks | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield runtime | `visual-evidence-assets/v0/current/state-hooks/greenfield-login-*-1440x900.png` | `?visualState=submitting`, `two-factor-required`, `two-factor-failed`, `sso-mandatory`, `activation-required`, `setup-required`, `bootstrap-failure`, `redirecting` | Current-app evidence captured; backend policy/copy deferred |
| Auth token visual-state hooks | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield runtime | `visual-evidence-assets/v0/current/state-hooks/greenfield-token-*-1440x900.png` | 45 screenshots: forgot-password, reset-password, confirm-registration, register, and invite-token each captured for `?visualState=missing`, `invalid`, `expired`, `valid`, `success`, `failure`, `retry`, `pending-approval`, `bootstrap-failure` | Current-app evidence captured; backend schemas deferred |
| SSO/callback visual-state hooks | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield runtime | `visual-evidence-assets/v0/current/state-hooks/greenfield-sso-*-1440x900.png` | 15 screenshots: Cezanne launch/missing-tenant, Cezanne callback provider-error/missing-code/exchanging/exchange-failure/bootstrap-failure/success, SAML launch, and SAML callback provider-error/missing-code/exchanging/exchange-failure/bootstrap-failure/success | Current-app evidence captured; provider payloads deferred |
| `/session-lost` | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield runtime | `visual-evidence-assets/v0/current/state-hooks/greenfield-session-loss-session-expired-1440x900.png` | Session-loss transition separate from explicit `/logout`, clears local session, returns to public entry | Current-app evidence captured |
| Shell/account profile hooks | `v0-auth-shell-dashboard-visual-contract.md` | Current greenfield runtime | `visual-evidence-assets/v0/current/state-hooks/greenfield-user-profile-*-1440x900.png`, `greenfield-hiring-company-profile-*-1440x900.png`, `greenfield-recruitment-agency-profile-*-1440x900.png` | `?fixtureState=dirty`, `saving`, `saved`, `save-failed`, `retry`, `degraded`, `denied`; close/parent target remains visible | Current-app evidence captured; persistence API/schema deferred |

## Superseded captures

These files are retained for audit trail only and must not be used for implementation:

| File | Reason | Replacement |
|---|---|---|
| `visual-evidence-assets/v0/superseded/greenfield-logout-seeded-session-1440x900.png` | Captured the pre-fix logout handoff that fell through to access denied. | `visual-evidence-assets/v0/current/greenfield-logout-post-handoff-login-1440x900.png` |
| `visual-evidence-assets/v0/current/greenfield-logout-stable-logged-out-1440x900.png` | Captures the superseded route-local logged-out page. Runtime now follows legacy-style redirect to `/`, so this file must not be used for replacement approval. | `visual-evidence-assets/v0/current/greenfield-logout-post-handoff-login-1440x900.png` |
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
- The logout runtime handoff is now aligned to legacy behavior: `/logout` clears local session and redirects to `/` instead of rendering a route-local logged-out page. The 2026-04-23 recapture resolves the visible login-field placeholder/icon parity blocker and marks only `/logout` as `Pixel-parity-approved`.
- Runtime now exposes deterministic V0 visual-state hooks for missing auth/token/SSO states and a separate `/session-lost` route. Current-app screenshots for those hooks are captured in `visual-evidence-assets/v0/v0-state-hooks-manifest.json`.
- `/auth/cezanne` without a tenant now renders the public missing-tenant state instead of falling through to access denied.
- The expanded 2026-04-23 V0 state-hook recapture is reproducible with `npm run capture:v0:state-evidence` after starting the app. The manifest now records 90 current-app screenshots: 8 login, 45 token-flow, 15 SSO/callback, 1 session-loss, and 21 account/profile records.

## Accepted deviations in this pass

- Dashboard card counts and calendar events remain technical/visual parity debt and are not accepted as final data truth.
- The seeded dashboard screenshot is accepted only as shell/layout evidence. It is not accepted as proof of live production authentication, live dashboard aggregates, or backend payload shape.
- Legacy dashboard evidence is limited because an authenticated legacy session was not captured in this pass.
- Notifications and inbox greenfield evidence is accepted as fixture-backed state coverage only, not as proof of live notification/inbox APIs.
- Explicit V0 decision: fixture-backed notification resolver visuals are accepted as temporary Figma input for destination categories because route ownership and resolver states are already contract-reviewed; live API replacement must preserve the same state categories.
- Explicit V0 decision: fixture-backed inbox list/detail visuals are accepted as temporary Figma input for conversation empty/selected states because live message transport remains outside V0; send/error/provider-blocked frames stay deferred.

## Deferred visual debt

- Capture dashboard with live API-backed aggregates once backend data parity is intentionally addressed.
- Confirm legacy references for login non-happy states, token terminal states, SSO/callback failures, and account profile states where the legacy frontend exposes matching screens.
- Replace notification resolver fixtures with live API-backed data when available, preserving accepted categories.
- Capture inbox send/provider-blocked states when live transport or a confirmed adapter contract is available.

## Backend/API unknowns

- Final auth error codes/copy, 2FA policy, account activation/setup reason payloads, bootstrap failure payloads, and provider-family availability remain backend/API-owned.
- Dashboard aggregate counts, calendar event source, activity feed payloads, and source-health semantics must not be invented from screenshots.
- Notification destination resolver payloads and inbox transport schemas remain non-inventable until implementation/backend contracts confirm them.

## Figma-ready decision

| Area | Decision | Reason |
|---|---|---|
| Login primary desktop | Figma-ready sub-block; replacement not approved | Empty, filled, invalid-credentials, provider button ordering, secondary links, API-backed success redirect, and current-app non-happy state hooks are captured. Final backend policy/copy and legacy parity remain deferred. |
| Auth token flows | Figma-ready current-app state-map sub-block; replacement not approved | Forgot-password ready/sent, reset/register validation, and 45 token state hooks across forgot/reset/confirm/register/invite are captured. Legacy continuation and backend schemas remain deferred. |
| SSO/callback | Figma-ready current-app transition-map sub-block; replacement not approved | SAML launch, Cezanne launch/missing-tenant, and Cezanne/SAML provider-error/missing-code/exchanging/exchange-failure/bootstrap-failure/success hooks are captured. Provider popup decisions and backend payload details remain deferred. |
| Logout | Figma-ready sub-block; `Pixel-parity-approved` for `/logout` only | `/logout` now follows legacy-style redirect handoff to `/`; current post-handoff login evidence is recaptured at `1440x900` after login-field placeholder/icon alignment, and the previous route-local logged-out screenshot is superseded for replacement approval. Session-loss is separately captured and tracked as its own transition. |
| Session loss | Current-app visual evidence captured; replacement not approved | `/session-lost` separates session expiry from explicit logout and is covered by tests and screenshot evidence. |
| Shell/dashboard | Figma-ready sub-block | Current API-backed dashboard and authenticated legacy dashboard are captured against local seed data. Visual/data parity refinements remain tracked as debt, not a V0 blocker. |
| Notifications | Figma-ready sub-block | Fixture-backed resolver states are explicitly accepted for V0 Figma input; live API replacement remains deferred. |
| Inbox | Figma-ready sub-block | Fixture-backed empty and selected-conversation states are explicitly accepted for V0 Figma input; send/provider-blocked states remain deferred. |
| Account/profile states | Current-app visual evidence captured; replacement not approved | User, hiring-company, and recruitment-agency dirty/saving/saved/save-failed/retry/degraded/denied states and dashboard close target are captured. Persistence API and account-menu parity remain deferred. |

Only covered V0 sub-blocks may be promoted for Figma/screen-flow drafting. The only production replacement approval in this evidence pass is the explicit `/logout` handoff; no other V0 surface is replacement-approved.

## V0 promotion matrix

| Sub-block | Promote to Figma drafting? | Evidence added or confirmed | Still blocked |
|---|---|---|---|
| Login primary desktop and deterministic non-happy states | Yes, for covered current-app states | Current/legacy primary login plus `greenfield-login-*-1440x900.png` hook screenshots | Backend auth taxonomy, 2FA delivery/lockout, final pixel parity |
| Token-flow state map | Yes, as current-app state map | 45 token screenshots in `visual-evidence-assets/v0/current/state-hooks/` and manifest records | Backend token payloads, invite continuation, approval semantics, legacy terminal parity |
| Cezanne/SAML launch and callback transitions | Yes, as current-app transition map | 15 SSO/callback screenshots in `visual-evidence-assets/v0/current/state-hooks/` and manifest records | Provider popup representation, provider payloads, backend exchange contracts |
| Logout/session-loss separation | Yes, for covered transitions | `/logout` legacy-style redirect behavior, `greenfield-logout-post-handoff-login-1440x900.png`, and `greenfield-session-loss-session-expired-1440x900.png` | `/logout` approved only for explicit handoff; session expiry policy/copy parity remains unapproved for `/session-lost` |
| Account profile state hooks | Yes, as current-app state map | 21 user/company/agency profile screenshots for dirty/saving/saved/save-failed/retry/degraded/denied | Persistence API, validation schema, account-menu and shell parity |
| Dashboard desktop base | Yes, for current seeded base | Current API-backed and authenticated legacy dashboard seeded captures | Live aggregate/calendar/activity parity |
| Notifications resolver categories | Yes, fixture-backed only | Existing seeded notification resolver screenshots | Live notification backend parity |
| Inbox empty/selected conversation | Yes, fixture-backed only | Existing empty and selected-conversation screenshots | Live transport, send failure, provider-blocked states |

Live notification, inbox, and dashboard backend parity remains deferred unless real contracts exist. No V0 row or sub-block other than the explicit `/logout` handoff is replacement-approved by this evidence.
