// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";

import { SegmentedControl } from "../segmented-control";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Mat({ room }: { room: boolean }) {
  const [value, setValue] = useState<"no" | "yes">("no");
  return (
    <>
      <SegmentedControl
        label="Mat"
        value={value}
        onChange={setValue}
        options={[
          { value: "no", label: "No mat" },
          { value: "yes", label: "Mat", disabled: !room, describedBy: room ? undefined : "why" },
        ]}
      />
      <p id="why">A 4x6 has no room for a mat.</p>
    </>
  );
}

function mount(room: boolean) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(<Mat room={room} />));
  const radios = [...host.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
  const press = (key: string) =>
    act(() => {
      radios[0]?.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    });
  return { radios, press, root };
}

/** {@link openspec/specs/frame-mockup/spec.md#scenario-4x6-picked} */
it("disables an option, describes it, and skips it with the arrow keys", () => {
  const { radios, press, root } = mount(false);
  const mat = radios[1];
  expect(mat?.disabled).toBe(true);
  expect(mat?.getAttribute("aria-describedby")).toBe("why");
  press("ArrowRight");
  press("ArrowLeft");
  expect(radios[0]?.getAttribute("aria-checked")).toBe("true");
  expect(mat?.getAttribute("aria-checked")).toBe("false");
  act(() => root.unmount());
});

/** {@link openspec/specs/frame-mockup/spec.md#requirement-the-mat-switch-keeps-the-size} */
it("moves to an enabled option as before", () => {
  const { radios, press, root } = mount(true);
  expect(radios[1]?.disabled).toBe(false);
  expect(radios[1]?.hasAttribute("aria-describedby")).toBe(false);
  press("ArrowRight");
  expect(radios[1]?.getAttribute("aria-checked")).toBe("true");
  act(() => root.unmount());
});
