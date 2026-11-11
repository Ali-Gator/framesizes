// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";

import { SizeTable } from "../size-table";

const html = renderToStaticMarkup(
  <SizeTable
    caption="Standard picture frame sizes in inches and centimetres"
    name="frame-size"
    columns={[{ label: "Frame size", num: true }, { label: "Common use" }]}
    value="8x10"
    rows={[
      { id: "4x6", label: "4 × 6 in", cells: ["Snapshots"] },
      { id: "8x10", label: "8 × 10 in", cells: ["Portraits"] },
      { id: "8x8", label: "8 × 8 in", cells: ["Square"], hidden: true },
    ]}
  />,
);
const doc = new DOMParser().parseFromString(html, "text/html");
const rows = [...doc.querySelectorAll("tbody tr")];

/** {@link openspec/specs/frame-size-chart/spec.md#requirement-the-table-is-the-size-chooser} */
it("is a captioned table whose rows each hold one radio of one group", () => {
  expect(doc.querySelector("caption")?.textContent).toBe(
    "Standard picture frame sizes in inches and centimetres",
  );
  expect(rows).toHaveLength(3);
  for (const row of rows) {
    const head = row.firstElementChild;
    expect(head?.tagName).toBe("TH");
    expect(head?.getAttribute("scope")).toBe("row");
    const radios = row.querySelectorAll('input[type="radio"]');
    expect(radios).toHaveLength(1);
    expect(radios[0]?.getAttribute("name")).toBe("frame-size");
    // Named by its size through a label.
    const id = radios[0]?.getAttribute("id") ?? "";
    expect(row.querySelector(`label[for="${id}"]`)?.textContent).toBe(head?.textContent);
  }
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-default-state-in-the-server-html} */
it("checks the selected row's radio only", () => {
  const checked = [...doc.querySelectorAll<HTMLInputElement>("input:checked")];
  expect(checked.map((r) => r.value)).toEqual(["8x10"]);
});

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-table-in-the-server-html} */
it("hides rows of the other shape instead of removing them", () => {
  expect(rows.map((r) => r.hasAttribute("hidden"))).toEqual([false, false, true]);
});
