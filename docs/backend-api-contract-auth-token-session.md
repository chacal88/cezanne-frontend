# Backend/API Contract: Auth, Token, and Session

## Purpose

This document is the Phase 1 contract draft for `backend-api-contract-change-plan.md`.

It converts the V0 auth/token/session backlog rows into a backend-facing API contract proposal while preserving confirmed source evidence separately from open backend decisions.

This document does not approve replacement for auth routes. `/logout` remains the only V0 auth transition with a separate replacement approval record.

## Scope

In scope:
- login and 2FA continuation;
- session bootstrap;
- forgot/reset password;
- confirm registration;
- public registration and invite continuation;
- Cezanne and SAML launch/callback exchange;
- logout and session-loss taxonomy;
- account profile read/update blocker definition.

Out of scope:
- changing route registration;
- replacing public/token visual parity evidence;
- backend implementation;
- turning `/users/invite-token` into a canonical public invite alias;
- storing or exposing raw callback codes, bearer tokens, passwords, 2FA codes, or provider payloads in UI, telemetry, screenshots, or docs artifacts.

## Confirmed Current Frontend Calls

Confirmed in `src/domains/auth/api/auth-api-adapter.ts`:

| Flow | Current transport | Current endpoint/operation | Notes |
|---|---|---|---|
| Login | auth service REST | `POST /login` | Sends `{ email, password, code? }`; expects `{ token }`. |
| Session bootstrap | app REST | `GET /authenticate` | Sends bearer token; expects `{ user }`. |
| Session enrichment | GraphQL | `AuthSessionBootstrap` | Reads `monolith.auth`, `monolith.featureFlags`, `monolith.userSettingsUiSession`, and `billing.currentSubscriptionUsage`. |
| Cezanne callback | auth service REST | `GET /login/cezanne/callback?json=1&code=` | Expects `{ token }`. |
| SAML callback | auth service REST | `GET /login/saml/callback?code=` | Expects `{ token }`. |
| Forgot password | app REST | `POST /user/forgot-password` | Sends `{ email }`; consumes `msg`. |
| Reset token validation | app REST | `GET /user/valid-token?token=` | Consumes `msg`. |
| Reset password | app REST | `POST /user/reset-password` | Sends `{ token, password, password_confirmation }`; consumes `msg`. |
| Confirm registration | app REST | `GET /user/first-access?token=` | Consumes `msg` and optional `token`. |
| Invite continuation | app REST | `POST /invitation` | Sends company/user payload plus invite token; consumes `msg`. |
| Public HC registration | app REST | `POST /hiring_company` | Consumes `register`. |
| Public RA registration | app REST | `POST /recruitment_agency` | Consumes `register`. |

Confirmed shared request behavior:
- `x-correlation-id` is attached by `correlationAwareFetch`.
- unsafe methods attach `x-requested-with: XMLHttpRequest`, and `x-csrf-token` when a CSRF meta tag exists.
- bearer tokens are sent through `Authorization: Bearer <token>`.
- `content-language` may be supplied for GraphQL bootstrap.

## Backend Envelope Proposal

All auth endpoints should converge on one structured response envelope where possible:

```ts
type AuthEnvelope<TData = unknown> = {
  status: 'ok' | 'error';
  code: string;
  message?: string;
  data?: TData;
  retryable?: boolean;
  correlationId?: string;
};
```

Rules:
- `code` is the frontend contract key; `message` is display/debug support only and must not be parsed for behavior.
- `correlationId` should match or echo `x-correlation-id` where backend infrastructure supports it.
- error codes must not expose token values, password details, callback codes, provider payloads, or account-sensitive details beyond approved legacy-visible outcomes.
- legacy `msg` values may remain as compatibility fields during migration, but structured `code` must become authoritative.

## Login Contract

Current request:

```ts
type LoginRequest = {
  email: string;
  password: string;
  code?: string;
};
```

Target success:

```ts
type LoginSuccess = AuthEnvelope<{
  token: string;
  twoFactor?: {
    required: false;
  };
}>;
```

Target failure/action codes:

