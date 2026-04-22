# Visual Evidence V4 Operations

## Purpose

This log records the first V4 operations visual evidence capture pass. It supports `v4-operations-visual-contract.md` and keeps screenshots as visual/state evidence only, not as backend schema truth or final Figma approval.

## Capture metadata

| Field | Value |
|---|---|
| Capture date | 2026-04-22 |
| Viewport | Desktop `1440x900`, device scale factor `1` |
| Current app | `http://127.0.0.1:5173` |
| Capture tool | Local Playwright script from the repository dependency |
| Capture manifests | `visual-evidence-assets/v4/v4-capture-manifest.json`; `visual-evidence-assets/v4/interactive-2026-04-22/interactive-capture-manifest.json` |
| Security exclusions | No credentials, raw provider payloads, diagnostic logs, payment tokens, card PAN data, report exports, invite tokens, raw user/session payloads, or tenant-sensitive backend payloads are stored in this log. |
| Access profiles | HC admin for settings, integrations, reports, billing, team, and favorites; RA admin for agency settings and marketplace. Captures use local `recruit.localAuthSession` visual evidence sessions only. |

## Capture correction

The first local attempt used only `recruit.accessContextOverride`, but `AppProviders` initializes runtime access from `recruit.localAuthSession`. That produced access-denied screenshots and was corrected before this log was finalized. The baseline manifest now records `sessionStorage: recruit.localAuthSession`, and all 61 baseline records are `captured` with zero access-denied outcomes.

## Evidence inventory

| Family | Evidence source | Screenshots | Captured states | Decision |
|---|---|---|---|---|
| Settings | Current greenfield | `visual-evidence-assets/v4/current/settings-*.png` | Careers page, application page nested section, job listings list/editor, hiring flow, custom fields, templates index/detail/subsections, reject reasons, API endpoints, forms/docs, requisition workflows, `/parameters` compatibility, and RA agency settings base states | Initial evidence only |
| Integrations admin | Current greenfield | `visual-evidence-assets/v4/current/integrations-*.png` | Provider index plus connected, degraded, reauth-required, disconnected, and unsupported/unavailable provider detail states | Initial evidence only |
| Reports | Current greenfield | `visual-evidence-assets/v4/current/reports-*.png` | Report index, jobs report ready/empty/degraded/partial/stale/retryable, diversity unsupported scheduling, source unsupported result, and legacy compatibility entries | Initial evidence only |
| Billing | Current greenfield | `visual-evidence-assets/v4/current/billing-*.png` | Billing overview, upgrade confirmation, SMS usage warning, primary/new/expired/challenge/failed/unavailable card states | Initial evidence only |
| Team | Current greenfield | `visual-evidence-assets/v4/current/team-*.png` | Team index, recruiter visibility, and org invite management base states | Initial evidence only |
| Favorites | Current greenfield | `visual-evidence-assets/v4/current/favorites-*.png` | Favorites index, personal detail, unavailable detail, draft/pending/approved/rejected/unavailable request states | Initial evidence only |
| Marketplace | Current greenfield | `visual-evidence-assets/v4/current/marketplace-*.png` | RA marketplace `fill`, `bidding`, `cvs`, `assigned`, and unknown-type unavailable states | Initial evidence only |

## Interactive evidence inventory

