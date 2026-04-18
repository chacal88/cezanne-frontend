# Frontend Greenfield Security Baseline

## Purpose

This document defines the browser-side security baseline currently enforced by `recruit-frontend`.

It does not replace backend security controls.
It documents the frontend responsibilities that are verifiable in source.

## Current controls

### 1. Security headers in dev and preview

`vite.config.ts` now serves the app with a baseline set of headers for local development and preview validation:

- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Permissions-Policy`

Source:
- `src/lib/security/headers.ts`
- `vite.config.ts`

### 2. Correlation-aware requests

All shared request helpers continue to attach `x-correlation-id` so frontend activity can be matched with backend logs, including requisition-approval approve/reject submissions.

Source:
- `src/lib/api-client/correlation-aware-fetch.ts`

### 3. CSRF-aware unsafe requests

Unsafe methods now attach:
- `x-csrf-token` when a `meta[name="csrf-token"]` tag is present
- `x-requested-with: XMLHttpRequest`
- `credentials: same-origin` by default

Source:
- `src/lib/api-client/csrf-token.ts`
- `src/lib/api-client/correlation-aware-fetch.ts`
- `src/domains/public-external/requisition-approval/support/workflow.ts`

## Security design rules

1. Browser-side security must live in shared boundaries, not in random feature components.
2. Request hardening belongs in `src/lib/api-client/`.
3. Header policy belongs in one shared module.
4. Frontend protections must be testable.

## Non-goals

The following are intentionally **not** treated as frontend-owned security controls here:
- true rate limiting enforcement
- authorization policy
- backend CSRF verification
- secret storage
- API abuse mitigation

Those remain server and infrastructure concerns.

## Validation

The current baseline is proven by:
- Vitest coverage for request hardening helpers
- build validation
- Playwright smoke validation for route stability after hardening

Run:

```bash
npm test
npm run build
npm run smoke:r0
```

## Follow-up expectations for R2+

As denser forms and mutations land, extend this baseline with:
- form-schema validation per domain using Zod
- mutation-specific failure handling
- stricter CSP tuning once production asset hosts are finalized
