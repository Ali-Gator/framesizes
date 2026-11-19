"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { setUnit, type Unit, useUnit } from "@/lib/unit";

const OPTIONS = [
  { value: "in", label: "in" },
  { value: "cm", label: "cm" },
] as const satisfies readonly { value: Unit; label: string }[];

/**
 * {@link openspec/specs/site-shell/spec.md#requirement-the-unit-choice-is-one-site-wide-preference}
 * `fs-units` lets globals.css draw the checked look from `<html data-unit>`, so it is right before hydration:
 * {@link openspec/specs/site-shell/spec.md#requirement-the-units-toggle-shows-the-stored-unit-from-first-paint}
 */
export function UnitToggle() {
  return (
    <SegmentedControl
      label="Units"
      size="sm"
      className="fs-units"
      options={OPTIONS}
      value={useUnit()}
      onChange={setUnit}
    />
  );
}
