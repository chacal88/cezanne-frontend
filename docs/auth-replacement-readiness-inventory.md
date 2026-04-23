# Auth Replacement Readiness Inventory

## Purpose

This inventory supports OpenSpec change `auth-replacement-readiness-package`.

It records the V0 auth route/state surface that must be closed before auth replacement approval. It does not approve any route. `Figma-ready`, current-app visual hooks, and route implementation status remain separate from replacement approval.

## Classification Key

| Classification | Meaning |
|---|---|
| `legacy-backed` | A matching legacy route/state exists or source confirms comparable behavior; replacement needs same-viewport legacy/current/Figma evidence. |
| `current-app-only` | Current greenfield exposes a deterministic state, but no matching legacy state is confirmed yet. |
| `backend-blocked` | Final behavior/copy depends on backend/API/product contract confirmation. |
| `product-exception-needed` | A known intentional non-legacy behavior would require product approval before replacement. |
| `replacement-ready-candidate` | Evidence appears close enough to request approval, but final evidence record still controls the decision. |

## Canonical Entry and Alias Finding

| Item | Finding | Evidence |
|---|---|---|
| Canonical public auth entry | `/` | Registered in `src/lib/routing/route-contracts.ts`, `src/app/router.tsx`, and `src/lib/routing/route-metadata.ts` as `auth.public-home` / `auth.public-entry`. |
| `/login` | Not a canonical registered route in the current app | Mentioned in approval docs as shorthand for the login entry, but not present in `registeredRoutePaths` or router registration. Treat as an alias/reference label only unless a future route registration change explicitly adds it. |

## Route Inventory

