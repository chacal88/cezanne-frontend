# Greenfield Frontend Navigation and Return Behavior

## Purpose

This document defines the navigation, deep-link, refresh, back-button, and close/cancel behavior contract for the greenfield frontend.

## Source baseline

Synthesized from:
- `./screens.md`
- `./notification-destinations.md`
- `../../docs/frontend-2/frontend-url-and-history-behavior-spec.md`
- `../../docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`
- `../../docs/frontend-2/frontend-modal-and-child-route-classification.md`
- `../../frontend/src/app/pages/job/job.route.js`
- `../../frontend/src/app/domain/job/candidate/candidate.route.js`
- `../../frontend/src/app/domain/user/user-profile/user-profile.route.js`

## Global rules

1. Every route must declare direct-entry support.
2. Every route must declare refresh behavior.
3. Every overlay/task route must declare close/cancel target.
4. Every notification destination must declare fallback behavior.
5. No route may rely on implicit browser history alone for critical return behavior.

## Behavior matrix by route class

| Route class | Direct entry | Refresh | Back button | Close / cancel |
|---|---|---|---|---|
| `Page` | fully supported | rebuild route state | normal page history | not applicable |
| `PageWithStatefulUrl` | fully supported | must rebuild from URL | restore prior page state where possible | not applicable |
| `RoutedOverlay` | supported when currently addressable | reload into usable parent + overlay state | one step should usually close overlay | return to stable parent route |
| `ShellOverlay` | supported only through shell-aware behavior | rebuild shell then overlay | one step should close overlay | return to prior shell page or dashboard |
| `TaskFlow` | supported if in current scope | reload into usable task context or explicit parent fallback | one step should leave the task and return | explicit parent return |
| `Public/Token` | fully supported | preserve token interpretation | standard page history | not modal-based |

## Route-family matrix

| Route family | Direct entry | Refresh | Back | Close/cancel |
|---|---|---|---|---|
| auth/token routes | full | preserve token/callback state | standard | route navigation only |
| dashboard | full | rebuild shell + dashboard | standard | n/a |
| notifications | full | rebuild shell + notifications | standard | n/a |
| inbox | full | preserve selected conversation from URL | respect conversation/page history | n/a |
| jobs list | full | preserve scope/page/search/asAdmin/label | return from detail should restore meaningful list state | n/a |
| job detail | full | preserve `section` and job context | back should respect prior source | child actions return here |
| candidate detail | full | preserve candidate/job/workflow context as far as encoded in URL | back should respect prior source | child actions return here |
| job overlays/tasks | direct URL supported | reconstruct parent + task context or parent fallback | one step closes task | return to job detail |
| candidate tasks | direct URL supported | reconstruct parent + task context or parent fallback | one step closes task | return to candidate detail |
| user-profile | shell-aware direct entry only | rebuild shell then open overlay | one step closes overlay | return to prior route or dashboard |
| billing card | shell/billing-aware direct entry | rebuild billing context then overlay | one step closes overlay | return to billing overview |
| public/external token flows | full | preserve token state | standard | route navigation only |
| integrations token-entry | full | preserve token state | standard | route navigation only |

## Parent-return rules

### Job task flows

Parent target:
- `/job/:id?section`

Examples:
- CV view
- bid view
- schedule interview
- offer
- reject

Rule:
- if the task closes without redirecting elsewhere, return to the job hub
- refresh parent if the task may have changed visible state

### Candidate task flows

Parent target:
- `/candidate/:id/:job?/:status?/:order?/:filters?/:interview?`

Rule:
- preserve candidate/job/workflow params when returning
- do not drop back to a generic candidate surface if contextual params exist

### Shell overlays

Parent target:
- current shell route if known
- otherwise `/dashboard`

Rule:
- `user-profile` and similar shell overlays must not strand the user on an overlay-only URL

## Notification-entry rules

- notification entry may land directly on a page, overlay, or task flow
- if the target is denied or missing, fallback must be typed and stable
- browser back from a notification-opened overlay should usually close one layer, not eject the user to an unrelated origin

## Required implementation helpers

- route-aware return target builder
- stateful URL serializer/parser for jobs, candidate, inbox
- typed parent-refresh rules for task success/cancel/failure
- notification fallback resolver

## Planning rule

No routed overlay or task flow is ready for implementation until its parent-return and refresh behavior is explicitly defined here or in a referenced extension.
