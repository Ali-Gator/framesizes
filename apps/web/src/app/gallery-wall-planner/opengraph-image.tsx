import { DEMO_ROOM, GALLERY_GAP, layoutTemplate, MOULDING, TEMPLATES } from "@framesizes/sizes";
import { ImageResponse } from "next/og";

import { SOFA_PARTS } from "@/components/frames-on-wall/display";
import { LogoMark } from "@/components/site/logo-mark";
import { ogFonts } from "@/lib/og-font";
import { livePage } from "@/lib/site-map";

const G1 = livePage("G1");
const SOFA = DEMO_ROOM.sofa;
/** The planner's default: One big, two on each side, 8 in above the sample sofa. */
const DEFAULT = TEMPLATES.find((t) => t.id === "one-big-two-each-side");
const LAYOUT = DEFAULT ? layoutTemplate(DEFAULT.stack, GALLERY_GAP, DEMO_ROOM.wall, SOFA) : null;
/** Pixels per inch of the drawn scene. */
const PX = 5;

// The guide's alt for G1's image.
export const alt = "Gallery wall layout with an 18x24 frame and four 8x10 frames above a sofa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** {@link openspec/specs/seo-base/spec.md#requirement-each-page-sends-the-nine-social-tags-with-its-own-image} */
export default function Image() {
  const sofa = SOFA;
  const frames = LAYOUT?.frames.map((f) => f.rect) ?? [];
  const top = LAYOUT ? LAYOUT.box.y + LAYOUT.box.h : sofa.y + sofa.h;
  // Wall inches (x from the wall's left, y up from the floor) as pixels from the box's bottom-left.
  const left = (x: number) => (x - sofa.x) * PX;
  const box = (r: { x: number; y: number; w: number; h: number }) => ({
    position: "absolute" as const,
    left: left(r.x),
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
      <div style={{ fontSize: 88, lineHeight: 1.04, letterSpacing: "-0.03em", maxWidth: 560 }}>
        {G1.seo.h1}
      </div>
      <div style={{ display: "flex", height: 12, width: 240, background: "#ffc21a" }} />
      {/* The default group 8 in above the sofa, both at one true scale. */}
      <div
        style={{
          position: "absolute",
          right: 96,
          bottom: 72,
          width: sofa.w * PX,
          height: top * PX,
          display: "flex",
        }}
      >
        {SOFA_PARTS.map((part) => (
          <div
            key={`${part.x}-${part.y}`}
            style={{
              ...box({ ...part, x: part.x + sofa.x, y: part.y + sofa.y }),
              display: "flex",
              background: "#7e847c",
              borderRadius: part.r * PX,
            }}
          />
        ))}
        {frames.map((frame) => (
          <div
            key={`${frame.x}-${frame.y}`}
            style={{ ...box(frame), display: "flex", background: "#9c6835" }}
          >
            <div
              style={{
                position: "absolute",
                left: MOULDING * PX,
                top: MOULDING * PX,
                right: MOULDING * PX,
                bottom: MOULDING * PX,
                background: "#ffc21a",
              }}
            />
          </div>
        ))}
      </div>
    </div>,
    { ...size, fonts: ogFonts },
  );
}
