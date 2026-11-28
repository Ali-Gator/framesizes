/*
 * The service worker: the toolbar button opens the side panel, a first install opens the how-to
 * page, and framesizes.app can ask whether the extension is installed and pinned.
 * Pure handlers over a `chrome`-shaped object, wired to the real one at the bottom.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-toolbar-button-opens-the-side-panel}
 */

import { DEFAULT_LOCALE, localeByCode, localizedPath } from "@/lib/locales";

import { findSizes } from "./find-sizes";
import { cropShot, fetchImage, type ImageRect, type PageRead, readPage } from "./read-page";
import { CHANNEL, deleteTry, type TryRecord, writeTry } from "./store";
import { type Store, storeOf } from "./stores";

export const SITE = "https://framesizes.app";
const HOW_TO_PATH = "/extensions/gallery-wall-layout-generator";
export const HOW_TO = `${SITE}${HOW_TO_PATH}`;

/** Chrome UI tags whose site code differs (lowercase). */
const SITE_CODE: Record<string, string> = { fil: "tl", "zh-cn": "zh-hans", nb: "no", nn: "no" };

/** The store this package was built for (`STORE` at build time; unset is Chrome). */
const BUILT_STORE = storeOf(import.meta.env.STORE as string | undefined);

/**
 * The how-to page in the browser's interface language: the whole tag, then its primary subtag,
 * against the site's codes. A language the site lacks (`zh-tw`, bare `pt`), or none, gets
 * English. Any store but Chrome adds `&store=<store>`.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-first-install-opens-the-how-to-page}
 */
export function howToUrl(
  uiLanguage: string | undefined,
  pinned: boolean,
  store: Store = "chrome",
): string {
  const tag = (uiLanguage ?? "").toLowerCase().replace(/_/g, "-");
  const primary = tag.split("-")[0] ?? "";
  const code =
    [SITE_CODE[tag] ?? tag, SITE_CODE[primary] ?? primary].find((c) => localeByCode(c)) ??
    DEFAULT_LOCALE;
  const from = store === "chrome" ? "" : `&store=${store}`;
  return `${SITE}${localizedPath(code, HOW_TO_PATH)}?pinned=${pinned ? 1 : 0}${from}`;
}

/** The parts of `chrome` the worker uses. */
export interface Api {
  sidePanel: { setPanelBehavior(behavior: { openPanelOnActionClick: boolean }): Promise<void> };
  action: { getUserSettings(): Promise<{ isOnToolbar: boolean }> };
  tabs: { create(props: { url: string }): Promise<unknown> };
  runtime: { getManifest(): { version: string } };
  /** Optional: a Chrome that reports no language reads as English. */
  i18n?: { getUILanguage(): string };
}

const panelOnClick = (api: Api) => api.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

/**
 * Every install, update and browser start sets the panel behaviour; a first install, and only
 * that, opens the how-to page in the browser's language with whether the button is pinned and,
 * outside Chrome's store, which store the package came from.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-first-install-opens-the-how-to-page}
 */
export async function onInstalled(
  api: Api,
  details: { reason: string },
  store: Store = BUILT_STORE,
): Promise<void> {
  // A failure here must not cost the first install its how-to tab.
  await panelOnClick(api).catch(() => undefined);
  if (details.reason !== "install") return;
  const pinned = await isPinned(api);
  let language: string | undefined;
  try {
    language = api.i18n?.getUILanguage();
  } catch {
    // No language: English.
  }
  await api.tabs.create({ url: howToUrl(language, pinned, store) });
}

/** Whether the toolbar button is pinned; unknown counts as not pinned. */
const isPinned = (api: Api) =>
  api.action
    .getUserSettings()
    .then(({ isOnToolbar }) => isOnToolbar)
    .catch(() => false);

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
  void isPinned(api).then((pinned) =>
    reply({ installed: true, pinned, version: api.runtime.getManifest().version }),
  );
  return true;
}

export const MENU_ID = "try-on-my-wall";

/** The parts of `chrome` the "Try on my wall" menu uses. */
export interface MenuApi {
  contextMenus: {
    removeAll(): Promise<void>;
    create(props: {
      id: string;
      title: string;
      contexts: ["image", "link"];
      documentUrlPatterns: string[];
    }): void;
  };
  scripting: {
    executeScript(injection: {
      target: { tabId: number; frameIds?: number[] };
      func: (srcUrl: string, linkUrl: string) => PageRead;
      args: [string, string];
    }): Promise<{ result?: unknown }[]>;
  };
  tabs: { captureVisibleTab(windowId: number, options: { format: "png" }): Promise<string> };
  sidePanel: { open(options: { windowId: number }): Promise<void> };
}

