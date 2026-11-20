import type { ExtensionCopy } from "./en";

export const sv = {
  seo: {
    title: "Gallery Wall Layout Generator för Chrome",
    h1: "Så använder du Gallery Wall Layout Generator",
    description:
      "Så använder du Chrome-tillägget Gallery Wall Layout Generator: planera en tavelvägg i sidopanelen eller prova en affisch från en butik i verklig storlek.",
  },
  crumbs: { home: "Start", hub: "Tavelvägg", page: "Chrome-tillägg" },
  answer:
    "Klicka på tilläggets knapp i Chromes verktygsfält för att öppna sidopanelen och planera en tavelvägg. Högerklicka på en affisch i valfri webbutik och välj ”Try on my wall” för att hänga den på din vägg i verklig storlek.",
  store: "Hämta det i Chrome Web Store",
  noButton: "Ser du inte knappen?",
  showPin: "Visa hur du fäster den",
  pin: {
    title: "Fäst den i verktygsfältet",
    text: "Chrome lägger nya tillägg bakom pusselbitsknappen. Klicka på pusselbiten (1) uppe till höger i Chrome och sedan på nålen (2) bredvid Gallery Wall Layout Generator. Knappen ligger sedan kvar i verktygsfältet.",
    picture:
      "Chromes verktygsfält: pusselbitsknappen, markerad med 1, öppnar menyn Tillägg, och nålen bredvid Gallery Wall Layout Generator är markerad med 2",
    pinned: "Redan fäst?",
    showUsage: "Visa hur du använder det",
  },
  usage: "Det här kan du göra i sidopanelen",
  steps: [
    {
      title: "Planera en tavelvägg",
      figure: "Fem ramar ovanför en soffa i exempelrummet",
      text: "Välj en av fem mallar, ställ in mellanrummet och flytta runt ramarna. Exempelrummet fungerar direkt; ett foto av din egen vägg tar en minut.",
    },
    {
      title: "Prova en affisch från en butik",
      figure: "Högerklicksmenyn på en affisch i en butik, med Try on my wall valt",
      text: "Högerklicka på en affisch, välj ”Try on my wall” och välj storleken som butiken anger. Den hänger på din vägg i verklig storlek.",
    },
    {
      title: "Få spikmarkeringarna",
      figure: "Fem ramar med en numrerad spik i varje",
      text: "Skriv hur långt under ramens överkant upphängningen sitter. Varje spik får ett nummer och en punkt, mätt från ett hörn.",
    },
  ],
  wall: {
    title: "Använd din egen vägg",
    text: "Fotografera väggen rakt framifrån och markera sedan en sak du vet storleken på. Panelen skalar allt efter den:",
    items: [
      "väggens bredd",
      "en dörr ({door} hög i USA)",
      "en soffa eller säng du har mätt",
      "ett Letter- eller A4-ark tejpat på väggen",
      "ett bankkort",
    ],
  },
  perm: {
    title: "Det här kan tillägget se",
    rows: [
      {
        dt: "Högerklicksmeny",
        dd: "Lägger till ”Try on my wall” när du högerklickar på en bild.",
      },
      {
        dt: "Fliken du klickar i",
        dd: "Läser sidan en gång, när du väljer ”Try on my wall”: bilden och eventuella storlekar i texten. Inget annat på den webbplatsen.",
      },
      {
        dt: "framesizes.app",
        dd: "Kan fråga om tillägget är installerat och fäst. Inget annat delas.",
      },
    ],
    tip: "Fotot av din vägg stannar på den här datorn.",
  },
  faq: {
    title: "Frågor",
    items: [
      {
        q: "Fungerar det i alla butiker?",
        a: "På alla sidor med en bild du kan högerklicka på. Om sidan inte anger någon storlek skriver du in bredd och höjd själv.",
      },
      {
        q: "Varför finns inte knappen i mitt verktygsfält?",
        a: "Chrome lägger nya tillägg bakom pusselbitsknappen. Fäst den en gång så ligger den kvar i verktygsfältet.",
      },
      {
        q: "Vilka webbläsare fungerar det i?",
        a: "Chrome 116 eller senare, på en dator. Det öppnas i Chromes sidopanel.",
      },
    ],
  },
  chrome: {
    extensions: "Tillägg",
    noAccess: "Ingen åtkomst krävs",
    noAccessLines: [
      "De här tilläggen behöver inte se och ändra",
      "information på den här webbplatsen.",
    ],
    manage: "Hantera tillägg",
    copyImage: "Kopiera bild",
    inspect: "Inspektera",
  },
} satisfies ExtensionCopy;
