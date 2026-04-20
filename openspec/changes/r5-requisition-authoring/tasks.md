## 1. Planning and documentation

- [x] 1.1 Update R5 requisition docs so RQ1-RQ10 are accepted for this frontend foundation slice
- [x] 1.2 Align screens, capabilities, navigation, and testing docs with requisition route contracts

## 2. Route and access contracts

- [x] 2.1 Add route ids, route metadata, and registered paths for `/build-requisition`, `/job-requisitions*`, and `/requisition-workflows`
- [x] 2.2 Tighten requisition capability tests without changing org/platform ownership

## 3. Implementation

- [x] 3.1 Add requisition authoring state helpers and Jobs-side pages
- [x] 3.2 Add requisition workflows settings state helpers and page
- [x] 3.3 Add locale strings for requisition authoring and workflow settings

## 4. Validation

- [x] 4.1 Add tests for metadata, capabilities, state helpers, and ownership separation
- [x] 4.2 Run `openspec validate r5-requisition-authoring --strict`, `npm test`, and `npm run build`
