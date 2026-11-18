import { describe, expect, it } from "vitest";

import {
  type Action,
  framesOf,
  initialState,
  type PlannerState,
  reducer,
} from "@/components/gallery-wall/state";

import {
  fromSaved,
  needsBlob,
  needsWrite,
  type SavedPhoto,
  type SavedRecord,
  savedPhoto,
  toSaved,
} from "../saved-wall";

const run = (actions: Action[], from: PlannerState = initialState()) =>
  actions.reduce(reducer, from);
const PHOTO = { url: "blob:picked", width: 1200, height: 900 };
const ON_SOFA: Action[] = [
  { type: "upload" },
  { type: "photo", photo: PHOTO },
  { type: "known", known: "sofa" },
  { type: "toPlace" },
  { type: "placeNext" },
  { type: "setScale", unit: "in" },
];
const BLOB = new Blob(["photo bytes"]);
const record = (state: PlannerState, photo: SavedPhoto | null = null): SavedRecord => ({
  v: 1,
  planner: toSaved(state),
  photo,
});
/** A JSON copy, as a structured clone would keep it. */
const stored = (r: SavedRecord) => ({ ...JSON.parse(JSON.stringify(r)), photo: r.photo });

/** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-changed-layout-survives-a-reload} */
describe("the saved wall", () => {
  const changed = run([
    { type: "gapText", text: "2", unit: "in" },
    { type: "nudge", id: "t0", dx: -4, dy: 0 },
    { type: "remove", id: "t4" },
    { type: "openPicker", mode: "add" },
    { type: "applyPicker" },
    { type: "select", id: "group" },
    { type: "moveGroup", dx: 1, dy: 2 },
    { type: "hangerType", kind: "two" },
    { type: "hangerField", field: "drop", text: "3", unit: "in" },
    { type: "view", view: "nails" },
  ]);

  it("brings back every layout field after a reload", () => {
    const back = fromSaved(stored(record(changed)), () => "blob:never");
    expect(back).not.toBeNull();
    for (const key of [
      "view",
      "template",
      "sizes",
      "gap",
      "moved",
      "group",
      "added",
      "removed",
      "hangers",
      "lastType",
      "nextId",
    ] as const) {
      expect(back?.[key], key).toEqual(changed[key]);
    }
    expect(back?.gap).toBe(2);
    expect(back && framesOf(back)).toEqual(framesOf(changed));
  });

  it("keeps no dialog, picker, draft, selection or photo URL", () => {
    const open = run(
      [
        { type: "select", id: "t1" },
        { type: "hangerFor", for: "t1" },
        { type: "openPicker", mode: "size" },
        { type: "openReset" },
        { type: "template", id: "grid-of-four" },
      ],
      changed,
    );
    const saved = toSaved(open);
    expect(Object.keys(saved).sort()).toEqual(
      [
        "added",
        "gap",
        "group",
        "hangers",
        "lastType",
        "moved",
        "nextId",
        "removed",
        "sizes",
        "template",
        "view",
        "wall",
      ].sort(),
    );
    const back = fromSaved(stored(record(open)), () => "blob:never");
    expect(back).toMatchObject({
      selected: "group",
      picker: null,
      confirmReset: false,
      confirmSwitch: null,
      draft: null,
      hangerFor: "all",
    });
    expect(JSON.stringify(record(run(ON_SOFA)))).not.toContain("blob:");
  });

  it("ignores a record of another version", () => {
    expect(fromSaved({ ...record(changed), v: 2 }, () => "blob:x")).toBeNull();
    expect(fromSaved(undefined, () => "blob:x")).toBeNull();
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-wall-photo-survives-a-reload} */
  it("brings back a scaled photo with its layout, on a fresh URL", () => {
    const onPhoto = run([...ON_SOFA, { type: "nudge", id: "t2", dx: 0, dy: 1 }]);
    const photo = savedPhoto(onPhoto, null, BLOB);
    expect(photo).toMatchObject({ blob: BLOB, width: 1200, height: 900, scale: onPhoto.scale });
    const urls: Blob[] = [];
    const back = fromSaved(record(onPhoto, photo), (blob) => {
      urls.push(blob);
      return "blob:fresh";
    });
    expect(urls).toEqual([BLOB]);
    expect(back?.mode).toBe("photo");
    expect(back?.photo?.url).toBe("blob:fresh");
    expect(back?.scale).toBe(onPhoto.scale);
    expect(back && framesOf(back)).toEqual(framesOf(onPhoto));
  });

  it("keeps the saved photo through a write with no photo in the planner", () => {
    const kept = savedPhoto(run(ON_SOFA), null, BLOB);
    for (const state of [initialState(), run([{ type: "upload" }]), run(ON_SOFA.slice(0, 4))]) {
      expect(savedPhoto(state, kept, null), state.mode).toBe(kept);
    }
    // On the sample room the photo is kept but not shown, and no URL is made for it.
    const back = fromSaved(record(initialState(), kept), () => {
      throw new Error("no URL for a hidden photo");
    });
    expect(back?.mode).toBe("sample");
  });

  it("writes only the visitor's changes and reads no bytes of the stored photo", () => {
    const loaded = run(ON_SOFA);
    expect(needsWrite(loaded, loaded)).toBe(false);
    expect(needsWrite(reducer(loaded, { type: "gapStep", direction: 1, unit: "in" }), loaded)).toBe(
      true,
    );
    expect(needsWrite(initialState(), null)).toBe(true);
    const made = new Set(["blob:fresh"]);
    expect(needsBlob("blob:fresh", made)).toBe(false);
    expect(needsBlob("blob:picked", made)).toBe(true);
    expect(needsBlob(undefined, made)).toBe(false);
    // The stored photo shown again keeps its stored bytes.
    const kept = savedPhoto(loaded, null, BLOB);
    expect(savedPhoto(loaded, kept, null, true)?.blob).toBe(BLOB);
  });

  it("keeps the old photo when a new photo's bytes could not be read", () => {
    const kept = savedPhoto(run(ON_SOFA), null, BLOB);
    const other = run([
      { type: "upload" },
      { type: "photo", photo: { url: "blob:other", width: 800, height: 600 } },
      { type: "toPlace" },
      { type: "placeNext" },
      { type: "setScale", unit: "in" },
    ]);
    expect(savedPhoto(other, kept, null, false)).toBe(kept);
  });

  it("brings back the photo's moves when the page closed in Change photo", () => {
    const moved = run([...ON_SOFA, { type: "nudge", id: "t0", dx: -4, dy: 0 }]);
    const photo = savedPhoto(moved, null, BLOB);
    const changing = reducer(moved, { type: "upload" });
    expect(toSaved(changing).wall).toBe("photo");
    const back = fromSaved(record(changing, photo), () => "blob:fresh");
    expect(back?.mode).toBe("photo");
    expect(back && framesOf(back)).toEqual(framesOf(moved));
  });

  it("brings back the sample room's moves when the page closed in the upload step", () => {
    const kept = savedPhoto(run(ON_SOFA), null, BLOB);
    const moved = run([{ type: "nudge", id: "t0", dx: -4, dy: 0 }]);
    const uploading = reducer(moved, { type: "upload" });
    expect(toSaved(uploading).wall).toBe("sample");
    const back = fromSaved(record(uploading, kept), () => {
      throw new Error("no URL for a hidden photo");
    });
    expect(back?.mode).toBe("sample");
    expect(back && framesOf(back)).toEqual(framesOf(moved));
  });

  it("lays the template out again in the sample room when the saved photo cannot be drawn", () => {
    const moved = run([...ON_SOFA, { type: "nudge", id: "t0", dx: -4, dy: 0 }]);
    const photo = savedPhoto(moved, null, BLOB);
    const broken: (SavedPhoto | null)[] = [
      null,
      photo && { ...photo, scale: 0 },
      photo && { ...photo, width: Number.NaN },
      photo && ({ ...photo, blob: "bytes" } as unknown as SavedPhoto),
    ];
    for (const bad of broken) {
      const back = fromSaved(record(moved, bad), () => "blob:never");
      expect(back?.mode).toBe("sample");
      expect(back && framesOf(back)).toEqual(framesOf(initialState()));
    }
  });
});
