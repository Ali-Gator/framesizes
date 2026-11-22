import { inEighths, LIP, MAT_OVERLAP, MOULDING, toCm } from "@framesizes/sizes";
import type { ReactNode } from "react";

export type DiagramKind =
  "inside" | "front" | "mat" | "outside" | "back" | "result" | "xsec" | "round";

/** A length in both units inside SVG text: globals.css hides the other `tspan`. */
const Len = ({ inches }: { inches: number }) => (
  <>
    <tspan className="u-in">{inEighths(inches)} in</tspan>
    <tspan className="u-cm">{toCm(inches).toFixed(1)} cm</tspan>
  </>
);

const FACE = MOULDING + LIP;

/** The drawing's accessible name, the Diagrams board's aria-labels. */
export const DIAGRAM_LABELS: Record<DiagramKind, string> = {
  inside:
    "Back of a frame with the backing board in place. The tape runs across the board from one wall of the recess to the other.",
  front:
    "Front of a frame with no mat. The tape runs across the picture window from one inner edge of the frame to the other.",
  mat: "Front of a frame with a mat. The tape runs across the window cut in the mat, from one cut edge to the other.",
  outside:
    "Front of a frame. One tape runs above the frame from outer edge to outer edge. A short tape runs across the moulding on the left, from the outer edge to the glass.",
  back: "Back of a frame lying face down, with the bent tabs that hold the backing board.",
  result: "A frame with the answer 8 × 10 in.",
  xsec: `Cross-section through one edge of a frame, front at the top. From the outside in: the outer edge; the recess wall under the lip, where the inside is measured; the edge of the lip, where the front opening is measured; the cut edge of the mat, where the mat opening is measured. The moulding seen from the front is ${inEighths(FACE)} in, the lip covers ${inEighths(LIP)} in of the picture and the mat covers ${inEighths(MAT_OVERLAP)} in of the print.`,
  round:
    "Cross-section of a frame with a rounded edge. Measure the moulding flat, as seen from the front, from the outermost point to the edge of the lip. Do not run the tape around the curve.",
};

const SMALL = "0 0 120 90";

