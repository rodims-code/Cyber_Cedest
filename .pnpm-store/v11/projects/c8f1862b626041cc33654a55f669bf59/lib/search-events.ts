export const OPEN_SEARCH_EVENT = "cedest:open-search";

export function openSearchPalette() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
}
