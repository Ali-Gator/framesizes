import Link from "next/link";
import type { ReactNode } from "react";

import { page, type PageId } from "@/lib/site-map";

/**
 * An in-text link to a launch page: a link when the page is live, its text otherwise.
 * {@link openspec/specs/seo-base/spec.md#requirement-a-link-appears-only-when-its-target-page-is-live}
 */
export function PageLink({ id, children }: { id: PageId; children: ReactNode }) {
  const target = page(id);
  return target.live ? <Link href={target.path}>{children}</Link> : <>{children}</>;
}

/**
 * Text that exists only to send the visitor to another page: rendered only while that page is live.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-page-links-only-to-live-pages}
 */
export function IfLive({ page: id, children }: { page: PageId; children: ReactNode }) {
  return page(id).live ? <>{children}</> : null;
}
