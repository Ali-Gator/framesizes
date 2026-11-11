import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PAGES } from "@/lib/site-map";

import { PageLink } from "../page-link";

describe("PageLink", () => {
  /** {@link openspec/specs/seo-base/spec.md#scenario-an-in-text-link-to-a-live-page} */
  it("renders a live page as a link to its path", () => {
    const html = renderToStaticMarkup(
      <p>
        See the <PageLink id="F1">frame size chart</PageLink>.
      </p>,
    );
    expect(html).toContain('<a href="/">frame size chart</a>');
  });

  /** {@link openspec/specs/seo-base/spec.md#scenario-an-in-text-link-to-a-page-that-is-not-live} */
  it("renders a page that is not live as plain text", () => {
    const draft = PAGES.find((p) => !p.live);
    if (!draft) return; // every page is live: nothing left to prove
    const html = renderToStaticMarkup(
      <p>
        See <PageLink id={draft.id}>this</PageLink>.
      </p>,
    );
    expect(html).toBe("<p>See this.</p>");
  });
});
