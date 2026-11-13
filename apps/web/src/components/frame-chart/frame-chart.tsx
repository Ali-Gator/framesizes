"use client";

import {
  framesFor,
  nextSizeUp,
  writeSize,
  type Orientation,
  type ReferenceId,
} from "@framesizes/sizes";
import { type ReactNode, useEffect } from "react";

import { ScalePreview } from "@/components/ui/scale-preview";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SizeCompare } from "@/components/ui/size-compare";
import { SizeTable } from "@/components/ui/size-table";
import { WidgetCard } from "@/components/ui/widget-card";
import { useUnit } from "@/lib/unit";
import { currentSearch, replaceSearch, useSearch } from "@/lib/url-state";

import {
  type ChartState,
  chartSearch,
  parseChartState,
  selectedFrame,
  type View,
  withOrientation,
} from "./state";

const ORIENTATIONS = [
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
  { value: "square", label: "Square" },
] as const satisfies readonly { value: Orientation; label: string }[];
const VIEWS = [
  { value: "wall", label: "On a wall" },
  { value: "all", label: "All sizes" },
] as const satisfies readonly { value: View; label: string }[];
const REFERENCES = [
  { value: "sofa", label: "Sofa" },
  { value: "person", label: "Person" },
  { value: "door", label: "Door" },
] as const satisfies readonly { value: ReferenceId; label: string }[];

export const TABLE_CAPTION = "Standard picture frame sizes in inches and centimetres";

/** A labelled filter: the visible label above the control, which carries the same name. */
function Filter({
  label,
  hidden,
  children,
}: {
  label: string;
  hidden?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="fs-field" style={hidden ? { visibility: "hidden" } : undefined}>
      <span className="label text-ink-muted" aria-hidden="true">
        {label}
      </span>
      <div className="flex">{children}</div>
    </div>
  );
}

/**
 * The frame size chart: filters, the size table and the preview, state in the URL. Prerendered
 * with the default state; hydration keeps it, then applies the query string and the stored unit.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-widget-opens-on-16x20-above-a-sofa}
 */
export function FrameChart({ footer }: { footer: ReactNode }) {
  const unit = useUnit();
  const state = parseChartState(useSearch());
  const frame = selectedFrame(state);
  const other = unit === "cm" ? "in" : "cm";
  // Built from the live URL at the moment of the write, never from a stale render.
  const set = (next: Partial<ChartState>) =>
    replaceSearch(chartSearch({ ...parseChartState(currentSearch()), ...next }));

  // Marks the widget as interactive (the e2e tests wait for it before clicking).
  useEffect(() => {
    document.documentElement.dataset.chartReady = "true";
  }, []);

  const square = frame.orientation === "square";
  const rectangular = framesFor(frame.orientation === "landscape" ? "landscape" : "portrait");
  const rows = [...rectangular, ...framesFor("square")].map((f) => ({
    id: f.id,
    label: writeSize(f, unit),
    cells: [writeSize(f, other), f.mat ? writeSize(f.mat, unit) : "No mat", f.use],
    hidden: (f.orientation === "square") !== square,
    mat: !!f.mat,
  }));

  return (
    <WidgetCard title="Frame size chart" footer={footer}>
      <div className="fc">
        <div className="fc-grid">
          <div className="fc-preview">
            {state.view === "wall" ? (
              <ScalePreview
                frame={frame}
                ghost={nextSizeUp(frame)}
                reference={state.ref}
                unit={unit}
              />
            ) : (
              <SizeCompare
                sizes={framesFor(frame.orientation)}
                value={frame.id}
                unit={unit}
                onSelect={(size) => set({ size })}
              />
            )}
          </div>
          <div className="fc-controls">
            <div className="fc-filters">
              <Filter label="Orientation">
                <SegmentedControl
                  label="Orientation"
                  options={ORIENTATIONS}
                  value={frame.orientation}
                  onChange={(o) => set(withOrientation(state, o))}
                />
              </Filter>
              <Filter label="Preview">
                <SegmentedControl
                  label="Preview"
                  options={VIEWS}
                  value={state.view}
                  onChange={(view) => set({ view })}
                />
              </Filter>
              <Filter label="Next to" hidden={state.view !== "wall"}>
                <SegmentedControl
                  label="Next to"
                  options={REFERENCES}
                  value={state.ref}
                  onChange={(ref) => set({ ref })}
                />
              </Filter>
            </div>
            <p className="small text-ink-muted">Pick a size. The preview shows it straight away.</p>
            <SizeTable
              caption={TABLE_CAPTION}
              name="frame-size"
              columns={[
                { label: "Frame size", num: true },
                { label: unit === "cm" ? "Inches" : "Centimetres", num: true },
                { label: "Image with a mat", num: true, mat: true },
                { label: "Common use" },
              ]}
              rows={rows}
              value={frame.id}
              onSelect={(size) => set({ size })}
            />
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
