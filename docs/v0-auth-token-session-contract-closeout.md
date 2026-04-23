# V0 Auth Token Session Contract Closeout

## Purpose

This record implements OpenSpec change `v0-auth-token-session-contract-closeout`.

It closes the frontend contract position for V0 auth/token/session using current source evidence from `recruit-frontend`, legacy evidence from `frontend`, and backend source evidence from `ms-auth`. This closeout itself does not approve replacement. Replacement approval is granted only by focused evidence records; current focused approvals are `/logout` and `/forgot-password`.

## Confirmed Contract

| Area | Confirmed frontend contract | Remaining backend/API follow-up |
|---|---|---|
| Login failures | Normalize to `invalid_credentials`, `two_factor_required`, `two_factor_failed`, `sso_mandatory`, `activation_required`, `approval_required`, `setup_required`, `bootstrap_failed`, or `unknown_failure`. Legacy message-substring mapping remains fallback compatibility only. | Publish structured error envelope names so frontend no longer depends on message text. |
| 2FA policy | `ms-auth` sends a six-digit email verification code through `SystemMessageSendRequest`; code is valid for 10 minutes; failed verification stays in the 2FA step; verified codes are marked used. No source-backed resend endpoint or lockout policy was located. `validForThirtyDays` is a stored setting, but sign-in source does not confirm remember-device behavior. | Decide/resurface resend and lockout policy, and confirm whether `validForThirtyDays` becomes a frontend-visible remember-device contract. |
| Partial session clearing | Login/bootstrap, provider callback/bootstrap, confirm-registration bootstrap, and session-loss failures clear partial local session state and return to safe public auth outcomes. Raw token material is excluded from UI, telemetry, screenshots, and manifests. | Backend should preserve failure envelopes that let frontend distinguish bootstrap failure from credential/provider failure without exposing raw token data. |
| Landing and return targets | HC/RA contexts default to `/dashboard`; SysAdmin uses the validated platform landing route; sanitized internal `returnTo` may override when it is an allowed internal route. Public/token, external, and unsafe targets fall back to `/dashboard` or public entry as appropriate. | None for frontend routing; backend should not send open redirects. |
| Forgot password | Preserve `mail_sent`, `mail_not_found`, and `mail_error`; account-not-found disclosure remains allowed until Product/Security changes it. | Backend/Auth should keep these enums stable or open a product/security change to intentionally genericize disclosure. |
| Reset password | Support invalid/not-found, expired, used, accepted/success, password mismatch, password-policy failure, and retryable failure outcomes. Terminal token states return to `/` with safe copy. | Backend/Auth should publish the exact enum names and password-policy failure envelope. |
| Confirm registration | `token_valid` with session token bootstraps and lands on `/dashboard`; `token_valid` without token and `approval_pending` return to `/` with approval-pending copy; invalid/expired return to `/`; bootstrap failure clears partial continuation and returns to `/` with safe login-retry copy. | Backend/Auth should keep the continuation payload shape explicit: token presence versus approval-pending state. |
| Register/invite | `/register/:token` is the legacy-backed invite continuation route. `token_valid` may prefill invitation fields; invalid/expired return to `/`; submit success returns to `/`; validation and retryable failures stay route-local. | Backend/Auth should publish final prefill fields and validation envelope. |
| `/users/invite-token` | Current-app-only for this contract package. The located legacy `users.invite-token` is an authenticated admin token-link modal, not a public invite acceptance route. Do not alias it to `/register/:token` without a future product/backend change. | Future product/backend decision may remove it, keep it current-only, or explicitly alias it. |
| Cezanne callback | Launch redirects to auth service `/login/cezanne/:tenantGuid`; missing tenant is current-app safe failure; callback exchanges safe `code` only through auth service and excludes raw code from UI/evidence; provider/missing-code/exchange/bootstrap failures stay public with safe copy; success bootstraps and resolves landing. | Backend/Auth/Provider should publish structured provider error enum, tenant lookup behavior, and callback exchange failure envelope. |
| SAML callback | Launch collects profile email and redirects to auth service `/login/saml`; auth service stores short-lived Redis code and redirects to `/auth/saml?code=...`; callback exchange returns token or token-not-found failure; raw code stays excluded from UI/evidence. | Backend/Auth/Provider should publish structured SAML error enum and callback exchange failure envelope. |
| Session loss | `/session-lost` remains current-app-only and separate from `/logout`; it clears local session and returns to public entry with safe expiry copy. Legacy `old_token` warning is source-backed policy evidence, but not a dedicated legacy route. | Product/Auth should decide whether `old_token` is the only trigger or one member of a broader session-expiry taxonomy. |

## Replacement Status

No route moves to replacement-approved from this contract closeout. Rows with clarified contracts remain blocked by one or more of:

- missing structured backend envelopes;
- missing Figma frame/state evidence;
- missing matched legacy/current/Figma parity;
- current-app-only route status.

## Follow-Up

A follow-up implementation change is required only after Backend/Auth publishes structured envelopes or changes a route outcome. Expected follow-up scope:

- replace legacy message-substring auth error parsing with structured error-code mapping;
- add frontend handling for any confirmed 2FA resend, lockout, or remember-device contract;
- adjust token-flow adapters if backend enum names differ from the approved frontend outcomes;
- update provider callback adapters when structured Cezanne/SAML failure envelopes are available.
