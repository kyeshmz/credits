const STAGE_FILTER_VALUES = ["all", "pre-seed", "seed", "series-a"] as const;
type StageFilter = (typeof STAGE_FILTER_VALUES)[number];

function isStageFilter(value: string | null): value is StageFilter {
  return value !== null && (STAGE_FILTER_VALUES as readonly string[]).includes(value);
}

function applyStageFilter(section: HTMLElement, filter: StageFilter): void {
  const rows = section.querySelectorAll<HTMLTableRowElement>("tbody tr");
  let visible = 0;
  rows.forEach((row) => {
    const stages = (row.dataset.stages ?? "").split(" ").filter(Boolean);
    const match = filter === "all" || stages.includes(filter) || stages.includes("any");
    row.hidden = !match;
    if (match) visible += 1;
  });
  const count = section.querySelector("[data-count]");
  if (count) count.textContent = `${visible} program${visible === 1 ? "" : "s"}`;
  if (visible === 0) section.setAttribute("data-empty", "");
  else section.removeAttribute("data-empty");
  section.querySelectorAll<HTMLButtonElement>("[data-stage-filter]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.stageFilter === filter));
  });
}

function enhanceStageFilters(root: ParentNode = document): void {
  const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-stage-table]"));
  if (sections.length === 0) return;
  const initial: StageFilter = isStageFilter(new URLSearchParams(window.location.search).get("stage")) ? (new URLSearchParams(window.location.search).get("stage") as StageFilter) : "all";
  sections.forEach((section) => {
    const buttons = section.querySelectorAll<HTMLButtonElement>("[data-stage-filter]");
    if (buttons.length === 0) return;
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const next = button.dataset.stageFilter ?? "all";
        if (!isStageFilter(next)) return;
        applyStageFilter(section, next);
        const params = new URLSearchParams(window.location.search);
        if (next === "all") params.delete("stage");
        else params.set("stage", next);
        const query = params.toString();
        window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
      });
    });
    if (initial !== "all") applyStageFilter(section, initial);
  });
}

export function enhanceTables(root: ParentNode = document): void {
  root.querySelectorAll<HTMLTableElement>("table[data-enhanced-table]").forEach((table) => {
    const body = table.tBodies[0];
    if (!body || body.rows.length === 0) return;
    table.querySelectorAll<HTMLTableCellElement>("th.sortable").forEach((header) => {
      header.addEventListener("click", () => {
        const column = header.cellIndex;
        const type = header.dataset.type === "number" ? "number" : "text";
        const direction = header.dataset.direction === "ascending" ? "descending" : "ascending";
        table.querySelectorAll<HTMLTableCellElement>("th.sortable").forEach((other) => {
          other.removeAttribute("aria-sort");
          delete other.dataset.direction;
          const indicator = other.querySelector<HTMLElement>(".sort-indicator");
          if (indicator) indicator.textContent = "";
        });
        header.setAttribute("aria-sort", direction);
        header.dataset.direction = direction;
        const indicator = header.querySelector<HTMLElement>(".sort-indicator");
        if (indicator) indicator.textContent = direction === "ascending" ? "▲" : "▼";
        const rows = Array.from(body.rows);
        rows.sort((a, b) => {
          const aCell = a.cells[column];
          const bCell = b.cells[column];
          const aValue = aCell?.dataset.sort ?? aCell?.textContent?.trim() ?? "";
          const bValue = bCell?.dataset.sort ?? bCell?.textContent?.trim() ?? "";
          const comparison = type === "number" ? Number(aValue) - Number(bValue) : aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: "base" });
          return direction === "ascending" ? comparison : -comparison;
        });
        rows.forEach((row) => body.appendChild(row));
      });
    });
  });
  enhanceStageFilters(root);
}
