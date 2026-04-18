# Frontend Greenfield i18n Implementation Plan

## Purpose

This document turns the localization strategy into an implementation plan for `recruit-frontend`.

It answers:
- what code should be added first
- which files and folders should exist
- what is required to make the app Crowdin-ready without blocking R0 on full translation coverage

## Source baseline

Built on top of:
- `localization-strategy.md`
- `architecture.md`
- `conventions.md`
- current `recruit-frontend/package.json`

## Goal

The immediate goal is **translation readiness**, not full multilingual completion.

That means the app should:
- boot with an i18n provider
- resolve a default locale
- load locale resources from a stable path
- keep product strings out of route and component code
- be easy to connect to Crowdin sync

## Phase 1 — runtime foundation

### Task 1.1 — add app-level i18n bootstrap

Create:
- `../src/app/i18n.ts`

Responsibilities:
- initialize `i18next`
- register `react-i18next`
- define the default locale
- define fallback locale behavior
- load the initial resource bundles

Recommended default:
- source locale: `en`
- fallback locale: `en`

Acceptance:
- the app boots with a working i18n instance
- missing locale selection falls back safely to English

### Task 1.2 — wire i18n into app providers

Files:
- `../src/app/providers.tsx`

Responsibilities:
- ensure the i18n runtime is initialized before routed UI renders
- keep provider wiring centralized

Acceptance:
- routed screens can use `useTranslation()` without local bootstrapping

## Phase 2 — locale file structure

### Task 2.1 — create initial locale folders

Recommended structure:

```text
../src/locales/
  en/
    common.json
    auth.json
    shell.json
    dashboard.json
    inbox.json
  pt/
    common.json
    auth.json
    shell.json
    dashboard.json
    inbox.json
```

Minimum acceptable first step:

```text
../src/locales/
  en.json
  pt.json
```

Recommendation:
- if the app remains very small, start with flat files
- if you are already touching multiple domains, start split by domain now

Acceptance:
- locale resources live in one predictable folder
- English source files are ready for Crowdin sync

### Task 2.2 — define translation namespace policy

Suggested namespaces:
- `common`
- `auth`
- `shell`
- `dashboard`
- `inbox`
- later: `jobs`, `candidates`, `settings`, `reports`, `billing`

Acceptance:
- key ownership is obvious by domain
- no uncontrolled “misc” namespace appears

## Phase 3 — string externalization

### Task 3.1 — externalize current R0 visible strings

Start with these files:
- `../src/domains/auth/routes/public-pages.tsx`
- `../src/domains/dashboard/dashboard-page.tsx`
- `../src/domains/inbox/inbox-page.tsx`
- `../src/shell/notifications/notifications-page.tsx`
- `../src/shell/account/user-profile-overlay.tsx`
- `../src/shell/layout/authenticated-shell.tsx`
- `../src/shell/layout/public-shell.tsx`

Responsibilities:
- replace durable UI copy with translation keys
- keep temporary developer-only scaffolding minimal and clearly isolated

Acceptance:
- no durable R0 user-facing copy remains hardcoded in the key routed surfaces

### Task 3.2 — key naming discipline

Use keys like:
- `auth.publicHome.title`
- `auth.forgotPassword.title`
- `shell.notifications.title`
- `dashboard.home.title`
- `inbox.home.description`
- `shell.userProfile.close`

Do not use:
- sentence-as-key
- styling-driven names
- numbered placeholders like `title1`

Acceptance:
- new keys are semantic, stable, and domain-aware

## Phase 4 — Crowdin readiness

### Task 4.1 — add Crowdin config for `recruit-frontend`

Recommended files:
- `../crowdin.yml`
- optional `../crowdin-sync.sh`

Responsibilities:
- define English source locale path
- define target locale output paths
- keep sync separate from runtime code

Recommended direction:
- match the repository pattern already used by the legacy frontend
- keep the config simple and file-path based

Acceptance:
- locale files can be synced without changing app code
- Crowdin is an external workflow, not embedded in the runtime layer

### Task 4.2 — document source-locale ownership

Rule:
- English is the canonical source locale for new app strings

Acceptance:
- product and engineering know where new strings originate
- translators do not need to infer source content from mixed locales

## Phase 5 — validation

### Task 5.1 — smoke validation for i18n boot

Validate:
- app boots with default locale
- missing keys do not crash the app
- at least one routed surface renders through translations

### Task 5.2 — locale-switch readiness

Not required to expose a locale switch in R0.

But confirm:
- the runtime can support another locale bundle
- translated resources can be added without refactoring the app shell

## R0 minimum acceptance for i18n

R0 i18n is sufficient when:
- i18n runtime is initialized centrally
- English source locale exists
- at least one secondary locale file path exists or is reserved
- visible R0 routed surfaces do not rely on durable hardcoded product copy
- Crowdin-compatible locale structure is in place or explicitly scaffolded

## R1 / R2 extension rule

When implementing Jobs and Candidates:
- add new strings directly to locale files
- do not create new hardcoded product copy in feature code
- keep namespace ownership aligned with domains

## Recommended implementation order

1. create `src/app/i18n.ts`
2. wire i18n in `src/app/providers.tsx`
3. create `src/locales/` structure
4. externalize current R0 visible strings
5. add `crowdin.yml`
6. run smoke validation for translated boot

## Related documents

- `localization-strategy.md`
- `architecture.md`
- `conventions.md`
- `r0-code-closeout-checklist.md`
