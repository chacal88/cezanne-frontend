# V2 Candidates Detail Recapture — 2026-04-22

## Purpose

This recapture records the Candidate Detail Hub cluster after the greenfield detail-hub visual corrections. It does not claim parity and does not mark V2 as Figma-ready.

## Scope

Captured cluster: **Candidate detail only**.

Not captured in this pass:
- Candidate database, because this task targeted the Candidate Detail Hub cluster.
- Candidate action flows, because schedule/reject/offer/email modal parity was explicitly deferred.

## Capture setup

| Field | Value |
|---|---|
| Date | 2026-04-22 |
| Viewport | 1440 × 900 desktop |
| Legacy system | `http://localhost:4000` |
| Greenfield system | `http://localhost:5173` |
| Evidence root | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/` |
| Automation records | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/recapture-records.json` |
| Credential handling | No password or token is recorded in this log or in the automation records. |

## Recapture status

| System | Status | Evidence | Notes |
|---|---|---|---|
| Legacy | Blocked by authentication | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/legacy/00-legacy-auth-required.png` | The browser reached the legacy login screen. No password/token was written to files. Legacy comparisons below therefore reference the existing baseline screenshots from `deep-capture-2026-04-22`. |
| Greenfield | Captured | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/20-candidate-detail-ready-viewport-job-context.png` | Captured with a job-context route: `/candidate/candidate-123/job-456/screening/2/remote?entry=job`. |

## Greenfield captured evidence

| Interaction | Evidence |
|---|---|
| Detail ready viewport, job context | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/20-candidate-detail-ready-viewport-job-context.png` |
| Stage selector closed/options source | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/stage-options.json`; screenshot source `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/20-candidate-detail-ready-viewport-job-context.png` |
| More actions menu | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/22-candidate-detail-more-actions-opened.png` |
| Latest CV tab | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/24-candidate-detail-latest-cv-tab.png` |
| Activity tab | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/25-candidate-detail-activity-tab.png` |
| Interview score tab | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/52-candidate-detail-interview-score-tab.png` |
| Forms & docs tab | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/51-candidate-detail-forms-docs-tab.png` |
| Contracts tab | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/29-candidate-detail-contracts-tab.png` |
| Comments tab | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/53-candidate-detail-comments-tab.png` |
| Emails tab | `docs/visual-evidence-assets/v2/recapture-2026-04-22-detail/new/54-candidate-detail-emails-tab.png` |

## Screenshot-specific observations

| Gap | Status from this recapture | Evidence-backed observation |
|---|---|---|
| V2-GAP-014 | Improved; still blocked for final parity | Greenfield now shows a job-context breadcrumb and `Back to job` in `new/20-candidate-detail-ready-viewport-job-context.png`. The legacy comparison target remains `deep-capture-2026-04-22/legacy/20-candidate-detail-ready-viewport.png` because authenticated legacy recapture was blocked by `legacy/00-legacy-auth-required.png`. |
| V2-GAP-015 | Still blocked | Greenfield still uses `Riley Candidate` in `new/20-candidate-detail-ready-viewport-job-context.png`, while the legacy baseline uses `Finn ApiSeed` in `deep-capture-2026-04-22/legacy/20-candidate-detail-ready-viewport.png`. |
| V2-GAP-016 | Improved; still blocked for exact parity | Greenfield side card now includes CV received/source, first-time applicant badge, CV score, contact rows, tags, notes, and utility links in `new/20-candidate-detail-ready-viewport-job-context.png`. Exact visual/data parity remains blocked by the candidate data mismatch noted in V2-GAP-015. |
| V2-GAP-017 | Improved; still blocked for open native dropdown evidence | Greenfield now uses a compact top-right native stage selector in `new/20-candidate-detail-ready-viewport-job-context.png`, and options are recorded in `new/stage-options.json`. Open native dropdown parity remains uncaptured, matching the known limitation from `deep-capture-2026-04-22/legacy-supplement/50-legacy-candidate-detail-stage-selector-closed-and-options-source.png`. |
| V2-GAP-018 | Improved; still blocked for exact parity | Greenfield timeline is compact and aligned above tabs in `new/20-candidate-detail-ready-viewport-job-context.png`. Dot/count styling still needs authenticated side-by-side recapture against legacy before any parity claim. |
| V2-GAP-019 | Improved; still blocked by seed/context mismatch | Greenfield now exposes `Candidate 1 of 3` and `Next` in `new/20-candidate-detail-ready-viewport-job-context.png`. Legacy baseline shows a different sequence count in `deep-capture-2026-04-22/legacy/20-candidate-detail-ready-viewport.png`, so seed/context parity remains blocked. |
| V2-GAP-020 | Improved | Greenfield tab labels now use the legacy grouping (`Latest CV`, `Activity`, `Interview score`, `Forms & docs`, `Contracts`, `Comments`, `Emails`) in `new/20-candidate-detail-ready-viewport-job-context.png` and the tab-specific captures listed above. |
| V2-GAP-021 | Improved; still blocked for exact preview/data parity | Greenfield Latest CV now includes CV/Cover note toggles, reload, upload, download, and a larger preview frame in `new/24-candidate-detail-latest-cv-tab.png`. Candidate/file data is still not matched to the legacy baseline `deep-capture-2026-04-22/legacy/24-candidate-detail-latest-cv-tab.png`. |

## Remaining blockers

- Authenticated legacy recapture is still needed for a fresh side-by-side comparison; this pass only produced `legacy/00-legacy-auth-required.png` for legacy.
- Candidate identity/data parity remains unresolved; see V2-GAP-015 and V2-GAP-031.
- Action-flow modal parity was not in scope and remains a product decision for later work.

## Figma readiness

V2 candidates remain parity-blocked. This recapture does not mark any V2 candidate screen as Figma-ready.
