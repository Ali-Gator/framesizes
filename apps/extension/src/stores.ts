/*
 * The stores that list the extension, and what each one's package keeps of `public/_locales`.
 * One code base and one manifest; the store is chosen at build time (`STORE=edge vite build`).
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-each-store-gets-its-own-package}
 */

export type Store = "chrome" | "edge";

/** A `messages.json`: message name to its text. */
export type Messages = Record<string, { message: string; description?: string } | undefined>;

interface StorePackage {
  /** The locales the package keeps; `null` keeps all. */
  locales: string[] | null;
  /** Replaces `shortDesc`, the manifest description the store shows. */
  shortDesc?: string;
  /** Drops `storeDesc`, the Chrome long description kept only as a translated copy. */
  dropStoreDesc: boolean;
}

export const STORES: Record<Store, StorePackage> = {
  chrome: { locales: null, dropStoreDesc: false },
  edge: {
    locales: ["en"],
    shortDesc:
      "Gallery wall planner in the Edge sidebar: pick a picture frame layout with sizes, try shop prints at true size, get nail marks.",
    dropStoreDesc: true,
  },
};

/** The store a build value names; anything else is Chrome. */
export const storeOf = (value: string | undefined): Store => (value === "edge" ? "edge" : "chrome");

/**
 * The `messages.json` the store's package writes for `locale`, or `null` to leave the locale
 * out. A store that changes nothing gets `messages` back as it is.
 */
export function packageMessages(store: Store, locale: string, messages: Messages): Messages | null {
  const pkg = STORES[store];
  if (pkg.locales && !pkg.locales.includes(locale)) return null;
  if (!pkg.shortDesc && !pkg.dropStoreDesc) return messages;
  const { storeDesc, ...rest } = messages;
  return {
    ...rest,
    ...(pkg.dropStoreDesc ? {} : { storeDesc }),
    ...(pkg.shortDesc ? { shortDesc: { message: pkg.shortDesc } } : {}),
  };
}
