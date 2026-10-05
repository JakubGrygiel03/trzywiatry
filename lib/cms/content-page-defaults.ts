import type {
  AboutOverlay,
  B2BOverlay,
  ContactOverlay,
  ContentOverlayMap,
  ContentPageKey,
  InfoPageOverlay,
} from "@/lib/cms/content-pages";
import { aboutGalleryWorks } from "@/lib/data/gallery";
import { flattenLegalBlocks, REGULAMIN_EFFECTIVE_DATE, regulaminSections } from "@/lib/legal/shop-terms";

export function defaultB2BOverlay(): B2BOverlay {
  return {
    metaTitle: "B2B",
    metaDescription: "Ceramika na zamówienie dla kawiarni, restauracji i hoteli — logo, formy matki, wolumeny.",
    eyebrow: "Strefa B2B",
    title: "Ceramika dla lokali",
    description:
      "Kubki z logo, powtarzalne profile z form matki, zestawy śniadaniowe. Od próbek po nakłady sezonowe.",
    descriptionEn: "Custom cups and moulds for cafés and hotels — English is welcome.",
    formIntro: "English welcome — Polish characters are not required. VAT instead of Polish NIP is fine.",
    frameCaption: "B2B",
    imageSrc: "",
    imageAlt: "Ceramika na zamówienie dla lokali — Trzy Wiatry",
  };
}

export function defaultAboutOverlay(): AboutOverlay {
  return {
    metaTitle: "O nas",
    metaDescription: "Trzy Wiatry — rodzinna pracownia. Papa Marian, Jędrek i Tusia. Galeria prac z gliny i drewna.",
    title: "Skąd to wszystko powstało?",
    heading: "Nasza historia",
    paragraphs: [
      "Trzy Wiatry to nasza rodzinna pracownia, która zrodziła się z pasji do toczenia w glinie i w drewnie. Mieści się w naszym domu, w którym niemal zawsze wieje z trzech stron — stąd właśnie wzięła się jej nazwa.",
      "Tworzymy razem, we trójkę: Papa Marian — od zawsze zafascynowany drewnem i jego możliwościami, oraz Jędrek i Tusia — od kilku lat zakochani w glinie i w tym, co można z niej wyczarować.",
      "Uwielbiamy eksperymentować, uczyć się nowych rzeczy i dzielić się tym, co tworzymy. Nasza pracownia to miejsce, gdzie spotykają się pasja, rzemiosło i rodzinne ciepło.",
    ],
    imageSrc: "/brand/photos/o-nas-rodzina.jpg",
    imageAlt: "Tusia, Papa Marian i Jędrek — rodzinna pracownia Trzy Wiatry",
    galleryTitle: "Galeria naszych prac",
    galleryWorks: aboutGalleryWorks,
  };
}

export function defaultContactOverlay(): ContactOverlay {
  return {
    metaTitle: "Kontakt",
    metaDescription:
      "Napisz do Trzy Wiatry. Formularz albo bezpośrednio — e-mail, telefon, pracownia w Gdańsku. English welcome.",
    title: "Kontakt",
    subtitle: "Formularz albo bezpośrednio — e-mail, telefon, pracownia w Gdańsku.",
    subtitleEn: "You can write in English. Polish characters are not required.",
    formHeading: "Wypełnij formularz / Message",
    directHeading: "Napisz bezpośrednio / Direct",
    formIntro: "English welcome — Polish characters are not required.",
  };
}

export function defaultFaqOverlay(): InfoPageOverlay {
  return {
    metaTitle: "FAQ",
    metaDescription:
      "Czas wysyłki, różnice w rękodziele, pielęgnacja drewna oraz zmiana terminu warsztatu — odpowiedzi pracowni Trzy Wiatry.",
    eyebrow: "Pytania",
    title: "FAQ",
    description: "Krótko: kiedy wyślemy paczkę, czemu kubki różnią się od zdjęć i jak zmienić termin warsztatu.",
    items: [
      {
        title: "Jak długo czeka się na zamówienie?",
        body: "Produkty dostępne od ręki wysyłamy w 2–4 dni robocze. Jeśli coś robimy na zamówienie, zwykle trwa to 3–5 tygodni — naczynie musi przejść dwa wypały w piecu.",
      },
      {
        title: "Czy każdy kubek wygląda tak samo?",
        body: "Nie — to rękodzieło, więc każdy egzemplarz jest trochę inny. Pojemność podajemy w przybliżeniu (np. 80, 180, 250 ml); różnica kilku mililitrów jest normalna. Kolor i faktura szkliwa też mogą lekko odbiegać od zdjęcia.",
      },
      {
        title: "Czy drewniane produkty mogą pęknąć?",
        body: "Drewno reaguje na wilgoć i temperaturę w domu, więc przy złej pielęgnacji może pękać. Deski olejujemy, ale nie wkładaj ich do zmywarki i nie stawiaj przy kaloryferze ani na mokrym blacie.",
      },
      {
        title: "Czy mogę zmienić termin warsztatu?",
        body: "Tak — jeśli zgłosisz się najpóźniej 7 dni przed zajęciami, przeniesiemy Cię na inny wolny termin. Bilet jest imienny, więc nie da się go swobodnie przekazać innej osobie.",
      },
    ],
  };
}

