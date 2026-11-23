// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { setUnit } from "@/lib/unit";

import { FrameMat } from "../frame-mat";

// React's act() needs this flag outside a test renderer.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const server = new DOMParser().parseFromString(renderToStaticMarkup(<FrameMat />), "text/html");

/** An element's accessible name, the simple way: aria-label, its labels, or its text. */
function nameOf(el: Element): string {
  const label = el.getAttribute("aria-label");
  if (label) return label;
  const id = el.getAttribute("id");
  const forLabel = id ? el.ownerDocument.querySelector(`label[for="${id}"]`) : null;
  return (forLabel ?? el.closest("label") ?? el).textContent?.trim() ?? "";
}
/** Text with only the inch half of each `<U>`, as a visitor in inches sees it. */
const inchText = (el: Element | null | undefined) => {
  const copy = el?.cloneNode(true) as Element | undefined;
  copy?.querySelectorAll(".u-cm").forEach((n) => n.remove());
  return copy?.textContent?.trim() ?? "";
};

describe("the calculator in the server HTML", () => {
  const inputs = [...server.querySelectorAll<HTMLInputElement>("input.mc-input")];

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-calculator-in-the-server-html} */
  it("starts from a print with empty sizes and a 2 in border", () => {
    expect(server.querySelector("h2")?.textContent).toBe("Frame and mat calculator");
    expect([...server.querySelectorAll(".mc-end")].map((e) => e.textContent)).toEqual([
      "You enterPrint size",
      "You getFrame size",
    ]);
    expect(server.querySelector(".mc-swap")?.getAttribute("aria-label")).toBe(
      "Reverse: start from a frame",
    );
    expect(inputs.map((i) => [nameOf(i), i.value])).toEqual([
      ["Print width", ""],
      ["Print height", ""],
      ["Mat border", "2"],
    ]);
    const chips = [...server.querySelectorAll('[aria-label="Common mat borders"] button')];
    expect(chips.map((c) => [inchText(c), c.getAttribute("aria-pressed")])).toEqual([
      ["1½ in", "false"],
      ["2 in", "true"],
      ["2½ in", "false"],
      ["3 in", "false"],
    ]);
    expect([...server.querySelectorAll(".mc-bar button")].map((b) => b.textContent)).toEqual([
      "Find my frame size",
    ]);
    expect(server.querySelector('[aria-live="polite"]')?.textContent).toBe(
      "Enter your print size and a mat border. The frame size and mat opening show here.",
    );
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-drawing-before-an-answer} */
  it("draws the example 8x10 in an 11x14", () => {
    expect([...server.querySelectorAll(".mc-legend li")].map(inchText)).toEqual([
      "Frame size11 × 14 in",
      "Mat opening7½ × 9½ in",
      "Print, edge under the mat8 × 10 in",
      "Mat border, sides / top1¾ / 2¼ in",
    ]);
    expect(server.querySelector("figcaption")?.textContent).toBe(
      "Example: an 8x10 print in an 11x14 frame with a pre-cut mat.",
    );
    expect(server.querySelector('[role="img"]')?.getAttribute("aria-label")).toContain(
      "an 11 by 14 in frame",
    );
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-centimetres} */
  it("has the hints and chips in both units", () => {
    expect(server.querySelector(".mc-hint .u-in")?.textContent).toBe(
      "Fractions work: 8 1/2, 8.5 or 8½.",
    );
    expect(server.querySelector(".mc-hint .u-cm")?.textContent).toBe(
      "Centimetres, to one decimal, like 20.3.",
    );
    expect(
      [...server.querySelectorAll('[aria-label="Common mat borders"] .u-cm')].map(
        (c) => c.textContent,
      ),
    ).toEqual(["3.8 cm", "5.1 cm", "6.4 cm", "7.6 cm"]);
  });
});

let host: HTMLDivElement | undefined;
let root: Root | undefined;

function mount() {
  host = document.createElement("div");
  document.body.append(host);
  const r = createRoot(host);
  root = r;
  act(() => r.render(<FrameMat />));
}

const all = (sel: string) => [...(host as HTMLDivElement).querySelectorAll<HTMLElement>(sel)];
const button = (name: string) =>
  all("button").find((b) => nameOf(b) === name || inchText(b) === name) as HTMLButtonElement;
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
const pressed = () =>
  all('[aria-label="Common mat borders"] button')
    .filter((b) => b.getAttribute("aria-pressed") === "true")
    .map(inchText);

beforeEach(() => localStorage.clear());
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  act(() => setUnit("in"));
  localStorage.clear();
});

