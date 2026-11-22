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
/** Whether the check last loaded or saved is in storage, not only in `memory`. */
let fromStorage = false;

/** A screen by its shorter and longer side and its pixel ratio: rotating a phone keeps its key. */
export const screenKey = ({ w, h, dpr }: ScreenKey) => `${Math.min(w, h)}x${Math.max(w, h)}@${dpr}`;

const same = (a: ScreenKey, b: ScreenKey) => screenKey(a) === screenKey(b);

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

/** The saved check, only while the screen's sides and pixel ratio are the ones it was made on. */
export function loadCheck(screen: ScreenKey): Check | null {
  let stored = memory;
  if (!stored) {
    try {
      stored = parse(window.localStorage.getItem(KEY));
    } catch {
      stored = null;
    }
    fromStorage = stored !== null;
  }
  return stored && same(stored, screen) ? { scale: stored.scale, method: stored.method } : null;
}

/** Keeps the check; `false` when storage refused it and it lasts only for this page view. */
export function saveCheck(check: Check, screen: ScreenKey): boolean {
  memory = { ...check, w: screen.w, h: screen.h, dpr: screen.dpr };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(memory));
    fromStorage = true;
  } catch {
    fromStorage = false;
  }
  return fromStorage;
}

/** Whether the check `loadCheck` or `saveCheck` last handled is stored, so a later visit has it. */
export function checkStored() {
  return fromStorage;
}

/** Drops the page view's copy, as a new page view would. For tests. */
export function forgetCheck() {
  memory = null;
  fromStorage = false;
}
