import { ToolCard } from "@/components/ui/tool-card";
import { HUBS, livePages, PAGES, type PageId, type SitePage } from "@/lib/site-map";

/** Pages outside the Frames hub that the home page must link to once live. */
const CROSS_HUB: readonly PageId[] = ["P1", "PH1", "C1", "G1"];

/**
 * The live pages of the Frames hub and the required cross-hub pages, grouped by hub; nothing,
 * heading included, while none is live.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-page-links-only-to-live-pages}
 */
export function RelatedTools({ pages = PAGES }: { pages?: readonly SitePage[] }) {
  const related = livePages(pages).filter(
    (p) => p.id !== "F1" && (p.hub === "frames" || CROSS_HUB.includes(p.id as PageId)),
  );
  const groups = HUBS.map((hub) => ({
    hub,
    pages: related.filter((p) => p.hub === hub.id),
  })).filter((g) => g.pages.length);
  if (!groups.length) return null;
  return (
    <section className="flex flex-col gap-6">
      <h2 className="h2">Related tools</h2>
      <div className="flex flex-col">
        {groups.map(({ hub, pages: cards }) => (
          <div
            key={hub.id}
            className="flex flex-wrap gap-x-6 gap-y-4 border-t border-line py-6 last:border-b"
          >
            <h3 className="h3 flex-[0_0_180px]">{hub.name}</h3>
            <div className="fs-tools min-w-0 flex-[1_1_480px]">
              {cards.map((p) => (
                <ToolCard
                  key={p.id}
                  title={p.name}
                  question={p.card?.question}
                  href={p.path}
                  ratio={p.card?.ratio ?? [4, 5]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
