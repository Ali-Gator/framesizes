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
  hub: HubId;
  /** Short name: footer, cards. */
  name: string;
  /** Related-tools card: the question the page answers and the drawing's ratio (width, height). */
  card?: { question: string; ratio: readonly [number, number] };
}

export type SitePage = (PageBase & { live: true; seo: PageSeo }) | (PageBase & { live: false });
export type LivePage = Extract<SitePage, { live: true }>;

export const PAGES = [
  {
    id: "F1",
    path: "/",
    hub: "frames",
    name: "Frame size chart",
    live: true,
    seo: {
      title: "Standard Picture Frame Sizes Chart (Inches & cm)",
      h1: "Standard Frame Sizes",
      description:
        "Every standard picture frame size in inches and cm, from 4x6 to 27x40. Click a size to see it at true scale next to a sofa, a door or a person.",
      lastModified: "2026-11-11",
    },
  },
  {
    id: "F2",
    path: "/frame-sizes-on-wall",
    hub: "frames",
    name: "Frame sizes on your wall",
    card: { question: "How big will a frame look on my wall?", ratio: [4, 5] },
    live: false,
  },
  {
    id: "F3",
    path: "/how-big-is-8x10",
    hub: "frames",
    name: "How big is 8x10",
    card: { question: "How big is 8x10, 11x14 or A4 really?", ratio: [4, 5] },
    live: false,
  },
  {
    id: "F4",
    path: "/measure-picture-frame",
    hub: "frames",
    name: "Measure a picture frame",
    card: { question: "Which size is my frame?", ratio: [5, 7] },
    live: false,
  },
  {
    id: "F5",
    path: "/frame-mat-calculator",
    hub: "frames",
    name: "Frame and mat calculator",
    card: { question: "What frame and mat fit my print?", ratio: [11, 14] },
    live: false,
  },
  {
    id: "F6",
    path: "/poster-frame-sizes",
    hub: "frames",
    name: "Poster frame sizes",
    card: { question: "What frame fits my poster or painting?", ratio: [2, 3] },
    live: false,
  },
  {
    id: "F7",
    path: "/frame-mockup",
    hub: "frames",
    name: "Poster and frame mockup",
    card: { question: "How will my design look in a frame?", ratio: [3, 4] },
    live: false,
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
    live: false,
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
] as const satisfies readonly SitePage[];

export type PageId = (typeof PAGES)[number]["id"];

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

export const isLive = (p: SitePage): p is LivePage => p.live;

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

export const BRAND = "Frame Sizes";

/** The title as the browser shows it: as written when it names the brand, else with the brand suffix. */
export function fullTitle(title: string): string {
  return title.includes(BRAND) ? title : `${title} | ${BRAND}`;
}

/** The head limits on live pages, one message per broken limit, each naming the page. */
export function checkSiteMap(pages: readonly SitePage[]): string[] {
  const problems: string[] = [];
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const p of livePages(pages)) {
    const { title, description } = p.seo;
    const full = fullTitle(title);
    if (full.length > 60) problems.push(`${p.id}: title is ${full.length} characters (max 60)`);
    if (description.length < 130 || description.length > 155) {
      problems.push(`${p.id}: description is ${description.length} characters (130–155)`);
    }
    if (titles.has(full)) problems.push(`${p.id}: title repeats another live page's`);
    if (descriptions.has(description))
      problems.push(`${p.id}: description repeats another live page's`);
    titles.add(full);
    descriptions.add(description);
  }
  return problems;
}
