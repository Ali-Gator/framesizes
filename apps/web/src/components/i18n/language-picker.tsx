"use client";

import { usePathname } from "next/navigation";
import { type MouseEvent, useId, useRef, useState } from "react";

import {
  fullNative,
  localeByCode,
  localeOf,
  LOCALES,
  localizedPath,
  matchLanguage,
  translatedPage,
} from "@/lib/locales";

import { PICKER_COPY } from "./picker-copy";

import "./language-picker.css";

const Globe = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

/**
 * The header's language button and its modal list of every version of the current page. Renders
 * nothing on a page without translations (and when the path is unknown), so the button and its
 * links are in the server HTML of every translated page and absent everywhere else.
 * {@link openspec/specs/site-shell/spec.md#requirement-the-header-offers-the-language-picker-on-translated-pages}
 * {@link openspec/specs/localization/spec.md#requirement-the-language-picker-lists-every-version-of-the-page}
 * {@link openspec/specs/localization/spec.md#requirement-switching-language-keeps-the-pages-state}
 * {@link openspec/specs/localization/spec.md#requirement-the-pickers-search-matches-english-and-native-names}
 */
export function LanguagePicker() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const titleId = useId();

  if (!pathname) return null;
  const { locale, path } = localeOf(pathname);
  const current = localeByCode(locale);
  const copy = PICKER_COPY[locale];
  if (!translatedPage(path) || !current || !copy) return null;

  const shown = LOCALES.filter((l) => matchLanguage(query, l));

  function show() {
    dialog.current?.showModal();
    setOpen(true);
    search.current?.focus();
  }
  // Escape, the close button and a backdrop click all end here, through the dialog's `close` event.
  function closed() {
    setOpen(false);
    button.current?.focus();
  }
  function onBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialog.current) dialog.current.close();
  }
  // Keeps `?pinned=0` and `#pin` across the switch; the server href stays the clean URL.
  function keepState(event: MouseEvent<HTMLAnchorElement>) {
    const link = event.currentTarget;
    link.href = `${link.pathname}${location.search}${location.hash}`;
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        className="lp-trig"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={show}
      >
        <Globe />
        <span className="sr-only">{`${copy.prefix}: `}</span>
        <span className="lp-trig-name" lang={current.hreflang} dir="auto">
          {fullNative(current)}
        </span>
        <svg className="lp-chev" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <dialog
        ref={dialog}
        className="lp-dlg"
        aria-labelledby={titleId}
        lang={current.hreflang}
        dir={current.dir}
        onClose={closed}
        onClick={onBackdrop}
      >
        <div className="lp-head">
          <p id={titleId} className="lp-title">
            {copy.title}
          </p>
          <button
            type="button"
            className="lp-x"
            aria-label={copy.close}
            onClick={() => dialog.current?.close()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <label className="lp-search">
          <span className="sr-only">{copy.search}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.placeholder}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <div className="lp-list">
          <ul className="lp-grid">
            {LOCALES.map((l) => (
              <li key={l.code} hidden={!shown.includes(l)}>
                <a
                  className="lp-item"
                  href={localizedPath(l.code, path)}
                  hrefLang={l.hreflang}
                  aria-current={l.code === locale ? "page" : undefined}
                  onClick={keepState}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- a decorative 24 px SVG */}
                  <img
                    className="lp-flag"
                    src={`/flags/${l.flag}.svg`}
                    alt=""
                    width={24}
                    height={18}
                    loading="lazy"
                  />
                  <span className="lp-name" lang={l.hreflang} dir="auto">
                    <span>{l.native}</span>
                    {l.region && <span className="lp-region">{l.region}</span>}
                  </span>
                  {l.code === locale && (
                    <svg className="lp-check" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </a>
              </li>
            ))}
          </ul>
          <div role="status" aria-live="polite">
            {shown.length === 0 && (
              <div className="lp-none">
                <p className="lp-none-t">{copy.none}</p>
                <p className="lp-none-h">{copy.hint}</p>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