| Family | Evidence source | Screenshots | Captured states | Decision |
|---|---|---|---|---|
| Settings save workflows | Current greenfield local fixture interactions | `visual-evidence-assets/v4/interactive-2026-04-22/current/settings-templates-*`, `settings-hiring-flow-*`, `settings-custom-fields-*`, `settings-reject-reasons-*` | Simulated recoverable save failure, retry, and saved states for templates, hiring flow, custom fields, and reject reasons | Covered as local-fixture interaction evidence |
| Forms/docs controls | Current greenfield local fixture interactions | `visual-evidence-assets/v4/interactive-2026-04-22/current/settings-forms-docs-*` | Empty, stale, degraded, unavailable, save failure, retry, and saved states | Covered as local-fixture interaction evidence |
| API endpoints | Current greenfield local fixture interactions | `visual-evidence-assets/v4/interactive-2026-04-22/current/settings-api-endpoints-*` | HTTPS validation error, simulated save error, and saved state | Covered as local-fixture interaction evidence |
| Job listing editor | Current greenfield local fixture interactions | `visual-evidence-assets/v4/interactive-2026-04-22/current/settings-job-listing-editor-*` | Save completed and publish completed states | Covered as local-fixture interaction evidence |
| Billing states | Current greenfield route-state fixture interactions | `visual-evidence-assets/v4/interactive-2026-04-22/current/billing-*` | Overview loading/empty/denied/unavailable/stale/degraded/pending-change; upgrade same-plan/card-blocked/submitted/success/failure/retry/challenge/stale/degraded/unavailable; SMS inactive/trial/active/suspended/card-blocked/pending/success/partial-success/failed/retry/stale/degraded/denied/unavailable; backup/missing/pending card states | Covered as local-fixture interaction evidence |
| Integrations provider setup | Current greenfield local fixture interactions | `visual-evidence-assets/v4/interactive-2026-04-22/current/integrations-*` | Invalid save, saved configuration, auth pending, auth failed, diagnostics passed, diagnostics failed, diagnostics logs-ready, auth/connect/reauthorize actions, and unsupported provider examples | Covered as local-fixture interaction evidence |
| Reports commands | Current greenfield local fixture interactions | `visual-evidence-assets/v4/interactive-2026-04-22/current/reports-*` | Export and schedule success for ready jobs report; failed/retryable command states; blocked export/schedule for stale and partial results; diversity export success and schedule unsupported/blocked | Covered as local-fixture interaction evidence |
| Team states | Current greenfield route-state fixture interactions | `visual-evidence-assets/v4/interactive-2026-04-22/current/team-*` | Empty, stale, unavailable, refresh-required, hidden recruiter filter, stale hidden filter, and invite unavailable states | Covered as local-fixture interaction evidence |
| Favorites states | Current greenfield route-state fixture interactions | `visual-evidence-assets/v4/interactive-2026-04-22/current/favorites-*` | Favorites empty and unavailable states plus baseline request variants | Covered as local-fixture interaction evidence |
| Marketplace states | Current greenfield route-state fixture interactions | `visual-evidence-assets/v4/interactive-2026-04-22/current/marketplace-*` | Supported list types, unknown type unavailable, and assigned empty state | Covered as local-fixture interaction evidence |
| Representative denied/fallback states | Current greenfield local-session profile interactions | `visual-evidence-assets/v4/interactive-2026-04-22/current/denied-*` | Denied/fallback examples for settings, integrations, reports, billing-hidden, and marketplace outside RA scope | Covered as access-boundary evidence |

## Confirmed visual observations

- V4 operational routes render through the authenticated shell and preserve the expected org/platform separation for the captured access profiles.
- Settings routes expose route-local form state and compatibility routing without creating a monolithic `/parameters` screen.
- Authenticated provider setup remains separate from public `/integration/*` token-entry routes; provider detail pages mask configured secret fields instead of exposing raw credentials.
- Reports expose result-state and command-state labels, including blocked command semantics for stale/partial/degraded results and unsupported scheduling for diversity/source families.
- Interactive report captures confirm export/schedule command success for ready reports and blocked command handling for stale/partial or unsupported scheduling states.
- Billing captures confirm the org commercial billing boundary, card state variants, and parent-return affordances without exposing payment-provider fields.
- Interactive billing captures cover the commercial-state, upgrade, SMS, and card mutation/readiness variants required for V4 screen-flow work. Payment-provider UI remains an annotated backend/provider unknown.
- Team, favorites, and marketplace captures confirm org/RA scope boundaries and avoid platform SysAdmin queue behavior.
- Team, favorites, and marketplace follow-up captures cover the non-ready states required by the V4 visual contract, including empty, stale, unavailable, refresh-required, and unknown-type handling.
- Interactive provider setup captures confirm that configuration, auth, and diagnostics actions remain provider-setup-owned and do not expose raw credentials or logs.

