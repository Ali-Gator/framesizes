import { CHECK, feetAndInches, toWholeCm, WALL_HEIGHT } from "@framesizes/sizes";

import { IfLive } from "@/components/site/page-link";
import { Button } from "@/components/ui/button";
import { page } from "@/lib/site-map";

const checked = new Date(`${CHECK.date}T00:00:00Z`).toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const sources = CHECK.sources.map((s) => s.name);
const sourceList = `${sources.slice(0, -1).join(", ")} and ${sources.at(-1)}`;

/**
 * The widget's proof line: the drawn wall, where the sizes come from, when they were checked.
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-page-says-where-its-sizes-come-from}
 */
export function ChartFooter() {
  return (
    <>
      <span>
        The wall is drawn {feetAndInches(WALL_HEIGHT)} ({toWholeCm(WALL_HEIGHT)} cm) high. Sizes are
        the common US ready-made frame sizes at {sourceList}, last checked {checked}.
      </span>
      <IfLive page="F2">
        <Button variant="ghost" href={page("F2").path} arrow>
          See it on my wall
        </Button>
      </IfLive>
    </>
  );
}
