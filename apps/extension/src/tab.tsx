import { GalleryWall } from "@/components/gallery-wall/gallery-wall";
import { UnitToggle } from "@/components/site/unit-toggle";

import { boot } from "./boot";
import { AppIcon, SavedLine, WallSelect } from "./toolbar";
import { useWall } from "./use-wall";

/**
 * "Open full size": G1's desktop widget in the extension's own tab, on the same saved wall.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-open-full-size-opens-the-planner-in-its-own-tab}
 */
function Tab() {
  const wall = useWall();
  return (
    <div className="x-tab">
      <header className="x-tabbar">
        <AppIcon />
        <h1>Gallery Wall Layout Generator</h1>
        <SavedLine text="Saved on this device" />
        <WallSelect value={wall.wall} onChange={wall.chooseWall} />
        <UnitToggle />
      </header>
      <main className="x-tabmain">
        {wall.ready ? (
          <GalleryWall variant="tab" state={wall.planner} dispatch={wall.dispatch} />
        ) : null}
      </main>
    </div>
  );
}

boot(<Tab />);
