import { TRANSLATED_LOCALES } from "@/lib/locales";

/**
 * The English social image: its text is the product's English name, and the OG font has no glyphs
 * for most of the other scripts. The alt stays English (backlog: translated OG alt). Built once per
 * declared language, like the page; any other code answers 404.
 */
export {
  alt,
  contentType,
  default,
  size,
} from "../../../extensions/gallery-wall-layout-generator/opengraph-image";

export const dynamicParams = false;
export const generateStaticParams = () => TRANSLATED_LOCALES.map((l) => ({ locale: l.code }));
