# V2 Candidates Visual Gap Register — 2026-04-22

## Purpose

This register converts the deep capture evidence into actionable visual/product-composition gaps between the legacy candidate experience and the greenfield `recruit-frontend` implementation.

It is intentionally conservative:

- it does **not** claim visual parity;
- it does **not** promote V2 candidate rows to `Figma-ready`;
- it separates confirmed screenshot evidence from inference;
- it avoids destructive workflow submissions and backend-contract assumptions.

## Evidence baseline

| Evidence package | Path |
|---|---|
| Deep capture log | `docs/visual-evidence-v2-candidates-deep-capture-2026-04-22.md` |
| Deep capture assets | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/` |
| Legacy supplement | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/` |
| Automation records | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/capture-records.json` |
| Supplement records | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/supplement-records.json` |

## Status summary

| Area | Current decision | Reason |
|---|---|---|
| Candidate database | Parity-blocked | Layout, density, data, filters/lists, bulk action, and table behavior still differ. |
| Candidate detail | Parity-blocked | Legacy job-context composition, candidate actions, tabs, and side-panel proportions still differ. |
| Candidate action flows | Parity-blocked | Legacy uses modal workflows for key actions; greenfield currently uses route/page task flows for several actions. |
| Figma readiness | Blocked for V2 final parity | Evidence is useful for gap work, not for final parity signoff. |

## Gap register

### Database shell and global layout

| ID | Gap | Legacy evidence | Greenfield evidence | Difference | Required action | Priority |
|---|---|---|---|---|---|---|
| V2-GAP-001 | Sidebar width/state and content density | `legacy/01-database-ready-viewport.png` | `new/01-database-ready-viewport.png` | Legacy content starts after a narrower left nav and uses a compact sidebar rhythm; greenfield still shows larger nav spacing/width and different item geometry. | Align default shell width, nav item height, icon/text spacing, active state, and top logo/header offset to the legacy database baseline or document an accepted design deviation. | High |
| V2-GAP-002 | Page header subtitle/copy | `legacy/01-database-ready-viewport.png` | `new/01-database-ready-viewport.png` | Legacy subtitle reads like search guidance (`Search by name, email, city or job`); greenfield uses implementation-style copy (`candidate database with search functionality`). | Replace greenfield page subtitle with legacy/product copy or confirm new copy with product. | High |
| V2-GAP-003 | Topbar notification/account visual model | `legacy/03-top-notification-menu-from-database.png` | `new/03-top-notification-menu-from-database.png`, `new/04-user-account-menu-from-database.png` | Legacy notification dropdown/account behaviors and icon placement differ from greenfield topbar/page-entry behavior. | Capture and implement topbar dropdown behavior consistently; do not route to notifications when legacy opens a dropdown unless product accepts this change. | Medium |

### Candidate database controls

