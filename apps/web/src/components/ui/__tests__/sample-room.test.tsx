import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

import { SampleRoom } from "../sample-room";

/** {@link openspec/specs/frame-mockup/spec.md#scenario-a-plain-wall-in-close-up} */
it("draws the sofa only when asked, on the 144 × 96 in wall", () => {
  const withSofa = renderToStaticMarkup(<SampleRoom sofa />);
  const plain = renderToStaticMarkup(<SampleRoom sofa={false} />);
  expect(withSofa).toContain('viewBox="0 0 144 96"');
  expect(withSofa).toContain('aria-hidden="true"');
  expect(withSofa).toContain("data-sofa");
  expect(plain).not.toContain("data-sofa");
  expect(plain).toContain("var(--leaf)");
});
