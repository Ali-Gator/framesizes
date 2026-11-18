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
  type SavedRecord,
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

/**
 * G1's planner on the wall saved on this device: read on start, written 300 ms after a change,
 * and read again when the other page (the panel or the tab) says it wrote.
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
  /** Object URLs made from the stored photo: their bytes are already saved. */
  const madeFromStore = useRef(new Set<string>());
  /** A picked photo's bytes, read as soon as its URL appears, before anything can revoke it. */
  const picked = useRef(new Map<string, Promise<Blob | null>>());
  const channel = useRef<BroadcastChannel | null>(null);
  const pageId = useRef(crypto.randomUUID());
  const persisted = useRef(false);

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
    const planner = fromSaved(saved, makeUrl);
    record.current = planner ? (saved as SavedRecord) : null;
    const next = planner ?? initialState();
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

  // Start: read the record, and listen for the other page's writes.
  useEffect(() => {
    void load();
    const bus = new BroadcastChannel(CHANNEL);
    bus.onmessage = (event: MessageEvent<{ from?: string }>) => {
      if (event.data?.from !== pageId.current) void load();
    };
    channel.current = bus;
    return () => bus.close();
  }, [load]);

  const url = wall.planner.photo?.url;
  useEffect(() => {
    void bytesOf(url);
  }, [url, bytesOf]);

  // Write the visitor's changes, 300 ms after the last one.
  useEffect(() => {
    if (!wall.ready || !needsWrite(wall.planner, applied.current)) return;
    const planner = wall.planner;
    const timer = setTimeout(async () => {
      const photo = savedPhoto(
        planner,
        record.current?.photo ?? null,
        await bytesOf(planner.photo?.url),
      );
      const next: SavedRecord = { v: 1, planner: toSaved(planner), photo };
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
    }, WRITE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [wall.ready, wall.planner, bytesOf]);

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
