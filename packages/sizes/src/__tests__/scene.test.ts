import { describe, expect, it } from "vitest";

import { findFrame, framesFor, nextSizeUp, type Frame } from "../frames";
import { REFERENCE_IDS, referenceSentence, wallScene, WALL_HEIGHT, type Rect } from "../scene";

const frame = (id: string): Frame => {
  const found = findFrame(id);
  if (!found) throw new Error(`no frame ${id}`);
  return found;
};
const top = (r: Rect) => r.y + r.h;
const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

describe("wall scene", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-a-16x20-frame-above-the-sofa} */
  it("hangs a 16x20 frame 8 in above the sofa, centred on it", () => {
    const scene = wallScene({ frame: frame("16x20"), reference: "sofa" });
    expect(scene.frame.outside.y).toBe(42);
    expect(top(scene.frame.outside)).toBe(64);
    const centre = scene.frame.outside.x + scene.frame.outside.w / 2;
    expect(centre).toBe(scene.reference.box.x + scene.reference.box.w / 2);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-a-16x20-frame-beside-a-person} */
  it("centres a 16x20 frame 57 in from the floor beside a person", () => {
    const scene = wallScene({ frame: frame("16x20"), reference: "person" });
    expect(scene.frame.outside.y).toBe(46);
    expect(top(scene.frame.outside)).toBe(68);
    expect(scene.centreLine).toBe(57);
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-every-size-fits-the-scene} */
  it("keeps every size on the wall and clear of the reference", () => {
    for (const orientation of ["portrait", "landscape", "square"] as const) {
      for (const f of framesFor(orientation)) {
        for (const reference of REFERENCE_IDS) {
          const scene = wallScene({ frame: f, ghost: nextSizeUp(f), reference });
          const boxes = [scene.frame.outside, ...(scene.ghost ? [scene.ghost] : [])];
          for (const box of boxes) {
            const where = `${f.id} ${reference}`;
            expect(box.y, where).toBeGreaterThanOrEqual(0);
            expect(top(box), where).toBeLessThanOrEqual(WALL_HEIGHT);
            if (reference !== "sofa") expect(overlaps(box, scene.reference.box), where).toBe(false);
          }
        }
      }
    }
  });

  it("puts the artwork inside the moulding and hangs the ghost by the same rule", () => {
    const scene = wallScene({ frame: frame("16x20"), ghost: frame("18x24"), reference: "sofa" });
    expect(scene.frame.art).toEqual({ x: -8, y: 43, w: 16, h: 20 });
    expect(scene.ghost).toEqual({ x: -10, y: 42, w: 20, h: 26 });
  });
});

describe("reference sentences", () => {
  /** {@link openspec/specs/size-engine/spec.md#scenario-the-sofa-sentence} */
  it("describes the sofa in both units", () => {
    expect(referenceSentence("sofa", "in")).toBe("Hung 8 in above a sofa 84 in wide");
    expect(referenceSentence("sofa", "cm")).toBe("Hung 20 cm above a sofa 213 cm wide");
  });

  /** {@link openspec/specs/size-engine/spec.md#scenario-the-person-and-door-sentences-in-centimetres} */
  it("describes the person and the door in centimetres", () => {
    expect(referenceSentence("person", "cm")).toBe(
      "Centred 145 cm from the floor, next to a person 175 cm tall",
    );
    expect(referenceSentence("door", "cm")).toBe(
      "Centred 145 cm from the floor, next to a door 203 cm tall",
    );
  });

  it("describes the person and the door in inches", () => {
    expect(referenceSentence("person", "in")).toBe(
      "Centred 57 in from the floor, next to a person 5 ft 9 in tall",
    );
    expect(referenceSentence("door", "in")).toBe(
      "Centred 57 in from the floor, next to a door 6 ft 8 in tall",
    );
  });
});
