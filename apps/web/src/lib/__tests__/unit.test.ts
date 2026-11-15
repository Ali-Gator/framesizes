// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";

import { setUnit } from "../unit";

afterEach(() => localStorage.clear());

/** {@link openspec/specs/site-shell/spec.md#scenario-dual-unit-text-follows-the-choice} */
it("puts the chosen unit on the root element", () => {
  setUnit("cm");
  expect(document.documentElement.dataset.unit).toBe("cm");
  expect(localStorage.getItem("unit")).toBe("cm");
  setUnit("in");
  expect(document.documentElement.dataset.unit).toBe("in");
});
