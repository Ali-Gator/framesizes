import type { ExtensionCopy } from "./en";

/** Filipino. */
export const tl = {
  seo: {
    title: "Extension na Gallery Wall Layout Generator",
    h1: "Paano Gamitin ang Gallery Wall Layout Generator",
    description:
      "Paano gamitin ang browser extension na Gallery Wall Layout Generator: magplano ng pader sa side panel, o subukan ang poster mula sa tindahan sa totoong laki.",
  },
  crumbs: { home: "Home", hub: "Gallery wall", page: "Browser extension" },
  answer:
    "I-click ang button ng extension sa toolbar ng Chrome para buksan ang side panel at magplano ng gallery wall. Sa kahit anong tindahan, i-right click ang isang poster at piliin ang “Try on my wall” para isabit ito sa pader mo sa totoong laki.",
  store: "Kunin ito sa Chrome Web Store",
  noButton: "Hindi mo makita ang button?",
  showPin: "Tingnan kung paano ito i-pin",
  pin: {
    title: "I-pin ito sa toolbar",
    text: "Itinatago ng Chrome ang mga bagong extension sa likod ng button na puzzle piece. I-click ang puzzle piece (1) sa kanang itaas ng Chrome, pagkatapos ang pin (2) sa tabi ng Gallery Wall Layout Generator. Mananatili na sa toolbar ang button nito.",
    picture:
      "Ang toolbar ng Chrome: ang button na puzzle piece, na may markang 1, ay nagbubukas ng menu ng Mga Extension, at may markang 2 ang pin sa tabi ng Gallery Wall Layout Generator",
    pinned: "Naka-pin na?",
    showUsage: "Tingnan kung paano ito gamitin",
  },
  usage: "Ang magagawa mo sa side panel",
  steps: [
    {
      title: "Magplano ng gallery wall",
      figure: "Limang frame sa itaas ng sofa sa sample na kuwarto",
      text: "Pumili ng isa sa limang template, itakda ang pagitan at ilipat-lipat ang mga frame. Gumagana agad ang sample na kuwarto; isang minuto lang ang litrato ng sarili mong pader.",
    },
    {
      title: "Subukan ang poster mula sa tindahan",
      figure: "Ang right-click menu sa poster ng isang tindahan, napili ang Try on my wall",
      text: "I-right click ang poster, piliin ang “Try on my wall” at piliin ang laking nakalista sa tindahan. Nakasabit ito sa pader mo sa totoong laki.",
    },
    {
      title: "Kunin ang mga marka ng pako",
      figure: "Limang frame na may tig-isang may numerong pako",
      text: "I-type kung gaano kalayo sa ibaba ng itaas na gilid ng frame ang sabitan. Bawat pako ay may numero at puwesto, sinukat mula sa isang sulok.",
    },
  ],
  wall: {
    title: "Gamitin ang sarili mong pader",
    text: "Kunan ng litrato ang pader nang diretso mula sa harap, pagkatapos ay markahan ang isang bagay na alam mo ang laki. Doon ibabatay ng panel ang sukat ng lahat:",
    items: [
      "ang lapad ng pader",
      "isang pinto ({door} ang taas sa US)",
      "sofa o kama na nasukat mo na",
      "papel na Letter o A4 na nakadikit sa pader",
      "isang credit card",
    ],
  },
  perm: {
    title: "Ang nakikita ng extension",
    rows: [
      {
        dt: "Right-click menu",
        dd: "Nagdadagdag ng “Try on my wall” kapag nag-right click ka sa isang larawan.",
      },
      {
        dt: "Ang tab kung saan ka nag-click",
        dd: "Binabasa nito ang page na iyon nang isang beses, kapag pinili mo ang “Try on my wall”: ang larawan at anumang laki sa text nito. Wala nang iba sa site na iyon.",
      },
      {
        dt: "framesizes.app",
        dd: "Puwedeng magtanong kung naka-install at naka-pin ang extension. Wala nang ibang ibinabahagi.",
      },
    ],
    tip: "Nananatili sa computer na ito ang litrato ng pader mo.",
  },
  faq: {
    title: "Mga tanong",
    items: [
      {
        q: "Gumagana ba ito sa bawat tindahan?",
        a: "Sa kahit anong page na may larawang puwede mong i-right click. Kung walang nakalistang laki ang page, i-type mo mismo ang lapad at taas.",
      },
      {
        q: "Bakit wala ang button sa toolbar ko?",
        a: "Inilalagay ng Chrome ang mga bagong extension sa likod ng button na puzzle piece. I-pin ito nang isang beses at mananatili ito sa toolbar.",
      },
      {
        q: "Saang mga browser ito gumagana?",
        a: "Sa Chrome 116 o mas bago, o sa Microsoft Edge 116 o mas bago, sa computer. Bumubukas ito sa side panel ng browser.",
      },
    ],
  },
  edge: {
    answer:
      "I-click ang button ng extension sa toolbar ng Edge para buksan ang side panel at magplano ng gallery wall. Sa kahit anong tindahan, i-right click ang isang poster at piliin ang “Try on my wall” para isabit ito sa pader mo sa totoong laki.",
    store: "Kunin ito sa Microsoft Edge Add-ons",
    pin: {
      text: "Itinatago ng Edge ang mga bagong extension sa likod ng button na puzzle piece. I-click ang puzzle piece (1) sa kanang itaas ng Edge, pagkatapos ang pin (2) sa tabi ng Gallery Wall Layout Generator. Mananatili na sa toolbar ang button nito.",
      picture:
        "Ang toolbar ng Edge: ang button na puzzle piece, na may markang 1, ay nagbubukas ng menu ng Mga Extension, at may markang 2 ang pin sa tabi ng Gallery Wall Layout Generator",
    },
    faqButton:
      "Inilalagay ng Edge ang mga bagong extension sa likod ng button na puzzle piece. I-pin ito nang isang beses at mananatili ito sa toolbar.",
  },
  chrome: {
    extensions: "Mga Extension",
    noAccess: "Hindi nangangailangan ng access",
    noAccessLines: [
      "Hindi kailangang makita at baguhin ng mga extension",
      "na ito ang impormasyon sa site na ito.",
    ],
    manage: "Pamahalaan ang mga extension",
    copyImage: "Kopyahin ang imahe",
    inspect: "Suriin",
  },
} satisfies ExtensionCopy;
