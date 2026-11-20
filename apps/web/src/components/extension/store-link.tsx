import { EXTENSION_ID, storeUrl } from "@/lib/extension";
import { PAGES, type SitePage } from "@/lib/site-map";

/**
 * "Get it from the Chrome Web Store": a plain text link, only while the extension page is live.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-page-links-to-the-store-in-plain-text}
 */
export function StoreLink({
  pages = PAGES,
  extensionId = EXTENSION_ID,
}: {
  pages?: readonly SitePage[];
  extensionId?: string;
}) {
  if (!pages.find((p) => p.id === "X1")?.live || !extensionId) return null;
  return (
    <p>
      <a href={storeUrl(extensionId)} target="_blank" rel="noopener">
        Get it from the Chrome Web Store
      </a>
    </p>
  );
}
