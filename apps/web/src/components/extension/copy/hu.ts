import type { ExtensionCopy } from "./en";

export const hu = {
  seo: {
    title: "Gallery Wall Layout Generator Chrome-hoz",
    h1: "A Gallery Wall Layout Generator használata",
    description:
      "Így használhatja a Gallery Wall Layout Generator Chrome-bővítményt: tervezzen falat az oldalpanelen, vagy próbáljon fel egy bolti posztert valódi méretben.",
  },
  crumbs: { home: "Főoldal", hub: "Képfal", page: "Chrome-bővítmény" },
  answer:
    "Kattintson a bővítmény gombjára a Chrome eszköztárán, hogy megnyissa az oldalpanelt és megtervezzen egy képfalat. Bármelyik webáruházban kattintson jobb gombbal egy poszterre, és válassza a „Try on my wall” lehetőséget, hogy valódi méretben a falára kerüljön.",
  store: "Töltse le a Chrome Internetes áruházból",
  noButton: "Nem látja a gombot?",
  showPin: "Mutassa, hogyan kell kitűzni",
  pin: {
    title: "Tűzze ki az eszköztárra",
    text: "A Chrome az új bővítményeket a puzzle-darab gomb mögött tartja. Kattintson a Chrome jobb felső sarkában a puzzle-darabra (1), majd a Gallery Wall Layout Generator melletti gombostűre (2). A gombja ezután az eszköztáron marad.",
    picture:
      "A Chrome eszköztára: az 1-gyel jelölt puzzle-darab gomb megnyitja a Bővítmények menüt, a Gallery Wall Layout Generator melletti gombostű pedig 2-vel van jelölve",
    pinned: "Már kitűzte?",
    showUsage: "Mutassa, hogyan kell használni",
  },
  usage: "Mit tehet az oldalpanelen",
  steps: [
    {
      title: "Tervezzen képfalat",
      figure: "Öt keret egy kanapé fölött a mintaszobában",
      text: "Válasszon az öt sablon közül, állítsa be a hézagot, és mozgassa a kereteket. A mintaszoba azonnal működik, a saját fala fotója egy percet vesz igénybe.",
    },
    {
      title: "Próbáljon ki egy bolti posztert",
      figure: "A jobb gombos menü egy bolti poszteren, a Try on my wall kiválasztva",
      text: "Kattintson jobb gombbal egy poszterre, válassza a „Try on my wall” lehetőséget és a bolt által megadott méretet. Valódi méretben jelenik meg a falán.",
    },
    {
      title: "Kapja meg a szögek helyét",
      figure: "Öt keret, mindegyikben egy számozott szög",
      text: "Adja meg, milyen messze van az akasztó a keret felső élétől. Minden szög kap egy számot és egy helyet, egy saroktól mérve.",
    },
  ],
  wall: {
    title: "Használja a saját falát",
    text: "Fényképezze le a falat egyenesen szemből, majd jelöljön meg rajta egy tárgyat, amelynek ismeri a méretét. A panel ehhez méretez mindent:",
    items: [
      "a fal szélessége",
      "egy ajtó (az USA-ban {door} magas)",
      "egy kanapé vagy ágy, amelyet lemért",
      "egy falra ragasztott Letter vagy A4 lap",
      "egy bankkártya",
    ],
  },
  perm: {
    title: "Mit láthat a bővítmény",
    rows: [
      {
        dt: "Jobb gombos menü",
        dd: "Hozzáadja a „Try on my wall” lehetőséget, ha jobb gombbal egy képre kattint.",
      },
      {
        dt: "A lap, amelyen kattint",
        dd: "Egyszer olvassa be az oldalt, amikor a „Try on my wall” lehetőséget választja: a képet és a szövegében lévő méreteket. Semmi mást azon a webhelyen.",
      },
      {
        dt: "framesizes.app",
        dd: "Megkérdezheti, hogy a bővítmény telepítve és kitűzve van-e. Mást nem oszt meg.",
      },
    ],
    tip: "A fala fotója ezen a számítógépen marad.",
  },
  faq: {
    title: "Kérdések",
    items: [
      {
        q: "Minden webáruházban működik?",
        a: "Minden olyan oldalon, ahol jobb gombbal rákattinthat egy képre. Ha az oldal nem ad meg méretet, írja be saját maga a szélességet és a magasságot.",
      },
      {
        q: "Miért nincs a gomb az eszköztáramon?",
        a: "A Chrome az új bővítményeket a puzzle-darab gomb mögé teszi. Tűzze ki egyszer, és az eszköztáron marad.",
      },
      {
        q: "Mely böngészőkben működik?",
        a: "A Chrome 116-os vagy újabb verziójában, számítógépen. A Chrome oldalpanelén nyílik meg.",
      },
    ],
  },
  chrome: {
    extensions: "Bővítmények",
    noAccess: "Nincs szükség hozzáférésre",
    noAccessLines: [
      "Ezeknek a bővítményeknek nincs szükségük az ezen a webhelyen",
      "található információk megtekintésére és módosítására.",
    ],
    manage: "Bővítmények kezelése",
    copyImage: "Kép másolása",
    inspect: "Vizsgálat",
  },
} satisfies ExtensionCopy;
