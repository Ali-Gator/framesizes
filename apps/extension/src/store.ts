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
  image: Blob | null;
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
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, mode);
    const committed = new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    const result = await work(tx.objectStore(STORE));
    await committed;
    return result;
  } finally {
    db.close();
  }
}

export const readTry = () => transact("readonly", (store) => done<unknown>(store.get(TRY)));
export const writeTry = (record: TryRecord) =>
  transact("readwrite", (store) => done(store.put(record, TRY)));
export const deleteTry = () => transact("readwrite", (store) => done(store.delete(TRY)));

/** A stored try the panel can show, or `null`. */
export function usableTry(value: unknown): TryRecord | null {
  const r = value as Partial<TryRecord> | null | undefined;
  if (r?.v !== 1 || typeof r.id !== "string" || !Array.isArray(r.sizes)) return null;
  return {
    v: 1,
    id: r.id,
    image: r.image instanceof Blob ? r.image : null,
    title: typeof r.title === "string" ? r.title : "",
    host: typeof r.host === "string" ? r.host : "",
    sizes: r.sizes,
  };
}