/** What the click reads and writes beyond `chrome`. */
export interface TryIo {
  fetchImage(url: string): Promise<Blob | null>;
  crop(shot: string, rect: ImageRect): Promise<Blob | null>;
  saveTry(record: TryRecord): Promise<void>;
  /** The last try goes at once, so the panel never shows it while this one is read. */
  clearTry(): Promise<void>;
  /** Tells an open panel a try is waiting. */
  ping(): void;
}

/**
 * Every install and update makes the one menu item again.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-right-clicking-an-image-offers-try-on-my-wall}
 */
export async function registerMenu(api: MenuApi): Promise<void> {
  await api.contextMenus.removeAll().catch(() => undefined);
  api.contextMenus.create({
    id: MENU_ID,
    title: "Try on my wall",
    contexts: ["image", "link"],
    documentUrlPatterns: ["http://*/*", "https://*/*"],
  });
}

/**
 * The click: read the frame, capture the tab and open the panel in the same tick (the panel must
 * open inside the gesture, and the capture must start before the panel narrows the page), then
 * keep the picture, title, host and sizes as the try. The page text is never kept.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-page-is-read-only-on-the-click}
 */
export async function onMenuClick(
  api: MenuApi,
  io: TryIo,
  info: {
    menuItemId: string | number;
    frameId?: number;
    srcUrl?: string;
    linkUrl?: string;
    pageUrl?: string;
  },
  tab: { id?: number; windowId?: number; title?: string } | undefined,
): Promise<void> {
  if (info.menuItemId !== MENU_ID || tab?.id === undefined || tab.windowId === undefined) return;
  const at = Date.now();
  const frameId = info.frameId ?? 0;
  const srcUrl = info.srcUrl ?? "";
  const read = api.scripting
    .executeScript({
      target: { tabId: tab.id, frameIds: [frameId] },
      func: readPage,
      args: [srcUrl, info.linkUrl ?? ""],
    })
    .then((results) => (results[0]?.result as PageRead | undefined) ?? null)
    .catch(() => null);
  // A subframe's box is not in the tab's coordinates: no crop there.
  const shot =
    frameId === 0
      ? api.tabs.captureVisibleTab(tab.windowId, { format: "png" }).catch(() => null)
      : Promise.resolve(null);
  void api.sidePanel.open({ windowId: tab.windowId }).catch(() => undefined);
  void io.clearTry().catch(() => undefined);

  const page = await read;
  // On a link, the picture is the one the page read found inside it, if any.
  const url = srcUrl || page?.url;
  let image = url ? await io.fetchImage(url) : null;
  if (!image && page?.rect) {
    const screenshot = await shot;
    if (screenshot) image = await io.crop(screenshot, page.rect);
  }
  let host = "";
  try {
    host = new URL(info.pageUrl ?? "").hostname;
  } catch {
    // No page URL: the try says no host.
  }
  await io.saveTry({
    v: 1,
    id: crypto.randomUUID(),
    at,
    image,
    shape: page?.shape ?? null,
    title: page?.title || (tab.title ?? "").trim().slice(0, 80),
    host,
    sizes: findSizes(page?.text ?? ""),
  });
  io.ping();
}

const tryIo: TryIo = {
  fetchImage,
  crop: cropShot,
  saveTry: (record) => writeTry(record),
  clearTry: () => deleteTry().then(() => undefined),
  ping: () => {
    const bus = new BroadcastChannel(CHANNEL);
    bus.postMessage({ from: "worker", try: true });
    bus.close();
  },
};

if (typeof chrome !== "undefined" && chrome.runtime?.onInstalled) {
  const api = chrome as unknown as Api;
  const menu = chrome as unknown as MenuApi;
  chrome.runtime.onInstalled.addListener((details) => {
    void onInstalled(api, details);
    void registerMenu(menu);
  });
  chrome.contextMenus.onClicked.addListener(
    (info, tab) => void onMenuClick(menu, tryIo, info, tab),
  );
  chrome.runtime.onStartup.addListener(() => void onStartup(api));
  chrome.runtime.onMessageExternal.addListener((message, sender, reply) =>
    onMessageExternal(api, message, sender, reply),
  );
}
