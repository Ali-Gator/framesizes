import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { LOCALES } from "../apps/web/src/lib/locales";

const PATH = "/extensions/gallery-wall-layout-generator";
const WCAG_22_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

/** The raw server HTML of a path, parsed in the page: what a crawler gets, no JavaScript run. */
async function serverDoc<T>(page: Page, path: string, read: (doc: Document) => T): Promise<T> {
  const response = await page.request.get(path);
  expect(response.status()).toBe(200);
  const source = await response.text();
  return page.evaluate(
    ([html, fn]) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return (new Function("doc", `return (${fn})(doc)`) as (d: Document) => T)(doc);
    },
    [source, read.toString()] as const,
  );
}

const noSideScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

/**
 * {@link openspec/specs/extension-site/spec.md#scenario-the-russian-versions-heading-outline}
 * {@link openspec/specs/localization/spec.md#scenario-the-russian-versions-address}
 */
test("the Russian version keeps the English outline, in Russian, inside lang=ru", async ({
  page,
}) => {
  const outline = await serverDoc(page, `/ru${PATH}`, (doc) => {
    const main = doc.querySelector("main");
    const text = (el: Element) => el.textContent?.replace(/\s+/g, " ").trim();
    return {
      headings: [...(main?.querySelectorAll("h1, h2, h3") ?? [])].map(
        (h) => `${h.tagName.toLowerCase()} ${text(h)}`,
      ),
      lang: main?.querySelector("h1")?.closest("[lang]")?.getAttribute("lang"),
    };
  });
  expect(outline.lang).toBe("ru");
  expect(outline.headings).toEqual([
    "h1 Как пользоваться Gallery Wall Layout Generator",
    "h2 Закрепите кнопку на панели инструментов",
    "h2 Что можно делать в боковой панели",
    "h3 Спланируйте стену с картинами",
    "h3 Примерьте принт из магазина",
    "h3 Получите разметку для гвоздей",
    "h2 Используйте свою стену",
    "h2 Что видит расширение",
    "h2 Вопросы",
    "h3 Работает ли оно в любом магазине?",
    "h3 Почему кнопки нет на панели инструментов?",
    "h3 В каких браузерах оно работает?",
  ]);
});

/** {@link openspec/specs/localization/spec.md#scenario-the-arabic-versions-content} */
test("the Arabic version reads right to left", async ({ page }) => {
  const wrapper = await serverDoc(page, `/ar${PATH}`, (doc) => {
    const el = doc.querySelector("main h1")?.closest("[lang]");
    return { lang: el?.getAttribute("lang"), dir: el?.getAttribute("dir") };
  });
  expect(wrapper).toEqual({ lang: "ar", dir: "rtl" });
});

/** {@link openspec/specs/extension-site/spec.md#scenario-pin-mode-on-a-translated-version} */
test("?pinned=0 opens the Japanese pin steps", async ({ page }) => {
  await page.goto(`/ja${PATH}?pinned=0`);
  await expect(page.getByRole("heading", { name: "ツールバーに固定する" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "サイドパネルでできること" })).toBeHidden();
});

/** {@link openspec/specs/extension-site/spec.md#scenario-the-german-pin-picture} */
test("the German pin picture uses Chrome's German labels and keeps the extension's name", async ({
  page,
}) => {
  await page.goto(`/de${PATH}?pinned=0`);
  const picture = page.locator("svg.ext-pin-picture");
  await expect(picture).toBeVisible();
  await expect(picture.locator("text", { hasText: /^Erweiterungen$/ })).toHaveCount(1);
  await expect(
    picture.locator("text", { hasText: "Gallery Wall Layout Generator" }).first(),
  ).toBeAttached();
  await expect(picture).toHaveAttribute("aria-label", /^Die Chrome-Symbolleiste/);
});

/** Whether an element of the pin picture lies wholly in the drawing's left or right half. */
async function half(page: Page, selector: string) {
  const picture = await page.locator("svg.ext-pin-picture").boundingBox();
  const box = await page.locator("svg.ext-pin-picture").locator(selector).first().boundingBox();
  if (!picture || !box) return null;
  const middle = picture.x + picture.width / 2;
  return box.x + box.width <= middle ? "left" : box.x >= middle ? "right" : "both";
}

