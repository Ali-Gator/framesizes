// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GalleryWall } from "../gallery-wall";
import { NailMarks } from "../nail-marks";
import { initialState, reducer } from "../state";

const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");
const text = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, " ").trim();
const units = (el: Element | null | undefined) =>
  [...(el?.querySelectorAll(".u-in, .u-cm") ?? [])].map((s) => s.textContent);

describe("the Layout view in the server HTML", () => {
  const doc = parse(renderToStaticMarkup(<GalleryWall />));
  const drawing = doc.querySelector('[role="img"]');

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-planners-default-state-in-the-server-html} */
  it("names the drawing and checks the default template's picture", () => {
    expect(drawing?.getAttribute("aria-label")).toBe(
      "Gallery wall layout: five frames above a sofa",
    );
    const checked = doc.querySelector('.g-tpl input[type="radio"][checked]');
    expect(checked?.getAttribute("aria-label")).toBe("One big, two on each side");
    expect(doc.querySelectorAll('.g-tpl input[type="radio"]')).toHaveLength(5);
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-planners-default-state-in-the-server-html} */
  it("has frame buttons A to E and the whole group selected", () => {
    const names = [...doc.querySelectorAll(".wf-hit")].map((b) => b.getAttribute("aria-label"));
    expect(names).toEqual([
      "Frame A, 8x10 picture frame",
      "Frame B, 8x10 picture frame",
      "Frame C, 18x24 picture frame",
      "Frame D, 8x10 picture frame",
      "Frame E, 8x10 picture frame",
    ]);
    const all = [...doc.querySelectorAll(".wf-chip")].find((b) => text(b) === "All 5");
    expect(all?.getAttribute("aria-pressed")).toBe("true");
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-the-planners-default-state-in-the-server-html} */
  it("shows the summary in both units and the group's distances", () => {
    const items = [...doc.querySelectorAll(".g-sum-i")].map((i) => [
      text(i.querySelector("dt")),
      units(i.querySelector("dd")),
    ]);
    expect(items).toEqual([
      ["Size", ["46 × 27 in", "117 × 69 cm"]],
      ["Top edge", ["69 in", "175 cm"]],
      ["Left · right", ["49 · 49 in", "124 · 124 cm"]],
    ]);
    const rows = [...doc.querySelectorAll(".wf-row")].map((row) => [
      text(row.querySelector(".wf-row-name")),
      row.querySelector("input")?.getAttribute("value"),
      text(row.querySelector(".wf-row-to")),
    ]);
    expect(rows).toEqual([
      ["Above", "27", "to the ceiling"],
      ["Below", "8", "to the sofa"],
      ["Left", "49", "to the wall's edge"],
      ["Right", "49", "to the wall's edge"],
    ]);
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-no-detectable-violations} */
  it("keeps every control out of the drawing", () => {
    expect(drawing?.querySelectorAll("button, input, a, select")).toHaveLength(0);
  });
});

describe("the Nail marks view", () => {
  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-one-nail-with-a-2-inch-drop} */
  it("lists the hero's nails as 1 A, 2 C, 3 D, 4 B, 5 E", () => {
    const state = [
      { type: "hangerType", kind: "one" },
      { type: "hangerField", field: "drop", text: "2", unit: "in" },
    ].reduce(reducer as never, initialState());
    const doc = parse(
      renderToStaticMarkup(<NailMarks state={state} unit="in" dispatch={() => undefined} />),
    );
    const rows = [...doc.querySelectorAll("tbody tr")].map((tr) =>
      [...tr.children].map((c) => text(c)),
    );
    expect(rows.map((r) => `${r[0]} ${r[1]}`)).toEqual(["1 A", "2 C", "3 D", "4 B", "5 E"]);
    expect(rows[1]).toEqual(["2", "C", "23 in", "2½ in", "66½ in"]);
    expect(doc.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe(
      "Nail marks: five nails for five frames",
    );
  });

  /** {@link openspec/specs/gallery-wall-planner/spec.md#scenario-no-drop-yet} */
  it("asks for the drop before it numbers anything", () => {
    const doc = parse(
      renderToStaticMarkup(
        <NailMarks state={initialState()} unit="in" dispatch={() => undefined} />,
      ),
    );
    expect(doc.body.textContent).toContain("Type the drop to number the nails.");
    expect(doc.querySelector("table")).toBeNull();
    expect(text(doc.querySelector(".g-corner-l"))).toBe("Start");
  });
});
