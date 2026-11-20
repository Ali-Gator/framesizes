import { type ChromeLabels, en } from "./copy/en";

const CHROME_EN = en.chrome;

/** The extension's toolbar icon: the nested-frames mark on an ink square, `s` px wide. */
function MarkIcon({ x, y, s, stroke }: { x: number; y: number; s: number; stroke: number }) {
  const k = s / 20;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <rect width="20" height="20" rx="4.5" className="pp-ink" />
      <g fill="none" stroke="#fff" strokeWidth={stroke / k} strokeLinejoin="round">
        <rect x="4" y="4" width="12" height="12" />
        <rect x="4" y="8.5" width="7.5" height="7.5" />
      </g>
      <rect x="4" y="12.5" width="3.5" height="3.5" className="pp-tape" />
    </g>
  );
}

/**
 * The menu's two grey lines at 11.5px hold about 46 Latin characters each; a longer translation
 * (Hungarian, Greek) gets a smaller size so it stays inside the menu. Wide CJK and Hangul characters
 * count about double, combining marks nothing.
 */
const SUB_LINE_FIT = 46;
function fitSize(lines: readonly string[]) {
  const width = (line: string) =>
    [...line.replace(/\p{M}/gu, "")].reduce(
      (n, c) => n + (/[\u1100-\u11ff\u2e80-\u9fff\uac00-\ud7af\uff00-\uffef]/.test(c) ? 1.9 : 1),
      0,
    );
  const widest = Math.max(...lines.map(width));
  return Math.min(11.5, Math.round(((11.5 * SUB_LINE_FIT) / widest) * 10) / 10);
}

/** A numbered marker: a tape disc with an ink ring and figure. */
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

/**
 * Chrome's own labels default to English; a translated page passes Chrome's wording in its language.
 * A generic Chrome window with the Extensions menu open: 1 on the puzzle-piece button, 2 on the pin
 * next to Gallery Wall Layout Generator. Ported from the canvas's board m; the site's colours are
 * tokens (extension.css `pp-*`), the browser's greys stay as drawn.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-pin-picture-shows-the-two-clicks}
 */
