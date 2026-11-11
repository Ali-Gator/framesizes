import { useSyncExternalStore } from "react";

export type Unit = "in" | "cm";

const KEY = "unit";
const listeners = new Set<() => void>();
/** The choice made in this page view; it outlives a storage that throws. */
let chosen: Unit | null = null;
/** The stored choice, read once and again after another tab writes it. */
let cached: Unit | null | undefined;

function stored(): Unit | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "in" || value === "cm" ? value : null;
  } catch {
    return null;
  }
}

const snapshot = (): Unit =>
  chosen ?? (cached === undefined ? (cached = stored()) : cached) ?? "in";

function onStorage(event: StorageEvent) {
  if (event.key !== KEY) return;
  chosen = null; // another tab chose: storage is the truth again
  cached = undefined;
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/**
 * The site-wide in/cm preference: "in" on the server and for a first visit, then the stored choice.
 * Never in the URL: a shared link opens in the reader's own unit.
 * {@link openspec/specs/site-shell/spec.md#requirement-the-unit-choice-is-one-site-wide-preference}
 */
export function useUnit(): Unit {
  return useSyncExternalStore(subscribe, snapshot, () => "in");
}

export function setUnit(unit: Unit) {
  chosen = unit;
  try {
    window.localStorage.setItem(KEY, unit);
  } catch {
    // Storage blocked: the choice lasts for this page view.
  }
  listeners.forEach((notify) => notify());
}
