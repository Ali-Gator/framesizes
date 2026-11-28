/**
 * Which store's lines the page shows, kept on `<html data-ext-store>` so CSS (extension.css,
 * widgets.css) hides the other store's variants (`ByStore`). Chrome is the default: no script,
 * crawlers, Opera (until T28) and every other browser.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-page-picks-the-visitors-store}
 */
export type SiteStore = "chrome" | "edge";

const EDGE_UA = /\bEdg(A|iOS)?\//;

/** `?store=edge` (only with `fromQuery`), then the browser's brands or user agent, else Chrome. */
export function pickStore(
  { search, brands, ua }: { search: string; brands?: readonly { brand: string }[]; ua: string },
  fromQuery = true,
): SiteStore {
  if (fromQuery && new URLSearchParams(search).get("store") === "edge") return "edge";
  if (brands?.some((b) => b.brand === "Microsoft Edge") || EDGE_UA.test(ua)) return "edge";
  return "chrome";
}

/**
 * `pickStore` as an inline script that runs before the first paint, like `MODE_SCRIPT`. X1 reads
 * `?store=` (`fromQuery`); G1 and F2 read the browser alone. store.test.ts runs it against
 * `pickStore` so the two cannot drift.
 */
export const storeScript = (fromQuery: boolean) =>
  `try{var n=navigator,b=n.userAgentData&&n.userAgentData.brands,s=${fromQuery ? 'new URLSearchParams(location.search).get("store")==="edge"||' : ""}(b&&b.some(function(x){return x.brand==="Microsoft Edge"}))||${EDGE_UA}.test(n.userAgent)?"edge":"chrome";document.documentElement.dataset.extStore=s}catch(e){}`;

/** Sets `<html data-ext-store>` after a client-side visit, which runs no inline script. */
export function applyStore(fromQuery: boolean): SiteStore {
  const nav = navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } };
  const store = pickStore(
    { search: location.search, brands: nav.userAgentData?.brands, ua: nav.userAgent },
    fromQuery,
  );
  document.documentElement.dataset.extStore = store;
  return store;
}
