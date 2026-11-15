import { CATALOG, findFrame, framesFor } from "@framesizes/sizes";
import { expect, it } from "vitest";

import { livePage } from "@/lib/site-map";

/** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-description-against-the-catalog} */
it("gives the catalog's count and its rectangular range", () => {
  const description = livePage("F2").seo.description;
  expect(description).toContain(`${CATALOG.length} standard frame sizes`);
  const sizes = description.match(/\d+(?:\.\d+)?x\d+(?:\.\d+)?/g) ?? [];
  for (const size of sizes) expect(findFrame(size), size).toBeDefined();
  const rectangular = framesFor("portrait");
  expect(sizes).toEqual([rectangular[0]?.id, rectangular.at(-1)?.id]);
});
