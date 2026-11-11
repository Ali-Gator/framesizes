"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { setUnit, type Unit, useUnit } from "@/lib/unit";

const OPTIONS = [
  { value: "in", label: "in" },
  { value: "cm", label: "cm" },
] as const satisfies readonly { value: Unit; label: string }[];

/** {@link openspec/specs/site-shell/spec.md#requirement-the-unit-choice-is-one-site-wide-preference} */
export function UnitToggle() {
  return (
    <SegmentedControl
      label="Units"
      size="sm"
      options={OPTIONS}
      value={useUnit()}
      onChange={setUnit}
    />
  );
}