describe("the calculator in use", () => {
  /** {@link openspec/specs/frame-mat-calculator/spec.md#requirement-the-answer-is-announced-and-drawn} */
  it("announces the answer politely", () => {
    mount();
    expect(live()?.getAttribute("aria-live")).toBe("polite");
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-empty-fields} */
  it("marks empty fields and focuses the first", () => {
    mount();
    click(button("Find my frame size"));
    expect(field("Print width").getAttribute("aria-invalid")).toBe("true");
    expect(field("Print height").getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(field("Print width"));
    expect(live()?.textContent).toBe("Check the marked fields, then try again.");
    expect(host?.textContent).toContain("Enter the print width.");
    expect(host?.textContent).toContain("Enter the print height.");
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-answer-follows-an-edit} */
  it("follows an edit after the first find", () => {
    mount();
    type(field("Print width"), "8");
    type(field("Print height"), "10");
    expect(live()?.textContent).not.toContain("11½");
    click(button("Find my frame size"));
    expect(live()?.textContent).toContain("Your frame: 11½ × 13½ in.");
    type(field("Print height"), "14");
    expect(live()?.textContent).toContain("Your frame: 11½ × 17½ in.");
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-start-over} */
  it("starts over with empty sizes and a 2 in border", () => {
    mount();
    type(field("Print width"), "8");
    type(field("Print height"), "10");
    click(button("3 in"));
    click(button("Find my frame size"));
    click(button("Start over"));
    expect([field("Print width").value, field("Print height").value]).toEqual(["", ""]);
    expect(field("Mat border").value).toBe("2");
    expect(pressed()).toEqual(["2 in"]);
    expect(live()?.textContent).toBe(
      "Enter your print size and a mat border. The frame size and mat opening show here.",
    );
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-a-chip-and-a-typed-border} */
  it("presses the chip of the border and none for another", () => {
    mount();
    click(button("2½ in"));
    expect(field("Mat border").value).toBe("2½");
    expect(pressed()).toEqual(["2½ in"]);
    type(field("Mat border"), "1.75");
    expect(pressed()).toEqual([]);
    expect(inchText(host?.querySelector(".mc-mat .mc-hint"))).toBe(
      "The cut width on each side. The frame's lip covers about ¼ in of it.",
    );
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-header-switch} */
  it("converts the fields when the unit changes anywhere", () => {
    mount();
    type(field("Print width"), "8");
    type(field("Print height"), "10");
    act(() => setUnit("cm"));
    expect(["Print width", "Print height", "Mat border"].map((n) => field(n).value)).toEqual([
      "20.3",
      "25.4",
      "5.1",
    ]);
    expect(host?.querySelector('[role="radio"][aria-checked="true"]')?.textContent).toBe("cm");
    act(() => setUnit("in"));
    expect(["Print width", "Print height", "Mat border"].map((n) => field(n).value)).toEqual([
      "8",
      "10",
      "2",
    ]);
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-there-and-back} */
  it("reverses there and back with the answer carried", () => {
    mount();
    type(field("Print width"), "8");
    type(field("Print height"), "10");
    click(button("Find my frame size"));
    click(button("Reverse: start from a frame"));
    expect([field("Frame width").value, field("Frame height").value]).toEqual(["11½", "13½"]);
    expect(live()?.textContent).toContain("An 8x10 print fits.");
    click(button("Reverse: start from a print"));
    expect([field("Print width").value, field("Print height").value]).toEqual(["8", "10"]);
    expect(live()?.textContent).toContain("Your frame: 11½ × 13½ in.");
  });

  /** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-reverse-before-an-answer} */
  it("only flips the direction before an answer", () => {
    mount();
    type(field("Print width"), "8");
    type(field("Print height"), "10");
    click(button("Reverse: start from a frame"));
    expect(host?.querySelector(".mc-end.is-from")?.textContent).toBe("You enterFrame size");
    expect([field("Frame width").value, field("Frame height").value]).toEqual(["8", "10"]);
    expect(button("Find the print that fits")).toBeDefined();
    expect(live()?.textContent).toBe(
      "Enter your frame size and a mat border. The largest print that fits shows here.",
    );
  });
});
