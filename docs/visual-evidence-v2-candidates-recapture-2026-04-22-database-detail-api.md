# V2 Candidates Database → Detail API Recapture — 2026-04-22

## Purpose

This recapture records the greenfield V2 candidate database search handoff into candidate detail using real local API data. It validates that the first searched database row opens a detail page with the same candidate identity and preserves the return path back to the database search.

This pass does not claim legacy parity and does not mark V2 as Figma-ready.

## Capture setup

| Field | Value |
|---|---|
| Date | 2026-04-22 |
| Viewport | 1440 × 900 desktop |
| Greenfield system | `http://localhost:5173` |
| Backend API | `http://localhost:8000/api` |
| GraphQL API | `http://localhost:8888/graphql` |
| Evidence root | `docs/visual-evidence-assets/v2/recapture-2026-04-22-database-detail-api/` |
| Automation records | `docs/visual-evidence-assets/v2/recapture-2026-04-22-database-detail-api/recapture-records.json` |
| Status-column automation records | `docs/visual-evidence-assets/v2/recapture-2026-04-22-database-detail-api/status-column-records.json` |
| Credential handling | Credentials were used only for browser login and are not recorded in this log or in the automation records. |

## Flow covered

1. Open `/candidates-database` after API-backed login.
2. Search using the first candidate term: `Ben`.
3. Open the first result from the database table.
4. Validate candidate detail name, email, status, API-ready state, database entry mode, and database return target.
5. Click `Back to database` and validate the searched database URL is restored.

## Captured evidence

| Interaction | Evidence |
|---|---|
| Candidate database after search | `docs/visual-evidence-assets/v2/recapture-2026-04-22-database-detail-api/new/10-candidates-database-search-ready.png` |
| First searched result opened in candidate detail | `docs/visual-evidence-assets/v2/recapture-2026-04-22-database-detail-api/new/20-candidate-detail-api-ready.png` |
| Return to candidate database preserves search | `docs/visual-evidence-assets/v2/recapture-2026-04-22-database-detail-api/new/30-candidates-database-return-preserved.png` |
| Candidate database after enabling `Hiring flow stage` column | `docs/visual-evidence-assets/v2/recapture-2026-04-22-database-detail-api/new/40-candidates-database-search-stage-column-ready.png` |
| Candidate detail after opening first staged database result | `docs/visual-evidence-assets/v2/recapture-2026-04-22-database-detail-api/new/50-candidate-detail-api-ready-status-validation.png` |
| Return to candidate database after status validation | `docs/visual-evidence-assets/v2/recapture-2026-04-22-database-detail-api/new/60-candidates-database-return-after-status-validation.png` |

## Validation result

| Check | Result | Observed value |
|---|---|---|
| Database row name matches detail name | Passed | `Ben ApiSeed` |
| Database row email matches detail email | Passed | `api-seed-2-api-seed-1776815573-51263@example.test` |
| Detail status is populated | Passed | `Rejected` |
| Detail API state is ready | Passed | `API: ready` |
| Detail entry mode is database | Passed | `database` |
| Return target preserves database search | Passed | `/candidates-database?query=Ben` |
| Database status matches detail status after enabling the status/stage column | Passed | database `rejected`; detail `Rejected` |

## Notes

Confirmed:
- The database table is populated from the real local `/v2/cv` API path.
- The detail page is populated from the real local GraphQL candidate detail path.
- The first searched row and detail page agree on candidate name and email.
- The first searched row and detail page agree on candidate name, email, and status when the `Hiring flow stage` column is enabled.
- The detail page renders a real candidate status and reports `API: ready`.
- `Back to database` restores `/candidates-database?query=Ben`.

Still not claimed:
- Legacy side-by-side parity.
- Final visual parity of the status/stage column, because the database uses lowercase table text while detail uses title-case pill text; the normalized value matches, but the visual casing decision still belongs to parity/product review.
- Figma readiness for V2 candidates.
