# V0 Provider Callback Replacement Evidence Record

## Purpose

This focused record covers `/auth/cezanne/:tenantGuid`, `/auth/cezanne/callback`, and `/auth/saml`. It does not approve any route.

## Decision

| Field | Value |
|---|---|
| Route/family | Cezanne/SAML launch and callbacks |
| Evidence | `docs/visual-evidence-assets/v0/provider-callback-same-run-2026-04-23/capture-manifest.json`; `docs/visual-evidence-assets/v0/v0-state-hooks-manifest.json` |
| Figma frame/node reference | Missing for approval states |
| Backend/API readiness | Partial |
| Final decision | `blocked` |
| Other routes approved | No |

## Blockers

Provider-specific error enum, callback exchange envelope, popup/redirect UX, Figma frames, and final legacy/reference parity treatment for resolver-only callback states remain open.

## Final Determination

Decision: `blocked`. Raw provider error copy is safe, but replacement approval is not requested.
