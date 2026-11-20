import type { ExtensionCopy } from "./en";

export const es = {
  seo: {
    title: "Gallery Wall Layout Generator para Chrome",
    h1: "Cómo usar Gallery Wall Layout Generator",
    description:
      "Cómo usar la extensión Gallery Wall Layout Generator para Chrome: planifica una pared en el panel lateral o prueba una lámina de una tienda a tamaño real.",
  },
  crumbs: { home: "Inicio", hub: "Pared de cuadros", page: "Extensión de Chrome" },
  answer:
    "Haz clic en el botón de la extensión en la barra de herramientas de Chrome para abrir el panel lateral y planificar una pared de cuadros. En cualquier tienda, haz clic derecho en una lámina y elige «Try on my wall» para colgarla en tu pared a tamaño real.",
  store: "Consíguela en Chrome Web Store",
  noButton: "¿No ves el botón?",
  showPin: "Mira cómo fijarlo",
  pin: {
    title: "Fíjalo en la barra de herramientas",
    text: "Chrome guarda las extensiones nuevas detrás del botón de la pieza de puzle. Haz clic en la pieza de puzle (1), arriba a la derecha de Chrome, y luego en la chincheta (2) junto a Gallery Wall Layout Generator. Su botón se quedará en la barra de herramientas.",
    picture:
      "La barra de herramientas de Chrome: el botón de la pieza de puzle, marcado con un 1, abre el menú Extensiones, y la chincheta junto a Gallery Wall Layout Generator está marcada con un 2",
    pinned: "¿Ya lo has fijado?",
    showUsage: "Mira cómo usarla",
  },
  usage: "Qué puedes hacer en el panel lateral",
  steps: [
    {
      title: "Planifica una pared de cuadros",
      figure: "Cinco marcos sobre un sofá en la habitación de ejemplo",
      text: "Elige una de las cinco plantillas, ajusta la separación y mueve los marcos. La habitación de ejemplo funciona al instante; la foto de tu propia pared lleva un minuto.",
    },
    {
      title: "Prueba una lámina de una tienda",
      figure: "El menú contextual sobre una lámina de una tienda, con Try on my wall elegido",
      text: "Haz clic derecho en una lámina, elige «Try on my wall» y selecciona el tamaño que indica la tienda. Aparecerá en tu pared a tamaño real.",
    },
    {
      title: "Obtén las marcas de los clavos",
      figure: "Cinco marcos con un clavo numerado en cada uno",
      text: "Escribe a qué distancia del borde superior del marco está el colgador. Cada clavo recibe un número y una posición, medida desde una esquina.",
    },
  ],
  wall: {
    title: "Usa tu propia pared",
    text: "Haz una foto de la pared de frente y marca algo cuyo tamaño conozcas. El panel calcula la escala de todo a partir de ello:",
    items: [
      "el ancho de la pared",
      "una puerta ({door} de alto en EE. UU.)",
      "un sofá o una cama que hayas medido",
      "una hoja Letter o A4 pegada a la pared",
      "una tarjeta de crédito",
    ],
  },
  perm: {
    title: "Qué puede ver la extensión",
    rows: [
      {
        dt: "Menú contextual",
        dd: "Añade «Try on my wall» cuando haces clic derecho en una imagen.",
      },
      {
        dt: "La pestaña en la que haces clic",
        dd: "Lee esa página una vez, cuando eliges «Try on my wall»: la imagen y los tamaños que aparezcan en su texto. Nada más de ese sitio.",
      },
      {
        dt: "framesizes.app",
        dd: "Puede preguntar si la extensión está instalada y fijada. No se comparte nada más.",
      },
    ],
    tip: "La foto de tu pared se queda en este ordenador.",
  },
  faq: {
    title: "Preguntas",
    items: [
      {
        q: "¿Funciona en todas las tiendas?",
        a: "En cualquier página con una imagen en la que puedas hacer clic derecho. Si la página no indica el tamaño, escribe tú el ancho y el alto.",
      },
      {
        q: "¿Por qué no está el botón en mi barra de herramientas?",
        a: "Chrome coloca las extensiones nuevas detrás del botón de la pieza de puzle. Fíjala una vez y se quedará en la barra de herramientas.",
      },
      {
        q: "¿En qué navegadores funciona?",
        a: "En Chrome 116 o posterior, en un ordenador. Se abre en el panel lateral de Chrome.",
      },
    ],
  },
  chrome: {
    extensions: "Extensiones",
    noAccess: "No se necesita acceso",
    noAccessLines: [
      "Estas extensiones no necesitan ver ni cambiar",
      "información en este sitio web.",
    ],
    manage: "Gestionar extensiones",
    copyImage: "Copiar imagen",
    inspect: "Inspeccionar",
  },
} satisfies ExtensionCopy;
