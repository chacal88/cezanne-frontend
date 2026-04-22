# Visual Evidence V2 Candidates Deep Capture — 2026-04-22

## Purpose

This evidence log replaces ad-hoc candidate screenshots with a traceable deep-capture pass for the V2 candidate database and candidate detail surfaces.

It intentionally does **not** mark V2 as parity-complete or Figma-ready. The goal is to record what was actually navigated, what was captured, and which interactions still require follow-up evidence or product/data setup.

## Capture setup

| Field | Value |
|---|---|
| Date | 2026-04-22 |
| Viewport | 1440 × 900 desktop |
| Legacy system | `http://localhost:4000` |
| Greenfield system | `http://localhost:5173` |
| Evidence root | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/` |
| Credential handling | Credentials were used only for browser login and are not recorded in screenshots, JSON summaries, or this document. |
| Automation records | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/capture-records.json` |
| Control inventories | `legacy-database-controls.json`, `legacy-detail-controls.json`, `new-database-controls.json`, `new-detail-controls.json` |

## Scope navigated

### Candidate database

The pass navigated the candidate database route in both systems and attempted every visible non-destructive interaction available from the database viewport:

- shell/sidebar toggle state
- top notification entry/menu
- account menu when accessible
- Add new menu
- saved filters section/menu
- saved lists section/menu
- Add column / column configuration
- Bulk Actions initial state
- row selection
- Bulk Actions after row selection
- search / filtered no-match state
- reset / clear filters
- table sort
- first-row candidate open action

### Candidate detail

The pass opened a candidate detail route in both systems and attempted every visible non-destructive interaction available from the detail viewport:

- candidate detail ready state
- stage selector / hiring-flow selector
- More actions menu
- Latest CV tab
- Activity tab
- Comments tab
- Documents / Forms & docs tab
- Forms tab when separate in the greenfield implementation
- Contracts tab
- Surveys tab when separate in the greenfield implementation
- Custom fields tab when available
- Feedback / Interview score tab
- schedule action
- offer / hire action
- reject action
- email/message action
- tag action
- upload CV action

## Captured evidence summary

| System | Captured screenshots | Failed or blocked attempts | Notes |
|---|---:|---:|---|
| Legacy | 18 | 15 | Legacy captures cover the database controls and core candidate detail tabs/actions that were accessible. Several legacy controls resolved in DOM but timed out or mapped to ambiguous text from unrelated sidebar/menu entries. |
| Greenfield | 27 | 6 | Greenfield captures cover most database and detail controls. Some controls are disabled or missing separate tabs/actions in the current implementation. |

## Candidate database evidence

### Legacy database captures

| Interaction | Evidence |
|---|---|
| Ready viewport | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/01-database-ready-viewport.png` |
| Shell/sidebar toggle state | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/02-shell-sidebar-toggle-state-on-database.png` |
| Top notification menu | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/03-top-notification-menu-from-database.png` |
| Add new menu | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/05-add-new-menu-opened.png` |
| Saved filters section/menu | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/06-saved-filters-section-or-menu.png` |
| Saved lists section/menu | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/07-saved-lists-section-or-menu.png` |
| Add column menu | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/08-add-column-menu-opened.png` |
| Bulk Actions initial state | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/09-bulk-actions-initial-state.png` |
| First row selected | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/10-database-first-row-selected.png` |
| Bulk Actions after first row selected | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/11-bulk-actions-after-first-row-selected.png` |
| Search filtered / no-match attempt | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/12-database-search-filtered-no-match.png` |
| Reset / clear filters after search | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/13-reset-or-clear-filters-after-search.png` |

### Greenfield database captures

