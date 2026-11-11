import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { LogoMark } from "@/components/site/logo-mark";
import { livePage } from "@/lib/site-map";

const HOME = livePage("F1");

// T2 adds the size diagram and rewrites the alt by the guide's size-chart formula.
export const alt = `${HOME.seo.h1}: the frame size chart on framesizes.app`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// next/font cannot feed ImageResponse, which needs a static TTF (licence: OFL.txt beside it).
const extraBold = await readFile(
  join(process.cwd(), "src/assets/fonts/SchibstedGrotesk-ExtraBold.ttf"),
);

/** {@link openspec/specs/seo-base/spec.md#requirement-each-page-sends-the-nine-social-tags-with-its-own-image} */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
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
      <div style={{ fontSize: 112, lineHeight: 1.02, letterSpacing: "-0.03em", maxWidth: 1000 }}>
        {HOME.seo.h1}
      </div>
      <div style={{ display: "flex", height: 12, width: 240, background: "#ffc21a" }} />
    </div>,
    {
      ...size,
      fonts: [{ name: "Schibsted Grotesk", data: extraBold, weight: 800, style: "normal" }],
    },
  );
}
