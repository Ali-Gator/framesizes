import { describe, expect, it } from "vitest";

import {
  type Action,
  framesOf,
  initialState,
  type PlannerState,
  type Print,
  reducer,
} from "@/components/gallery-wall/state";

import {
  artChanges,
  fromSaved,
  journalFor,
  type SavedPhoto,
  type StoredRecord,
  savedPhoto,
  toSaved,
  toStored,
  type WallRecord,
} from "../saved-wall";
import { usableTry } from "../store";

/*
 * Record v2: the wall photo and each print's picture under their own keys, written only when they
 * change (BL-58), and the try record the worker leaves for the panel.
 */
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
const ART = new Blob(["print bytes"], { type: "image/png" });
const PRINT: Print = { w: 24, h: 36, label: "24 × 36 in", framed: false, art: "blob:art" };
const wall = (state: PlannerState, photo: SavedPhoto | null = null): WallRecord => ({
  planner: toSaved(state),
  photo,
});
/** A structured clone keeps Blobs; JSON stands in for the rest. */
const clone = (r: StoredRecord): StoredRecord => JSON.parse(JSON.stringify(r));
let stamps = 0;
const stamp = () => `s${++stamps}`;

/** {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-wall-is-saved-on-this-device} */
describe("the saved wall's keys", () => {
  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-wall-photo-survives-a-reload} */
  it("still reads a v1 record with its photo inline", () => {
    const state = run(ON_SOFA);
    const v1 = { v: 1, ...wall(state, savedPhoto(state, null, BLOB)) };
    const urls: Blob[] = [];
    const back = fromSaved(v1, (blob) => {
      urls.push(blob);
      return "blob:v1";
    });
    expect(urls).toEqual([BLOB]);
    expect(back?.photo?.url).toBe("blob:v1");
    expect(back && framesOf(back)).toEqual(framesOf(state));
  });

  it("splits a write into the record and the photo's bytes, and reads them back", () => {
    const state = run(ON_SOFA);
    const next = wall(state, savedPhoto(state, null, BLOB));
    const { current, photo, putPhoto } = toStored(next, null, stamp);
    expect(current.v).toBe(2);
    expect(current.photo).not.toHaveProperty("blob");
    expect(current.photo?.stamp).toBe(photo?.stamp);
    expect(putPhoto).toBe(BLOB);
    const back = fromSaved(clone(current), () => "blob:v2", { photo: BLOB, art: {} });
    expect(back?.photo?.url).toBe("blob:v2");
    expect(back && framesOf(back)).toEqual(framesOf(state));
  });

  it("does not write the photo's bytes again when only the layout changes (BL-58)", () => {
    const state = run(ON_SOFA);
    const first = toStored(wall(state, savedPhoto(state, null, BLOB)), null, stamp);
    const before: WallRecord = { planner: first.current.planner, photo: first.photo };
    const moved = reducer(state, { type: "nudge", id: "t0", dx: -2, dy: 0 });
    // The stored photo shown again: savedPhoto hands back the stored bytes.
    const again = toStored(wall(moved, savedPhoto(moved, first.photo, null, true)), before, stamp);
    expect(again.putPhoto).toBeNull();
    expect(again.current.photo?.stamp).toBe(first.current.photo?.stamp);
    // A v1 photo has no stamp: its first v2 write puts its bytes under their own key.
    const v1Before: WallRecord = { planner: before.planner, photo: savedPhoto(state, null, BLOB) };
    const v1Photo = v1Before.photo;
    expect(toStored(wall(moved, v1Photo), v1Before, stamp).putPhoto).toBe(BLOB);
  });

  it("puts a new print's picture once and deletes the picture of a print that is gone", () => {
    const added = reducer(initialState(), { type: "addPrint", print: PRINT });
    const id = framesOf(added).at(-1)?.id ?? "";
    const pending = new Map([[id, ART]]);
    expect(artChanges(["current", "photo"], toSaved(added), pending)).toEqual({
      put: [[id, ART]],
      remove: [],
    });
    expect(artChanges(["current", `art:${id}`], toSaved(added), pending)).toEqual({
      put: [],
      remove: [],
    });
    const removed = reducer(added, { type: "remove", id });
    expect(artChanges(["current", `art:${id}`, "art:a9"], toSaved(removed), new Map())).toEqual({
      put: [],
      remove: [`art:${id}`, "art:a9"],
    });
  });

  /** {@link openspec/specs/gallery-wall-extension/spec.md#scenario-an-added-print-survives-a-reload} */
  it("brings back an added print with its size and picture", () => {
    const added = reducer(initialState(), { type: "addPrint", print: PRINT });
    const id = framesOf(added).at(-1)?.id ?? "";
    const { current } = toStored(wall(added), null, stamp);
    // The object URL is the page's: never in the record.
    expect(JSON.stringify(current)).not.toContain("blob:art");
    const back = fromSaved(
      clone(current),
      () => "blob:never",
      { photo: null, art: { [id]: ART } },
      (frame, blob) => (blob === ART ? `blob:art-${frame}` : "blob:wrong"),
    );
    const f = back && framesOf(back).at(-1);
    expect(f?.letter).toBe("F");
    expect([f?.rect.w, f?.rect.h]).toEqual([24, 36]);
    expect(f?.print).toEqual({ ...PRINT, art: `blob:art-${id}` });
    // With its picture missing, it still hangs, as a plain frame.
    const bare = fromSaved(clone(current), () => "blob:never", { photo: null, art: {} });
    expect(bare && framesOf(bare).at(-1)?.print).toEqual({ ...PRINT, art: undefined });
  });

  it("journals a closing write only when no new photo bytes are waiting", () => {
    const state = run(ON_SOFA);
    const fresh = toStored(wall(state, savedPhoto(state, null, BLOB)), null, stamp);
    expect(fresh.putPhoto).toBe(BLOB);
    expect(journalFor(fresh)).toBeNull();
    const before: WallRecord = { planner: fresh.current.planner, photo: fresh.photo };
    const moved = reducer(state, { type: "nudge", id: "t0", dx: -2, dy: 0 });
    const layoutOnly = toStored(wall(moved, savedPhoto(moved, fresh.photo, null, true)), before);
    expect(journalFor(layoutOnly)).toBe(layoutOnly.current);
  });

  it("reads a try record the panel can show, and nothing else", () => {
    const record = {
      v: 1,
      id: "t1",
      at: 5,
      image: ART,
      shape: { w: 3, h: 4 },
      title: "Blue",
      host: "shop.example",
      sizes: [],
    };
    expect(usableTry(record)).toEqual(record);
    expect(usableTry({ ...record, image: "data" })?.image).toBeNull();
    expect(usableTry({ ...record, shape: { w: 0, h: 4 } })?.shape).toBeNull();
    expect(usableTry({ ...record, v: 2 })).toBeNull();
    expect(usableTry(undefined)).toBeNull();
  });
});