| ID | Gap | Legacy evidence | Greenfield evidence | Difference | Required action | Priority |
|---|---|---|---|---|---|---|
| V2-GAP-004 | Add new menu geometry and icons | `legacy/05-add-new-menu-opened.png` | `new/05-add-new-menu-opened.png` | Legacy menu is compact and anchored under the green Add new button with filter/list rows; greenfield menu is larger, lower, and uses different typography/icon spacing. | Match menu anchor, width, row height, typography, icons, divider placement, and shadow to legacy. | High |
| V2-GAP-005 | Saved filters section | `legacy/06-saved-filters-section-or-menu.png` | `new/06-saved-filters-section-or-menu.png` | Legacy uses lowercase `saved filters`, compact row spacing, and existing saved entries (`LIST KAUE`, `FILTER KAUE`); greenfield uses larger title treatment and different sample data (`All candidates`). | Align title casing/weight, collapse affordance, row spacing, kebab placement, and data setup for comparable saved filter/list examples. | High |
| V2-GAP-006 | Saved lists section | `legacy/07-saved-lists-section-or-menu.png` | `new/07-saved-lists-section-or-menu.png` | Legacy saved lists and filters show specific saved items/count chips; greenfield shows `only me` and `everyone` with different casing/spacing. | Seed or map equivalent saved list data and align visual presentation. | Medium |
| V2-GAP-007 | Add column menu/state | `legacy/08-add-column-menu-opened.png` | `new/08-add-column-menu-opened.png` | Both expose Add column, but menu option geometry, icon treatment, and selected-column behavior are not proven identical. | Capture full Add column open state side-by-side and align menu item dimensions, checkbox/selected state, and available column list. | Medium |
| V2-GAP-008 | Bulk Actions enablement | `legacy/09-bulk-actions-initial-state.png`, `legacy/10-database-first-row-selected.png`, `legacy/11-bulk-actions-after-first-row-selected.png` | `new/10-database-first-row-selected.png` | Legacy allows row selection and has a Bulk Actions control; greenfield capture shows Bulk Actions disabled even after attempted selection. | Fix or seed greenfield row-selection state so Bulk Actions enables; then capture enabled menu contents. | High |
| V2-GAP-009 | Search no-match/reset behavior | `legacy/12-database-search-filtered-no-match.png`, `legacy/13-reset-or-clear-filters-after-search.png` | No stable greenfield no-match/reset capture in this pass | Legacy filtered/no-match and reset controls were captured; greenfield locator timed out and the state is not proven. | Add stable route/query/test hook for no-match and reset states, then capture greenfield equivalent. | High |
| V2-GAP-010 | Table row density and vertical rhythm | `legacy/01-database-ready-viewport.png` | `new/01-database-ready-viewport.png` | Legacy table is denser and shows more rows in the viewport; greenfield has taller rows and larger spacing. | Adjust table row height, cell padding, checkbox alignment, and action-button dimensions. | High |
| V2-GAP-011 | Table data parity | `legacy/01-database-ready-viewport.png` | `new/01-database-ready-viewport.png` | Legacy emails include full API seed/job suffixes; greenfield fixture emails are shortened. Legacy captures more candidates/page. | Use comparable seeded data or mark data mismatch as expected; do not use unmatched data for visual parity signoff. | High |
| V2-GAP-012 | Table columns and sorting | `legacy/01-database-ready-viewport.png` | `new/01-database-ready-viewport.png`, `new/14-table-sort-interaction.png` | Legacy visible columns in this capture are Full name, Email, Location plus action; greenfield includes Hiring flow stage and sort indicators differently. | Confirm target column set for parity. If legacy is source, hide/reorder stage for this state; if product wants stage, record accepted deviation. | High |
| V2-GAP-013 | First-row open action parity | Legacy table open action not captured reliably in automation | `new/15-first-row-open-candidate-action.png` | Greenfield has explicit route link; legacy table action exists visually but table-action navigation still needs exact capture. | Capture legacy table open action with exact selector or manual assistance, then compare route/context preservation. | Medium |

### Candidate detail hub composition

