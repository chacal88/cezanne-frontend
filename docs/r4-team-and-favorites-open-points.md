# R4 Team and Favorites Open Points

## Purpose

This document records the R4.3 team/users/favorites closeout boundary after org team, invite/membership, favorites, and org request slices moved into implementation.

## Confirmed baseline

- `R4` includes team/users + invite and favorites/favorite requests.
- The current docs still mix org-admin team management, recruiter visibility, and platform sysadmin responsibility.
- This area should be planned together but implemented as separate changes.

## What must be frozen before implementation

1. whether org-admin user management lives under `settings`, a dedicated `team` area, or a split route family with sysadmin
2. invite/membership/role-change ownership
3. recruiter visibility and `/recruiters` ownership
4. favorites ownership and whether platform-level favorite-request queues remain `R5`

## R4 closeout status

Resolved by the R4 team/favorites slices:
- org-admin team, recruiter visibility, invite, membership, favorites, and org favorite-request task flows are separated from SysAdmin platform administration;
- favorites support personal, org-shared, and recruiter-linked ownership states;
- `/users/invite` stays in R4 as an org-scoped team/invite route, while route-heavy `/users*` CRUD remains outside R4.

Intentionally deferred beyond R4:
- platform-scoped `/users`, `/users/new`, `/users/edit/:id`, and `/users/:id` CRUD;
- platform `/favorites-request` and `/favorites-request/:id` queues;
- any future org-user route-heavy CRUD beyond invite/membership readiness.

R5 sync:
- R5 should treat the org/platform user-management split and the org-favorites/platform-queue split as accepted boundaries.
- R5 platform users and favorite-request queues must not absorb R4 org invite, membership, `/favorites*`, or `/favorites/request*` behavior.

## Recommended follow-on change order

- `r4-team-users-foundation`
- `r4-invite-and-membership-management`
- `r4-favorites-management`
- `r4-favorite-requests`

## Foundation decisions implemented

The R4 team/users foundation resolves the first ownership boundary:
- Org team index: `/team`.
- Recruiter visibility: `/team/recruiters`.
- Invite foundation: `/users/invite`.
- Org team capabilities are `canViewOrgTeam`, `canViewRecruiterVisibility`, and `canManageOrgInvites`.
- HC/RA org admins can enter the foundation routes; non-admins fall back to `/dashboard`.
- Org team access does not grant Platform navigation or `canManagePlatformUsers`.
- Route-heavy `/users*` CRUD remains out of this foundation and must be re-sliced explicitly if implemented outside R5 platform users.

Recommended follow-on order now starts with `r4-invite-and-membership-management`, then `r4-favorites-management`.

## Invite and membership decisions implemented

The R4 invite/membership slice resolves the second ownership boundary:
- `/users/invite` remains the compatibility entry path, but its domain/module ownership is team/invite-management.
- Invite send, resend, and revoke states are org-scoped and gated by `canManageOrgInvites`.
- Membership role/status readiness is modeled as org team behavior and does not require `canManagePlatformUsers`.
- Denied invite access follows the recruiter-core `/dashboard` fallback.
- Route-heavy `/users*` CRUD remains outside this slice and stays reserved for an explicit platform/R5 or later org-user split.

Recommended follow-on order now starts with `r4-favorites-management`, then `r4-favorite-requests`.

## Favorites decisions implemented

The R4 favorites slice resolves the third ownership boundary:
- `/favorites` and `/favorites/:id` are org-scoped recruiter-core favorites routes.
- Org favorites are gated by `canViewOrgFavorites`, not `canManageFavoriteRequests`.
- Favorite ownership states are personal, org-shared, and recruiter-linked, with explicit empty and unavailable states.
- Denied favorites access follows the recruiter-core `/dashboard` fallback.
- `/favorites/request/:id?` and `/favorites-request*` remain outside this slice and are reserved for explicit favorite-request follow-on work.

Recommended follow-on order now starts with `r4-favorite-requests`.

## Favorite request decisions implemented

The R4 favorite-request slice resolves the fourth ownership boundary:
- `/favorites/request` and `/favorites/request/:id` are org-scoped favorite request task flows.
- Org request flows reuse `canViewOrgFavorites`, not `canManageFavoriteRequests`.
- Request states are draft, submitted, pending, approved, rejected, and unavailable.
- Request actions are submit, cancel, and resubmit with deterministic readiness/blocked states.
- Platform `/favorites-request` and `/favorites-request/:id` remain outside R4 org favorites and reserved for platform/R5 follow-on work.
