import { ar } from "./ar";
import { de } from "./de";
import { el } from "./el";
import { en, type ExtensionCopy } from "./en";
import { es } from "./es";
import { et } from "./et";
import { fi } from "./fi";
import { fr } from "./fr";
import { hi } from "./hi";
import { hr } from "./hr";
import { hu } from "./hu";
import { id } from "./id";
import { it } from "./it";
import { ja } from "./ja";
import { ko } from "./ko";
import { nl } from "./nl";
import { no } from "./no";
import { pl } from "./pl";
import { ptBr } from "./pt-br";
import { ptPt } from "./pt-pt";
import { ru } from "./ru";
import { sv } from "./sv";
import { th } from "./th";
import { tl } from "./tl";
import { tr } from "./tr";
import { uk } from "./uk";
import { vi } from "./vi";
import { zhHans } from "./zh-hans";

/**
 * Every language's dictionary, by URL code.
 * {@link openspec/specs/extension-site/spec.md#requirement-the-extension-page-exists-in-every-site-language}
 */
export const COPY: Readonly<Record<string, ExtensionCopy>> = {
  en,
  ar,
  de,
  el,
  es,
  et,
  fi,
  fr,
  hi,
  hr,
  hu,
  id,
  it,
  ja,
  ko,
  nl,
  no,
  pl,
  "pt-pt": ptPt,
  ru,
  sv,
  th,
  "pt-br": ptBr,
  tl,
  "zh-hans": zhHans,
  tr,
  uk,
  vi,
};