| ID | Gap | Legacy evidence | Greenfield evidence | Difference | Required action | Priority |
|---|---|---|---|---|---|---|
| V2-GAP-014 | Job-context breadcrumb/header | `legacy/20-candidate-detail-ready-viewport.png` | `new/20-candidate-detail-ready-viewport.png` | Legacy detail is explicitly job-contextual (`My jobs > Live jobs > job name`) with `Back to job`; greenfield uses database-oriented context and `Back to database`. | Support and capture both job-origin and database-origin contexts. For parity against this legacy evidence, use job-origin route/context. | High |
| V2-GAP-015 | Candidate identity/data mismatch | `legacy/20-candidate-detail-ready-viewport.png` | `new/20-candidate-detail-ready-viewport.png` | Legacy candidate is Diego ApiSeed with API-seed contact data; greenfield candidate is Riley Candidate with fixture data. | Align seed data or record data mismatch as non-parity evidence. Pixel/composition parity cannot be signed off with different candidate payloads. | High |
| V2-GAP-016 | Candidate side card layout | `legacy/20-candidate-detail-ready-viewport.png` | `new/20-candidate-detail-ready-viewport.png` | Legacy side card has CV received/source, first-time applicant badge, score, contact fields, tags, notes, and utility links; greenfield side card uses different summary/status rows and capability/debug-like metadata. | Rework side card structure to match legacy hierarchy, spacing, badges, and visible fields; remove implementation/debug copy from parity surface. | High |
| V2-GAP-017 | Stage/hiring-flow control | `legacy-supplement/50-legacy-candidate-detail-stage-selector-closed-and-options-source.png`, `legacy-supplement/stage-options.json` | `new/21-candidate-detail-stage-selector-opened.png` | Legacy uses native select at top-right plus timeline; greenfield uses custom dropdown with different placement and styling. | Match top-right stage selector size/placement/options, or document a product-approved replacement. Avoid mutating real stage during capture. | High |
| V2-GAP-018 | Hiring-flow timeline geometry | `legacy/20-candidate-detail-ready-viewport.png` | `new/20-candidate-detail-ready-viewport.png` | Legacy timeline is compact and aligned above tabs; greenfield timeline has different spacing, dot size, labels, and selected-state styling. | Align timeline labels, spacing, selected/completed dot states, and relationship to top controls. | High |
| V2-GAP-019 | Candidate sequence controls | `legacy/20-candidate-detail-ready-viewport.png` | `new/20-candidate-detail-ready-viewport.png` | Legacy shows `Candidate 1 of 1/2` sequence control and next/previous where applicable; greenfield shows a green candidate count badge with different behavior. | Implement/capture sequence controls matching legacy for job-context candidate navigation. | Medium |
| V2-GAP-020 | Tabs model and labels | `legacy-supplement/51-*`, `52-*`, `53-*`, `54-*` | `new/24-*` through `new/32-*` | Legacy tabs include `Interview score`, `Forms & docs`, `Comments 1`, `Emails`; greenfield uses split tabs such as `Forms`, `Documents`, `Surveys`, `Feedback`. | Decide whether parity requires legacy tab grouping. If yes, consolidate labels and counts; if no, record approved product divergence. | High |
| V2-GAP-021 | CV preview composition | `legacy/24-candidate-detail-latest-cv-tab.png` | `new/24-candidate-detail-latest-cv-tab.png` | Legacy has CV/Cover note toggles, reload/download controls, upload new CV, and preview frame. Greenfield shows a simplified no-preview region and separate summary panels. | Match CV tab controls and preview proportions; preserve no-preview state only when legacy would also show it for same data. | High |
| V2-GAP-022 | Forms/docs content model | `legacy-supplement/51-legacy-candidate-detail-forms-docs-tab-exact.png` | `new/27-candidate-detail-documents-tab.png`, `new/28-candidate-detail-forms-tab.png` | Legacy combines forms and documents in one tab; greenfield separates panels/tabs and may expose different empty/state content. | Match combined `Forms & docs` tab or record split-tab deviation; seed candidate with equivalent forms/docs evidence. | Medium |
| V2-GAP-023 | Comments and emails content | `legacy-supplement/53-*`, `54-*` | `new/26-candidate-detail-comments-tab.png`, `new/43-candidate-detail-email-message-action-opened.png` | Legacy has Comments count and Emails tab; greenfield separates communication route/action and different tab/content treatment. | Align comment count, composer/history layout, email history, and compose behavior to legacy. | Medium |

### Candidate action flows

