import type { ExtensionCopy } from "./en";

export const fi = {
  seo: {
    title: "Gallery Wall Layout Generator -laajennus",
    h1: "Näin käytät Gallery Wall Layout Generatoria",
    description:
      "Näin käytät selainlaajennusta Gallery Wall Layout Generator: suunnittele tauluseinä sivupaneelissa tai kokeile kaupan julistetta seinälläsi oikeassa koossa.",
  },
  crumbs: { home: "Etusivu", hub: "Tauluseinä", page: "Selainlaajennus" },
  answer:
    "Avaa sivupaneeli ja suunnittele tauluseinä klikkaamalla laajennuksen painiketta Chromen työkalupalkissa. Klikkaa missä tahansa verkkokaupassa julistetta hiiren oikealla painikkeella ja valitse ”Try on my wall”, niin se ripustetaan seinällesi oikeassa koossa.",
  store: "Hae se Chrome Web Storesta",
  noButton: "Etkö näe painiketta?",
  showPin: "Näytä, miten se kiinnitetään",
  pin: {
    title: "Kiinnitä se työkalupalkkiin",
    text: "Chrome pitää uudet laajennukset palapelinpalan painikkeen takana. Klikkaa palapelinpalaa (1) Chromen oikeassa yläkulmassa ja sitten nastaa (2) kohdan Gallery Wall Layout Generator vieressä. Sen painike pysyy sen jälkeen työkalupalkissa.",
    picture:
      "Chromen työkalupalkki: numerolla 1 merkitty palapelinpalan painike avaa Laajennukset-valikon, ja nasta kohdan Gallery Wall Layout Generator vieressä on merkitty numerolla 2",
    pinned: "Jo kiinnitetty?",
    showUsage: "Näytä, miten sitä käytetään",
  },
  usage: "Mitä voit tehdä sivupaneelissa",
  steps: [
    {
      title: "Suunnittele tauluseinä",
      figure: "Viisi kehystä sohvan yläpuolella mallihuoneessa",
      text: "Valitse yksi viidestä mallista, aseta väli ja siirtele kehyksiä. Mallihuone toimii heti, oman seinän kuva vie minuutin.",
    },
    {
      title: "Kokeile julistetta kaupasta",
      figure: "Pikavalikko kaupan julisteen päällä, Try on my wall valittuna",
      text: "Klikkaa julistetta hiiren oikealla painikkeella, valitse ”Try on my wall” ja kaupan ilmoittama koko. Se roikkuu seinälläsi oikeassa koossa.",
    },
    {
      title: "Saa naulojen paikat",
      figure: "Viisi kehystä, joissa kussakin numeroitu naula",
      text: "Kirjoita, kuinka kaukana kehyksen yläreunasta ripustin on. Jokainen naula saa numeron ja paikan yhdestä kulmasta mitattuna.",
    },
  ],
  wall: {
    title: "Käytä omaa seinääsi",
    text: "Ota seinästä kuva suoraan edestä ja merkitse sitten yksi asia, jonka koon tiedät. Paneeli skaalaa kaiken sen mukaan:",
    items: [
      "seinän leveys",
      "ovi (Yhdysvalloissa {door} korkea)",
      "mittaamasi sohva tai sänky",
      "seinään teipattu Letter- tai A4-arkki",
      "luottokortti",
    ],
  },
  perm: {
    title: "Mitä laajennus näkee",
    rows: [
      {
        dt: "Pikavalikko",
        dd: "Lisää kohdan ”Try on my wall”, kun klikkaat kuvaa hiiren oikealla painikkeella.",
      },
      {
        dt: "Välilehti, jolla klikkaat",
        dd: "Lukee sivun kerran, kun valitset ”Try on my wall”: kuvan ja sen tekstissä olevat koot. Ei mitään muuta siltä sivustolta.",
      },
      {
        dt: "framesizes.app",
        dd: "Voi kysyä, onko laajennus asennettu ja kiinnitetty. Mitään muuta ei jaeta.",
      },
    ],
    tip: "Seinäsi kuva pysyy tällä tietokoneella.",
  },
  faq: {
    title: "Kysymyksiä",
    items: [
      {
        q: "Toimiiko se jokaisessa kaupassa?",
        a: "Millä tahansa sivulla, jonka kuvaa voi klikata hiiren oikealla painikkeella. Jos sivulla ei ole kokoa, kirjoita leveys ja korkeus itse.",
      },
      {
        q: "Miksi painike ei ole työkalupalkissani?",
        a: "Chrome laittaa uudet laajennukset palapelinpalan painikkeen taakse. Kiinnitä se kerran, niin se pysyy työkalupalkissa.",
      },
      {
        q: "Missä selaimissa se toimii?",
        a: "Chrome 116:ssa tai uudemmassa tai Microsoft Edge 116:ssa tai uudemmassa, tietokoneella. Se avautuu selaimen sivupaneeliin.",
      },
    ],
  },
  edge: {
    answer:
      "Avaa sivupaneeli ja suunnittele tauluseinä klikkaamalla laajennuksen painiketta Edgen työkalupalkissa. Klikkaa missä tahansa verkkokaupassa julistetta hiiren oikealla painikkeella ja valitse ”Try on my wall”, niin se ripustetaan seinällesi oikeassa koossa.",
    store: "Hae se Microsoft Edge Add-onsista",
    pin: {
      text: "Edge pitää uudet laajennukset palapelinpalan painikkeen takana. Klikkaa palapelinpalaa (1) Edgen oikeassa yläkulmassa ja sitten nastaa (2) kohdan Gallery Wall Layout Generator vieressä. Sen painike pysyy sen jälkeen työkalupalkissa.",
      picture:
        "Edgen työkalupalkki: numerolla 1 merkitty palapelinpalan painike avaa Laajennukset-valikon, ja nasta kohdan Gallery Wall Layout Generator vieressä on merkitty numerolla 2",
    },
    faqButton:
      "Edge laittaa uudet laajennukset palapelinpalan painikkeen taakse. Kiinnitä se kerran, niin se pysyy työkalupalkissa.",
  },
  chrome: {
    extensions: "Laajennukset",
    noAccess: "Käyttöoikeutta ei tarvita",
    noAccessLines: ["Näiden laajennusten ei tarvitse nähdä", "tai muokata sivuston tietoja."],
    manage: "Hallinnoi laajennuksia",
    copyImage: "Kopioi kuva",
    inspect: "Tarkista",
  },
} satisfies ExtensionCopy;
