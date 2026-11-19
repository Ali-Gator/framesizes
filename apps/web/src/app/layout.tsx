import type { Metadata } from "next";
import { IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SITE_URL } from "@/lib/seo";
import { footerGroups, navHubs } from "@/lib/site-map";

import "./globals.css";

/** {@link openspec/specs/site-shell/spec.md#requirement-fonts-are-served-from-the-sites-own-origin} */
const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-schibsted",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Frame Sizes", template: "%s | Frame Sizes" },
  description: "Standard frame sizes, shown at true scale on a real wall.",
};

/**
 * Runs before the first paint: the stored unit (the "unit" key of lib/unit.ts) onto `<html data-unit>`.
 * The server renders "in", so crawlers, a blocked storage and a no-JS load all get inches.
 * A stored "cm" also sets `data-unit-pending`, which hides the widgets' inch digits until
 * lib/unit.ts's `useUnitSettled` sees them render in cm.
 * {@link openspec/specs/site-shell/spec.md#requirement-the-page-knows-the-unit-before-it-paints}
 * {@link openspec/specs/site-shell/spec.md#requirement-a-stored-centimetre-choice-waits-for-the-widgets}
 */
const UNIT_SCRIPT = `try{if(localStorage.getItem("unit")==="cm"){var r=document.documentElement;r.dataset.unit="cm";r.setAttribute("data-unit-pending","")}}catch(e){}`;

/** {@link openspec/specs/site-shell/spec.md#requirement-every-page-renders-inside-one-shell} */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-unit="in"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: UNIT_SCRIPT }} />
      </head>
      <body>
        <SiteHeader hubs={navHubs()} />
        <main>{children}</main>
        <SiteFooter groups={footerGroups()} />
      </body>
    </html>
  );
}
