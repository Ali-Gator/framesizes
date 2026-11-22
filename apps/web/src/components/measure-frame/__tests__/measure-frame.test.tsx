// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { setUnit } from "@/lib/unit";

import { MeasureFrame } from "../measure-frame";

// React's act() needs this flag outside a test renderer.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const server = new DOMParser().parseFromString(renderToStaticMarkup(<MeasureFrame />), "text/html");

/** An element's accessible name, the simple way: aria-label, its labels, or its text. */
function nameOf(el: Element): string {
  const label = el.getAttribute("aria-label");
  if (label) return label;
  const id = el.getAttribute("id");
  const forLabel = id ? el.ownerDocument.querySelector(`label[for="${id}"]`) : null;
  return (forLabel ?? el.closest("label") ?? el).textContent?.trim() ?? "";
}

describe("the wizard in the server HTML", () => {
  /** {@link openspec/specs/measure-frame/spec.md#scenario-the-heading-outline-of-the-server-html} */
  it("is titled Measure your frame", () => {
    expect(server.querySelector("h2")?.textContent).toBe("Measure your frame");
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-the-choices-in-the-server-html} */
  it("offers four choices, inside first, checked and marked Most exact", () => {
    const radios = [...server.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    expect(radios.map((r) => r.closest("label")?.querySelector(".mf-opt-t")?.textContent)).toEqual([
      "Inside, at the backMost exact",
      "Front opening, no mat",
      "Mat opening",
      "Outside, edge to edge",
    ]);
    expect(radios.map((r) => r.checked)).toEqual([true, false, false, false]);
    expect(server.body.textContent?.match(/Most exact/g)).toHaveLength(1);
    for (const r of radios)
      expect(r.closest("label")?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-centimetres} */
  it("has the eighths row for inches and the centimetre hint, one shown by the unit", () => {
    expect(server.querySelector('.u-in [role="group"]')?.getAttribute("aria-label")).toBe(
      "Eighths of an inch for the width",
    );
    expect(server.querySelector(".u-cm.mf-hint")?.textContent).toBe(
      "Centimetres, to one decimal, like 20.6.",
    );
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-the-drawing-before-an-answer} */
  it("waits for the sizes and draws the example frame", () => {
    expect(server.querySelector('[aria-live="polite"]')?.textContent).toBe(
      "Enter both sides and press Find my frame size.",
    );
    const stage = server.querySelector('.mf-draw [role="img"]');
    expect(stage?.getAttribute("aria-label")).toBe(
      "Drawing of the back of the frame. The yellow tape shows where to measure: the inside, at the back.",
    );
    expect(server.querySelector(".mf-draw figcaption")?.textContent).toBe(
      "Example: an 8x10 frame. The yellow tape shows where to measure.",
    );
  });

  /** {@link openspec/specs/measure-frame/spec.md#requirement-the-wizard-offers-four-measurements-inside-first} */
  it("names every control", () => {
    const controls = [...server.querySelectorAll("button, input")];
    expect(controls.length).toBeGreaterThan(10);
    for (const c of controls) expect(nameOf(c), c.outerHTML).not.toBe("");
  });
});

let host: HTMLDivElement | undefined;
let root: Root | undefined;

function mount() {
  host = document.createElement("div");
  document.body.append(host);
  const r = createRoot(host);
  root = r;
  act(() => r.render(<MeasureFrame />));
}

const button = (name: string) =>
  [...(host as HTMLDivElement).querySelectorAll("button")].find(
    (b) => nameOf(b) === name,
  ) as HTMLButtonElement;
const field = (name: string) =>
  [...(host as HTMLDivElement).querySelectorAll<HTMLInputElement>("input.mf-input")].find(
    (i) => nameOf(i) === name,
  ) as HTMLInputElement;
const click = (el: HTMLElement) => act(() => el.click());
function type(el: HTMLInputElement, text: string) {
  act(() => {
    el.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(el, text);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  act(() => setUnit("in"));
  localStorage.clear();
});

describe("the wizard in use", () => {
  /** {@link openspec/specs/measure-frame/spec.md#requirement-the-answer-is-announced-and-drawn} */
  it("announces the answer in a polite live region", () => {
    mount();
    type(field("Width"), "8");
    type(field("Height"), "10");
    click(button("Find my frame size"));
    const live = host?.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toContain("Your frame is an 8x10.");
    expect(live?.textContent).toContain("8 × 10 in");
    expect(host?.querySelector(".mf-legend")?.textContent).toContain("Inside: the frame size");
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-empty-fields} */
  it("marks both empty fields and moves focus to the first", () => {
    mount();
    click(button("Find my frame size"));
    expect(field("Width").getAttribute("aria-invalid")).toBe("true");
    expect(field("Height").getAttribute("aria-invalid")).toBe("true");
    const described = document.getElementById(
      field("Width").getAttribute("aria-describedby") ?? "",
    );
    expect(described?.textContent).toBe("Enter the width.");
    expect(document.activeElement).toBe(field("Width"));
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-eighths-added-to-a-whole-number} */
  it("adds ⅛ to the field in use", () => {
    mount();
    type(field("Width"), "8");
    click(button("⅛ in"));
    expect(button("⅛ in").getAttribute("aria-pressed")).toBe("true");
    expect(host?.querySelector(".mf-8l b")?.textContent).toBe("8⅛ in");
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-one-unit-for-the-page} */
  it("converts the fields when the site's unit changes", () => {
    mount();
    type(field("Width"), "8");
    click(button("⅛ in"));
    act(() => setUnit("cm"));
    expect(field("Width").value).toBe("20.6");
    act(() => setUnit("in"));
    expect(field("Width").value).toBe("8");
    expect(button("⅛ in").getAttribute("aria-pressed")).toBe("true");
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-the-outside-fields} */
  it("asks for the moulding width on the outside, with the rounded-edge note", () => {
    mount();
    click(host?.querySelectorAll<HTMLInputElement>('input[type="radio"]')[3] as HTMLInputElement);
    expect([...(host as HTMLDivElement).querySelectorAll("input.mf-input")].map(nameOf)).toEqual([
      "Width",
      "Height",
      "Moulding width",
    ]);
    expect(host?.querySelector(".mf-round summary")?.textContent).toBe("Rounded edge?");
    expect(host?.querySelector('.mf-round [role="img"]')).not.toBeNull();
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-the-answer-follows-the-fields} */
  it("follows every change after the first Find", () => {
    mount();
    type(field("Width"), "8");
    type(field("Height"), "10");
    click(button("Find my frame size"));
    type(field("Width"), "11");
    type(field("Height"), "14");
    expect(host?.querySelector(".mf-res-h")?.textContent).toBe("Your frame is an 11x14.");
    expect(host?.querySelector(".mf-holds a")?.getAttribute("href")).toBe("/?size=11x14");
  });

  /** {@link openspec/specs/measure-frame/spec.md#scenario-check-where-to-measure} */
  it("moves focus to the first step on Check where to measure", () => {
    mount();
    type(field("Width"), "9");
    type(field("Height"), "12");
    click(button("Find my frame size"));
    click(button("Check where to measure"));
    expect(document.activeElement?.tagName).toBe("LEGEND");
    expect(field("Width").value).toBe("9");
  });
});
