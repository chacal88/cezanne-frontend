# Visual Evidence V2 Candidates

## Purpose

This log records V2 candidate visual evidence captured after V1 and recaptured after candidate product-composition closeout. It supports `v2-candidates-visual-contract.md` and explicitly separates behaviour coverage, legacy parity blockers, and deferred backend/schema details.

## Capture metadata

| Field | Value |
|---|---|
| Capture date | 2026-04-21 |
| Viewport | Desktop `1440x900`, device scale factor `1` |
| Current app | `http://localhost:5173` |
| Legacy/reference app | `http://localhost:4000` |
| Local seed | `local-dev/scripts/seed-api-data.sh` with owner `kauemsc@gmail.com`, company `Warner Brothers`, job id `13`, candidate id `34`. Passwords and auth tokens are intentionally omitted. |
| Capture manifest | `visual-evidence-assets/v2/v2-capture-manifest.json` |
| Security exclusions | No credentials, raw tokens, provider payloads, signed URLs, CV document bodies, survey answers, or candidate-private message contents are stored in this log. |

## Evidence inventory

| Route/family | Evidence source | Screenshot | Captured states | Decision |
|---|---|---|---|---|
| `/candidates-database` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-ready-1440x900.png` | Canonical route, product database header, saved filters/list rail, bulk toolbar, result table, ATS source state | Parity-pending; behaviour captured only |
| `/candidates-database?query=empty` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-empty-1440x900.png` | Empty search/list state with recovery context | Parity-pending; behaviour captured only |
| `/candidates-database?query&page&sort&stage&tags=bulk` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-filtered-bulk-1440x900.png` | Sanitized filters, pagination, filtered-empty recovery, bulk state | Parity-pending; behaviour captured only |
| `/candidates-database?advanced=true&advancedQueryState=invalid` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-advanced-invalid-1440x900.png` | Advanced invalid state with safe query identifier | Parity-pending; behaviour captured only |
| `/candidates-database?advanced=true&advancedQueryState=unsupported` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-advanced-unsupported-1440x900.png` | Advanced unsupported/unavailable state | Parity-pending; behaviour captured only |
| `/candidates-database?tags=bulk,bulk-partial` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-bulk-partial-1440x900.png` | Bulk partial state | Parity-pending; behaviour captured only |
| `/candidates-database?tags=bulk,bulk-blocked` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-bulk-blocked-1440x900.png` | Bulk blocked state | Parity-pending; behaviour captured only |
| `/candidates-database?tags=bulk,bulk-failed` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-bulk-failed-1440x900.png` | Bulk failed/retry state | Parity-pending; behaviour captured only |
| `/candidates-database?tags=duplicate,import-failed` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-duplicate-import-failed-1440x900.png` | ATS duplicate/import failure state | Parity-pending; behaviour captured only |
| `/candidates-database` | Legacy/reference | `visual-evidence-assets/v2/legacy/legacy-v2-candidates-database-ready-seeded-1440x900.png` | Authenticated legacy candidate database with seeded rows, search, saved filters, bulk actions, add column | Canonical visual reference for database composition |
| `/candidate/:id` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-ready-1440x900.png` | Direct entry with profile summary, action stack, document/contract panels, insights, collaboration | Parity-pending; behaviour captured only |
| `/candidate/:id/:job/:status/:order/:filters/:interview?entry=job` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-job-context-1440x900.png` | Job context with sequence and parent context | Parity-pending; behaviour captured only |
| `/candidate/:id?entry=database&returnTo=...` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-database-return-1440x900.png` | Database-origin return target | Parity-pending; behaviour captured only |
| `/candidate/:id?entry=notification` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-notification-entry-1440x900.png` | Notification-origin context | Parity-pending; behaviour captured only |
| `/candidate/:id?degrade=...` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-provider-degraded-1440x900.png` | Documents/contracts/surveys/custom-fields/collaboration section-local degradation | Parity-pending; behaviour captured only |
| `/candidate/:id` upload CV action | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-upload-cv-action-1440x900.png` | Upload replacement CV action feedback | Parity-pending; behaviour captured only |
| `/candidate/:id/:job/cv/:cv_id/schedule` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidate-schedule-ready-1440x900.png`, `visual-evidence-assets/v2/current/greenfield-v2-candidate-schedule-job-context-1440x900.png`, `visual-evidence-assets/v2/current/greenfield-v2-candidate-schedule-failure-1440x900.png` | Schedule launcher ready, contextual parent, failure/retry | Parity-pending; behaviour captured only |
| `/candidate/:id/cv/:cv_id/offer` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidate-offer-ready-1440x900.png`, `visual-evidence-assets/v2/current/greenfield-v2-candidate-offer-database-origin-1440x900.png`, `visual-evidence-assets/v2/current/greenfield-v2-candidate-offer-complete-refresh-1440x900.png` | Offer launcher ready, database-origin parent, success/refresh | Parity-pending; behaviour captured only |
| `/candidate/:id/cv-reject/:cv_id` | Current greenfield | `visual-evidence-assets/v2/current/greenfield-v2-candidate-reject-ready-1440x900.png` | Reject launcher ready route context | Parity-pending; behaviour captured only |
| `/candidate/:id/:job` | Legacy/reference | `visual-evidence-assets/v2/legacy/legacy-v2-candidate-detail-job-context-seeded-id-34-job-13-1440x900.png` | Legacy candidate profile composition, hiring flow, actions, CV pane, notes | Canonical visual reference for detail composition |

## Superseded captures

These files are retained for audit trail only and must not be used for implementation:

| File | Reason | Replacement |
|---|---|---|
| `visual-evidence-assets/v2/superseded/legacy-v2-candidate-detail-seeded-id-34-redirected-dashboard-1440x900.png` | Direct legacy `/candidate/34` redirected to dashboard and did not show a candidate profile. | `visual-evidence-assets/v2/legacy/legacy-v2-candidate-detail-job-context-seeded-id-34-job-13-1440x900.png` |


## Extended candidate database behavior capture

After the first V2 pass, the candidate database was recaptured with legacy-style interactions because approximate composition was not sufficient. These captures are canonical for the covered database behaviours and replace the older scaffold-style database screenshots in `v2/current`.

| Behaviour | Screenshot | Covered interaction |
|---|---|---|
| Ready database | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-full-ready-1440x900.png` | Search row, saved filters/lists rail, bulk toolbar, default table columns |
| Add new dropdown | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-add-new-menu-1440x900.png` | `Add new` expands to `New filter` and `New list` |
| New list modal | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-new-list-modal-empty-1440x900.png` | Modal shell, name field, cancel/create affordances |
| New list visibility | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-new-list-visibility-menu-1440x900.png` | `Visible to` dropdown with `Everyone` and `Only me` |
| Created list applied | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-list-created-applied-1440x900.png` | Created saved list appears, count badge displays, list filter applies and table shows empty result |
| Saved filters menu | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-saved-filter-menu-1440x900.png` | Show all filters, only private filters, edit filters |
| Saved lists menu | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-saved-list-menu-1440x900.png` | Show all lists, only private lists, edit lists |
| Reset to default | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-reset-default-1440x900.png` | Applied list/filter is cleared and table returns to default |
| Sort ascending | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-sort-name-asc-1440x900.png` | Full name header toggles ascending URL-owned sort |
| Sort descending | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-sort-name-desc-1440x900.png` | Full name header toggles descending URL-owned sort |
| Add column menu | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-add-column-menu-1440x900.png` | Legacy column options are displayed |
| Columns selected | `visual-evidence-assets/v2/current/greenfield-v2-candidates-database-columns-selected-1440x900.png` | Selected columns render in the table while menu remains open |

