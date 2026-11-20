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
 * switches to usage on the first pinned reply. Renders nothing.
 * {@link openspec/specs/extension-site/spec.md#requirement-each-mode-links-to-the-other}
 * {@link openspec/specs/extension-site/spec.md#requirement-pin-mode-switches-itself-once-the-button-is-pinned}
 */
export function ModeSwitch({ extensionId }: { extensionId: string }) {
  useEffect(() => {
    const html = document.documentElement;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let polling = true;
    const stop = () => {
      polling = false;
      clearTimeout(timer);
    };
    const apply = () => {
      const current = modeOf(location.hash, location.search);
      html.dataset.extMode = current.mode;
      return current;
    };

    // A setTimeout chained after each answer, so a slow reply never overlaps the next question.
    const poll = async () => {
      if (document.visibilityState === "visible") {
        const status = await askExtension(extensionId);
        if (!polling) return;
        if (status.installed && status.pinned) {
          stop();
          html.dataset.extMode = "usage";
          return;
        }
      }
      timer = setTimeout(() => void poll(), POLL_MS);
    };

    const first = apply();
    if (first.mode === "pin" && first.from === "query" && extensionId) void poll();
    else stop();

    const onHash = () => {
      stop();
      const { mode } = apply();
      document.getElementById(mode)?.querySelector<HTMLElement>("h2")?.focus();
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
