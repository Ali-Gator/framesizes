import type { ExtensionCopy } from "./en";

/** European Portuguese: worded apart from pt-br so their titles and descriptions never match. */
export const ptPt = {
  seo: {
    title: "Gallery Wall Layout Generator: extensão Chrome",
    h1: "Como utilizar o Gallery Wall Layout Generator",
    description:
      "Como utilizar a extensão Gallery Wall Layout Generator no Chrome: planeie uma parede no painel lateral ou experimente um poster de uma loja em tamanho real.",
  },
  crumbs: { home: "Início", hub: "Parede de quadros", page: "Extensão do Chrome" },
  answer:
    "Clique no botão da extensão na barra de ferramentas do Chrome para abrir o painel lateral e planear uma parede de quadros. Em qualquer loja, clique com o botão direito num poster e escolha «Try on my wall» para o pendurar na sua parede em tamanho real.",
  store: "Obtenha-a na Chrome Web Store",
  noButton: "Não vê o botão?",
  showPin: "Veja como o fixar",
  pin: {
    title: "Fixe-o na barra de ferramentas",
    text: "O Chrome guarda as extensões novas atrás do botão da peça de puzzle. Clique na peça de puzzle (1) no canto superior direito do Chrome e, depois, no pionés (2) ao lado de Gallery Wall Layout Generator. O botão fica então na barra de ferramentas.",
    picture:
      "A barra de ferramentas do Chrome: o botão da peça de puzzle, marcado com 1, abre o menu Extensões, e o pionés ao lado de Gallery Wall Layout Generator está marcado com 2",
    pinned: "Já o fixou?",
    showUsage: "Veja como a utilizar",
  },
  usage: "O que pode fazer no painel lateral",
  steps: [
    {
      title: "Planeie uma parede de quadros",
      figure: "Cinco molduras por cima de um sofá na sala de exemplo",
      text: "Escolha um dos cinco modelos, defina o espaçamento e desloque as molduras. A sala de exemplo funciona de imediato; uma fotografia da sua parede demora um minuto.",
    },
    {
      title: "Experimente um poster de uma loja",
      figure: "O menu de contexto sobre um poster de uma loja, com Try on my wall escolhido",
      text: "Clique com o botão direito num poster, escolha «Try on my wall» e selecione o tamanho indicado pela loja. Fica pendurado na sua parede em tamanho real.",
    },
    {
      title: "Obtenha as marcas dos pregos",
      figure: "Cinco molduras com um prego numerado em cada uma",
      text: "Escreva a que distância do topo da moldura fica o gancho. Cada prego recebe um número e um ponto, medido a partir de um canto.",
    },
  ],
  wall: {
    title: "Utilize a sua parede",
    text: "Tire uma fotografia à parede de frente e marque um objeto cujo tamanho conheça. O painel ajusta a escala de tudo a partir dele:",
    items: [
      "a largura da parede",
      "uma porta ({door} de altura nos EUA)",
      "um sofá ou uma cama que tenha medido",
      "uma folha Letter ou A4 colada na parede",
      "um cartão bancário",
    ],
  },
  perm: {
    title: "O que a extensão pode ver",
    rows: [
      {
        dt: "Menu de contexto",
        dd: "Adiciona «Try on my wall» quando clica com o botão direito numa imagem.",
      },
      {
        dt: "O separador onde clica",
        dd: "Lê essa página uma vez, quando escolhe «Try on my wall»: a imagem e os tamanhos que constem do texto. Nada mais desse site.",
      },
      {
        dt: "framesizes.app",
        dd: "Pode perguntar se a extensão está instalada e fixada. Nada mais é partilhado.",
      },
    ],
    tip: "A fotografia da sua parede fica neste computador.",
  },
  faq: {
    title: "Perguntas",
    items: [
      {
        q: "Funciona em todas as lojas?",
        a: "Em qualquer página com uma imagem em que possa clicar com o botão direito. Se a página não indicar o tamanho, escreva a largura e a altura.",
      },
      {
        q: "Porque é que o botão não está na minha barra de ferramentas?",
        a: "O Chrome coloca as extensões novas atrás do botão da peça de puzzle. Fixe-a uma vez e fica na barra de ferramentas.",
      },
      {
        q: "Em que navegadores funciona?",
        a: "No Chrome 116 ou posterior, num computador. Abre no painel lateral do Chrome.",
      },
    ],
  },
  chrome: {
    extensions: "Extensões",
    noAccess: "Não é necessário acesso",
    noAccessLines: [
      "Estas extensões não precisam de ver nem de",
      "alterar informações neste site.",
    ],
    manage: "Gerir extensões",
    copyImage: "Copiar imagem",
    inspect: "Inspecionar",
  },
} satisfies ExtensionCopy;
