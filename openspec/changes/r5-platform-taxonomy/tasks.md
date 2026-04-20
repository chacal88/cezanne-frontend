## 1. Planning and documentation

- [x] 1.1 Update R5 SysAdmin docs so S8 is accepted for `r5-platform-taxonomy`
- [x] 1.2 Align screens, capabilities, navigation, and testing docs with platform taxonomy route contracts

## 2. Route and navigation contracts

- [x] 2.1 Add route ids, route metadata, registered paths, and platform metadata for sectors/subsectors
- [x] 2.2 Expose live Platform / Taxonomy navigation link

## 3. Implementation

- [x] 3.1 Add taxonomy state helpers for sector list/detail, nested subsector list, and subsector detail
- [x] 3.2 Add taxonomy pages and register routes behind platform taxonomy capability
- [x] 3.3 Add locale strings for taxonomy pages/navigation

## 4. Validation

- [x] 4.1 Add tests for metadata, navigation, state helpers, and parent/child return behavior
- [x] 4.2 Run `openspec validate r5-platform-taxonomy --strict`, `npm test`, and `npm run build`
