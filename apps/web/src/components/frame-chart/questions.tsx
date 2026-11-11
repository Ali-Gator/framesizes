import { CATALOG, commonFrames, writeSize } from "@framesizes/sizes";

import { FAQ } from "@/components/ui/faq";

/** "a, b, c and d" */
const list = (items: readonly string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

const common = commonFrames();
const commonIds = list(common.map((f) => f.id));
const commonCm = list(common.map((f) => writeSize(f, "cm").replace(" cm", "")));
/** The frame whose usual mat holds an 8x10 photo. */
const for8x10 = CATALOG.find((f) => f.mat?.w === 8 && f.mat.h === 10);
const photoSizes = list(common.slice(0, 3).map((f) => f.id));

const ITEMS = [
  {
    q: "What are the standard picture frame sizes?",
    a: (
      <p>
        The standard US picture frame sizes are {commonIds} inches. Ready-made frames come in these
        sizes, so a print in one of them needs no custom framing.
      </p>
    ),
  },
  {
    q: "What size frame do I need for an 8x10 photo?",
    a: (
      <p>
        An 8x10 frame holds it edge to edge. For a mat border, use a {for8x10?.id} frame with a mat
        cut for an 8x10 photo.
      </p>
    ),
  },
  {
    q: "What are the standard photo frame sizes?",
    a: (
      <p>
        Photo frames use the same sizes as other picture frames. The usual ones for photos are{" "}
        {photoSizes} inches, because they match the standard photo print sizes.
      </p>
    ),
  },
  {
    q: "Is a frame size the inside or the outside?",
    a: (
      <p>
        The inside. The size names the print the frame holds. The outside is larger by the width of
        the moulding on each side, and the visible opening is slightly smaller than the print
        because the frame&apos;s lip covers its edge.
      </p>
    ),
  },
  {
    q: "What are the standard frame sizes in cm?",
    a: (
      <p>
        The six common US sizes are {commonCm} cm. Frames sold in metric countries use other sizes:
        A4 (21 × 29.7 cm), A3 (29.7 × 42 cm), 30 × 40, 50 × 70 and 70 × 100 cm.
      </p>
    ),
  },
];

/**
 * {@link openspec/specs/frame-size-chart/spec.md#requirement-the-questions-are-answered-in-the-server-html}
 */
export function Questions() {
  return <FAQ items={ITEMS} />;
}
