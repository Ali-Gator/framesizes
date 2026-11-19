import type { Unit } from "@framesizes/sizes";
import { type ReactNode, useId } from "react";

import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";

import type { TryRecord } from "../store";
import type { TryAction, TryState } from "./try-reducer";
import { waitReason } from "./try-reducer";
import type { TryImage } from "./use-try";

/** The print's picture, title and shop: the head of both try steps. */
export function ArtHead({
  record,
  image,
  children,
}: {
  record: TryRecord;
  image: TryImage | null;
  children?: ReactNode;
}) {
  return (
    <div className="x-art-head">
      <div className="x-thumb" role="img" aria-label="The print you right-clicked">
        {/* An object URL made from the stored picture. */}
        {image ? <img src={image.url} alt="" /> : null}
      </div>
      <div className="x-grow">
        {record.host ? <p className="x-muted">From {record.host}</p> : null}
        <h2 className="x-h x-title">{record.title || "This print"}</h2>
        {children}
      </div>
    </div>
  );
}

export const FRAME_OPTIONS = [
  { value: "none", label: "Unframed" },
  { value: "framed", label: "1 in frame" },
] as const;

/**
 * "What size is it?": the sizes found as chips, "Other size", the frame, and "Hang it on my wall",
 * which waits and says why until a size is picked or typed.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-size-step-asks-for-the-size-the-visitor-would-buy}
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-trys-new-parts-are-accessible}
 */
export function SizeStep({
  record,
  image,
  state,
  dispatch,
  unit,
}: {
  record: TryRecord;
  image: TryImage | null;
  state: TryState;
  dispatch: (action: TryAction) => void;
  unit: Unit;
}) {
  const id = useId();
  const reason = waitReason(state, record.sizes, unit);
  const found = record.sizes.length > 0;
  return (
    <div className="x-pbody">
      <ArtHead record={record} image={image} />
      <div className="x-stack">
        <h3 className="x-h">What size is it?</h3>
        <p className="x-muted">
          {found
            ? "These sizes are on the page. Pick the one you'd buy."
            : "No size on this page. Type the one you'd buy."}
        </p>
      </div>
      <div className="x-chips" role="group" aria-label="Print size">
        {record.sizes.map((size, i) => (
          <button
            key={size.label}
            type="button"
            className="x-chip"
            aria-pressed={state.picked === i}
            onClick={() => dispatch({ type: "pick", picked: i })}
          >
            {size.label}
          </button>
        ))}
        <button
          type="button"
          className="x-chip x-chip-txt"
          aria-pressed={state.picked === "other"}
          onClick={() => dispatch({ type: "pick", picked: "other" })}
        >
          Other size
        </button>
      </div>
      {state.picked === "other" ? (
        <div className="x-wh">
          {(["w", "h"] as const).map((field) => (
            <div key={field} className="x-stack">
              <label className="x-label" htmlFor={`${id}-${field}`}>
                {field === "w" ? "Width" : "Height"}
              </label>
              <span className="wf-num x-num">
                <input
                  id={`${id}-${field}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={field === "w" ? state.wText : state.hText}
                  onChange={(event) =>
                    dispatch({ type: "text", field, text: event.target.value, unit })
                  }
                />
                <span className="wf-u" aria-hidden="true">
                  {state.wText || state.hText ? state.typedUnit : unit}
                </span>
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="x-stack">
        <p className="x-label">Frame</p>
        <SegmentedControl
          label="Frame"
          className="x-seg-full"
          options={FRAME_OPTIONS}
          value={state.framed ? "framed" : "none"}
          onChange={(value) => dispatch({ type: "frame", framed: value === "framed" })}
        />
      </div>
      <div className="x-stack">
        <Button
          className="x-block"
          disabled={reason !== null}
          aria-describedby={reason ? `${id}-why` : undefined}
          onClick={() => dispatch({ type: "hang" })}
        >
          Hang it on my wall
        </Button>
        {reason ? (
          <p className="x-why" id={`${id}-why`} role="status">
            {reason}
          </p>
        ) : null}
      </div>
      {found ? (
        <p className="x-muted">These sizes come from the page text. Check yours before you buy.</p>
      ) : null}
    </div>
  );
}
