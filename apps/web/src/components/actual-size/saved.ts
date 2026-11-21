import type { Method } from "./state";

/*
 * The scale check, kept in this browser with the screen it was made on. Nothing leaves the device.
 * {@link openspec/specs/actual-size/spec.md#requirement-a-check-is-kept-on-the-device-for-the-same-screen}
 */

const KEY = "screen-scale";
const METHODS: readonly Method[] = ["card", "ruler", "sheet", "screen"];

export interface Check {
  scale: number;
  method: Method;
}

/** A screen's CSS size and device pixel ratio. */
export interface ScreenKey {
  w: number;
  h: number;
  dpr: number;
}

type Stored = Check & ScreenKey;

/** The check made in this page view; it outlives a storage that throws. */
let memory: Stored | null = null;

const same = (a: ScreenKey, b: ScreenKey) => a.w === b.w && a.h === b.h && a.dpr === b.dpr;

function parse(text: string | null): Stored | null {
  if (!text) return null;
  try {
    const v = JSON.parse(text) as Partial<Stored>;
    const nums = [v.scale, v.w, v.h, v.dpr];
    if (!nums.every((n) => typeof n === "number" && Number.isFinite(n) && n > 0)) return null;
    if (!METHODS.includes(v.method as Method)) return null;
    return v as Stored;
  } catch {
    return null;
  }
}

/** The saved check, only while the screen's width, height and pixel ratio are the ones it was made on. */
export function loadCheck(screen: ScreenKey): Check | null {
  let stored = memory;
  if (!stored) {
    try {
      stored = parse(window.localStorage.getItem(KEY));
    } catch {
      stored = null;
    }
  }
  return stored && same(stored, screen) ? { scale: stored.scale, method: stored.method } : null;
}

export function saveCheck(check: Check, screen: ScreenKey) {
  memory = { ...check, ...screen };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    // Storage blocked: the check lasts for this page view.
  }
}

/** Drops the page view's copy, as a new page view would. For tests. */
export function forgetCheck() {
  memory = null;
}
