# V0 `/logout` Replacement Evidence Record

## Purpose

This is the first focused replacement approval evidence pack for V0 `/logout`.

It tests the full replacement approval process without changing route ownership or approving any other V0-V5 route.

## Decision

| Field | Value |
|---|---|
| Route | `/logout` |
| Version | V0 / R0 |
| Owner | `shell` / `session` |
| Route ownership change | None |
| Target viewport | Desktop `1440x900`, device scale factor `1` |
| Data/session state | Authenticated or stale-authenticated user enters `/logout`; post-action public session |
| Replacement decision | Product-exception-needed |
| Pixel-parity-approved | No |
| Other routes approved | No |

`/logout` cannot be marked `Pixel-parity-approved` from this pack because the matched evidence does not yet include a canonical Figma frame and the current implementation intentionally differs from the legacy route handoff: legacy redirects away from `/logout` to `/`, while current renders a stable logged-out public page at `/logout`.

## Required sources read

| Source | Evidence used |
|---|---|
| `docs/replacement-approval-audit-v0-v5.md` | Names V0 `/logout` as the recommended first approval candidate and requires matched legacy/current/Figma evidence before approval. |
| `docs/pre-figma-flow-review.md` | Marks `/logout` as `Figma-ready`, not replacement-approved, and requires matched legacy/current/Figma parity or product exception. |
| `docs/v0-auth-shell-dashboard-visual-contract.md` | Defines logout/session-loss frame requirements and keeps `/logout` as shell/session `Page`, not an account overlay. |
| `docs/visual-evidence-v0-auth-shell-dashboard.md` | Records current stable `/logout` evidence plus separate `/session-lost` evidence. |
| `/Users/kauesantos/Documents/recruit/frontend/src/app/pages/_main/main.route.js` | Confirms legacy `/logout` route and action-only `onEnter` behavior. |

## Legacy evidence

| Evidence item | Value |
|---|---|
| Route registration | `/Users/kauesantos/Documents/recruit/frontend/src/app/pages/_main/main.route.js` registers state `logout` at URL `/logout`. |
| Entry point | `/Users/kauesantos/Documents/recruit/frontend/src/app/pages/_main/main.html` links account menu sign-out to `ui-sref="logout"`. |
| Logout action | `/Users/kauesantos/Documents/recruit/frontend/src/app/domain/login/login.service.js` clears user, token, onboard token, app language storage, and notification state. |
| Route handoff | `LoginService.logout()` redirects with `window.location.href = '/'` when a state exists; it does not render a stable `/logout` page. |
| Visible post-logout state | Public login entry at `/`, using the legacy login surface. |
| Legacy screenshot | No standalone legacy `/logout` screenshot exists in the current pack because the route redirects immediately. Existing legacy login references are `docs/visual-evidence-assets/v0/legacy/legacy-root-1440x900.png` and `docs/visual-evidence-assets/v0/legacy/legacy-login-filled-seeded-user-1440x900.png`. |

Confirmed legacy behavior: `/logout` is an action route. The observable visual state after logout is the public login page, not a route-local logged-out confirmation page.

## Current evidence

| Evidence item | Value |
|---|---|
| Router | `src/app/router.tsx` registers `/logout` under the public layout. |
| Metadata | `src/lib/routing/route-metadata.ts` keeps `/logout` owned by `shell` / `session`, route class `Page`, required capability `canLogout`, fallback `/`. |
| Runtime implementation | `src/domains/auth/routes/public-pages.tsx` renders `LogoutPage`, clears local auth session, resets access context to public, emits safe logout telemetry, and links back to `/`. |
| State model | `src/domains/auth/models/session-foundation.ts` resolves `{ kind: 'logged-out', landingTarget: '/' }`. |
| Current screenshot | `docs/visual-evidence-assets/v0/current/greenfield-logout-stable-logged-out-1440x900.png` |
| Current manifest | `docs/visual-evidence-assets/v0/v0-capture-manifest.json`, record `greenfield-logout-stable-logged-out-1440x900`, status `200`, final URL `/logout`, body text `Logout Signed-out exit route. Go to login logged-out /`. |
| Superseded current screenshot | `docs/visual-evidence-assets/v0/superseded/greenfield-logout-seeded-session-1440x900.png` is explicitly superseded because it showed access denied after session clearing. |
| Session-loss comparison state | `docs/visual-evidence-assets/v0/current/state-hooks/greenfield-session-loss-session-expired-1440x900.png`; separate from explicit `/logout`. |

