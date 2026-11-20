/**
 * The extension page's two modes, kept on `<html data-ext-mode>` so CSS (extension.css) shows one.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-page-shows-one-mode-at-a-time}
 */
export type ExtMode = "pin" | "usage";

/** `#pin` or `#usage` wins; else `?pinned=0` is pin mode and anything else usage mode. */
export function modeOf(hash: string, search: string): { mode: ExtMode; from: "hash" | "query" } {
  if (hash === "#pin" || hash === "#usage")
    return { mode: hash === "#pin" ? "pin" : "usage", from: "hash" };
  return {
    mode: new URLSearchParams(search).get("pinned") === "0" ? "pin" : "usage",
    from: "query",
  };
}

/**
 * `modeOf` as an inline script that runs before the first paint, written like layout.tsx's unit
 * script. Without it (no JS) the page stays in its server mode, usage, and `#pin` still shows the
 * pin steps through `:target`.
 */
export const MODE_SCRIPT = `try{var h=location.hash,m=h==="#pin"||h==="#usage"?h.slice(1):new URLSearchParams(location.search).get("pinned")==="0"?"pin":"usage";document.documentElement.dataset.extMode=m}catch(e){}`;
