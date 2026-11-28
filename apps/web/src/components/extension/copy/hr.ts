import type { ExtensionCopy } from "./en";

export const hr = {
  seo: {
    title: "Proširenje Gallery Wall Layout Generator",
    h1: "Kako koristiti Gallery Wall Layout Generator",
    description:
      "Kako koristiti proširenje preglednika Gallery Wall Layout Generator: isplanirajte zid u bočnoj ploči ili isprobajte poster iz trgovine u stvarnoj veličini.",
  },
  crumbs: { home: "Početna", hub: "Zid sa slikama", page: "Proširenje preglednika" },
  answer:
    "Kliknite gumb proširenja na alatnoj traci Chromea da biste otvorili bočnu ploču i isplanirali zid sa slikama. U bilo kojoj trgovini desnom tipkom miša kliknite poster i odaberite „Try on my wall” da biste ga objesili na svoj zid u stvarnoj veličini.",
  store: "Preuzmite ga iz Chrome web-trgovine",
  noButton: "Ne vidite gumb?",
  showPin: "Pogledajte kako ga prikvačiti",
  pin: {
    title: "Prikvačite ga na alatnu traku",
    text: "Chrome drži nova proširenja iza gumba s komadićem slagalice. Kliknite komadić slagalice (1) u gornjem desnom kutu Chromea, a zatim pribadaču (2) pokraj Gallery Wall Layout Generator. Njegov gumb tada ostaje na alatnoj traci.",
    picture:
      "Alatna traka Chromea: gumb s komadićem slagalice, označen brojem 1, otvara izbornik Proširenja, a pribadača pokraj Gallery Wall Layout Generator označena je brojem 2",
    pinned: "Već ste ga prikvačili?",
    showUsage: "Pogledajte kako ga koristiti",
  },
  usage: "Što možete raditi u bočnoj ploči",
  steps: [
    {
      title: "Isplanirajte zid sa slikama",
      figure: "Pet okvira iznad kauča u oglednoj sobi",
      text: "Odaberite jedan od pet predložaka, postavite razmak i pomičite okvire. Ogledna soba radi odmah, a fotografija vašeg zida traje minutu.",
    },
    {
      title: "Isprobajte poster iz trgovine",
      figure: "Kontekstni izbornik na posteru u trgovini, odabrano Try on my wall",
      text: "Desnom tipkom kliknite poster, odaberite „Try on my wall” i veličinu koju navodi trgovina. Visi na vašem zidu u stvarnoj veličini.",
    },
    {
      title: "Dobijte oznake za čavle",
      figure: "Pet okvira s numeriranim čavlom u svakom",
      text: "Upišite koliko je vješalica ispod gornjeg ruba okvira. Svaki čavao dobiva broj i mjesto, izmjereno od jednog kuta.",
    },
  ],
  wall: {
    title: "Koristite vlastiti zid",
    text: "Fotografirajte zid ravno sprijeda, a zatim označite jednu stvar čiju veličinu znate. Ploča prema njoj skalira sve ostalo:",
    items: [
      "širinu zida",
      "vrata (u SAD-u visoka {door})",
      "kauč ili krevet koji ste izmjerili",
      "list Letter ili A4 zalijepljen na zid",
      "kreditnu karticu",
    ],
  },
  perm: {
    title: "Što proširenje može vidjeti",
    rows: [
      {
        dt: "Kontekstni izbornik",
        dd: "Dodaje „Try on my wall” kada desnom tipkom kliknete sliku.",
      },
      {
        dt: "Kartica u kojoj kliknete",
        dd: "Čita tu stranicu jednom, kada odaberete „Try on my wall”: sliku i sve veličine u njezinu tekstu. Ništa drugo na toj web-lokaciji.",
      },
      {
        dt: "framesizes.app",
        dd: "Može pitati je li proširenje instalirano i prikvačeno. Ništa se drugo ne dijeli.",
      },
    ],
    tip: "Fotografija vašeg zida ostaje na ovom računalu.",
  },
  faq: {
    title: "Pitanja",
    items: [
      {
        q: "Radi li u svakoj trgovini?",
        a: "Na svakoj stranici sa slikom koju možete kliknuti desnom tipkom. Ako stranica ne navodi veličinu, sami upišite širinu i visinu.",
      },
      {
        q: "Zašto gumb nije na mojoj alatnoj traci?",
        a: "Chrome stavlja nova proširenja iza gumba s komadićem slagalice. Prikvačite ga jednom i ostat će na alatnoj traci.",
      },
      {
        q: "U kojim preglednicima radi?",
        a: "U Chromeu 116 ili novijem ili u Microsoft Edgeu 116 ili novijem, na računalu. Otvara se u bočnoj ploči preglednika.",
      },
    ],
  },
  edge: {
    answer:
      "Kliknite gumb proširenja na alatnoj traci Edgea da biste otvorili bočnu ploču i isplanirali zid sa slikama. U bilo kojoj trgovini desnom tipkom miša kliknite poster i odaberite „Try on my wall” da biste ga objesili na svoj zid u stvarnoj veličini.",
    store: "Preuzmite ga s Microsoft Edge Add-ons",
    pin: {
      text: "Edge drži nova proširenja iza gumba s komadićem slagalice. Kliknite komadić slagalice (1) u gornjem desnom kutu Edgea, a zatim pribadaču (2) pokraj Gallery Wall Layout Generator. Njegov gumb tada ostaje na alatnoj traci.",
      picture:
        "Alatna traka Edgea: gumb s komadićem slagalice, označen brojem 1, otvara izbornik Proširenja, a pribadača pokraj Gallery Wall Layout Generator označena je brojem 2",
    },
    faqButton:
      "Edge stavlja nova proširenja iza gumba s komadićem slagalice. Prikvačite ga jednom i ostat će na alatnoj traci.",
  },
  chrome: {
    extensions: "Proširenja",
    noAccess: "Pristup nije potreban",
    noAccessLines: ["Proširenja ne mogu vidjeti ni mijenjati", "podatke na ovoj web-lokaciji."],
    manage: "Upravljanje proširenjima",
    copyImage: "Kopiraj sliku",
    inspect: "Provjeri",
  },
} satisfies ExtensionCopy;
