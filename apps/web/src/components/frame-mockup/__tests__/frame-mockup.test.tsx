// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FrameMockup } from "../frame-mockup";
import { current, INITIAL } from "../state";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const server = new DOMParser().parseFromString(renderToStaticMarkup(<FrameMockup />), "text/html");
/** Text with only one half of each `<U>`. */
const unitText = (el: Element | null | undefined, unit: "in" | "cm" = "in") => {
  const copy = el?.cloneNode(true) as Element | undefined;
  copy?.querySelectorAll(unit === "in" ? ".u-cm" : ".u-in").forEach((n) => n.remove());
  return copy?.textContent?.replace(/\s+/g, " ").trim() ?? "";
};
const pressed = (doc: ParentNode, selector: string) =>
  [...doc.querySelectorAll(`${selector} [aria-pressed="true"], ${selector} [aria-checked="true"]`)]
    .map((b) => b.querySelector(".mk-chip-n")?.textContent ?? b.textContent?.trim())
    .filter(Boolean);
const chipLabels = (doc: ParentNode) =>
  [...doc.querySelectorAll(".mk-chips .mk-chip-n")].map((n) => n.textContent);

describe("the widget in the server HTML", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-the-widget-in-the-server-html} */
  it("shows the sample in a 24x36 black frame, no mat, above the sofa, the whole wall", () => {
    expect(server.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe(
      "Poster mockup: the sample in a 24x36 black frame, no mat, above a sofa, the whole 12 by 8 ft wall, drawn to true scale.",
    );
    expect(server.querySelector(".mk-art-t")?.textContent).toBe("Sample artwork");
    expect(server.querySelector(".mk-art-s")?.textContent).toBe("2:3, drawn for this site");
    const labels = chipLabels(server);
    expect(labels).toHaveLength(17);
    expect(labels[0]).toBe("4×6");
    expect(labels.slice(13)).toEqual(["27×40", "A3", "A2", "A1"]);
    expect(pressed(server, ".mk-chips")).toEqual(["24×36"]);
    expect(pressed(server, ".mk-fins")).toEqual(["Black"]);
    expect(pressed(server, '[aria-label="Mat"]')).toEqual(["No mat"]);
    expect(pressed(server, '[aria-label="Wall"]')).toEqual(["Above the sofa"]);
    expect(pressed(server, '[aria-label="View"]')).toEqual(["Whole wall"]);
    expect(unitText(server.querySelector(".mc-result-value"))).toBe("24 × 36 in");
    expect(server.body.textContent).not.toContain("Use the sample again");
    expect(server.querySelector("img.mk-art")?.getAttribute("src")).toBe(
      "/frame-mockup/sample.svg",
    );
    expect(server.querySelector("img.mk-art")?.getAttribute("alt")).toBe("");
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-nothing-to-move} */
  it("disables the move control and says nothing moves", () => {
    expect(server.querySelector<HTMLButtonElement>(".mk-move")?.disabled).toBe(true);
    expect(server.querySelector('[role="img"] .mk-move')).toBeNull();
    expect(unitText(server.querySelector(".mk-hint"))).toBe(
      "Nothing to move: the artwork fills this frame as it is.",
    );
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-the-whole-wall} */
  it("gives the PNG's size and the answer", () => {
    expect(server.body.textContent).toContain(
      "2,400 × 1,600 px PNG of the view above. No watermark.",
    );
    expect([...server.querySelectorAll(".mk-facts li")].map((li) => unitText(li))).toEqual([
      "Nothing is cut: the sample has this shape.",
      "Outside 26 × 38 in, with a 1 in moulding. Bottom edge 42 in, top edge 80 in above the floor, 8 in over the sofa.",
    ]);
  });
});

let host: HTMLDivElement;
let root: Root;
const q = <T extends Element = HTMLElement>(sel: string) => host.querySelector<T>(sel);
const button = (text: string) =>
  [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (b) => (b.querySelector(".mk-chip-n")?.textContent ?? b.textContent?.trim()) === text,
  );
const click = (el: Element | null | undefined) =>
  act(() => {
    (el as HTMLElement | null)?.click();
  });

/** Image decoding in jsdom: a picked file decodes to the size its name says, or fails. */
function stubImages() {
  let n = 0;
  vi.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:test/${++n}`);
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  const sizes = new Map<string, [number, number]>();
  Object.defineProperty(HTMLImageElement.prototype, "decode", {
    configurable: true,
    value(this: HTMLImageElement & { _size?: [number, number] }) {
      const size = sizes.get(this.src);
      if (!size) return Promise.reject(new Error("bad image"));
      Object.defineProperty(this, "naturalWidth", { configurable: true, value: size[0] });
      Object.defineProperty(this, "naturalHeight", { configurable: true, value: size[1] });
      return Promise.resolve();
    },
  });
  return {
    /** The next object URL decodes to this size. */
    next(width: number, height: number) {
      sizes.set(`blob:test/${n + 1}`, [width, height]);
    },
  };
}

async function choose(file: File) {
  const input = q<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("no input");
  Object.defineProperty(input, "files", { configurable: true, value: [file] });
  await act(async () => {
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await Promise.resolve();
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}
const png = () => new File(["x"], "my-secret-design.png", { type: "image/png" });

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<FrameMockup />));
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});

describe("live regions", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#requirement-an-upload-opens-on-the-size-that-cuts-least} */
  it("puts the note and the errors in one polite region and the answer in another", async () => {
    const images = stubImages();
    const status = q(".mk-status");
    const answer = q(".mk-answer");
    expect(status?.getAttribute("aria-live")).toBe("polite");
    expect(answer?.getAttribute("aria-live")).toBe("polite");
    images.next(2000, 3000);
    await choose(png());
    expect(status?.textContent).toBe(
      "24x36 cuts your artwork least, so the mockup opened on 24x36.",
    );
    await choose(new File(["%PDF"], "a.pdf", { type: "application/pdf" }));
    expect(status?.textContent).toBe(
      "This file is not an image. Choose a JPEG or a PNG.The last artwork stays in the frame.",
    );
    expect(host.textContent).not.toContain("my-secret-design");
  });
});

describe("uploads", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-a-second-upload-replaces-the-first} */
  it("opens each upload on the size that cuts least and shows the sample button", async () => {
    const images = stubImages();
    images.next(2000, 3000);
    await choose(png());
    expect(q(".mk-art-t")?.textContent).toBe("Your artwork");
    expect(q(".mk-art-s")?.textContent).toBe("2000 × 3000 px");
    expect(button("Use the sample again")).toBeDefined();
    click(button("Light oak"));
    images.next(3000, 4000);
    await choose(png());
    expect(pressed(host, ".mk-chips")).toEqual(["18×24"]);
    expect(pressed(host, ".mk-fins")).toEqual(["Light oak"]);
    expect(q(".mk-status")?.textContent).toBe(
      "New artwork. 18x24 cuts it least, so the frame changed to 18x24.",
    );
    click(button("Use the sample again"));
    expect(q(".mk-art-t")?.textContent).toBe("Sample artwork");
    expect(button("Use the sample again")).toBeUndefined();
  });

  /**
   * {@link openspec/specs/frame-mockup/spec.md#scenario-not-an-image}
   * {@link openspec/specs/frame-mockup/spec.md#scenario-an-image-the-browser-cannot-open}
   */
  it("keeps the artwork for a file that is not an image or does not decode", async () => {
    const images = stubImages();
    images.next(3000, 4000);
    await choose(png());
    const label = q('[role="img"]')?.getAttribute("aria-label");
    await choose(new File(["%PDF"], "a.pdf", { type: "application/pdf" }));
    expect(q(".mk-status")?.textContent).toContain(
      "This file is not an image. Choose a JPEG or a PNG.",
    );
    await choose(png()); // no size registered: it fails to decode
    expect(q(".mk-status")?.textContent).toBe(
      "Your browser cannot open this file. Try a JPEG or a PNG.The last artwork stays in the frame.",
    );
    expect(q('[role="img"]')?.getAttribute("aria-label")).toBe(label);
    expect(q(".mk-art-s")?.textContent).toBe("3000 × 4000 px");
  });

  /** {@link openspec/specs/frame-mockup/spec.md#requirement-the-uploaded-artwork-stays-on-the-device} */
  it("drops a stale pick and revokes its URL", async () => {
    stubImages();
    let release: (() => void) | undefined;
    Object.defineProperty(HTMLImageElement.prototype, "decode", {
      configurable: true,
      value(this: HTMLImageElement) {
        const first = this.src.endsWith("/1");
        Object.defineProperty(this, "naturalWidth", {
          configurable: true,
          value: first ? 3000 : 2000,
        });
        Object.defineProperty(this, "naturalHeight", {
          configurable: true,
          value: first ? 2000 : 3000,
        });
        return first ? new Promise<void>((r) => (release = r)) : Promise.resolve();
      },
    });
    const input = q<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("no input");
    Object.defineProperty(input, "files", { configurable: true, value: [png()] });
    await act(async () => {
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(q(".mk-status")?.textContent).toBe("Opening your artwork…");
    expect(button("Choose a JPEG or PNG")?.disabled).toBe(true);
    await choose(png());
    await act(async () => {
      release?.();
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(q(".mk-art-s")?.textContent).toBe("2000 × 3000 px");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test/1");
  });
});

describe("the sample during a read", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-back-to-the-sample} */
  it("drops a read still running when the visitor goes back to the sample", async () => {
    const images = stubImages();
    images.next(2000, 3000);
    await choose(png());
    let release: (() => void) | undefined;
    Object.defineProperty(HTMLImageElement.prototype, "decode", {
      configurable: true,
      value(this: HTMLImageElement) {
        Object.defineProperty(this, "naturalWidth", { configurable: true, value: 3000 });
        Object.defineProperty(this, "naturalHeight", { configurable: true, value: 4000 });
        return new Promise<void>((r) => (release = r));
      },
    });
    const input = q<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("no input");
    Object.defineProperty(input, "files", { configurable: true, value: [png()] });
    await act(async () => {
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    click(button("Use the sample again"));
    await act(async () => {
      release?.();
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(q(".mk-art-t")?.textContent).toBe("Sample artwork");
    expect(q(".mk-status")?.textContent).toBe(
      "The sample is back on 24x36. Your style, mat, wall and view stay as they were.",
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test/2");
  });
});

describe("moving the artwork", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-keys-move-the-artwork} */
  it("moves by focusStep(1 in) on Shift + ArrowUp in 16x20", () => {
    click(button("16×20"));
    const move = q<HTMLButtonElement>(".mk-move");
    expect(move?.disabled).toBe(false);
    const before = q<HTMLImageElement>("img.mk-art")?.style.top;
    act(() => {
      move?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", shiftKey: true, bubbles: true }),
      );
    });
    const shift = current({ ...INITIAL, size: "16x20" }).step.shift;
    // 2:3 art in 16x20 overhangs 4 in; focus 0.5 → 0.5 + shift moves it 1 in up of 96.
    expect(shift * 4).toBeCloseTo(1, 9);
    const after = q<HTMLImageElement>("img.mk-art")?.style.top;
    expect(parseFloat(before ?? "") - parseFloat(after ?? "")).toBeCloseTo((1 / 96) * 100, 2);
    expect(unitText(q(".mk-hint"))).toBe(
      "Drag the artwork to choose what is cut. Arrow keys move it ¼ in, Shift + arrow 1 in.",
    );
  });

  /** {@link openspec/specs/frame-mockup/spec.md#scenario-nothing-to-move} */
  it("is disabled on 24x36", () => {
    expect(q<HTMLButtonElement>(".mk-move")?.disabled).toBe(true);
  });
});

describe("the frame styles", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-walnut} */
  it("offers four styles; Walnut changes only the frame's colour", () => {
    expect([...host.querySelectorAll(".mk-fins button")].map((b) => b.textContent)).toEqual([
      "Black",
      "White",
      "Light oak",
      "Walnut",
    ]);
    const outside = () => unitText(host.querySelectorAll(".mk-facts li")[1]);
    const before = outside();
    click(button("Walnut"));
    expect(pressed(host, ".mk-fins")).toEqual(["Walnut"]);
    expect(q(".mk-fr")?.classList.contains("fin-walnut")).toBe(true);
    expect(q('[role="img"]')?.getAttribute("aria-label")).toContain("walnut frame");
    expect(outside()).toBe(before);
  });
});

describe("the mat and 4x6", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-4x6-picked} */
  it("disables and describes Mat on 4x6, and the 4x6 chip with the mat on", () => {
    click(button("4×6"));
    const mat = host.querySelector<HTMLButtonElement>('[aria-label="Mat"] [data-value="yes"]');
    expect(mat?.disabled).toBe(true);
    const why = mat?.getAttribute("aria-describedby");
    expect(why && host.querySelector(`[id="${why}"]`)?.textContent).toBe(
      "A 4x6 has no room for a mat.",
    );
    click(button("24×36"));
    click(host.querySelector('[aria-label="Mat"] [data-value="yes"]'));
    const chip = button("4×6");
    expect(chip?.disabled).toBe(true);
    expect(chip?.querySelector(".mk-chip-s")?.textContent).toBe("No room");
  });
});

describe("the phone buttons", () => {
  /** {@link openspec/specs/frame-mockup/spec.md#scenario-phone} */
  it("carry aria-expanded and their current values", () => {
    const tabs = [...host.querySelectorAll<HTMLButtonElement>(".mk-tab")];
    expect(tabs.map((t) => [t.textContent, t.getAttribute("aria-expanded")])).toEqual([
      ["Size24×36", "true"],
      ["StyleBlack", "false"],
      ["MatNo mat", "false"],
      ["WallSofa", "false"],
    ]);
    click(tabs[1]);
    expect(tabs[1]?.getAttribute("aria-expanded")).toBe("true");
    const controls = tabs[1]?.getAttribute("aria-controls");
    expect(
      controls && host.querySelector(`[id="${controls}"]`)?.classList.contains("is-open"),
    ).toBe(true);
  });
});
