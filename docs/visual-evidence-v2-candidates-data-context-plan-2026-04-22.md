# Visual Evidence V2 Candidates Data Context Plan — 2026-04-22

## Purpose

This planning note defines the data/context prerequisites for a reliable recapture of V2 Candidates across the legacy frontend and the greenfield `recruit-frontend` implementation.

It does not declare parity, does not record credentials, and does not authorize destructive submissions. Its goal is to make the next capture pass compare equivalent candidate, job, list/filter, document/form, and action-eligibility states instead of comparing unrelated local data.

## Source documents read

- `../../docs/README.md`
- `README.md`
- `visual-evidence-v2-candidates-deep-capture-2026-04-22.md`
- `visual-evidence-v2-candidates-gap-register-2026-04-22.md`

## Current decision

| Area | Decision |
|---|---|
| Candidate database | parity-blocked |
| Candidate detail | parity-blocked |
| Candidate action flows | parity-blocked |
| Figma readiness | parity-blocked |

## Data-equivalence-dependent gaps

### Directly blocked by non-equivalent data/context

| Gap ID | Dependency | Why recapture needs equivalent data/context |
|---|---|---|
| V2-GAP-005 | Saved filters | Legacy captured named saved entries such as `LIST KAUE` and `FILTER KAUE`; greenfield captured different examples. Visual comparison is unreliable until entries, counts, visibility, and ownership are aligned or explicitly mapped. |
| V2-GAP-006 | Saved lists | Legacy and greenfield saved-list names, count chips, sharing labels, and ordering differ. A comparable list fixture is required before judging layout details. |
| V2-GAP-008 | Bulk Actions enablement | Legacy shows selectable rows and a Bulk Actions control; greenfield remained disabled after selection in the captured dataset/state. Eligible candidates and permissions must be aligned before recapture. |
| V2-GAP-009 | Search no-match/reset behavior | Legacy has no-match and reset captures; greenfield state timed out. Stable data plus route/query/test-hook setup is needed to reproduce equivalent no-match and reset states. |
| V2-GAP-011 | Table data parity | Candidate names, emails, job suffixes, and row counts differ. Side-by-side visual parity cannot be evaluated with unrelated rows. |
| V2-GAP-014 | Job-context detail route | Legacy detail was captured from a job context; greenfield was database-oriented. Recapture needs the same origin context or an explicit accepted route-context mapping. |
| V2-GAP-015 | Candidate identity/data mismatch | Legacy captured Diego ApiSeed; greenfield captured Riley Candidate. Detail composition comparisons require the same candidate profile payload or a field-by-field mapping. |
| V2-GAP-017 | Stage/hiring-flow control | Legacy captured a native selector source and options; greenfield captured a custom dropdown. Equivalent stage/status options and selected state are required before judging styling and behavior. |
| V2-GAP-020 | Tabs model and labels | Forms/docs, comments, emails, feedback/interview score, contracts, and surveys depend on which related records exist for the candidate. Empty vs populated states must be intentionally matched. |
| V2-GAP-021 | CV preview composition | Legacy and greenfield CV tabs show different preview/control states. Recapture needs equivalent CV availability, cover note availability, and upload eligibility. |
| V2-GAP-022 | Forms/docs content model | The legacy combined `Forms & docs` tab and greenfield split tabs cannot be fairly compared without equivalent candidate forms/documents/contracts/surveys setup. |
| V2-GAP-023 | Comments and emails content | Comment counts, history rows, and email history/composer states depend on seeded communications. |
| V2-GAP-024 | Schedule/interview flow composition | Modal contents depend on candidate/job/stage, interview availability, interviewers, and calendar/provider readiness. Safe open-only data is needed. |
| V2-GAP-025 | Reject flow composition | Reject modal/page state depends on candidate status/stage and template/reason availability. Capture must stop before submission. |
| V2-GAP-026 | Email candidate composition | Compose state depends on candidate email, sender/template availability, and message eligibility. Capture must stop before send. |
| V2-GAP-027 | Send to hiring manager/review request | Requires hiring manager/reviewer candidates, permission, and candidate/job context. Capture must stop before request submission. |
| V2-GAP-028 | Move to different job | Requires at least one safe target job and a movable candidate state. Capture must stop before move submission. |
| V2-GAP-029 | Upload new CV | Requires upload eligibility and a safe dummy-file strategy for validation-only states if needed. No real upload should be submitted unless explicitly approved. |
| V2-GAP-030 | Score now/interview feedback | Requires interview score/review eligibility and score form data. Capture must stop before score submission. |
| V2-GAP-031 | Comparable seed data | This is the umbrella blocker for candidate/job/list/filter/count/permission equivalence. |
| V2-GAP-032 | Non-destructive action boundaries | Open-only modal/page capture needs explicit dry-run boundaries for stage change, reject, schedule, offer/hire, email, review request, upload, and move-job states. |
| V2-GAP-033 | Missing state coverage | State fixtures/test hooks are needed for unavailable, validation-error, submit-failure, terminal/read-only, stale, and mobile states. |

