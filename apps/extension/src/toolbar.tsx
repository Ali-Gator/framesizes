import { useId } from "react";

/*
 * The panel toolbar's and the tab bar's parts, from the T23 canvas (PanelHead, board h).
 * {@link openspec/specs/gallery-wall-extension/spec.md#requirement-the-panel-toolbar-holds-the-wall-the-units-and-open-full-size}
 */

/** The native "Wall" select: the sample room or the saved wall photo. */
export function WallSelect({
  value,
  onChange,
}: {
  value: "sample" | "photo";
  onChange: (value: "sample" | "photo") => void;
}) {
  const id = useId();
  return (
    <div className="x-wallsel">
      <label htmlFor={id} className="fs-sr">
        Wall
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value === "photo" ? "photo" : "sample")}
      >
        <option value="sample">Sample room</option>
        <option value="photo">My wall photo</option>
      </select>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 9l6 6 6-6" strokeLinecap="round" />
      </svg>
    </div>
  );
}

const Check = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/** The saved line under the panel toolbar, or beside the tab's title. */
export const SavedLine = ({ text }: { text: string }) => (
  <p className="x-saved">
    <Check />
    {text}
  </p>
);

/** "Open full size": the planner in the extension's own tab. */
export const OpenFull = () => (
  <button
    type="button"
    className="x-ibtn"
    aria-label="Open full size"
    title="Open full size"
    onClick={() => void chrome.tabs.create({ url: chrome.runtime.getURL("tab.html") })}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  </button>
);

/** Board k's mark, as the tab bar draws it. */
export const AppIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <rect width="64" height="64" rx="14" fill="#14181C" />
    <g fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinejoin="round">
      <rect x="13" y="13" width="38" height="38" />
      <rect x="13" y="27" width="24" height="24" />
    </g>
    <rect
      x="13"
      y="40"
      width="11"
      height="11"
      fill="#FFC21A"
      stroke="#FFFFFF"
      strokeWidth="4.5"
      strokeLinejoin="round"
    />
  </svg>
);
