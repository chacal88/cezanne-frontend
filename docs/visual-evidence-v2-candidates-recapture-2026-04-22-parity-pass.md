# V2 Candidates Parity-Pass Recapture — 2026-04-22

## Purpose

This recapture records the greenfield V2 Candidates UI after the first explicit legacy-parity implementation pass.

It covers:
- candidate database density, saved filters/lists, menus, and selected-row bulk toolbar;
- candidate detail ready state, More actions, and newly added legacy-style modal entries;
- route-owned schedule, offer, and reject tasks rendered as modal surfaces over a candidate-profile background.

This pass **does not** claim final legacy parity and does **not** mark V2 as Figma-ready. It is current-app evidence for the next side-by-side review against authenticated legacy references.

## Capture Setup

| Field | Value |
|---|---|
| Date | 2026-04-22 |
| Viewport | 1440 × 900 desktop |
| Greenfield system | `http://127.0.0.1:5173` |
| Evidence root | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/` |
| Automation records | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/recapture-records.json` |
| Capture script | `scripts/capture-v2-parity-recapture.mjs` |
| Session handling | Dev-only `recruit.localAuthSession` seeded for HC admin access. |
| Data handling | Candidate `/v2/cv`, GraphQL reads, and `candidate-store-v1` are mocked inside the capture script for deterministic visual evidence. The database/detail seeds now use legacy-comparable `Finn ApiSeed` and `Diego ApiSeed` records instead of generic Riley/Alex fixtures. |

## Captured Evidence

| State | Evidence | Notes |
|---|---|---|
| Database ready after density pass | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/01-database-ready-density-pass.png` | Compact table/sidebar, comparable saved entries, and API-seed candidate rows. |
| Database Add new menu | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/02-database-add-new-menu-density-pass.png` | Captures menu anchor/geometry after first parity pass. |
| Database saved filter menu | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/03-database-saved-filter-menu-density-pass.png` | Captures comparable `LIST KAUE` / `FILTER KAUE` filter entries. |
| Database saved list menu | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/04-database-saved-list-menu-density-pass.png` | Captures comparable saved list entries. |
| Database row selected | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/05-database-row-selected-bulk-enabled.png` | Confirms selected-row bulk toolbar is visible. |
| Detail ready | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/10-detail-ready-after-parity-pass.png` | Finn ApiSeed job-context detail hub after legacy action modal entries were added. |
| Detail More actions | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/11-detail-more-actions-after-parity-pass.png` | Diego ApiSeed menu now includes email, scheduler, offer, review request, move job, and reject entries. |
| Email candidate modal | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/12-detail-email-candidate-modal.png` | Legacy-style template/composer/editor surface in a contextual modal. |
| Send to hiring manager modal | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/13-detail-send-to-hiring-manager-modal.png` | Legacy-style modal entry point. |
| Move job modal | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/14-detail-move-job-modal.png` | Legacy-style modal entry point. |
| Score now modal | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/15-detail-score-now-modal.png` | Legacy-style modal entry point from Interview score tab. |
| Schedule task modal route | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/20-action-schedule-modal-route.png` | Route-owned task now renders as a modal wizard with dark header, candidate context, job details, and first-step interview fields. |
| Offer task modal route | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/21-action-offer-modal-route.png` | Route-owned task now renders as a modal surface. |
| Reject task modal route | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/22-action-reject-modal-route.png` | Route-owned task now renders as a modal with reject steps and message/editor composition. |

## Validation

Confirmed:
- The capture script completed successfully and wrote 14 screenshots plus `recapture-records.json`.
- All screenshots are 1440 × 900 PNG files.
- The recapture harness now seeds API-style database rows plus Finn/Diego detail records, reducing the prior data-mismatch blocker for the covered ready/action states.
- The database selected-row state now shows the enabled selected toolbar.
- The candidate detail More actions menu now exposes the legacy-modal action entries.
- Schedule, offer, and reject task routes now preserve route ownership while rendering modal-like composition over candidate context.
- Schedule and reject received a second composition pass toward legacy: schedule now has the dark wizard header, job detail column, interview-type/location fields, and radio groups; reject now has the two-step header plus template/message editor surface. Email candidate now uses a template/editor/attachment-style modal surface rather than the earlier simple form.
- The database ready frame received a vertical geometry pass so the page title/search row/table container align more closely to the legacy ready baseline.
- The database recapture now uses the legacy-style 8-row API-seed cadence and has closer card edge, sidebar/table split, and table edge geometry.
- The database search input/button sizing and table row heights now place the primary ready viewport closer to `legacy/01-database-ready-viewport.png`, including hiding pagination below the captured fold.
- The detail ready capture now has a closer profile-card/notes vertical stack and tabs/CV start position, without shifting the page into the navigation rail.