| Interaction | Evidence |
|---|---|
| Ready viewport | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/01-database-ready-viewport.png` |
| Shell/sidebar toggle state | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/02-shell-sidebar-toggle-state-on-database.png` |
| Top notification entry | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/03-top-notification-menu-from-database.png` |
| User account menu | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/04-user-account-menu-from-database.png` |
| Add new menu | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/05-add-new-menu-opened.png` |
| Saved filters section/menu | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/06-saved-filters-section-or-menu.png` |
| Saved lists section/menu | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/07-saved-lists-section-or-menu.png` |
| Add column menu | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/08-add-column-menu-opened.png` |
| First row selected | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/10-database-first-row-selected.png` |
| Table sort interaction | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/14-table-sort-interaction.png` |
| First-row candidate open action | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/15-first-row-open-candidate-action.png` |

## Candidate detail evidence

### Legacy detail captures

| Interaction | Evidence |
|---|---|
| Ready viewport | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/20-candidate-detail-ready-viewport.png` |
| More actions menu | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/22-candidate-detail-more-actions-opened.png` |
| Latest CV tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/24-candidate-detail-latest-cv-tab.png` |
| Activity tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/25-candidate-detail-activity-tab.png` |
| Contracts tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/29-candidate-detail-contracts-tab.png` |
| Tag action | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/44-candidate-detail-tag-action-opened.png` |

### Greenfield detail captures

| Interaction | Evidence |
|---|---|
| Ready viewport | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/20-candidate-detail-ready-viewport.png` |
| Stage selector | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/21-candidate-detail-stage-selector-opened.png` |
| More actions menu | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/22-candidate-detail-more-actions-opened.png` |
| Latest CV tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/24-candidate-detail-latest-cv-tab.png` |
| Activity tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/25-candidate-detail-activity-tab.png` |
| Comments tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/26-candidate-detail-comments-tab.png` |
| Documents tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/27-candidate-detail-documents-tab.png` |
| Forms tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/28-candidate-detail-forms-tab.png` |
| Contracts tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/29-candidate-detail-contracts-tab.png` |
| Surveys tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/30-candidate-detail-surveys-tab.png` |
| Feedback tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/32-candidate-detail-feedback-tab.png` |
| Schedule action | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/40-candidate-detail-schedule-action-opened.png` |
| Offer / hire action | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/41-candidate-detail-offer-action-opened.png` |
| Reject action | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/42-candidate-detail-reject-action-opened.png` |
| Email/message action | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/43-candidate-detail-email-message-action-opened.png` |
| Upload CV action | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/new/45-candidate-detail-upload-cv-action-opened.png` |


## Legacy supplementary capture — 2026-04-22

After inspecting the legacy candidate detail DOM, a second non-destructive pass used exact `ng-click` and hash-tab selectors for the previously ambiguous legacy controls. This reduces, but does not eliminate, the V2 evidence gap. Stage transition was not mutated; the pass records the closed native selector plus its option inventory instead.

| Interaction | Evidence | Notes |
|---|---|---|
| Stage selector closed state and option source | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/50-legacy-candidate-detail-stage-selector-closed-and-options-source.png`; `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/stage-options.json` | Dropdown-open state not captured because native select UI is not reliable in headless capture; changing stage would be a real mutation. |
| Forms & docs tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/51-legacy-candidate-detail-forms-docs-tab-exact.png` | Exact `#forms-documents` tab. |
| Interview score tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/52-legacy-candidate-detail-interview-score-tab-exact.png` | Exact `#interviews` tab. |
| Comments tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/53-legacy-candidate-detail-comments-tab-exact.png` | Exact `#comments` tab. |
| Emails tab | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/54-legacy-candidate-detail-emails-tab-exact.png` | Exact `#messages` tab. |
| Reject modal | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/55-legacy-candidate-detail-reject-modal-opened.png` | Modal opened only; no submission. |
| Email candidate action | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/56-legacy-candidate-detail-more-actions-email-candidate-opened.png` | Opened from More actions; no message submitted. |
| Interview scheduler action | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/57-legacy-candidate-detail-more-actions-interview-scheduler-opened.png` | Opened from More actions; no schedule submitted. |
| Send to hiring manager action | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/58-legacy-candidate-detail-more-actions-send-to-hiring-manager-opened.png` | Opened from More actions; no request submitted. |
| Move to different job action | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/59-legacy-candidate-detail-more-actions-move-job-opened.png` | Opened from More actions; no move submitted. |
| Upload new CV visible control | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/60-legacy-candidate-detail-upload-new-cv-visible-control.png` | Control visibility captured; no file selected. |
| Score now action | `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/61-legacy-candidate-detail-score-now-modal-opened.png` | Opened from Interview score tab; no score submitted. |

