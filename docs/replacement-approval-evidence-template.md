# Replacement Approval Evidence Template

## Purpose

Use this template when creating a route or family-specific replacement approval evidence pack after Figma/screen-flow production.

Templates do not grant approval. Copy this structure into a route/family evidence record, fill every required field with matched evidence, and keep the final decision `blocked` until the approver confirms either pixel parity or a documented product exception.

This template must not be used to change route ownership, route status, capability behavior, or `Figma-ready` status by itself.

## Evidence Pack Metadata

| Field | Value |
|---|---|
| Route/family | TBD |
| Exact state | TBD |
| Release/version | TBD |
| Route class | TBD |
| Owning visual contract | TBD |
| Owning evidence log | TBD |
| Legacy screenshot/reference path | TBD |
| Current screenshot/reference path | TBD |
| Figma frame/node reference | TBD |
| Viewport | TBD |
| Data seed / matched state | TBD |
| Backend/API readiness | TBD |
| Product exception id, if any | TBD |
| Final decision | `blocked` |
| Approver | TBD |
| Approval date | TBD |

## Evidence Requirements

| Evidence item | Status | Notes |
|---|---|---|
| Canonical route/family matches `pre-figma-flow-review.md` and `screens.md` | TBD | Confirm the route pattern and do not approve aliases as standalone replacement targets. |
| Exact state is named and reproducible | TBD | Include loading/ready/error/submitting/terminal/read-only variant names where applicable. |
| Legacy/reference evidence is attached where a legacy state exists | TBD | Use the current legacy frontend as visual/business source of truth until replacement is approved. |
| Current-app evidence is attached for the same state | TBD | Use the same viewport, state, and seed as the legacy/reference capture. |
| Figma frame/node is attached for the same state | TBD | The frame must represent the route/state being approved, not a nearby flow. |
| Viewport is identical across legacy/current/Figma comparisons | TBD | Record width, height, browser/device assumptions, and zoom if relevant. |
| Data seed / matched state is identical or explicitly mapped | TBD | Record user/persona, org, route params, query params, fixture/API seed, and state hooks. |
| Backend/API readiness is classified | TBD | Mark ready, partial, blocked, fixture-backed, unavailable, or not applicable; do not invent payload fields. |
| Sensitive data is redacted | TBD | Exclude credentials, tokens, auth codes, signed URLs, message bodies, documents, provider payloads, and raw tenant-sensitive payloads. |

## Visual Parity Checklist

| Check | Status | Notes |
|---|---|---|
| Page/shell composition matches | TBD | Sidebar, topbar, footer, modal/drawer boundaries, public/token shell separation. |
| Layout geometry matches | TBD | Widths, gutters, table columns, card proportions, scroll areas, empty space, fixed/sticky regions. |
| Spacing matches | TBD | Section spacing, control gaps, row heights, form grouping, modal padding, list density. |
| Typography matches | TBD | Font family, size, weight, line height, label hierarchy, helper/error copy placement. |
| Color and surface treatment match | TBD | Backgrounds, borders, dividers, statuses, disabled states, focus/hover treatment when visible. |
| Icons and action placement match | TBD | Icon choice, alignment, button order, primary/secondary/destructive action placement. |
| Form/table/navigation states match | TBD | Tabs, filters, pagination, menus, validation, loading, empty, error, retry, success, terminal states. |
| Copy differences are documented | TBD | Copy changes require product acceptance unless they are already confirmed source behavior. |
| All visual differences are resolved or exceptioned | TBD | Unapproved differences keep the final decision `blocked`. |

## Responsive/Mobile Checklist

| Check | Status | Notes |
|---|---|---|
| Required responsive viewport(s) are defined | TBD | Record whether approval covers desktop only, mobile only, or multiple breakpoints. |
| Mobile/current evidence exists where in scope | TBD | Do not imply mobile approval from desktop-only evidence. |
| Legacy/reference mobile evidence exists where in scope | TBD | If unavailable, record the product decision for the reference source. |
| Figma mobile frame exists where in scope | TBD | Must match the same route/state/seed. |
| Navigation and overflow behavior match | TBD | Menus, drawers, modals, tables, horizontal scroll, sticky actions, and back/close behavior. |
| Text and controls fit without overlap | TBD | Long labels, validation messages, table cells, cards, and buttons must fit at the approved viewport. |
| Responsive differences are fixed or exceptioned | TBD | Unapproved responsive differences keep the final decision `blocked`. |

## Product Exception

Use this section only when product explicitly accepts a visual, behavior, responsive, or backend/API deviation for this route/family/state.

| Field | Value |
|---|---|
| Exception needed? | TBD |
| Exception id | TBD |
| Affected route/family/gap id | TBD |
| Affected state(s) | TBD |
| Deviation summary | TBD |
| Product rationale | TBD |
| Scope of acceptance | TBD |
| Follow-up owner/date, if any | TBD |

## Final Decision

Choose exactly one final decision:

| Decision | Meaning |
|---|---|
| `blocked` | Required evidence is missing, parity is not proven, backend/API readiness blocks replacement, or unapproved differences remain. |
| `product-exception-needed` | The pack has enough evidence to identify a specific accepted-deviation request, but the exception is not yet approved. |
| `Pixel-parity-approved` | Matched legacy/current/Figma evidence proves the approved state is visually equivalent, or all differences are covered by an approved product exception. |

Final decision: `blocked`

Approver:

Approval date:

## Change Log

| Date | Author | Change |
|---|---|---|
| TBD | TBD | Initial route/family evidence pack created from template. |
