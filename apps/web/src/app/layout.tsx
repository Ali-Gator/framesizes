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

/** {@link openspec/specs/site-shell/spec.md#requirement-every-page-renders-inside-one-shell} */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <SiteHeader hubs={navHubs()} />
        <main>{children}</main>
        <SiteFooter groups={footerGroups()} />
      </body>
    </html>
  );
}
