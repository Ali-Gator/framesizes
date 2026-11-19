import { useEffect, useReducer } from "react";

import { GalleryWall } from "@/components/gallery-wall/gallery-wall";
import { framesOf } from "@/components/gallery-wall/state";
import { UnitToggle } from "@/components/site/unit-toggle";
import { useUnit } from "@/lib/unit";

import { boot } from "./boot";
import { OpenFull, SavedLine, WallSelect } from "./toolbar";
import { HangView } from "./try/hang-view";
import { SizeStep } from "./try/size-step";
import { chosenSize, startTry, tryReducer } from "./try/try-reducer";
import { useTry } from "./try/use-try";
import { useWall } from "./use-wall";

/**
 * The side panel: the toolbar over G1's planner at 360, on the wall saved on this device; or, while
 * a print from "Try on my wall" waits, the try. A step of G1's photo flow finishes first.
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-side-panel-holds-the-gallery-wall-planner}
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-a-try-waits-for-the-visitor}
 */
function Panel() {
  const wall = useWall();
  const trial = useTry();
  const unit = useUnit();
  // Lifted here: "Use my wall photo" shows G1's flow in its place and must not lose the try.
  const [t, sendT] = useReducer(tryReducer, startTry("", []));
  const record = trial.record;
  useEffect(() => {
    if (record) sendT({ type: "start", id: record.id, sizes: record.sizes });
  }, [record]);

  const { planner } = wall;
  const inFlow = planner.mode !== "sample" && planner.mode !== "photo";
  const live = wall.ready && record && t.id === record.id && !inFlow ? record : null;
  const size = live ? chosenSize(t, live.sizes, unit) : null;

  let body = null;
  if (live && t.step === "hang" && size) {
    body = (
      <HangView
        record={live}
        image={trial.image}
        state={t}
        dispatch={sendT}
        size={size}
        planner={planner}
        frames={framesOf(planner).length}
        hasPhoto={wall.hasPhoto}
        unit={unit}
        onAdd={(print) => {
          wall.addPrint(print, live.image);
          void trial.clear();
        }}
        onBack={() => void trial.clear()}
        onPhoto={() => wall.dispatch({ type: "upload" })}
      />
    );
  } else if (live) {
    body = <SizeStep record={live} image={trial.image} state={t} dispatch={sendT} unit={unit} />;
  } else if (wall.ready) {
    body = <GalleryWall variant="panel" state={planner} dispatch={wall.dispatch} />;
  }

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
      <main>{body}</main>
    </div>
  );
}

boot(<Panel />);
