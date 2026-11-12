import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/**
 * Our last write, until the address bar shows it: a browser may drop `replaceState` calls when
 * they come too fast (Chrome throttles, Safari throws), and the widget must still follow.
 */
let pending: string | null = null;
let watching = false;

/**
 * Notices every history change, not only `popstate`: Next's soft navigation (the logo link back to
 * `/`) calls `history.pushState`. Installed once and never removed, so it composes with Next's own
 * patch whichever is installed first.
 */
function watchHistory() {
  if (watching) return;
  watching = true;
  const push = window.history.pushState;
  window.history.pushState = function pushState(this: History, ...args) {
    push.apply(this, args);
    pending = null;
    queueMicrotask(notify);
  };
  window.addEventListener("popstate", () => {
    pending = null;
    notify();
  });
}

function subscribe(listener: () => void) {
  watchHistory();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The query string as the widget sees it right now (a write the browser dropped included). */
export function currentSearch() {
  if (pending !== null && window.location.search === pending) pending = null;
  return pending ?? window.location.search;
}
/** The prerendered page has no query string: the server, and hydration, see the defaults. */
const serverSnapshot = () => "";

/**
 * The page's query string (`?…` or `""`). Hydration renders with `""`, matching the static HTML,
 * then React re-renders once with the real query string.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-widgets-state-lives-in-the-url}
 */
export function useSearch(): string {
  return useSyncExternalStore(subscribe, currentSearch, serverSnapshot);
}

/** Replaces the query string (`search` without `?`; `""` clears it) without a history entry. */
export function replaceSearch(search: string) {
  const next = search ? `?${search}` : "";
  if (next === currentSearch()) return;
  const { pathname, hash } = window.location;
  try {
    // Next's docs name native replaceState as supported and router-aware.
    window.history.replaceState(null, "", `${pathname}${next}${hash}`);
  } catch {
    // Too many calls (Safari): the state still applies through `pending`.
  }
  pending = next;
  notify();
}