| Route/state family | Current route contract | Legacy/reference status | Current evidence/status | Classification | Replacement blockers |
|---|---|---|---|---|---|
| `/` login ready/empty | `Public/Token`, auth public-entry, `canStartSession` | Legacy login route exists as public home/login entry; Figma reference file `Z3PdFzZu8uahyibzALIAN0`, node `1:2` exists | Current and legacy primary login screenshots exist | `legacy-backed` | Final pixel parity for login itself, error/copy decisions, responsive scope |
| `/` login filled | Same as `/` | Legacy filled reference exists in V0 assets | Current filled seeded-user screenshot exists | `legacy-backed` | Same-run current/legacy/Figma evidence for approval state |
| `/` login submitting | Same as `/` | Legacy submit/loading behavior exists in source | Current deterministic `?visualState=submitting` hook exists | `legacy-backed`, `backend-blocked` | Same-run capture and final loading copy/timing |
| `/` invalid credentials | Same as `/` | Legacy invalid login modal/form error exists in login controller source | Current invalid screenshot exists | `legacy-backed`, `backend-blocked` | Final auth error taxonomy/copy |
| `/` 2FA required/failed | Same as `/` | Legacy 2FA behavior exists in login template/controller source | Current deterministic hooks exist | `legacy-backed`, `backend-blocked` | Delivery, retry, lockout, resend, and copy policy |
| `/` SSO mandatory | Same as `/` | Legacy maps `cezanne-sso-mandatory` style errors | Current deterministic hook exists | `legacy-backed`, `backend-blocked` | Provider-family list and final copy |
| `/` activation/approval/setup/bootstrap failure | Same as `/` | Legacy source confirms activation/onboard/setup-adjacent branches, but exact visual parity needs state mapping | Current deterministic hooks exist | `legacy-backed`, `backend-blocked` | Backend reason payloads and terminal/return behavior |
| `/forgot-password` ready | `Public/Token`, auth password-recovery, `canUseAuthTokenFlow` | Legacy route and ready screenshot exist | Current ready screenshot exists; focused ready-state recapture may exist in active branch/evidence records | `legacy-backed` | Same-run ready evidence in the target branch, Figma state frame, final evidence record |
| `/forgot-password` submitting/loading | Same as `/forgot-password` | Legacy disables button and shows spinner during `User.save({ id: 'forgot-password' })` | Current submit state exists but outcome evidence is incomplete | `legacy-backed`, `backend-blocked` | Same-run loading capture and API timing/mocking |
| `/forgot-password` `mail_sent` | Same as `/forgot-password` | Legacy toastr success then `$state.go('home')` | Current adapter maps `mail_sent` to success with `redirectTo: '/'`; visual parity not closed | `legacy-backed`, `backend-blocked` | Toast vs inline message, final redirect timing, copy decision |
| `/forgot-password` `mail_not_found` | Same as `/forgot-password` | Legacy shows error toastr for account-not-found | Current adapter maps to failed message | `legacy-backed`, `backend-blocked` | Product/security account-existence disclosure decision |
| `/forgot-password` `mail_error` / failure | Same as `/forgot-password` | Legacy shows generic error toastr | Current default failure exists | `legacy-backed`, `backend-blocked` | Error enum and retry behavior |
| `/reset-password/:token` missing/validating/invalid/expired | `Public/Token`, auth password-recovery, `canUseAuthTokenFlow` | Legacy route and reset template/controller exist | Current route validates token and has deterministic hooks | `legacy-backed`, `backend-blocked` | Token enum, used-token semantics, final copy |
| `/reset-password/:token` password mismatch/submitting/success/failure | Same as reset-password | Legacy template/controller includes password fields, policy text, submit outcome | Current mismatch and hooks exist | `legacy-backed`, `backend-blocked` | Password policy parity, terminal success redirect, failure copy |
| `/confirm-registration/:token` invalid | `Public/Token`, auth registration, `canUseAuthTokenFlow` | Legacy route resolves invalid token with toastr and home redirect | Current invalid screenshot exists | `legacy-backed`, `backend-blocked` | Toast/modal vs inline/redirect behavior |
| `/confirm-registration/:token` valid/session-ready | Same as confirm-registration | Legacy token-valid plus user/token redirects dashboard | Current route can bootstrap session | `legacy-backed`, `backend-blocked` | Bootstrap payload, dashboard/login landing evidence |
| `/confirm-registration/:token` pending approval/bootstrap failure | Same as confirm-registration | Legacy token-valid without user opens approval modal on home | Current deterministic hooks exist | `legacy-backed`, `backend-blocked` | Approval semantics and modal/copy parity |
| `/register` ready/public companion | `Public/Token`, auth registration, `canUseAuthTokenFlow` | Legacy `/register/:token` has squashed nullable token; `/register` is equivalent via optional param, not separate legacy state | Current `/register` route exists | `legacy-backed`, `backend-blocked` | Public registration enabled policy, form/schema parity, recaptcha handling |
| `/register/:token` valid invitation | `Public/Token`, auth registration, `canUseAuthTokenFlow` | Legacy invitation resolver fetches token and pre-fills fields | Current route accepts token and posts invitation | `legacy-backed`, `backend-blocked` | Invite payload, continuation fields, terminal copy |
| `/register/:token` invalid/expired/failure | Same as register-token | Legacy invalid token toastr/home behavior exists | Current hooks exist; `/register/null` divergence previously observed | `legacy-backed`, `backend-blocked`, `product-exception-needed` | Null-token behavior, invalid/expired semantics, product exception if not matched |
| `/users/invite-token` missing/invalid/expired | `Public/Token`, auth invite, `canUseAuthTokenFlow` | Matching legacy route not confirmed in login source; likely invite continuation adjacency | Current route and hooks exist | `current-app-only`, `backend-blocked` | Confirm legacy/source of truth and invite payload semantics |
| `/users/invite-token` ready/continuation/failure/terminal | Same as invite-token | Legacy continuation visual not confirmed | Current hooks exist | `current-app-only`, `backend-blocked` | Exact continuation fields and terminal behavior |
| `/auth/cezanne/:tenantGuid?` launch/missing tenant | `Public/Token`, auth cezanne, `canCompleteSsoCallback` | Legacy launch route exists for `/auth/cezanne/:tenantGuid`; no-tenant route is current explicit safety state | Current launch and missing-tenant hooks exist | `legacy-backed` for launch, `current-app-only` for missing tenant, `backend-blocked` | Provider launch framing and missing-tenant copy |
| `/auth/cezanne/callback` missing code/provider error/exchanging/exchange failure/bootstrap failure/success | `Public/Token`, auth cezanne, `canCompleteSsoCallback` | Legacy callback route exchanges code, stores failed cookie, redirects home/dashboard | Current callback states and hooks exist | `legacy-backed`, `backend-blocked` | Error taxonomy, cookie/modal parity, callback payload, success redirect |
| `/auth/saml` launch/provider error/missing code/exchanging/exchange failure/bootstrap failure/success | `Public/Token`, auth sso, `canCompleteSsoCallback` | Legacy `/auth/saml?code&error` route and launch form exist | Current launch/callback states and hooks exist | `legacy-backed`, `backend-blocked` | Error/modal parity, profile email launch behavior, callback payload |
| `/logout` explicit handoff | Shell/session `Page`, `canLogout` | Legacy shell route calls `LoginService.logout()` and redirects `/` | Current evidence records explicit handoff; approval record may mark `/logout` only approved | `replacement-ready-candidate` for explicit handoff only | Keep approval scoped; do not extend to `/`, token flows, or `/session-lost` |
| `/session-lost` | Shell/session `Page`, `canStartSession` | Legacy session-loss-specific visible state is not confirmed; legacy logout service may be reused from auth/error paths | Current visible route/hook exists | `current-app-only`, `backend-blocked` | Session-loss policy/copy and Figma evidence |

