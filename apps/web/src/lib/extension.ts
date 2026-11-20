/**
 * The Chrome extension "Gallery Wall Layout Generator" as the site sees it: its store id, its store
 * page, and the status question it answers for framesizes.app (apps/extension background.ts).
 */

/**
 * The extension's Chrome Web Store id: empty until the listing is approved. Setting it, together with
 * X1 `live: true` in site-map.ts, is the whole go-live edit; the unit suite refuses one without the other.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-extension-page-goes-live-only-with-a-store-id}
 */
export const EXTENSION_ID: string = "";

export const storeUrl = (id: string) => `https://chromewebstore.google.com/detail/${id}`;
export const STORE_URL = storeUrl(EXTENSION_ID);

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
