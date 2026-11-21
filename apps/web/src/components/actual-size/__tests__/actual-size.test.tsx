// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setUnit } from "@/lib/unit";

import { ActualSizeViewer } from "../actual-size";
import { forgetCheck, saveCheck } from "../saved";

// React's act() needs this flag outside a test renderer.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// jsdom has no showModal, and nothing in a closed dialog takes focus.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
};

const server = new DOMParser().parseFromString(
  renderToStaticMarkup(<ActualSizeViewer />),
  "text/html",
);

describe("the viewer in the server HTML", () => {
  /** {@link openspec/specs/actual-size/spec.md#scenario-the-heading-outline-of-the-server-html} */
  it("is titled 8x10 at actual size", () => {
    expect(server.querySelector("h2")?.textContent).toBe("8x10 at actual size");
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-the-size-buttons-in-the-server-html} */
  it("offers seven sizes with only 8×10 pressed, and no Turn", () => {
    const buttons = [...server.querySelectorAll('[aria-label="Size"] button')];
    expect(buttons.map((b) => b.textContent)).toEqual([
      "4×6",
      "5×7",
      "8×10",
      "11×14",
      "16×20",
      "A4",
      "A3",
    ]);
    expect(
      buttons.filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.textContent),
    ).toEqual(["8×10"]);
    expect(server.body.textContent).not.toMatch(/Turn/);
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-8x10-in-centimetres} */
  it("writes 8x10 in both units", () => {
    const read = server.querySelector(".as-read-v");
    expect(read?.querySelector(".u-in")?.textContent).toBe("8 × 10 in");
    expect(read?.querySelector(".u-cm")?.textContent).toBe("20.3 × 25.4 cm");
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-first-visit} */
  it("says the scale is a guess", () => {
    expect(server.querySelector(".fs-badge")?.textContent).toBe("Scale is a guess");
    expect(server.querySelector(".fs-badge-fair")).not.toBeNull();
  });

  /** {@link openspec/specs/actual-size/spec.md#requirement-the-viewer-is-accessible} */
  it("names every control and the box", () => {
    for (const el of server.querySelectorAll("button, input, [role=region]")) {
      const name = el.getAttribute("aria-label") ?? el.textContent ?? "";
      expect(name.trim(), el.outerHTML).not.toBe("");
    }
    const box = server.querySelector('[role="region"]');
    expect(box?.getAttribute("tabindex")).toBe("0");
    expect(box?.getAttribute("aria-label")).toMatch(/^8x10 at actual size/);
    expect(server.querySelector('[aria-live="polite"]')).not.toBeNull();
  });
});

/** A screen for the client: its CSS size, pointer and layout. */
function stubScreen({ w, h, phone }: { w: number; h: number; phone: boolean }) {
  vi.spyOn(window.screen, "width", "get").mockReturnValue(w);
  vi.spyOn(window.screen, "height", "get").mockReturnValue(h);
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("width <") ? phone : query.includes("coarse") ? phone : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

let root: Root | null = null;
let host: HTMLElement;

function mount() {
  host = document.createElement("div");
  document.body.append(host);
  act(() => {
    root = createRoot(host);
    root.render(<ActualSizeViewer />);
  });
}

const button = (name: string) => {
  const found = [...host.querySelectorAll("button")].find(
    (b) => (b.getAttribute("aria-label") ?? b.textContent) === name,
  );
  if (!found) throw new Error(`no button ${name}`);
  return found;
};
const click = (el: HTMLElement) => act(() => el.click());
const px = (value: string | undefined) => Number.parseFloat(value ?? "");

beforeEach(() => {
  window.localStorage.clear();
  forgetCheck();
});
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  host?.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  act(() => setUnit("in"));
});

describe("the desktop box", () => {
  /** {@link openspec/specs/actual-size/spec.md#scenario-8x10-on-a-monitor} */
  it("draws 8x10 at the guessed scale, 8 × scale px wide", () => {
    stubScreen({ w: 1920, h: 1080, phone: false });
    mount();
    const frame = host.querySelector<HTMLElement>('[data-testid="frame"]');
    const scale = Math.hypot(1920, 1080) / 23;
    expect(px(frame?.style.width)).toBeCloseTo(8 * scale, 3);
    expect(px(frame?.style.height)).toBeCloseTo(10 * scale, 3);
    expect(frame?.textContent).toContain("Approximate: scale not checked");
    expect(host.querySelector(".as-phone")).toBeNull();
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-8x10-in-centimetres} */
  it("numbers the rulers in the picked unit", () => {
    stubScreen({ w: 1920, h: 1080, phone: false });
    mount();
    const labels = () =>
      [...host.querySelectorAll('svg[data-axis="x"] text')].map((t) => t.textContent);
    expect(labels().slice(0, 3)).toEqual(["1", "2", "3"]);
    expect(labels()).toContain("8");
    expect(labels()).not.toContain("12");
    act(() => setUnit("cm"));
    expect(labels()).toContain("20");
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-the-same-phone-tomorrow} */
  it("opens with a saved check for the same screen", () => {
    stubScreen({ w: 1920, h: 1080, phone: false });
    saveCheck({ scale: 100, method: "card" }, { w: 1920, h: 1080, dpr: window.devicePixelRatio });
    forgetCheck();
    mount();
    expect(host.querySelector(".fs-badge")?.textContent).toBe("Checked with a card");
    expect(px(host.querySelector<HTMLElement>('[data-testid="frame"]')?.style.width)).toBe(800);
  });

  /** {@link openspec/specs/actual-size/spec.md#requirement-the-desktop-box-shows-the-size-at-11} */
  it("checks inline: the card's outline replaces the frame, Done saves it", () => {
    stubScreen({ w: 1920, h: 1080, phone: false });
    mount();
    click(button("Check with a card"));
    expect(host.querySelector('[data-testid="frame"]')).toBeNull();
    expect(host.textContent).toContain("Your card goes here");
    expect([...host.querySelectorAll(".as-tabs button")].map((b) => b.textContent)).toEqual([
      "Credit card",
      "Ruler",
      "Screen size",
    ]);
    click(button("Done, it matches"));
    expect(host.querySelector(".fs-badge")?.textContent).toBe("Checked with a card");
  });
});

describe("the phone steps", () => {
  /** {@link openspec/specs/actual-size/spec.md#scenario-8x10-on-a-61-in-phone} */
  it("answers with phone screens and the phone's outline", () => {
    stubScreen({ w: 393, h: 852, phone: true });
    mount();
    expect(host.querySelector(".as-phones")?.textContent).toBe(
      "About 3.1 phone screens wide and 1.8 tall.",
    );
    expect(host.textContent).toContain("Your phone");
    expect(button("See 8x10 at actual size")).toBeTruthy();
    expect(host.querySelector(".as-desk")).toBeNull();
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-unchecked} */
  it("asks for the card first, then opens the view", () => {
    stubScreen({ w: 393, h: 852, phone: true });
    mount();
    click(button("See 8x10 at actual size"));
    expect(host.querySelector("h2")?.textContent).toBe("Check your screen");
    expect(host.querySelector("dialog")).toBeNull();
    const start = px(host.querySelector<HTMLElement>('[data-testid="line-start"]')?.style.left);
    const end = px(host.querySelector<HTMLElement>('[data-testid="line-end"]')?.style.left);
    expect(end - start).toBeCloseTo((153.8 * 53.98) / 25.4, 0);
    click(button("Done, it matches"));
    expect(host.querySelector("dialog")?.getAttribute("aria-label")).toBe("8x10 at actual size");
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-skipping-the-check} */
  it("skips to the view labelled as a guess", () => {
    stubScreen({ w: 393, h: 852, phone: true });
    mount();
    click(button("See 8x10 at actual size"));
    click(button("Skip, use the guess"));
    const dialog = host.querySelector("dialog");
    expect(dialog?.textContent).toContain("Guess");
    expect(dialog?.textContent).toContain("Approximate: scale not checked");
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-ruler-on-a-phone-in-centimetres} */
  it("matches a ruler at 5 cm", () => {
    stubScreen({ w: 393, h: 852, phone: true });
    act(() => setUnit("cm"));
    mount();
    click(button("Check it with a card"));
    click(button("Have a ruler? Use it instead"));
    expect(host.textContent).toContain("Slide until the right line is at");
    const start = px(host.querySelector<HTMLElement>('[data-testid="line-start"]')?.style.left);
    const end = px(host.querySelector<HTMLElement>('[data-testid="line-end"]')?.style.left);
    const scale = Math.hypot(393, 852) / 6.1;
    expect(end - start).toBeCloseTo((5 / 2.54) * scale, 3);
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-16x20-on-a-phone} */
  it("shows 16x20 from its corner with rulers, the drag hint and the mini map", () => {
    stubScreen({ w: 393, h: 852, phone: true });
    saveCheck({ scale: 160, method: "card" }, { w: 393, h: 852, dpr: window.devicePixelRatio });
    mount();
    click(button("16×20"));
    click(button("See 16x20 at actual size"));
    const dialog = host.querySelector("dialog");
    expect(dialog?.querySelector('[data-testid="frame"]')).not.toBeNull();
    expect(dialog?.querySelector('svg[data-axis="x"]')).not.toBeNull();
    expect(dialog?.querySelector('svg[data-axis="y"]')).not.toBeNull();
    expect(dialog?.textContent).toContain("Drag to see the rest");
    expect(dialog?.querySelector(".as-mini")).not.toBeNull();
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-keyboard-only} */
  it("focuses Close, and Close and Escape return focus to the See button", () => {
    stubScreen({ w: 393, h: 852, phone: true });
    saveCheck({ scale: 160, method: "card" }, { w: 393, h: 852, dpr: window.devicePixelRatio });
    mount();
    click(button("See 8x10 at actual size"));
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Close");
    click(button("Close"));
    expect(host.querySelector("dialog")).toBeNull();
    expect(document.activeElement?.textContent).toBe("See 8x10 at actual size");

    click(button("See 8x10 at actual size"));
    const dialog = host.querySelector("dialog");
    act(() => {
      dialog?.dispatchEvent(new Event("cancel", { cancelable: true }));
    });
    expect(host.querySelector("dialog")).toBeNull();
    expect(document.activeElement?.textContent).toBe("See 8x10 at actual size");
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-zoomed-in} */
  it("warns while the visual viewport is zoomed", () => {
    stubScreen({ w: 393, h: 852, phone: true });
    vi.stubGlobal("visualViewport", {
      scale: 2,
      addEventListener: () => {},
      removeEventListener: () => {},
    });
    saveCheck({ scale: 160, method: "card" }, { w: 393, h: 852, dpr: window.devicePixelRatio });
    mount();
    click(button("See 8x10 at actual size"));
    expect(host.querySelector("dialog")?.textContent).toContain("Zoomed in, the size is off");
  });
});

describe("beyond phones and monitors", () => {
  /** {@link openspec/specs/actual-size/spec.md#scenario-a-screen-that-is-not-a-phones} */
  it("calls a tablet in the phone layout your screen", () => {
    stubScreen({ w: 744, h: 1133, phone: true });
    mount();
    expect(host.querySelector(".as-phones")?.textContent).toMatch(/^About .* screens wide/);
    expect(host.querySelector(".as-phones")?.textContent).not.toContain("phone");
    expect(host.textContent).toContain("Your screen");
    expect(host.textContent).not.toContain("Your phone");
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-phone-too-narrow-for-the-line} */
  it("says when the right line is past the screen's edge", () => {
    stubScreen({ w: 320, h: 568, phone: true });
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(320);
    mount();
    click(button("See 8x10 at actual size"));
    const edge = () => host.querySelector(".as-edge")?.textContent;
    expect(edge()).toBe("");
    const slider = host.querySelector<HTMLInputElement>('input[type="range"]');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(
        slider,
        "200",
      );
      slider?.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(edge()).toBe("The line is past your screen's edge. Pick your screen size.");
    expect(button("No card? Pick your screen size")).toBeTruthy();
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-a-size-the-screen-cannot-have} */
  it("names the screen size it uses, and ignores one the screen cannot have", () => {
    stubScreen({ w: 1920, h: 1080, phone: false });
    mount();
    click(button("Screen size"));
    expect(button("Use 23 in")).toBeTruthy();
    click(button("27 in"));
    const field = host.querySelector<HTMLInputElement>('input[type="number"]');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(field, "50");
      field?.dispatchEvent(new Event("input", { bubbles: true }));
    });
    click(button("Use 27 in"));
    expect(host.querySelector(".fs-badge")?.textContent).toBe("Checked with screen size");
    const frame = host.querySelector<HTMLElement>('[data-testid="frame"]');
    expect(px(frame?.style.width)).toBeCloseTo((8 * Math.hypot(1920, 1080)) / 27, 3);
  });
});

describe("switching between checks", () => {
  /** {@link openspec/specs/actual-size/spec.md#requirement-the-screen-size-can-set-the-scale} */
  it("saves the named size's scale even after a slider moved on another tab", () => {
    stubScreen({ w: 1920, h: 1080, phone: false });
    mount();
    click(button("Screen size"));
    click(button("27 in"));
    click(button("Credit card"));
    const slider = host.querySelector<HTMLInputElement>('input[type="range"]');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(
        slider,
        "130",
      );
      slider?.dispatchEvent(new Event("input", { bubbles: true }));
    });
    click(button("Screen size"));
    click(button("Use 27 in"));
    const frame = host.querySelector<HTMLElement>('[data-testid="frame"]');
    expect(px(frame?.style.width)).toBeCloseTo((8 * Math.hypot(1920, 1080)) / 27, 3);
  });

  /** {@link openspec/specs/actual-size/spec.md#scenario-the-box-narrows-during-a-sheet-check} */
  it("turns a sheet check into the card when the phone layout takes over", () => {
    stubScreen({ w: 1920, h: 1080, phone: false });
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1038);
    mount();
    click(button("Sheet of paper"));
    expect(host.textContent).toContain("Your Letter sheet");
    stubScreen({ w: 1920, h: 1080, phone: true });
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(host.querySelector("h2")?.textContent).toBe("Check your screen");
    expect(host.textContent).toContain("Stand a credit card upright on the screen.");
  });
});
