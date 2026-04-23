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
| Replacement decision | Blocked pending parity fix or product exception |
| Pixel-parity-approved | No |
| Other routes approved | No |

`/logout` cannot be marked `Pixel-parity-approved` from this pack. The current route handoff has been recaptured and now matches the legacy action-route redirect to `/`, and the canonical login Figma frame reference is confirmed. Approval remains blocked because the observable current post-logout login surface still has visible parity deltas against the legacy login screenshot.

## Required sources read

| Source | Evidence used |
|---|---|
| `docs/replacement-approval-audit-v0-v5.md` | Names V0 `/logout` as the recommended first approval candidate and requires matched legacy/current/Figma evidence before approval. |
| `docs/pre-figma-flow-review.md` | Marks `/logout` as `Figma-ready`, not replacement-approved, and requires matched legacy/current/Figma parity or product exception. |
| `docs/v0-auth-shell-dashboard-visual-contract.md` | Defines logout/session-loss frame requirements and keeps `/logout` as shell/session `Page`, not an account overlay. |
| `docs/visual-evidence-v0-auth-shell-dashboard.md` | Records current post-handoff `/logout` evidence plus separate `/session-lost` evidence. |
| `docs/screen-design-flow-matrix.md` | Confirms the login/auth design reference: Figma file `Z3PdFzZu8uahyibzALIAN0`, node `1:2`. |
| `/Users/kauesantos/Documents/recruit/frontend/src/app/pages/_main/main.route.js` | Confirms legacy `/logout` route and action-only `onEnter` behavior. |

## Legacy evidence

| Evidence item | Value |
|---|---|
| Route registration | `/Users/kauesantos/Documents/recruit/frontend/src/app/pages/_main/main.route.js` registers state `logout` at URL `/logout`. |
| Entry point | `/Users/kauesantos/Documents/recruit/frontend/src/app/pages/_main/main.html` links account menu sign-out to `ui-sref="logout"`. |
| Logout action | `/Users/kauesantos/Documents/recruit/frontend/src/app/domain/login/login.service.js` clears user, token, onboard token, app language storage, and notification state. |
| Route handoff | `LoginService.logout()` redirects with `window.location.href = '/'` when a state exists; it does not render a stable `/logout` page. |
| Visible post-logout state | Public login entry at `/`, using the legacy login surface. |
| Legacy screenshot | No standalone legacy `/logout` screenshot exists in the current pack because the route redirects immediately. The observable post-logout legacy login reference is `docs/visual-evidence-assets/v0/legacy/legacy-root-1440x900.png`; filled login reference is `docs/visual-evidence-assets/v0/legacy/legacy-login-filled-seeded-user-1440x900.png`. |

Confirmed legacy behavior: `/logout` is an action route. The observable visual state after logout is the public login page, not a route-local logged-out confirmation page.

## Current evidence

| Evidence item | Value |
|---|---|
| Router | `src/app/router.tsx` registers `/logout` under the public layout. |
| Metadata | `src/lib/routing/route-metadata.ts` keeps `/logout` owned by `shell` / `session`, route class `Page`, required capability `canLogout`, fallback `/`. |
| Runtime implementation | `src/domains/auth/routes/public-pages.tsx` clears local auth session, resets access context to public, emits safe logout telemetry, and immediately redirects to `/`. |
| State model | `src/domains/auth/models/session-foundation.ts` resolves `{ kind: 'logged-out', landingTarget: '/' }`. |
| Current screenshot | `docs/visual-evidence-assets/v0/current/greenfield-logout-post-handoff-login-1440x900.png` |
| Current manifest | `docs/visual-evidence-assets/v0/v0-capture-manifest.json`, record `greenfield-logout-post-handoff-login-1440x900`, final URL `http://127.0.0.1:5174/`, body text matching public login, `storageCleared: true`. |
| Superseded route-local screenshot | `docs/visual-evidence-assets/v0/current/greenfield-logout-stable-logged-out-1440x900.png` is superseded because runtime no longer renders a route-local logged-out page. |
| Superseded access-denied screenshot | `docs/visual-evidence-assets/v0/superseded/greenfield-logout-seeded-session-1440x900.png` is explicitly superseded because it showed access denied after session clearing. |
| Session-loss comparison state | `docs/visual-evidence-assets/v0/current/state-hooks/greenfield-session-loss-session-expired-1440x900.png`; separate from explicit `/logout`. |

Confirmed current behavior: `/logout` now matches the legacy-style action route by clearing session state and handing off to `/` instead of rendering a route-local logged-out page.

