import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("popstate", notify);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("popstate", notify);
  };
}

const snapshot = () => window.location.search;
/** The prerendered page has no query string: the server, and hydration, see the defaults. */
const serverSnapshot = () => "";

/**
 * The page's query string (`?…` or `""`). Hydration renders with `""`, matching the static HTML,
 * then React re-renders once with the real query string.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-widgets-state-lives-in-the-url}
 */
export function useSearch(): string {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

/** Replaces the query string (`search` without `?`; `""` clears it) without a history entry. */
export function replaceSearch(search: string) {
  const { pathname, hash } = window.location;
  // Next's docs name native replaceState as supported and router-aware.
  window.history.replaceState(null, "", `${pathname}${search ? `?${search}` : ""}${hash}`);
  notify();
}
