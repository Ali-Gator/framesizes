import type { ExtensionCopy } from "./en";

export const de = {
  seo: {
    title: "Gallery Wall Layout Generator für Chrome",
    h1: "So nutzen Sie den Gallery Wall Layout Generator",
    description:
      "So nutzen Sie die Chrome-Erweiterung Gallery Wall Layout Generator: Bilderwand in der Seitenleiste planen oder ein Poster aus dem Shop in echter Größe zeigen.",
  },
  crumbs: { home: "Startseite", hub: "Bilderwand", page: "Chrome-Erweiterung" },
  answer:
    "Klicken Sie in der Chrome-Symbolleiste auf die Schaltfläche der Erweiterung, um die Seitenleiste zu öffnen und eine Bilderwand zu planen. Klicken Sie in einem beliebigen Shop mit der rechten Maustaste auf ein Poster und wählen Sie „Try on my wall“, um es in echter Größe an Ihre Wand zu hängen.",
  store: "Im Chrome Web Store herunterladen",
  noButton: "Sie sehen die Schaltfläche nicht?",
  showPin: "So pinnen Sie sie an",
  pin: {
    title: "An die Symbolleiste anpinnen",
    text: "Chrome legt neue Erweiterungen hinter die Puzzleteil-Schaltfläche. Klicken Sie oben rechts in Chrome auf das Puzzleteil (1) und dann auf die Pinnnadel (2) neben Gallery Wall Layout Generator. Danach bleibt die Schaltfläche in der Symbolleiste.",
    picture:
      "Die Chrome-Symbolleiste: Die Puzzleteil-Schaltfläche, markiert mit 1, öffnet das Menü „Erweiterungen“, und die Pinnnadel neben Gallery Wall Layout Generator ist mit 2 markiert",
    pinned: "Schon angepinnt?",
    showUsage: "So nutzen Sie die Erweiterung",
  },
  usage: "Was Sie in der Seitenleiste tun können",
  steps: [
    {
      title: "Eine Bilderwand planen",
      figure: "Fünf Rahmen über einem Sofa im Beispielzimmer",
      text: "Wählen Sie eine von fünf Vorlagen, legen Sie den Abstand fest und verschieben Sie die Rahmen. Das Beispielzimmer funktioniert sofort, ein Foto Ihrer eigenen Wand dauert eine Minute.",
    },
    {
      title: "Ein Poster aus einem Shop testen",
      figure: "Das Kontextmenü auf einem Poster in einem Shop, Try on my wall ausgewählt",
      text: "Klicken Sie mit der rechten Maustaste auf ein Poster, wählen Sie „Try on my wall“ und die Größe, die der Shop angibt. Es hängt in echter Größe an Ihrer Wand.",
    },
    {
      title: "Die Nagelpunkte erhalten",
      figure: "Fünf Rahmen mit je einem nummerierten Nagel",
      text: "Geben Sie ein, wie weit der Aufhänger unter der Oberkante des Rahmens sitzt. Jeder Nagel bekommt eine Nummer und eine Position, gemessen von einer Ecke aus.",
    },
  ],
  wall: {
    title: "Ihre eigene Wand verwenden",
    text: "Fotografieren Sie die Wand gerade von vorn und markieren Sie dann einen Gegenstand, dessen Größe Sie kennen. Die Seitenleiste skaliert alles danach:",
    items: [
      "die Breite der Wand",
      "eine Tür (in den USA {door} hoch)",
      "ein Sofa oder ein Bett, das Sie ausgemessen haben",
      "ein Letter- oder A4-Blatt, an die Wand geklebt",
      "eine Kreditkarte",
    ],
  },
  perm: {
    title: "Was die Erweiterung sehen kann",
    rows: [
      {
        dt: "Kontextmenü",
        dd: "Fügt „Try on my wall“ hinzu, wenn Sie mit der rechten Maustaste auf ein Bild klicken.",
      },
      {
        dt: "Der Tab, in den Sie klicken",
        dd: "Sie liest diese Seite einmal, wenn Sie „Try on my wall“ wählen: das Bild und alle Größen im Text. Sonst nichts auf dieser Website.",
      },
      {
        dt: "framesizes.app",
        dd: "Kann fragen, ob die Erweiterung installiert und angepinnt ist. Sonst wird nichts geteilt.",
      },
    ],
    tip: "Ihr Wandfoto bleibt auf diesem Computer.",
  },
  faq: {
    title: "Fragen",
    items: [
      {
        q: "Funktioniert sie in jedem Shop?",
        a: "Auf jeder Seite mit einem Bild, auf das Sie mit der rechten Maustaste klicken können. Nennt die Seite keine Größe, geben Sie Breite und Höhe selbst ein.",
      },
      {
        q: "Warum ist die Schaltfläche nicht in meiner Symbolleiste?",
        a: "Chrome legt neue Erweiterungen hinter die Puzzleteil-Schaltfläche. Pinnen Sie sie einmal an, dann bleibt sie in der Symbolleiste.",
      },
      {
        q: "In welchen Browsern läuft sie?",
        a: "In Chrome 116 oder neuer, auf einem Computer. Sie öffnet sich in der Seitenleiste von Chrome.",
      },
    ],
  },
  chrome: {
    extensions: "Erweiterungen",
    noAccess: "Kein Zugriff erforderlich",
    noAccessLines: [
      "Diese Erweiterungen funktionieren, ohne Daten dieser",
      "Website abzurufen oder zu verändern.",
    ],
    manage: "Erweiterungen verwalten",
    copyImage: "Bild kopieren",
    inspect: "Untersuchen",
  },
} satisfies ExtensionCopy;
