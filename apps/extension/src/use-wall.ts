import { useCallback, useEffect, useReducer, useRef } from "react";

import type { Dispatch } from "@/components/gallery-wall/gallery-wall";
import {
  type Action,
  initialState,
  type PlannerState,
  reducer,
} from "@/components/gallery-wall/state";

import {
  CHANNEL,
  fromSaved,
  needsBlob,
  needsWrite,
  readRecord,
  restoreAction,
  type SavedPhoto,
  type SavedRecord,
  sameSaved,
  savedPhoto,
  toSaved,
  writeRecord,
} from "./saved-wall";

/** How long after the last change the wall is written. */
const WRITE_AFTER_MS = 300;

interface Wall {
  planner: PlannerState;
  /** The saved record has been read: the planner may render and writes may start. */
  ready: boolean;
  /** A wall photo is saved on this device. */
  hasPhoto: boolean;
}

type WallAction =
  | Action
  | { type: "load"; planner: PlannerState; hasPhoto: boolean }
  | { type: "saved"; hasPhoto: boolean };

function wallReducer(wall: Wall, action: WallAction): Wall {
  switch (action.type) {
    case "load":
      return { planner: action.planner, ready: true, hasPhoto: action.hasPhoto };
    case "saved":
      return { ...wall, hasPhoto: action.hasPhoto };
    default:
      return { ...wall, planner: reducer(wall.planner, action) };
  }
}

/** The same stored photo: the record's Blob is a new object on every read. */
const samePhoto = (a: SavedPhoto | null | undefined, b: SavedPhoto | null | undefined) =>
  !!a &&
  !!b &&
  a.blob.size === b.blob.size &&
  a.width === b.width &&
  a.height === b.height &&
  a.scale === b.scale;

/** In the upload or a scale step: the visitor is mid-task there. */
const inFlow = (p: PlannerState) => p.mode !== "sample" && p.mode !== "photo";

/**
 * G1's planner on the wall saved on this device: read on start, written 300 ms after a change
 * (at once when the page is hidden), and read again when the other page (the panel or the tab)
 * says it wrote. The last write wins.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-panel-and-the-tab-show-one-wall}
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-wall-select-switches-walls-without-losing-the-photo}
 */
