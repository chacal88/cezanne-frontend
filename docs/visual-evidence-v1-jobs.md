# Visual Evidence V1 Jobs

## Purpose

This log records V1 jobs visual evidence captured after V0. It supports `v1-jobs-visual-contract.md` and keeps screenshots as visual/state evidence only, not as backend schema truth.

## Capture metadata

| Field | Value |
|---|---|
| Capture date | 2026-04-21; runtime hook update 2026-04-22 |
| Viewport | Desktop `1440x900`, device scale factor `1` |
| Current app | `http://localhost:5173` |
| Legacy/reference app | `http://localhost:4000` |
| Local seed | `local-dev/scripts/seed-api-data.sh` with owner `kauemsc@gmail.com`, company `Warner Brothers`, job id `12`, candidate id `28`. Passwords and auth tokens are intentionally omitted. |
| Capture manifests | `visual-evidence-assets/v1/v1-capture-manifest.json` |
| Security exclusions | No credentials, raw tokens, provider payloads, signed URLs, CV document bodies, or candidate-private message contents are stored in this log. |

## Evidence inventory

| Route/family | Evidence source | Screenshot | Captured states | Decision |
|---|---|---|---|---|
| `/jobs/open` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-jobs-list-open-1440x900.png` | List ready, URL scope/page/admin/label state, create entry, ATS ready | Covered for current jobs list base |
| `/jobs/open?search&label&asAdmin` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-jobs-list-filtered-clear-1440x900.png` | Filtered-empty, active filters, clear-filters action | Covered |
| `/jobs/open?search=loading` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-jobs-list-loading-1440x900.png` | Loading state model | Covered |
| `/jobs/open?search=degraded` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-jobs-list-degraded-1440x900.png` | Degraded source state | Covered |
| `/jobs/open?search=stale` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-jobs-list-stale-1440x900.png` | Stale filters/source state | Covered |
| `/jobs/open?search=unavailable` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-jobs-list-unavailable-1440x900.png` | Unavailable state | Covered |
| `/jobs/open?search=denied` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-jobs-list-denied-1440x900.png` | Denied state model | Covered |
| `/jobs/open` | Legacy/reference | `visual-evidence-assets/v1/legacy/legacy-v1-jobs-list-open-1440x900.png` | Legacy shell/list reference after authenticated seed | Reference only |
| `/jobs/manage` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-authoring-create-1440x900.png` | Create draft, branching, publish readiness placeholder | Covered for create base |
| `/jobs/manage?copyFromJobId&saveState=dirty` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-authoring-copy-dirty-1440x900.png` | Copy/dirty state | Covered |
| `/jobs/manage/:id?resetWorkflow=true` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-authoring-edit-reset-1440x900.png` | Edit/resetWorkflow impact entry | Covered |
| `/jobs/manage/:id?saveState=validating/saving/saved/failed` | Current greenfield | `greenfield-v1-job-authoring-validating-1440x900.png`, `greenfield-v1-job-authoring-saving-1440x900.png`, `greenfield-v1-job-authoring-saved-1440x900.png`, `greenfield-v1-job-authoring-failed-1440x900.png` | Save lifecycle states | Covered |
| `/jobs/manage` | Legacy/reference | `visual-evidence-assets/v1/legacy/legacy-v1-job-authoring-create-1440x900.png` | Legacy create route shell reference | Reference only |
| `/job/:id?section=overview` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-detail-overview-1440x900.png` | Hub overview, summaries, transitions, task entry links | Covered |
| `/job/:id?section=candidates` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-detail-candidates-section-1440x900.png` | Section-owned URL state | Covered |
| `/job/:id?section=workflow&degradedSection=candidates` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-detail-workflow-degraded-1440x900.png` | Degraded section state | Covered |
| `/job/:id?section=activity&unavailable=true` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-detail-unavailable-1440x900.png` | Unavailable section/source state | Covered |
| `/job/:id?transition&assignment` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-detail-transition-assignment-1440x900.png` | Status transition and shared assignment state | Covered |
| `/job/:id` | Legacy/reference | `visual-evidence-assets/v1/legacy/legacy-v1-job-detail-overview-1440x900.png` | Legacy job detail with seeded candidates, actions, activity/calendar | Covered as reference |
| `/job/:id/bid` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-bid-create-1440x900.png` | Bid create route context, parent return | Covered |
| `/job/:id/bid/:bid_id` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-bid-view-1440x900.png` | Bid view route context | Covered |
| `/job/:id/cv` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-cv-create-1440x900.png` | CV create route context | Covered |
| `/job/:id/cv/:cv_id` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-cv-view-1440x900.png` | CV view route context | Covered |
| `/job/:id/cv-reject/:cv_id` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-cv-reject-1440x900.png` and `greenfield-v1-job-task-fail-retry-1440x900.png` | Reject ready/failure state | Covered for route/task shell; reason catalog remains unknown |
| `/job/:id/cv/:cv_id/schedule` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-schedule-dev-capability-1440x900.png` and `visual-evidence-assets/v1/current/greenfield-v1-job-schedule-fail-1440x900.png` | Schedule ready/failure route context and parent return | Covered for task shell; provider-blocked variants deferred |
| `/job/:id/cv/:cv_id/offer` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-offer-1440x900.png` and `greenfield-v1-job-task-success-refresh-1440x900.png` | Offer ready/success/parent-refresh route context | Covered for task shell; contract payload remains unknown |
| `/build-requisition` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-build-requisition-1440x900.png` | Jobs-side requisition draft, explicit save/no autosave ownership | Covered |
| `/job-requisitions/:workflow/:stage?` | Current greenfield | `visual-evidence-assets/v1/current/greenfield-v1-job-requisition-workflow-1440x900.png` and `greenfield-v1-job-requisition-stale-workflow-1440x900.png` | Workflow/stage route and stale workflow state | Covered |
| `/jobs/manage*?publishingState=` | Current greenfield runtime | Pending screenshot capture | Provider-blocked, degraded, unavailable, and partial publish labels through fixture hook | Runtime/test-hook covered; provider payloads deferred |
| `/job/:id/cv/:cv_id/schedule?readinessState=` | Current greenfield runtime | Pending screenshot capture | Schedule provider-blocked/degraded/unavailable/unimplemented readiness labels and remediation target through fixture hook | Runtime/test-hook covered; provider setup remains separate |

## Superseded captures

These files are retained for audit trail only and must not be used for implementation:

| File | Reason | Replacement |
|---|---|---|
| `visual-evidence-assets/v1/superseded/greenfield-v1-job-schedule-1440x900.png` | Captured access denied because the API login access context did not include the schedule capability. | `visual-evidence-assets/v1/current/greenfield-v1-job-schedule-dev-capability-1440x900.png` |

## Confirmed visual observations

- Greenfield V1 jobs screens are currently state-contract-first and visually sparse, but they expose the required route state labels, parent-return targets, and action entry points needed for Figma screen-flow mapping.
- Legacy job detail provides the richest visual reference for real job detail composition: seeded job title, actions, candidate pipeline, calendar, activity, and side navigation.
- Greenfield list and authoring pages prove URL-state ownership and state transitions, while legacy jobs list/authoring screenshots are reference-only because the captured legacy body text is mostly shell/navigation.
- Task routes consistently resolve job id, candidate id, bid id, parent target, direct-entry flag, outcome, and parent-refresh intent before rendering.
- Requisition screens remain jobs-side task/workflow routes and must not be merged with settings-side requisition workflow configuration.

## Accepted deviations in this pass

- Fixture-backed greenfield job list/detail/task data is accepted as V1 visual/state evidence for route ownership and screen-flow structure, not as production backend schema proof.
- Legacy job detail is accepted as visual composition reference for the seeded job. It does not define final greenfield data fields or exact table columns.
- Provider-blocked schedule/publish variants are now exposed as deterministic route fixture hooks for Figma capture. Exact provider copy, remediation labels, and payloads stay deferred until provider contracts are confirmed.

## Deferred visual debt

- Final jobs table columns, pagination controls, and production list aggregates.
- Full visual parity for legacy job detail action grouping, candidate pipeline layout, calendar placement, and activity spacing.
- Job authoring full form layout, validation copy, and provider-specific publishing result payloads. Publish blocked/partial-publish state labels are now fixture-hook reachable, but screenshot evidence remains pending.
- Reject reason catalog visuals and exact rejection mutation payload.
- Schedule provider-blocked/degraded/unavailable labels are now fixture-hook reachable; slot selection, conflict, and provider remediation copy remain deferred.
- Offer payload fields, contract document detail, provider challenge, and signing downstream status.
- Requisition data-loss warning and HRIS readiness labels beyond the current state-contract frames.

## Backend/API unknowns

- Job list table schema, job aggregate schema, bid schema, CV document schema, rejection reason catalog, offer payload, requisition payload, publishing provider result schema, and HRIS readiness payload remain non-inventable.
- Current screenshots may show placeholder ids/titles/counts. Figma must label those as examples unless a backend contract confirms them.

## Figma-ready decision

| Area | Decision | Reason |
|---|---|---|
| Jobs list | Figma-ready for V1 screen-flow base | Ready, filtered-empty/clear-filters, loading, degraded, stale, unavailable, and denied states are captured. |
| Job authoring | Figma-ready for V1 screen-flow base | Create/edit/copy/resetWorkflow and save lifecycle states are captured; full form/publish-provider variants remain deferred. |
| Job detail hub | Figma-ready for V1 screen-flow base | Overview/section/degraded/unavailable/transition/assignment states plus legacy composition reference are captured. |
| Job task overlays | Figma-ready for V1 task-shell base | Bid/CV/reject/schedule/offer route contexts and success/failure/cancel/refresh outcomes are captured; schedule readiness fixture hooks are runtime-covered, with provider-specific task internals deferred. |
| Requisition routes | Figma-ready for V1 route-state base | Build requisition, workflow/stage, and stale workflow state are captured with jobs-side ownership. |

V1 may proceed to Figma for screen-flow structure and layout discovery. The deferred provider/form/schema details above must remain annotated debt and must not be invented in Figma.
