# Visual Evidence Capture Plan

## Purpose

This plan operationalizes the current roadmap phase: visual evidence capture after V0-V5 contract package creation and before Figma/screen-flow production.

It defines what must be captured, where evidence must be recorded, and when a route may be promoted from `Contract-reviewed` to `Figma-ready` in `pre-figma-flow-review.md`.

Product decision on 2026-04-22: the whole replacement project requires pixel parity with the legacy frontend wherever a legacy screen/state exists. `Figma-ready` is permission to produce canonical Figma/screen-flow frames; it is not production replacement approval. Replacement approval requires matched legacy/current/Figma evidence or an explicit product exception tied to a route/family/gap id.

## Current status

| Item | Status | Notes |
|---|---|---|
| Route contract review | Done | All 104 canonical route rows plus 4 alias/reference rows are contract-reviewed. |
| V0-V5 visual contracts | Done | Prepared under `v0-*` through `v5-*` visual contract files. |
| Visual evidence capture | Current phase | Evidence must be captured from current app and the matching legacy/reference app wherever legacy exists. V0 covered sub-blocks, V1 Jobs, V3 public/external/token, V4 operations, and V5 desktop current-app SysAdmin/platform rows now have enough evidence for Figma/screen-flow drafting. V2 remains candidate parity-blocked. |
| Figma production | Partially unblocked | Use `figma-screen-flow-handoff-index.md` as the consolidated handoff index for allowed drafting rows. V0, V1, V3, V4, and covered V5 rows may proceed to Figma drafting with deferred unknowns annotated. V2 remains blocked. No row is replacement-approved until pixel parity is confirmed or a product exception is recorded. |

## Evidence package schema

Each captured route/family must record the following fields before `Figma-ready`:

| Field | Required content |
|---|---|
| Route/family | Canonical route or named family from `pre-figma-flow-review.md`. |
| Visual contract | V0-V5 visual contract file that owns the route/family. |
| Evidence source | Current greenfield app plus matching legacy/reference app where legacy exists; screenshot or explicit design reference only when legacy is unavailable or product accepts it as the source. |
| Viewport | Width/height and browser/device assumptions. |
| Captured states | State list matched against the owning visual contract. |
| Pixel-parity comparison | Side-by-side legacy/current/Figma comparison for layout, spacing, typography, icon placement, modal/drawer composition, table geometry, tabs, and action placement. |
| Accepted deviations | Product-approved exceptions only, with affected route/family/gap id. Unapproved differences are blockers. |
| Deferred visual debt | Differences not accepted yet but not blocking implementation/data contracts. |
| Backend/API unknowns | Unknown payloads that must not be invented in Figma. |
| Security exclusions | Credentials, raw tokens, auth codes, message bodies, provider payloads, signed URLs, PII boundaries. |
| Figma-ready decision | Yes/no plus reason. |

## Evidence capture order

| Order | Package | First evidence target | Why first |
|---:|---|---|---|
| 1 | `v0-auth-shell-dashboard-visual-contract.md` | Login, shell, dashboard | Anchors all authenticated and public visual language. |
| 2 | `v1-jobs-visual-contract.md` | Jobs list/detail/authoring | Highest recruiter-core route family after R0. |
| 3 | `v2-candidates-visual-contract.md` | Candidate hub/database/actions | Second highest recruiter-core route family and depends on jobs handoff patterns. |
| 4 | `v3-public-external-token-visual-contract.md` | Shared token lifecycle | Public/token frames must stay separate before Figma production. |
| 5 | `v4-operations-visual-contract.md` | Settings/integrations/billing/reports/team/favorites/marketplace | Operational families can reuse shell/action patterns from V0-V2. |
| 6 | `v5-sysadmin-platform-visual-contract.md` | Platform users/master data/taxonomy | Long-tail platform admin surfaces after org/product shell patterns are confirmed. |

## Capture checklist per state

- [ ] Open the canonical route in the current greenfield app when available.
- [ ] Open the equivalent legacy/reference route when a legacy screen/state exists.
- [ ] Capture the viewport and URL without exposing sensitive tokens or credentials.
- [ ] Confirm route ownership and capability from `pre-figma-flow-review.md`.
- [ ] Match the visible state to the owning V0-V5 visual contract.
- [ ] Record visual differences as blockers unless there is an explicit product exception tied to a route/family/gap id.
- [ ] Record backend/API unknowns as non-inventable Figma constraints.
- [ ] Record security exclusions for the route family.
- [ ] Do not mark `Figma-ready` unless every required state for that row/family has evidence or an explicit accepted omission.
- [ ] Do not mark replacement approval unless pixel parity is confirmed for the matched legacy/current/Figma state or a product exception exists.

## Promotion rule

A row in `pre-figma-flow-review.md` may move from `Contract-reviewed` to `Figma-ready` only when:

1. the owning V0-V5 contract exists;
2. the relevant evidence package fields are complete;
3. required states are either captured or explicitly accepted as not needing a separate frame;
4. pixel-parity blockers, product-approved exceptions, and deferred debt are documented;
5. backend/API unknowns are documented as non-inventable;
6. no public/token, provider setup, org/platform, or telemetry boundary is violated.

Replacement approval requires an additional pass after Figma production: matched legacy/current/Figma screenshots at the same viewport and data/state must show no unintended pixel-level difference. Current-app-only evidence can unblock Figma drafting, but cannot approve replacement where legacy exists.

## Suggested evidence log location

Use one log file per package when evidence capture begins:

| Package | Suggested evidence log |
|---|---|
| V0 | `visual-evidence-v0-auth-shell-dashboard.md` |
| V1 | `visual-evidence-v1-jobs.md` |
| V2 | `visual-evidence-v2-candidates.md` |
| V3 | `visual-evidence-v3-public-external-token.md` |
| V4 | `visual-evidence-v4-operations.md` |
| V5 | `visual-evidence-v5-sysadmin-platform.md` |

The consolidated handoff index for rows that are already evidence-covered and allowed for drafting is `figma-screen-flow-handoff-index.md`.

Do not create empty evidence logs preemptively. Create each log only when capture for that package starts.

## Tooling notes

- Browser automation may be used to capture current app states, but tool output is evidence only, not product truth.
- Redact credentials, auth tokens, invite tokens, callback codes, signed URLs, and message/document contents from screenshots and notes.
- If a route requires live backend state that is not available locally, document the blocker and keep the row `Contract-reviewed`.
- If evidence reveals missing product behavior, open or update an OpenSpec change before changing route/state/capability contracts.