export function useWall() {
  const [wall, send] = useReducer(wallReducer, {
    planner: initialState(),
    ready: false,
    hasPhoto: false,
  });
  const record = useRef<SavedRecord | null>(null);
  /** The state last applied from the record: not the visitor's change, so not written back. */
  const applied = useRef<PlannerState | null>(null);
  /** The planner shown now, for callbacks outside a render. */
  const current = useRef<PlannerState>(wall.planner);
  /** A change waiting for its write, and its timer. */
  const pending = useRef<{ planner: PlannerState; timer: ReturnType<typeof setTimeout> } | null>(
    null,
  );
  /** Bumped on every load: a write that started before one is stale and dropped. */
  const loads = useRef(0);
  /** Object URLs made from the stored photo: their bytes are already saved. */
  const madeFromStore = useRef(new Set<string>());
  /** A picked photo's bytes, read as soon as its URL appears, before anything can revoke it. */
  const picked = useRef(new Map<string, Promise<Blob | null>>());
  const channel = useRef<BroadcastChannel | null>(null);
  const pageId = useRef(crypto.randomUUID());
  const persisted = useRef(false);

  useEffect(() => {
    current.current = wall.planner;
  }, [wall.planner]);

  const makeUrl = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    madeFromStore.current.add(url);
    return url;
  }, []);

  const load = useCallback(async () => {
    let saved: unknown = null;
    try {
      saved = await readRecord();
    } catch {
      // Storage blocked: the planner starts fresh and nothing is kept.
    }
    loads.current += 1;
    const before = record.current?.photo;
    const shown = current.current.photo?.url;
    // The same stored photo already on screen keeps its URL: no reload, no flicker.
    const urlFor = (blob: Blob) =>
      shown && madeFromStore.current.has(shown) && samePhoto(before, (saved as SavedRecord)?.photo)
        ? shown
        : makeUrl(blob);
    const planner = fromSaved(saved, urlFor);
    record.current = planner ? (saved as SavedRecord) : null;
    let next = planner ?? initialState();
    // The selection survives the other page's write while its frame does.
    const selected = current.current.selected;
    if (applied.current && next.selected !== selected) {
      const kept = reducer(next, { type: "select", id: selected });
      if (kept.selected === selected) next = kept;
    }
    applied.current = next;
    send({ type: "load", planner: next, hasPhoto: !!record.current?.photo });
  }, [makeUrl]);

  const bytesOf = useCallback((url: string | undefined): Promise<Blob | null> => {
    if (!url || !needsBlob(url, madeFromStore.current)) return Promise.resolve(null);
    let read = picked.current.get(url);
    if (!read) {
      read = fetch(url)
        .then((response) => response.blob())
        .catch(() => null);
      picked.current.set(url, read);
    }
    return read;
  }, []);

  const write = useCallback(
    async (planner: PlannerState) => {
      const startedAt = loads.current;
      const url = planner.photo?.url;
      const kept = record.current?.photo ?? null;
      const photo = savedPhoto(
        planner,
        kept,
        await bytesOf(url),
        !!url && madeFromStore.current.has(url),
      );
      // The other page's write landed meanwhile: this planner is stale.
      if (loads.current !== startedAt) return;
      const next: SavedRecord = { v: 1, planner: toSaved(planner), photo };
      if (sameSaved(record.current, next)) return;
      try {
        await writeRecord(next);
      } catch {
        return;
      }
      record.current = next;
      send({ type: "saved", hasPhoto: !!photo });
      channel.current?.postMessage({ from: pageId.current });
      if (!persisted.current) {
        persisted.current = true;
        void navigator.storage?.persist?.();
      }
    },
    [bytesOf],
  );

  /** Writes the waiting change now: the page is being hidden or closed. */
  const flush = useCallback(() => {
    const waiting = pending.current;
    if (!waiting) return;
    clearTimeout(waiting.timer);
    pending.current = null;
    void write(waiting.planner);
  }, [write]);

  // Start: read the record, listen for the other page's writes, and flush when hidden.
  useEffect(() => {
    void load();
    const bus = new BroadcastChannel(CHANNEL);
    bus.onmessage = (event: MessageEvent<{ from?: string }>) => {
      if (event.data?.from === pageId.current) return;
      // A change of this page's own still to write, or a task under way here, wins: its write
      // comes next and the other page reads it then.
      if (pending.current || inFlow(current.current)) return;
      void load();
    };
    channel.current = bus;
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      bus.close();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, [load, flush]);

  // Read a picked photo's bytes at once; forget the bytes and URLs no longer shown.
  const url = wall.planner.photo?.url;
  useEffect(() => {
    void bytesOf(url);
    for (const key of picked.current.keys()) if (key !== url) picked.current.delete(key);
    for (const key of madeFromStore.current) if (key !== url) madeFromStore.current.delete(key);
  }, [url, bytesOf]);

  // Write the visitor's changes, 300 ms after the last one.
  useEffect(() => {
    if (!wall.ready || !needsWrite(wall.planner, applied.current)) return;
    const planner = wall.planner;
    const timer = setTimeout(() => {
      if (pending.current?.planner === planner) pending.current = null;
      void write(planner);
    }, WRITE_AFTER_MS);
    pending.current = { planner, timer };
    return () => {
      clearTimeout(timer);
      if (pending.current?.planner === planner) pending.current = null;
    };
  }, [wall.ready, wall.planner, write]);

  const dispatch: Dispatch = useCallback((action: Action) => send(action), []);

  /** The "Wall" select: the sample room, or the saved photo (the upload step with none saved). */
  const chooseWall = useCallback(
    (choice: "sample" | "photo") => {
      if (choice === "sample") return send({ type: "toSample" });
      const photo = record.current?.photo;
      send(photo ? restoreAction(photo, makeUrl(photo.blob)) : { type: "upload" });
    },
    [makeUrl],
  );

  return {
    planner: wall.planner,
    ready: wall.ready,
    hasPhoto: wall.hasPhoto,
    wall: wall.planner.mode === "sample" ? ("sample" as const) : ("photo" as const),
    dispatch,
    chooseWall,
  };
}
