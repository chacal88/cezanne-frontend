# Figma Handoff Released Areas Change

## Purpose

This change defines the next Figma/screen-flow production package for the evidence-covered areas already released for drafting:

- V0 partial auth, shell, dashboard, notifications, and inbox sub-blocks;
- V1 Jobs;
- V3 Public, External, and Token flows;
- V4 Operations;
- V5 Platform desktop.

It converts the current handoff index into an executable design-production change without expanding product scope, backend/API contracts, route ownership, access rules, or replacement approval.

## Change ID

`figma-handoff-released-areas`

## Figma Destination

| Field | Value |
|---|---|
| File | `Recruit Frontend - Figma Handoff Released Areas` |
| URL | https://www.figma.com/design/5AvI24E4A1NMwJwq27WYEo |
| Page | `Released Areas Handoff` |
| Page node | `1:2` |
| Top-level sections | `V0 partial`, `V1 Jobs`, `V3 Public/External/Token`, `V4 Operations`, `V5 Platform desktop` |

## Figma Production Record

| Check | Result |
|---|---|
| Production pass | Initial released-areas handoff map created on 2026-04-23 |
| Frame groups | 40 total groups: 8 each for V0 partial, V1 Jobs, V3 Public/External/Token, V4 Operations, and V5 Platform desktop |
| Source labels | Every frame group includes a source label pointing to `figma-screen-flow-handoff-index.md` plus its owning visual contract |
| V2 exclusion | No V2 candidate canonical frame was created; `review-candidate` appears only as a V3 public/external token route label |
| Alias handling | Compatibility-only routes remain annotation-only; `/parameters` is represented as a V4 compatibility annotation, not a standalone replacement frame |
| Deferred unknowns | Backend/API/provider/payment/schema unknowns are explicitly labeled as deferred in the relevant frame groups |
| Security exclusions | Figma annotations avoid raw credentials, auth codes, tokens, provider payloads, signed URLs, message bodies, document contents, diagnostic logs, card data, and tenant-sensitive payloads |

## Source Of Truth

| Source | Role in this change |
|---|---|
| `figma-screen-flow-handoff-index.md` | Primary route/family handoff list and drafting status. |
| `pre-figma-flow-review.md` | Gate status and route-by-route readiness classifications. |
| `visual-evidence-capture-plan.md` | Evidence schema, promotion rules, and replacement-approval boundary. |
| `v0-auth-shell-dashboard-visual-contract.md` | V0 partial visual contract and blockers. |
| `v1-jobs-visual-contract.md` | V1 Jobs visual contract. |
| `v3-public-external-token-visual-contract.md` | V3 public/external/token visual contract. |
| `v4-operations-visual-contract.md` | V4 operations visual contract. |
| `v5-sysadmin-platform-visual-contract.md` | V5 platform desktop visual contract. |
| `screen-design-flow-matrix.md` | Contract-first bridge between route/state depth and canonical design references. |

Figma remains a complementary production artifact. It must not override route, capability, parent-return, token, provider, telemetry, or backend/API contracts recorded in the docs and source.

## Scope

### Included

| Slice | Included scope | Figma output target |
|---|---|---|
| V0 partial | Covered auth entry states, token-flow state maps, SSO/Cezanne/SAML callback maps, logout/session-loss transitions, shell/account profile states, dashboard desktop base, notifications resolver categories, inbox empty/selected states | Canonical base frames and state maps for covered sub-blocks only. |
| V1 Jobs | Jobs list, authoring/create/edit/copy/reset, job detail hub, bid/CV/reject/schedule/offer task overlays, jobs-side requisition routes | Canonical Jobs screen-flow and task-flow base frames. |
| V3 Public/External/Token | Shared token lifecycle, chat, interview request, review candidate, interview feedback, shared job, public application, public survey, requisition approval/forms, integration CV/forms/job token entries | Public/token screen-flow frames outside authenticated shell. |
| V4 Operations | Settings, templates, careers/application/job-listing settings, integrations admin, reports, billing, team, favorites, marketplace, compatibility annotations | Authenticated operations screen-flow frames and state variants. |
| V5 Platform desktop | Platform users, favorite-request queue, hiring companies, recruitment agencies, subscriptions, company subscription admin, sectors/subsectors | Desktop current-app SysAdmin/platform base frames and state variants. |

### Excluded

| Exclusion | Reason |
|---|---|
| V2 Candidates | V2 remains behavior-evidenced but legacy-parity blocked and is not Figma-ready. |
| Replacement approval for any included row except explicit `/logout` handoff | `Figma-ready` is drafting permission only; final replacement requires matched legacy/current/Figma parity evidence or a product exception. |
| Backend/API/provider/payment/schema invention | These remain deferred unless confirmed by source/spec/backend contracts. |
| Standalone frames for aliases such as `/parameters*`, `/recruiters`, or candidate shorthand examples | They are compatibility/reference entries, not canonical standalone route targets. |
| Mobile/responsive expansion for V5 | V5 is desktop current-app Figma-ready only. |

## Delivery Steps