const ART: Record<DiagramKind, { box: string; art: ReactNode }> = {
  inside: {
    box: SMALL,
    art: (
      <>
        <rect className="d-oak" x="6" y="6" width="108" height="78" />
        <rect className="d-board" x="20" y="18" width="80" height="54" />
        <path className="d-ink" d="M50 12l4-3 4 3 4-3 4 3 4-3" />
        <rect className="d-tape" x="20" y="40" width="80" height="9" />
        <path
          className="d-tick"
          d="M28 40v3M36 40v4M44 40v3M52 40v4M60 40v3M68 40v4M76 40v3M84 40v4M92 40v3"
        />
      </>
    ),
  },
  front: {
    box: SMALL,
    art: (
      <>
        <rect className="d-oak" x="6" y="6" width="108" height="78" />
        <rect className="d-print" x="20" y="18" width="80" height="54" />
        <path className="d-mute" d="M26 66l18-20 12 12 10-8 18 16" />
        <rect className="d-tape" x="20" y="28" width="80" height="9" />
        <path
          className="d-tick"
          d="M28 28v3M36 28v4M44 28v3M52 28v4M60 28v3M68 28v4M76 28v3M84 28v4M92 28v3"
        />
      </>
    ),
  },
  mat: {
    box: SMALL,
    art: (
      <>
        <rect className="d-oak" x="6" y="6" width="108" height="78" />
        <rect className="d-mat" x="16" y="14" width="88" height="62" />
        <rect className="d-print" x="36" y="28" width="48" height="34" />
        <path className="d-mute" d="M40 58l10-11 7 7 6-5 17 9" />
        <rect className="d-tape" x="36" y="33" width="48" height="9" />
        <path className="d-tick" d="M44 33v3M52 33v4M60 33v3M68 33v4M76 33v3" />
      </>
    ),
  },
  outside: {
    box: SMALL,
    art: (
      <>
        <rect className="d-oak" x="10" y="22" width="100" height="62" />
        <rect className="d-print" x="26" y="36" width="68" height="34" />
        <path className="d-ink" d="M10 4v16M110 4v16" />
        <rect className="d-tape" x="10" y="7" width="100" height="9" />
        <path
          className="d-tick"
          d="M18 7v3M26 7v4M34 7v3M42 7v4M50 7v3M58 7v4M66 7v3M74 7v4M82 7v3M90 7v4M98 7v3"
        />
        <rect className="d-tape" x="10" y="49" width="16" height="9" />
        <path className="d-tick" d="M18 49v3" />
      </>
    ),
  },
  back: {
    box: SMALL,
    art: (
      <>
        <rect className="d-oak" x="6" y="6" width="108" height="78" />
        <rect className="d-board" x="20" y="18" width="80" height="54" />
        <path className="d-ink" d="M50 12l4-3 4 3 4-3 4 3 4-3" />
        <path className="d-ink" d="M38 18v6M82 18v6M38 72v-6M82 72v-6M20 45h6M100 45h-6" />
        <path className="d-mute" d="M30 30h26M30 36h18" />
      </>
    ),
  },
  result: {
    box: SMALL,
    art: (
      <>
        <rect className="d-oak" x="34" y="6" width="52" height="66" />
        <rect className="d-print" x="42" y="14" width="36" height="50" />
        <rect className="d-mat" x="20" y="70" width="80" height="16" rx="8" />
        <text className="d-tn" x="60" y="82" textAnchor="middle">
          <tspan className="u-in">8 × 10 in</tspan>
          <tspan className="u-cm">20.3 × 25.4 cm</tspan>
        </text>
        <rect className="d-tapef" x="34" y="84" width="52" height="2" />
      </>
    ),
  },
  xsec: {
    box: "0 0 760 400",
    art: (
      <>
        <text className="d-t" x="140" y="62" textAnchor="middle">
          Moulding, seen from the front: <Len inches={FACE} />
        </text>
        <path className="d-ink" d="M40 78h200M40 70v16M240 70v16" />
        <path className="d-ink" d="M200 100h40M200 94v12M240 94v12" />
        <text className="d-tn" x="248" y="104">
          lip <Len inches={LIP} />
        </text>
        <path className="d-oak" d="M40 120H240V160H200V240H40Z" />
        <rect className="d-glass" x="200" y="160" width="440" height="7" />
        <rect className="d-mat" x="200" y="167" width="280" height="18" />
        <rect className="d-print" x="440" y="185" width="200" height="5" />
        <rect className="d-board" x="200" y="190" width="440" height="18" />
        <path className="d-ink" d="M200 213l22-5" />
        <path className="d-mute" d="M640 150l8 10-8 10 8 10-8 10 8 10-8 10 8 10" />
        <path className="d-ink" d="M440 226h40M440 220v12M480 220v12" />
        <text className="d-tn" x="488" y="230">
          the mat covers <Len inches={MAT_OVERLAP} /> of the print
        </text>
        <text className="d-tm" x="666" y="128">
          Front
        </text>
        <text className="d-tm" x="666" y="250">
          Back
        </text>
        <path className="d-mute" d="M643 163l20-13M643 176l20-4M643 187l20 7M643 199l20 17" />
        <text className="d-tm" x="666" y="154">
          Glass
        </text>
        <text className="d-tm" x="666" y="176">
          Mat
        </text>
        <text className="d-tm" x="666" y="198">
          Print
        </text>
        <text className="d-tm" x="666" y="220">
          Backing
        </text>
        <path className="d-guide" d="M480 110V300M240 110V322M200 110V344M40 110V366" />
        <text className="d-t" x="486" y="314">
          Mat opening: the mat&apos;s cut edge
        </text>
        <text className="d-t" x="246" y="336">
          Front opening: the edge of the lip
        </text>
        <text className="d-t" x="206" y="358">
          Inside: the recess wall, at the back
        </text>
        <text className="d-t" x="46" y="380">
          Outside: the outer edge
        </text>
      </>
    ),
  },
  round: {
    box: "0 0 360 240",
    art: (
      <>
        <text className="d-tg" x="120" y="22" textAnchor="middle">
          Measure flat: from the front
        </text>
        <path className="d-ok" d="M40 38h160M40 30v16M200 30v16" />
        <path className="d-guide" d="M40 46V130M200 46V74" />
        <path className="d-oak" d="M40 200V130Q40 74 96 74H200V104H170V200Z" />
        <rect className="d-glass" x="170" y="104" width="160" height="6" />
        <rect className="d-board" x="170" y="110" width="160" height="14" />
        <path className="d-wrong" d="M28 200V130Q28 62 96 62H200" />
        <path className="d-x" d="M14 206l12 12M26 206l-12 12" />
        <text className="d-tp" x="34" y="222">
          Not around the curve
        </text>
      </>
    ),
  },
};

/**
 * Where the tape goes, as inline SVG from the approved canvas's diagrams: a picture with its own
 * name, or hidden from assistive technology where a label beside it says the same.
 * {@link openspec/specs/measure-frame/spec.md#requirement-the-wizard-offers-four-measurements-inside-first}
 */
export function Diagram({ kind, decorative = false }: { kind: DiagramKind; decorative?: boolean }) {
  const { box, art } = ART[kind];
  return (
    <svg
      className="mf-dia"
      viewBox={box}
      {...(decorative
        ? { "aria-hidden": true, focusable: false }
        : { role: "img", "aria-label": DIAGRAM_LABELS[kind] })}
    >
      {art}
    </svg>
  );
}
