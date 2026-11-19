import { useCallback, useEffect, useReducer, useState } from "react";

import { CHANNEL, deleteTry, readTry, type TryRecord, usableTry } from "../store";

/** The try's picture as the panel shows it, and which way it runs once it has loaded. */
export interface TryImage {
  url: string;
  /** `null` until the picture's size is known, or with no picture. */
  landscape: boolean | null;
}

/**
 * The print being tried on: the worker's try record, read on start and on its ping.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-a-try-waits-for-the-visitor}
 */
export function useTry() {
  const [record, setRecord] = useReducer(
    (_: TryRecord | null, next: TryRecord | null) => next,
    null,
  );
  /** The loaded picture, for the Blob it was made from. */
  const [loaded, setLoaded] = useState<(TryImage & { blob: Blob }) | null>(null);

  const load = useCallback(async () => {
    try {
      setRecord(usableTry(await readTry()));
    } catch {
      // Storage blocked: no try.
      setRecord(null);
    }
  }, []);

  useEffect(() => {
    void load();
    const bus = new BroadcastChannel(CHANNEL);
    bus.onmessage = (event: MessageEvent<{ from?: string; try?: boolean }>) => {
      if (event.data?.from === "worker" && event.data.try) void load();
    };
    return () => bus.close();
  }, [load]);

  // The picture's object URL and its shape, shown once it has loaded.
  const blob = record?.image ?? null;
  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => setLoaded({ blob, url, landscape: img.naturalWidth > img.naturalHeight });
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  const image: TryImage | null =
    loaded && loaded.blob === blob ? { url: loaded.url, landscape: loaded.landscape } : null;

  /** "Add to my layout" or "Back to my layout": the try is over. */
  const clear = useCallback(async () => {
    setRecord(null);
    await deleteTry().catch(() => undefined);
  }, []);

  return { record, image, clear };
}
