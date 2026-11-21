import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { breadcrumbJsonLd, breadcrumbTrail, companyPageJsonLd, jsonLdScript } from "@/lib/seo";
import { livePage, type PageId } from "@/lib/site-map";

/** "2026-11-21" as "November 21, 2026", fixed to UTC so the server and the date agree. */
const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

/**
 * The text layout of a company page: breadcrumbs, the `h1`, an optional "Last updated" line, the
 * sections, and one JSON-LD script (the page node and organization for About and Contact, the
 * breadcrumbs alone otherwise). No widget, no client JavaScript.
 * {@link openspec/specs/company-pages/spec.md#requirement-the-five-company-pages-exist-at-their-own-urls}
 * {@link openspec/specs/company-pages/spec.md#requirement-the-policies-show-when-they-last-changed}
 */
export function CompanyPage({
  id,
  schema,
  updated = false,
  lead,
  children,
}: {
  id: PageId;
  /** About and Contact describe the organization; the policies carry breadcrumbs only. */
  schema?: "AboutPage" | "ContactPage";
  /** Show "Last updated" with the page's content date (the three policies). */
  updated?: boolean;
  lead?: ReactNode;
  children: ReactNode;
}) {
  const target = livePage(id);
  const date = target.seo.lastModified;
  const jsonLd = schema ? companyPageJsonLd(target, schema) : breadcrumbJsonLd(target);
  return (
    <div className="page flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <Breadcrumbs
          items={breadcrumbTrail(target).map((crumb) => ({ href: crumb.path, label: crumb.name }))}
        />
        <h1 className="display md:display-xl">{target.seo.h1}</h1>
        {updated && (
          <p className="small text-ink-muted">
            Last updated <time dateTime={date}>{longDate(date)}</time>
          </p>
        )}
        {lead}
      </div>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
    </div>
  );
}

/** A section under an `h2`, prose width. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex max-w-prose flex-col gap-4">
      <h2 className="h2">{title}</h2>
      {children}
    </section>
  );
}
