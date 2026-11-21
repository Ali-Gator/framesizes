import Link from "next/link";

import { addressLine, COMPANY } from "@/lib/company";
import type { FooterGroup } from "@/lib/site-map";

import { HOME_LINK_NAME, Lockup } from "./site-header";

/**
 * The hub groups, then the company row: owner, address and the pages with no hub.
 * {@link openspec/specs/site-shell/spec.md#requirement-the-footer-lists-the-live-pages-by-hub}
 */
export function SiteFooter({
  groups,
  company = [],
}: {
  groups: FooterGroup[];
  company?: FooterGroup["links"];
}) {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-content flex-wrap items-start justify-between gap-x-12 gap-y-6 px-4 pt-8 pb-12">
        <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-3">
          <Link
            href="/"
            aria-label={HOME_LINK_NAME}
            className="inline-flex items-center gap-2 self-start text-ink"
          >
            <Lockup />
          </Link>
          <p className="max-w-[420px] small text-ink-muted">
            Sizes are nominal. Measure your frame&apos;s opening before you order a print.
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="grid min-w-0 flex-[3_1_560px] grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6"
        >
          {groups.map((group) => (
            <div key={group.name}>
              <h2 className="label text-ink-muted">{group.name}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="block text-sm leading-8 link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      {/* {@link openspec/specs/site-shell/spec.md#scenario-the-company-row} */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-content flex-wrap items-baseline justify-between gap-x-8 gap-y-3 px-4 py-6 small text-ink-muted">
          <p>
            © {new Date().getFullYear()} {COMPANY.legalName} · {addressLine()}
          </p>
          {company.length > 0 && (
            <nav aria-label="Company">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {company.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
