// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

import { Breadcrumbs } from "../breadcrumbs";

const doc = new DOMParser().parseFromString(
  renderToStaticMarkup(
    <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Frame sizes on your wall" }]} />,
  ),
  "text/html",
);

/** {@link openspec/specs/seo-base/spec.md#scenario-f2s-breadcrumbs} */
it("is a Breadcrumb nav whose last item is the current page, not linked", () => {
  const nav = doc.querySelector("nav");
  expect(nav?.getAttribute("aria-label")).toBe("Breadcrumb");
  const items = [...doc.querySelectorAll("ol > li")];
  expect(items.map((li) => li.textContent)).toEqual(["Home", "Frame sizes on your wall"]);
  expect(items[0]?.querySelector("a")?.getAttribute("href")).toBe("/");
  expect(items[1]?.querySelector("a")).toBeNull();
  expect(items[1]?.querySelector("[aria-current]")?.getAttribute("aria-current")).toBe("page");
});
