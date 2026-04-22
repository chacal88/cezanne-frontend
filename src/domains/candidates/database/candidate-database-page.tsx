import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import {
  buildCandidateDatabaseDetailPath,
  buildCandidateDatabasePath,
  parseCandidateDatabaseSearchFromUrl,
} from "../support/candidate-database-routing";
import { buildCandidateDatabaseAtsRow } from "../support/ats-operational-adapters";
import {
  resolveCandidateDatabaseAdvancedSearchState,
  resolveCandidateDatabaseBulkActionState,
  resolveCandidateDatabaseProductState,
} from "../support/product-depth";
import {
  fetchCandidateDatabaseRows,
  type CandidateDatabaseApiResult,
} from "./candidate-database-api";
import "../candidate-composition.css";

function hasActiveFilters(
  state: ReturnType<typeof parseCandidateDatabaseSearchFromUrl>,
) {
  return Boolean(
    state.query ||
    state.stage ||
    state.tags.length ||
    state.advancedMode ||
    state.page !== 1 ||
    state.sort !== "updatedAt" ||
    state.order !== "desc",
  );
}

function describeDatabaseState(kind: string) {
  switch (kind) {
    case "loading":
      return "Loading candidate matches and saved lists.";
    case "denied":
      return "You can open the candidate area, but this list is restricted.";
    case "unavailable":
      return "Candidate data is temporarily unavailable. Retry from the canonical database route.";
    case "stale":
      return "Showing last known candidate data while source systems refresh.";
    case "retryable":
      return "Candidate data failed to refresh. Retry keeps the current URL state.";
    case "degraded":
      return "Some candidate source or ATS details are partial.";
    case "empty":
      return "No candidate rows are available for this list state.";
    default:
      return "Candidate database is ready.";
  }
}

function describeAdvancedState(kind: string) {
  switch (kind) {
    case "invalid-query":
      return "Advanced search needs a valid saved query before results can be trusted.";
    case "unsupported-query":
      return "This advanced query is not supported in the greenfield adapter seam yet.";
    case "advanced-ready":
      return "Advanced search is active from a sanitized query identifier.";
    default:
      return "Simple search mode is active.";
  }
}

function describeBulkState(kind: string) {
  switch (kind) {
    case "eligible":
      return "Selected candidates are eligible for bulk action.";
    case "partially-eligible":
      return "Some selected candidates are not eligible; review before continuing.";
    case "blocked":
      return "Bulk action is blocked by capability or downstream readiness.";
    case "failed":
      return "Bulk action failed; retry or clear the current selection.";
    case "retryable":
      return "Bulk action can be retried without inventing payload details.";
    case "submitting":
      return "Bulk action is submitting.";
    case "succeeded":
      return "Bulk action completed and parent list should refresh.";
    default:
      return "Select candidates to enable bulk actions.";
  }
}

const defaultLists = ["LIST KAUE", "FILTER KAUE"];
const columnOptions = [
  "Tags",
  "Hiring flow stage",
  "Rejection reason",
  "Application date",
  "Last activity date",
  "CV score",
  "Email",
  "Location",
];
type CandidateColumn =
  | "tags"
  | "stage"
  | "rejection"
  | "applicationDate"
  | "lastActivityDate"
  | "cvScore"
  | "email"
  | "location";

const columnOptionMap: Record<string, CandidateColumn> = {
  Tags: "tags",
  "Hiring flow stage": "stage",
  "Rejection reason": "rejection",
  "Application date": "applicationDate",
  "Last activity date": "lastActivityDate",
  "CV score": "cvScore",
  Email: "email",
  Location: "location",
};

function nextSortPath(
  state: ReturnType<typeof parseCandidateDatabaseSearchFromUrl>,
  sort: typeof state.sort,
) {
  const order = state.sort === sort && state.order === "asc" ? "desc" : "asc";
  return buildCandidateDatabasePath({ ...state, sort, order });
}

