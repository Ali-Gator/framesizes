import Link from "next/link";

import type { FooterGroup } from "@/lib/site-map";

import { HOME_LINK_NAME, Lockup } from "./site-header";

/** {@link openspec/specs/site-shell/spec.md#requirement-the-footer-lists-the-live-pages-by-hub} */
export function SiteFooter({ groups }: { groups: FooterGroup[] }) {
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
                    <Link
                      href={link.href}
                      className="block text-sm leading-8 text-ink underline decoration-line-strong underline-offset-[3px] hover:decoration-tape hover:decoration-2"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
