import { GalleryWall } from "@/components/gallery-wall/gallery-wall";
import { UnitToggle } from "@/components/site/unit-toggle";

import { boot } from "./boot";
import { OpenFull, SavedLine, WallSelect } from "./toolbar";
import { useWall } from "./use-wall";

/**
 * The side panel: the toolbar over G1's planner at 360, on the wall saved on this device.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-side-panel-holds-the-gallery-wall-planner}
 */
function Panel() {
  const wall = useWall();
  return (
    <div className="x-panel">
      <header>
        <div className="x-ptool">
          <WallSelect value={wall.wall} onChange={wall.chooseWall} />
          <UnitToggle />
          <OpenFull />
        </div>
        {wall.hasPhoto ? <SavedLine text="Your wall is saved on this device" /> : null}
      </header>
      <main>
        {wall.ready ? (
          <GalleryWall variant="panel" state={wall.planner} dispatch={wall.dispatch} />
        ) : null}
      </main>
    </div>
  );
}

boot(<Panel />);
