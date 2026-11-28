/**
 * The launch pages, declared once. Values come from the On-page SEO guide's Per-page map
 * (paths, head values) and the approved home page canvas (short names, card questions, ratios).
 *
 * {@link openspec/specs/seo-base/spec.md#requirement-the-site-map-is-the-single-record-of-pages}
 */

export type HubId = "frames" | "posters" | "photo" | "canvas" | "quality" | "gallery";

/** Head values, required for a live page. `lastModified` changes in the PR that changes the page's content. */
export interface PageSeo {
  title: string;
  h1: string;
  description: string;
  /** ISO date, YYYY-MM-DD. */
  lastModified: string;
}

interface PageBase {
  id: string;
  path: string;
  /** None for a company page (A1–A5): it sits in the footer's company row, not in a hub. */
  hub?: HubId;
  /** Short name: footer, cards. */
  name: string;
  /** Related-tools card: the question the page answers and the drawing's ratio (width, height). */
  card?: { question: string; ratio: readonly [number, number] };
}

/** A page that is not live may carry its head values ahead of go-live (a built page). */
export type SitePage =
  (PageBase & { live: true; seo: PageSeo }) | (PageBase & { live: false; seo?: PageSeo });
export type LivePage = Extract<SitePage, { live: true }>;
/** A page with head values, live or not: one whose route can be built. */
export type BuiltPage = PageBase & { live: boolean; seo: PageSeo };

