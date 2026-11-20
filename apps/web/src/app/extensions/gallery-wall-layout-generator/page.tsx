import { en } from "@/components/extension/copy/en";
import { ExtensionHowTo } from "@/components/extension/how-to";
import { pageMetadata } from "@/lib/seo";
import { builtPage } from "@/lib/site-map";

import "./extension.css";

export const metadata = pageMetadata(builtPage("X1"));

/**
 * X1: the page the Chrome extension opens after install, in English. Its body is `ExtensionHowTo`,
 * shared with the translated versions under `[locale]`.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-extension-pages-server-html-is-the-how-to}
 */
export default function ExtensionPage() {
  return <ExtensionHowTo copy={en} locale="en" />;
}
