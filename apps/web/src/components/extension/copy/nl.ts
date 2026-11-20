import type { ExtensionCopy } from "./en";

export const nl = {
  seo: {
    title: "Gallery Wall Layout Generator voor Chrome",
    h1: "Zo gebruik je Gallery Wall Layout Generator",
    description:
      "Zo gebruik je de Chrome-extensie Gallery Wall Layout Generator: plan een wand in het zijpaneel of probeer een poster uit een webshop op ware grootte.",
  },
  crumbs: { home: "Home", hub: "Fotowand", page: "Chrome-extensie" },
  answer:
    "Klik op de knop van de extensie in de werkbalk van Chrome om het zijpaneel te openen en een fotowand te plannen. Klik in een willekeurige webshop met de rechtermuisknop op een poster en kies ‘Try on my wall’ om hem op ware grootte aan je muur te hangen.",
  store: "Download in de Chrome Web Store",
  noButton: "Zie je de knop niet?",
  showPin: "Bekijk hoe je hem vastzet",
  pin: {
    title: "Zet hem vast in de werkbalk",
    text: "Chrome bewaart nieuwe extensies achter de puzzelstukknop. Klik rechtsboven in Chrome op het puzzelstuk (1) en daarna op de punaise (2) naast Gallery Wall Layout Generator. De knop blijft dan in de werkbalk staan.",
    picture:
      "De werkbalk van Chrome: de puzzelstukknop, gemarkeerd met 1, opent het menu Extensies, en de punaise naast Gallery Wall Layout Generator is gemarkeerd met 2",
    pinned: "Al vastgezet?",
    showUsage: "Bekijk hoe je hem gebruikt",
  },
  usage: "Wat je in het zijpaneel kunt doen",
  steps: [
    {
      title: "Plan een fotowand",
      figure: "Vijf lijsten boven een bank in de voorbeeldkamer",
      text: "Kies een van de vijf sjablonen, stel de tussenruimte in en verschuif de lijsten. De voorbeeldkamer werkt meteen; een foto van je eigen muur kost een minuut.",
    },
    {
      title: "Probeer een poster uit een webshop",
      figure: "Het rechtsklikmenu op een poster in een webshop, met Try on my wall gekozen",
      text: "Klik met de rechtermuisknop op een poster, kies ‘Try on my wall’ en kies het formaat dat de webshop noemt. Hij hangt op ware grootte aan je muur.",
    },
    {
      title: "Krijg de spijkerpunten",
      figure: "Vijf lijsten met in elke lijst een genummerde spijker",
      text: "Typ hoe ver het ophangoog onder de bovenrand van de lijst zit. Elke spijker krijgt een nummer en een plek, gemeten vanaf één hoek.",
    },
  ],
  wall: {
    title: "Gebruik je eigen muur",
    text: "Maak recht van voren een foto van de muur en markeer dan één ding waarvan je de maat weet. Het paneel schaalt alles daarop:",
    items: [
      "de breedte van de muur",
      "een deur ({door} hoog in de VS)",
      "een bank of bed dat je hebt opgemeten",
      "een Letter- of A4-vel dat op de muur is geplakt",
      "een creditcard",
    ],
  },
  perm: {
    title: "Wat de extensie kan zien",
    rows: [
      {
        dt: "Rechtsklikmenu",
        dd: "Voegt ‘Try on my wall’ toe als je met de rechtermuisknop op een afbeelding klikt.",
      },
      {
        dt: "Het tabblad waarin je klikt",
        dd: "Leest die pagina één keer, als je ‘Try on my wall’ kiest: de afbeelding en eventuele maten in de tekst. Verder niets op die site.",
      },
      {
        dt: "framesizes.app",
        dd: "Kan vragen of de extensie is geïnstalleerd en vastgezet. Verder wordt er niets gedeeld.",
      },
    ],
    tip: "De foto van je muur blijft op deze computer.",
  },
  faq: {
    title: "Vragen",
    items: [
      {
        q: "Werkt het in elke webshop?",
        a: "Op elke pagina met een afbeelding waarop je met de rechtermuisknop kunt klikken. Staat er geen maat op de pagina, typ dan zelf de breedte en hoogte.",
      },
      {
        q: "Waarom staat de knop niet in mijn werkbalk?",
        a: "Chrome zet nieuwe extensies achter de puzzelstukknop. Zet hem één keer vast en hij blijft in de werkbalk.",
      },
      {
        q: "In welke browsers werkt het?",
        a: "In Chrome 116 of nieuwer, op een computer. Het opent in het zijpaneel van Chrome.",
      },
    ],
  },
  chrome: {
    extensions: "Extensies",
    noAccess: "Geen toegang vereist",
    noAccessLines: [
      "Deze extensies hoeven geen informatie op deze site",
      "te bekijken en te wijzigen.",
    ],
    manage: "Extensies beheren",
    copyImage: "Afbeelding kopiëren",
    inspect: "Inspecteren",
  },
} satisfies ExtensionCopy;