| ID | Gap | Legacy evidence | Greenfield evidence | Difference | Required action | Priority |
|---|---|---|---|---|---|---|
| V2-GAP-024 | Schedule/interview flow composition | `legacy-supplement/57-legacy-candidate-detail-more-actions-interview-scheduler-opened.png` | `new/40-candidate-detail-schedule-action-opened.png` | Legacy opens a centered 4-step modal overlay over candidate detail. Greenfield capture remains on candidate detail or uses route/page task model, not the same modal composition. | Implement/capture schedule as modal overlay if parity is required; otherwise record approved route-based redesign. | High |
| V2-GAP-025 | Reject flow composition | `legacy-supplement/55-legacy-candidate-detail-reject-modal-opened.png` | `new/42-candidate-detail-reject-action-opened.png` | Legacy opens a two-step modal with message/template editor and reject buttons. Greenfield uses a full routed page with backend-owned reason/internal note placeholders. | Match modal structure, steps, editor controls, and buttons, or record approved route-based redesign. | High |
| V2-GAP-026 | Email candidate composition | `legacy-supplement/56-legacy-candidate-detail-more-actions-email-candidate-opened.png` | `new/43-candidate-detail-email-message-action-opened.png` | Legacy opens compose modal from More actions; greenfield action appears different and may route to inbox/conversation behavior. | Capture/implement compose modal parity or define explicit messaging redesign. | High |
| V2-GAP-027 | Send to hiring manager/review request | `legacy-supplement/58-legacy-candidate-detail-more-actions-send-to-hiring-manager-opened.png` | No direct greenfield equivalent capture | Legacy has a More actions review request modal. Greenfield equivalent is not captured/proven from this context. | Add/capture review request action from candidate detail with matching modal/state. | Medium |
| V2-GAP-028 | Move to different job | `legacy-supplement/59-legacy-candidate-detail-more-actions-move-job-opened.png` | No direct greenfield equivalent capture | Legacy exposes a move-job modal/action. Greenfield equivalent is not captured/proven. | Implement/capture move-job action or document deferred scope. | Medium |
| V2-GAP-029 | Upload new CV | `legacy-supplement/60-legacy-candidate-detail-upload-new-cv-visible-control.png` | `new/45-candidate-detail-upload-cv-action-opened.png` | Legacy upload control is embedded near CV controls; greenfield has different side-card/action feedback layout. | Align upload trigger placement and modal/file-control behavior; capture selected-file/error/success states with safe dummy file if needed. | Medium |
| V2-GAP-030 | Score now/interview feedback | `legacy-supplement/61-legacy-candidate-detail-score-now-modal-opened.png` | `new/32-candidate-detail-feedback-tab.png` | Legacy has score-now modal from Interview score tab. Greenfield feedback tab does not prove same modal/action flow. | Capture/implement score-now and request-score action states. | Medium |

### Data and backend readiness gaps

| ID | Gap | Evidence | Difference | Required action | Priority |
|---|---|---|---|---|---|
| V2-GAP-031 | Comparable seed data | All database/detail captures | Legacy and greenfield use different candidate identities, emails, job context, candidate counts, saved filter/list entries, and possibly permissions. | Generate aligned local data or create an explicit fixture mapping for visual capture only. | High |
| V2-GAP-032 | Non-destructive action boundaries | Action captures | Several parity states require opening modals but not submitting changes; stage/status transitions and sends are destructive. | Define safe capture data and dry-run/test hooks for stage change, reject, schedule, offer/hire, email, review request, upload, and move-job states. | High |
| V2-GAP-033 | Missing state coverage | Deep capture log | Denied, unavailable, stale, provider-blocked, validation-error, submit-failure, terminal/read-only, and mobile states are not fully captured. | Add state fixtures or route query hooks for visual capture; do not infer these from ready-state screenshots. | Medium |

## Recommended execution order

1. **Align seed/context first**: use the same candidate/job context in both systems, or explicitly mark mismatched data as non-parity evidence.
2. **Fix database high-priority gaps**: shell width, subtitle copy, row density, table data/columns, Bulk Actions enablement, search/reset state.
3. **Fix detail hub high-priority gaps**: job-context route, side card composition, stage selector, timeline, tab labels/grouping, CV preview controls.
4. **Decide modal vs route actions**: schedule, reject, email, review, move, upload, score-now need a product decision because legacy is modal-heavy while greenfield is route/page-heavy.
5. **Recapture side-by-side** after each cluster, not after all changes, so regressions are easy to isolate.

## Current final decision

V2 candidate screens remain **parity-blocked**.

The evidence package is now sufficient to start targeted implementation work, but it is not sufficient to sign off visual parity or final Figma readiness.

## Product parity decision — 2026-04-22

Product direction: **all V2 Candidates surfaces must preserve legacy parity**.

Implications:
- No listed V2 candidate visual or behaviour deviation is accepted by default.
- Database, detail, panels, and action flows must match the authenticated legacy reference in layout, density, copy, menu/modal behaviour, and interaction model before promotion.
- The legacy modal model for schedule, reject, email, review request, move job, upload CV, and score-now remains the target unless a future product decision explicitly names and accepts a specific divergence.
- Greenfield route ownership may stay canonical internally, but the rendered user experience must match legacy composition where the legacy flow is the reference.
- Future recapture may mark a gap `Resolved` only with side-by-side evidence, or `Accepted` only with an explicit product-approved exception.

