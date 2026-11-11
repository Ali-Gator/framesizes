import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { framesFor } from "@framesizes/sizes";
import { ImageResponse } from "next/og";

import { LogoMark } from "@/components/site/logo-mark";
import { livePage } from "@/lib/site-map";

const HOME = livePage("F1");

const SIZES = framesFor("portrait");
const SMALLEST = SIZES[0];
const LARGEST = SIZES.at(-1);
/** Pixels per inch of the nested size diagram. */
const DIAGRAM_SCALE = 12;

// The guide's size-chart alt formula.
export const alt = `Standard frame sizes chart from ${SMALLEST?.id} to ${LARGEST?.id} inches`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// next/font cannot feed ImageResponse, which needs a static TTF (licence: OFL.txt beside it).
const extraBold = await readFile(
  join(process.cwd(), "src/assets/fonts/SchibstedGrotesk-ExtraBold.ttf"),
);

/** {@link openspec/specs/seo-base/spec.md#requirement-each-page-sends-the-nine-social-tags-with-its-own-image} */
export default function Image() {
  const diagram = { w: (LARGEST?.w ?? 0) * DIAGRAM_SCALE, h: (LARGEST?.h ?? 0) * DIAGRAM_SCALE };
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
      <div style={{ fontSize: 104, lineHeight: 1.02, letterSpacing: "-0.03em", maxWidth: 620 }}>
        {HOME.seo.h1}
      </div>
      <div style={{ display: "flex", height: 12, width: 240, background: "#ffc21a" }} />
      {/* Every rectangular size from one bottom-left corner, like the logo mark; 16x20 in tape. */}
      <div
        style={{
          position: "absolute",
          right: 96,
          bottom: 72,
          width: diagram.w,
          height: diagram.h,
          display: "flex",
        }}
      >
        {[...SIZES].reverse().map((size) => (
          <div
            key={size.id}
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: size.w * DIAGRAM_SCALE,
              height: size.h * DIAGRAM_SCALE,
              border: "3px solid #14181c",
              background: size.id === "16x20" ? "#ffc21a" : "transparent",
            }}
          />
        ))}
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Schibsted Grotesk", data: extraBold, weight: 800, style: "normal" }],
    },
  );
}
