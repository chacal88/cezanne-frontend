## Why

R5 platform foundations are now in place, leaving requisition authoring as the next release slice. R1 introduced minimum `jobRequisition` branching in Jobs authoring; this change adds explicit requisition authoring and workflow administration route foundations without replacing Jobs create/edit behavior.

## What Changes

- Implement `/build-requisition` as a Jobs-side requisition task flow.
- Implement `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` as Jobs workflow-state routes.
- Implement `/requisition-workflows` as settings/hiring-flow workflow administration.
- Add deterministic draft, save, submit, workflow drift, and stale-state helpers without backend persistence.
- Keep Jobs authoring and hiring-flow settings ownership separate.

## Capabilities

### New Capabilities
- `requisition-authoring-routes`: Jobs-side requisition authoring route metadata, state, fallback, and parent-return behavior.
- `requisition-workflows-settings`: Hiring-flow workflow administration route metadata, state, and settings ownership behavior.

### Modified Capabilities
- `frontend-testing-baseline`: Extend validation coverage to requisition route metadata, capability boundaries, stale-state helpers, and R1 Jobs authoring separation.

## Impact

- Affected docs: `docs/r5-requisition-authoring-open-points.md`, `docs/r5-master-plan.md`, `docs/screens.md`, `docs/capabilities.md`, `docs/navigation-and-return-behavior.md`, and `docs/testing.md`.
- Affected code: `src/domains/jobs/**`, `src/domains/settings/**`, `src/lib/routing/**`, `src/lib/access-control/**`, `src/app/router.tsx`, locale files, and tests.
- No backend requisition API, autosave persistence, notification destination changes, or workflow engine integration is included.