## Recapture status update — 2026-04-22 detail cluster

Evidence package: `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/`
Recapture log: `docs/visual-evidence-v2-candidates-recapture-2026-04-22-detail.md`

Legacy recapture was blocked by authentication (`docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/legacy/00-legacy-auth-required.png`), so these markings compare new greenfield recapture screenshots against the existing legacy baseline screenshots from `deep-capture-2026-04-22`. These markings do not declare parity and do not mark V2 as Figma-ready.

| ID | Recapture marking | Screenshot-specific basis |
|---|---|---|
| V2-GAP-014 | Improved; still blocked | Greenfield job-context header/back target is visible in `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/20-candidate-detail-ready-viewport-job-context.png`; authenticated legacy recapture was blocked by `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/legacy/00-legacy-auth-required.png`. |
| V2-GAP-015 | Still blocked | Greenfield candidate remains `Riley Candidate` in `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/20-candidate-detail-ready-viewport-job-context.png`; legacy baseline candidate remains different in `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/20-candidate-detail-ready-viewport.png`. |
| V2-GAP-016 | Improved; still blocked | Side-card hierarchy was improved in `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/20-candidate-detail-ready-viewport-job-context.png`, but exact parity remains blocked by data/context mismatch. |
| V2-GAP-017 | Improved; still blocked | Native stage selector/options are captured via `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/20-candidate-detail-ready-viewport-job-context.png` and `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/stage-options.json`; open native dropdown evidence remains blocked. |
| V2-GAP-018 | Improved; still blocked | Timeline geometry is closer in `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/20-candidate-detail-ready-viewport-job-context.png`; authenticated side-by-side legacy recapture is still required before parity claims. |
| V2-GAP-019 | Improved; still blocked | Greenfield sequence control appears in `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/20-candidate-detail-ready-viewport-job-context.png`, but count/context differs from `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/20-candidate-detail-ready-viewport.png`. |
| V2-GAP-020 | Improved | Greenfield tabs show legacy grouping in `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/20-candidate-detail-ready-viewport-job-context.png` and tab captures `new/51-*`, `new/52-*`, `new/53-*`, `new/54-*`. |
| V2-GAP-021 | Improved; still blocked | CV controls and preview frame are improved in `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/24-candidate-detail-latest-cv-tab.png`; exact preview/data parity remains blocked against `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/24-candidate-detail-latest-cv-tab.png`. |

## Implementation validation update — 2026-04-22 database/API handoff

Confirmed fixes after the database/detail API pass:

- Candidate database rows are no longer sourced from fixed in-component fixture rows. The greenfield database page fetches `/v2/cv` through the REST API adapter and maps API UUIDs, numeric CV ids, job ids, hiring-flow step ids, names, emails, locations, source, score, and action-readiness flags into table rows.
- Database search now preserves the route-owned `query` state and sends it to the backend through the API adapter's `search` parameter.
- Database-to-detail links now use the API candidate UUID plus job/step context segments and preserve `entry=database` with a sanitized `/candidates-database` return target.
- Candidate detail now attempts an API-backed candidate aggregate fetch for database-origin, UUID, and numeric candidate entries. The fetched API candidate is cached into the candidate store to avoid fallback fixture data and unstable `useSyncExternalStore` snapshots.
- Removed database compatibility entries are no longer registered in router metadata, route contracts, HTTP smoke routes, or active visual evidence aliases. `/candidates-database` is the only greenfield database route.

Validation run:

- `npm test -- src/domains/candidates/support/adapter-seams.test.ts src/domains/candidates/detail-hub/candidate-detail-api.test.ts src/domains/candidates/support/candidate-database-routing.test.ts src/lib/routing/route-metadata.test.ts`
- `npm run build`

Remaining V2 blockers after this update:

- Greenfield visual recapture is now recorded for the database search/detail-handoff/return states after the API-backed data changes, including a status/stage-column validation pass: `docs/visual-evidence-v2-candidates-recapture-2026-04-22-database-detail-api.md`.
- Legacy authenticated recapture remains required before any V2 Candidate row can move to `Figma-ready`.
- High-priority visual parity gaps remain open for row density, saved filters/lists, bulk actions, detail side card geometry, hiring-flow timeline, and modal-vs-route action flow composition.

