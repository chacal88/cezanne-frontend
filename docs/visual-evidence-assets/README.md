# Visual Evidence Assets

This directory stores captured visual evidence grouped by package and evidence status.

## Directory contract

- `v0/current/` — canonical current greenfield captures for V0 auth, shell, dashboard, notifications, and inbox.
- `v0/legacy/` — canonical legacy/reference captures for V0.
- `v0/superseded/` — retained captures that must not be used for implementation, such as popup-obscured or pre-fix states.
- `v1/current/` — canonical current greenfield captures for V1 jobs.
- `v1/legacy/` — legacy/reference captures for V1 jobs. Some are reference-only when the legacy page exposes mostly shell.
- `v1/superseded/` — retained captures that must not be used for implementation, such as denied captures superseded by capability-seeded captures.
- `v2/current/` — canonical current greenfield product-composition captures for covered V2 candidate database, detail hub, panel, and action launcher states.
- `v2/legacy/` — canonical legacy/reference captures for V2 candidates.
- `v2/superseded/` — retained V2 captures that must not be used for implementation, such as redirected or wrong-surface captures.

Use the package evidence logs as the source of truth for which images are canonical:

- `../visual-evidence-v0-auth-shell-dashboard.md`
- `../visual-evidence-v1-jobs.md`
- `../visual-evidence-v2-candidates.md`

Do not implement from files in any `superseded/` directory.