| Code | Frontend normalized outcome | Route behavior |
|---|---|---|
| `invalid_credentials` | `invalid-credentials` | stay on login; inline safe error |
| `two_factor_required` | `two-factor-required` | stay in login route; show 2FA step |
| `two_factor_failed` | `two-factor-failed` | stay in 2FA step; do not clear email/password step state unnecessarily |
| `sso_mandatory` | `sso-mandatory` | safe SSO mandatory copy/modal; no shell entry |
| `activation_required` | `activation-required` | safe activation copy/modal; no shell entry |
| `approval_required` | `approval-required` | safe approval copy/modal; no shell entry |
| `setup_required` | `setup-required` | safe setup copy/modal; no shell entry |
| `bootstrap_failed` | `bootstrap-failed` | clear partial auth; return to public entry |
| `unknown_failure` | `invalid-credentials` or generic failure | stay public; safe retry copy |

Open backend decisions:
- explicit resend endpoint and allowed resend cadence for 2FA;
- lockout policy and visible lockout code;
- whether `validForThirtyDays` creates a frontend-visible remember-device request/response field;
- whether failed 2FA attempts return remaining-attempt metadata. If yes, metadata must be safe and optional.

## Session Bootstrap Contract

Bootstrap sequence remains:
1. auth service returns a token;
2. app REST `/authenticate` returns base user/session;
3. GraphQL bootstrap enriches shell/session state.

Target `/authenticate` response:

```ts
type AuthenticateResponse = AuthEnvelope<{
  user: AuthBootstrapUser;
}>;
```

Minimum `AuthBootstrapUser` fields consumed by the current frontend:
- `id`;
- `sys_admin`;
- `hiring_companies[].pivot`;
- `hiring_companies[].current_subscription`;
- `recruitment_agencies[].pivot`;
- `calendarIntegration`;
- `featureFlags`;
- `sms.included`;
- `billingHidden`.

The current adapter normalizes these into:
- `AccessContext.isAuthenticated`;
- `organizationType`;
- `isAdmin`;
- `isSysAdmin`;
- `pivotEntitlements`;
- `subscriptionCapabilities`;
- `rolloutFlags`.

Backend/API requirement:
- entity/action capability payloads that are too complex for frontend derivation should be server-authoritative in later domain contracts, aligned with ADR 0007.
- bootstrap failure must be distinguishable from credential/provider failure without exposing raw token data.

## Token Flow Contract

### Forgot Password

Current compatibility `msg` values:
- `mail_sent`;
- `mail_not_found`;
- `mail_error`.

Target codes:

| Code | Compatibility `msg` | Frontend behavior |
|---|---|---|
| `mail_sent` | `mail_sent` | success; return to `/` with safe flash/copy |
| `mail_not_found` | `mail_not_found` | preserve legacy account-not-found disclosure until Product/Security changes it |
| `mail_error` | `mail_error` | route-local retryable failure |

### Reset Password

Current compatibility `msg` values:
- `token_accepted`;
- `token_expired`;
- `token_used`;
- `token_not_found`;
- `token_invalid`.

Target codes:

| Code | Frontend behavior |
|---|---|
| `token_valid` | reset form can submit |
| `token_accepted` | success; return to `/` |
| `token_expired` | terminal token failure; return to `/` |
| `token_used` | terminal token failure; return to `/` |
| `token_not_found` | terminal token failure; return to `/` |
| `token_invalid` | terminal token failure; return to `/` |
| `password_policy_failed` | route-local validation failure |
| `retryable_failure` | route-local retryable failure |

### Confirm Registration

Current compatibility fields:
- `msg`;
- optional `token`.

Target codes:

| Code | Required data | Frontend behavior |
|---|---|---|
| `token_valid` | optional `token` | if token is present, bootstrap and land on resolved post-auth target; if absent, return to `/` with approval-pending copy |
| `approval_pending` | none | return to `/` with approval-pending copy |
| `token_expired` | none | return to `/` with safe invalid/expired copy |
| `token_invalid` | none | return to `/` with safe invalid/expired copy |
| `bootstrap_failed` | none | clear partial local session; return to `/` with safe login-retry copy |

