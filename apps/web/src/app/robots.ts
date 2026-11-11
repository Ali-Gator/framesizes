import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

/**
 * Same file on every host: preview deploys are kept out of the index by the host's own header.
 * {@link openspec/specs/seo-base/spec.md#requirement-robotstxt-allows-everything-and-names-the-sitemap}
 */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: absoluteUrl("/sitemap.xml") };
}
