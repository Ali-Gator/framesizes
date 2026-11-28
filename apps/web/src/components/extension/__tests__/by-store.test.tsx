// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ByStore } from "../by-store";

const BOTH = ["chrome", "edge"] as const;
const parse = (html: string) => new DOMParser().parseFromString(`<h2>${html}</h2>`, "text/html");
const render = (node: React.ReactElement) =>
  parse(renderToStaticMarkup(node)).querySelector("h2") as HTMLElement;

/** {@link openspec/specs/extension-site/spec.md#scenario-one-heading-two-texts} */
describe("ByStore", () => {
  it("renders a Chrome and an Edge child when both stores are built and the texts differ", () => {
    const h2 = render(
      <ByStore chrome="Pin it to your toolbar" edge="Show it in your toolbar" stores={BOTH} />,
    );
    expect([...h2.children].map((c) => [c.className, c.textContent])).toEqual([
      ["st-chrome", "Pin it to your toolbar"],
      ["st-edge", "Show it in your toolbar"],
    ]);
  });

  it("renders one plain child when the texts are equal, Edge has none, or Edge is not built", () => {
    for (const node of [
      <ByStore key="1" chrome="Same" edge="Same" stores={BOTH} />,
      <ByStore key="2" chrome="Same" stores={BOTH} />,
      <ByStore key="3" chrome="Same" edge="Other" stores={["chrome"]} />,
    ]) {
      const h2 = render(node);
      expect(h2.children).toHaveLength(0);
      expect(h2.textContent).toBe("Same");
    }
  });

  /** {@link openspec/specs/extension-site/spec.md#scenario-edge-before-its-id} */
  it("renders only the Chrome child, marked, when Edge shows nothing", () => {
    const h2 = render(<ByStore chrome="Get it" edge={null} stores={BOTH} />);
    expect([...h2.children].map((c) => c.className)).toEqual(["st-chrome"]);
    expect(h2.querySelector(".st-edge")).toBeNull();
  });

  it("puts no id on any variant", () => {
    const h2 = render(<ByStore chrome="A" edge="B" stores={BOTH} as="div" />);
    expect(h2.querySelectorAll("[id]")).toHaveLength(0);
    expect(h2.querySelectorAll("div")).toHaveLength(2);
  });
});
