"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { fullNative, localeByCode, localeOf, translatedPage } from "@/lib/locales";

/**
 * Holds the button's box while its code loads after an in-app move, so the Units toggle stays put.
 * Its utilities copy `.lp-trig` in language-picker.css (not imported: `/` loads none of the picker's
 * styles); the bare `lp-trig` class lets the header's `has-[.lp-trig]` rules apply meanwhile.
 * {@link openspec/specs/site-shell/spec.md#scenario-an-in-app-move-to-a-translated-page-keeps-the-header-still}
 */
function PickerPlaceholder() {
  const current = localeByCode(localeOf(usePathname() ?? "").locale);
  return (
    <span
      aria-hidden="true"
      className="lp-trig invisible box-border inline-flex h-11 flex-none items-center gap-2 border-[1.5px] ps-3 pe-3.5 font-sans text-[15px] leading-5 font-semibold whitespace-nowrap max-[599px]:w-11 max-[599px]:justify-center max-[599px]:p-0"
    >
      <span className="size-[18px] flex-none" />
      <span className="max-[599px]:hidden">{current && fullNative(current)}</span>
      <span className="size-4 flex-none max-[599px]:hidden" />
    </span>
  );
}

/** Server-rendered on translated pages (SSR stays on, so the button is in their static HTML). */
const LanguagePicker = dynamic(() => import("./language-picker").then((m) => m.LanguagePicker));

/**
 * For a picker that first appears after an in-app move. `loading` wraps it in Suspense, which on the
 * server would stream the button outside the header, so the server and hydration never use it.
 */
const LanguagePickerAfterMove = dynamic(
  () => import("./language-picker").then((m) => m.LanguagePicker),
  { loading: PickerPlaceholder },
);

/**
 * Mounts the language picker only on a page with translations, so every other page loads none of
 * its script, copy or styles.
 * {@link openspec/specs/site-shell/spec.md#scenario-a-page-without-translations-loads-no-picker-code}
 */
export function LanguagePickerGate() {
  const pathname = usePathname();
  const shown = !!pathname && translatedPage(localeOf(pathname).path);
  // The header lives in the root layout, so this is fixed for the whole visit: a picker shown from
  // the first render keeps the server's version; one that appears later gets the placeholder.
  const [shownFirst] = useState(shown);
  if (!shown) return null;
  return shownFirst ? <LanguagePicker /> : <LanguagePickerAfterMove />;
}
