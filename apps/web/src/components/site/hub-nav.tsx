"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { MenuIcon, XIcon } from "@/components/ui/icons";
import type { HubLink } from "@/lib/site-map";

const LIST_ID = "site-hubs";

/**
 * Hub links and, below 600px, the menu button that shows them. The links are always in the HTML;
 * a closed menu only hides them, and an open one pushes the page down.
 * {@link openspec/specs/site-shell/spec.md#requirement-hub-links-collapse-behind-a-menu-button-on-narrow-screens}
 */
export function HubNav({ links }: { links: HubLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={LIST_ID}
        onClick={() => setOpen(!open)}
        className="order-3 grid size-control-md shrink-0 cursor-pointer place-items-center rounded-pill border-[1.5px] border-line-strong text-ink hover:border-ink min-[600px]:hidden"
      >
        {open ? <XIcon /> : <MenuIcon />}
      </button>
      <nav
        id={LIST_ID}
        aria-label="Hubs"
        className={`${open ? "flex" : "hidden"} order-4 basis-full flex-col border-t border-line min-[600px]:flex min-[600px]:flex-row min-[600px]:overflow-x-auto min-[600px]:border-t-0 min-[900px]:order-2 min-[900px]:flex-1 min-[900px]:basis-auto min-[900px]:gap-1`}
      >
        {links.map((link) => {
          const current = pathname !== null && link.paths.includes(pathname);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={current ? "page" : undefined}
              className={`whitespace-nowrap border-b border-line px-3 py-3 text-[17px] last:border-b-0 hover:bg-stage hover:text-ink min-[600px]:border-b-0 min-[600px]:py-2.5 min-[600px]:text-[15px] min-[900px]:py-2 ${
                current
                  ? "font-bold text-ink shadow-[inset_3px_0_0_var(--ink)] min-[600px]:rounded-none min-[600px]:shadow-[inset_0_-2px_0_var(--ink)]"
                  : "font-medium text-ink-muted min-[900px]:rounded-pill"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
