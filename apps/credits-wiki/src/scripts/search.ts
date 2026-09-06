interface SearchEntry { slug: string; provider: string; program: string; category: string; categoryLabel: string; value: string; duration: string; tags: string[]; }

function addHighlightedText(parent: HTMLElement, text: string, query: string): void {
  if (!query) { parent.textContent = text; return; }
  const lower = text.toLocaleLowerCase();
  const start = lower.indexOf(query.toLocaleLowerCase());
  if (start < 0) { parent.textContent = text; return; }
  parent.append(document.createTextNode(text.slice(0, start)));
  const mark = document.createElement("mark");
  mark.textContent = text.slice(start, start + query.length);
  parent.append(mark, document.createTextNode(text.slice(start + query.length)));
}

export function initSearch(): void {
  const indexElement = document.getElementById("search-index");
  const modal = document.getElementById("search-modal");
  const trigger = document.getElementById("search-trigger");
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  const count = document.getElementById("search-count");
  const empty = document.getElementById("search-empty");
  if (!indexElement || !modal || !trigger || !(input instanceof HTMLInputElement) || !results || !count || !empty || !(modal instanceof HTMLDialogElement)) return;
  let entries: SearchEntry[];
  try { entries = JSON.parse(indexElement.textContent ?? "[]") as SearchEntry[]; } catch { return; }
  let active = -1;
  const render = (): void => {
    const query = input.value.trim().toLocaleLowerCase();
    const matches = entries.filter((entry) => [entry.program, entry.provider, entry.slug, entry.categoryLabel, ...entry.tags].some((value) => value.toLocaleLowerCase().includes(query)));
    results.replaceChildren();
    matches.slice(0, 50).forEach((entry, index) => {
      const link = document.createElement("a"); link.className = "search-result"; link.href = `/credits/${entry.slug}`; link.role = "option";
      const icon = document.createElement("span"); icon.className = "search-result-icon"; icon.textContent = entry.provider.charAt(0);
      const body = document.createElement("span"); body.className = "search-result-body";
      const top = document.createElement("span"); top.className = "search-result-top";
      const title = document.createElement("span"); title.className = "search-result-title"; addHighlightedText(title, entry.program, query);
      const kind = document.createElement("span"); kind.className = "search-result-kind"; kind.textContent = entry.categoryLabel;
      const subtitle = document.createElement("span"); subtitle.className = "search-result-subtitle"; subtitle.textContent = entry.provider;
      const meta = document.createElement("span"); meta.className = "search-result-meta"; meta.append(Object.assign(document.createElement("span"), { textContent: entry.value }), Object.assign(document.createElement("span"), { textContent: entry.duration }));
      top.append(title, kind); body.append(top, subtitle, meta); link.append(icon, body);
      link.addEventListener("mouseenter", () => { active = index; updateActive(); }); results.append(link);
    });
    active = matches.length ? 0 : -1; updateActive(); count.textContent = `${matches.length} results`; empty.hidden = matches.length > 0;
  };
  const updateActive = (): void => results.querySelectorAll<HTMLElement>(".search-result").forEach((result, index) => result.classList.toggle("is-active", index === active));
  const open = (): void => { modal.showModal(); input.focus(); render(); };
  trigger.addEventListener("click", open); input.addEventListener("input", render);
  modal.addEventListener("close", () => { input.value = ""; results.replaceChildren(); count.textContent = ""; empty.hidden = true; active = -1; });
  document.addEventListener("keydown", (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); open(); } else if (modal.open && event.key === "ArrowDown") { event.preventDefault(); active = Math.min(active + 1, results.children.length - 1); updateActive(); } else if (modal.open && event.key === "ArrowUp") { event.preventDefault(); active = Math.max(active - 1, 0); updateActive(); } else if (modal.open && event.key === "Enter" && active >= 0) { const result = results.children[active]; if (result instanceof HTMLAnchorElement) result.click(); } });
}