### Partially dependent on data/context

| Gap ID | Dependency | Notes |
|---|---|---|
| V2-GAP-007 | Add column menu/state | Column option inventory and selected-state can depend on tenant/user configuration. Layout can be worked independently, but recapture needs the same column set. |
| V2-GAP-012 | Table columns and sorting | Column visibility/order and stage column presence depend on the selected table model and candidate/job setup. Sorting behavior also needs enough rows with distinct values. |
| V2-GAP-013 | First-row open action parity | Needs a stable first row and same origin route to confirm whether navigation preserves job/database context. |
| V2-GAP-016 | Candidate side card layout | Much of the side card is visual implementation, but CV received/source, score, tags, notes, contact fields, badges, and utility links are data-backed. |
| V2-GAP-018 | Hiring-flow timeline geometry | Visual styling is implementation-owned, but labels, completed/current state, and step count must be aligned. |
| V2-GAP-019 | Candidate sequence controls | Requires a job context with a known candidate count and deterministic previous/next candidates. |

### Mostly visual or product-decision gaps, not primarily seed-blocked

| Gap ID | Primary blocker |
|---|---|
| V2-GAP-001 | Shell width/state and content density alignment. |
| V2-GAP-002 | Product copy decision for the page subtitle. |
| V2-GAP-003 | Topbar notification/account interaction model. |
| V2-GAP-004 | Add-new menu geometry and icon treatment. |
| V2-GAP-010 | Table row density and vertical rhythm, after comparable rows exist. |

## Required entities and data to generate or align

### 1. Job

Required setup:

- One canonical recapture job present in both systems or mapped 1:1 across systems.
- Deterministic job title, location, department/team, and status.
- Hiring-flow/stage configuration with stable labels and ordering.
- Candidate count sufficient to test:
  - database row density;
  - first-row open behavior;
  - candidate sequence controls such as `Candidate 1 of N`;
  - sorting across at least two distinct candidates.
- Job-origin route/context that can open candidate detail from the job candidate list, not only from the database.

Already visible in captures:

- Legacy detail has a job-context breadcrumb/header and `Back to job` behavior.
- Greenfield detail has database-oriented context and `Back to database` behavior.

Missing for reliable recapture:

- A confirmed shared/mapped job identity.
- Stable target job route for both systems.
- Candidate count and sequence data aligned between systems.

### 2. Candidate

Required setup:

- One canonical primary candidate for detail recapture.
- At least one secondary candidate for sequence/sort/count behavior.
- Field-level alignment for:
  - full name;
  - email;
  - phone;
  - location;
  - source;
  - received/applied date;
  - CV availability;
  - tags;
  - notes;
  - score/interview score where applicable;
  - first-time applicant badge or equivalent marker.
- Stable candidate ID/route mapping for legacy and greenfield.

Already visible in captures:

- Legacy database/detail include API-seed candidate data, including Diego ApiSeed in detail.
- Greenfield database/detail include fixture-style candidate data, including Riley Candidate in detail.

Missing for reliable recapture:

- Same candidate identity/payload in both systems, or an explicit mapping that marks data mismatch as non-parity evidence.
- Candidate profile fields populated enough to exercise the legacy side card and greenfield equivalent.

### 3. Candidate stage/status

Required setup:

- Same selected stage/status for the primary candidate.
- Same stage option inventory and order.
- Non-terminal stage for open-only schedule, email, review, move, upload, and score-now captures.
- Separate terminal/rejected/offered/hired fixtures only if those states are explicitly captured later.
- No stage/status mutation during the parity recapture unless a dry-run/test-only mechanism is created and approved.

Already visible in captures:

- Legacy supplement captured the closed native selector and `stage-options.json`.
- Greenfield captured an opened stage selector.

Missing for reliable recapture:

- Equivalent selected stage/status.
- Confirmed mapping between legacy stage labels and greenfield labels.
- Safe strategy for stage-transition visual states without changing real candidate status.

### 4. Saved filters and saved lists

