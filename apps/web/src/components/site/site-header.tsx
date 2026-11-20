import Link from "next/link";

import { LanguagePicker } from "@/components/i18n/language-picker";
import type { HubLink } from "@/lib/site-map";

import { HubNav } from "./hub-nav";
import { LogoMark } from "./logo-mark";
import { UnitToggle } from "./unit-toggle";

/** Contains the visible wordmark, so voice users can say what they see (WCAG 2.5.3). */
export const HOME_LINK_NAME = "framesizes.app home";

/** The lockup: nested-frames mark and the type wordmark; `.app` drops below 390px, and the wordmark shrinks there in a header with the language button. */
export function Lockup() {
  return (
    <>
      <LogoMark />
      <span className="text-xl font-extrabold tracking-[-0.03em] max-[359px]:text-lg max-[389px]:[header:has(.lp-trig)_&]:text-lg">
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
 * {@link openspec/specs/site-shell/spec.md#requirement-the-header-offers-the-language-picker-on-translated-pages}
 */
export function SiteHeader({ hubs }: { hubs: HubLink[] }) {
  return (
    <header className="border-b border-line bg-wall">
      {/* Below 360px the row tightens so the lockup, the toggle and the menu button share one row, with room for wider Linux and Android text metrics. */}
      {/* With the language button (translated pages) the phone row takes the below-360px gaps up to 600px, so the menu button keeps its place at 360px and up. */}
      <div className="mx-auto flex max-w-content flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 max-[359px]:gap-x-1 max-[599px]:has-[.lp-trig]:gap-x-1 min-[600px]:gap-x-4 min-[900px]:h-16 min-[900px]:flex-nowrap min-[900px]:gap-6 min-[900px]:py-0">
        <Link
          href="/"
          aria-label={HOME_LINK_NAME}
          className="order-1 inline-flex shrink-0 items-center gap-2 text-ink max-[359px]:gap-1.5 max-[359px]:[&_svg]:size-7"
        >
          <Lockup />
        </Link>
        {/* The language button shows only on pages with translations, before the Units toggle. */}
        <div className="order-2 ml-auto flex shrink-0 items-center gap-1 max-[359px]:[&_[role=radio]]:px-2 max-[599px]:has-[.lp-trig]:[&_[role=radio]]:px-2 min-[600px]:gap-3 min-[900px]:order-3">
          <LanguagePicker />
          <UnitToggle />
        </div>
        {hubs.length >= 2 && <HubNav links={hubs} />}
      </div>
    </header>
  );
}