## Accepted deviations in this pass

- Current screenshots are accepted only as current greenfield evidence. They are not accepted as final visual parity references.
- Fixture-backed and adapter-backed data is accepted as state-coverage evidence only. It is not production backend API evidence.
- The `/parameters` captures are compatibility evidence only; canonical settings pages remain the visual target for subsections.
- Interactive captures are accepted as local-fixture workflow evidence only; they do not prove production persistence, provider auth, payment, report export delivery, or backend schemas.
- Legacy/reference comparison was not performed in this pass. For V4, current greenfield route/state contracts are accepted as the Figma handoff basis because the operational release intentionally shipped a greenfield foundation boundary, not pixel parity for legacy operations screens.

## Deferred Product Depth

- Final production payload layouts for settings schemas, provider credentials, provider diagnostics, report metrics, payment forms, team role policy, favorites ownership, and marketplace items remain backend/API-owned.
- Payment-provider challenge UI and card tokenization fields must be represented as provider-owned placeholders until provider contracts exist.
- `/billing/card/:id` is accepted for V4 Figma as a shell-aware full route frame. A later design decision may refine it into a drawer/modal, but that would be a visual refinement, not a V4 route/state blocker.
- Legacy/reference review may still inform visual polish, but it is no longer a V4 Figma-readiness blocker for current-app screen-flow production.

## Backend/API unknowns

- Settings payloads, template schemas, public reflection payloads, provider credential storage, diagnostic logs, report metrics/dimensions, export/schedule payloads, payment and card tokenization, team role write policy, favorite ownership fields, favorite request mutations, and marketplace item/action schemas remain non-inventable.
- Current screenshots may show placeholder ids, titles, counts, provider names, plan names, or item labels. Figma must treat them as examples unless a backend contract confirms them.

## Figma readiness decision

| Area | Decision | Reason |
|---|---|---|
| Settings | Figma-ready for V4 current-app screen-flow basis | Route-base, compatibility, save failure/retry/saved, validation, forms/docs empty/stale/degraded/unavailable, API endpoint validation/save, job-listing save/publish, and representative denied states are captured. |
| Integrations admin | Figma-ready for V4 current-app screen-flow basis | Provider index/detail, supported/unsupported provider states, configuration save/validation, auth pending/failed, diagnostics passed/failed/logs-ready, and readiness handoff states are captured. |
| Reports | Figma-ready for V4 current-app screen-flow basis | Report index/family/result states, export/schedule success, failed/retryable command state, stale/partial blocking, unsupported scheduling, and legacy compatibility entries are captured. |
| Billing | Figma-ready for V4 current-app screen-flow basis | Overview, upgrade, SMS, card, provider challenge, pending/success/failure/retry, stale/degraded/unavailable, card-blocked, and denied/hidden states are captured. Card provider fields remain deferred. |
| Team | Figma-ready for V4 current-app screen-flow basis | Team, recruiter visibility, invite, empty, stale, unavailable, refresh-required, hidden filter, action-readiness, and denied/fallback examples are captured. |
| Favorites | Figma-ready for V4 current-app screen-flow basis | List/detail/request workflows, empty/unavailable states, request terminal variants, and org/platform separation are captured. |
| Marketplace | Figma-ready for V4 current-app screen-flow basis | RA list types, empty state, unknown-type unavailable, and HC denied fallback are captured. |

V4 rows may proceed to Figma for current-app screen-flow production with the deferred product-depth notes above attached. Figma must not invent backend/provider schemas, payment-provider fields, diagnostic logs, report metrics, invite payloads, or marketplace item actions beyond the captured route/state contracts.
