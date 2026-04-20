## 1. Planning and documentation

- [x] 1.1 Update R5 SysAdmin docs so S5, S6, and S7 route-heavy details are accepted for this slice
- [x] 1.2 Align screens, capabilities, navigation, and testing docs with platform users/favorite-request contracts

## 2. Route and navigation contracts

- [x] 2.1 Add route ids, route metadata, registered paths, and platform metadata for `/users*` and `/favorites-request*`
- [x] 2.2 Expose live Platform / Users and requests navigation links while keeping taxonomy linkless

## 3. Implementation

- [x] 3.1 Add platform user filter/state helpers and pages
- [x] 3.2 Add platform favorite-request queue/action helpers and pages
- [x] 3.3 Add locale strings for users and favorite-request pages/navigation

## 4. Validation

- [x] 4.1 Add tests for metadata, navigation, user filters, favorite-request actions, and org/platform separation
- [x] 4.2 Run `openspec validate r5-platform-users-and-favorite-requests --strict`, `npm test`, and `npm run build`
