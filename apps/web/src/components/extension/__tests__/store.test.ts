// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { applyStore, pickStore, type SiteStore, storeScript } from "../store";

type Row = {
  name: string;
  search?: string;
  brands?: { brand: string }[];
  ua?: string;
  fromQuery?: boolean;
  store: SiteStore;
};

const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const ROWS: Row[] = [
  { name: "Chrome with no store", ua: CHROME_UA, store: "chrome" },
  { name: "?store=edge in Chrome", search: "?pinned=0&store=edge", ua: CHROME_UA, store: "edge" },
  {
    name: "brands with Microsoft Edge",
    brands: [{ brand: "Chromium" }, { brand: "Microsoft Edge" }],
    ua: CHROME_UA,
    store: "edge",
  },
  { name: "Edg/131", ua: `${CHROME_UA} Edg/131.0.0.0`, store: "edge" },
  { name: "EdgA/131", ua: `${CHROME_UA} EdgA/131.0.0.0`, store: "edge" },
  {
    name: "EdgiOS/131",
    ua: "Mozilla/5.0 (iPhone) Version/18.0 EdgiOS/131.0 Mobile",
    store: "edge",
  },
  { name: "Opera OPR/", ua: `${CHROME_UA} OPR/115.0.0.0`, store: "chrome" },
  { name: "legacy Edge/18", ua: `${CHROME_UA} Edge/18.17763`, store: "chrome" },
  {
    name: "Firefox",
    ua: "Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0",
    store: "chrome",
  },
  { name: "Safari", ua: "Mozilla/5.0 (Macintosh) Version/18.1 Safari/605.1.15", store: "chrome" },
  { name: "?store=opera", search: "?store=opera", ua: CHROME_UA, store: "chrome" },
  {
    name: "fromQuery false ignores ?store=edge",
    search: "?store=edge",
    ua: CHROME_UA,
    fromQuery: false,
    store: "chrome",
  },
];

/** Runs the inline script with stubbed globals and returns what it wrote on `<html>`. */
function runScript(fromQuery: boolean, navigator: unknown, search = "") {
  const dataset: { extStore?: string } = {};
  const document = { documentElement: { dataset } };
  new Function("location", "navigator", "document", storeScript(fromQuery))(
    { search },
    navigator,
    document,
  );
  return dataset.extStore;
}

/** {@link openspec/specs/extension-site/spec.md#requirement-the-page-picks-the-visitors-store} */
describe("pickStore", () => {
  /** {@link openspec/specs/extension-site/spec.md#scenario-the-edge-install-tab} */
  /** {@link openspec/specs/extension-site/spec.md#scenario-a-chrome-web-store-install-opened-in-edge} */
  /** {@link openspec/specs/extension-site/spec.md#scenario-chrome-and-every-other-browser} */
  it.each(ROWS)(
    "$name picks $store",
    ({ search = "", brands, ua = "", fromQuery = true, store }) => {
      expect(pickStore({ search, brands, ua }, fromQuery)).toBe(store);
    },
  );
});

describe("storeScript", () => {
  it.each(ROWS)(
    "$name gives the same store as pickStore",
    ({ search = "", brands, ua = "", fromQuery = true, store }) => {
      const nav = { userAgent: ua, ...(brands ? { userAgentData: { brands } } : {}) };
      expect(runScript(fromQuery, nav, search)).toBe(store);
    },
  );

  /** {@link openspec/specs/extension-site/spec.md#scenario-no-script} */
  it("leaves the attribute unset when navigator throws", () => {
    const nav = {
      get userAgent(): string {
        throw new Error("blocked");
      },
      get userAgentData(): unknown {
        throw new Error("blocked");
      },
    };
    expect(runScript(true, nav)).toBeUndefined();
  });
});

describe("applyStore", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete document.documentElement.dataset.extStore;
  });

  it("falls back to Chrome when navigator throws", () => {
    vi.spyOn(navigator, "userAgent", "get").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(applyStore(true)).toBe("chrome");
    expect(document.documentElement.dataset.extStore).toBe("chrome");
  });

  it("picks Edge from ?store=edge", () => {
    window.history.replaceState(null, "", "/?store=edge");
    expect(applyStore(true)).toBe("edge");
    expect(applyStore(false)).not.toBe("edge");
    window.history.replaceState(null, "", "/");
  });
});
