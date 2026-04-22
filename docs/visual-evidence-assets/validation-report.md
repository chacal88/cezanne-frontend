# Visual Evidence Asset Validation Report

## Validation status

Validated after grouping the V0, V1, and V2 screenshot assets and after recapturing V2 candidate product-composition current evidence. All referenced files in the V0/V1/V2 evidence logs exist, all PNG files report readable dimensions, and no flat visual-evidence-assets PNG references remain in package docs.

## Canonical directories

| Package | Current canonical | Legacy/reference | Superseded / do not implement |
|---|---|---|---|
| V0 | `v0/current/` | `v0/legacy/` | `v0/superseded/` |
| V1 | `v1/current/` | `v1/legacy/` | `v1/superseded/` |
| V2 | `v2/current/` | `v2/legacy/` | `v2/superseded/` |

## Superseded files

| File | Reason | Replacement |
|---|---|---|
| `v0/superseded/greenfield-logout-seeded-session-1440x900.png` | Pre-fix logout capture fell through to access denied. | `v0/current/greenfield-logout-stable-logged-out-1440x900.png` |
| `v0/superseded/legacy-dashboard-authenticated-seeded-user-1440x900.png` | Legacy dashboard was obscured by a popup. | `v0/legacy/legacy-dashboard-authenticated-seeded-user-clean-1440x900.png` |
| `v1/superseded/greenfield-v1-job-schedule-1440x900.png` | Schedule route was captured with denied access due to insufficient seeded capability. | `v1/current/greenfield-v1-job-schedule-dev-capability-1440x900.png` |
| `v2/superseded/legacy-v2-candidate-detail-seeded-id-34-redirected-dashboard-1440x900.png` | Direct legacy `/candidate/34` redirected to dashboard and did not show candidate detail. | `v2/legacy/legacy-v2-candidate-detail-job-context-seeded-id-34-job-13-1440x900.png` |

## Implementation rule

Implementation and Figma work must use only files referenced by the package evidence logs and must never use files under a `superseded/` directory. For V2, `current/` images are product-composition evidence for covered rows only; deferred provider/schema/terminal variants still require separate evidence before promotion.
