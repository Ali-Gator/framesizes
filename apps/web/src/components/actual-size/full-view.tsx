import { type ActualSize, type Unit, writeActual } from "@framesizes/sizes";
import { type RefObject, useEffect, useRef, useState } from "react";

import { XIcon } from "@/components/ui/icons";

import { Dims, SizeMap, Stage } from "./drawing";
import { type Method, tagText, visiblePart } from "./state";
import { useScroll } from "./use-scroll";

/**
 * The phone's actual-size view: a modal dialog over the whole viewport, pinch blocked by CSS, with a
 * warning while the browser zooms anyway.
 * {@link openspec/specs/actual-size/spec.md#requirement-the-phone-shows-the-size-at-11-over-the-whole-screen}
 * {@link openspec/specs/actual-size/spec.md#requirement-pinch-zoom-cannot-pass-as-actual-size}
 */
export function FullView({
  size,
  scale,
  check,
  unit,
  onClose,
  returnTo,
}: {
  size: ActualSize;
  scale: number;
  check: Method | null;
  unit: Unit;
  onClose: () => void;
  /** Where focus goes when the view closes. */
  returnTo: RefObject<HTMLElement | null>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const { stage, box, offset, onScroll } = useScroll(scale);

  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal?.();
    close.current?.focus();
    const back = returnTo.current;
    return () => back?.focus();
  }, [returnTo]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const read = () => setZoomed(Math.abs(vv.scale - 1) > 0.01);
    read();
    vv.addEventListener("resize", read);
    return () => vv.removeEventListener("resize", read);
  }, []);

  const part = visiblePart(size, box, scale);
  return (
    <dialog
      ref={dialog}
      className="as-full"
      aria-label={`${size.id} at actual size`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="as-full-bar">
        <div className="as-full-t">
          <b>{size.id}</b>
          <span className={`fs-badge ${check ? "fs-badge-good" : "fs-badge-fair"}`}>
            {check ? "Actual size" : "Guess"}
          </span>
        </div>
        <button
          ref={close}
          type="button"
          className="fs-btn fs-btn-secondary as-sq"
          aria-label="Close"
          onClick={onClose}
        >
          <XIcon />
        </button>
      </div>
      {zoomed ? (
        <p className="as-zoom" role="alert">
          Zoomed in, the size is off. Pinch out to see it at actual size.
        </p>
      ) : null}
      <Stage
        ref={stage}
        className="as-full-stage"
        size={size}
        scale={scale}
        unit={unit}
        box={box}
        label={`${size.id} at actual size; drag to see all of it`}
        onScroll={onScroll}
        tag={
          <span className="as-tag">
            <b>
              <Dims inches={writeActual(size, "in")} cm={writeActual(size, "cm")} />
            </b>
            <span>{tagText(check)}</span>
          </span>
        }
      />
      <SizeMap
        className="as-mini"
        size={size}
        outline={{ x: offset.x, y: offset.y, ...part.view }}
        width={96}
        height={110}
        pad={6}
      />
      {part.fits ? null : (
        <div className="as-drag" aria-hidden="true">
          <span>Drag to see the rest</span>
        </div>
      )}
    </dialog>
  );
}