Still not claimed:
- Pixel parity with legacy.
- Fresh authenticated legacy recapture in the same run.
- Final Figma readiness for V2.
- Backend mutation parity for modal actions; the modal fields are current composition evidence only.

## Side-by-Side Review Result

Compared against the existing authenticated legacy references in `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/` and `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/`, this recapture improves the evidence quality but still does not close parity.

| Area | Result | Basis |
|---|---|---|
| Database ready | Improved; still blocked | API-seed names/emails now match the legacy style, the ready capture shows the legacy-style 8-row cadence, search/table/card geometry is closer, and pagination no longer appears in the primary viewport. Exact column widths, icon treatment, menu offsets, and remaining toolbar spacing still differ from `legacy/01-database-ready-viewport.png`. |
| Database menus and bulk toolbar | Improved; still blocked | Add new and selected-row bulk states now exist with comparable data, but menu icon treatment, row heights, dropdown width/offset, and toolbar copy/spacing still differ from `legacy/05-add-new-menu-opened.png` and `legacy/11-bulk-actions-after-first-row-selected.png`. |
| Candidate detail ready | Improved; still blocked | Finn ApiSeed now aligns with the main detail legacy candidate, and card/notes vertical stack plus tab/CV start are closer. Lateral shell width, email wrapping, exact profile-card details, hiring-flow geometry, CV preview proportions, and exact stage control still differ from `legacy/20-candidate-detail-ready-viewport.png`. |
| More actions | Improved; still blocked | Diego ApiSeed now aligns with the supplement candidate, and missing actions are visible, but the menu contents/height differ from `legacy/22-candidate-detail-more-actions-opened.png` and the supplement action references. |
| Email candidate | Improved; still blocked | Greenfield now has template, Bcc chip, subject, editor toolbar, attachment control, and message body in a centered modal. Legacy evidence still differs in route/tab context, exact editor toolbar, footer actions, and send/draft affordances. |
| Schedule interview | Improved; still blocked | Greenfield now has a wider wizard, dark header, candidate/job detail split, interview type/location fields, and radio groups. Exact legacy modal height, stepper placement, copy, job metadata, and next-step footer remain different. |
| Reject candidate | Improved; still blocked | Greenfield now has the two-step reject header plus template/message editor surface. Exact legacy modal width/position, editor controls, Bcc chip wrapping, and reject-with/without-message footer actions remain different. |
| Send to hiring manager | Improved; still blocked | Greenfield exposes the modal, but `legacy-supplement/58-legacy-candidate-detail-more-actions-send-to-hiring-manager-opened.png` includes a candidate chip, icon header treatment, and different footer/action layout. |

## Gap Impact

| Gap area | Marking after this pass |
|---|---|
| V2-GAP-004 to V2-GAP-012 | Improved; still blocked after side-by-side review. |
| V2-GAP-015 and V2-GAP-031 | Partially improved for the covered recapture states because Finn/Diego/API-seed data is now used; still blocked for same-run authenticated legacy recapture and full candidate/state coverage. |
| V2-GAP-016, V2-GAP-020, V2-GAP-021 | Improved; still blocked after side-by-side review. |
| V2-GAP-024 to V2-GAP-030 | Improved; still blocked after side-by-side review. |
| V2-GAP-032 to V2-GAP-033 | Still blocked by safe non-destructive capture boundaries and missing denied/unavailable/stale/terminal/mobile state coverage. |

## Next Required Step

Continue implementation from the remaining largest blockers:
- database menu offsets, icon treatment, column sizing, and bulk toolbar details;
- candidate detail lateral shell width, profile-card details, hiring-flow dot/line treatment, and CV/tab proportions;
- exact legacy action flow composition for email, schedule, reject, review request, move job, upload CV, and score-now, especially footer actions, editor controls, field payloads, and wizard dimensions.

Only after those changes are recaptured against authenticated legacy references may individual gaps be marked resolved. Until then, V2 Candidates remains parity-blocked.
