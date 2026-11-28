import type { ExtensionCopy } from "./en";

export const et = {
  seo: {
    title: "Gallery Wall Layout Generatori laiendus",
    h1: "Kuidas kasutada Gallery Wall Layout Generatorit",
    description:
      "Kuidas kasutada brauserilaiendust Gallery Wall Layout Generator: planeerige seina külgpaneelil või proovige poe plakatit oma seinal päris suuruses.",
  },
  crumbs: { home: "Avaleht", hub: "Pildisein", page: "Brauserilaiendus" },
  answer:
    "Klõpsake Chrome'i tööriistaribal laienduse nuppu, et avada külgpaneel ja planeerida pildiseina. Paremklõpsake mis tahes poes plakatil ja valige „Try on my wall”, et riputada see päris suuruses oma seinale.",
  store: "Hankige see Chrome'i veebipoest",
  noButton: "Ei näe nuppu?",
  showPin: "Vaadake, kuidas see kinnitada",
  pin: {
    title: "Kinnitage see tööriistaribale",
    text: "Chrome hoiab uusi laiendusi pusletüki nupu taga. Klõpsake Chrome'i paremas ülanurgas pusletükil (1) ja seejärel nööpnõelal (2) laienduse Gallery Wall Layout Generator kõrval. Selle nupp jääb seejärel tööriistaribale.",
    picture:
      "Chrome'i tööriistariba: numbriga 1 tähistatud pusletüki nupp avab menüü Laiendused ja numbriga 2 on tähistatud nööpnõel laienduse Gallery Wall Layout Generator kõrval",
    pinned: "Juba kinnitatud?",
    showUsage: "Vaadake, kuidas seda kasutada",
  },
  usage: "Mida saate külgpaneelil teha",
  steps: [
    {
      title: "Planeerige pildisein",
      figure: "Viis raami diivani kohal näidistoas",
      text: "Valige üks viiest mallist, määrake vahe ja liigutage raame. Näidistuba töötab kohe, oma seina foto võtab minuti.",
    },
    {
      title: "Proovige poe plakatit",
      figure: "Paremklõpsumenüü poe plakatil, valitud Try on my wall",
      text: "Paremklõpsake plakatil, valige „Try on my wall” ja seejärel poes näidatud suurus. See ripub teie seinal päris suuruses.",
    },
    {
      title: "Saage naelte kohad",
      figure: "Viis raami, igaühes nummerdatud nael",
      text: "Sisestage, kui kaugel raami ülaservast riputusaas asub. Iga nael saab numbri ja koha, mõõdetuna ühest nurgast.",
    },
  ],
  wall: {
    title: "Kasutage oma seina",
    text: "Pildistage seina otse eestpoolt ja märkige siis üks asi, mille suurust teate. Paneel arvutab selle järgi kõige mõõtkava:",
    items: [
      "seina laius",
      "uks (USA-s {door} kõrge)",
      "diivan või voodi, mille olete mõõtnud",
      "seinale kleebitud Letter- või A4-leht",
      "pangakaart",
    ],
  },
  perm: {
    title: "Mida laiendus näeb",
    rows: [
      {
        dt: "Paremklõpsumenüü",
        dd: "Lisab valiku „Try on my wall”, kui paremklõpsate pildil.",
      },
      {
        dt: "Vahekaart, millel klõpsate",
        dd: "Loeb seda lehte üks kord, kui valite „Try on my wall”: pilti ja selle tekstis olevaid suurusi. Muud sellel saidil mitte midagi.",
      },
      {
        dt: "framesizes.app",
        dd: "Võib küsida, kas laiendus on installitud ja kinnitatud. Muud ei jagata.",
      },
    ],
    tip: "Teie seina foto jääb sellesse arvutisse.",
  },
  faq: {
    title: "Küsimused",
    items: [
      {
        q: "Kas see töötab igas poes?",
        a: "Igal lehel, kus on pilt, millel saate paremklõpsata. Kui leht suurust ei näita, sisestage laius ja kõrgus ise.",
      },
      {
        q: "Miks nuppu mu tööriistaribal pole?",
        a: "Chrome paneb uued laiendused pusletüki nupu taha. Kinnitage see üks kord ja see jääb tööriistaribale.",
      },
      {
        q: "Millistes brauserites see töötab?",
        a: "Chrome 116 või uuemas või Microsoft Edge 116 või uuemas, arvutis. See avaneb brauseri külgpaneelil.",
      },
    ],
  },
  edge: {
    answer:
      "Klõpsake Edge'i tööriistaribal laienduse nuppu, et avada külgpaneel ja planeerida pildiseina. Paremklõpsake mis tahes poes plakatil ja valige „Try on my wall”, et riputada see päris suuruses oma seinale.",
    store: "Hankige see lehelt Microsoft Edge Add-ons",
    pin: {
      text: "Edge hoiab uusi laiendusi pusletüki nupu taga. Klõpsake Edge'i paremas ülanurgas pusletükil (1) ja seejärel nööpnõelal (2) laienduse Gallery Wall Layout Generator kõrval. Selle nupp jääb seejärel tööriistaribale.",
      picture:
        "Edge'i tööriistariba: numbriga 1 tähistatud pusletüki nupp avab menüü Laiendused ja numbriga 2 on tähistatud nööpnõel laienduse Gallery Wall Layout Generator kõrval",
    },
    faqButton:
      "Edge paneb uued laiendused pusletüki nupu taha. Kinnitage see üks kord ja see jääb tööriistaribale.",
  },
  chrome: {
    extensions: "Laiendused",
    noAccess: "Juurdepääsu pole vaja",
    noAccessLines: [
      "Need laiendused ei pea sellel saidil olevat teavet",
      "nägema ega saama seda muuta.",
    ],
    manage: "Laienduste haldamine",
    copyImage: "Kopeeri pilt",
    inspect: "Inspekteeri",
  },
} satisfies ExtensionCopy;