const PAGE_LIST = [
  {
    id: "F1",
    path: "/",
    hub: "frames",
    name: "Frame size chart",
    card: { question: "What standard frame sizes exist?", ratio: [4, 5] },
    live: true,
    seo: {
      title: "Standard Picture Frame Sizes Chart (Inches & cm)",
      h1: "Standard Frame Sizes",
      description:
        "Every standard picture frame size in inches and cm, from 4x6 to 27x40. Click a size to see it at true scale next to a sofa, a door or a person.",
      lastModified: "2026-11-17",
    },
  },
  {
    id: "F2",
    path: "/frame-sizes-on-wall",
    hub: "frames",
    name: "Frame sizes on your wall",
    card: { question: "How big will a frame look on my wall?", ratio: [4, 5] },
    live: true,
    seo: {
      title: "Frame Sizes on Your Wall: Photo Visualizer",
      h1: "Frame Sizes on Your Wall",
      description:
        "See all 19 standard frame sizes, 4x6 to 27x40, on your wall at true size: upload a photo and set the scale with a door, a sofa, a bed or a sheet of paper.",
      lastModified: "2026-11-22",
    },
  },
  {
    id: "F3",
    path: "/how-big-is-8x10",
    hub: "frames",
    name: "How big is 8x10",
    card: { question: "How big is 8x10, 11x14 or A4 really?", ratio: [4, 5] },
    live: true,
    seo: {
      title: "How Big Is 8x10? See It at Actual Size",
      h1: "How Big Is 8x10?",
      description:
        "An 8x10 is 8 by 10 inches (20.3 x 25.4 cm). See it at actual size on your screen, then compare it with 11x14, 16x20, A4 and A3 frames.",
      lastModified: "2026-11-21",
    },
  },
  {
    id: "F4",
    path: "/measure-picture-frame",
    hub: "frames",
    name: "Measure a picture frame",
    card: { question: "Which size is my frame?", ratio: [5, 7] },
    live: true,
    seo: {
      title: "How to Measure Picture Frame Dimensions",
      h1: "How to Measure a Picture Frame",
      description:
        "Measure the inside, the outside or the mat opening, enter the numbers, and the wizard names the standard frame size you have, in inches and cm.",
      lastModified: "2026-11-22",
    },
  },
  {
    id: "F5",
    path: "/frame-mat-calculator",
    hub: "frames",
    name: "Frame and mat calculator",
    card: { question: "What frame and mat fit my print?", ratio: [11, 14] },
    live: true,
    seo: {
      title: "Picture Frame & Mat Calculator",
      h1: "Frame and Mat Size Calculator",
      description:
        "Enter your print size and mat width to get the frame size and mat opening. Works in reverse too: start from a frame and find the print that fits.",
      lastModified: "2026-11-23",
    },
  },
  {
    id: "F6",
    path: "/poster-frame-sizes",
    hub: "frames",
    name: "Poster frame sizes",
    card: { question: "What frame fits my poster or painting?", ratio: [2, 3] },
    live: true,
    seo: {
      title: "Poster Frame Sizes Chart: With or Without a Mat",
      h1: "Poster Frame Sizes",
      description:
        "Find the frame that fits your poster or painting: standard poster frame sizes from 11x17 to 27x40, with or without a mat, in inches and cm.",
      lastModified: "2026-11-24",
    },
  },
  {
    id: "F7",
    path: "/frame-mockup",
    hub: "frames",
    name: "Poster and frame mockup",
    card: { question: "How will my design look in a frame?", ratio: [3, 4] },
    live: true,
    seo: {
      title: "Poster & Frame Mockup Generator",
      h1: "Poster and Frame Mockup Generator",
      description:
        "Upload your artwork, pick a frame style and a wall, and download a framed poster mockup as a PNG. It runs in your browser, with no account.",
      lastModified: "2026-11-25",
    },
  },
  {
    id: "P1",
    path: "/poster-sizes",
    hub: "posters",
    name: "Poster sizes",
    card: { question: "What are the standard poster sizes?", ratio: [2, 3] },
    live: false,
  },
  {
    id: "P2",
    path: "/poster-board-sizes",
    hub: "posters",
    name: "Poster board sizes",
    card: { question: "What size is a poster board or tri-fold?", ratio: [3, 2] },
    live: false,
  },
  {
    id: "PH1",
    path: "/photo-print-sizes",
    hub: "photo",
    name: "Photo print sizes",
    card: { question: "What are the standard photo print sizes?", ratio: [3, 2] },
    live: false,
  },
  {
    id: "PH2",
    path: "/art-print-sizes",
    hub: "photo",
    name: "Art print sizes",
    card: { question: "Which print sizes fit my artwork without cropping?", ratio: [3, 4] },
    live: false,
  },
  {
    id: "C1",
    path: "/canvas-sizes",
    hub: "canvas",
    name: "Canvas sizes",
    card: { question: "What canvas sizes exist for prints and painting?", ratio: [1, 1] },
    live: false,
  },
  {
    id: "Q1",
    path: "/pixels-to-inches",
    hub: "quality",
    name: "Pixels to inches",
    card: { question: "How many inches is my image at a given DPI?", ratio: [3, 2] },
    live: false,
  },
  {
    id: "Q2",
    path: "/dpi-checker",
    hub: "quality",
    name: "DPI checker",
    card: { question: "Is my image sharp enough to print at this size?", ratio: [4, 5] },
    live: false,
  },
  {
    id: "Q3",
    path: "/change-dpi",
    hub: "quality",
    name: "Change DPI",
    card: { question: "How do I change the DPI of my image?", ratio: [1, 1] },
    live: false,
  },
  {
    id: "G1",
    path: "/gallery-wall-planner",
    hub: "gallery",
    name: "Gallery wall layout planner",
    card: { question: "How do I lay out a gallery wall with real sizes?", ratio: [3, 2] },
    live: true,
    seo: {
      title: "Gallery Wall Layout Planner & Generator",
      h1: "Gallery Wall Layout Planner",
      description:
        "Plan a gallery wall layout with real frame sizes: pick a template, set the spacing, and get exact measurements and nail positions for your wall.",
      lastModified: "2026-11-22",
    },
  },
  {
    id: "G2",
    path: "/gallery-wall-ideas",
    hub: "gallery",
    name: "Gallery wall ideas",
    card: { question: "What works above a sofa, a bed or stairs?", ratio: [1, 1] },
    live: false,
  },
  {
    id: "G3",
    path: "/how-high-to-hang-pictures",
    hub: "gallery",
    name: "How high to hang pictures",
    card: { question: "How high should I hang a picture?", ratio: [4, 5] },
    live: false,
  },
  {
    id: "G4",
    path: "/guides/how-to-make-a-gallery-wall",
    hub: "gallery",
    name: "How to make a gallery wall",
    card: { question: "How do I make and hang a gallery wall?", ratio: [2, 3] },
    live: false,
  },
  {
    // The page the extension opens after install, in every store (Chrome, Edge). Live together with the store id
    // (lib/extension.ts EXTENSION_ID).
    id: "X1",
    path: "/extensions/gallery-wall-layout-generator",
    hub: "gallery",
    name: "Browser extension",
    card: { question: "How do I use the gallery wall browser extension?", ratio: [3, 2] },
    live: true,
    seo: {
      title: "Gallery Wall Layout Generator Extension",
      h1: "How to Use the Gallery Wall Layout Generator",
      description:
        "How to use the Gallery Wall Layout Generator browser extension: plan a wall in the side panel, or right-click a shop print to hang it at true size.",
      lastModified: "2026-11-28",
    },
  },
  // Company pages: no hub, no widget, linked from the footer's company row.
  {
    id: "A1",
    path: "/about",
    name: "About",
    live: true,
    seo: {
      title: "About Frame Sizes",
      h1: "About Frame Sizes",
      description:
        "Frame Sizes is a free set of true-scale tools for frames, posters and gallery walls, run by Soft Divisions Limited. Who we are and how we check sizes.",
      lastModified: "2026-11-28",
    },
  },
  {
    id: "A2",
    path: "/contact",
    name: "Contact",
    live: true,
    seo: {
      title: "Contact Us",
      h1: "Contact Us",
      description:
        "Email Frame Sizes at care@framesizes.app about a wrong size, a bug, the Gallery Wall Layout Generator extension or your data, and find our postal address.",
      lastModified: "2026-11-21",
    },
  },
  {
    id: "A3",
    path: "/privacy-policy",
    name: "Privacy policy",
    live: true,
    seo: {
      title: "Privacy Policy",
      h1: "Privacy Policy",
      description:
        "What Frame Sizes and its extension collect: cookieless visit counts and server logs. Wall photos and saved walls stay on your device, never with us.",
      lastModified: "2026-11-28",
    },
  },
  {
    id: "A4",
    path: "/terms-of-use",
    name: "Terms of use",
    live: true,
    seo: {
      title: "Terms of Use",
      h1: "Terms of Use",
      description:
        "The rules for using Frame Sizes and the Gallery Wall Layout Generator extension: free use, nominal sizes you should measure, liability and Hong Kong law.",
      lastModified: "2026-11-28",
    },
  },
  {
    id: "A5",
    path: "/refund-policy",
    name: "Refund policy",
    live: true,
    seo: {
      title: "Refund Policy",
      h1: "Refund Policy",
      description:
        "Frame Sizes and its browser extension are free, so there is nothing to refund. If we add a paid feature, you get a full refund within 14 days, no reason.",
      lastModified: "2026-11-28",
    },
  },
] as const satisfies readonly SitePage[];

