import {
  findFrame,
  MAT_OVERLAP,
  MAT_WIDTH,
  matSizes,
  type Size,
  writeEighths,
} from "@framesizes/sizes";
import { ImageResponse } from "next/og";

import { LogoMark } from "@/components/site/logo-mark";
import { ogFonts } from "@/lib/og-font";
import { livePage } from "@/lib/site-map";

const F5 = livePage("F5");
const EIGHT_TEN = findFrame("8x10");
if (!EIGHT_TEN) throw new Error("no 8x10 in the catalog");
function example() {
  const found = matSizes({ from: "print", print: EIGHT_TEN as Size, width: MAT_WIDTH });
  if (!found) throw new Error("no mat answer for an 8x10");
  return found;
}
const A = example();
/** Pixels per inch of the drawing. */
const PX = 30;
const px = (inches: number) => inches * PX;
const FACE = 1;
const OUT = { w: A.frame.w + 2 * FACE, h: A.frame.h + 2 * FACE };
/** How far in from the outer edge a size sits, centred. */
const inset = (w: number) => px((OUT.w - w) / 2);
const insetH = (h: number) => px((OUT.h - h) / 2);

// The guide's alt for F5's image.
export const alt = `8x10 print in an ${writeEighths(A.frame)} frame with a ${MAT_WIDTH} in mat and a ${writeEighths(A.opening)} opening`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** {@link openspec/specs/frame-mat-calculator/spec.md#scenario-the-head-of-the-page} */
export default function Image() {
  const box = (w: number, h: number) => ({
    position: "absolute" as const,
    left: inset(w),
    top: insetH(h),
    width: px(w),
    height: px(h),
    display: "flex",
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
        padding: "72px 96px",
        background: "#f3f4ef",
        color: "#14181c",
        fontFamily: "Schibsted Grotesk",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <LogoMark size={80} />
        <div style={{ fontSize: 48, letterSpacing: "-0.03em" }}>framesizes</div>
      </div>
      <div style={{ fontSize: 72, lineHeight: 1.04, letterSpacing: "-0.03em", maxWidth: 560 }}>
        {F5.seo.h1}
      </div>
      <div style={{ display: "flex", height: 12, width: 240, background: "#ffc21a" }} />
      {/* The 8x10 in its mat: oak frame, white mat, yellow opening, the print's edge dashed. */}
      <div
        style={{
          position: "absolute",
          left: 700,
          top: (630 - px(OUT.h)) / 2,
          width: px(OUT.w),
          height: px(OUT.h),
          display: "flex",
          background: "#8b5a2b",
        }}
      >
        <div
          style={{
            ...box(A.frame.w - 2 * MAT_OVERLAP, A.frame.h - 2 * MAT_OVERLAP),
            background: "#ffffff",
          }}
        />
        <div
          style={{
            ...box(A.opening.w, A.opening.h),
            background: "#ffc21a",
            border: "2px solid #14181c",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          {writeEighths(A.opening)}
        </div>
        <div style={{ ...box(A.print.w, A.print.h), border: "3px dashed #5c6166" }} />
        <div
          style={{
            position: "absolute",
            left: inset(A.frame.w) + 8,
            top: px(OUT.h / 2) - 18,
            display: "flex",
            fontSize: 24,
            padding: "2px 8px",
            background: "#ffffff",
            border: "2px solid #14181c",
            borderRadius: 6,
          }}
        >
          {`${MAT_WIDTH} in`}
        </div>
      </div>
    </div>,
    { ...size, fonts: ogFonts },
  );
}
