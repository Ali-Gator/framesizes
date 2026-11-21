import { useSyncExternalStore } from "react";

/** What the viewer needs to know about the screen; only the browser knows it. */
export interface ScreenSnap {
  /** The screen's CSS size, not the window's. */
  w: number;
  h: number;
  dpr: number;
  coarse: boolean;
  /** The phone layout: the site's `md` breakpoint. */
  phone: boolean;
}

const PHONE = "(max-width: 767px)";
const COARSE = "(pointer: coarse)";

let cached: ScreenSnap | null = null;

function read(): ScreenSnap {
  const next: ScreenSnap = {
    w: window.screen.width,
    h: window.screen.height,
    dpr: window.devicePixelRatio || 1,
    coarse: window.matchMedia(COARSE).matches,
    phone: window.matchMedia(PHONE).matches,
  };
  // The same object while nothing changed, so React does not render again.
  if (
    cached &&
    cached.w === next.w &&
    cached.h === next.h &&
    cached.dpr === next.dpr &&
    cached.coarse === next.coarse &&
    cached.phone === next.phone
  ) {
    return cached;
  }
  return (cached = next);
}

function subscribe(notify: () => void) {
  const queries = [PHONE, COARSE].map((q) => window.matchMedia(q));
  window.addEventListener("resize", notify);
  queries.forEach((q) => q.addEventListener("change", notify));
  return () => {
    window.removeEventListener("resize", notify);
    queries.forEach((q) => q.removeEventListener("change", notify));
  };
}

/**
 * The screen, or `null` on the server and in the first client render, so hydration matches.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-scale-is-a-guess-until-checked}
 */
export function useScreen(): ScreenSnap | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
