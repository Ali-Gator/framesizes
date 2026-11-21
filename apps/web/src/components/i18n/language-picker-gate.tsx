"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import { localeOf, translatedPage } from "@/lib/locales";

/** Server-rendered on translated pages (SSR stays on, so the button is in their static HTML). */
const LanguagePicker = dynamic(() => import("./language-picker").then((m) => m.LanguagePicker));

/**
 * Mounts the language picker only on a page with translations, so every other page loads none of
 * its script, copy or styles.
 * {@link openspec/specs/site-shell/spec.md#scenario-a-page-without-translations-loads-no-picker-code}
 */
export function LanguagePickerGate() {
  const pathname = usePathname();
  if (!pathname || !translatedPage(localeOf(pathname).path)) return null;
  return <LanguagePicker />;
}
