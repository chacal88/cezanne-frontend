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
