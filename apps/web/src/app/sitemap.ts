import type { MetadataRoute } from "next";

import { sitemapEntries } from "@/lib/seo";

/** {@link openspec/specs/seo-base/spec.md#requirement-the-sitemap-lists-exactly-the-live-pages} */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries();
}
