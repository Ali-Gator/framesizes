import type { KnownId } from "@framesizes/sizes";

/** Which way a known thing is marked: across (left and right ends) or up (bottom and top). */
export type Direction = "across" | "up";

/** The scale steps' words for each known thing, from the approved canvas. */
export const KNOWN_COPY: Record<
  KnownId,
  {
    /** The thing in a sentence: "The door is 640 px long". */
    short: string;
    direction: Direction;
    /** Step 1's note under its length. */
    note: string;
    /** Step 2: where the two dots go. */
    place: string;
    /** Step 3's question and field label; a fixed length shows `fixed` instead. */
    question?: string;
    label?: string;
    hint?: { in: string; cm: string };
    fixed?: { in: string; cm: string };
  }
> = {
  wall: {
    short: "The wall",
    direction: "across",
    note: "you measure",
    place: "Drag the two dots to the wall's left and right corners.",
    question: "How wide is the wall?",
    label: "Wall width",
    hint: {
      in: "Measure it with a tape, corner to corner.",
      cm: "Measure it with a tape, corner to corner.",
    },
  },
  door: {
    short: "The door",
    direction: "up",
    note: "or type your own",
    place: "Drag the two dots to the bottom and the top of the door.",
    question: "How tall is the door?",
    label: "Door height",
    hint: {
      in: "Most US interior doors are 80 in (6 ft 8 in). Measure yours if you can.",
      cm: "Most interior doors in Europe are about 200 cm. Measure yours if you can.",
    },
  },
  sofa: {
    short: "The sofa",
    direction: "across",
    note: "measure yours",
    place: "Drag the two dots to the two ends of the sofa, along the top of its back.",
    question: "How wide is the sofa?",
    label: "Sofa width",
    hint: {
      in: "Sofa widths vary a lot. Measure yours: 84 in is only the sample sofa.",
      cm: "Sofa widths vary a lot. Measure yours: 213 cm is only the sample sofa.",
    },
  },
  bed: {
    short: "The bed",
    direction: "across",
    note: "or type your own",
    place: "Drag the two dots to the two sides of the mattress.",
    question: "How wide is the bed?",
    label: "Bed width",
    hint: {
      in: "A queen mattress is 60 in wide.",
      cm: "A European double mattress is 160 cm wide.",
    },
  },
  letter: {
    short: "The sheet",
    direction: "up",
    note: "fixed",
    place: "Drag the two dots to the two ends of the sheet's long edge.",
    fixed: {
      in: "A Letter sheet is 11 in on its long edge.",
      cm: "A Letter sheet is 27.9 cm on its long edge.",
    },
  },
  a4: {
    short: "The sheet",
    direction: "up",
    note: "fixed",
    place: "Drag the two dots to the two ends of the sheet's long edge.",
    fixed: {
      in: "An A4 sheet is 297 mm on its long edge.",
      cm: "An A4 sheet is 297 mm on its long edge.",
    },
  },
  card: {
    short: "The card",
    direction: "across",
    note: "fixed",
    place: "Drag the two dots to the two ends of the card's long edge.",
    fixed: {
      in: "A credit card is 85.6 mm on its long edge.",
      cm: "A credit card is 85.6 mm on its long edge.",
    },
  },
};

/** Step 1's length column for a fixed thing. */
export const FIXED_LENGTH: Partial<Record<KnownId, { in: string; cm: string }>> = {
  letter: { in: "11 in", cm: "27.9 cm" },
  a4: { in: "297 mm", cm: "297 mm" },
  card: { in: "85.6 mm", cm: "85.6 mm" },
};

/** "a 16x20", "an 8x10", "an 11x14", "an 18x24". */
export const withArticle = (size: string) => `${/^(8|11|18)\D/.test(size) ? "an" : "a"} ${size}`;
