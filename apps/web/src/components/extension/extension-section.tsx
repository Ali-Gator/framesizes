import { EDGE_EXTENSION_ID, EXTENSION_ID, STORES } from "@/lib/extension";
import { PAGES, type SitePage } from "@/lib/site-map";

import { ByStore } from "./by-store";
import { ExtensionStatus } from "./extension-status";
import { PrintFigure } from "./figures";
import { storeScript } from "./store";

/** The extension's store icon: the nested-frames mark in white and tape on an ink square. */
function AppIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="ext-sec-icon">
      <rect width="64" height="64" rx="14" className="pp-ink" />
      <g fill="none" stroke="#fff" strokeWidth="4.5" strokeLinejoin="round">
        <rect x="13" y="13" width="38" height="38" />
        <rect x="13" y="27" width="24" height="24" />
      </g>
      <rect
        x="13"
        y="40"
        width="11"
        height="11"
        className="pp-tape"
        stroke="#fff"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The extension section under the widget on G1 and F2: one card, only while the extension page
 * (X1) is live. It picks the store from the browser alone, and builds Edge's lines only once Edge's
 * store id is set; until then Edge visitors see the Chrome section.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-extension-section-sits-under-the-widget-on-g1-and-f2}
 * {@link openspec/specs/extension-site/spec.md#requirement-edge-appears-only-with-its-store-id}
 */
export function ExtensionSection({
  pages = PAGES,
  extensionId = EXTENSION_ID,
  edgeId = EDGE_EXTENSION_ID,
}: {
  pages?: readonly SitePage[];
  extensionId?: string;
  edgeId?: string;
}) {
  if (!pages.find((p) => p.id === "X1")?.live || !extensionId) return null;
  const stores = edgeId ? (["chrome", "edge"] as const) : (["chrome"] as const);
  const [c, e] = [STORES.chrome.section, STORES.edge.section];
  return (
    <section className="ext-sec" aria-labelledby="ext-sec-h">
      <script dangerouslySetInnerHTML={{ __html: storeScript(false) }} />
      <div className="ext-sec-main">
        <AppIcon />
        <div className="ext-sec-text">
          <p className="label text-ink-muted">
            <ByStore stores={stores} chrome={c.label} edge={e.label} />
          </p>
          <h2 id="ext-sec-h" className="h3">
            Plan on any shop&apos;s page
          </h2>
          <p className="max-w-[560px]">
            Gallery Wall Layout Generator puts the gallery wall planner in{" "}
            <ByStore stores={stores} chrome={c.sidePanel} edge={e.sidePanel} />, so you can
            right-click a print on any shop and see it on your wall at true size.
          </p>
          <ExtensionStatus extensionId={extensionId} edgeId={edgeId} />
        </div>
      </div>
      <div className="ext-sec-fig">
        <PrintFigure label="A print hanging above a sofa at true size, as the side panel shows it" />
      </div>
    </section>
  );
}
