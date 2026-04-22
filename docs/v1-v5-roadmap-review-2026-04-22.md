# V1-V5 Roadmap Review Closeout - 2026-04-22

## Purpose

This document records the review requested after V1 through V5 were implemented. It verifies each roadmap slice against the active docs package, route metadata, runtime source, evidence logs, and validation commands.

Confirmed facts are separated from deferred product depth. This file does not replace `roadmap.md`, `screens.md`, `pre-figma-flow-review.md`, or the visual evidence logs; it is the audit summary that links them together.

Update from product direction on 2026-04-22: the whole project requires pixel parity with the legacy frontend wherever a legacy screen/state exists. The decisions below that say `Figma-ready` or screen-flow handoff are drafting/readiness decisions only; they are not production replacement approval.

## Verification commands

| Command | Result | Notes |
|---|---|---|
| `npm run build` | Passed | TypeScript build and Vite production build completed. Vite emitted only the existing large chunk warning. |
| `npm test` | Passed | 102 test files and 422 tests passed. |
| `npm run smoke:r0:ui` | Passed | 28 Playwright smoke tests passed after updating the harness to seed the current local auth session contract and deterministic candidate API mocks. |
| `npm test -- --runInBand` | Not applicable | Failed before running tests because Vitest does not support the Jest `--runInBand` flag. Retried with the project-supported `npm test`. |

## Source contracts checked

| Contract | Evidence |
|---|---|
| Canonical route list | `src/lib/routing/route-contracts.ts` |
| Route registration | `src/app/router.tsx` |
| Route metadata and capabilities | `src/lib/routing/route-metadata.ts` plus `src/lib/routing/route-metadata.test.ts` |
| Capability catalog | `docs/capabilities.md` |
| Screen inventory | `docs/screens.md` |
| Flow readiness | `docs/pre-figma-flow-review.md` |
| Visual evidence | `docs/visual-evidence-v1-jobs.md`, `docs/visual-evidence-v2-candidates.md`, `docs/visual-evidence-v3-public-external-token.md`, `docs/visual-evidence-v4-operations.md`, `docs/visual-evidence-v5-sysadmin-platform.md` |

## Release review matrix

| Release | Roadmap scope reviewed | Runtime/doc verification | Current audit decision |
|---|---|---|---|
| V1 / R1 Jobs | Jobs list, authoring, detail hub, bid/CV/schedule/offer/reject task routes, requisition adjacency | Jobs routes are registered, metadata marks them implemented, route tests cover list/detail/task/requisition contracts, V1 visual evidence covers screen-flow bases. | Closed for route/state/screen-flow basis. Final replacement remains blocked until legacy pixel parity is confirmed. Backend form schemas, provider-specific scheduling/publishing details, and exact production table fields remain deferred annotations. |
| V2 / R2 Candidates | Candidate detail, candidate actions, database/search, upload/documents/contracts/surveys/collaboration summaries | Candidate route arrays, database route, action routes, adapters, and tests are present. V2 evidence captures current behavior but records legacy parity blockers. First parity pass improved database/list density, route-owned modal task composition, legacy detail action modal entries, and recapture seed parity for Finn/Diego/API-seed-style data. | Closed for implementation behavior coverage, not promoted to final Figma-ready parity. Candidate visual parity remains blocked until side-by-side layout/modal mismatches are resolved; product direction is no unapproved deviations. |
| V3 / R3 Public/external/token | External chat, interview request/review/feedback, shared job/application, survey, requisition approval/forms, integration token entries, careers/application/job-listing settings | Public/token routes and integration callbacks are registered and implemented. V3 evidence includes desktop, mobile, narrow, lifecycle, and follow-up captures; `pre-figma-flow-review.md` now promotes V3 covered rows to Figma-ready screen-flow bases. | Closed for screen-flow/base-frame Figma handoff with backend/API/schema details deferred. Final replacement remains blocked until legacy/reference pixel parity is confirmed where legacy exists. |
| V4 / R4 Operations | Candidate database, settings, integrations admin, reports, billing, team, favorites, marketplace | Operations routes are registered and implemented across settings/integrations/reports/billing/team/favorites/marketplace. V4 evidence includes authenticated baseline plus safe local-fixture interaction captures for required state variants. | Closed for current-app screen-flow Figma handoff. Final replacement remains blocked until legacy pixel parity is confirmed. Backend schemas, provider credentials/diagnostics, payment fields, report metrics, invite/favorite/marketplace payloads remain non-inventable. |
| V5 / R5 Platform + long-tail | SysAdmin users, favorite-request queue, master data, company subscription, taxonomy, requisition workflows, API endpoints, forms/download, settings leftovers, token reconciliation | R5 route families are registered and metadata marks them implemented. V5 evidence captures all currently reachable SysAdmin/platform route shells and the non-SysAdmin fallback boundary. | Closed for foundation route/runtime coverage. Not Figma-ready: non-ready/mutation/terminal/not-found/stale/permission states need backend/API states, fixture hooks, or accepted omissions. |

## Item-by-item status

### V1 Jobs

| Item | Status | Evidence |
|---|---|---|
| Jobs list stateful URL | Verified | `/jobs/$scope`, `JobsListPage`, list/search validation tests, V1 evidence. |
| Authoring create/edit/reset workflow | Verified | `/jobs/manage`, `/jobs/manage/$jobId`, authoring adapter/product-depth tests, V1 evidence. |
| Job detail hub | Verified | `/job/$jobId`, detail page/search validation, V1 evidence. |
| Bid/CV/schedule/offer/reject task routes | Verified | `/job/$jobId/bid*`, `/job/$jobId/cv*`, schedule/offer/reject metadata and task context tests. |
| Requisition adjacency from Jobs | Verified | `/build-requisition`, `/job-requisitions/$jobWorkflowUuid`, requisition state/routing tests. |

