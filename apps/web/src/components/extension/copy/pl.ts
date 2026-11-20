import type { ExtensionCopy } from "./en";

export const pl = {
  seo: {
    title: "Gallery Wall Layout Generator dla Chrome",
    h1: "Jak używać Gallery Wall Layout Generator",
    description:
      "Jak używać rozszerzenia Gallery Wall Layout Generator dla Chrome: zaplanuj ścianę w panelu bocznym albo przymierz plakat ze sklepu w prawdziwym rozmiarze.",
  },
  crumbs: { home: "Strona główna", hub: "Ściana z obrazami", page: "Rozszerzenie Chrome" },
  answer:
    "Kliknij przycisk rozszerzenia na pasku narzędzi Chrome, aby otworzyć panel boczny i zaplanować ścianę z obrazami. W dowolnym sklepie kliknij plakat prawym przyciskiem myszy i wybierz „Try on my wall”, aby powiesić go na swojej ścianie w prawdziwym rozmiarze.",
  store: "Pobierz z Chrome Web Store",
  noButton: "Nie widzisz przycisku?",
  showPin: "Zobacz, jak go przypiąć",
  pin: {
    title: "Przypnij go do paska narzędzi",
    text: "Chrome trzyma nowe rozszerzenia za przyciskiem z elementem układanki. Kliknij element układanki (1) w prawym górnym rogu Chrome, a potem pinezkę (2) obok Gallery Wall Layout Generator. Jego przycisk zostanie na pasku narzędzi.",
    picture:
      "Pasek narzędzi Chrome: przycisk z elementem układanki, oznaczony cyfrą 1, otwiera menu Rozszerzenia, a pinezka obok Gallery Wall Layout Generator jest oznaczona cyfrą 2",
    pinned: "Już przypięty?",
    showUsage: "Zobacz, jak go używać",
  },
  usage: "Co możesz zrobić w panelu bocznym",
  steps: [
    {
      title: "Zaplanuj ścianę z obrazami",
      figure: "Pięć ramek nad kanapą w przykładowym pokoju",
      text: "Wybierz jeden z pięciu szablonów, ustaw odstęp i przesuwaj ramki. Przykładowy pokój działa od razu; zdjęcie własnej ściany zajmie minutę.",
    },
    {
      title: "Przymierz plakat ze sklepu",
      figure: "Menu kontekstowe na plakacie w sklepie z wybraną opcją Try on my wall",
      text: "Kliknij plakat prawym przyciskiem myszy, wybierz „Try on my wall” i rozmiar podany przez sklep. Plakat zawiśnie na Twojej ścianie w prawdziwym rozmiarze.",
    },
    {
      title: "Wyznacz miejsca na gwoździe",
      figure: "Pięć ramek z ponumerowanym gwoździem w każdej",
      text: "Wpisz, jak daleko pod górną krawędzią ramki jest zawieszka. Każdy gwóźdź dostaje numer i miejsce, mierzone od jednego narożnika.",
    },
  ],
  wall: {
    title: "Użyj własnej ściany",
    text: "Zrób zdjęcie ściany prosto z przodu, a potem zaznacz jedną rzecz, której rozmiar znasz. Panel przeskaluje wszystko według niej:",
    items: [
      "szerokość ściany",
      "drzwi (w USA wysokie na {door})",
      "kanapę lub łóżko, które zmierzyłeś",
      "kartkę Letter lub A4 przyklejoną do ściany",
      "kartę płatniczą",
    ],
  },
  perm: {
    title: "Co widzi rozszerzenie",
    rows: [
      {
        dt: "Menu kontekstowe",
        dd: "Dodaje „Try on my wall”, gdy klikniesz obraz prawym przyciskiem myszy.",
      },
      {
        dt: "Karta, w której klikasz",
        dd: "Odczytuje tę stronę jeden raz, gdy wybierzesz „Try on my wall”: obraz i wymiary podane w jej tekście. Nic więcej z tej witryny.",
      },
      {
        dt: "framesizes.app",
        dd: "Może zapytać, czy rozszerzenie jest zainstalowane i przypięte. Nic więcej nie jest udostępniane.",
      },
    ],
    tip: "Zdjęcie Twojej ściany zostaje na tym komputerze.",
  },
  faq: {
    title: "Pytania",
    items: [
      {
        q: "Czy działa w każdym sklepie?",
        a: "Na każdej stronie z obrazem, który można kliknąć prawym przyciskiem myszy. Jeśli strona nie podaje rozmiaru, wpisz szerokość i wysokość samodzielnie.",
      },
      {
        q: "Dlaczego przycisku nie ma na moim pasku narzędzi?",
        a: "Chrome chowa nowe rozszerzenia za przyciskiem z elementem układanki. Przypnij je raz, a przycisk zostanie na pasku narzędzi.",
      },
      {
        q: "W jakich przeglądarkach działa?",
        a: "W Chrome 116 lub nowszym, na komputerze. Otwiera się w panelu bocznym Chrome.",
      },
    ],
  },
  chrome: {
    extensions: "Rozszerzenia",
    noAccess: "Nie potrzebują dostępu",
    noAccessLines: [
      "Te rozszerzenia nie muszą odczytywać ani",
      "zmieniać informacji na tej stronie.",
    ],
    manage: "Zarządzaj rozszerzeniami",
    copyImage: "Kopiuj grafikę",
    inspect: "Zbadaj",
  },
} satisfies ExtensionCopy;
