import type { ExtensionCopy } from "./en";

export const no = {
  seo: {
    title: "Gallery Wall Layout Generator-utvidelse",
    h1: "Slik bruker du Gallery Wall Layout Generator",
    description:
      "Slik bruker du nettleserutvidelsen Gallery Wall Layout Generator: planlegg en bildevegg i sidepanelet, eller prøv en plakat fra en nettbutikk i ekte størrelse.",
  },
  crumbs: { home: "Hjem", hub: "Bildevegg", page: "Nettleserutvidelse" },
  answer:
    "Klikk på knappen til utvidelsen i verktøylinjen i Chrome for å åpne sidepanelet og planlegge en bildevegg. I hvilken som helst nettbutikk høyreklikker du på en plakat og velger «Try on my wall» for å henge den på veggen din i ekte størrelse.",
  store: "Hent den i Chrome Nettmarked",
  noButton: "Ser du ikke knappen?",
  showPin: "Se hvordan du fester den",
  pin: {
    title: "Fest den til verktøylinjen",
    text: "Chrome legger nye utvidelser bak puslebrikkeknappen. Klikk på puslebrikken (1) øverst til høyre i Chrome, og deretter på nålen (2) ved siden av Gallery Wall Layout Generator. Knappen blir da værende i verktøylinjen.",
    picture:
      "Verktøylinjen i Chrome: puslebrikkeknappen, merket 1, åpner Utvidelser-menyen, og nålen ved siden av Gallery Wall Layout Generator er merket 2",
    pinned: "Allerede festet?",
    showUsage: "Se hvordan du bruker den",
  },
  usage: "Dette kan du gjøre i sidepanelet",
  steps: [
    {
      title: "Planlegg en bildevegg",
      figure: "Fem rammer over en sofa i eksempelrommet",
      text: "Velg én av fem maler, angi mellomrommet og flytt rammene. Eksempelrommet virker med en gang; et bilde av din egen vegg tar et minutt.",
    },
    {
      title: "Prøv en plakat fra en nettbutikk",
      figure: "Høyreklikkmenyen på en plakat i en nettbutikk, med Try on my wall valgt",
      text: "Høyreklikk på en plakat, velg «Try on my wall» og velg størrelsen butikken oppgir. Den henger på veggen din i ekte størrelse.",
    },
    {
      title: "Få spikerpunktene",
      figure: "Fem rammer med en nummerert spiker i hver",
      text: "Skriv inn hvor langt under rammens overkant opphenget sitter. Hver spiker får et nummer og et punkt, målt fra ett hjørne.",
    },
  ],
  wall: {
    title: "Bruk din egen vegg",
    text: "Ta et bilde av veggen rett forfra, og merk deretter én ting du vet størrelsen på. Panelet skalerer alt etter den:",
    items: [
      "bredden på veggen",
      "en dør ({door} høy i USA)",
      "en sofa eller seng du har målt",
      "et Letter- eller A4-ark teipet på veggen",
      "et bankkort",
    ],
  },
  perm: {
    title: "Dette kan utvidelsen se",
    rows: [
      {
        dt: "Høyreklikkmeny",
        dd: "Legger til «Try on my wall» når du høyreklikker på et bilde.",
      },
      {
        dt: "Fanen du klikker i",
        dd: "Leser den siden én gang, når du velger «Try on my wall»: bildet og eventuelle størrelser i teksten. Ikke noe annet på det nettstedet.",
      },
      {
        dt: "framesizes.app",
        dd: "Kan spørre om utvidelsen er installert og festet. Ikke noe annet deles.",
      },
    ],
    tip: "Bildet av veggen din blir værende på denne datamaskinen.",
  },
  faq: {
    title: "Spørsmål",
    items: [
      {
        q: "Virker den i alle nettbutikker?",
        a: "På alle sider med et bilde du kan høyreklikke på. Hvis siden ikke oppgir størrelse, skriver du inn bredde og høyde selv.",
      },
      {
        q: "Hvorfor er ikke knappen i verktøylinjen min?",
        a: "Chrome legger nye utvidelser bak puslebrikkeknappen. Fest den én gang, så blir den værende i verktøylinjen.",
      },
      {
        q: "Hvilke nettlesere virker den i?",
        a: "Chrome 116 eller nyere, eller Microsoft Edge 116 eller nyere, på en datamaskin. Den åpnes i sidepanelet i nettleseren.",
      },
    ],
  },
  edge: {
    answer:
      "Klikk på knappen til utvidelsen i verktøylinjen i Edge for å åpne sidepanelet og planlegge en bildevegg. I hvilken som helst nettbutikk høyreklikker du på en plakat og velger «Try on my wall» for å henge den på veggen din i ekte størrelse.",
    store: "Hent den fra Microsoft Edge Add-ons",
    pin: {
      text: "Edge legger nye utvidelser bak puslebrikkeknappen. Klikk på puslebrikken (1) øverst til høyre i Edge, og deretter på nålen (2) ved siden av Gallery Wall Layout Generator. Knappen blir da værende i verktøylinjen.",
      picture:
        "Verktøylinjen i Edge: puslebrikkeknappen, merket 1, åpner Utvidelser-menyen, og nålen ved siden av Gallery Wall Layout Generator er merket 2",
    },
    faqButton:
      "Edge legger nye utvidelser bak puslebrikkeknappen. Fest den én gang, så blir den værende i verktøylinjen.",
  },
  chrome: {
    extensions: "Utvidelser",
    noAccess: "Ingen tilgang trengs",
    noAccessLines: [
      "Disse utvidelsene trenger ikke å se og endre",
      "informasjonen på dette nettstedet.",
    ],
    manage: "Administrer utvidelser",
    copyImage: "Kopier bilde",
    inspect: "Inspiser",
  },
} satisfies ExtensionCopy;
