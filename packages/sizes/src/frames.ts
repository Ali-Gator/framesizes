import type { Size } from "./units";

export type Orientation = "portrait" | "landscape" | "square";

interface Entry {
  w: number;
  h: number;
  /** What the size is usually framed for, as a short phrase. */
  use: string;
  /** One of the six most common sizes. */
  common?: true;
  /** Labelled first in a comparison drawing. */
  major?: true;
  /** The image of the pre-cut mat most often sold for this frame; absent when no pairing is common. */
  mat?: Size;
}

/**
 * The US ready-made frame sizes in inches, stored upright: rectangular first, then square, each
 * by width and then height. Checked against the sources in `CHECK`; the evidence is in the
 * archived t2-frame-size-chart change (`verification.md`).
 * {@link openspec/specs/size-engine/spec.md#requirement-the-catalog-lists-the-us-ready-made-frame-sizes}
 */
const ENTRIES: readonly Entry[] = [
  { w: 4, h: 6, use: "Snapshots and postcards", common: true },
  {
    w: 5,
    h: 7,
    use: "Desk photos and greeting cards",
    common: true,
    major: true,
    mat: { w: 4, h: 6 },
  },
  {
    w: 8,
    h: 10,
    use: "Portraits and certificates",
    common: true,
    major: true,
    mat: { w: 5, h: 7 },
  },
  { w: 8.5, h: 11, use: "Letter-size documents and diplomas" },
  {
    w: 11,
    h: 14,
    use: "Wall portraits and small art prints",
    common: true,
    major: true,
    mat: { w: 8, h: 10 },
  },
  { w: 11, h: 17, use: "Tabloid prints and small posters", mat: { w: 8, h: 12 } },
  { w: 12, h: 16, use: "Art prints", mat: { w: 8.5, h: 11 } },
  { w: 12, h: 18, use: "Posters and photo enlargements", mat: { w: 11, h: 17 } },
  {
    w: 16,
    h: 20,
    use: "Art prints and small posters",
    common: true,
    major: true,
    mat: { w: 11, h: 14 },
  },
  { w: 18, h: 24, use: "Medium posters and art prints", mat: { w: 16, h: 20 } },
  { w: 20, h: 24, use: "Large portraits", mat: { w: 16, h: 20 } },
  { w: 20, h: 30, use: "Large photo prints" },
  { w: 24, h: 36, use: "Large posters", common: true, major: true, mat: { w: 20, h: 30 } },
  { w: 27, h: 40, use: "Movie posters" },
  { w: 8, h: 8, use: "Square photo prints", mat: { w: 4, h: 4 } },
  { w: 10, h: 10, use: "Small square art", mat: { w: 8, h: 8 } },
  { w: 12, h: 12, use: "Scrapbook pages and square prints", mat: { w: 8, h: 8 } },
  { w: 16, h: 16, use: "Square art prints", mat: { w: 12, h: 12 } },
  { w: 20, h: 20, use: "Large square art", mat: { w: 16, h: 16 } },
];

/** A catalog size in one orientation. `id` is `<width>x<height>` as shown, so `10x8` is a landscape 8x10. */
export interface Frame extends Size {
  id: string;
  orientation: Orientation;
  use: string;
  common: boolean;
  major: boolean;
  /** Turned with the frame; `null` when no mat pairing is common. */
  mat: Size | null;
}

const idOf = ({ w, h }: Size) => `${w}x${h}`;

function orient(entry: Entry, orientation: Orientation): Frame {
  const turn = orientation === "landscape";
  const size = turn ? { w: entry.h, h: entry.w } : { w: entry.w, h: entry.h };
  const mat = entry.mat ? (turn ? { w: entry.mat.h, h: entry.mat.w } : { ...entry.mat }) : null;
  return {
    ...size,
    id: idOf(size),
    orientation,
    use: entry.use,
    common: !!entry.common,
    major: !!entry.major,
    mat,
  };
}

/** The catalog as stored (upright). */
export const CATALOG: readonly Frame[] = ENTRIES.map((e) =>
  orient(e, e.w === e.h ? "square" : "portrait"),
);

const LISTS: Record<Orientation, readonly Frame[]> = {
  portrait: CATALOG.filter((f) => f.orientation === "portrait"),
  landscape: ENTRIES.filter((e) => e.w !== e.h).map((e) => orient(e, "landscape")),
  square: CATALOG.filter((f) => f.orientation === "square"),
};

/**
 * The sizes of one orientation, in catalog order.
 * {@link openspec/specs/size-engine/spec.md#requirement-a-size-can-be-listed-and-found-in-any-orientation}
 */
export function framesFor(orientation: Orientation): readonly Frame[] {
  return LISTS[orientation];
}

/** A size from its oriented id, or `undefined` for an id outside the catalog. */
export function findFrame(id: string): Frame | undefined {
  for (const list of Object.values(LISTS)) {
    const found = list.find((f) => f.id === id);
    if (found) return found;
  }
  return undefined;
}

/** The six most common sizes, portrait. */
export function commonFrames(): readonly Frame[] {
  return LISTS.portrait.filter((f) => f.common);
}

/**
 * The first later entry of `frame`'s list that is at least as wide and as tall (11x17 skips the
 * shorter 12x16); `undefined` when there is none.
 * {@link openspec/specs/size-engine/spec.md#requirement-the-next-size-up-follows-the-list}
 */
export function nextSizeUp(frame: Frame): Frame | undefined {
  const list = LISTS[frame.orientation];
  const index = list.findIndex((f) => f.id === frame.id);
  if (index < 0) return undefined;
  return list.slice(index + 1).find((f) => f.w >= frame.w && f.h >= frame.h);
}

/** The example moulding width and the mat's overlap on each side of the image, in inches. */
export const MOULDING = 1;
export const MAT_OVERLAP = 0.25;

export interface Anatomy {
  outside: Size;
  frame: Size;
  matOpening: Size;
  image: Size;
}

/**
 * The four measurements of a framed image with a mat.
 * {@link openspec/specs/size-engine/spec.md#requirement-frame-anatomy-is-computed-from-the-frame-and-the-image}
 */
export function frameAnatomy({
  frame,
  image,
  moulding = MOULDING,
  overlap = MAT_OVERLAP,
}: {
  frame: Size;
  image: Size;
  moulding?: number;
  overlap?: number;
}): Anatomy {
  return {
    outside: { w: frame.w + 2 * moulding, h: frame.h + 2 * moulding },
    frame: { ...frame },
    matOpening: { w: image.w - 2 * overlap, h: image.h - 2 * overlap },
    image: { ...image },
  };
}

/**
 * When the size data was last checked, and against what. Changes in the same commit as the data.
 * {@link openspec/specs/size-engine/spec.md#requirement-the-catalog-says-when-and-against-what-it-was-checked}
 */
export const CHECK = {
  date: "2026-11-11",
  sources: [
    {
      name: "Target",
      url: "https://www.target.com/c/picture-frames-shadow-boxes-home-decor/-/N-5xttn",
    },
    { name: "Walmart", url: "https://www.walmart.com/search?q=picture+frames" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=picture+frame" },
  ],
} as const;
