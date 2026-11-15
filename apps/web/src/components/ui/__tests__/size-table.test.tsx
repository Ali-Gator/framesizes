// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

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

/** The phone rows restyle the table, so its semantics are explicit and the mat cell is marked. */
const phoneDoc = new DOMParser().parseFromString(
  renderToStaticMarkup(
    <SizeTable
      caption="Sizes"
      name="frame-size"
      columns={[
        { label: "Frame size", num: true },
        { label: "Image with a mat", num: true, mat: true },
        { label: "Common use" },
      ]}
      value="8x10"
      rows={[
        { id: "8x10", label: "8 × 10 in", cells: ["5 × 7 in", "Portraits"], mat: true },
        { id: "20x30", label: "20 × 30 in", cells: ["No mat", "Large photo prints"] },
      ]}
    />,
  ),
  "text/html",
);

/** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-rows-on-a-phone} */
it("keeps table semantics through explicit roles", () => {
  expect(phoneDoc.querySelector("table")?.getAttribute("role")).toBe("table");
  const rows = [...phoneDoc.querySelectorAll("tr")];
  expect(rows).toHaveLength(3);
  for (const row of rows) expect(row.getAttribute("role")).toBe("row");
  for (const th of phoneDoc.querySelectorAll("thead th")) {
    expect(th.getAttribute("role")).toBe("columnheader");
  }
  for (const th of phoneDoc.querySelectorAll("tbody th")) {
    expect(th.getAttribute("role")).toBe("rowheader");
  }
  const cells = [...phoneDoc.querySelectorAll("td")];
  expect(cells).toHaveLength(4);
  for (const td of cells) expect(td.getAttribute("role")).toBe("cell");
});

/** {@link openspec/specs/frame-size-chart/spec.md#requirement-the-table-is-the-size-chooser} */
it("marks only the cells that hold a mat", () => {
  expect([...phoneDoc.querySelectorAll("[data-mat]")].map((el) => el.textContent)).toEqual([
    "5 × 7 in",
  ]);
});

describe("a titled table that is not a chooser", () => {
  const titled = new DOMParser().parseFromString(
    renderToStaticMarkup(
      <SizeTable
        title="Wall art frame sizes and the space they take"
        meta="With a 1 in moulding"
        selectable={false}
        columns={[{ label: "Frame size", num: true }, { label: "Where it works" }]}
        rows={[{ id: "16x20", label: "16 × 20 in", cells: ["Above a small table, or in a pair"] }]}
      />,
    ),
    "text/html",
  );

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-table-in-the-server-html} */
  it("shows the title and meta as its caption", () => {
    const caption = titled.querySelector("caption");
    expect(caption?.classList.contains("fs-sr")).toBe(false);
    expect(caption?.querySelector(".fs-table-title")?.textContent).toBe(
      "Wall art frame sizes and the space they take",
    );
    expect(caption?.querySelector(".fs-table-meta")?.textContent).toBe("With a 1 in moulding");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#requirement-the-wall-table-lists-the-space-six-sizes-take} */
  it("holds no radio or checkbox", () => {
    expect(titled.querySelectorAll("input")).toHaveLength(0);
    expect(titled.querySelector("tbody th")?.textContent).toBe("16 × 20 in");
    expect(titled.querySelector("table")?.classList.contains("fs-table-static")).toBe(true);
  });
});
