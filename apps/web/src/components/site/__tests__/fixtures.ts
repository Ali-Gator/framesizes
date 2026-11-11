import { PAGES, type SitePage } from "@/lib/site-map";

/** The registry with exactly the given pages live (fixture head values for each). */
export function withLive(...ids: string[]): SitePage[] {
  return PAGES.map((p): SitePage => {
    const base = { id: p.id, path: p.path, hub: p.hub, name: p.name };
    return ids.includes(p.id)
      ? {
          ...base,
          live: true,
          seo: { title: p.id, h1: p.id, description: p.id, lastModified: "2026-11-11" },
        }
      : { ...base, live: false };
  });
}