export type PageId = (typeof PAGE_LIST)[number]["id"];
/** Widened to `SitePage` so optional fields (`hub`, `card`) read on every entry. */
export const PAGES: readonly (SitePage & { id: PageId })[] = PAGE_LIST;

/** Hubs in header order, each with its head page (not always its first page: Print quality's is Q2). */
export const HUBS = [
  { id: "frames", name: "Frames", head: "F1" },
  { id: "posters", name: "Posters", head: "P1" },
  { id: "photo", name: "Photo prints", head: "PH1" },
  { id: "canvas", name: "Canvas", head: "C1" },
  { id: "quality", name: "Print quality", head: "Q2" },
  { id: "gallery", name: "Gallery wall", head: "G1" },
] as const satisfies readonly { id: HubId; name: string; head: PageId }[];

export type Hub = (typeof HUBS)[number];

export function page(id: PageId): SitePage {
  const found = (PAGES as readonly SitePage[]).find((p) => p.id === id);
  if (!found) throw new Error(`Unknown page ${id}`);
  return found;
}

/** A page that must be live, such as the page being rendered. */
export function livePage(id: PageId): LivePage {
  const found = page(id);
  if (!found.live) throw new Error(`${id} is not live: it has no head values`);
  return found;
}

/**
 * A page whose route is built: it has head values, live or not. A page that is not live renders
 * with `noindex` (lib/seo.ts `pageMetadata`).
 * {@link openspec/specs/seo-base/spec.md#requirement-a-built-page-that-is-not-live-stays-out-of-the-index}
 */
