// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

import { SegmentedControl } from "../segmented-control";

/** {@link openspec/specs/site-shell/spec.md#requirement-the-unit-choice-is-one-site-wide-preference} */
it("is a labelled group with exactly one checked radio", () => {
  const html = renderToStaticMarkup(
    <SegmentedControl
      label="Units"
      value="cm"
      onChange={() => {}}
      options={[
        { value: "in", label: "in" },
        { value: "cm", label: "cm" },
      ]}
    />,
  );
  const doc = new DOMParser().parseFromString(html, "text/html");
  const group = doc.querySelector('[role="radiogroup"]');
  expect(group?.getAttribute("aria-label")).toBe("Units");
  const checked = group?.querySelectorAll('[role="radio"][aria-checked="true"]');
  expect([...(checked ?? [])].map((r) => r.textContent)).toEqual(["cm"]);
  expect(group?.querySelector('[tabindex="0"]')?.textContent).toBe("cm");
});
