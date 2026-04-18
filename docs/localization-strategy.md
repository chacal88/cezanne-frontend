# Frontend Greenfield Localization Strategy

## Purpose

This document defines the localization and translation strategy for `recruit-frontend`.

It answers:
- what is mandatory in R0 versus later releases
- how Crowdin should fit the stack
- which implementation rules keep the app translation-ready from the start

## Source baseline

Built on top of:
- `architecture.md`
- `conventions.md`
- existing repository localization signals in `../../frontend/`
- current `recruit-frontend/package.json`

## Decision

Localization support is **mandatory from the beginning**.

Full multi-language coverage is **not** required to close R0.

The app must therefore ship with:
- an i18n runtime foundation
- string externalization rules
- stable translation keys
- a translation-file structure compatible with Crowdin

The app does **not** need to ship with:
- complete translated coverage for every route in R0
- all locales fully populated before Jobs (`R1`) or Candidates (`R2`)

## Why this is the right trade-off

The repository already shows that localization is part of the platform shape:
- the legacy frontend uses Crowdin-backed translation files
- the new app already includes `i18next`, `react-i18next`, and `@crowdin/cli`

Deferring localization architecture would create avoidable churn later:
- hardcoded strings would need broad refactors
- route, shell, and validation text would become unstable to migrate
- Crowdin integration would arrive after the app has already formed bad habits

## R0 requirements

R0 must include:

1. **i18n foundation**
   - one initialized translation runtime
   - one default locale
   - one app-level provider

2. **externalized UI strings**
   - no new product copy hardcoded directly into route or component bodies unless clearly temporary scaffolding

3. **stable translation keys**
   - keys must be semantic and domain-aware
   - avoid using raw English sentences as keys

4. **Crowdin-compatible file structure**
   - source locale file(s) must be easy to sync
   - target locale files must follow a predictable path

5. **fallback behavior**
   - missing translations must degrade safely to the default locale
   - the app must not break when a key is missing

## Not required in R0

R0 does not need:
- full translation coverage across every route
- translation QA for every future release slice
- locale-specific copy refinement for still-unimplemented domains

## Recommended implementation model

### Runtime

Use:
- `i18next`
- `react-i18next`
- browser language detection only where it does not conflict with explicit product rules

### Source locale

Use English as the source locale.

Reason:
- repository policy already requires new artifacts in English
- Crowdin workflows are simpler when one source language is canonical

### File structure

Recommended shape:

```text
src/locales/
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

Alternative acceptable shape:

```text
src/locales/en.json
src/locales/pt.json
```

Recommendation:
- start simple if needed
- move to domain-split files before the app grows too large

## Key conventions

Prefer keys like:
- `auth.signIn.title`
- `shell.notifications.empty`
- `dashboard.landing.title`
- `inbox.conversation.missing`

Avoid:
- `title1`
- `buttonBlue`
- full English sentence keys

## Crowdin strategy

Crowdin should be treated as the translation transport layer, not as app architecture.

Meaning:
- app code depends on i18n runtime and keys
- Crowdin sync depends on locale files and CLI/config
- product code should not depend on Crowdin-specific APIs

## Release policy

### R0
- foundation mandatory
- partial translation coverage acceptable
- all new strings must be externalizable and compatible with Crowdin

### R1 / R2
- Jobs and Candidates should follow the same rule: no new hardcoded product copy
- translation coverage can expand per release, but key discipline must already exist

### R3+
- public and tokenized surfaces should receive stronger translation discipline because they may become externally visible

## Conventions for implementation

Use these rules in code:
- keep strings in locale files, not route files
- translate validation and empty/error states too, not only headings
- do not build keys dynamically in ways that break extraction discipline unless the pattern is explicit and bounded
- keep one default fallback locale configured centrally

## Testing expectation

At minimum:
- app boots with the default locale
- missing keys degrade safely
- at least one smoke test proves translated rendering does not crash a routed screen

## Related documents

- `architecture.md`
- `conventions.md`
- `skills.md`
