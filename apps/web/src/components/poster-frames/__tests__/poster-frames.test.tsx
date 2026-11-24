// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { setUnit } from "@/lib/unit";

import { PosterFrames } from "../poster-frames";

// React's act() needs this flag outside a test renderer.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const server = new DOMParser().parseFromString(renderToStaticMarkup(<PosterFrames />), "text/html");

/** An element's accessible name, the simple way: aria-label, its labels, or its text. */
function nameOf(el: Element): string {
  const label = el.getAttribute("aria-label");
  if (label) return label;
  const id = el.getAttribute("id");
  const forLabel = id ? el.ownerDocument.querySelector(`label[for="${id}"]`) : null;
  return (forLabel ?? el.closest("label") ?? el).textContent?.trim() ?? "";
}
/** Text with only one half of each `<U>`, as a visitor in that unit sees it. */
const unitText = (el: Element | null | undefined, unit: "in" | "cm" = "in") => {
  const copy = el?.cloneNode(true) as Element | undefined;
  copy?.querySelectorAll(unit === "in" ? ".u-cm" : ".u-in").forEach((n) => n.remove());
  return copy?.textContent?.trim() ?? "";
};
const inchText = (el: Element | null | undefined) => unitText(el, "in");

describe("the widget in the server HTML", () => {
  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-the-widget-in-the-server-html} */
  it("opens on 24x36 without a mat, in portrait, with its answer and drawing", () => {
    expect(server.querySelector("h2")?.textContent).toBe("Find the frame for your poster");
    const chips = [...server.querySelectorAll('[aria-label="Poster size"] button')];
    expect(
      chips.map((c) => [
        c.querySelector(".pf-chip-n")?.textContent ?? c.textContent,
        c.getAttribute("aria-pressed"),
      ]),
    ).toEqual([
      ["11×17", "false"],
      ["12×18", "false"],
      ["16×20", "false"],
      ["18×24", "false"],
      ["20×30", "false"],
      ["24×36", "true"],
      ["27×40", "false"],
      ["A3", "false"],
      ["A2", "false"],
      ["A1", "false"],
      ["Custom size", "false"],
    ]);
    const checked = [...server.querySelectorAll('[role="radio"][aria-checked="true"]')];
    expect(checked.map((r) => r.textContent)).toEqual(["Without a mat", "Portrait"]);
    const live = server.querySelector('[aria-live="polite"]');
    expect(inchText(live?.querySelector(".mc-res-h"))).toBe("Use a 24x36 frame.");
    expect(inchText(live?.querySelector(".mc-result-value"))).toBe("24 × 36 in");
    expect(inchText(live?.querySelector(".pf-more p"))).toBe(
      "With a mat it takes a bigger frame: 27x40.",
    );
    expect(live?.querySelector(".pf-more button")?.textContent).toBe("See frames with a mat");
    expect(server.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe(
      "Drawn to scale: a 24 × 36 in (61 × 91.4 cm) poster in a 24 × 36 in (61 × 91.4 cm) frame, no mat.",
    );
    expect([...server.querySelectorAll(".mc-legend li")].map(inchText)).toEqual([
      "Frame24 × 36 in",
      "Poster24 × 36 in",
    ]);
    expect(server.querySelector("figcaption")?.textContent).toBe(
      "Drawn to scale. Every size on this page uses the same scale.",
    );
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-chip-labels} */
  it("writes each chip's size in cm or mm under its name", () => {
    const subs = [...server.querySelectorAll(".pf-chip-s")].map((s) => s.textContent);
    expect(subs[0]).toBe("28×43 cm");
    expect(subs[8]).toBe("420×594 mm");
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-24x36-poster-in-centimetres} */
  it("has the answer in both units", () => {
    const live = server.querySelector('[aria-live="polite"]');
    expect(unitText(live?.querySelector(".mc-result-value"), "cm")).toBe("61 × 91.4 cm");
  });
});

let host: HTMLDivElement | undefined;
let root: Root | undefined;

function mount() {
  host = document.createElement("div");
  document.body.append(host);
  const r = createRoot(host);
  root = r;
  act(() => r.render(<PosterFrames />));
}

const all = (sel: string) => [...(host as HTMLDivElement).querySelectorAll<HTMLElement>(sel)];
const button = (name: string) => {
  const found = all('button, [role="radio"]').find(
    (b) =>
      nameOf(b) === name ||
      inchText(b) === name ||
      b.querySelector(".pf-chip-n")?.textContent === name ||
      b.querySelector(".mc-label")?.textContent === name,
  );
  if (!found) throw new Error(`no button ${name}`);
  return found;
};
const field = (name: string) =>
  all("input.mc-input").find((i) => nameOf(i) === name) as HTMLInputElement;
const live = () => host?.querySelector('[aria-live="polite"]');
const click = (el: HTMLElement) => act(() => el.click());
function type(el: HTMLInputElement, text: string) {
  act(() => {
    el.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(el, text);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
const checked = (group: string) =>
  host?.querySelector(`[aria-label="${group}"] [aria-checked="true"]`)?.textContent;

beforeEach(() => localStorage.clear());
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  act(() => setUnit("in"));
  localStorage.clear();
});

describe("the widget in use", () => {
  /** {@link openspec/specs/poster-frame-sizes/spec.md#requirement-the-answer-is-announced-and-drawn-to-one-scale} */
  it("announces the answer politely", () => {
    mount();
    expect(live()?.getAttribute("aria-live")).toBe("polite");
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-drawing-another-frame} */
  it("draws the mat card pressed", () => {
    mount();
    click(button("11×17"));
    click(button("With a mat"));
    const cards = () => all(".pf-pick");
    expect(cards().map((c) => c.getAttribute("aria-pressed"))).toEqual(["true", "false", "false"]);
    expect(cards()[0]?.textContent).toContain("In the drawing");
    click(button("Frame 2 of 3"));
    expect(cards().map((c) => c.getAttribute("aria-pressed"))).toEqual(["false", "true", "false"]);
    expect(cards()[1]?.textContent).toContain("In the drawing");
    expect(cards()[0]?.textContent).not.toContain("In the drawing");
    expect(inchText(live()?.querySelector(".mc-result-value"))).toBe("16 × 20 in");
    expect(inchText(host?.querySelector(".mc-legend li"))).toBe("Frame16 × 20 in");
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-from-a-standard-frame} */
  it("switches the mat control from the box, both ways", () => {
    mount();
    click(button("27×40"));
    click(button("See frames with a mat"));
    expect(checked("Mat")).toBe("With a mat");
    expect(inchText(live()?.querySelector(".mc-res-h"))).toBe(
      "No standard frame fits a 27x40 poster with a mat.",
    );
    expect(host?.querySelector(".pf-link a")?.getAttribute("href")).toBe("/frame-mat-calculator");
    click(button("See it without a mat"));
    expect(checked("Mat")).toBe("Without a mat");
    click(button("24×36"));
    click(button("See frames with a mat"));
    expect(inchText(live()?.querySelector(".mc-res-h"))).toBe(
      "A 27x40 frame fits a 24x36 poster with a mat.",
    );
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-no-box} */
  it("shows no box for A3 or a typed 40 × 60 in", () => {
    mount();
    click(button("A3"));
    expect(host?.querySelector(".pf-more")).toBeNull();
    click(button("Custom size"));
    type(field("Width"), "40");
    type(field("Height"), "60");
    expect(inchText(live()?.querySelector(".mc-res-h"))).toBe("Not a standard size: 40 × 60 in.");
    expect(host?.querySelector(".pf-more")).toBeNull();
    expect(host?.querySelector("figcaption")?.textContent).toBe(
      "Drawn smaller than the other sizes, to fit.",
    );
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-zero-a-letter-a-negative} */
  it("marks only the bad field and shows no answer or drawing", () => {
    mount();
    click(button("Custom size"));
    /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-empty-fields} */
    expect(live()?.textContent).toBe("Type the poster's width and height. The frame shows here.");
    expect(host?.querySelector('[role="img"]')).toBeNull();
    expect(field("Width").getAttribute("aria-invalid")).toBeNull();
    for (const [w, h, bad] of [
      ["0", "19", "Width"],
      ["13", "a", "Height"],
      ["-13", "19", "Width"],
    ] as const) {
      type(field("Width"), w);
      type(field("Height"), h);
      expect(field(bad).getAttribute("aria-invalid")).toBe("true");
      const good = bad === "Width" ? "Height" : "Width";
      expect(field(good).getAttribute("aria-invalid")).toBeNull();
      expect(host?.textContent).toContain("Enter a width and a height above 0.");
      expect(live()?.textContent).toBe("Fix the size above to see a frame.");
      expect(host?.querySelector('[role="img"]')).toBeNull();
    }
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-orientation-from-the-typed-size} */
  it("hides the orientation control for a typed size", () => {
    mount();
    click(button("Custom size"));
    expect(host?.querySelector('[aria-label="Orientation"]')).toBeNull();
    expect(host?.textContent).toContain("Width first. A size wider than it is tall is landscape.");
    expect(inchText(host?.querySelector(".mc-hint"))).toBe("Fractions work: 13 1/2, 13.5 or 13½.");
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-there-and-back} */
  it("keeps the chip and the typed size there and back", () => {
    mount();
    click(button("18×24"));
    click(button("Custom size"));
    type(field("Width"), "13");
    type(field("Height"), "19");
    click(button("Back to standard sizes"));
    expect(button("18×24").getAttribute("aria-pressed")).toBe("true");
    expect(inchText(live()?.querySelector(".mc-res-h"))).toBe("Use an 18x24 frame.");
    click(button("Custom size"));
    expect([field("Width").value, field("Height").value]).toEqual(["13", "19"]);
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-a-typed-size-converts} */
  it("converts the fields and every number with the header's unit", () => {
    mount();
    click(button("Custom size"));
    type(field("Width"), "13");
    type(field("Height"), "19");
    act(() => setUnit("cm"));
    expect([field("Width").value, field("Height").value]).toEqual(["33", "48.3"]);
    expect(unitText(live()?.querySelector(".mc-res-h"), "cm")).toBe(
      "Not a standard size: 33 × 48.3 cm.",
    );
    expect(unitText(host?.querySelector(".mc-hint"), "cm")).toBe(
      "Centimetres, to one decimal, like 33.5.",
    );
    act(() => setUnit("in"));
    expect([field("Width").value, field("Height").value]).toEqual(["13", "19"]);
  });

  /** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-landscape} */
  it("turns the chip labels in landscape", () => {
    mount();
    click(button("Landscape"));
    expect(button("17×11").getAttribute("aria-pressed")).toBe("false");
    expect(button("A2").querySelector(".pf-chip-s")?.textContent).toBe("594×420 mm");
  });
});
