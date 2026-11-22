"use client";

import { useEffect } from "react";

import { askExtension } from "@/lib/extension";

import { modeOf } from "./mode";

/** How often pin mode asks the extension whether its button is pinned yet. */
const POLL_MS = 2000;

/**
 * Keeps `<html data-ext-mode>` in step with the URL: on mount (a client-side visit runs no inline
 * script) and on `hashchange`, which also moves focus to the shown section's heading. In pin mode
 * from `?pinned=0` with no hash, it asks the extension every 2 s while the tab is visible and
 * switches to usage on the first pinned reply, then drops `pinned` from the address in place (hash,
 * other parameters and `history.state` kept), so a reload stays in usage mode. This one component
 * serves the English and every translated route. Renders nothing.
 * {@link openspec/specs/extension-site/spec.md#requirement-each-mode-links-to-the-other}
 * {@link openspec/specs/extension-site/spec.md#requirement-pin-mode-switches-itself-once-the-button-is-pinned}
 */
export function ModeSwitch({ extensionId }: { extensionId: string }) {
  useEffect(() => {
    const html = document.documentElement;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Each run of the poll has its own token, so a reply to a stopped run is ignored.
    let run = 0;
    const stop = () => {
      run += 1;
      clearTimeout(timer);
    };
    const heading = (mode: string) =>
      document.getElementById(mode)?.querySelector<HTMLElement>("h2");

    // A setTimeout chained after each answer, so a slow reply never overlaps the next question.
    const poll = async (token: number) => {
      if (document.visibilityState === "visible") {
        const status = await askExtension(extensionId);
        if (token !== run) return;
        if (status.installed && status.pinned) {
          stop();
          const hadFocus = document.getElementById("pin")?.contains(document.activeElement);
          html.dataset.extMode = "usage";
          const url = new URL(location.href);
          url.searchParams.delete("pinned");
          // Keep history.state: the App Router keeps its tree there.
          history.replaceState(history.state, "", url);
          // The pin section is about to vanish under the focus; carry it to the shown heading.
          if (hadFocus) heading("usage")?.focus();
          return;
        }
      }
      timer = setTimeout(() => void poll(token), POLL_MS);
    };

    /** Sets the mode from the URL and polls only in pin mode from `?pinned=0` with no hash. */
    const apply = () => {
      stop();
      const current = modeOf(location.hash, location.search);
      html.dataset.extMode = current.mode;
      if (current.mode === "pin" && current.from === "query" && extensionId) void poll(run);
      return current;
    };

    apply();

    const onHash = () => {
      const { mode, from } = apply();
      // A switch link moves focus to the shown section; a hash cleared by Back does not.
      if (from === "hash") heading(mode)?.focus();
    };
    window.addEventListener("hashchange", onHash);
    return () => {
      stop();
      window.removeEventListener("hashchange", onHash);
      delete html.dataset.extMode;
    };
  }, [extensionId]);
  return null;
}
