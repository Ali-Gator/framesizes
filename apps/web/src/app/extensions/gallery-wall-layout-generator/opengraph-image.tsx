import { DEMO_ROOM } from "@framesizes/sizes";
import { ImageResponse } from "next/og";

import { PRINT } from "@/components/extension/figures";
import { SOFA_PARTS } from "@/components/frames-on-wall/display";
import { LogoMark } from "@/components/site/logo-mark";
import { ogFonts } from "@/lib/og-font";
import { builtPage } from "@/lib/site-map";

const X1 = builtPage("X1");
const SOFA = DEMO_ROOM.sofa;
/** Pixels per inch of the drawn scene. */
const PX = 6;

export const alt =
  "A print hanging above a sofa at true size in the Gallery Wall Layout Generator side panel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The h1, the sample sofa with one print 8 in above it at one true scale, and the logo.
 * {@link openspec/specs/seo-base/spec.md#requirement-each-page-sends-the-nine-social-tags-with-its-own-image}
 */
export default function Image() {
  const top = PRINT.y + PRINT.h;
  // Wall inches (x from the wall's left, y up from the floor) as pixels from the box's bottom-left.
  const box = (r: { x: number; y: number; w: number; h: number }) => ({
    position: "absolute" as const,
    left: (r.x - SOFA.x) * PX,
    bottom: r.y * PX,
    width: r.w * PX,
    height: r.h * PX,
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
      <div style={{ fontSize: 72, lineHeight: 1.06, letterSpacing: "-0.03em", maxWidth: 560 }}>
        {X1.seo.h1}
      </div>
      <div style={{ display: "flex", height: 12, width: 240, background: "#ffc21a" }} />
      <div
        style={{
          position: "absolute",
          right: 72,
          bottom: 72,
          width: SOFA.w * PX,
          height: top * PX,
          display: "flex",
        }}
      >
        {SOFA_PARTS.map((part) => (
          <div
            key={`${part.x}-${part.y}`}
            style={{
              ...box({ ...part, x: part.x + SOFA.x, y: part.y + SOFA.y }),
              display: "flex",
              background: "#7e847c",
              borderRadius: part.r * PX,
            }}
          />
        ))}
        {/* The print: the page's abstract poster, as blocks Satori can draw. */}
        <div
          style={{
            ...box(PRINT),
            display: "flex",
            overflow: "hidden",
            background: "#ede3d1",
            boxShadow: "0 6px 14px rgba(20, 24, 28, 0.18)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 10 * PX,
              top: 7 * PX,
              width: 10 * PX,
              height: 10 * PX,
              borderRadius: 999,
              background: "#d9822b",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 13 * PX,
              background: "#2f4b5a",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 6 * PX,
              background: "#1e3440",
            }}
          />
        </div>
      </div>
    </div>,
    { ...size, fonts: ogFonts },
  );
}