## Implementation update — 2026-04-22 action modal parity start

Confirmed change:
- Candidate schedule/offer/reject task routes now keep canonical deep-link route ownership but render as a centered modal surface over a dimmed candidate-profile background.
- Schedule now exposes a four-step interview scheduler stepper to match the legacy modal workflow direction.
- Action task candidate context no longer exposes implementation/debug metadata in the visible UI; test ids remain available through visually hidden state for route/telemetry validation.
- Candidate database saved filters and saved lists now use comparable `LIST KAUE` / `FILTER KAUE` entries, preserve route-owned state test coverage, and expose the default Bulk Actions control through a stable test id.
- Candidate database row density and sidebar spacing were compacted toward the legacy layout.
- Candidate detail now exposes legacy-style modal entry points for Email candidate, Send to hiring manager, Move job, and Score now. These are composition/parity starters only; they do not claim backend mutation parity.
- A second action-composition pass moved schedule closer to the legacy wizard with dark header, job detail column, first-step interview fields, and radio groups; moved reject closer to the legacy two-step template/message editor; and moved email closer to the legacy template/editor/attachment surface.
- The R0 Playwright smoke harness now seeds the current `recruit.localAuthSession` contract and mocks candidate `/v2/cv` + GraphQL reads for deterministic database/detail handoff validation.

Validation run:
- `npm test -- src/domains/candidates/action-launchers/candidate-action-context.test.ts src/domains/candidates/support/routing.test.ts src/domains/candidates/support/product-depth.test.ts`
- `npm test -- src/domains/candidates/action-launchers/candidate-action-context.test.ts src/domains/candidates/support/routing.test.ts src/domains/candidates/support/product-depth.test.ts src/domains/candidates/support/candidate-database-routing.test.ts src/domains/candidates/detail-hub/candidate-detail-api.test.ts`
- `npm test`
- `npm run build`
- `npm run smoke:r0:ui -- --grep "candidate"`
- `npm run smoke:r0:ui`

Gap impact:
- V2-GAP-004 through V2-GAP-012, V2-GAP-016, V2-GAP-020, V2-GAP-024 through V2-GAP-030 are **improved but not closed**.
- They still require side-by-side visual recapture against authenticated legacy references before any item can be marked resolved.
- `npm run smoke:r0:ui` is now green for the route/state smoke suite (28 tests), but smoke success is not visual parity signoff.

## Recapture status update — 2026-04-22 parity pass

Evidence package: `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/`
Recapture log: `docs/visual-evidence-v2-candidates-recapture-2026-04-22-parity-pass.md`
Capture script: `scripts/capture-v2-parity-recapture.mjs`

This recapture records current greenfield evidence after the first explicit parity pass. It does not include fresh authenticated legacy screenshots, so no gap is marked resolved from this section alone.

The recapture harness was tightened after the first run so the covered current-app screenshots now use legacy-comparable data:
- database rows are API-seed-style candidates including Finn, Eva, Diego, Cara, Ben, and Ava ApiSeed;
- the main detail ready state uses Finn ApiSeed to match the main legacy detail reference;
- More actions and route-owned schedule/offer/reject action states use Diego ApiSeed to match the legacy supplement action references.

