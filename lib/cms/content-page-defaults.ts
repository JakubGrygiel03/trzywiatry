import type { AboutOverlay, B2BOverlay, ContactOverlay, ContentOverlayMap, ContentPageKey } from "@/lib/cms/content-pages";
import { aboutGalleryWorks } from "@/lib/data/gallery";

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

export function defaultContentOverlay<K extends ContentPageKey>(key: K): ContentOverlayMap[K] {
  if (key === "b2b") return defaultB2BOverlay() as ContentOverlayMap[K];
  if (key === "o-nas") return defaultAboutOverlay() as ContentOverlayMap[K];
  return defaultContactOverlay() as ContentOverlayMap[K];
}