// The puzzle-piece button's ring (marker 1's target) and the Extensions menu's card.
const RING_1 = "circle.pp-tape-stroke";
const MENU = 'rect[filter="url(#pp-shadow)"]';

/** {@link openspec/specs/extension-site/spec.md#scenario-the-arabic-pin-picture} */
test("the Arabic pin picture puts the puzzle piece and the menu on the left", async ({ page }) => {
  await page.goto(`/ar${PATH}?pinned=0`);
  const picture = page.locator("svg.ext-pin-picture");
  await expect(picture).toHaveCount(1);
  await expect(picture).toBeVisible();
  expect(await half(page, RING_1)).toBe("left");
  expect(await half(page, MENU)).toBe("left");
  await expect(picture.locator("text", { hasText: /^الإضافات$/ })).toHaveCount(1);
  await expect(
    picture.locator("text", { hasText: "Gallery Wall Layout Generator" }).first(),
  ).toBeAttached();
  await expect(picture).toHaveAttribute("aria-label", /^شريط أدوات Chrome/);
});

/** {@link openspec/specs/extension-site/spec.md#scenario-a-left-to-right-version-keeps-its-drawing} */
test("the German pin picture keeps the puzzle piece on the right", async ({ page }) => {
  await page.goto(`/de${PATH}?pinned=0`);
  await expect(page.locator("svg.ext-pin-picture")).toHaveCount(1);
  await expect(page.locator("svg.ext-pin-picture")).toBeVisible();
  expect(await half(page, RING_1)).toBe("right");
});

/** {@link openspec/specs/extension-site/spec.md#scenario-the-french-answer-paragraph} */
test("the French answer paragraph keeps Try on my wall in English", async ({ page }) => {
  const english = await serverDoc(page, `/fr${PATH}`, (doc) => {
    let answer = doc.querySelector("main h1")?.nextElementSibling;
    while (answer && answer.tagName !== "P") answer = answer.nextElementSibling;
    return [...(answer?.querySelectorAll('[lang="en"]') ?? [])].map((s) => s.textContent);
  });
  expect(english).toContain("Try on my wall");
});

/**
 * {@link openspec/specs/extension-site/spec.md#scenario-the-spanish-breadcrumbs}
 * {@link openspec/specs/extension-site/spec.md#requirement-a-translated-versions-breadcrumbs-are-translated}
 */
test("the Spanish breadcrumbs are in Spanish and link to the English pages", async ({ page }) => {
  const crumbs = await serverDoc(page, `/es${PATH}`, (doc) => ({
    items: [...doc.querySelectorAll('nav[aria-label="Breadcrumb"] li')].map((li) => ({
      text: li.textContent?.trim(),
      href: li.querySelector("a")?.getAttribute("href") ?? null,
      current: li.querySelector('[aria-current="page"]') !== null,
    })),
    list: [...doc.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => JSON.parse(s.textContent ?? "null"))
      .find((d) => d?.["@type"] === "BreadcrumbList")
      ?.itemListElement.map((i: { name: string }) => i.name),
  }));
  expect(crumbs.items).toEqual([
    { text: "Inicio", href: "/", current: false },
    { text: "Pared de cuadros", href: "/gallery-wall-planner", current: false },
    { text: "Extensión de Chrome", href: null, current: true },
  ]);
  expect(crumbs.list).toEqual(["Inicio", "Pared de cuadros", "Extensión de Chrome"]);
});

/** {@link openspec/specs/extension-site/spec.md#scenario-no-related-tools-in-italian} */
test("the Italian version has no Related tools", async ({ page }) => {
  const sections = await serverDoc(page, `/it${PATH}`, (doc) =>
    [...doc.querySelectorAll("main h2")].map((h) => h.textContent?.trim()),
  );
  expect(sections).not.toContain("Related tools");
  expect(sections).toHaveLength(5);
});

/** {@link openspec/specs/extension-site/spec.md#scenario-a-translated-version-before-go-live} */
test("the Polish version answers 200 with noindex while X1 is not live", async ({ page }) => {
  const robots = await serverDoc(page, `/pl${PATH}`, (doc) =>
    [...doc.querySelectorAll('meta[name="robots"]')].map((m) => m.getAttribute("content")),
  );
  expect(robots.join(" ")).toContain("noindex");
});

