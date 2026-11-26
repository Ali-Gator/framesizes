import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { SOFA } from "@framesizes/sizes";
import { ImageResponse } from "next/og";

import { type Box, scene, WALL } from "@/components/frame-mockup/scene";
import { INITIAL, SAMPLE_SIZE } from "@/components/frame-mockup/state";
import { LogoMark } from "@/components/site/logo-mark";
import { ogFonts } from "@/lib/og-font";
import { livePage } from "@/lib/site-map";

const F7 = livePage("F7");
// The widget's first screen: the sample in a 24x36 black frame above the sofa, same geometry.
const S = scene(INITIAL);

// The guide's alt for F7's image.
export const alt = `The sample artwork in a ${SAMPLE_SIZE} black frame above a sofa`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The part of the wall drawn: the sofa and the frame with a margin, in wall inches. */
const sofaLeft = (WALL.w - SOFA.width) / 2;
const REGION: Box = { x: sofaLeft - 6, y: S.outside.y - 8, w: SOFA.width + 12, h: 0 };
REGION.h = WALL.h - REGION.y;
/** Pixels per inch. */
const K = 5.6;
const box = (r: Box) => ({
  position: "absolute" as const,
  display: "flex",
  left: (r.x - REGION.x) * K,
  top: (r.y - REGION.y) * K,
  width: r.w * K,
  height: r.h * K,
});

const SAMPLE = `data:image/svg+xml;base64,${(
  await readFile(join(process.cwd(), "public/frame-mockup/sample.svg"))
).toString("base64")}`;

/** {@link openspec/specs/frame-mockup/spec.md#scenario-the-head-of-the-page} */
export default function Image() {
  // The sofa, as the sample room draws it: back, seat, arms; `y` down from the wall's top.
  const back = { x: sofaLeft, y: 62, w: SOFA.width, h: 20 };
  const seat = { x: sofaLeft + 3, y: 74, w: SOFA.width - 6, h: 14 };
  const arm = (x: number) => ({ x, y: 69, w: 7, h: 19 });
  const floor = { x: REGION.x, y: 89.5, w: REGION.w, h: WALL.h - 89.5 };
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
      <div style={{ fontSize: 64, lineHeight: 1.04, letterSpacing: "-0.03em", maxWidth: 520 }}>
        {F7.seo.h1}
      </div>
      <div style={{ display: "flex", height: 12, width: 240, background: "#ffc21a" }} />
      <div
        style={{
          position: "absolute",
          display: "flex",
          right: 48,
          bottom: 0,
          width: REGION.w * K,
          height: REGION.h * K,
          background: "#e7e9e2",
          borderRadius: "24px 24px 0 0",
          overflow: "hidden",
        }}
      >
        <div style={{ ...box(floor), background: "#ffffff" }} />
        <div style={{ ...box(back), background: "#7e847c", borderRadius: 3 * K }} />
        <div style={{ ...box(seat), background: "#7e847c", borderRadius: 2 * K }} />
        <div style={{ ...box(arm(sofaLeft)), background: "#7e847c", borderRadius: 2.5 * K }} />
        <div
          style={{
            ...box(arm(sofaLeft + SOFA.width - 7)),
            background: "#7e847c",
            borderRadius: 2.5 * K,
          }}
        />
        <div
          style={{
            ...box(S.outside),
            background: "#1f2124",
            boxShadow: "0 6px 14px rgba(20, 24, 28, 0.18)",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- the social image renderer takes a plain img */}
        <img src={SAMPLE} alt="" style={box(S.opening)} />
      </div>
    </div>,
    { ...size, fonts: ogFonts },
  );
}
