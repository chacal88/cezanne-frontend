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
| Email candidate modal | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/12-detail-email-candidate-modal.png` | Legacy-style modal entry point. |
| Send to hiring manager modal | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/13-detail-send-to-hiring-manager-modal.png` | Legacy-style modal entry point. |
| Move job modal | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/14-detail-move-job-modal.png` | Legacy-style modal entry point. |
| Score now modal | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/15-detail-score-now-modal.png` | Legacy-style modal entry point from Interview score tab. |
| Schedule task modal route | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/20-action-schedule-modal-route.png` | Route-owned task now renders as a modal surface. |
| Offer task modal route | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/21-action-offer-modal-route.png` | Route-owned task now renders as a modal surface. |
| Reject task modal route | `docs/visual-evidence-assets/v2/recapture-2026-04-22-parity-pass/new/22-action-reject-modal-route.png` | Route-owned task now renders as a modal surface. |

## Validation

Confirmed:
- The capture script completed successfully and wrote 14 screenshots plus `recapture-records.json`.
- All screenshots are 1440 × 900 PNG files.
- The recapture harness now seeds API-style database rows plus Finn/Diego detail records, reducing the prior data-mismatch blocker for the covered ready/action states.
- The database selected-row state now shows the enabled selected toolbar.
- The candidate detail More actions menu now exposes the legacy-modal action entries.
- Schedule, offer, and reject task routes now preserve route ownership while rendering a modal-like composition over candidate context.

Still not claimed:
- Pixel parity with legacy.
- Fresh authenticated legacy recapture in the same run.
- Final Figma readiness for V2.
- Backend mutation parity for modal actions; the modal fields are current composition evidence only.

## Side-by-Side Review Result

Compared against the existing authenticated legacy references in `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy/` and `docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement/`, this recapture improves the evidence quality but still does not close parity.

| Area | Result | Basis |
|---|---|---|
| Database ready | Improved; still blocked | API-seed names/emails now match the legacy style and row count is closer, but table/card width, column widths, top spacing, pagination placement, and row density still differ from `legacy/01-database-ready-viewport.png`. |
| Database menus and bulk toolbar | Improved; still blocked | Add new and selected-row bulk states now exist with comparable data, but menu icon treatment, row heights, dropdown width/offset, and toolbar copy/spacing still differ from `legacy/05-add-new-menu-opened.png` and `legacy/11-bulk-actions-after-first-row-selected.png`. |
| Candidate detail ready | Improved; still blocked | Finn ApiSeed now aligns with the main detail legacy candidate, but profile-card width, email wrapping, hiring-flow geometry, tab/CV proportions, notes placement, and exact stage control still differ from `legacy/20-candidate-detail-ready-viewport.png`. |
| More actions | Improved; still blocked | Diego ApiSeed now aligns with the supplement candidate, and missing actions are visible, but the menu contents/height differ from `legacy/22-candidate-detail-more-actions-opened.png` and the supplement action references. |
| Email candidate | Still blocked | Greenfield uses a centered modal with simple fields; `legacy-supplement/56-legacy-candidate-detail-more-actions-email-candidate-opened.png` shows the full compose/editor surface with template, Bcc chip, toolbar, attachment control, draft/send actions, and in-page email context. |
| Schedule interview | Still blocked | Greenfield uses a generic modal route with a four-step header; `legacy-supplement/57-legacy-candidate-detail-more-actions-interview-scheduler-opened.png` uses a wider wizard with dark step header, candidate/job details, interview type/location fields, radio controls, and a different footer. |
| Reject candidate | Still blocked | Greenfield uses reason/review/internal-note fields; `legacy-supplement/55-legacy-candidate-detail-reject-modal-opened.png` uses the two-step reject flow with message/template editor, toolbar, attachment control, and reject-with/without-message actions. |
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
- database shell/table geometry and menu offsets;
- candidate detail profile-card, hiring-flow, and CV/tab proportions;
- exact legacy action flow composition for email, schedule, reject, review request, move job, upload CV, and score-now.

Only after those changes are recaptured against authenticated legacy references may individual gaps be marked resolved. Until then, V2 Candidates remains parity-blocked.
