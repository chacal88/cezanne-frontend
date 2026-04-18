# R4 Team and Favorites Open Points

## Purpose

This document records the unresolved boundary for `R4.3` team/users/favorites planning.

## Confirmed baseline

- `R4` includes team/users + invite and favorites/favorite requests.
- The current docs still mix org-admin team management, recruiter visibility, and platform sysadmin responsibility.
- This area should be planned together but implemented as separate changes.

## What must be frozen before implementation

1. whether org-admin user management lives under `settings`, a dedicated `team` area, or a split route family with sysadmin
2. invite/membership/role-change ownership
3. recruiter visibility and `/recruiters` ownership
4. favorites ownership and whether platform-level favorite-request queues remain `R5`

## Still open

- the final capability split between org-admin and platform-admin user management
- whether favorites are purely personal, org-shared, recruiter-linked, or mixed
- whether `/users` CRUD remains mostly `R5` while `/users/invite` stays in `R4`, or whether the area needs re-slicing

## Recommended follow-on change order

- `r4-team-users-foundation`
- `r4-invite-and-membership-management`
- `r4-favorites-management`
- `r4-favorite-requests`
