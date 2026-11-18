/*
 * The service worker: the toolbar button opens the side panel, a first install opens the how-to
 * page, and framesizes.app can ask whether the extension is installed and pinned.
 * Pure handlers over a `chrome`-shaped object, wired to the real one at the bottom.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-toolbar-button-opens-the-side-panel}
 */

export const SITE = "https://framesizes.app";
export const HOW_TO = `${SITE}/extensions/gallery-wall-layout-generator`;

/** The parts of `chrome` the worker uses. */
export interface Api {
  sidePanel: { setPanelBehavior(behavior: { openPanelOnActionClick: boolean }): Promise<void> };
  action: { getUserSettings(): Promise<{ isOnToolbar: boolean }> };
  tabs: { create(props: { url: string }): Promise<unknown> };
  runtime: { getManifest(): { version: string } };
}

const panelOnClick = (api: Api) => api.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

/**
 * Every install, update and browser start sets the panel behaviour; a first install, and only
 * that, opens the how-to page with whether the button is pinned.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-first-install-opens-the-how-to-page}
 */
export async function onInstalled(api: Api, details: { reason: string }): Promise<void> {
  await panelOnClick(api);
  if (details.reason !== "install") return;
  const { isOnToolbar } = await api.action.getUserSettings();
  await api.tabs.create({ url: `${HOW_TO}?pinned=${isOnToolbar ? 1 : 0}` });
}

export const onStartup = (api: Api) => panelOnClick(api);

/**
 * `{ type: "status" }` from framesizes.app gets whether the button is pinned now; anything else,
 * or any other sender, gets no reply. Returns `true` while the reply is on its way.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-site-can-ask-whether-the-extension-is-installed-and-pinned}
 */
export function onMessageExternal(
  api: Api,
  message: unknown,
  sender: { origin?: string },
  reply: (answer: { installed: true; pinned: boolean; version: string }) => void,
): boolean {
  if (sender.origin !== SITE) return false;
  if ((message as { type?: unknown } | null)?.type !== "status") return false;
  void api.action
    .getUserSettings()
    .then(({ isOnToolbar }) =>
      reply({ installed: true, pinned: isOnToolbar, version: api.runtime.getManifest().version }),
    );
  return true;
}

if (typeof chrome !== "undefined" && chrome.runtime?.onInstalled) {
  const api = chrome as unknown as Api;
  chrome.runtime.onInstalled.addListener((details) => void onInstalled(api, details));
  chrome.runtime.onStartup.addListener(() => void onStartup(api));
  chrome.runtime.onMessageExternal.addListener((message, sender, reply) =>
    onMessageExternal(api, message, sender, reply),
  );
}
