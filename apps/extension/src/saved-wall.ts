import { ART, artKey, CURRENT, done, PHOTO, transact } from "./store";
import {
  initialState,
  type PlannerState,
  type Print,
  reducer,
  type RestorePhoto,
} from "@/components/gallery-wall/state";

/*
 * The wall saved on this device: one IndexedDB record on the extension's origin, the planner's
 * layout and the last scaled wall photo. Nothing here leaves the device.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-wall-is-saved-on-this-device}
 */

/** The layout fields kept; dialogs, pickers, drafts and the selection are not. */
const KEPT = [
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
] as const satisfies readonly (keyof PlannerState)[];

export type SavedPlanner = Pick<PlannerState, (typeof KEPT)[number]> & {
  /** Which wall the layout is on. */
  wall: "sample" | "photo";
};

export interface SavedPhoto {
  blob: Blob;
  width: number;
  height: number;
  known: RestorePhoto["known"];
  marks: RestorePhoto["marks"];
  floor: number | null;
  scale: number;
  /** Changes with the bytes: the `photo` key is written only when it does (BL-58). */
  stamp?: string;
}

/** The photo as `current` keeps it in v2: its bytes are under the `photo` key. */
export type PhotoMeta = Omit<SavedPhoto, "blob" | "stamp"> & { stamp: string };

/** Record v2: the layout and the photo's meta; the photo and print pictures have their own keys. */
export interface StoredRecord {
  v: 2;
  planner: SavedPlanner;
  photo: PhotoMeta | null;
}

/** The wall in memory, either version: the photo with its bytes. */
export interface WallRecord {
  planner: SavedPlanner;
  photo: SavedPhoto | null;
}

/** The Blobs read beside `current`: the photo's bytes and each print's picture by frame id. */
export interface StoredBlobs {
  photo: Blob | null;
  art: Record<string, Blob>;
}

export interface SavedRecord {
  v: 1;
  planner: SavedPlanner;
  photo: SavedPhoto | null;
}

/** The planner's part of the record. */
export function toSaved(state: PlannerState): SavedPlanner {
  const kept = Object.fromEntries(KEPT.map((key) => [key, state[key]])) as Pick<
    PlannerState,
    (typeof KEPT)[number]
  >;
  // In the upload or a scale step the layout is still on the wall it came from: the scaled photo
  // ("Change photo") while that photo and its scale are held, else the sample room.
  const wall = state.mode !== "sample" && state.photo && state.scale !== null ? "photo" : "sample";
  // A print's picture is an object URL of this page: its bytes are under `art:<id>`.
  const added = kept.added.map((a) => {
    if (!a.print) return a;
    const { w, h, label, framed } = a.print;
    return { ...a, print: { w, h, label, framed } };
  });
  return { ...kept, added, wall };
}

/**
 * The photo the record keeps: the planner's photo once its scale is set, else the record's photo as
 * it was. `blob` is the planner photo's bytes; `fromStore` says the planner shows the stored photo
 * itself, whose bytes are the record's. A new photo whose bytes could not be read changes nothing.
 */
export function savedPhoto(
  state: PlannerState,
  kept: SavedPhoto | null,
  blob: Blob | null,
  fromStore = false,
): SavedPhoto | null {
  if (state.mode !== "photo" || !state.photo || state.scale === null) return kept;
  const bytes = blob ?? (fromStore ? kept?.blob : undefined);
  if (!bytes) return kept;
  const { width, height } = state.photo;
  const { known, marks, floor, scale } = state;
  return { blob: bytes, width, height, known, marks, floor, scale };
}

/** The action that puts a saved photo back, on an object URL made from its Blob. */
export const restoreAction = (photo: SavedPhoto, url: string): RestorePhoto => ({
  type: "restorePhoto",
  photo: { url, width: photo.width, height: photo.height },
  known: photo.known,
  marks: photo.marks,
  floor: photo.floor,
  scale: photo.scale,
});

/**
 * The planner a record brings back, every dialog closed, or `null` for a record of another
 * version. `makeUrl` turns the stored photo into an object URL, only when the photo is shown.
 */
export function fromSaved(
  record: unknown,
  makeUrl: (blob: Blob) => string,
  blobs: StoredBlobs = { photo: null, art: {} },
  artUrl: (frameId: string, blob: Blob) => string = (_, blob) => makeUrl(blob),
): PlannerState | null {
  const r = toWall(record, blobs);
  if (!r) return null;
  const { wall, ...saved } = r.planner;
  const kept = {
    ...saved,
    added: saved.added.map((a) => {
      if (!a.print) return a;
      const bytes = blobs.art[a.id];
      const print: Print = { ...a.print, art: bytes ? artUrl(a.id, bytes) : undefined };
      return { ...a, print };
    }),
  };
  const layout: PlannerState = { ...initialState(), ...kept };
  if (wall !== "photo") return layout;
  const photo = usablePhoto(r.photo);
  if (!photo) {
    // A photo layout with no photo to put it on: the template, laid out again in the sample room.
    const fresh = initialState();
    return {
      ...layout,
      moved: fresh.moved,
      group: fresh.group,
      added: fresh.added,
      removed: fresh.removed,
      hangers: { all: kept.hangers.all, byFrame: {} },
    };
  }
  // The photo's moves are the photo's: they stay over the fresh layout restorePhoto makes.
  return { ...reducer(layout, restoreAction(photo, makeUrl(photo.blob))), ...kept };
}

