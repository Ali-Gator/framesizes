import { posterFrames, POSTERS, type Size } from "@framesizes/sizes";
import { ImageResponse } from "next/og";

import { LogoMark } from "@/components/site/logo-mark";
import { ogFonts } from "@/lib/og-font";
import { livePage } from "@/lib/site-map";

const F6 = livePage("F6");
/** The 24x36 poster, its own frame and the one frame that takes it with a mat. */
function example() {
  const poster = POSTERS.find((p) => p.id === "24x36");
  const frames = poster && posterFrames(poster);
  const bare = frames?.bare.kind === "standard" ? frames.bare.frame : undefined;
  const matted = frames?.matted.length === 1 ? frames.matted[0] : undefined;
  if (!poster || !bare || !matted)
    throw new Error("expected a 24x36 frame, and one frame with a mat");
  return { POSTER: poster, BARE: bare, MATTED: matted };
}
const { POSTER, BARE, MATTED } = example();

/** Pixels per inch of the drawing, and the moulding drawn on each side. */
const PX = 11;
const FACE = 1;
const GAP = 32;
const px = (inches: number) => inches * PX;
const outer = (s: Size) => ({ w: s.w + 2 * FACE, h: s.h + 2 * FACE });

// The guide's alt for F6's image.
export const alt = `A ${POSTER.id} poster in a ${BARE.id} frame, and in a ${MATTED.frame.id} frame with a mat`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** A box of `inner` centred in `around`, both in inches. */
const centred = (around: Size, inner: Size) => ({
  position: "absolute" as const,
  left: px((around.w - inner.w) / 2),
  top: px((around.h - inner.h) / 2),
  width: px(inner.w),
  height: px(inner.h),
  display: "flex",
});

/** {@link openspec/specs/poster-frame-sizes/spec.md#scenario-the-head-of-the-page} */
export default function Image() {
  const bare = outer(BARE);
  const matted = outer(MATTED.frame);
  const opening = {
    w: MATTED.frame.w - 2 * MATTED.side,
    h: MATTED.frame.h - 2 * MATTED.top,
  };
  const left = 1200 - 64 - px(bare.w) - GAP - px(matted.w);
  const frame = (o: Size, x: number) => ({
    position: "absolute" as const,
    left: x,
    top: (630 - px(o.h)) / 2,
    width: px(o.w),
    height: px(o.h),
    display: "flex",
    background: "#8b5a2b",
  });
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        padding: "72px 64px",
        background: "#f3f4ef",
        color: "#14181c",
        fontFamily: "Schibsted Grotesk",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <LogoMark size={80} />
        <div style={{ fontSize: 48, letterSpacing: "-0.03em" }}>framesizes</div>
      </div>
      <div style={{ fontSize: 68, lineHeight: 1.04, letterSpacing: "-0.03em", maxWidth: 420 }}>
        {F6.seo.h1}
      </div>
      <div style={{ display: "flex", height: 12, width: 240, background: "#ffc21a" }} />
      {/* The 24x36 poster filling its frame. */}
      <div style={frame(bare, left)}>
        <div
          style={{
            ...centred(bare, POSTER),
            background: "#ffc21a",
            border: "2px solid #14181c",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
          }}
        >
          {POSTER.id}
        </div>
      </div>
      {/* The same poster in the bigger frame with a mat: white mat, the poster seen in it, its edge dashed. */}
      <div style={frame(matted, left + px(bare.w) + GAP)}>
        <div style={{ ...centred(matted, MATTED.frame), background: "#ffffff" }} />
        <div
          style={{
            ...centred(matted, opening),
            background: "#ffc21a",
            border: "2px solid #14181c",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
          }}
        >
          {`${MATTED.frame.id} + mat`}
        </div>
        <div style={{ ...centred(matted, POSTER), border: "3px dashed #5c6166" }} />
      </div>
    </div>,
    { ...size, fonts: ogFonts },
  );
}
