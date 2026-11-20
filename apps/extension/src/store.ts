import type { FoundSize } from "./find-sizes";

/*
 * The extension's one IndexedDB store, with no other imports: the service worker uses it too.
 * Keys: `current` (the saved wall), `photo` (its photo's bytes), `art:<frame id>` (each added
 * print's picture) and `try` (the print being tried on).
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-wall-is-saved-on-this-device}
 */

const DB = "gallery-wall";
const STORE = "wall";

export const CURRENT = "current";
export const PHOTO = "photo";
export const TRY = "try";
export const ART = "art:";
export const artKey = (frameId: string) => `${ART}${frameId}`;

/** The channel the panel, the tab and the worker tell each other on after a write. */
export const CHANNEL = "gallery-wall";

/**
 * The print being tried on, written by the worker on the click and deleted by the panel on "Add"
 * or "Back". It holds no page text.
 * {@link openspec/specs/gallery-wall-extension/spec.md#scenario-a-try-keeps-only-what-the-panel-shows}
 */
export interface TryRecord {
  v: 1;
  id: string;
  /** When "Try on my wall" was chosen: a slower, older click never replaces a newer try. */
  at: number;
  image: Blob | null;
  /** The image's own pixel size on the page, for which way it runs; `null` when not found. */
  shape: { w: number; h: number } | null;
  title: string;
  host: string;
  sizes: FoundSize[];
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * One connection per page, kept open: a write flushed on `pagehide` must start its transaction in
 * that task, before the page is gone, and opening a database takes a task of its own (BL-59).
 */
let connection: IDBDatabase | null = null;
let opening: Promise<IDBDatabase> | null = null;
function db(): IDBDatabase | Promise<IDBDatabase> {
  if (connection) return connection;
  opening ??= openDb().then(
    (opened) => {
      opened.onclose = opened.onversionchange = () => {
        opened.close();
        connection = null;
      };
      connection = opened;
      opening = null;
      return opened;
    },
    (error: unknown) => {
      opening = null;
      throw error;
    },
  );
  return opening;
}

/** One request's result. */
export const done = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

/**
 * Runs `work` in one transaction and resolves with its result once the transaction commits.
 * `work` may await `done(...)` between requests: each result lands in the same task.
 */
export async function transact<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  // With the connection open, the transaction and its first request start in this same task.
  const open = db();
  const tx = (open instanceof IDBDatabase ? open : await open).transaction(STORE, mode);
  const committed = new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  const result = await work(tx.objectStore(STORE));
  await committed;
  return result;
}

export const readTry = () => transact("readonly", (store) => done<unknown>(store.get(TRY)));
export const writeTry = (record: TryRecord) =>
  transact("readwrite", async (store) => {
    const stored = usableTry(await done<unknown>(store.get(TRY)));
    if (!stored || stored.at <= record.at) await done(store.put(record, TRY));
  });
export const deleteTry = () => transact("readwrite", (store) => done(store.delete(TRY)));

/** A stored try the panel can show, or `null`. */
export function usableTry(value: unknown): TryRecord | null {
  const r = value as Partial<TryRecord> | null | undefined;
  if (r?.v !== 1 || typeof r.id !== "string" || !Array.isArray(r.sizes)) return null;
  const shape = r.shape;
  return {
    v: 1,
    id: r.id,
    at: typeof r.at === "number" ? r.at : 0,
    image: r.image instanceof Blob ? r.image : null,
    shape: shape && shape.w > 0 && shape.h > 0 ? { w: Number(shape.w), h: Number(shape.h) } : null,
    title: typeof r.title === "string" ? r.title : "",
    host: typeof r.host === "string" ? r.host : "",
    sizes: r.sizes,
  };
}