export function builtPage(id: PageId): BuiltPage {
  const found = page(id);
  if (!hasSeo(found)) throw new Error(`${id} has no head values`);
  return found;
}

export const isLive = (p: SitePage): p is LivePage => p.live;
const hasSeo = (p: SitePage): p is SitePage & BuiltPage => p.seo !== undefined;

export function livePages(pages: readonly SitePage[] = PAGES): LivePage[] {
  return pages.filter(isLive);
}

/** Hubs whose head page is live, in header order. */
export function liveHubHeads(pages: readonly SitePage[] = PAGES): (Hub & { path: string })[] {
  return HUBS.flatMap((hub) => {
    const head = pages.find((p) => p.id === hub.head);
    return head?.live ? [{ ...hub, path: head.path }] : [];
  });
}

/** A header link: the hub head, and every live page path that makes it the current hub. */
export interface HubLink {
  href: string;
  label: string;
  paths: string[];
}

/**
 * {@link openspec/specs/site-shell/spec.md#requirement-the-header-lists-the-live-hubs}
 */
export function navHubs(pages: readonly SitePage[] = PAGES): HubLink[] {
  const live = livePages(pages);
  return liveHubHeads(pages).map((hub) => ({
    href: hub.path,
    label: hub.name,
    paths: live.filter((p) => p.hub === hub.id).map((p) => p.path),
  }));
}

export interface FooterGroup {
  name: string;
  links: { href: string; name: string }[];
}

/**
 * Live pages by hub, in header order; hubs with no live page are left out.
 * {@link openspec/specs/site-shell/spec.md#requirement-the-footer-lists-the-live-pages-by-hub}
 */
export function footerGroups(pages: readonly SitePage[] = PAGES): FooterGroup[] {
  const live = livePages(pages);
  return HUBS.flatMap((hub) => {
    const links = live.filter((p) => p.hub === hub.id).map((p) => ({ href: p.path, name: p.name }));
    return links.length ? [{ name: hub.name, links }] : [];
  });
}

/**
 * Live pages with no hub (the company pages), in site map order: the footer's company row.
 * {@link openspec/specs/site-shell/spec.md#requirement-the-footer-lists-the-live-pages-by-hub}
 */
export function companyLinks(pages: readonly SitePage[] = PAGES): FooterGroup["links"] {
  return livePages(pages)
    .filter((p) => !p.hub)
    .map((p) => ({ href: p.path, name: p.name }));
}

export const BRAND = "Frame Sizes";

/** The title as the browser shows it: as written when it names the brand, else with the brand suffix. */
export function fullTitle(title: string): string {
  return title.includes(BRAND) ? title : `${title} | ${BRAND}`;
}

/** The head limits on every page that declares head values, one message per broken limit, each naming the page. */
export function checkSiteMap(pages: readonly SitePage[]): string[] {
  const problems: string[] = [];
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const p of pages.filter(hasSeo)) {
    const { title, description } = p.seo;
    const full = fullTitle(title);
    if (full.length > 60) problems.push(`${p.id}: title is ${full.length} characters (max 60)`);
    if (description.length < 130 || description.length > 155) {
      problems.push(`${p.id}: description is ${description.length} characters (130–155)`);
    }
    if (titles.has(full)) problems.push(`${p.id}: title repeats another page's`);
    if (descriptions.has(description)) problems.push(`${p.id}: description repeats another page's`);
    titles.add(full);
    descriptions.add(description);
  }
  return problems;
}
