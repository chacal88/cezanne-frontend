# V0 Session Loss Replacement Evidence Record

## Purpose

This focused record covers `/session-lost`. It does not approve `/session-lost` or broaden `/logout` approval.

## Decision

| Field | Value |
|---|---|
| Route/family | `/session-lost` |
| Evidence | `docs/visual-evidence-assets/v0/auth-same-run-2026-04-23/capture-manifest.json`; `docs/visual-evidence-assets/v0/v0-state-hooks-manifest.json` |
| Figma frame/node reference | Missing for approval states |
| Backend/API readiness | Partial |
| Final decision | `blocked` |
| Other routes approved | No |

## Blockers

Backend trigger taxonomy, product decision on current-app-only session-loss behavior, Figma frame, and final parity/product-exception review remain open.

## Final Determination

Decision: `blocked`. `/session-lost` is separate from `/logout`; `/logout` approval remains scoped to `replacement-evidence-v0-logout.md`.
