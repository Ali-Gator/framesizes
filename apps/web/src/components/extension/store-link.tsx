import { EXTENSION_ID, storeUrl } from "@/lib/extension";
import { PAGES, type SitePage } from "@/lib/site-map";

/**
 * "Get it from the Chrome Web Store": a plain text link, only while the extension page is live.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-page-links-to-the-store-in-plain-text}
 */
export function StoreLink({
  pages = PAGES,
  extensionId = EXTENSION_ID,
  label = "Get it from the Chrome Web Store",
}: {
  pages?: readonly SitePage[];
  extensionId?: string;
  label?: string;
}) {
  if (!pages.find((p) => p.id === "X1")?.live || !extensionId) return null;
  return (
    <p>
      <a href={storeUrl(extensionId)} target="_blank" rel="noopener">
        {label}
      </a>
    </p>
  );
}
