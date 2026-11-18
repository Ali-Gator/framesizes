import "@fontsource/schibsted-grotesk/latin-400.css";
import "@fontsource/schibsted-grotesk/latin-500.css";
import "@fontsource/schibsted-grotesk/latin-600.css";
import "@fontsource/schibsted-grotesk/latin-700.css";
import "@fontsource/schibsted-grotesk/latin-800.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./extension.css";

import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";

/**
 * Renders an extension page. The stored unit lands on `<html data-unit>` before the first render,
 * as the site's head script does; MV3 pages allow no inline script.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-units-are-shared-and-kept}
 */
export function boot(page: ReactNode) {
  try {
    if (localStorage.getItem("unit") === "cm") document.documentElement.dataset.unit = "cm";
  } catch {
    // Storage blocked: inches, as on the site.
  }
  const root = document.getElementById("root");
  if (root) createRoot(root).render(page);
}