Required setup:

- At least one saved filter and one saved list with matching:
  - display name;
  - count chip or result count;
  - owner/sharing label;
  - visibility/order;
  - menu/kebab availability.
- Filter criteria that produce deterministic result rows.
- One no-match search/filter state and one clear/reset path.

Already visible in captures:

- Legacy saved section captures show named entries including `LIST KAUE` and `FILTER KAUE`.
- Greenfield captures show different entries/labels such as `All candidates`, `only me`, and `everyone`.
- Legacy no-match/reset evidence exists.

Missing for reliable recapture:

- Equivalent saved filter/list entries across both systems.
- Greenfield stable no-match/reset capture path.
- Confirmation that counts derive from the same candidate/job population.

### 5. Forms, documents, contracts, surveys, and custom fields

Required setup:

- Forms/docs/contracts/surveys/custom-field records attached to the canonical candidate/job, enough to capture either populated or intentionally empty states.
- Explicit decision whether greenfield split tabs map to the legacy combined tabs or represent an approved product divergence.
- At minimum, prepare state coverage for:
  - one document or CV attachment state;
  - one form record or empty-state equivalent;
  - one contract record or empty-state equivalent;
  - one survey/review/scoring record or empty-state equivalent;
  - at least one custom field value if custom-field parity is in scope.

Already visible in captures:

- Legacy supplement captured `Forms & docs`, `Interview score`, `Comments`, and `Emails` tabs.
- Legacy captured `Contracts` tab.
- Greenfield captured `Documents`, `Forms`, `Contracts`, `Surveys`, and `Feedback` tabs.

Missing for reliable recapture:

- Equivalent records attached to the same candidate/job.
- Legacy separate survey/custom-field equivalent was not identified for the seeded candidate.
- Greenfield custom fields tab/action was not captured.
- Populated-vs-empty state parity is not established.

### 6. Bulk action eligibility

Required setup:

- Candidate rows that are eligible for at least one safe bulk action menu to open.
- User/role/capability state with bulk actions enabled.
- Selection state that can select one row and multiple rows.
- Action capture boundary: open menus and validation screens only; do not submit send, move, reject, delete, hire, or other mutating bulk actions.

Already visible in captures:

- Legacy captured Bulk Actions initial state, row selection, and Bulk Actions after first row selected.
- Greenfield captured first-row selected state but Bulk Actions remained disabled in this dataset/state.

Missing for reliable recapture:

- Greenfield enabled Bulk Actions state.
- Confirmed menu entries for equivalent selected candidates.
- Safe dry-run boundary for each bulk action entry.

## Safe seed/setup checklist

Use this checklist before the next capture pass. It is intentionally limited to setup and open-only visual capture. It must not submit destructive actions.

### Preflight

- [ ] Use local/test environments only.
- [ ] Do not record passwords, tokens, cookies, API keys, or one-time codes in documents, screenshots, logs, or JSON summaries.
- [ ] Confirm whether the legacy and greenfield systems read from the same backend, mirrored seed data, or separate fixture adapters.
- [ ] Assign a stable recapture namespace/prefix for generated records, for example a date-scoped visual-evidence label.
- [ ] Record generated record names and non-secret IDs only.
- [ ] Ensure cleanup is optional and manual; do not add automatic destructive cleanup to the capture flow.

### Job setup

- [ ] Create or identify one non-production visual-evidence job with stable title and status.
- [ ] Configure a deterministic hiring flow with known stage labels and order.
- [ ] Attach at least two candidates to the job.
- [ ] Confirm job-origin candidate detail navigation works in both systems.
- [ ] Confirm database-origin candidate detail navigation still works, but keep it separate from job-origin parity recapture.

### Candidate setup

- [ ] Create or identify one primary candidate with aligned profile fields in both systems.
- [ ] Create or identify one secondary candidate for sequence, sorting, and count states.
- [ ] Attach the primary candidate to the canonical job and selected stage.
- [ ] Add safe non-sensitive contact values and avoid real personal data where possible.
- [ ] Add tags, notes, source, received/applied date, score, and badge-related fields if those are visible in the target legacy side card.

### Stage/status setup

- [ ] Keep the primary candidate in a non-terminal stage for open-only action capture.
- [ ] Export or record the legacy stage option inventory without changing the selected value.
- [ ] Configure/match greenfield stage options and selected value.
- [ ] If transition states are needed, create separate throwaway candidates and stop at confirmation dialogs unless an approved dry-run exists.

### Saved filters/lists setup

