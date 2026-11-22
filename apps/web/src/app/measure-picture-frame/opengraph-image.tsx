import { findFrame, frameMeasurements, writeEighths } from "@framesizes/sizes";
import { ImageResponse } from "next/og";

import { LogoMark } from "@/components/site/logo-mark";
import { ogFonts } from "@/lib/og-font";
import { livePage } from "@/lib/site-map";

const F4 = livePage("F4");
const EIGHT_TEN = findFrame("8x10");
if (!EIGHT_TEN) throw new Error("no 8x10 in the catalog");
const M = frameMeasurements(EIGHT_TEN);
/** Pixels per inch of the drawing. */
const PX = 36;
const px = (inches: number) => inches * PX;
/** How far in from the outer edge a size sits, centred. */
const inset = (w: number) => px((M.outside.w - w) / 2);

// The guide's alt for F4's image.
export const alt = "8x10 picture frame with its inside, front opening and outside measured";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LABELS = [
  { text: `${writeEighths(M.outside)} outside`, swatch: "#8b5a2b" },
  { text: `${writeEighths(M.inside)} inside`, swatch: "#ffc21a" },
  { text: `${writeEighths(M.front)} opening`, swatch: "#fff1c2" },
];

/** {@link openspec/specs/measure-frame/spec.md#scenario-the-head-of-the-page} */
export default function Image() {
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
      <div style={{ fontSize: 72, lineHeight: 1.04, letterSpacing: "-0.03em", maxWidth: 520 }}>
        {F4.seo.h1}
      </div>
      <div style={{ display: "flex", height: 12, width: 240, background: "#ffc21a" }} />
      {/* The 8x10 from the front: oak outside, the front opening, the inside dashed under the lip. */}
      <div
        style={{
          position: "absolute",
          left: 640,
          top: (630 - px(M.outside.h)) / 2,
          width: px(M.outside.w),
          height: px(M.outside.h),
          display: "flex",
          background: "#8b5a2b",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: inset(M.front.w),
            top: inset(M.front.w),
            width: px(M.front.w),
            height: px(M.front.h),
            display: "flex",
            background: "#fff1c2",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: inset(M.inside.w),
            top: inset(M.inside.w),
            width: px(M.inside.w),
            height: px(M.inside.h),
            display: "flex",
            border: "4px dashed #ffc21a",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: inset(M.front.w) + 16,
            top: inset(M.front.w) + 24,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {LABELS.map((l) => (
            <div
              key={l.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 24,
                padding: "4px 12px",
                background: "#ffffff",
                border: "3px solid #14181c",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 20,
                  height: 20,
                  background: l.swatch,
                  border: "2px solid #14181c",
                }}
              />
              {l.text}
            </div>
          ))}
        </div>
      </div>
    </div>,
    { ...size, fonts: ogFonts },
  );
}
