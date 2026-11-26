"use client";

import { useEffect, useRef } from "react";

import type { Action, Artwork } from "./state";

/**
 * Reads a picked or dropped file on the device: its size from an `<img>`, which applies the
 * file's EXIF orientation. The newest pick wins; an older one that finishes later is dropped and
 * its URL revoked. An upload's URL lives until it is replaced, the sample returns or the page goes.
 * {@link openspec/specs/frame-mockup/spec.md#requirement-the-uploaded-artwork-stays-on-the-device}
 * {@link openspec/specs/frame-mockup/spec.md#requirement-a-file-that-cannot-be-used-leaves-the-artwork-as-it-was}
 */
export function useArtwork(art: Artwork, dispatch: (action: Action) => void) {
  const url = art.sample ? undefined : art.url;
  useEffect(() => () => (url ? URL.revokeObjectURL(url) : undefined), [url]);

  const latest = useRef(0);
  async function pick(file: File | undefined) {
    if (!file) return;
    const ticket = ++latest.current;
    if (!file.type.startsWith("image/")) {
      dispatch({ type: "failed", kind: "notimg" });
      return;
    }
    dispatch({ type: "reading" });
    const objectUrl = URL.createObjectURL(file);
    let size: { width: number; height: number } | undefined;
    try {
      const img = new Image();
      img.src = objectUrl;
      await img.decode();
      size = { width: img.naturalWidth, height: img.naturalHeight };
    } catch {
      size = undefined;
    }
    if (ticket !== latest.current) {
      URL.revokeObjectURL(objectUrl);
      return;
    }
    if (!size?.width || !size.height) {
      URL.revokeObjectURL(objectUrl);
      dispatch({ type: "failed", kind: "decode" });
      return;
    }
    dispatch({ type: "uploaded", art: { url: objectUrl, ...size } });
  }
  return pick;
}
