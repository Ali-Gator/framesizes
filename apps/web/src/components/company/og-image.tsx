import { ImageResponse } from "next/og";

import { LogoMark } from "@/components/site/logo-mark";
import { ogFonts } from "@/lib/og-font";
import { livePage, type PageId } from "@/lib/site-map";

const SIZE = { width: 1200, height: 630 };

/**
 * The company pages' one social image layout: the logo, then the page's `h1` in large type.
 * {@link openspec/specs/company-pages/spec.md#requirement-each-company-page-has-its-own-social-image}
 */
export function companyOgImage(id: PageId) {
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
      <div style={{ fontSize: 96, lineHeight: 1.04, letterSpacing: "-0.03em", maxWidth: 1000 }}>
        {livePage(id).seo.h1}
      </div>
      <div style={{ display: "flex", height: 12, width: 240, background: "#ffc21a" }} />
    </div>,
    { ...SIZE, fonts: ogFonts },
  );
}