| ID | Recapture marking | Screenshot-specific basis |
|---|---|---|
| V2-GAP-004 | Improved; still blocked | Add new menu captured in `new/02-database-add-new-menu-density-pass.png`; exact legacy menu spacing/icon parity still needs side-by-side review. |
| V2-GAP-005 | Improved; still blocked | Saved filter entries and kebab menu captured in `new/03-database-saved-filter-menu-density-pass.png`; legacy title casing/geometry review still required. |
| V2-GAP-006 | Improved; still blocked | Saved list entries and kebab menu captured in `new/04-database-saved-list-menu-density-pass.png`; legacy spacing/position review still required. |
| V2-GAP-008 | Improved; still blocked | Selected-row bulk toolbar captured in `new/05-database-row-selected-bulk-enabled.png`; legacy bulk menu contents and geometry still need comparison. |
| V2-GAP-010 | Improved; still blocked | Database ready density pass captured in `new/01-database-ready-density-pass.png`; API-seed rows are now comparable, but table density/geometry still differs from legacy. |
| V2-GAP-015 | Partially improved; still blocked | Covered ready/action captures now use Finn/Diego ApiSeed-style data, but there is still no same-run authenticated legacy recapture and full state/data coverage is incomplete. |
| V2-GAP-016 | Improved; still blocked | Detail ready state captured in `new/10-detail-ready-after-parity-pass.png`; side-card geometry, wrapping, and proportions still differ from legacy. |
| V2-GAP-026 | Improved; still blocked | Email modal captured in `new/12-detail-email-candidate-modal.png`; template/editor/attachment composition now exists, but exact legacy composer parity still requires comparison. |
| V2-GAP-027 | Improved; still blocked | Send to hiring manager modal captured in `new/13-detail-send-to-hiring-manager-modal.png`; backend mutation and exact field parity remain deferred. |
| V2-GAP-028 | Improved; still blocked | Move job modal captured in `new/14-detail-move-job-modal.png`; exact legacy search/list behaviour remains deferred. |
| V2-GAP-030 | Improved; still blocked | Score now modal captured in `new/15-detail-score-now-modal.png`; exact scoring form parity remains deferred. |
| V2-GAP-024 | Improved; still blocked | Schedule route now renders as a modal wizard in `new/20-action-schedule-modal-route.png`; dark header, job details, interview fields, and radio groups are closer to legacy, but exact wizard dimensions/step/footer parity remain open. |
| V2-GAP-025 | Improved; still blocked | Reject route now renders as a two-step message/editor modal in `new/22-action-reject-modal-route.png`; exact legacy editor controls, chip layout, and reject footer actions remain open. |

Important correction to prior wording: the current action launcher recapture is no longer a standalone task-page composition for schedule/offer/reject. The implementation now preserves canonical route ownership internally while rendering a modal-like user experience. V2 remains blocked because exact legacy modal parity is not yet proven.

## Side-by-side review update — 2026-04-22 parity pass

Manual side-by-side review was performed against the existing legacy references in `deep-capture-2026-04-22/legacy/` and `deep-capture-2026-04-22/legacy-supplement/`.

No gap is marked resolved yet. The recapture closes part of the **evidence-quality** problem by aligning data, but it does not close visual parity.

| Gap cluster | Review result | Remaining blocker |
|---|---|---|
| V2-GAP-004 to V2-GAP-008 | Improved; still blocked | Add new, saved list/filter, and bulk toolbar states exist with comparable data, but menu offsets, icon treatment, row heights, toolbar copy/spacing, and selected-state geometry still differ from legacy. |
| V2-GAP-010 to V2-GAP-012 | Improved; still blocked | API-seed rows now appear, but table width, row density, column sizing, pagination placement, and stage/status column decisions still do not match the legacy database baseline. |
| V2-GAP-014 to V2-GAP-021 | Improved; still blocked | Job-context detail and Finn ApiSeed data are closer, but profile-card width, email wrapping, stage selector placement, hiring-flow dot/line geometry, tabs, CV preview proportions, and notes/action area placement still differ. |
| V2-GAP-024 | Improved; still blocked | Schedule now matches more of the wizard structure, but exact modal dimensions, stepper/header placement, job metadata, copy, and footer mechanics still differ from legacy. |
| V2-GAP-025 | Improved; still blocked | Reject now includes the two-step message/editor flow, but exact modal width/position, editor toolbar, chip layout, and reject-with/without-message footer actions still differ. |
| V2-GAP-026 | Improved; still blocked | Email now uses a template/editor/attachment modal surface, but legacy evidence still differs in context, toolbar details, footer actions, draft/send behavior, and exact sizing. |
| V2-GAP-027 to V2-GAP-030 | Improved; still blocked | Review request, move job, and score-now entry points now exist, but exact field layout, candidate chip/header treatment, footer actions, search/list behavior, and score form contents still need legacy parity. |
| V2-GAP-031 | Partially improved; still blocked | Covered recapture states now use Finn/Diego/API-seed-style data, but final parity still needs same-run authenticated legacy/current capture and broader state coverage. |
