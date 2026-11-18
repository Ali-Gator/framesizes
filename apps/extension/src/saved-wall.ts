import {
  initialState,
  type PlannerState,
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
  return { ...kept, wall };
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
export function fromSaved(record: unknown, makeUrl: (blob: Blob) => string): PlannerState | null {
  const r = record as Partial<SavedRecord> | null | undefined;
  if (r?.v !== 1 || !r.planner) return null;
  const { wall, ...kept } = r.planner;
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

/** The stored photo when it can be drawn: bytes, a size and a scale. */
function usablePhoto(photo: SavedPhoto | null | undefined): SavedPhoto | null {
  if (!photo || !(photo.blob instanceof Blob)) return null;
  const ok = (n: unknown) => typeof n === "number" && Number.isFinite(n) && n > 0;
  return ok(photo.width) && ok(photo.height) && ok(photo.scale) ? photo : null;
}

/** The record's layout and photo, to tell a real change from one that changes nothing saved. */
export const sameSaved = (a: SavedRecord | null, b: SavedRecord) =>
  a !== null && a.photo === b.photo && JSON.stringify(a.planner) === JSON.stringify(b.planner);

/**
 * Whether a state is the visitor's change and needs writing: a state the page applied itself, from
 * the record or from the other page, is not. Without this the panel and the tab would echo.
 */
export const needsWrite = (state: PlannerState, applied: PlannerState | null) => state !== applied;

/** Whether a photo URL's bytes need reading: not one the page made from the stored Blob. */
export const needsBlob = (url: string | undefined, madeFromStore: ReadonlySet<string>) =>
  url !== undefined && !madeFromStore.has(url);

const DB = "gallery-wall";
const STORE = "wall";
const KEY = "current";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = work(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export const readRecord = () => run<unknown>("readonly", (store) => store.get(KEY));
export const writeRecord = (record: SavedRecord) =>
  run("readwrite", (store) => store.put(record, KEY));

/** The channel the panel and the tab tell each other on after a write. */
export const CHANNEL = "gallery-wall";