export function defaultShippingOverlay(): InfoPageOverlay {
  return {
    metaTitle: "Dostawa i zwroty",
    metaDescription:
      "Paczkomaty InPost, kurier i odbiór w pracowni. Pakowanie zero stłuczek i zasady zwrotów w Trzy Wiatry.",
    eyebrow: "Logistyka",
    title: "Dostawa i zwroty",
    description: "Pakujemy z wkładkami i podwójnym kartonem — zero stłuczek. Ceny metod dostawy biorą się z ustawień sklepu.",
    items: [
      {
        title: "Czas realizacji",
        body: "Produkty dostępne wysyłamy w 1–5 dni roboczych, produkty na zamówienie w 3–14 dni roboczych. Doręczenie przez przewoźnika: zwykle 1–3 dni robocze od nadania.",
      },
      {
        title: "Zwroty",
        body: "Masz 14 dni na odstąpienie, jeśli naczynie nie jest personalizowane. Odeślij je bezpiecznie zapakowane. Formularz odstąpienia oraz pełne zasady znajdziesz w regulaminie.",
      },
      {
        title: "Śledzenie",
        body: "Numer śledzenia trafia mailem, gdy nadamy paczkę. W trybie urlopowym data nadania jest w bannerze i w potwierdzeniu.",
      },
    ],
  };
}

export function defaultCareOverlay(): InfoPageOverlay {
  return {
    metaTitle: "Jak dbać o ceramikę",
    metaDescription: "Pielęgnacja ceramiki Trzy Wiatry: zmywarka, szok termiczny, formy gipsowe.",
    eyebrow: "Poradnik",
    title: "Jak dbać o ceramikę",
    description:
      "Rękodzieło ma tolerancję wymiarową i własny charakter szkliwa. Poniżej zasady, które przedłużają życie naczynia.",
    items: [
      {
        title: "Zmywarka",
        body: "Większość szkliwionych naczyń znosi delikatny program. Unikaj tabletek z wybielaczem przy matowych szkliwach Dust i Raw Clay — one lubią mycie ręczne.",
      },
      {
        title: "Szok termiczny",
        body: "Nie wstawiaj gorącego naczynia do zimnej wody i nie lej wrzątku do czarki wyjętej z lodówki. Glina i szkliwo rozszerzają się w różnym tempie.",
      },
      {
        title: "Formy matki gipsowe",
        body: "Po odlewie osusz formę w przewiewie, nigdy na kaloryferze. Gips pęka od uderzenia i od gwałtownego suszenia. Przechowuj w suchym miejscu, stopkami do siebie.",
      },
      {
        title: "Drewno",
        body: "Deski olejujemy olejem lnianym. Zmywarka ich nie lubi. Po myciu stań deskę na krawędzi — niech oddycha.",
      },
    ],
  };
}

export function defaultRegulaminOverlay(): InfoPageOverlay {
  return {
    metaTitle: "Regulamin sklepu internetowego",
    metaDescription:
      "Regulamin sklepu internetowego Trzy Wiatry — zasady zamówień, płatności, dostawy, odstąpienia i reklamacji.",
    eyebrow: "Sklep",
    title: "Regulamin sklepu internetowego",
    description: `Obowiązuje od dnia ${REGULAMIN_EFFECTIVE_DATE}.`,
    items: regulaminSections.map((section) => ({
      title: section.title,
      body: flattenLegalBlocks(section.blocks),
    })),
  };
}

export function defaultContentOverlay<K extends ContentPageKey>(key: K): ContentOverlayMap[K] {
  if (key === "b2b") return defaultB2BOverlay() as ContentOverlayMap[K];
  if (key === "o-nas") return defaultAboutOverlay() as ContentOverlayMap[K];
  if (key === "kontakt") return defaultContactOverlay() as ContentOverlayMap[K];
  if (key === "faq") return defaultFaqOverlay() as ContentOverlayMap[K];
  if (key === "dostawa-i-zwroty") return defaultShippingOverlay() as ContentOverlayMap[K];
  if (key === "regulamin") return defaultRegulaminOverlay() as ContentOverlayMap[K];
  return defaultCareOverlay() as ContentOverlayMap[K];
}