/**
 * {@link openspec/specs/seo-base/spec.md#scenario-the-extension-pages-language-links}
 * {@link openspec/specs/seo-base/spec.md#scenario-the-russian-extension-pages-head}
 */
test("every version names all 28 languages and x-default, with its own canonical", async ({
  page,
}) => {
  const head = await serverDoc(page, `/ja${PATH}`, (doc) => ({
    links: Object.fromEntries(
      [...doc.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [
        l.getAttribute("hreflang"),
        l.getAttribute("href"),
      ]),
    ),
    canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ogLocale: doc.querySelector('meta[property="og:locale"]')?.getAttribute("content"),
  }));
  expect(Object.keys(head.links)).toHaveLength(29);
  expect(head.links["x-default"]).toBe(`https://framesizes.app${PATH}`);
  expect(head.links.en).toBe(`https://framesizes.app${PATH}`);
  expect(head.links.ja).toBe(`https://framesizes.app/ja${PATH}`);
  expect(head.canonical).toBe(`https://framesizes.app/ja${PATH}`);
  expect(head.ogLocale).toBe("ja_JP");
  const home = await serverDoc(page, "/", (doc) => doc.querySelectorAll("link[hreflang]").length);
  expect(home).toBe(0);
});

/** {@link openspec/specs/localization/spec.md#scenario-english-has-no-prefix} */
test("/en/ and an unknown code answer 404", async ({ page }) => {
  for (const code of ["en", "xx"]) {
    expect((await page.request.get(`/${code}${PATH}`)).status()).toBe(404);
  }
});

/** {@link openspec/specs/localization/spec.md#scenario-a-russian-browser-opens-the-english-page} */
test("a Russian browser gets the English page with no redirect", async ({ page }) => {
  const response = await page.request.get(PATH, {
    headers: { "Accept-Language": "ru" },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('<html lang="en"');
});

/**
 * {@link openspec/specs/localization/spec.md#scenario-searching-in-english-and-in-russian}
 * {@link openspec/specs/localization/spec.md#scenario-switching-from-the-pin-steps}
 * {@link openspec/specs/localization/spec.md#scenario-closing-the-picker}
 */
test("the picker searches by English and native name and keeps the pin steps", async ({ page }) => {
  await page.goto(`${PATH}?pinned=0#pin`);
  const trigger = page.getByRole("button", { name: /English/ });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Choose a language" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link")).toHaveCount(28);
  const search = dialog.getByRole("searchbox", { name: "Search languages" });
  await expect(search).toBeFocused();
  for (const query of ["russian", "русский"]) {
    await search.fill(query);
    await expect(dialog.getByRole("link")).toHaveCount(1);
    await expect(dialog.getByRole("link")).toHaveText("Русский");
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await dialog.getByRole("searchbox").fill("");
  await dialog.getByRole("link", { name: "Deutsch" }).click();
  await expect(page).toHaveURL(new RegExp(`/de${PATH}\\?pinned=0#pin$`));
  await expect(page.getByRole("heading", { name: "An die Symbolleiste anpinnen" })).toBeVisible();
});

/** {@link openspec/specs/site-shell/spec.md#scenario-the-language-button-on-a-phone} */
test("on a phone the language button is a globe named Русский, with no side scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/ru${PATH}`);
  const trigger = page.getByRole("button", { name: /Русский/ });
  await expect(trigger).toBeVisible();
  const box = await trigger.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(46);
  await expect(trigger.locator(".lp-trig-name")).toHaveCSS("position", "absolute");
  expect(await noSideScroll(page)).toBe(true);
  // Option A was chosen to keep the header to one row: the menu button stays beside the globe.
  for (const width of [375, 360]) {
    await page.setViewportSize({ width, height: 740 });
    const menu = await page.getByRole("button", { name: "Menu" }).boundingBox();
    const globe = await trigger.boundingBox();
    expect(Math.abs((menu?.y ?? 0) - (globe?.y ?? 99)), `${width}px`).toBeLessThan(4);
  }
});

