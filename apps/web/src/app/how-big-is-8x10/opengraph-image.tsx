import { ACTUAL_SIZES } from "@framesizes/sizes";
import { ImageResponse } from "next/og";

import { LogoMark } from "@/components/site/logo-mark";
import { ogFonts } from "@/lib/og-font";
import { livePage } from "@/lib/site-map";

const F3 = livePage("F3");
/** Pixels per inch of the drawing. */
const PX = 21;
/** Largest first, so the smaller ones sit on top. */
const NESTED = [...ACTUAL_SIZES].sort((a, b) => b.w * b.h - a.w * a.h);

// The guide's comparison alt for F3's image.
export const alt = "8x10 frame compared with 11x14, 16x20, A4 and A3 frames at the same scale";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** {@link openspec/specs/actual-size/spec.md#scenario-the-head-of-the-page} */
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
      <div style={{ fontSize: 88, lineHeight: 1.04, letterSpacing: "-0.03em", maxWidth: 560 }}>
        {F3.seo.h1}
      </div>
      <div style={{ display: "flex", height: 12, width: 240, background: "#ffc21a" }} />
      {/* The seven sizes from one bottom-left corner at one scale, 8x10 filled. */}
      <div
        style={{
          position: "absolute",
          right: 96,
          bottom: 72,
          width: (NESTED[0]?.w ?? 0) * PX + 90,
          height: (NESTED[0]?.h ?? 0) * PX,
          display: "flex",
        }}
      >
        {NESTED.map((s) => {
          const current = s.id === "8x10";
          return (
            <div
              key={s.id}
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                width: s.w * PX,
                height: s.h * PX,
                display: "flex",
                border: `4px solid ${current ? "#14181c" : "#868d85"}`,
                background: current ? "#ffc21a" : "transparent",
              }}
            />
          );
        })}
        {NESTED.filter((s) => ["16x20", "11x14", "8x10"].includes(s.id)).map((s) => (
          <div
            key={`l-${s.id}`}
            style={{
              position: "absolute",
              left: s.id === "8x10" ? 14 : s.w * PX + 10,
              bottom: s.h * PX - 40,
              fontSize: 28,
              display: "flex",
            }}
          >
            {s.label}
          </div>
        ))}
      </div>
    </div>,
    { ...size, fonts: ogFonts },
  );
}