export function PinPicture({
  label = en.pin.picture,
  chrome = CHROME_EN,
}: {
  label?: string;
  chrome?: ChromeLabels;
}) {
  const subSize = fitSize(chrome.noAccessLines);
  return (
    <svg viewBox="0 0 880 400" role="img" aria-label={label} className="ext-pin-picture">
      <defs>
        <clipPath id="pp-win">
          <rect width="880" height="400" rx="12" />
        </clipPath>
        <marker
          id="pp-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" className="pp-ink" />
        </marker>
        <filter id="pp-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.18" />
        </filter>
      </defs>
      <g clipPath="url(#pp-win)" className="pp-chrome">
        {/* Tab strip */}
        <rect width="880" height="400" fill="#fff" />
        <rect width="880" height="44" fill="#dce3ee" />
        <g fill="#7c8590">
          <circle cx="20" cy="22" r="6" />
          <circle cx="40" cy="22" r="6" />
          <circle cx="60" cy="22" r="6" />
        </g>
        <path
          d="M82 44 Q90 44 90 36 L90 16 Q90 8 98 8 L306 8 Q314 8 314 16 L314 36 Q314 44 322 44 Z"
          fill="#fff"
        />
        <MarkIcon x={104} y={18} s={16} stroke={1.5} />
        <text x="130" y="31" fontSize="12.5" fill="#1f1f1f">
          Gallery Wall Layout Generator
        </text>
        <path
          d="M292 22 l7 7 M299 22 l-7 7"
          stroke="#474747"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M330 26 h12 M336 20 v12"
          stroke="#474747"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M848 20 l5 5 l5 -5"
          fill="none"
          stroke="#474747"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Toolbar */}
        <rect y="44" width="880" height="48" fill="#fff" />
        <g
          fill="none"
          stroke="#474747"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M28 68 h-12 M21 62 l-6 6 l6 6" />
          <path d="M50 68 h12 M57 62 l6 6 l-6 6" />
          <path d="M98 66 a8 8 0 1 0 -2 7 M98 60 v6 h-6" />
        </g>
        <rect x="116" y="53" width="560" height="30" rx="15" fill="#eef1f6" />
        <g fill="none" stroke="#474747" strokeWidth="1.6" strokeLinecap="round">
          <path d="M133 63 h10 M133 73 h10" />
          <circle cx="138" cy="63" r="2" fill="#eef1f6" />
          <circle cx="140" cy="73" r="2" fill="#eef1f6" />
        </g>
        <text x="156" y="72.5" fontSize="13.5" fill="#1f1f1f">
          framesizes.app/extensions/gallery-wall-layout-generator
        </text>
        <path
          d="M652 60 l3 6 l6.5 0.8 l-4.8 4.4 l1.3 6.5 l-6 -3.3 l-6 3.3 l1.3 -6.5 l-4.8 -4.4 l6.5 -0.8 z"
          fill="none"
          stroke="#474747"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* The puzzle-piece button, pressed */}
        <circle cx="712" cy="68" r="16" fill="#e2e7ef" />
        <path
          d="M705 61 h4.5 v-1.5 a2.2 2.2 0 0 1 4.4 0 v1.5 h4.5 v4.5 h-1.5 a2.2 2.2 0 0 0 0 4.4 h1.5 v4.5 h-13.4 z"
          fill="none"
          stroke="#1f1f1f"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <g fill="none" stroke="#474747" strokeWidth="1.6">
          <rect x="740" y="61" width="15" height="14" rx="2" />
          <path d="M749 61 v14" />
        </g>
        <circle cx="784" cy="68" r="11" fill="#9aa6b2" />
        <g fill="#474747">
          <circle cx="814" cy="61" r="1.8" />
          <circle cx="814" cy="68" r="1.8" />
          <circle cx="814" cy="75" r="1.8" />
        </g>
        <rect y="92" width="880" height="1" fill="#e3e6ea" />
        {/* The page behind: this site, in its own colours */}
        <rect y="93" width="880" height="307" className="pp-wall" />
        <rect x="60" y="130" width="300" height="20" rx="4" className="pp-stage" />
        <rect x="60" y="164" width="380" height="10" rx="3" className="pp-stage" />
        <rect x="60" y="182" width="340" height="10" rx="3" className="pp-stage" />
        <rect x="60" y="214" width="380" height="150" rx="10" className="pp-stage" />
        {/* The Extensions menu */}
        <rect
          x="496"
          y="88"
          width="340"
          height="208"
          rx="12"
          fill="#fff"
          filter="url(#pp-shadow)"
        />
        <text x="516" y="120" fontSize="15" fontWeight="500" fill="#1f1f1f">
          {chrome.extensions}
        </text>
        <path
          d="M810 110 l9 9 M819 110 l-9 9"
          stroke="#474747"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <text x="516" y="150" fontSize="12" fontWeight="600" fill="#1f1f1f">
          {chrome.noAccess}
        </text>
        <text x="516" y="168" fontSize={subSize} fill="#5f6368">
          {chrome.noAccessLines[0]}
        </text>
        <text x="516" y="183" fontSize={subSize} fill="#5f6368">
          {chrome.noAccessLines[1]}
        </text>
        <MarkIcon x={516} y={200} s={20} stroke={1.8} />
        <text x="546" y="215" fontSize="13" fill="#1f1f1f">
          Gallery Wall Layout Generator
        </text>
        <circle cx="806" cy="210" r="15" fill="#fff" stroke="#c4c7c5" />
        <path
          d="M806 216 v6 M802 201 h8 l-1.2 6 l3.4 3 v2 h-12.4 v-2 l3.4 -3 z"
          fill="none"
          stroke="#1f1f1f"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <rect x="496" y="240" width="340" height="1" fill="#e3e6ea" />
        <g fill="none" stroke="#474747" strokeWidth="1.5">
          <circle cx="526" cy="268" r="3" />
          <circle cx="526" cy="268" r="7" strokeDasharray="3 2.5" />
        </g>
        <text x="546" y="272.5" fontSize="13" fill="#1f1f1f">
          {chrome.manage}
        </text>
      </g>
      {/* The two clicks */}
      <circle cx="712" cy="68" r="19" fill="none" className="pp-tape-stroke" strokeWidth="3" />
      <circle cx="806" cy="210" r="19" fill="none" className="pp-tape-stroke" strokeWidth="3" />
      <path
        d="M640 128 Q 660 100 692 82"
        fill="none"
        className="pp-ink-stroke"
        strokeWidth="2.5"
        markerEnd="url(#pp-arrow)"
      />
      <Marker x={624} y={140} n={1} />
      <path
        d="M770 330 Q 800 300 804 236"
        fill="none"
        className="pp-ink-stroke"
        strokeWidth="2.5"
        markerEnd="url(#pp-arrow)"
      />
      <Marker x={752} y={340} n={2} />
    </svg>
  );
}