- [ ] Create one saved filter with the same display name, criteria, owner/sharing label, and expected count in both systems.
- [ ] Create one saved list with the same display name, membership, owner/sharing label, and expected count in both systems.
- [ ] Confirm saved section ordering and collapsed/expanded defaults.
- [ ] Prepare one deterministic search term that returns no results.
- [ ] Prepare a reset/clear path using route query, UI control, or test hook.

### Forms/docs/contracts/surveys/custom fields setup

- [ ] Attach a safe dummy CV/document reference or use an existing non-sensitive placeholder document.
- [ ] Add or map one form record, or explicitly define an empty-state fixture for both systems.
- [ ] Add or map one contract record, or explicitly define an empty-state fixture for both systems.
- [ ] Add or map one survey/review/scoring record, or explicitly define an empty-state fixture for both systems.
- [ ] Add at least one custom field value if custom-field parity remains in V2 scope.
- [ ] Confirm whether legacy `Forms & docs` should remain combined or whether greenfield split tabs are an approved divergence before visual signoff.

### Action and bulk-action safety

- [ ] Capture action launchers and opened modals/pages only.
- [ ] Do not submit schedule, reject, offer/hire, email/message, review request, move-job, upload, score, or bulk-action workflows.
- [ ] For upload states, prefer visible control and validation-only screenshots; use a dummy file only if explicitly approved and no submission occurs.
- [ ] For bulk actions, select rows, open menus, and capture disabled/validation states without confirming any mutation.
- [ ] If a state cannot be reached without mutation, mark it as blocked and request a dry-run/test hook instead of submitting.

### Recapture acceptance gates

- [ ] Confirm legacy and greenfield screenshots use the same viewport.
- [ ] Confirm the same job/candidate/list/filter labels are visible in both systems or explicitly mark mismatches as non-parity evidence.
- [ ] Confirm all data-backed gaps have a setup note before capture starts.
- [ ] Confirm each action screenshot has a corresponding non-submission boundary.
- [ ] Keep final status `parity-blocked` until a later evidence package explicitly promotes a narrower area.

## Known data already present in the current evidence

Confirmed from the current documents:

- Legacy database ready viewport, saved filters/lists, Add column, Bulk Actions initial/selected states, no-match search, and reset/clear screenshots exist.
- Greenfield database ready viewport, saved filters/lists, Add column, row selection, table sort, and first-row open action screenshots exist.
- Legacy detail ready viewport, More actions, Latest CV, Activity, Contracts, Tag action, and supplement captures for stage selector source, Forms & docs, Interview score, Comments, Emails, Reject, Email candidate, Interview scheduler, Send to hiring manager, Move job, Upload new CV control, and Score now exist.
- Greenfield detail ready viewport, stage selector, More actions, Latest CV, Activity, Comments, Documents, Forms, Contracts, Surveys, Feedback, Schedule, Offer/hire, Reject, Email/message, and Upload CV screenshots exist.

Missing or not yet reliable:

- Same candidate identity across both systems.
- Same job context across both systems.
- Same selected stage/status and equivalent stage option mapping.
- Same saved filter/list names, counts, sharing labels, and membership.
- Greenfield enabled Bulk Actions menu.
- Greenfield no-match search and reset/clear state.
- Legacy database account menu, stable table sort, and stable first-row table open action.
- Legacy opened native stage selector state without mutation.
- Legacy survey/custom-field equivalents for the seeded candidate.
- Greenfield custom fields tab/action and tag action.
- Equivalent populated/empty records for forms, documents, contracts, surveys, custom fields, comments, emails, CV, and feedback/interview score.
- Safe dry-run/test hooks for state changes and submit paths.

## Recapture sequencing recommendation

1. Align job, candidate, stage/status, saved filter/list, and bulk eligibility data before changing visual implementation.
2. Recapture the database ready, saved sections, Add column, row selection, Bulk Actions enabled, search no-match, reset, sort, and first-row open states.
3. Recapture candidate detail from job-origin context first; database-origin context can be captured separately.
4. Recapture data-backed tabs in this order: Latest CV, Activity, Comments/Emails, Forms & docs/Documents/Forms, Contracts, Surveys/Feedback, Custom fields if available.
5. Recapture open-only action flows: schedule, reject, email/message, review request, move job, upload CV, score now, offer/hire only if safe and non-submitted.
6. Update the gap register after recapture, but keep the V2 final decision `parity-blocked` unless a future evidence package explicitly narrows and promotes a sub-area.

## Final status

V2 Candidates remains **parity-blocked**.