### V2 Candidates

| Item | Status | Evidence |
|---|---|---|
| Candidate detail dense route family | Verified | `candidateDetailRoutePaths`, detail page, routing/product-depth tests. |
| Candidate schedule/offer/reject task families | Verified | `candidateScheduleRoutePaths`, `candidateOfferRoutePaths`, `candidateRejectRoutePaths`, action context tests. |
| Candidate database/search | Verified | `/candidates-database`, database page, database routing tests. |
| Documents/contracts/surveys/collaboration panels | Verified for behavior seams | Candidate support modules and tests. Backend schemas remain deferred. |
| Project-wide visual parity | Blocked for replacement approval | `visual-evidence-v2-candidates.md` keeps candidate rows behavior-evidenced but parity-blocked; other release rows may be Figma-ready for drafting but still need replacement pixel-parity signoff where legacy exists. |

### V3 Public/external/token

| Item | Status | Evidence |
|---|---|---|
| External chat | Figma-ready for screen-flow basis | `/chat/$token/$userId`, external chat tests, V3 evidence. |
| Interview request/review/feedback | Figma-ready for screen-flow basis | `/interview-request`, `/review-candidate`, `/interview-feedback`, V3 evidence. |
| Shared job and public application | Figma-ready for screen-flow basis | `/shared/*`, `/$jobOrRole/application/*`, V3 evidence. |
| Public survey | Figma-ready for screen-flow basis | `/surveys/*`, public survey workflow tests and V3 evidence. |
| Requisition approval/forms download | Figma-ready for screen-flow basis | `/job-requisition-approval`, `/job-requisition-forms/$formId`, forms/approval tests and V3 evidence. |
| Integration token entries | Figma-ready for screen-flow basis | `/integration/cv/*`, `/integration/forms/*`, `/integration/job/*`, token-entry tests and V3 evidence. |

### V4 Operations

| Item | Status | Evidence |
|---|---|---|
| Settings and operational settings | Figma-ready for current-app screen-flow basis | Careers/application/job-listing, hiring-flow, custom-fields, templates, reject-reasons, API endpoints, forms/docs, parameters compatibility captures. |
| Integrations admin | Figma-ready for current-app screen-flow basis | `/integrations`, `/integrations/$providerId`, provider setup tests and V4 interactive captures. |
| Reports | Figma-ready for current-app screen-flow basis | `/report`, `/report/$family`, `/hiring-company/report*`, report-state tests and V4 captures. |
| Billing | Figma-ready for current-app screen-flow basis | `/billing`, `/billing/upgrade`, `/billing/sms`, `/billing/card/$cardId`, billing-state tests and V4 captures. |
| Team/users invite | Figma-ready for current-app screen-flow basis | `/team`, `/team/recruiters`, `/users/invite`, team foundation tests and V4 captures. |
| Favorites and marketplace | Figma-ready for current-app screen-flow basis | `/favorites*`, `/jobmarket/$type`, support tests and V4 captures. |

### V5 Platform + long-tail

| Item | Status | Evidence |
|---|---|---|
| Platform users | Foundation verified; not Figma-ready | `/users*`, users/request support, V5 evidence. |
| Platform favorite requests | Foundation verified; not Figma-ready | `/favorites-request*`, V5 evidence. |
| Platform master data | Foundation verified; not Figma-ready | `/hiring-companies*`, `/recruitment-agencies*`, `/subscriptions*`, V5 evidence. |
| Company subscription admin | Foundation verified; not Figma-ready | `/hiring-company/$companyId/subscription`, V5 evidence. |
| Platform taxonomy | Foundation verified; not Figma-ready | `/sectors*`, `/subsectors/$subsectorId`, V5 evidence. |
| Settings/API/forms/download leftovers | Verified in route/runtime contracts | `/settings/api-endpoints`, `/settings/forms-docs`, `/job-requisition-forms/$formId`, related tests and docs. |

## Open follow-ups

| Area | Follow-up |
|---|---|
| V2 candidate visual parity | Resolve legacy parity blockers before final Figma-ready promotion. Product direction on 2026-04-22 is full parity; deviations are not accepted unless a future explicit product exception names the gap. The latest parity-pass recapture now uses comparable Finn/Diego/API-seed data, but database geometry, detail proportions, and legacy action modal/editor composition are still open. |
| V5 platform visual depth | Add backend/API-backed states, fixture/test-hook exposure, or product-approved omissions for non-ready, mutation, terminal, stale, not-found, and permission-denied states. |
| Backend/API schemas | Keep production schemas for settings, reports, provider setup, payment, platform users/master data/taxonomy, candidate data, public applications, and token payloads marked as deferred until contracts exist. |
| Figma handoff | Proceed only for rows currently promoted by evidence: V0/V1 covered bases, V3 public/token bases, and V4 operations current-app bases. Treat this as drafting permission, not replacement approval. |
| Project-wide pixel parity | Add matched legacy/current/Figma comparison before production replacement for every legacy-backed route/state. Unapproved differences are blockers unless a future product decision names the exception and affected route/family/gap id. |

## Audit conclusion

V1 through V5 are implemented and documented at the route, metadata, capability, and tested runtime foundation level. V3 and V4 are ready for Figma screen-flow/base-frame drafting with deferred backend/provider/schema annotations. V2 remains behavior-covered but visual-parity blocked. V5 remains foundation-complete but not Figma-ready until platform state depth is added or a product-approved omission is recorded. No legacy-backed route is production replacement-approved until pixel parity is confirmed or explicitly excepted by product.