## Local Source Decisions Located

These findings were located in `/Users/kauesantos/Documents/recruit/frontend` and `/Users/kauesantos/Documents/recruit/ms-auth`. They document source-backed behavior; they do not approve replacement.

| Decision area | Located source-backed behavior | Remaining blocker |
|---|---|---|
| Login errors | `ms-auth` emits message strings for user not found/inactive, wrong password, Cezanne mandatory/mismatch, user setup required, activation required, approval required, and 2FA required/failed. Legacy login maps message substrings to resend-token modal, SSO mandatory modal, approval modal, 2FA code entry/error, setup-required modal, or generic login error. | Current app should not rely on substring matching long term; Backend/Auth still needs a structured error envelope and final copy/taxonomy decision. |
| Forgot-password disclosure | Legacy `/forgot-password` consumes `mail_not_found`, `mail_sent`, and `mail_error`. `mail_not_found` is an error toast, `mail_sent` is a success toast followed by home redirect, and `mail_error` is a generic error toast. | Product/Security must decide whether account-existence disclosure remains allowed or becomes a generic success response. |
| Reset-token lifecycle | Legacy reset pre-validates through `valid-token`; `token_not_found` redirects home with invalid-token copy. Submit handles `token_not_found`, `token_invalid`, `token_accepted`, and `token_expired`, then redirects home. | Backend/Auth should publish the token enum, used-token semantics, and whether success/expired/not-found remain toast-plus-redirect outcomes. |
| Confirm-registration continuation | Legacy `first-access` with `token_valid` plus user/token sets the session and redirects dashboard. `token_valid` without user redirects home and opens approval copy. Other outcomes show invalid-token copy and redirect home. | Backend/Auth should confirm the continuation payload that distinguishes session-ready from pending approval. |
| Register and invite continuation | Legacy `/register/:token` treats the token as optional/squashed. Invitation token validation returns `token_invalid` or `token_valid`; valid invite can prefill user/company fields and submission returns home with success modal. | Backend/Auth should confirm invite payload fields, invalid/expired split, and whether `/users/invite-token` has a legacy equivalent or is current-app-only. |
| Provider callbacks | `ms-auth` defines Google/Microsoft/Cezanne/SAML SSO routes. Cezanne callback returns to app `/auth/cezanne/callback`. SAML callback stores a short-lived Redis code, redirects to `/auth/saml?code=...`, and callback exchange returns `{ token }` or 422 token-not-found error. | Backend/Auth/Provider should publish provider error enum/copy, callback exchange envelope, missing-code behavior, and tenant/mismatch behavior. |
| Session loss | Legacy source confirms explicit logout clears auth state and redirects `/`; refresh failure on `old_token` shows a warning, returns home, and other refresh failures call logout. A dedicated legacy `/session-lost` route/copy was not located in the searched sources. | Product/Auth must decide `/session-lost` copy and whether it represents old-token warning, silent logout, or a new current-app-only state. |

## Immediate Blockers Before Further Task Completion

- Backend/product confirmation is still required for structured auth response enums, account-existence disclosure, reset/registration/invite continuation payloads, provider callback taxonomy, 2FA policy, activation/setup semantics, and session-loss copy.
- Figma frame/node references are missing for most auth token, provider callback, and session-loss states.
- Same-run legacy/current captures are still missing for most non-ready and outcome states.
- No approval should be inferred from this inventory.

## Source Notes

- Current route contracts: `src/lib/routing/route-contracts.ts`, `src/app/router.tsx`, `src/lib/routing/route-metadata.ts`.
- Current runtime/auth states: `src/domains/auth/routes/public-pages.tsx`, `src/domains/auth/api/auth-api-adapter.ts`, `src/domains/auth/models/session-foundation.ts`.
- Active docs: `docs/v0-auth-shell-dashboard-visual-contract.md`, `docs/visual-evidence-v0-auth-shell-dashboard.md`, `docs/replacement-approval-audit-v0-v5.md`, `docs/screen-design-flow-matrix.md`, `docs/screens.md`.
- Legacy references: `/Users/kauesantos/Documents/recruit/frontend/src/app/domain/login/`, `/Users/kauesantos/Documents/recruit/frontend/src/app/pages/_main/main.route.js`, `/Users/kauesantos/Documents/recruit/frontend/src/app/services/_exceptions/httpRequestErrorInterceptor.factory.js`.
- Auth service references: `/Users/kauesantos/Documents/recruit/ms-auth/src/external/utils.ts`, `/Users/kauesantos/Documents/recruit/ms-auth/src/app/use-case/sign-in.ts`, `/Users/kauesantos/Documents/recruit/ms-auth/src/app/use-case/sso-sign-in.ts`, `/Users/kauesantos/Documents/recruit/ms-auth/src/app/sso/`.