1. Baseline the Figma production file structure.
   - Create or identify the target Figma file/page for the released-areas handoff.
   - Add top-level sections for `V0 partial`, `V1 Jobs`, `V3 Public/External/Token`, `V4 Operations`, and `V5 Platform desktop`.
   - Add a visible annotation layer for deferred backend/API/schema and replacement blockers.

2. Produce V0 partial frames.
   - Start from the covered V0 sub-block matrix in `figma-screen-flow-handoff-index.md`.
   - Produce current-app state maps for token, callback, shell/account, notifications, and inbox states where evidence exists.
   - Keep `/logout` marked as the only pixel-parity-approved handoff.
   - Mark all other V0 frames as Figma drafting outputs, not replacement-approved outputs.

3. Produce V1 Jobs frames.
   - Cover Jobs list, authoring, detail, task overlays, and requisition route-state bases.
   - Preserve URL-owned list/detail state, parent-return, refresh intent, provider-blocked separation, and jobs-side requisition ownership.
   - Annotate final job table/form/task/provider/requisition schemas as deferred.

4. Produce V3 public/external/token frames.
   - Build shared public token lifecycle components first.
   - Then produce chat, review/interview, public application, survey, requisition, and integration token-entry flows.
   - Keep every V3 frame outside authenticated shell chrome.
   - Do not expose raw token, auth code, signed URL, provider payload, message body, survey answer, applicant document content, or tenant-sensitive raw payloads.

5. Produce V4 Operations frames.
   - Work by module family: settings, integrations admin, reports, billing, team, favorites, marketplace.
   - Keep compatibility routes as annotations that point to canonical targets.
   - Keep authenticated provider setup separate from public integration callbacks and from operational provider-blocked task states.
   - Keep org billing/team/favorites separate from SysAdmin platform rows.

6. Produce V5 Platform desktop frames.
   - Cover desktop current-app users, favorite requests, master data, company subscription admin, and taxonomy.
   - Preserve platform/org separation across users/team, favorite requests/org favorites, subscriptions/billing, and company/agency master data/account settings.
   - Annotate backend schema, responsive/mobile, platform dashboard polish, and legacy parity as deferred.

7. Run the handoff quality pass.
   - Compare every produced frame against the owning visual contract and evidence log.
   - Confirm route names, state names, capabilities, parent-return targets, and deferred unknowns are annotated.
   - Confirm no excluded V2 or alias-only route has become a canonical frame.
   - Record any missing evidence, product exception request, or backend/schema dependency as a follow-up.

## Acceptance Criteria

- The Figma handoff contains frame groups for V0 partial, V1, V3, V4, and V5 desktop only.
- Every frame group links back to its owning doc source or route/family label from `figma-screen-flow-handoff-index.md`.
- V2 Candidates are not promoted or represented as Figma-ready canonical frames.
- Every legacy-backed included row is labeled as replacement-blocked unless it is the explicit `/logout` handoff already approved in `replacement-evidence-v0-logout.md`.
- Deferred backend/API/provider/payment/schema details are visible as annotations, not silently converted into final fields.
- Public/token frames do not use authenticated shell layout.
- Provider setup, operational task states, org admin states, and platform admin states remain separated by their documented ownership boundaries.
- No raw credentials, tokens, auth codes, provider payloads, signed URLs, message bodies, document contents, raw diagnostic logs, or tenant-sensitive payloads appear in design annotations.
- The docs package is updated with any confirmed change in scope, blocker status, or product exception discovered during Figma production.

## Validation Checklist

- [ ] Figma sections match the five included slices.
- [ ] V0 partial frames include covered-state annotations and preserve non-logout replacement blockers.
- [ ] V1 Jobs frames preserve route-owned state and parent-return semantics.
- [ ] V3 frames use public/token lifecycle treatment and no authenticated shell chrome.
- [ ] V4 frames keep configuration, operational execution, provider setup, org billing/team/favorites, and marketplace boundaries distinct.
- [ ] V5 frames are marked desktop current-app scope and keep platform/org boundaries distinct.
- [ ] V2 is absent from Figma-ready production.
- [ ] Alias/reference routes are annotation-only.
- [ ] Deferred unknowns are explicitly tagged.
- [ ] Security exclusions are respected.

## Handoff Status

| Slice | Change status | Replacement status |
|---|---|---|
| V0 partial | Ready to produce covered Figma frames | `/logout` only is pixel-parity-approved; all other V0 rows remain blocked. |
| V1 Jobs | Ready to produce Figma frames | Not replacement-approved. |
| V3 Public/External/Token | Ready to produce Figma frames | Not replacement-approved. |
| V4 Operations | Ready to produce Figma frames | Not replacement-approved. |
| V5 Platform desktop | Ready to produce desktop Figma frames | Not replacement-approved. |
| V2 Candidates | Excluded | Not replacement-approved. |

## Follow-Up Records

Use follow-up records when the Figma pass finds one of these:

- a missing screenshot or state from the owning visual contract;
- a required backend/API/provider/schema field that is not confirmed;
- a product-approved visual deviation from legacy parity;
- a route/capability/ownership conflict between Figma and the docs/source;
- a responsive/mobile requirement outside the approved slice.

Confirmed facts must stay separate from inference. Inferred design choices should remain annotations until product, backend, or source evidence confirms them.
