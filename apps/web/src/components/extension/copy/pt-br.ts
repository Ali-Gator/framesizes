import type { ExtensionCopy } from "./en";

/** Brazilian Portuguese: worded apart from pt-pt so their titles and descriptions never match. */
export const ptBr = {
  seo: {
    title: "Extensão Gallery Wall Layout Generator",
    h1: "Como usar o Gallery Wall Layout Generator",
    description:
      "Como usar a extensão de navegador Gallery Wall Layout Generator: monte a parede no painel lateral ou teste um pôster de uma loja no tamanho real.",
  },
  crumbs: { home: "Início", hub: "Parede de quadros", page: "Extensão para navegador" },
  answer:
    "Clique no botão da extensão na barra de ferramentas do Chrome para abrir o painel lateral e montar uma parede de quadros. Em qualquer loja, clique com o botão direito em um pôster e escolha “Try on my wall” para pendurá-lo na sua parede no tamanho real.",
  store: "Baixe na Chrome Web Store",
  noButton: "Não está vendo o botão?",
  showPin: "Veja como fixar",
  pin: {
    title: "Fixe na barra de ferramentas",
    text: "O Chrome guarda as extensões novas atrás do botão de peça de quebra-cabeça. Clique na peça de quebra-cabeça (1) no canto superior direito do Chrome e depois no alfinete (2) ao lado de Gallery Wall Layout Generator. Aí o botão fica na barra de ferramentas.",
    picture:
      "A barra de ferramentas do Chrome: o botão de peça de quebra-cabeça, marcado com 1, abre o menu Extensões, e o alfinete ao lado de Gallery Wall Layout Generator está marcado com 2",
    pinned: "Já fixou?",
    showUsage: "Veja como usar",
  },
  usage: "O que você pode fazer no painel lateral",
  steps: [
    {
      title: "Monte uma parede de quadros",
      figure: "Cinco molduras acima de um sofá na sala de exemplo",
      text: "Escolha um dos cinco modelos, defina o espaçamento e mova as molduras. A sala de exemplo funciona na hora; uma foto da sua parede leva um minuto.",
    },
    {
      title: "Teste um pôster de uma loja",
      figure: "O menu do botão direito em um pôster de uma loja, com Try on my wall escolhido",
      text: "Clique com o botão direito em um pôster, escolha “Try on my wall” e selecione o tamanho que a loja informa. Ele aparece pendurado na sua parede no tamanho real.",
    },
    {
      title: "Veja onde vão os pregos",
      figure: "Cinco molduras com um prego numerado em cada uma",
      text: "Digite a que distância abaixo do topo da moldura fica o gancho. Cada prego ganha um número e um ponto, medido a partir de um canto.",
    },
  ],
  wall: {
    title: "Use a sua parede",
    text: "Tire uma foto da parede de frente e marque uma coisa cujo tamanho você conhece. O painel calcula a escala de tudo a partir dela:",
    items: [
      "a largura da parede",
      "uma porta ({door} de altura nos EUA)",
      "um sofá ou uma cama que você mediu",
      "uma folha Letter ou A4 colada na parede",
      "um cartão de crédito",
    ],
  },
  perm: {
    title: "O que a extensão pode ver",
    rows: [
      {
        dt: "Menu do botão direito",
        dd: "Adiciona “Try on my wall” quando você clica com o botão direito em uma imagem.",
      },
      {
        dt: "A guia em que você clica",
        dd: "Lê essa página uma vez, quando você escolhe “Try on my wall”: a imagem e os tamanhos que aparecem no texto. Nada mais desse site.",
      },
      {
        dt: "framesizes.app",
        dd: "Pode perguntar se a extensão está instalada e fixada. Nada mais é compartilhado.",
      },
    ],
    tip: "A foto da sua parede fica neste computador.",
  },
  faq: {
    title: "Perguntas",
    items: [
      {
        q: "Funciona em qualquer loja?",
        a: "Em qualquer página com uma imagem em que você possa clicar com o botão direito. Se a página não informar o tamanho, digite a largura e a altura você mesmo.",
      },
      {
        q: "Por que o botão não está na minha barra de ferramentas?",
        a: "O Chrome coloca as extensões novas atrás do botão de peça de quebra-cabeça. Fixe uma vez e ela fica na barra de ferramentas.",
      },
      {
        q: "Em quais navegadores funciona?",
        a: "No Chrome 116 ou mais recente, ou no Microsoft Edge 116 ou mais recente, em um computador. Ela abre no painel lateral do navegador.",
      },
    ],
  },
  edge: {
    answer:
      "Clique no botão da extensão na barra de ferramentas do Edge para abrir o painel lateral e montar uma parede de quadros. Em qualquer loja, clique com o botão direito em um pôster e escolha “Try on my wall” para pendurá-lo na sua parede no tamanho real.",
    store: "Baixe no Microsoft Edge Add-ons",
    pin: {
      text: "O Edge guarda as extensões novas atrás do botão de peça de quebra-cabeça. Clique na peça de quebra-cabeça (1) no canto superior direito do Edge e depois no alfinete (2) ao lado de Gallery Wall Layout Generator. Aí o botão fica na barra de ferramentas.",
      picture:
        "A barra de ferramentas do Edge: o botão de peça de quebra-cabeça, marcado com 1, abre o menu Extensões, e o alfinete ao lado de Gallery Wall Layout Generator está marcado com 2",
    },
    faqButton:
      "O Edge coloca as extensões novas atrás do botão de peça de quebra-cabeça. Fixe uma vez e ela fica na barra de ferramentas.",
  },
  chrome: {
    extensions: "Extensões",
    noAccess: "Nenhum acesso necessário",
    noAccessLines: ["Estas extensões não precisam acessar e mudar", "as informações neste site."],
    manage: "Gerenciar extensões",
    copyImage: "Copiar imagem",
    inspect: "Inspecionar",
  },
} satisfies ExtensionCopy;
