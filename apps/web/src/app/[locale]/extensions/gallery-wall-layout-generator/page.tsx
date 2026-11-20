import { notFound } from "next/navigation";

import { COPY } from "@/components/extension/copy";
import { ExtensionHowTo } from "@/components/extension/how-to";
import { TRANSLATED_LOCALES } from "@/lib/locales";
import { localizedMetadata } from "@/lib/seo";
import { builtPage } from "@/lib/site-map";

import "../../../extensions/gallery-wall-layout-generator/extension.css";

const X1 = builtPage("X1");

type Props = { params: Promise<{ locale: string }> };

/** Only the declared languages are built; `/en/…` and any other code answer 404. */
export const dynamicParams = false;
export const generateStaticParams = () => TRANSLATED_LOCALES.map((l) => ({ locale: l.code }));

/** {@link openspec/specs/seo-base/spec.md#requirement-a-translated-version-takes-its-head-values-from-its-translation} */
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const copy = COPY[locale];
  if (!copy) notFound();
  return localizedMetadata(X1, locale, copy.seo);
}

/**
 * X1 in one of the 27 other languages, at `/<code>/extensions/gallery-wall-layout-generator`.
 * {@link openspec/specs/localization/spec.md#requirement-a-translated-page-lives-under-its-language-code}
 * {@link openspec/specs/extension-site/spec.md#requirement-the-extension-page-exists-in-every-site-language}
 */
export default async function LocalizedExtensionPage({ params }: Props) {
  const { locale } = await params;
  const copy = COPY[locale];
  if (!copy) notFound();
  return <ExtensionHowTo copy={copy} locale={locale} />;
}
