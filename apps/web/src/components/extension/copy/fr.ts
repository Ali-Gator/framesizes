import type { ExtensionCopy } from "./en";

export const fr = {
  seo: {
    title: "Gallery Wall Layout Generator pour Chrome",
    h1: "Comment utiliser Gallery Wall Layout Generator",
    description:
      "Comment utiliser l'extension Chrome Gallery Wall Layout Generator : composez un mur dans le panneau latéral ou essayez une affiche de boutique en taille réelle.",
  },
  crumbs: { home: "Accueil", hub: "Mur de cadres", page: "Extension Chrome" },
  answer:
    "Cliquez sur le bouton de l'extension dans la barre d'outils de Chrome pour ouvrir le panneau latéral et composer un mur de cadres. Sur n'importe quelle boutique, faites un clic droit sur une affiche et choisissez « Try on my wall » pour l'accrocher à votre mur en taille réelle.",
  store: "Téléchargez-la sur le Chrome Web Store",
  noButton: "Vous ne voyez pas le bouton ?",
  showPin: "Voir comment l'épingler",
  pin: {
    title: "Épinglez-la à la barre d'outils",
    text: "Chrome range les nouvelles extensions derrière le bouton en forme de pièce de puzzle. Cliquez sur la pièce de puzzle (1) en haut à droite de Chrome, puis sur l'épingle (2) à côté de Gallery Wall Layout Generator. Son bouton reste ensuite dans la barre d'outils.",
    picture:
      "La barre d'outils de Chrome : le bouton pièce de puzzle, marqué 1, ouvre le menu Extensions, et l'épingle à côté de Gallery Wall Layout Generator est marquée 2",
    pinned: "Déjà épinglée ?",
    showUsage: "Voir comment l'utiliser",
  },
  usage: "Ce que vous pouvez faire dans le panneau latéral",
  steps: [
    {
      title: "Composer un mur de cadres",
      figure: "Cinq cadres au-dessus d'un canapé dans la pièce d'exemple",
      text: "Choisissez l'un des cinq modèles, réglez l'espacement et déplacez les cadres. La pièce d'exemple fonctionne tout de suite ; la photo de votre propre mur prend une minute.",
    },
    {
      title: "Essayer une affiche d'une boutique",
      figure: "Le menu contextuel sur l'affiche d'une boutique, Try on my wall sélectionné",
      text: "Faites un clic droit sur une affiche, choisissez « Try on my wall » et sélectionnez la taille indiquée par la boutique. Elle s'affiche sur votre mur en taille réelle.",
    },
    {
      title: "Obtenir l'emplacement des clous",
      figure: "Cinq cadres avec un clou numéroté dans chacun",
      text: "Indiquez à quelle distance sous le haut du cadre se trouve l'attache. Chaque clou reçoit un numéro et un emplacement, mesuré depuis un coin.",
    },
  ],
  wall: {
    title: "Utiliser votre propre mur",
    text: "Prenez le mur en photo bien de face, puis repérez un objet dont vous connaissez la taille. Le panneau met tout à l'échelle à partir de lui :",
    items: [
      "la largeur du mur",
      "une porte ({door} de haut aux États-Unis)",
      "un canapé ou un lit que vous avez mesuré",
      "une feuille Letter ou A4 scotchée au mur",
      "une carte bancaire",
    ],
  },
  perm: {
    title: "Ce que l'extension peut voir",
    rows: [
      {
        dt: "Menu contextuel",
        dd: "Ajoute « Try on my wall » quand vous faites un clic droit sur une image.",
      },
      {
        dt: "L'onglet où vous cliquez",
        dd: "Elle lit cette page une fois, quand vous choisissez « Try on my wall » : l'image et les tailles présentes dans son texte. Rien d'autre sur ce site.",
      },
      {
        dt: "framesizes.app",
        dd: "Peut demander si l'extension est installée et épinglée. Rien d'autre n'est partagé.",
      },
    ],
    tip: "La photo de votre mur reste sur cet ordinateur.",
  },
  faq: {
    title: "Questions",
    items: [
      {
        q: "Est-ce que ça marche sur toutes les boutiques ?",
        a: "Sur toute page avec une image sur laquelle vous pouvez faire un clic droit. Si la page n'indique pas de taille, saisissez vous-même la largeur et la hauteur.",
      },
      {
        q: "Pourquoi le bouton n'est-il pas dans ma barre d'outils ?",
        a: "Chrome place les nouvelles extensions derrière le bouton pièce de puzzle. Épinglez-la une fois et elle reste dans la barre d'outils.",
      },
      {
        q: "Sur quels navigateurs fonctionne-t-elle ?",
        a: "Chrome 116 ou version ultérieure, sur ordinateur. Elle s'ouvre dans le panneau latéral de Chrome.",
      },
    ],
  },
  chrome: {
    extensions: "Extensions",
    noAccess: "Aucun accès nécessaire",
    noAccessLines: [
      "Ces extensions n'ont pas besoin de voir ni de modifier",
      "des informations sur ce site.",
    ],
    manage: "Gérer les extensions",
    copyImage: "Copier l'image",
    inspect: "Inspecter",
  },
} satisfies ExtensionCopy;
