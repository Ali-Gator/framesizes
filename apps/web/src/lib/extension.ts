/**
 * The extension "Gallery Wall Layout Generator" as the site sees it: each store's id and page
 * (Chrome Web Store, Microsoft Edge Add-ons), the section's words per store, and the status
 * question it answers for framesizes.app (apps/extension background.ts).
 */

/**
 * The published listing's Chrome Web Store id. It goes with X1 `live: true` in site-map.ts: the unit
 * suite refuses one without the other, so a rollback sets it to "" and X1 `live: false` together.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-extension-page-goes-live-only-with-a-store-id}
 */
export const EXTENSION_ID: string = "khapjkonaofjfljdakdcmodaclkmffgn";

export const storeUrl = (id: string) => `https://chromewebstore.google.com/detail/${id}`;
export const STORE_URL = storeUrl(EXTENSION_ID);

/**
 * The Microsoft Edge Add-ons id (Partner Center's CRX id). While it is "", no page links to Edge's
 * store or asks an Edge id; the go-live sets it once the listing is published.
 * {@link openspec/specs/extension-site/spec.md#requirement-edge-appears-only-with-its-store-id}
 */
export const EDGE_EXTENSION_ID: string = "";

/** The stores the site builds, each with its page and the G1/F2 section's English words. */
export const STORES = {
  chrome: {
    pageUrl: storeUrl,
    section: {
      label: "Chrome extension",
      sidePanel: "Chrome's side panel",
      add: "Add to Chrome",
      opens: "Opens the Chrome Web Store",
      phone: "Chrome on phones doesn't run extensions. Open this page on a computer to add it.",
      have: "You have it. Click its button in Chrome's toolbar to open the side panel.",
    },
  },
  edge: {
    pageUrl: (id: string) => `https://microsoftedge.microsoft.com/addons/detail/${id}`,
    section: {
      label: "Edge extension",
      sidePanel: "Edge's side panel",
      add: "Add to Edge",
      opens: "Opens Microsoft Edge Add-ons",
      phone: "This extension runs in Edge on a computer. Open this page on a computer to add it.",
      have: "You have it. Click its button in Edge's toolbar to open the side panel.",
    },
  },
} as const;

/** The set store ids, Chrome's first. */
export const knownIds = (chrome = EXTENSION_ID, edge = EDGE_EXTENSION_ID) =>
  [chrome, edge].filter(Boolean);

export type ExtensionStatus = { installed: false } | { installed: true; pinned: boolean };

const NOT_INSTALLED: ExtensionStatus = { installed: false };

type Runtime = {
  sendMessage?: (id: string, message: unknown, reply: (answer: unknown) => void) => void;
  lastError?: unknown;
};

/**
 * Asks the extension `{ type: "status" }`. Never rejects: no id, no `chrome.runtime.sendMessage`
 * (no extension lists this origin), a throw, `lastError` (wrong id), a malformed reply, or no reply
 * within `timeout` ms all read as not installed. Sends nothing for an empty id.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-status-client-asks-the-extension-and-never-throws}
 */
export function askExtension(id: string, timeout = 1000): Promise<ExtensionStatus> {
  const runtime = (globalThis as { chrome?: { runtime?: Runtime } }).chrome?.runtime;
  const send = runtime?.sendMessage;
  if (!id || !runtime || typeof send !== "function") return Promise.resolve(NOT_INSTALLED);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(NOT_INSTALLED), timeout);
    const done = (status: ExtensionStatus) => {
      clearTimeout(timer);
      resolve(status);
    };
    try {
      send.call(runtime, id, { type: "status" }, (answer) => {
        // Reading lastError in the callback also keeps Chrome from logging it as unchecked.
        if (runtime.lastError) return done(NOT_INSTALLED);
        const reply = answer as { installed?: unknown; pinned?: unknown } | null | undefined;
        done(
          reply?.installed === true && typeof reply.pinned === "boolean"
            ? { installed: true, pinned: reply.pinned }
            : NOT_INSTALLED,
        );
      });
    } catch {
      done(NOT_INSTALLED);
    }
  });
}

/**
 * Asks every id at once, each with `askExtension`'s timeout. Installed when any reply says so,
 * pinned when any installed reply says pinned. Never rejects; sends nothing for no ids.
 * {@link openspec/specs/extension-site/spec.md#requirement-pin-mode-switches-itself-once-the-button-is-pinned}
 */
export async function askExtensions(ids: readonly string[]): Promise<ExtensionStatus> {
  const replies = await Promise.all(ids.map((id) => askExtension(id)));
  const installed = replies.filter((r) => r.installed);
  return installed.length
    ? { installed: true, pinned: installed.some((r) => r.pinned) }
    : NOT_INSTALLED;
}
