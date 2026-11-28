import { builtPage, HUBS } from "@/lib/site-map";

const X1 = builtPage("X1");
const HUB = HUBS.find((h) => h.id === X1.hub);

/**
 * The extension page's visitor-facing text, in English. Every other language is a
 * `copy/<code>.ts` with `satisfies ExtensionCopy`, so a missing or extra key fails `tsc`.
 *
 * Tokens inside a sentence: `Gallery Wall Layout Generator` is the extension's name and `Try on my wall` its right-click label,
 * both kept in English and marked `lang="en"`; `{door}` is the door height in the visitor's unit.
 * Quotation marks around `Try on my wall` belong to the language.
 *
 * `chrome` holds Chrome's own labels, drawn in the pin picture and the right-click figure. Each
 * translation copies them from Chromium's `chrome/app/resources/generated_resources_<lang>.xtb`,
 * by message id (Chromium main, read 2026-11-20; Norwegian from `_no`, Filipino from `_fil`,
 * Chinese from `_zh-CN`; the English text in brackets):
 * - `extensions`: 6786747875388722282 ("Extensions", the Extensions menu's title)
 * - `noAccess`: 6241844896329831164 ("No access needed")
 * - `noAccessLines`: 4046013316139505482 ("These extensions don't need to see and change
 *   information on this site."), broken by hand into two lines that fit the menu
 * - `manage`: 8137559199583651773 ("Manage extensions")
 * - `copyImage`: 6518014396551869914 ("Cop&y image", the context menu item; mnemonic dropped)
 * - `inspect`: 998747458861718449 ("I&nspect", the context menu item; mnemonic dropped)
 *
 * `edge` holds the lines that differ for Microsoft Edge (`ByStore`); every other line is shared.
 * Edge's own menu labels are not here: they stay English in every language (`EDGE_LABELS`,
 * pin-picture.tsx), checked in Edge 158 on 2026-11-28.
 *
 * {@link openspec/specs/extension-site/spec.md#requirement-the-extension-page-exists-in-every-site-language}
 * {@link openspec/specs/extension-site/spec.md#requirement-the-drawings-use-chromes-own-labels-in-the-pages-language}
 */
export const en = {
  seo: { title: X1.seo.title, h1: X1.seo.h1, description: X1.seo.description },
  /** By position in the trail: Home, the hub head, this page. */
  crumbs: { home: "Home", hub: HUB?.name ?? "", page: X1.name },
  answer:
    "Click the extension's button in Chrome's toolbar to open the side panel and plan a gallery wall. On any shop, right-click a print and pick “Try on my wall” to hang it on your wall at true size.",
  store: "Get it from the Chrome Web Store",
  noButton: "Don't see the button?",
  showPin: "Show how to pin it",
  pin: {
    title: "Pin it to your toolbar",
    text: "Chrome keeps new extensions behind the puzzle-piece button. Click the puzzle piece (1) at the top right of Chrome, then the pin (2) next to Gallery Wall Layout Generator. Its button then stays in the toolbar.",
    picture:
      "Chrome's toolbar: the puzzle-piece button, marked 1, opens the Extensions menu, and the pin next to Gallery Wall Layout Generator is marked 2",
    pinned: "Already pinned?",
    showUsage: "See how to use it",
  },
  usage: "What you can do in the side panel",
  steps: [
    {
      title: "Plan a gallery wall",
      figure: "Five frames above a sofa in the sample room",
      text: "Pick one of five templates, set the gap and move the frames around. The sample room works right away; your own wall photo takes a minute.",
    },
    {
      title: "Try a print from a shop",
      figure: "The right-click menu on a shop's print, with Try on my wall picked",
      text: "Right-click a print, pick “Try on my wall” and choose the size the shop lists. It hangs on your wall at true size.",
    },
    {
      title: "Get the nail marks",
      figure: "Five frames with a numbered nail in each",
      text: "Type how far the hanger sits below the top of the frame. Every nail gets a number and a spot, measured from one corner.",
    },
  ],
  wall: {
    title: "Use your own wall",
    text: "Take a photo of the wall straight on, then mark one thing you know the size of. The panel scales everything from it:",
    items: [
      "the wall's width",
      "a door ({door} tall in the US)",
      "a sofa or a bed you've measured",
      "a Letter or A4 sheet taped to the wall",
      "a credit card",
    ],
  },
  perm: {
    title: "What the extension can see",
    rows: [
      { dt: "Right-click menu", dd: "Adds “Try on my wall” when you right-click an image." },
      {
        dt: "The tab you click in",
        dd: "It reads that page once, when you pick “Try on my wall”: the image and any sizes in its text. Nothing else on that site.",
      },
      {
        dt: "framesizes.app",
        dd: "Can ask whether the extension is installed and pinned. Nothing else is shared.",
      },
    ],
    tip: "Your wall photo stays on this computer.",
  },
  faq: {
    title: "Questions",
    items: [
      {
        q: "Does it work on every shop?",
        a: "On any page with an image you can right-click. If the page lists no size, type the width and height yourself.",
      },
      {
        q: "Why isn't the button in my toolbar?",
        a: "Chrome puts new extensions behind the puzzle-piece button. Pin it once and it stays in the toolbar.",
      },
      {
        q: "Which browsers does it run on?",
        a: "Chrome 116 or newer, or Microsoft Edge 116 or newer, on a computer. It opens in the browser's side panel.",
      },
    ],
  },
  edge: {
    answer:
      "Click the extension's button in Edge's toolbar to open the side panel and plan a gallery wall. On any shop, right-click a print and pick “Try on my wall” to hang it on your wall at true size.",
    store: "Get it from Microsoft Edge Add-ons",
    pin: {
      text: "Edge keeps new extensions behind the puzzle-piece button. Click the puzzle piece (1) at the top right of Edge, then the pin (2) next to Gallery Wall Layout Generator. Its button then stays in the toolbar.",
      picture:
        "Edge's toolbar: the puzzle-piece button, marked 1, opens the Extensions menu, and the pin next to Gallery Wall Layout Generator is marked 2",
    },
    faqButton:
      "Edge puts new extensions behind the puzzle-piece button. Pin it once and it stays in the toolbar.",
  },
  chrome: {
    extensions: "Extensions",
    noAccess: "No access needed",
    noAccessLines: ["These extensions don't need to see and change", "information on this site."],
    manage: "Manage extensions",
    copyImage: "Copy image",
    inspect: "Inspect",
  },
};

export type ExtensionCopy = typeof en;
export type ChromeLabels = ExtensionCopy["chrome"];