/** Either version of `current` as the wall in memory, or `null` for any other. */
export function toWall(record: unknown, blobs: StoredBlobs): WallRecord | null {
  const r = record as Partial<SavedRecord> | Partial<StoredRecord> | null | undefined;
  if (!r?.planner) return null;
  if (r.v === 1) return { planner: r.planner, photo: (r.photo as SavedPhoto | null) ?? null };
  if (r.v !== 2) return null;
  const meta = r.photo as PhotoMeta | null | undefined;
  return { planner: r.planner, photo: meta && blobs.photo ? { ...meta, blob: blobs.photo } : null };
}

/**
 * The write of `next`: `current` with the photo's meta, and the photo's bytes only when they are
 * not the bytes already stored (a v1 photo, with no stamp, counts as not stored).
 */
export function toStored(
  next: WallRecord,
  before: WallRecord | null,
  newStamp: () => string = () => crypto.randomUUID(),
): { current: StoredRecord; photo: SavedPhoto | null; putPhoto: Blob | null } {
  const was = before?.photo;
  if (!next.photo)
    return { current: { v: 2, planner: next.planner, photo: null }, photo: null, putPhoto: null };
  const same = !!was?.stamp && was.blob === next.photo.blob;
  const stamp = same && was?.stamp ? was.stamp : newStamp();
  const { blob, ...meta } = next.photo;
  return {
    current: { v: 2, planner: next.planner, photo: { ...meta, stamp } },
    photo: { ...next.photo, stamp },
    putPhoto: same ? null : blob,
  };
}

/** The `art:` keys to put (a new print's picture) and to delete (a print that is gone). */
export function artChanges(
  keys: readonly IDBValidKey[],
  planner: SavedPlanner,
  pending: ReadonlyMap<string, Blob>,
): { put: [string, Blob][]; remove: string[] } {
  const prints = new Set(planner.added.filter((a) => a.print).map((a) => a.id));
  const stored = keys.filter((k): k is string => typeof k === "string" && k.startsWith(ART));
  const have = new Set(stored.map((k) => k.slice(ART.length)));
  const put = [...pending].filter(([id]) => prints.has(id) && !have.has(id));
  const remove = stored.filter((k) => !prints.has(k.slice(ART.length)));
  return { put, remove };
}

/** The stored photo when it can be drawn: bytes, a size and a scale. */
function usablePhoto(photo: SavedPhoto | null | undefined): SavedPhoto | null {
  if (!photo || !(photo.blob instanceof Blob)) return null;
  const ok = (n: unknown) => typeof n === "number" && Number.isFinite(n) && n > 0;
  return ok(photo.width) && ok(photo.height) && ok(photo.scale) ? photo : null;
}

/** The record's layout and photo, to tell a real change from one that changes nothing saved. */
export const sameSaved = (a: WallRecord | null, b: WallRecord) =>
  a !== null && a.photo === b.photo && JSON.stringify(a.planner) === JSON.stringify(b.planner);

/**
 * Whether a state is the visitor's change and needs writing: a state the page applied itself, from
 * the record or from the other page, is not. Without this the panel and the tab would echo.
 */
export const needsWrite = (state: PlannerState, applied: PlannerState | null) => state !== applied;

/** Whether a photo URL's bytes need reading: not one the page made from the stored Blob. */
export const needsBlob = (url: string | undefined, madeFromStore: ReadonlySet<string>) =>
  url !== undefined && !madeFromStore.has(url);

/** `current`, the photo's bytes and every print's picture, read in one transaction. */
export const readWall = () =>
  transact("readonly", async (store) => {
    const record = await done<unknown>(store.get(CURRENT));
    const photo = await done<unknown>(store.get(PHOTO));
    const keys = await done(store.getAllKeys());
    const art: Record<string, Blob> = {};
    for (const key of keys) {
      if (typeof key !== "string" || !key.startsWith(ART)) continue;
      const blob = await done<unknown>(store.get(key));
      if (blob instanceof Blob) art[key.slice(ART.length)] = blob;
    }
    return { record, blobs: { photo: photo instanceof Blob ? photo : null, art } as StoredBlobs };
  });

/**
 * One write in one transaction: `current`, the photo's bytes when they changed (none kept with no
 * photo), each new print's picture, and no picture of a print that is gone. Returns the frame ids
 * whose pictures it put.
 */
export const writeWall = (
  current: StoredRecord,
  putPhoto: Blob | null,
  pending: ReadonlyMap<string, Blob>,
) =>
  transact("readwrite", async (store) => {
    await done(store.put(current, CURRENT));
    if (putPhoto) await done(store.put(putPhoto, PHOTO));
    else if (!current.photo) await done(store.delete(PHOTO));
    const { put, remove } = artChanges(await done(store.getAllKeys()), current.planner, pending);
    for (const [id, blob] of put) await done(store.put(blob, artKey(id)));
    for (const key of remove) await done(store.delete(key));
    return put.map(([id]) => id);
  });

export { CHANNEL } from "./store";
