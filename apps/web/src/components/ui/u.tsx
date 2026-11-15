import type { ReactNode } from "react";

/**
 * A length in both units: both go into the HTML, and `<html data-unit>` (globals.css) shows the
 * visitor's one before the first paint.
 * {@link openspec/specs/site-shell/spec.md#requirement-the-unit-choice-is-one-site-wide-preference}
 */
export function U({ in: inches, cm }: { in: ReactNode; cm: ReactNode }) {
  return (
    <>
      <span className="u-in">{inches}</span>
      <span className="u-cm">{cm}</span>
    </>
  );
}
