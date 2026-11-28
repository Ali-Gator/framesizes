import type { ExtensionCopy } from "./en";

export const it = {
  seo: {
    title: "Estensione Gallery Wall Layout Generator",
    h1: "Come usare Gallery Wall Layout Generator",
    description:
      "Come usare l'estensione per browser Gallery Wall Layout Generator: progetta una parete nel pannello laterale o prova una stampa di un negozio a grandezza reale.",
  },
  crumbs: { home: "Home", hub: "Parete di quadri", page: "Estensione per browser" },
  answer:
    "Fai clic sul pulsante dell'estensione nella barra degli strumenti di Chrome per aprire il pannello laterale e progettare una parete di quadri. In qualsiasi negozio, fai clic destro su una stampa e scegli «Try on my wall» per appenderla alla tua parete a grandezza reale.",
  store: "Scaricala dal Chrome Web Store",
  noButton: "Non vedi il pulsante?",
  showPin: "Scopri come fissarlo",
  pin: {
    title: "Fissala alla barra degli strumenti",
    text: "Chrome tiene le nuove estensioni dietro il pulsante a forma di pezzo di puzzle. Fai clic sul pezzo di puzzle (1) in alto a destra in Chrome, poi sulla puntina (2) accanto a Gallery Wall Layout Generator. Il suo pulsante resterà nella barra degli strumenti.",
    picture:
      "La barra degli strumenti di Chrome: il pulsante a forma di pezzo di puzzle, segnato con 1, apre il menu Estensioni, e la puntina accanto a Gallery Wall Layout Generator è segnata con 2",
    pinned: "L'hai già fissata?",
    showUsage: "Scopri come usarla",
  },
  usage: "Cosa puoi fare nel pannello laterale",
  steps: [
    {
      title: "Progetta una parete di quadri",
      figure: "Cinque cornici sopra un divano nella stanza di esempio",
      text: "Scegli uno dei cinque modelli, imposta lo spazio tra le cornici e spostale. La stanza di esempio funziona subito; la foto della tua parete richiede un minuto.",
    },
    {
      title: "Prova una stampa da un negozio",
      figure: "Il menu contestuale sulla stampa di un negozio, con Try on my wall selezionato",
      text: "Fai clic destro su una stampa, scegli «Try on my wall» e seleziona la misura indicata dal negozio. La vedrai appesa alla tua parete a grandezza reale.",
    },
    {
      title: "Ottieni i punti dei chiodi",
      figure: "Cinque cornici con un chiodo numerato in ciascuna",
      text: "Scrivi a che distanza dal bordo superiore della cornice si trova il gancio. Ogni chiodo riceve un numero e una posizione, misurata da un angolo.",
    },
  ],
  wall: {
    title: "Usa la tua parete",
    text: "Fotografa la parete di fronte, poi segna un oggetto di cui conosci la misura. Il pannello calcola la scala di tutto a partire da quello:",
    items: [
      "la larghezza della parete",
      "una porta (alta {door} negli Stati Uniti)",
      "un divano o un letto che hai misurato",
      "un foglio Letter o A4 attaccato alla parete",
      "una carta di credito",
    ],
  },
  perm: {
    title: "Cosa può vedere l'estensione",
    rows: [
      {
        dt: "Menu contestuale",
        dd: "Aggiunge «Try on my wall» quando fai clic destro su un'immagine.",
      },
      {
        dt: "La scheda in cui fai clic",
        dd: "Legge quella pagina una volta, quando scegli «Try on my wall»: l'immagine e le misure presenti nel testo. Nient'altro di quel sito.",
      },
      {
        dt: "framesizes.app",
        dd: "Può chiedere se l'estensione è installata e fissata. Nient'altro viene condiviso.",
      },
    ],
    tip: "La foto della tua parete resta su questo computer.",
  },
  faq: {
    title: "Domande",
    items: [
      {
        q: "Funziona in tutti i negozi?",
        a: "In qualsiasi pagina con un'immagine su cui puoi fare clic destro. Se la pagina non indica la misura, scrivi tu larghezza e altezza.",
      },
      {
        q: "Perché il pulsante non è nella mia barra degli strumenti?",
        a: "Chrome mette le nuove estensioni dietro il pulsante del pezzo di puzzle. Fissala una volta e resterà nella barra degli strumenti.",
      },
      {
        q: "Su quali browser funziona?",
        a: "Su Chrome 116 o versioni successive, o su Microsoft Edge 116 o versioni successive, da computer. Si apre nel pannello laterale del browser.",
      },
    ],
  },
  edge: {
    answer:
      "Fai clic sul pulsante dell'estensione nella barra degli strumenti di Edge per aprire il pannello laterale e progettare una parete di quadri. In qualsiasi negozio, fai clic destro su una stampa e scegli «Try on my wall» per appenderla alla tua parete a grandezza reale.",
    store: "Scaricala da Microsoft Edge Add-ons",
    pin: {
      text: "Edge tiene le nuove estensioni dietro il pulsante a forma di pezzo di puzzle. Fai clic sul pezzo di puzzle (1) in alto a destra in Edge, poi sulla puntina (2) accanto a Gallery Wall Layout Generator. Il suo pulsante resterà nella barra degli strumenti.",
      picture:
        "La barra degli strumenti di Edge: il pulsante a forma di pezzo di puzzle, segnato con 1, apre il menu Estensioni, e la puntina accanto a Gallery Wall Layout Generator è segnata con 2",
    },
    faqButton:
      "Edge mette le nuove estensioni dietro il pulsante del pezzo di puzzle. Fissala una volta e resterà nella barra degli strumenti.",
  },
  chrome: {
    extensions: "Estensioni",
    noAccess: "Nessun accesso necessario",
    noAccessLines: [
      "Queste estensioni non devono vedere e modificare",
      "le informazioni su questo sito.",
    ],
    manage: "Gestisci estensioni",
    copyImage: "Copia immagine",
    inspect: "Ispeziona",
  },
} satisfies ExtensionCopy;
