/**
 * Microsoft Edge's own menu labels. Edge publishes no translations to copy from, so they stay
 * English in every language and are marked `lang="en"` (canvas Q2 A). Checked against Edge 158 on
 * 2026-11-28: click 2 is a pin, as in Chrome.
 * {@link openspec/specs/extension-site/spec.md#requirement-edges-drawings-keep-edges-english-labels}
 */
export const EDGE_LABELS = {
  extensions: "Extensions",
  manage: "Manage Extensions",
  get: "Get extensions for Microsoft Edge",
  copyImage: "Copy image",
  inspect: "Inspect",
} as const;

const W = 880;
const INK = "#1f1f1f";
const GREY = "#424242";

/** The extension's mark on an ink square, `s` px wide, never mirrored. */
function Mark({ x, y, s }: { x: number; y: number; s: number }) {
  const k = s / 20;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <rect width="20" height="20" rx="4.5" className="pp-ink" />
      <g fill="none" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round">
        <rect x="4" y="4" width="12" height="12" />
        <rect x="4" y="8.5" width="7.5" height="7.5" />
      </g>
      <rect x="4" y="12.5" width="3.5" height="3.5" className="pp-tape" />
    </g>
  );
}

function Marker({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="20" className="pp-tape pp-ink-stroke" strokeWidth="2.5" />
      <text x={x} y={y + 7} textAnchor="middle" className="pp-marker">
        {n}
      </text>
    </g>
  );
}

/** The puzzle-piece outline, its left edge at `x`, top at `y`; never mirrored. */
const puzzle = (x: number, y: number) =>
  `M${x} ${y + 2} h4.5 v-1.5 a2.2 2.2 0 0 1 4.4 0 v1.5 h4.5 v4.5 h-1.5 a2.2 2.2 0 0 0 0 4.4 h1.5 v4.5 h-13.4 z`;

/**
 * Edge with the Extensions menu open, from the canvas's boards d2 (left to right) and d4 (right to
 * left): 1 on the puzzle-piece button, 2 on the pin next to Gallery Wall Layout Generator. The
 * browser's shapes mirror for a right-to-left page; text, the mark, the puzzle piece and the numbers
 * do not, each placed at its mirrored spot. Ids carry `pe-` so it can sit beside Chrome's drawing.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-pin-picture-shows-the-two-clicks}
 */
