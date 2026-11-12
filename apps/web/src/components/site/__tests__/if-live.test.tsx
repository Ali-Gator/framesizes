import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

import { PAGES } from "@/lib/site-map";

import { IfLive } from "../page-link";

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-no-other-page-is-live} */
it("renders its text only while the page is live", () => {
  expect(renderToStaticMarkup(<IfLive page="F1">Go home.</IfLive>)).toBe("Go home.");
  const draft = PAGES.find((p) => !p.live);
  if (!draft) return; // every page is live: nothing left to prove
  expect(renderToStaticMarkup(<IfLive page={draft.id}>Go there.</IfLive>)).toBe("");
});
