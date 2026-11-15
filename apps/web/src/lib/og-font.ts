import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Schibsted Grotesk ExtraBold for the social images: next/font cannot feed ImageResponse, which
 * needs a static TTF (licence: OFL.txt beside it). Read from `process.cwd()` as the Next docs do;
 * the images are prerendered from `apps/web` (BL-9).
 * {@link openspec/specs/seo-base/spec.md#requirement-each-page-sends-the-nine-social-tags-with-its-own-image}
 */
export const ogFonts = [
  {
    name: "Schibsted Grotesk",
    data: await readFile(join(process.cwd(), "src/assets/fonts/SchibstedGrotesk-ExtraBold.ttf")),
    weight: 800 as const,
    style: "normal" as const,
  },
];
