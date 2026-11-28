import { EDGE_EXTENSION_ID, EXTENSION_ID, STORES } from "@/lib/extension";
import { PAGES, type SitePage } from "@/lib/site-map";

import { ByStore } from "./by-store";

const link = (href: string, label: string) => (
  <p>
    <a href={href} target="_blank" rel="noopener">
      {label}
    </a>
  </p>
);

/**
 * The picked store's plain text link, only while the extension page is live: "Get it from the
 * Chrome Web Store", and Edge's "Get it from Microsoft Edge Add-ons" only once Edge's id is set.
 * Before that an Edge visitor sees no store link.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-page-links-to-the-store-in-plain-text}
 * {@link openspec/specs/extension-site/spec.md#requirement-edge-appears-only-with-its-store-id}
 */
export function StoreLink({
  pages = PAGES,
  extensionId = EXTENSION_ID,
  edgeId = EDGE_EXTENSION_ID,
  label = "Get it from the Chrome Web Store",
  edgeLabel = "Get it from Microsoft Edge Add-ons",
}: {
  pages?: readonly SitePage[];
  extensionId?: string;
  edgeId?: string;
  label?: string;
  edgeLabel?: string;
}) {
  if (!pages.find((p) => p.id === "X1")?.live || !extensionId) return null;
  return (
    <ByStore
      as="div"
      stores={["chrome", "edge"]}
      chrome={link(STORES.chrome.pageUrl(extensionId), label)}
      edge={edgeId ? link(STORES.edge.pageUrl(edgeId), edgeLabel) : null}
    />
  );
}