## Figma evidence

| Evidence item | Value |
|---|---|
| Canonical Figma frame | Confirmed by reference as the public login frame used for the observable post-logout state: file `Z3PdFzZu8uahyibzALIAN0`, node `1:2`. |
| Existing Figma references | `docs/screen-design-flow-matrix.md` names login frame file `Z3PdFzZu8uahyibzALIAN0`, node `1:2`; authenticated shell frame remains `pending` and is not needed for the observable post-logout login state. |
| Required placeholder | Closed for reference attachment only. No standalone `/logout` Figma frame is required while `/logout` remains an immediate handoff to `/`; final login-frame parity is still required before approval. |

Figma-ready status remains valid for drafting. Replacement approval is still blocked because the attached login-frame reference and matched screenshots expose visual parity deltas that are not fixed or exceptioned.

## Parity comparison

| Area | Legacy `/logout` | Current `/logout` | Parity result |
|---|---|---|---|
| Route ownership | Shell/session action from main authenticated layout. | Shell/session route that performs action-style handoff. | Ownership preserved; route metadata remains page-class for router compatibility, but the visible behavior now follows legacy action-route handoff. |
| Entry | Account menu sign-out link. | Account menu logout link through shell navigation. | Matched intent. |
| Session clearing | Clears user, token, onboard token, app language storage, and notification state. | Clears local auth session and resets access context to public. | Functionally aligned; exact storage keys differ by app architecture. |
| Route handoff | Redirects to `/`; `/logout` is not stable as a visual destination. | Redirects to `/`; `/logout` is not stable as a visual destination. | Matched in source and current browser evidence. |
| Visible copy | Legacy observable state is login copy after redirect, including `Email address` placeholder. | Current observable state is login copy after redirect, but the email placeholder is `Email`. | Blocked until copy is matched or exceptioned. |
| Layout | Legacy observable post-logout layout is the login page. | Current observable post-logout layout is the login page. | Same surface, but current/legacy still differ in login field icon treatment and small input placeholder details. |
| Session-loss separation | Legacy service logout is also used from some auth/error paths. | `/session-lost` is separate, visually captured, and preserved as a separate visible state. | Preserved by current scope; not approval for `/session-lost`. |
| Figma | Login frame file `Z3PdFzZu8uahyibzALIAN0`, node `1:2` is the canonical observable state reference. | Current evidence is compared to the same login-frame reference path. | Reference attached; visual deltas still block approval. |

## Product exception needed

| Exception id | Route | Delta | Required decision |
|---|---|---|---|
| `V0-LOGOUT-EXCEPTION-001` | `/logout` observable post-handoff login | Current login input placeholder/icon treatment differs from the legacy login screenshot. | Fix login parity before approval, or product must explicitly accept the login-field copy/icon delta for the `/logout` handoff state. |

## Approval checklist

| Item | Status | Notes |
|---|---|---|
| Legacy route behavior captured or referenced | Done | Source-confirmed action route with immediate redirect. |
| Current route behavior captured or referenced | Done | Current post-handoff screenshot and manifest record exist. |
| Matched viewport | Done | Legacy and current observable post-logout login references are desktop `1440x900`, device scale factor `1`. |
| Figma frame attached | Done | Public login frame reference confirmed from `docs/screen-design-flow-matrix.md`: file `Z3PdFzZu8uahyibzALIAN0`, node `1:2`. |
| Copy/layout compared | Done | Route handoff matches; login placeholder/icon deltas remain. |
| Route handoff compared | Done | Legacy and current redirect to `/`; current manifest final URL is `/`. |
| State behavior compared | Done | Both clear session and return to public entry; current manifest confirms local auth/session storage cleared. |
| Product exception recorded | Needed if not fixed | `V0-LOGOUT-EXCEPTION-001` is proposed but not approved. |
| Replacement approval | Blocked | Do not mark `/logout` approved until login parity deltas are fixed or accepted by product exception. |

## Final determination

Decision: blocked pending parity fix or product exception.

`/logout` remains the best first replacement approval candidate, but it is not approved in this pack. Runtime now matches the legacy immediate redirect to `/`, the current post-handoff login state has been recaptured at `1440x900`, the legacy login screenshot is referenced at the same viewport, and the canonical Figma login frame reference is attached. Approval is still blocked by the remaining observable login parity delta: current input placeholder/icon treatment does not yet match the legacy login reference.

No other V0-V5 route is approved by this record.
