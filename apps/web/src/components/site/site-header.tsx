import Link from "next/link";

import type { HubLink } from "@/lib/site-map";

import { HubNav } from "./hub-nav";
import { LogoMark } from "./logo-mark";
import { UnitToggle } from "./unit-toggle";

/** Contains the visible wordmark, so voice users can say what they see (WCAG 2.5.3). */
export const HOME_LINK_NAME = "framesizes.app home";

/** The lockup: nested-frames mark and the type wordmark; `.app` drops below 390px. */
export function Lockup() {
  return (
    <>
      <LogoMark />
      <span className="text-xl font-extrabold tracking-[-0.03em]">
        framesizes
        <span className="ml-0.5 font-mono text-sm font-medium tracking-normal text-ink-muted max-[390px]:hidden">
          .app
        </span>
      </span>
    </>
  );
}

/**
 * {@link openspec/specs/site-shell/spec.md#requirement-every-page-renders-inside-one-shell}
 * {@link openspec/specs/site-shell/spec.md#requirement-the-header-lists-the-live-hubs}
 */
export function SiteHeader({ hubs }: { hubs: HubLink[] }) {
  return (
    <header className="border-b border-line bg-wall">
      <div className="mx-auto flex max-w-content flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 min-[600px]:gap-x-4 min-[900px]:h-16 min-[900px]:flex-nowrap min-[900px]:gap-6 min-[900px]:py-0">
        <Link
          href="/"
          aria-label={HOME_LINK_NAME}
          className="order-1 inline-flex shrink-0 items-center gap-2 text-ink"
        >
          <Lockup />
        </Link>
        <div className="order-2 ml-auto shrink-0 min-[900px]:order-3">
          <UnitToggle />
        </div>
        {hubs.length >= 2 && <HubNav links={hubs} />}
      </div>
    </header>
  );
}
