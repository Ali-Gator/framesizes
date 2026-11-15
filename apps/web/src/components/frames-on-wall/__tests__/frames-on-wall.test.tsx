// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FramesOnWall } from "../frames-on-wall";

const doc = new DOMParser().parseFromString(renderToStaticMarkup(<FramesOnWall />), "text/html");
const drawing = doc.querySelector('[role="img"]');

describe("the sample room in the server HTML", () => {
  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-default-state-in-the-server-html} */
  it("names the drawing after the room and its frame", () => {
    expect(drawing?.getAttribute("aria-label")).toBe(
      "Sample room: a wall 144 by 96 in with a sofa and a 16x20 picture frame",
    );
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-default-state-in-the-server-html} */
  it("has the 16x20's frame button pressed", () => {
    const button = doc.querySelector('button[aria-label="16x20 frame"]');
    expect(button?.getAttribute("aria-pressed")).toBe("true");
    const chip = [...doc.querySelectorAll(".wf-chip")].find((b) => b.textContent === "16x20");
    expect(chip?.getAttribute("aria-pressed")).toBe("true");
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-both-units-in-the-html} */
  it("shows the four distances, in both units on the drawing", () => {
    const rows = [...doc.querySelectorAll(".wf-row")].map((row) => [
      row.querySelector(".wf-row-name")?.textContent,
      row.querySelector("input")?.getAttribute("value"),
    ]);
    expect(rows).toEqual([
      ["Above", "32"],
      ["Below", "8"],
      ["Left", "63"],
      ["Right", "63"],
    ]);
    const pills = [...doc.querySelectorAll(".wf-pill")].map((p) =>
      [...p.children].map((s) => s.textContent),
    );
    expect(pills).toEqual(
      expect.arrayContaining([
        ["8 in", "20 cm"],
        ["32 in", "81 cm"],
        ["63 in", "160 cm"],
      ]),
    );
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#scenario-the-more-button} */
  it("names the less and more buttons by side and step", () => {
    const names = [...doc.querySelectorAll(".wf-step button")].map((b) =>
      b.getAttribute("aria-label"),
    );
    expect(names).toContain("Below: ¼ in more");
    expect(names).toContain("Above: ¼ in less");
    expect(names).toHaveLength(8);
  });

  /** {@link openspec/specs/frames-on-wall/spec.md#requirement-the-widget-is-accessible} */
  it("keeps every control outside the drawing", () => {
    expect(drawing?.querySelectorAll("button, input, a, select, textarea")).toHaveLength(0);
    expect(drawing?.parentElement?.querySelector(".wf-layer button")).not.toBeNull();
  });
});
