import { describe, expect, it } from "vitest";

import { chartSearch, DEFAULT_STATE, parseChartState, withOrientation } from "../state";

describe("parseChartState", () => {
  /** {@link openspec/specs/frame-size-chart/spec.md#requirement-the-widget-opens-on-16x20-above-a-sofa} */
  it("gives the defaults for an empty query", () => {
    expect(parseChartState("")).toEqual({ size: "16x20", view: "wall", ref: "sofa" });
    expect(DEFAULT_STATE).toEqual({ size: "16x20", view: "wall", ref: "sofa" });
  });

  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-shared-url-is-opened} */
  it("reads an oriented size and the view", () => {
    expect(parseChartState("?size=10x8&view=all")).toEqual({
      size: "10x8",
      view: "all",
      ref: "sofa",
    });
  });

  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-unknown-values} */
  it("ignores values it does not know", () => {
    expect(parseChartState("?size=banana&ref=moon&view=3d")).toEqual(DEFAULT_STATE);
    expect(parseChartState("?size=9x9&ref=door")).toEqual({ ...DEFAULT_STATE, ref: "door" });
  });
});

describe("chartSearch", () => {
  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-a-choice-is-written-to-the-url} */
  it("leaves defaults out and keeps a fixed order", () => {
    expect(chartSearch({ size: "11x14", view: "wall", ref: "door" })).toBe("size=11x14&ref=door");
    expect(chartSearch({ ref: "person", view: "all", size: "10x8" })).toBe(
      "size=10x8&view=all&ref=person",
    );
  });

  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-back-to-the-defaults} */
  it("is empty for the defaults", () => {
    expect(chartSearch(DEFAULT_STATE)).toBe("");
  });

  it("round-trips", () => {
    const state = { size: "14x11", view: "all", ref: "person" } as const;
    expect(parseChartState(`?${chartSearch(state)}`)).toEqual(state);
  });
});

describe("withOrientation", () => {
  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-portrait-to-landscape} */
  it("turns the selected size between portrait and landscape", () => {
    expect(withOrientation(DEFAULT_STATE, "landscape").size).toBe("20x16");
    expect(withOrientation({ ...DEFAULT_STATE, size: "20x16" }, "portrait").size).toBe("16x20");
    expect(withOrientation(DEFAULT_STATE, "portrait").size).toBe("16x20");
  });

  /** {@link openspec/specs/frame-size-chart/spec.md#scenario-into-and-out-of-square} */
  it("selects 12x12 in square and 16x20, turned, when leaving it", () => {
    const square = withOrientation(DEFAULT_STATE, "square");
    expect(square.size).toBe("12x12");
    expect(withOrientation(square, "landscape").size).toBe("20x16");
    expect(withOrientation(square, "portrait").size).toBe("16x20");
  });
});
