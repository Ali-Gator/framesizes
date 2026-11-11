import { findFrame, framesFor } from "@framesizes/sizes";
import { expect, it } from "vitest";

import { livePage } from "../site-map";

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-description-against-the-catalog} */
it("names only catalog sizes and the catalog's rectangular range", () => {
  const sizes = livePage("F1").seo.description.match(/\d+(?:\.\d+)?x\d+(?:\.\d+)?/g) ?? [];
  for (const size of sizes) expect(findFrame(size), size).toBeDefined();
  const rectangular = framesFor("portrait");
  expect(sizes).toContain(rectangular[0]?.id);
  expect(sizes).toContain(rectangular.at(-1)?.id);
});