Acceptance rule for this family: covered desktop database behaviours must match the legacy candidate database appearance and interaction model unless an exception is documented in this file.


## Extended candidate detail behavior capture

Candidate detail was recaptured after adding legacy-style profile behaviours. These captures are canonical for the covered desktop detail behaviours; task launcher pages still require separate parity review.

| Behaviour | Screenshot | Covered interaction |
|---|---|---|
| Ready profile | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-legacy-ready-1440x900.png` | Breadcrumb, Back to job, stage selector, candidate count, profile card, action stack, hiring flow, tab strip, CV preview area |
| Stage selector | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-stage-selector-menu-1440x900.png` | Stage dropdown with workflow stages |
| More actions | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-more-actions-menu-1440x900.png` | Schedule interview, Create offer, Reject candidate, View activity, Add note |
| Activity tab | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-tab-activity-1440x900.png` | Activity tab switching |
| Interview score tab | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-tab-interview-score-1440x900.png` | Interview score tab switching |
| Forms/docs tab | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-tab-forms-docs-1440x900.png` | Forms/docs tab switching |
| Contracts tab | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-tab-contracts-1440x900.png` | Contracts tab switching |
| Comments tab | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-tab-comments-1440x900.png` | Comments tab switching |
| Emails tab | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-tab-emails-1440x900.png` | Emails tab switching |
| Upload CV | `visual-evidence-assets/v2/current/greenfield-v2-candidate-detail-upload-cv-success-1440x900.png` | Upload CV success state in the profile card |

Acceptance rule for this family: covered desktop detail behaviours must match the legacy candidate profile appearance and interaction model unless an exception is documented in this file.


## Extended candidate action launcher behavior capture

Candidate schedule, offer, and reject action launchers were recaptured after replacing scaffold-only task labels with legacy-style task composition. These captures are canonical for the covered desktop launcher behaviours.

| Behaviour | Screenshot | Covered interaction |
|---|---|---|
| Schedule ready | `visual-evidence-assets/v2/current/greenfield-v2-candidate-action-schedule-ready-1440x900.png` | Candidate context card, Back to candidate, interview detail form, readiness strip, footer actions |
| Schedule failure | `visual-evidence-assets/v2/current/greenfield-v2-candidate-action-schedule-failure-1440x900.png` | Failure/retry message without losing parent context |
| Schedule success/refresh | `visual-evidence-assets/v2/current/greenfield-v2-candidate-action-schedule-success-refresh-1440x900.png` | Parent refresh/return outcome |
| Offer ready | `visual-evidence-assets/v2/current/greenfield-v2-candidate-action-offer-ready-1440x900.png` | Candidate context card, offer detail form, contract readiness strip |
| Offer failure | `visual-evidence-assets/v2/current/greenfield-v2-candidate-action-offer-failure-1440x900.png` | Failure/retry message without inventing offer payload fields |
| Offer success/refresh | `visual-evidence-assets/v2/current/greenfield-v2-candidate-action-offer-success-refresh-1440x900.png` | Parent refresh/return outcome |
| Reject ready | `visual-evidence-assets/v2/current/greenfield-v2-candidate-action-reject-ready-1440x900.png` | Candidate context card, reject detail form, review/reason readiness strip |
| Reject failure | `visual-evidence-assets/v2/current/greenfield-v2-candidate-action-reject-failure-1440x900.png` | Failure/retry message without inventing reject catalog fields |
| Reject success/refresh | `visual-evidence-assets/v2/current/greenfield-v2-candidate-action-reject-success-refresh-1440x900.png` | Parent refresh/return outcome |

Acceptance rule for this family: covered desktop action launcher behaviours must preserve legacy candidate context, return affordances, form-panel composition, and failure/success recovery semantics unless an exception is documented in this file.

## Confirmed visual observations

- Legacy candidate database provides the usable composition reference: authenticated shell, candidate search, saved filter/list rail, bulk actions, configurable columns, and seeded candidate rows.
- Legacy candidate detail provides the usable composition reference: profile header, hiring flow, primary actions, action menu, CV/document tab region, notes area, and candidate sequence controls.
- Current greenfield candidate pages now render product-composition UI for the covered candidate database, detail hub, downstream panels, and task launcher states while preserving route/state ownership.
- Candidate database visuals use `/candidates-database` as the only canonical greenfield target; removed compatibility entries must not become standalone Figma screens.
- Candidate schedule/offer/reject launchers expose parent-return and success/failure state mechanics, but not the final modal/page composition or provider-specific operational copy.

## Accepted deviations in this pass

- Current greenfield V2 candidate screenshots are accepted only as behaviour-coverage evidence for the rows/states listed above; they are not final Figma-ready parity references.
- Legacy screenshots are accepted as visual composition references but do not define backend response schemas, exact table columns, provider payloads, document contents, survey answers, or custom-field schemas.
- Fixture-backed greenfield data remains an adapter seam. It is not production API evidence.

## Deferred visual debt

- Resolve side-by-side visual parity gaps for candidate database, candidate detail, and action launchers before using these screenshots as final Figma implementation references.
- Capture additional provider-blocked, denied, not-found, unavailable, stale, terminal/read-only, and mobile states before promoting those exact variants.
- Confirm final backend candidate aggregate, database row, advanced query, bulk mutation, ATS source, document, survey, custom-field, offer, reject, and scheduling payload contracts before designing field-specific UI.

## Side-by-side legacy parity review — 2026-04-21

Parity review evidence is stored separately from canonical current/legacy captures to avoid confusing review artifacts with implementation references:

| Area | Side-by-side evidence | Result | Blocking differences |
|---|---|---|---|
| Candidate database ready state | `visual-evidence-assets/v2/parity-review/candidate-database-ready-side-by-side-2900x970.png` | **Blocked** | Greenfield shell/sidebar width, menu typography, header spacing, search placement, table column widths, row density, status/header controls, saved filter/list positions, and row email/data values still differ from legacy. |
| Candidate database behaviours | Current behaviour screenshots in `visual-evidence-assets/v2/current/` plus legacy ready/menu reference | **Blocked** | Add new, saved filter/list menus, reset, sorting, and Add column now exist, but menu geometry/icons/spacing and selected-column/table behaviours are not yet proven identical to legacy. |
| Candidate detail ready state | `visual-evidence-assets/v2/parity-review/candidate-detail-ready-side-by-side-2900x970.png` | **Blocked** | Greenfield profile uses different candidate name/data, card geometry, action-stack placement, stage control, hiring-flow sizing, tab/CV proportions, notes placement, and lower-panel composition. |
| Candidate detail behaviours | Current tab/menu/upload screenshots plus legacy detail reference | **Blocked** | Stage selector, More actions, tabs, CV preview, and upload CV behaviours exist, but visual parity is not proven; current action labels/menu contents differ from legacy. |
| Parity-pass recapture | `visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/` | **Improved; still blocked** | Database density, selected-row bulk toolbar, detail legacy modal entries, route-owned action modal surfaces, and legacy-comparable Finn/Diego/API-seed data are now captured. Side-by-side review still found layout/modal gaps, so no gap is resolved yet. |
| Schedule launcher | `visual-evidence-assets/v2/legacy/legacy-v2-candidate-action-schedule-opened-seeded-1440x900.png` vs `visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/20-action-schedule-modal-route.png` | **Improved; still blocked** | Greenfield no longer uses a standalone task page for this state; it now renders a modal-like route-owned surface with Diego ApiSeed context. Exact legacy wizard layout, dark step header, two-column details, radio controls, sizing, copy, and footer behavior still differ. |
| Offer/reject launchers | `visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/21-action-offer-modal-route.png`, `visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/22-action-reject-modal-route.png` | **Improved; still blocked** | Offer/reject now use modal-like route-owned surfaces with Diego ApiSeed context, but reject still differs from the legacy two-step message/editor flow and offer still lacks final authenticated legacy comparison. |
| Email/review/move/score modals | `visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/12-detail-email-candidate-modal.png` through `new/15-detail-score-now-modal.png` | **Improved; still blocked** | Entry points now exist from candidate detail, but email is not the legacy full compose/editor surface and review/move/score still require exact field/header/footer parity. |

No visual deviations are accepted in this review. The current V2 candidate implementation is useful as functional behaviour coverage, but final screen design and implementation must continue from the legacy reference until these blockers are fixed or explicitly approved by product.

## Backend/API unknowns

- Candidate aggregate schema, database column schema, advanced query DSL, ATS duplicate/import payloads, CV/document body schemas, offer payloads, reject reason catalogs, survey answer schemas, custom-field payloads, and collaboration/message payloads remain non-inventable.
- Current screenshots may show placeholder ids/titles/counts. Figma must label those as examples unless a backend contract confirms them.

## Figma readiness decision

| Area | Decision | Reason |
|---|---|---|
| Candidate database | Parity-blocked | Current greenfield recapture shows behaviour coverage, but side-by-side review found visual/data/layout mismatches against legacy. |
| Candidate detail hub | Parity-blocked | Current greenfield recapture shows behaviour coverage, but side-by-side review found layout, data, stage, action, and CV/tab composition mismatches against legacy. |
| Candidate action launchers | Parity-blocked | Current greenfield recapture now shows route-owned modal surfaces, but exact side-by-side legacy modal parity and legacy offer/reject references still need review. |
V2 candidate rows covered by the recaptured current greenfield screenshots must **not** proceed to final Figma-ready implementation as pixel/behaviour parity references yet. They remain behaviour-coverage evidence only until the parity blockers below are resolved or explicitly accepted in a later change. Legacy captures remain the canonical visual reference, and backend/schema/provider details not visible in current evidence stay deferred.


## Parity correction

The side-by-side review above confirms that the current V2 candidate screens are **not yet identical** to legacy. Do not treat these rows as final Figma-ready or pixel/behaviour-complete until the listed blockers are resolved or explicitly accepted.