Supplement automation record: `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/supplement-records.json`.

## Failed or inconclusive interactions

These are not accepted omissions. They remain follow-up evidence requirements.

### Legacy

- Database user account menu: locator resolved but did not open within timeout.
- Database table sort: no stable clickable sort target was captured from the legacy table.
- Database first-row candidate open action: candidate links were present elsewhere in notifications, but the table action did not open through the automation locator.
- Candidate detail stage selector: visible as a `select`, but the automated click did not capture an opened native dropdown state.
- Candidate detail surveys/custom fields: no separate legacy tab was identified for the seeded candidate in this pass.
- Candidate detail stage selector: closed state and options were captured in the supplement, but opened native dropdown and mutation outcomes remain uncaptured by design.

### Greenfield

- Bulk Actions initial and post-selection: the button remained disabled in this dataset/state, so enabled menu behavior is not proven.
- Search filtered no-match and reset/clear: the locator timed out in this run; the route-state should be recaptured with a stable direct URL or explicit test hook.
- Custom fields tab: no separate visible tab was captured.
- Tag action: no separate visible action was captured.

## Confirmed differences and blockers

This capture confirms that V2 candidate parity is still not proven:

- The legacy and greenfield database surfaces differ in sidebar width/state, row density, data values, column model, saved-list/filter presentation, bulk-actions enablement, and table action behavior.
- The legacy candidate detail uses a job-context layout with a native hiring-flow selector, candidate sequence controls, legacy More actions menu, and combined tab names such as `Forms & docs`, while the greenfield detail separates several panels and exposes different action labels.
- Greenfield candidate actions such as schedule, offer, reject, and upload CV were captured, but matching legacy modal/action references are still incomplete.
- Some legacy action targets could require seeded candidate/job state, exact permissions, or manual interaction not satisfied by this automated pass.

## Backend/API unknowns

Do not infer final backend contracts from this evidence. The following remain non-inventable:

- candidate database row schema and exact column ownership;
- saved filter/list persistence model;
- bulk action enablement and mutation payloads;
- stage/hiring-flow transition payloads;
- forms/documents/contracts/surveys/custom-field schemas;
- offer, reject, schedule, upload, email/message, and tag mutation payloads.

## Figma readiness decision

| Area | Decision | Reason |
|---|---|---|
| Candidate database | Still parity-blocked | Deep capture improves menu/control coverage, but differences and several inconclusive controls remain. |
| Candidate detail | Still parity-blocked | Core tabs and actions were captured, but legacy action/modals and several tab states remain incomplete. |
| Candidate actions | Still parity-blocked | Greenfield actions are visible, but matching legacy schedule/offer/reject/upload/email references are not complete. |

## Follow-up capture requirements

Before promoting any V2 row to `Figma-ready`, capture or explicitly accept the following:

1. Legacy database table sort and first-row open action from the table itself.
2. Legacy account menu from the candidate database context.
3. Legacy candidate detail stage selector opened or selected-state behavior.
4. Legacy survey/custom-field equivalents if available for a seeded candidate; no separate legacy tab was identified in this seeded candidate.
5. Legacy offer/hire terminal flow after stage movement if product wants that state; destructive stage/status mutations were not performed in this pass.
6. Greenfield enabled Bulk Actions state with selected candidates and any available menu entries.
7. Greenfield filtered/no-match search and reset/clear state using a stable URL or test hook.
8. Additional data setup if the logged-in account lacks candidates with forms, surveys, documents, custom fields, contracts, or enabled bulk actions.
