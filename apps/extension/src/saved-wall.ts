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
  /** Which wall the layout was on: `flow` is the upload or a scale step. */
  wall: "sample" | "photo" | "flow";
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
  const wall = state.mode === "sample" ? "sample" : state.mode === "photo" ? "photo" : "flow";
  return { ...kept, wall };
}

/**
 * The photo the record keeps: the planner's photo once its scale is set (`blob` is its bytes, or
 * `null` when the planner shows the stored photo itself), else the record's photo as it was.
 */
export function savedPhoto(
  state: PlannerState,
  kept: SavedPhoto | null,
  blob: Blob | null,
): SavedPhoto | null {
  if (state.mode !== "photo" || !state.photo || state.scale === null) return kept;
  const bytes = blob ?? kept?.blob;
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
  if (!r.photo || wall === "sample") return layout;
  const restored = reducer(layout, restoreAction(r.photo, makeUrl(r.photo.blob)));
  // On the photo already: its moves are the photo's, so they stay. From a scale step, it lays out again.
  return wall === "photo" ? { ...restored, ...kept } : restored;
}

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