/** {@link openspec/specs/site-shell/spec.md#scenario-a-page-without-translations} */
test("the home page header has no language button", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header button[aria-haspopup=dialog]")).toHaveCount(0);
});

/** {@link openspec/specs/site-shell/spec.md#scenario-a-page-without-translations-loads-no-picker-code} */
test("the home page loads none of the picker's styles or script", async ({ page }) => {
  const bodies: Promise<{ type: string; url: string; text: string }>[] = [];
  page.on("response", (r) => {
    const type = r.request().resourceType();
    if (type === "stylesheet" || type === "script") {
      bodies.push(r.text().then((text) => ({ type, url: r.url(), text })));
    }
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const inline = await page.evaluate(() =>
    [...document.querySelectorAll("style, script:not([src])")].map((el) => ({
      type: el.tagName === "STYLE" ? "stylesheet" : "script",
      url: "inline",
      text: el.textContent ?? "",
    })),
  );
  const loaded = [...(await Promise.all(bodies)), ...inline];
  expect(loaded.filter((b) => b.type === "stylesheet").length).toBeGreaterThan(0);
  // A rule whose selector starts with the class; the header's own `:has(.lp-trig)` utilities don't count.
  const defines = /(^|[{},/])\s*\.lp-(trig|dlg)\b/;
  const styles = loaded.filter((b) => b.type === "stylesheet" && defines.test(b.text));
  const scripts = loaded.filter((b) => b.type === "script" && b.text.includes("Choose a language"));
  expect.soft(styles.map((b) => b.url)).toEqual([]);
  expect(scripts.map((b) => b.url)).toEqual([]);
});

/** {@link openspec/specs/site-shell/spec.md#scenario-the-extension-pages-header} */
test("the English and Russian extension pages hold the language button in the server HTML", async ({
  page,
}) => {
  for (const [path, name] of [
    [PATH, "English"],
    [`/ru${PATH}`, "Русский"],
  ] as const) {
    const label = await serverDoc(
      page,
      path,
      (doc) => doc.querySelector("header button[aria-haspopup=dialog]")?.textContent ?? null,
    );
    expect(label, path).toContain(name);
  }
});

/** {@link openspec/specs/site-shell/spec.md#requirement-the-header-offers-the-language-picker-on-translated-pages} */
for (const code of ["ru", "de", "fi"]) {
  test(`/${code}/ has no side scroll at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`/${code}${PATH}`);
    expect(await noSideScroll(page)).toBe(true);
    await page.goto(`/${code}${PATH}?pinned=0`);
    expect(await noSideScroll(page)).toBe(true);
  });
}

/** {@link openspec/specs/localization/spec.md#requirement-a-language-version-marks-its-own-language} */
for (const code of ["ru", "ar", "ja"]) {
  test(`/${code}/ passes axe in both modes and with the picker open`, async ({ page }) => {
    for (const query of ["", "?pinned=0"]) {
      await page.goto(`/${code}${PATH}${query}`);
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
      expect(violations).toEqual([]);
    }
    await page.locator("header button[aria-haspopup=dialog]").click();
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();
    expect(violations).toEqual([]);
  });
}

/** {@link openspec/specs/site-shell/spec.md#requirement-fonts-are-served-from-the-sites-own-origin} */
test("Hungarian ő and Polish ł render in Schibsted Grotesk", async ({ page }) => {
  for (const [code, text] of [
    ["hu", "ő"],
    ["pl", "ł"],
  ] as const) {
    await page.goto(`/${code}${PATH}`);
    const font = await page.evaluate(async (chars) => {
      const wrapper = document.querySelector("main [lang]");
      const family = wrapper ? getComputedStyle(wrapper).fontFamily : "";
      const loaded = await document.fonts.load(`16px ${family.split(",")[0]}`, chars);
      return { family, ranges: loaded.map((f) => f.unicodeRange) };
    }, text);
    expect(font.family).toMatch(/Schibsted/);
    expect(font.ranges.some((r) => r.includes("U+100"))).toBe(true);
  }
});

test("every language's version is built", async ({ page }) => {
  for (const l of LOCALES.slice(1)) {
    expect((await page.request.get(`/${l.code}${PATH}`)).status(), l.code).toBe(200);
  }
});
