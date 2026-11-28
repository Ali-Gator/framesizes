import {
  ABOVE_SOFA,
  DEMO_ROOM,
  GALLERY_GAP,
  layoutTemplate,
  measureGroup,
  MOULDING,
  TEMPLATES,
} from "@framesizes/sizes";

import { SOFA_PARTS } from "@/components/frames-on-wall/display";

import { EDGE_LABELS } from "./edge-pin-picture";
import type { SiteStore } from "./store";

/**
 * Figures for the extension page and section, drawn at true scale from the size engine's sample room
 * (the current flat room; BL-51 swaps it). Wall inches have y up from the floor; SVG y runs down.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-extension-pages-server-html-is-the-how-to}
 */

type Rect = { x: number; y: number; w: number; h: number };

const WALL = DEMO_ROOM.wall.bounds;
const SOFA = DEMO_ROOM.sofa;
/** G1's default template, laid out in the sample room. */
const DEFAULT = TEMPLATES.find((t) => t.id === "one-big-two-each-side");
const LAYOUT = DEFAULT ? layoutTemplate(DEFAULT.stack, GALLERY_GAP, DEMO_ROOM.wall, SOFA) : null;
const FRAMES: Rect[] = LAYOUT?.frames.map((f) => f.rect) ?? [];
/** A 24x36 print, unframed, centred 8 in above the sample sofa. */
export const PRINT: Rect = {
  x: SOFA.x + SOFA.w / 2 - 12,
  y: SOFA.y + SOFA.h + ABOVE_SOFA,
  w: 24,
  h: 36,
};

/** A wall rect as SVG attributes. */
const svgRect = (r: Rect, top = WALL.h) => ({
  x: r.x,
  y: top - r.y - r.h,
  width: r.w,
  height: r.h,
});

function Room() {
  return (
    <>
      <rect width={WALL.w} height={WALL.h} className="ext-fig-wall" />
      {SOFA_PARTS.map((p) => (
        <rect
          key={`${p.x}-${p.y}`}
          {...svgRect({ x: SOFA.x + p.x, y: SOFA.y + p.y, w: p.w, h: p.h })}
          rx={p.r}
          className="ext-fig-furn"
        />
      ))}
    </>
  );
}

/** An abstract poster: sun, hills and water, drawn in a 24 × 36 box. */
export function PrintArt(props: Record<string, number | string>) {
  return (
    <svg viewBox="0 0 24 36" preserveAspectRatio="none" aria-hidden="true" {...props}>
      <rect width="24" height="36" fill="#ede3d1" />
      <circle cx="15" cy="12" r="5" fill="#d9822b" />
      <path d="M0 26 Q8 18 14 24 T24 22 V36 H0Z" fill="#2f4b5a" />
      <path d="M0 30 Q10 24 24 31 V36 H0Z" fill="#1e3440" />
    </svg>
  );
}

/** The section's picture: one print above the sofa, as the side panel hangs it. */
export function PrintFigure({ label }: { label: string }) {
  return (
    <svg viewBox={`0 0 ${WALL.w} ${WALL.h}`} role="img" aria-label={label} className="ext-fig">
      <Room />
      <PrintArt {...svgRect(PRINT)} className="ext-fig-print" />
    </svg>
  );
}

/** Step 1: G1's default group of five frames above the sofa. */
export function LayoutFigure({ label }: { label: string }) {
  return (
    <svg viewBox={`0 0 ${WALL.w} ${WALL.h}`} role="img" aria-label={label} className="ext-fig">
      <Room />
      {FRAMES.map((f) => (
        <g key={`${f.x}-${f.y}`} className="ext-fig-frame">
          <rect {...svgRect(f)} className="ext-fig-moulding" />
          <rect
            {...svgRect({
              x: f.x + MOULDING,
              y: f.y + MOULDING,
              w: f.w - 2 * MOULDING,
              h: f.h - 2 * MOULDING,
            })}
            className="ext-fig-art"
          />
        </g>
      ))}
    </svg>
  );
}