export function EdgePinPicture({ label, dir = "ltr" }: { label: string; dir?: "ltr" | "rtl" }) {
  const rtl = dir === "rtl";
  /** A left edge `x` of something `w` wide, at its mirrored place on a right-to-left page. */
  const at = (x: number, w = 0) => (rtl ? W - x - w : x);
  const start = rtl ? "end" : "start";
  const url = rtl
    ? "framesizes.app/ar/extensions/gallery-wall-layout-generator"
    : "framesizes.app/extensions/gallery-wall-layout-generator";
  return (
    <svg viewBox="0 0 880 400" role="img" aria-label={label} className="ext-pin-picture">
      <defs>
        <clipPath id="pe-win">
          <rect width="880" height="400" rx="8" />
        </clipPath>
        <marker
          id="pe-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" className="pp-ink" />
        </marker>
        <filter id="pe-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#000" floodOpacity="0.16" />
        </filter>
      </defs>
      <g
        clipPath="url(#pe-win)"
        fontFamily="'Segoe UI', 'Segoe UI Variable', system-ui, sans-serif"
      >
        <g transform={rtl ? "translate(880 0) scale(-1 1)" : undefined}>
          {/* Tab strip */}
          <rect width="880" height="400" fill="#f9f9f9" />
          <rect width="880" height="40" fill="#ebebeb" />
          <circle cx="20" cy="20" r="9" fill="#9aa6b2" />
          <g fill="none" stroke={GREY} strokeWidth="1.4">
            <rect x="38" y="14" width="14" height="12" rx="2" />
            <path d="M38 18 h14" />
          </g>
          <path d="M66 40 L66 14 Q66 6 74 6 L288 6 Q296 6 296 14 L296 40 Z" fill="#f9f9f9" />
          <path
            d="M274 19 l6 6 M280 19 l-6 6"
            stroke={GREY}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path d="M310 22 h12 M316 16 v12" stroke={GREY} strokeWidth="1.5" strokeLinecap="round" />
          <g fill="none" stroke={GREY} strokeWidth="1.2">
            <path d="M760 20 h12" />
            <rect x="806" y="14" width="11" height="11" />
            <path d="M848 14 l11 11 M859 14 l-11 11" />
          </g>
          {/* Toolbar */}
          <g
            fill="none"
            stroke={GREY}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M28 64 h-12 M21 58 l-6 6 l6 6" />
            <path d="M48 64 h12 M55 58 l6 6 l-6 6" stroke="#b4b4b4" />
            <path d="M92 62 a8 8 0 1 0 -2 7 M92 56 v6 h-6" />
          </g>
          <rect x="106" y="49" width="508" height="30" rx="15" fill="#fff" stroke="#e0e0e0" />
          <g fill="none" stroke={GREY} strokeWidth="1.4">
            <rect x="121" y="62" width="10" height="8" rx="1.5" />
            <path d="M123 62 v-3 a3 3 0 0 1 6 0 v3" />
          </g>
          <path
            d="M592 56 l3 6 l6.5 0.8 l-4.8 4.4 l1.3 6.5 l-6 -3.3 l-6 3.3 l1.3 -6.5 l-4.8 -4.4 l6.5 -0.8 z"
            fill="none"
            stroke={GREY}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <rect x="638" y="48" width="36" height="32" rx="6" fill="#e3e3e3" />
          <g fill="none" stroke={GREY} strokeWidth="1.4" strokeLinejoin="round">
            <path d="M694 57 l2.4 4.8 l5.2 0.7 l-3.8 3.6 l1 5.2 l-4.8 -2.6 l-4.8 2.6 l1 -5.2 l-3.8 -3.6 l5.2 -0.7 z" />
            <path d="M704 66 h7 M704 70 h7" />
          </g>
          <g fill="none" stroke={GREY} strokeWidth="1.4">
            <rect x="726" y="57" width="10" height="14" rx="1.5" />
            <rect x="739" y="57" width="10" height="14" rx="1.5" />
          </g>
          <g fill={GREY}>
            <circle cx="842" cy="64" r="1.7" />
            <circle cx="850" cy="64" r="1.7" />
            <circle cx="858" cy="64" r="1.7" />
          </g>
          {/* Page */}
          <rect y="88" width="880" height="1" fill="#e0e0e0" />
          <rect y="89" width="880" height="311" fill="#f3f4ef" />
          <rect x="60" y="126" width="240" height="20" rx="4" fill="#dfe2db" />
          <rect x="60" y="160" width="250" height="10" rx="3" fill="#e5e7e1" />
          <rect x="60" y="178" width="220" height="10" rx="3" fill="#e5e7e1" />
          <rect x="60" y="210" width="250" height="150" rx="10" fill="#e7e9e2" />
          {/* Extensions menu */}
          <rect
            x="336"
            y="84"
            width="340"
            height="216"
            rx="8"
            fill="#fff"
            stroke="#e5e5e5"
            filter="url(#pe-shadow)"
          />
          <g fill="none" stroke={GREY} strokeWidth="1.4">
            <rect x="574" y="141" width="16" height="14" rx="2" />
            <path d="M584 141 v14" />
          </g>
          <rect x="606" y="134" width="32" height="28" rx="4" fill="#f0f0f0" />
          <path
            d="M618 140 h8 M619 140 l-1 6 l-3 3 h14 l-3 -3 l-1 -6 M622 149 v7"
            fill="none"
            stroke={INK}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g fill={GREY}>
            <circle cx="650" cy="148" r="1.6" />
            <circle cx="657" cy="148" r="1.6" />
            <circle cx="664" cy="148" r="1.6" />
          </g>
          <rect x="336" y="208" width="340" height="1" fill="#e5e5e5" />
          {/* The two clicks */}
          <circle cx="656" cy="64" r="21" fill="none" className="pp-tape-stroke" strokeWidth="3" />
          <circle cx="622" cy="148" r="19" fill="none" className="pp-tape-stroke" strokeWidth="3" />
          <path
            d="M728 132 Q 712 100 678 80"
            fill="none"
            className="pp-ink-stroke"
            strokeWidth="2.5"
            markerEnd="url(#pe-arrow)"
          />
          <path
            d="M738 262 Q 700 250 642 164"
            fill="none"
            className="pp-ink-stroke"
            strokeWidth="2.5"
            markerEnd="url(#pe-arrow)"
          />
        </g>
        {/* Never mirrored: text, marks, the puzzle piece and the numbers */}
        <Mark x={at(80, 16)} y={15} s={16} />
        <text x={at(104)} y="28" fontSize="12.5" fill={INK} textAnchor={start} lang="en">
          Gallery Wall Layout Generator
        </text>
        <text x={at(142)} y="68.5" fontSize="13.5" fill={INK} textAnchor={start}>
          {url}
        </text>
        <path
          d={puzzle(at(649, 13.4), 55)}
          fill="none"
          stroke={INK}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <text
          x={at(356)}
          y="114"
          fontSize="14"
          fontWeight="600"
          fill={INK}
          textAnchor={start}
          lang="en"
        >
          {EDGE_LABELS.extensions}
        </text>
        <Mark x={at(356, 20)} y={138} s={20} />
        <text x={at(386)} y="153" fontSize="13" fill={INK} textAnchor={start} lang="en">
          Gallery Wall Layout Generator
        </text>
        <path
          d={puzzle(at(358, 13.4), 227)}
          fill="none"
          stroke={GREY}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <text x={at(386)} y="241" fontSize="13" fill={INK} textAnchor={start} lang="en">
          {EDGE_LABELS.manage}
        </text>
        <text x={at(386)} y="275" fontSize="13" fill={INK} textAnchor={start} lang="en">
          {EDGE_LABELS.get}
        </text>
        <Marker x={at(744)} y={146} n={1} />
        <Marker x={at(756)} y={272} n={2} />
      </g>
    </svg>
  );
}