function SortHeader({
  label,
  sort,
  state,
}: {
  label: string;
  sort: ReturnType<typeof parseCandidateDatabaseSearchFromUrl>["sort"];
  state: ReturnType<typeof parseCandidateDatabaseSearchFromUrl>;
}) {
  const active = state.sort === sort;
  return (
    <a className="candidate-db-sort-link" href={nextSortPath(state, sort)}>
      {label} {active ? (state.order === "asc" ? "↑" : "↓") : "↕"}
    </a>
  );
}

export function CandidateDatabasePage() {
  const location = useLocation();
  const state = parseCandidateDatabaseSearchFromUrl(window.location.search);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [listMenuOpen, setListMenuOpen] = useState(false);
  const [newListOpen, setNewListOpen] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListVisibility, setNewListVisibility] = useState<
    "Everyone" | "Only me"
  >("Everyone");
  const [savedLists, setSavedLists] = useState<string[]>(defaultLists);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [listsCollapsed, setListsCollapsed] = useState(false);
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<CandidateColumn[]>([
    "email",
    "location",
  ]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(
    () => new Set(),
  );
  const [apiState, setApiState] = useState<
    | { status: "loading"; result?: CandidateDatabaseApiResult }
    | { status: "ready"; result: CandidateDatabaseApiResult }
    | { status: "error"; error: string; result?: CandidateDatabaseApiResult }
  >({ status: "loading" });

  useEffect(() => {
    let active = true;
    setApiState((current) => ({
      status: "loading",
      result:
        current.status === "ready" || current.status === "error"
          ? current.result
          : undefined,
    }));

    fetchCandidateDatabaseRows(state)
      .then((result) => {
        if (!active) return;
        setApiState({ status: "ready", result });
        setSelectedRows(new Set());
      })
      .catch((error: unknown) => {
        if (!active) return;
        setApiState((current) => ({
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Candidate database API request failed.",
          result: current.status === "loading" ? current.result : undefined,
        }));
      });

    return () => {
      active = false;
    };
  }, [location.search]);

  const apiResult = apiState.result;
  const apiRows = apiResult?.rows ?? [];
  const filteredEmpty =
    state.tags.includes("filtered-empty") || Boolean(selectedList);
  const empty = state.tags.includes("empty-list");
  const displayedRows = filteredEmpty || empty ? [] : apiRows;
  const resultCount = displayedRows.length;
  const productState = resolveCandidateDatabaseProductState({
    resultCount,
    loading: apiState.status === "loading" || state.tags.includes("loading"),
    denied: state.tags.includes("denied"),
    unavailable:
      apiState.status === "error" || state.tags.includes("unavailable"),
    stale: state.tags.includes("stale"),
    degraded: state.tags.includes("degraded"),
    retryable: apiState.status === "error" || state.tags.includes("retry"),
  });
  const advancedSearchState = resolveCandidateDatabaseAdvancedSearchState({
    advancedMode: state.advancedMode,
    queryState: state.advancedQueryState,
    advancedQueryId: state.advancedQueryId,
  });
  const bulkActionState = resolveCandidateDatabaseBulkActionState({
    selectedCount: selectedRows.size || (state.tags.includes("bulk") ? 2 : 0),
    eligibleCount: state.tags.includes("bulk-partial")
      ? 1
      : selectedRows.size || (state.tags.includes("bulk") ? 2 : 0),
    submitting: state.tags.includes("bulk-submitting"),
    succeeded: state.tags.includes("bulk-succeeded"),
    failed: state.tags.includes("bulk-failed"),
    retryable: state.tags.includes("bulk-retry"),
    blocked: state.tags.includes("bulk-blocked"),
  });
  const atsRow = buildCandidateDatabaseAtsRow({
    candidateId: displayedRows[0]?.id ?? "unknown-candidate",
    listState: state,
    providerId: "greenhouse",
    providerLabel: "Greenhouse",
    hasDuplicate: state.tags.includes("duplicate"),
    importStatus: state.tags.includes("import-failed")
      ? "failed"
      : state.tags.includes("imported")
        ? "succeeded"
        : state.tags.includes("import-pending")
          ? "pending"
          : undefined,
    syncStatus: state.tags.includes("sync-failed")
      ? "failed"
      : state.tags.includes("sync-degraded")
        ? "degraded"
        : state.tags.includes("sync-pending")
          ? "pending"
          : undefined,
  });
  const activeFilters = hasActiveFilters(state) || Boolean(selectedList);
  const clearTarget = buildCandidateDatabasePath();

  function closeMenus() {
    setAddMenuOpen(false);
    setFilterMenuOpen(false);
    setListMenuOpen(false);
    setAddColumnOpen(false);
  }

  function createList() {
    const name = newListName.trim();
    if (!name) return;
    setSavedLists((lists) => (lists.includes(name) ? lists : [...lists, name]));
    setSelectedList(name);
    setNewListName("");
    setNewListVisibility("Everyone");
    setVisibilityOpen(false);
    setNewListOpen(false);
    setListsCollapsed(false);
  }

  function resetFilters() {
    setSelectedList(null);
    setFilterMenuOpen(false);
    setListMenuOpen(false);
    window.history.replaceState(null, "", clearTarget);
  }

  function toggleColumn(column: CandidateColumn) {
    setVisibleColumns((columns) =>
      columns.includes(column)
        ? columns.filter((item) => item !== column)
        : [...columns, column],
    );
  }

  return (
    <section
      className="candidate-product-page candidate-database-page"
      data-testid="candidate-database-composition"
    >
      <header className="candidate-product-hero">
        <div className="candidate-db-heading">
          <h1>Candidate database</h1>
          <span className="candidate-product-muted">
            Search by name, email, city or job
          </span>
        </div>
      </header>

      <div className="candidate-db-search-row">
        <span className="candidate-db-search-icon" aria-hidden="true">
          ⌕
        </span>
        <input
          className="candidate-db-search-input"
          defaultValue={selectedList ?? state.query}
          placeholder="Search candidates"
          aria-label="Search candidates"
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            const target = event.currentTarget;
            window.location.href = buildCandidateDatabasePath({
              ...state,
              query: target.value,
              page: 1,
            });
          }}
        />
        <button
          className="candidate-product-link"
          type="button"
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>(
              ".candidate-db-search-input",
            );
            window.location.href = buildCandidateDatabasePath({
              ...state,
              query: input?.value ?? state.query,
              page: 1,
            });
          }}
        >
          Search candidates
        </button>
      </div>

      <div className="candidate-product-layout">
        <aside
          className="candidate-product-card candidate-db-sidebar"
          data-testid="candidate-database-saved-lists-panel"
        >
          <div className="candidate-db-menu-anchor">
            <button
              className={`candidate-product-button candidate-db-add-button ${addMenuOpen ? "is-open" : ""}`}
              type="button"
              onClick={() => {
                closeMenus();
                setAddMenuOpen((open) => !open);
              }}
              data-testid="candidate-database-add-new-button"
            >
              <span>✚ Add new</span>
              <span>{addMenuOpen ? "⌃" : "⌄"}</span>
            </button>
            {addMenuOpen ? (
              <div
                className="candidate-db-dropdown candidate-db-add-menu"
                data-testid="candidate-database-add-new-menu"
              >
                <button type="button" onClick={() => setAddMenuOpen(false)}>
                  ▾ New filter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddMenuOpen(false);
                    setNewListOpen(true);
                  }}
                >
                  ☷ New list
                </button>
              </div>
            ) : null}
          </div>

          <div className="candidate-db-section-row">
            <button
              type="button"
              onClick={() => setFiltersCollapsed((value) => !value)}
            >
              ▾
            </button>
            <strong>▾ Saved filters</strong>
            <button
              type="button"
              onClick={() => {
                closeMenus();
                setFilterMenuOpen((open) => !open);
              }}
              data-testid="candidate-filter-menu-button"
            >
              ⋮
            </button>
            {filterMenuOpen ? (
              <div
                className="candidate-db-dropdown candidate-db-kebab-menu"
                data-testid="candidate-filter-menu"
              >
                <button type="button">◉ Show all filters</button>
                <button type="button">◒ Only show my private filters</button>
                <button type="button">▣ Edit filters</button>
              </div>
            ) : null}
          </div>
          {!filtersCollapsed ? (
            <div className="candidate-db-section-body">
              <span data-testid="candidate-database-query">
                {state.query || "saved filters"}
              </span>
            </div>
          ) : null}

          <div className="candidate-db-section-row candidate-db-lists-header">
            <button
              type="button"
              onClick={() => setListsCollapsed((value) => !value)}
            >
              {listsCollapsed ? "⌄" : "⌃"}
            </button>
            <strong>☷ Saved lists</strong>
            <button
              type="button"
              onClick={() => {
                closeMenus();
                setListMenuOpen((open) => !open);
              }}
              data-testid="candidate-list-menu-button"
            >
              ⋮
            </button>
            {listMenuOpen ? (
              <div
                className="candidate-db-dropdown candidate-db-kebab-menu"
                data-testid="candidate-list-menu"
              >
                <button type="button">◉ Show all lists</button>
                <button type="button">◒ Only show my private lists</button>
                <button type="button">▣ Edit lists</button>
              </div>
            ) : null}
          </div>
          {!listsCollapsed ? (
            <div
              className="candidate-db-saved-list-items"
              data-testid="candidate-saved-list-items"
            >
              {savedLists.map((list) => (
                <button
                  className={selectedList === list ? "is-selected" : ""}
                  key={list}
                  type="button"
                  onClick={() => setSelectedList(list)}
                >
                  <span>{list}</span>
                  <span className="candidate-db-count-pill">0</span>
                </button>
              ))}
            </div>
          ) : null}
        </aside>

        <main className="candidate-product-card candidate-db-main">
          <div
            className="candidate-product-toolbar candidate-db-toolbar"
            data-testid="candidate-database-bulk-toolbar"
          >
            {selectedRows.size > 0 ? (
              <div
                className="candidate-db-selected-toolbar"
                data-testid="candidate-database-selected-toolbar"
              >
                <button
                  type="button"
                  className="candidate-db-selection-clear"
                  onClick={() => setSelectedRows(new Set())}
                  aria-label="Clear selected candidates"
                >
                  ×
                </button>
                <button
                  type="button"
                  className="candidate-product-button candidate-product-button--secondary candidate-db-select-all"
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="candidate-product-button candidate-product-button--secondary candidate-db-bulk-button"
                  data-testid="candidate-database-bulk-actions-enabled"
                >
                  With Selected ({selectedRows.size})⌄
                </button>
              </div>
            ) : (
              <button
                className="candidate-product-button candidate-db-bulk-button"
                type="button"
                disabled={bulkActionState.kind === "blocked"}
              >
                ▣ Bulk Actions
              </button>
            )}
            <div className="candidate-product-actions">
              {activeFilters ? (
                <button
                  className="candidate-product-button candidate-product-button--secondary candidate-db-applied-filter"
                  type="button"
                  onClick={() => setSelectedList(null)}
                  data-testid="candidate-applied-list-filter"
                >
                  ✕ {selectedList ?? state.query}
                </button>
              ) : null}
              <span className="candidate-product-muted">
                {selectedList
                  ? selectedList
                  : describeBulkState(bulkActionState.kind)}
              </span>
              {activeFilters ? (
                <button
                  className="candidate-db-reset-link"
                  type="button"
                  onClick={resetFilters}
                  data-testid="candidate-database-clear-filters-link"
                >
                  ↻ Reset to default
                </button>
              ) : null}
              <div className="candidate-db-menu-anchor">
                <button
                  className="candidate-product-button candidate-product-button--secondary"
                  type="button"
                  onClick={() => {
                    closeMenus();
                    setAddColumnOpen((open) => !open);
                  }}
                  data-testid="candidate-add-column-button"
                >
                  ▣ Add column {addColumnOpen ? "⌃" : "⌄"}
                </button>
                {addColumnOpen ? (
                  <div
                    className="candidate-db-dropdown candidate-db-column-menu"
                    data-testid="candidate-add-column-menu"
                  >
                    {columnOptions.map((option) => {
                      const column = columnOptionMap[option];
                      const selected = visibleColumns.includes(column);
                      return (
                        <button
                          type="button"
                          key={option}
                          onClick={() => toggleColumn(column)}
                        >
                          {selected ? "✓" : "＋"} {option}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <p
            className="candidate-detail-hidden-state"
            data-testid="candidate-database-status-message"
          >
            {describeDatabaseState(productState.kind)}
          </p>
          <p
            className="candidate-detail-hidden-state"
            data-testid="candidate-database-advanced-message"
          >
            {describeAdvancedState(advancedSearchState.kind)}
          </p>
          <p
            className="candidate-detail-hidden-state"
            data-testid="candidate-database-ats-state"
          >
            {atsRow.atsState.kind}
          </p>

          {apiState.status === "error" ? (
            <div
              className="candidate-product-state candidate-product-state--warning"
              data-testid="candidate-database-api-error"
            >
              Candidate database API request failed. Retry from the current URL.
            </div>
          ) : null}

          {productState.kind === "empty" ? (
            <div className="candidate-db-table-wrap">
              <table
                className="candidate-product-table"
                data-testid="candidate-database-results-table"
              >
                <thead>
                  <tr>
                    <th>
                      <SortHeader label="Full name" sort="name" state={state} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>No candidates found</strong>
                      <p className="candidate-db-no-match-copy">
                        Try another search or reset to default.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="candidate-db-table-wrap">
              <table
                className="candidate-product-table"
                data-testid="candidate-database-results-table"
              >
                <thead>
                  <tr>
                    <th aria-label="select" />
                    <th>
                      <SortHeader label="Full name" sort="name" state={state} />
                    </th>
                    {visibleColumns.includes("email") ? (
                      <th>
                        <SortHeader
                          label="Email"
                          sort="updatedAt"
                          state={state}
                        />
                      </th>
                    ) : null}
                    {visibleColumns.includes("location") ? (
                      <th>Location</th>
                    ) : null}
                    {visibleColumns.includes("tags") ? <th>Tags</th> : null}
                    {visibleColumns.includes("stage") ? (
                      <th>
                        <SortHeader
                          label="Hiring flow stage"
                          sort="stage"
                          state={state}
                        />
                      </th>
                    ) : null}
                    {visibleColumns.includes("rejection") ? (
                      <th>Rejection reason</th>
                    ) : null}
                    {visibleColumns.includes("applicationDate") ? (
                      <th>Application date</th>
                    ) : null}
                    {visibleColumns.includes("lastActivityDate") ? (
                      <th>Last activity date</th>
                    ) : null}
                    {visibleColumns.includes("cvScore") ? (
                      <th>CV score</th>
                    ) : null}
                    <th aria-label="actions" />
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((row, index) => {
                    const rowKey = `${row.email}-${index}`;
                    const selected = selectedRows.has(rowKey);
                    return (
                      <tr
                        key={rowKey}
                        className={selected ? "is-selected" : undefined}
                      >
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Select ${row.name}`}
                            checked={selected}
                            onChange={(event) => {
                              setSelectedRows((current) => {
                                const next = new Set(current);
                                if (event.target.checked) next.add(rowKey);
                                else next.delete(rowKey);
                                return next;
                              });
                            }}
                          />
                        </td>
                        <td>
                          <strong>{row.name}</strong>
                        </td>
                        {visibleColumns.includes("email") ? (
                          <td>{row.email}</td>
                        ) : null}
                        {visibleColumns.includes("location") ? (
                          <td>{row.location}</td>
                        ) : null}
                        {visibleColumns.includes("tags") ? (
                          <td>{row.tags}</td>
                        ) : null}
                        {visibleColumns.includes("stage") ? (
                          <td>{row.stage}</td>
                        ) : null}
                        {visibleColumns.includes("rejection") ? (
                          <td>—</td>
                        ) : null}
                        {visibleColumns.includes("applicationDate") ? (
                          <td>21 Apr 2026</td>
                        ) : null}
                        {visibleColumns.includes("lastActivityDate") ? (
                          <td>21 Apr 2026</td>
                        ) : null}
                        {visibleColumns.includes("cvScore") ? <td>—</td> : null}
                        <td>
                          <a
                            className="candidate-product-link candidate-db-open-link"
                            href={buildCandidateDatabaseDetailPath(
                              row.id,
                              state,
                              {
                                jobId: row.jobId,
                                status: row.statusId,
                              },
                            )}
                            data-testid="candidate-database-detail-link"
                          >
                            ↗
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p
            className="candidate-detail-hidden-state"
            data-testid="candidate-database-ats-return"
          >
            Candidate path: {atsRow.candidatePath}
          </p>

          {productState.kind !== "empty" ? (
            <nav
              className="candidate-db-pagination"
              aria-label="Pagination"
              data-testid="candidate-database-pagination"
            >
              <button
                type="button"
                className="candidate-db-pagination__button"
                disabled
              >
                <i className="fas fa-chevron-left" aria-hidden="true" /> Prev
              </button>
              <span className="candidate-db-pagination__range">
                {apiResult?.from ?? 1}-{apiResult?.to ?? displayedRows.length}{" "}
                of {apiResult?.total ?? displayedRows.length}
              </span>
              <button
                type="button"
                className="candidate-db-pagination__button"
                disabled
              >
                Next <i className="fas fa-chevron-right" aria-hidden="true" />
              </button>
            </nav>
          ) : null}
        </main>
      </div>

      {newListOpen ? (
        <div className="candidate-db-modal-backdrop" role="presentation">
          <div
            className="candidate-db-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="candidate-new-list-title"
            data-testid="candidate-new-list-modal"
          >
            <header className="candidate-db-modal-header">
              <span className="candidate-db-modal-icon">▰</span>
              <div>
                <h2 id="candidate-new-list-title">New list</h2>
                <p>Manage your candidates with lists</p>
              </div>
              <button type="button" onClick={() => setNewListOpen(false)}>
                Cancel
              </button>
            </header>
            <label className="candidate-db-modal-field">
              <span>New list name</span>
              <input
                value={newListName}
                onChange={(event) => setNewListName(event.target.value)}
                placeholder="Type list name here"
                autoFocus
              />
            </label>
            <div className="candidate-db-modal-visibility">
              <span>◉ Visible to</span>
              <div className="candidate-db-menu-anchor">
                <button
                  type="button"
                  onClick={() => setVisibilityOpen((open) => !open)}
                  data-testid="candidate-list-visibility-button"
                >
                  {newListVisibility} {visibilityOpen ? "⌃" : "⌄"}
                </button>
                {visibilityOpen ? (
                  <div
                    className="candidate-db-dropdown candidate-db-visibility-menu"
                    data-testid="candidate-list-visibility-menu"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setNewListVisibility("Everyone");
                        setVisibilityOpen(false);
                      }}
                    >
                      Everyone
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewListVisibility("Only me");
                        setVisibilityOpen(false);
                      }}
                    >
                      Only me
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <footer>
              <button
                className="candidate-product-button"
                type="button"
                onClick={createList}
                disabled={!newListName.trim()}
                data-testid="candidate-create-list-button"
              >
                Create
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </section>
  );
}