/** The extension's mark, as the menu row's icon. */
const MENU_MARK = (
  <svg viewBox="0 0 64 64">
    <rect width="64" height="64" rx="14" className="pp-ink" />
    <g fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round">
      <rect x="13" y="13" width="38" height="38" />
      <rect x="13" y="27" width="24" height="24" />
    </g>
    <rect x="13" y="40" width="11" height="11" className="pp-tape" />
  </svg>
);

/**
 * Step 2: a shop image with the right-click menu open on "Try on my wall". Chrome's own items come
 * in `menu`'s language; Edge's (board e2) stay English, marked `lang="en"`, each row with its icon.
 * `dir="rtl"` mirrors either store's figure (board e4): the print on the right, the menu opening to
 * its left, icons on the right, text still left to right.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-right-click-figure-follows-the-pages-direction}
 * {@link openspec/specs/extension-site/spec.md#requirement-edges-drawings-keep-edges-english-labels}
 */
export function MenuFigure({
  label,
  menu = { copyImage: "Copy image", inspect: "Inspect" },
  store = "chrome",
  dir = "ltr",
}: {
  label: string;
  menu?: { copyImage: string; inspect: string };
  store?: SiteStore;
  dir?: "ltr" | "rtl";
}) {
  const edge = store === "edge";
  const lang = edge ? "en" : undefined;
  const items = edge ? EDGE_LABELS : menu;
  return (
    <div
      role="img"
      aria-label={label}
      className={`ext-fig ext-fig-shop${dir === "rtl" ? " ext-fig-rtl" : ""}`}
    >
      <PrintArt className="ext-fig-shop-print" />
      <div className={edge ? "ext-menu ext-menu-edge" : "ext-menu"} aria-hidden="true" dir="ltr">
        <span lang={lang}>
          {edge && (
            <svg viewBox="0 0 16 16" fill="none" stroke="#424242" strokeWidth="1.2">
              <rect x="5" y="5" width="8" height="9" rx="1.5" />
              <path d="M3 11 V3.5 A1.5 1.5 0 0 1 4.5 2 H10" />
            </svg>
          )}
          {items.copyImage}
        </span>
        <span className="ext-menu-hot" lang="en">
          {MENU_MARK}
          Try on my wall
        </span>
        <span lang={lang}>
          {edge && (
            <svg viewBox="0 0 16 16" fill="none" stroke="#424242" strokeWidth="1.2">
              <rect x="2" y="3" width="12" height="10" rx="1.5" />
              <path d="M6 7 l-2 1.5 l2 1.5 M10 7 l2 1.5 l-2 1.5" />
            </svg>
          )}
          {items.inspect}
        </span>
      </div>
    </div>
  );
}

/** The drop G1's default hanger would need, for the drawing only. */
const DROP = 2;
/** Space around the group on the nail map, in inches (as G1's map). */
const MARGIN = 6;

/** Step 3: the default group's frames with numbered nails, numbered as G1 numbers them. */
export function NailFigure({ label }: { label: string }) {
  const measure = measureGroup(
    FRAMES.map((rect) => ({ rect, hanger: { kind: "one" as const, drop: DROP } })),
    DEMO_ROOM.wall,
  );
  const xs = FRAMES.map((f) => f.x);
  const ys = FRAMES.map((f) => f.y);
  const left = Math.min(...xs) - MARGIN;
  const bottom = Math.min(...ys) - MARGIN;
  const right = Math.max(...FRAMES.map((f) => f.x + f.w)) + MARGIN;
  const top = Math.max(...FRAMES.map((f) => f.y + f.h)) + MARGIN;
  const w = right - left;
  const h = top - bottom;
  return (
    <svg viewBox={`${left} 0 ${w} ${h}`} role="img" aria-label={label} className="ext-fig">
      <rect x={left} width={w} height={h} className="ext-fig-wall" />
      {FRAMES.map((f) => (
        <rect key={`${f.x}-${f.y}`} {...svgRect(f, top)} className="ext-fig-outline" />
      ))}
      {measure?.nails.map((nail, i) => {
        const f = FRAMES[nail.frame];
        if (!f) return null;
        const cx = f.x + f.w / 2;
        const cy = top - (f.y + f.h - DROP);
        return (
          <g key={nail.frame} className="ext-fig-nail">
            <circle cx={cx} cy={cy} r="2.6" />
            <text x={cx} y={cy + 1.1}>
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