Confirmed current behavior: `/logout` is now a stable public/session page that clears session state and presents a route-local logged-out message with a link to `/`.

## Figma evidence

| Evidence item | Value |
|---|---|
| Canonical Figma frame | Placeholder only; no canonical `/logout` or logged-out/session transition frame is attached in this repository. |
| Existing Figma references | `docs/screen-design-flow-matrix.md` names login frame file `Z3PdFzZu8uahyibzALIAN0`, node `1:2`; authenticated shell frame is still `pending`. |
| Required placeholder | `FIGMA-TODO-V0-LOGOUT-001`: Create a desktop `1440x900` logout/session handoff frame that explicitly chooses either legacy-style immediate login handoff or product-approved route-local logged-out page. |

Figma-ready status remains valid for drafting, but replacement approval is blocked until the placeholder is replaced by a canonical frame/node reference and compared against legacy/current evidence.

## Parity comparison

| Area | Legacy `/logout` | Current `/logout` | Parity result |
|---|---|---|---|
| Route ownership | Shell/session action from main authenticated layout. | Shell/session page in metadata and public layout runtime. | Ownership preserved at domain/module level; route class differs because current intentionally renders a page. |
| Entry | Account menu sign-out link. | Account menu logout link through shell navigation. | Matched intent. |
| Session clearing | Clears user, token, onboard token, app language storage, and notification state. | Clears local auth session and resets access context to public. | Functionally aligned; exact storage keys differ by app architecture. |
| Route handoff | Redirects to `/`; `/logout` is not stable as a visual destination. | Remains on `/logout` and displays a logged-out page with link to `/`. | Delta requiring product exception or implementation change. |
| Visible copy | Legacy observable state is login copy after redirect. | `Logout`, `Signed-out exit route.`, `Go to login`, state `logged-out`. | Delta requiring product exception or copy/layout change. |
| Layout | Legacy observable post-logout layout is the login page. | Current route-local public auth shell/logout message. | Delta requiring product exception or implementation change. |
| Session-loss separation | Legacy service logout is also used from some auth/error paths. | `/session-lost` is separate and visually captured. | Current is clearer, but still a product delta unless accepted for replacement. |
| Figma | No logout frame attached. | No logout frame attached. | Blocked for final parity. |

## Product exception needed

| Exception id | Route | Delta | Required decision |
|---|---|---|---|
| `V0-LOGOUT-EXCEPTION-001` | `/logout` | Keep the current stable route-local logged-out page instead of matching legacy immediate redirect to `/`. | Product must explicitly accept route-local confirmation copy/layout, or implementation must change to legacy-style immediate login handoff. |
| `V0-LOGOUT-EXCEPTION-002` | `/logout` | Current copy `Logout / Signed-out exit route. / Go to login` has no legacy route-local equivalent. | Product must approve final copy or require the visible state to be the login page only. |

## Approval checklist

| Item | Status | Notes |
|---|---|---|
| Legacy route behavior captured or referenced | Done | Source-confirmed action route with immediate redirect. |
| Current route behavior captured or referenced | Done | Stable current screenshot and manifest record exist. |
| Matched viewport | Partial | Current screenshot is `1440x900`; legacy route has source-confirmed redirect and login references at `1440x900`, but no standalone logout screenshot is possible without instrumenting redirect. |
| Figma frame attached | No | Placeholder `FIGMA-TODO-V0-LOGOUT-001` created in this record. |
| Copy/layout compared | Done | Current route-local logged-out page differs from legacy login handoff. |
| Route handoff compared | Done | Legacy redirects to `/`; current stays on `/logout` with link to `/`. |
| State behavior compared | Done | Both clear session and return to public entry; current also separates explicit logout from session loss. |
| Product exception recorded | Needed | `V0-LOGOUT-EXCEPTION-001` and `V0-LOGOUT-EXCEPTION-002` are proposed but not approved. |
| Replacement approval | Blocked | Do not mark `/logout` approved until Figma evidence exists and product accepts or fixes the deltas. |

## Final determination

Decision: product-exception-needed.

`/logout` remains the best first replacement approval candidate, but it is not approved in this pack. The current implementation is behaviorally stronger than the legacy action route because it provides a stable logged-out state and separates session loss, but those are replacement deltas. Approval requires either:

1. a product exception approving the stable `/logout` page and final copy, plus a canonical Figma frame that matches it; or
2. an implementation/design change to match legacy immediate redirect to `/` and public login as the only visible post-logout state.

No other V0-V5 route is approved by this record.
