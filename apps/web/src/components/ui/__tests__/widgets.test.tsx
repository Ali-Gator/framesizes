// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "../button";
import { FAQ } from "../faq";
import { ToolCard } from "../tool-card";
import { WidgetCard } from "../widget-card";

const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");

describe("WidgetCard", () => {
  /** {@link openspec/specs/frame-size-chart/spec.md#requirement-the-page-follows-the-approved-outline} */
  it("titles the card with an h2 and names the section by it", () => {
    const doc = parse(renderToStaticMarkup(<WidgetCard title="Frame size chart">body</WidgetCard>));
    expect(doc.querySelector("h2")?.textContent).toBe("Frame size chart");
    expect(doc.querySelector("section")?.getAttribute("aria-label")).toBe("Frame size chart");
  });
});

describe("Button", () => {
  /** {@link openspec/specs/frame-size-chart/spec.md#requirement-the-page-links-only-to-live-pages} */
  it("renders a link when it has href, a button otherwise", () => {
    const link = parse(renderToStaticMarkup(<Button href="/frame-sizes-on-wall">Go</Button>));
    expect(link.querySelector("a")?.getAttribute("href")).toBe("/frame-sizes-on-wall");
    expect(link.querySelector("button")).toBeNull();
    const button = parse(renderToStaticMarkup(<Button>Go</Button>));
    expect(button.querySelector("button")?.getAttribute("type")).toBe("button");
  });
});

describe("ToolCard", () => {
  /** {@link openspec/specs/frame-size-chart/spec.md#requirement-the-page-links-only-to-live-pages} */
  it("links to its page and never to #", () => {
    const doc = parse(
      renderToStaticMarkup(<ToolCard title="Poster sizes" href="/poster-sizes" ratio={[2, 3]} />),
    );
    expect(doc.querySelector("a")?.getAttribute("href")).toBe("/poster-sizes");
  });
});

describe("FAQ", () => {
  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-questions-in-the-server-html} */
  it("puts each question in an h3 inside its summary and opens only the first", () => {
    const doc = parse(
      renderToStaticMarkup(
        <FAQ
          items={[
            { q: "One?", a: "1" },
            { q: "Two?", a: "2" },
            { q: "Three?", a: "3" },
          ]}
        />,
      ),
    );
    const details = [...doc.querySelectorAll("details")];
    expect(details.map((d) => d.hasAttribute("open"))).toEqual([true, false, false]);
    expect(details.map((d) => d.querySelector("summary > h3")?.textContent)).toEqual([
      "One?",
      "Two?",
      "Three?",
    ]);
  });
});