### Register and Invite

`/register/:token` remains the legacy-backed invite continuation route.

Target invite validation/prefill data:

```ts
type InviteContinuationData = {
  tokenState: 'valid' | 'invalid' | 'expired' | 'used' | 'inaccessible';
  invitation?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    organizationType?: 'hiringCompany' | 'recruitmentAgency';
  };
};
```

Open backend decisions:
- final prefill field ownership;
- validation error envelope for public registration and invite submission;
- whether `/users/invite-token` remains current-app-only, is removed, or becomes an explicit alias through a future product/backend decision.

## Provider Callback Contract

Provider families in this phase:
- `cezanne`;
- `saml`.

Target provider callback codes:

| Code | Frontend behavior |
|---|---|
| `provider_error` | public safe failure; no raw provider error shown |
| `missing_code` | public safe failure |
| `code_expired` | public safe failure |
| `token_not_found` | public safe failure |
| `tenant_not_found` | public safe failure |
| `tenant_mismatch` | public safe failure |
| `exchange_failed` | public safe failure |
| `bootstrap_failed` | clear partial auth; public safe failure |
| `exchange_succeeded` | bootstrap session and land on resolved post-auth target |

Rules:
- raw callback `code`, provider errors, and provider payloads must not appear in UI, telemetry, screenshots, or docs artifacts.
- success uses the same bootstrap contract as login.
- provider launch/callback failures remain public/token route-local and never grant `canEnterShell`.

## Logout and Session Loss

Confirmed:
- `/logout` clears local auth state and returns to public entry.
- `/session-lost` is current-app-only and separate from `/logout`.

Target session-loss taxonomy:

| Code | Meaning | Frontend behavior |
|---|---|---|
| `old_token` | legacy refresh/session token is no longer accepted | clear local session; show safe expiry copy; return to `/` |
| `token_expired` | bearer/session token expired | same as above |
| `session_revoked` | server revoked session | same as above |
| `identity_changed` | session no longer matches active identity/org context | same as above |
| `unknown_session_failure` | fallback session failure | clear local session; safe public entry |

Open Product/Auth decision:
- whether `old_token` is the only session-loss trigger or one member of the broader taxonomy above.

## Account Profile Contract Blocker

The current account profile surfaces expose frontend fixture states for:
- ready;
- dirty;
- saving;
- saved;
- save-failed;
- retry;
- degraded;
- denied;
- local validation.

Backend/Account still needs to publish:
- user profile read/update schema;
- hiring company profile read/update schema;
- recruitment agency profile read/update schema;
- field ownership rules;
- server validation envelope;
- stale/conflict behavior;
- safe audit/update metadata.

## Adapter Requirements

Frontend adapters must:
- accept compatibility `msg` values during migration;
- prefer structured `code` once backend publishes it;
- map backend envelopes into route-local view models;
- clear partial session data on bootstrap failure;
- keep token failures in the public auth shell;
- avoid passing raw REST/GraphQL DTOs into UI components.

## Telemetry and Security Rules

Required:
- propagate `x-correlation-id` for every auth/token/session request;
- emit auth lifecycle events through the observability port, not vendor SDKs;
- keep route/domain/module context attached where available;
- avoid raw token, password, 2FA code, callback code, provider payload, profile payload, and account-sensitive values in telemetry.

Allowed telemetry fields:
- normalized outcome code;
- provider family;
- route family;
- entry mode;
- fallback kind;
- correlation id.

## Remaining Blockers

P0 backend blockers:
- publish structured auth envelope and code list;
- publish 2FA resend/lockout/remember-device policy;
- publish provider callback exchange envelope and provider error enum;
- publish confirm/register/invite continuation payloads;
- publish session-loss trigger taxonomy.

P1 schema blockers:
- publish account profile read/update schemas and validation envelopes.

P3 replacement blockers:
- matched visual/parity evidence remains required for every auth/token/provider/session-loss state except the already scoped `/logout` record.

