// @vitest-environment jsdom
import { findFrame, framesFor, type Frame, type Orientation } from "@framesizes/sizes";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ScalePreview } from "../scale-preview";
import { compareLayout, LABEL_GAP, SizeCompare } from "../size-compare";

const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");
const frame = (id: string): Frame => {
  const found = findFrame(id);
  if (!found) throw new Error(id);
  return found;
};

describe("ScalePreview", () => {
  /** {@link openspec/specs/frame-size-chart/spec.md#requirement-the-widget-opens-on-16x20-above-a-sofa} */
  it("names the drawing by the size and the reference", () => {
    const names = (["sofa", "person", "door"] as const).map((reference) => {
      const doc = parse(
        renderToStaticMarkup(
          <ScalePreview frame={frame("16x20")} reference={reference} unit="in" />,
        ),
      );
      return doc.querySelector('[role="img"]')?.getAttribute("aria-label");
    });
    expect(names).toEqual([
      "16x20 picture frame at true scale next to a three-seat sofa",
      "16x20 picture frame at true scale next to a person",
      "16x20 picture frame at true scale next to a door",
    ]);
  });

  /** {@link openspec/specs/frame-size-chart/spec.md#requirement-the-widget-follows-the-sites-unit} */
  it("labels the dimensions in the visitor's unit", () => {
    const labels = (unit: "in" | "cm") =>
      [
        ...parse(
          renderToStaticMarkup(
            <ScalePreview frame={frame("16x20")} reference="sofa" unit={unit} />,
          ),
        ).querySelectorAll(".dim-text"),
      ].map((t) => t.textContent);
    expect(labels("in")).toEqual(["16 in", "20 in"]);
    expect(labels("cm")).toEqual(["40.6 cm", "50.8 cm"]);
  });

  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-next-size-up-is-named} */
  it("draws and names the next size up", () => {
    const doc = parse(
      renderToStaticMarkup(
        <ScalePreview frame={frame("16x20")} ghost={frame("18x24")} reference="sofa" unit="in" />,
      ),
    );
    expect(doc.querySelectorAll("rect.ghost")).toHaveLength(1);
    expect(doc.querySelector(".fs-scale-legend")?.textContent).toContain(
      "Next size up: 18 × 24 in",
    );
  });

  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-largest-size-is-selected} */
  it("draws no ghost when none is passed", () => {
    const doc = parse(
      renderToStaticMarkup(<ScalePreview frame={frame("27x40")} reference="sofa" unit="in" />),
    );
    expect(doc.querySelector("rect.ghost")).toBeNull();
    expect(doc.body.textContent).not.toContain("Next size up");
  });
});

describe("SizeCompare", () => {
  const portrait = framesFor("portrait");

  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-the-view-is-switched} */
  it("names the chart by its range and the selected size", () => {
    const doc = parse(
      renderToStaticMarkup(<SizeCompare sizes={portrait} value="16x20" unit="in" />),
    );
    expect(doc.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe(
      "Standard frame sizes chart from 4x6 to 27x40 inches, 16x20 highlighted",
    );
    expect(doc.querySelectorAll("rect.cmp-sel")).toHaveLength(1);
    expect(doc.querySelectorAll("rect[data-size]")).toHaveLength(portrait.length);
  });

  /** {@link openspec/specs/frame-size-chart/spec.md#requirement-the-all-sizes-view-compares-every-listed-size} */
  it("labels the selected size and every major size without overlap", () => {
    for (const orientation of ["portrait", "landscape", "square"] as Orientation[]) {
      const sizes = framesFor(orientation);
      for (const selected of sizes) {
        const { labels } = compareLayout(sizes, selected.id);
        const labelled = labels.map((l) => l.id);
        expect(labelled[0]).toBe(selected.id);
        expect(new Set(labelled).size).toBe(labelled.length);
        for (const [i, a] of labels.entries()) {
          for (const b of labels.slice(i + 1)) {
            const apart = Math.abs(a.x - b.x) >= LABEL_GAP.x || Math.abs(a.y - b.y) >= LABEL_GAP.y;
            expect(apart, `${orientation} ${selected.id}: ${a.id} / ${b.id}`).toBe(true);
          }
        }
      }
      // With nothing selected, every major size gets its label.
      const { labels } = compareLayout(sizes, "");
      for (const major of sizes.filter((z) => z.major)) {
        expect(labels.map((l) => l.id)).toContain(major.id);
      }
    }
  });
});
