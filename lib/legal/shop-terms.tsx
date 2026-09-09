import type { ReactNode } from "react";

export const REGULAMIN_EFFECTIVE_DATE = "23.06.2026";

export const SHOP_LEGAL = {
  bankAccount: "08 1090 1678 0000 0001 2000 7664",
  freeShippingFromPln: 300,
  shipping: {
    kurierPln: 30,
    inpostPln: 20,
  },
} as const;

type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "note"; text: string }
  | { type: "form"; lines: string[] };

export type LegalSection = {
  id: string;
  title: string;
  blocks: Block[];
};

export const regulaminSections: LegalSection[] = [
  {
    id: "par-1",
    title: "§1. Postanowienia ogólne",
    blocks: [
      {
        type: "p",
        text: "Przedmiot działalności. Sklep internetowy trzywiatry.pl (dalej „Sklep”) prowadzi sprzedaż: ręcznie wykonywanych wyrobów ceramicznych, form gipsowych do produkcji ceramiki, form plastikowych do wykonywania form gipsowych.",
      },
      {
        type: "p",
        text: "Dane Sprzedawcy. Sklep internetowy dostępny pod adresem trzywiatry.pl prowadzony jest przez Jędrzej Słomiak, prowadzącego działalność gospodarczą pod firmą Jędrzej Słomiak, wpisaną do C-EIDG z siedzibą działalności pod adresem: Życzliwa 13/4, 80-176 Gdańsk, NIP: 5833536856, REGON: 541629383 (dalej: „Sprzedawca”).",
      },
      {
        type: "p",
        text: "Kontakt ze Sprzedawcą. Adres e-mail: kontakt@trzywiatry.pl. Telefon: +48 666 022 555.",
      },
      {
        type: "p",
        text: "Język umów. Umowy zawierane są w języku polskim. Wszelkie informacje udostępniane Klientom są sporządzone w języku polskim.",
      },
      {
        type: "p",
        text: "Definicje legalne:",
      },
      {
        type: "ul",
        items: [
          "Konsument – osoba fizyczna dokonująca zakupu niezwiązanego bezpośrednio z działalnością gospodarczą lub zawodową (zgodnie z art. 22¹ Kodeksu cywilnego).",
          "Przedsiębiorca na prawach konsumenta – osoba fizyczna prowadząca działalność gospodarczą, zawierająca umowę niezwiązaną zawodowo z jej działalnością (art. 22¹ K.c.).",
          "Klient – każdy podmiot (Konsument, Przedsiębiorca, Przedsiębiorca na prawach konsumenta) dokonujący zakupu w Sklepie.",
          "Sprzedawca – Jędrzej Słomiak, właściciel Sklepu.",
          "Produkt – rzecz ruchoma oferowana w Sklepie.",
          "Umowa sprzedaży – umowa zawierana na odległość (zgodnie z art. 2 ust. 1 Ustawy o prawach konsumenta).",
          "Dzień roboczy – dni od poniedziałku do piątku, z wyłączeniem dni ustawowo wolnych od pracy w Polsce.",
        ],
      },
    ],
  },
  {
    id: "par-2",
    title: "§2. Składanie zamówień",
    blocks: [
      {
        type: "p",
        text: "Sposób składania zamówień. Zamówienia można składać 24 godziny na dobę, 7 dni w tygodniu poprzez formularz zamówienia na stronie internetowej Sklepu.",
      },
      {
        type: "p",
        text: "Potwierdzenie zamówienia. Umowa sprzedaży zostaje zawarta z chwilą potwierdzenia przyjęcia zamówienia przez Sprzedawcę (poprzez e-mail lub inny sposób wskazany w Sklepie).",
      },
      {
        type: "p",
        text: "Sprzedawca zastrzega sobie prawo do odmowy realizacji zamówienia w przypadku:",
      },
      {
        type: "ul",
        items: [
          "podania nieprawdziwych, niekompletnych lub błędnych danych (np. adresu dostawy, numeru telefonu),",
          "podejrzenia nadużycia, oszustwa lub działania niezgodnego z prawem (np. próby wykorzystania cudzego konta),",
          "braków w asortymencie (jeśli produkt nie jest dostępny, Sprzedawca poinformuje Klienta niezwłocznie).",
        ],
      },
      {
        type: "p",
        text: "Obowiązki Klienta. Klient zobowiązany jest do:",
      },
      {
        type: "ul",
        items: [
          "podania prawdziwych, aktualnych i kompletnych danych niezbędnych do realizacji zamówienia (imię, nazwisko, adres, NIP – jeśli dotyczy),",
          "zapoznania się z Regulaminem, Polityką prywatności oraz warunkami płatności i dostawy przed złożeniem zamówienia.",
        ],
      },
    ],
  },
  {
    id: "par-3",
    title: "§3. Informacje o produktach",
    blocks: [
      {
        type: "p",
        text: "Dostępność produktów. Produkty oznaczone są informacją o dostępności (np. „Dostępny”, „Na zamówienie”, „Chwilowo niedostępny”). W przypadku produktów niedostępnych Sprzedawca poinformuje Klienta o czasie oczekiwania (jeśli jest znany).",
      },
      {
        type: "p",
        text: "Produkty ręcznie wykonywane. Produkty ręcznie wykonywane (np. ceramika artystyczna) mogą być realizowane na zamówienie. Czas realizacji produktów na zamówienie wynosi od 7 do 21 dni roboczych.",
      },
      {
        type: "p",
        text: "Zdjęcia i opisy produktów. Zdjęcia produktów mają charakter poglądowy i mogą odbiegać od rzeczywistego wyglądu (np. kolor, wzór). Opisy produktów zawierają istotne cechy (wymiary, sposób wykonania). Ze względu na ręczne wykonanie dopuszczalne są różnice w kolorze, szkliwieniu, wymiarach i wadze, które nie stanowią wady towaru (art. 556 K.c.).",
      },
      {
        type: "p",
        text: "Ceny produktów. Ceny podawane są w złotych polskich (PLN) i zawierają podatek VAT (jeśli jest wymagany). Ceny nie obejmują kosztów dostawy (szczegóły w §5). Sprzedawca zastrzega sobie prawo do zmiany cen, z wyjątkiem zamówień już złożonych.",
      },
    ],
  },
  {
    id: "par-4",
    title: "§4. Płatności",
    blocks: [
      {
        type: "p",
        text: "Metody płatności. Dostępne metody płatności:",
      },
      {
        type: "ul",
        items: [
          "przelew bankowy (na konto: 08 1090 1678 0000 0001 2000 7664 z tytułem: Zamówienie nr [numer zamówienia]),",
          "szybkie płatności online (Przelewy24) — chwilowo niedostępne z przyczyn technicznych.",
        ],
      },
      {
        type: "p",
        text: "Termin płatności. W przypadku płatności przelewem realizacja zamówienia następuje po zaksięgowaniu środków na koncie Sprzedawcy. Brak płatności w ciągu 7 dni kalendarzowych od złożenia zamówienia może skutkować jego anulowaniem (Sprzedawca poinformuje Klienta o anulowaniu).",
      },
      {
        type: "p",
        text: "Potwierdzenie płatności. Sprzedawca niezwłocznie (w ciągu 1 dnia roboczego) potwierdza otrzymanie płatności e-mailem.",
      },
    ],
  },
  {
    id: "par-5",
    title: "§5. Dostawa",
    blocks: [
      {
        type: "p",
        text: "Zasięg dostawy. Dostawa realizowana jest na terenie Polski.",
      },
      {
        type: "p",
        text: "Czas realizacji zamówienia:",
      },
      {
        type: "table",
        headers: ["Typ produktu", "Czas realizacji (dni robocze)"],
        rows: [
          ["Produkty dostępne", "1–5"],
          ["Produkty na zamówienie", "3–14"],
        ],
      },
      {
        type: "p",
        text: "Czas dostawy (doręczenie przez przewoźnika): 1–3 dni robocze od nadania przesyłki.",
      },
      {
        type: "p",
        text: "Odpowiedzialność za opóźnienia. Sprzedawca nie ponosi odpowiedzialności za opóźnienia spowodowane przez przewoźnika. W przypadku opóźnienia po stronie Sprzedawcy (np. brak produktu w magazynie): Klient ma prawo wyznaczyć dodatkowy termin realizacji (minimum 7 dni roboczych), a po bezskutecznym upływie terminu odstąpić od umowy (art. 561 K.c.).",
      },
      {
        type: "p",
        text: "Odbiór przesyłki. Klient zobowiązany jest sprawdzić stan przesyłki przy odbiorze. Brak protokołu szkody nie ogranicza prawa do reklamacji (art. 561 K.c.). W przypadku uszkodzenia przesyłki Klient powinien niezwłocznie (w ciągu 3 dni roboczych) zgłosić to Sprzedawcy i przewoźnikowi.",
      },
      {
        type: "p",
        text: "Koszty dostawy:",
      },
      {
        type: "table",
        headers: ["Metoda dostawy", "Koszt (PLN)"],
        rows: [
          ["Kurier", "30,00"],
          ["Paczkomaty InPost", "20,00"],
        ],
      },
      {
        type: "p",
        text: "Darmowa dostawa. Darmowa dostawa przysługuje dla zamówień powyżej 300,00 PLN (dotyczy terenu Polski). Nie dotyczy przesyłek gabarytowych.",
      },
      {
        type: "p",
        text: "Przesyłki gabarytowe. Koszt dostawy przesyłek gabarytowych (waga > 25 kg lub wymiary > 64×38×41 cm) ustalany jest indywidualnie i przedstawiany Klientowi przed złożeniem zamówienia.",
      },
    ],
  },
  {
    id: "par-6",
    title: "§6. Prawo odstąpienia od umowy (dla Konsumentów i Przedsiębiorców na prawach konsumenta)",
    blocks: [
      {
        type: "p",
        text: "Termin odstąpienia. Konsument oraz Przedsiębiorca na prawach konsumenta ma prawo odstąpić od umowy w terminie 14 dni od objęcia produktu w posiadanie (dla produktów fizycznych).",
      },
      {
        type: "p",
        text: "Sposób odstąpienia. Do zachowania terminu wystarczy wysłanie oświadczenia przed jego upływem. Oświadczenie można złożyć:",
      },
      {
        type: "ul",
        items: [
          "e-mailowo (na adres: kontakt@trzywiatry.pl),",
          "pisemnie (na adres Sprzedawcy),",
          "za pośrednictwem formularza odstąpienia (Załącznik nr 1).",
        ],
      },
      {
        type: "p",
        text: "Zwrot płatności. Sprzedawca zwraca wszystkie otrzymane płatności (w tym koszt najtańszej oferowanej dostawy) w terminie do 14 dni od otrzymania oświadczenia o odstąpieniu. Zwrot środków następuje na ten sam sposób płatności, którego użył Klient (chyba że Klient wyrazi zgodę na inny sposób).",
      },
      {
        type: "p",
        text: "Koszty zwrotu. Klient ponosi bezpośrednie koszty zwrotu rzeczy (np. koszt przesyłki zwrotnej). Sprzedawca może odliczyć koszty zwrotu od kwoty zwrotu (jeśli Klient nie odebrał przesyłki zwrotnej).",
      },
      {
        type: "p",
        text: "Wyłączenia prawa odstąpienia. Prawo odstąpienia nie przysługuje w przypadku:",
      },
      {
        type: "ul",
        items: [
          "produktów wykonanych według specyfikacji Klienta lub personalizowanych (np. ceramika z indywidualnym wzorem),",
          "innych przypadków określonych w art. 38 Ustawy o prawach konsumenta.",
        ],
      },
    ],
  },
  {
    id: "par-7",
    title: "§7. Niezgodność towaru z umową (reklamacje)",
    blocks: [
      {
        type: "p",
        text: "Podstawa prawna. Sprzedawca odpowiada wobec Konsumenta i Przedsiębiorcy na prawach konsumenta za niezgodność towaru z umową (art. 556–576 K.c. oraz Ustawa o prawach konsumenta).",
      },
      {
        type: "p",
        text: "Sposób składania reklamacji. Reklamacje można składać mailowo (na adres: kontakt@trzywiatry.pl) lub pisemnie (na adres Sprzedawcy).",
      },
      {
        type: "p",
        text: "Wymogi formalne reklamacji. Reklamacja powinna zawierać:",
      },
      {
        type: "ul",
        items: [
          "dane Klienta (imię, nazwisko, adres, numer zamówienia),",
          "opis wady (z dokładnym wskazaniem problemu),",
          "żądanie Klienta (naprawa, wymiana, obniżenie ceny, zwrot środków),",
          "dowód zakupu (faktura, paragon, potwierdzenie zamówienia).",
        ],
      },
      {
        type: "p",
        text: "Termin rozpatrzenia reklamacji. Sprzedawca rozpatruje reklamację w terminie 14 dni od jej otrzymania.",
      },
      {
        type: "p",
        text: "Sposoby rozpatrzenia reklamacji. W pierwszej kolejności Sprzedawca może naprawić produkt (jeśli jest to możliwe i uzasadnione) albo wymienić produkt na nowy (jeśli wada jest istotna). Jeśli naprawa lub wymiana są niemożliwe lub nieproporcjonalnie kosztowne, Klient może żądać obniżenia ceny (proporcjonalnie do wady) albo zwrotu środków (w całości lub części).",
      },
      {
        type: "p",
        text: "Zwrot środków. Zwrot środków następuje w terminie do 14 dni od uznania reklamacji. Zwrot odbywa się na ten sam sposób płatności, którego użył Klient (chyba że Klient wyrazi zgodę na inny sposób).",
      },
    ],
  },
  {
    id: "par-8",
    title: "§8. Przedsiębiorcy (B2B)",
    blocks: [
      {
        type: "p",
        text: "Ograniczenie odpowiedzialności. W relacjach B2B Sprzedawca może ograniczyć odpowiedzialność w zakresie dopuszczalnym przez prawo (np. wyłączenie odpowiedzialności za pośrednie szkody). Ograniczenia odpowiedzialności muszą być sformułowane w sposób jasny i zrozumiały.",
      },
      {
        type: "p",
        text: "Indywidualne warunki współpracy. Strony mogą ustalić indywidualne warunki współpracy (np. rabaty, terminy płatności, dostawy). Indywidualne warunki nie mogą być mniej korzystne dla Klienta niż przepisy prawa.",
      },
    ],
  },
  {
    id: "par-9",
    title: "§9. Pozasądowe rozwiązywanie sporów",
    blocks: [
      {
        type: "p",
        text: "Prawa Konsumenta. Konsument ma prawo do:",
      },
      {
        type: "ul",
        items: [
          "mediacji (za pośrednictwem Rzecznika Finansowego lub wojewódzkiego rzecznika konsumentów),",
          "pomocy rzecznika konsumentów (właściwego ze względu na miejsce zamieszkania Konsumenta),",
          "sądów polubownych (przy Inspekcji Handlowej lub UOKiK).",
        ],
      },
      {
        type: "p",
        text: "Informacje dodatkowe. Szczegółowe informacje dostępne są na stronach: https://www.uokik.gov.pl oraz https://www.rf.gov.pl. Konsument może skorzystać z platformy ODR (Online Dispute Resolution) pod adresem: https://ec.europa.eu/consumers/odr/.",
      },
    ],
  },
  {
    id: "par-10",
    title: "§10. Konto klienta i newsletter",
    blocks: [
      {
        type: "p",
        text: "Zakładanie konta. Sklep może umożliwiać założenie konta klienta (nieobowiązkowo). Konto służy do ułatwienia zakupów, śledzenia zamówień oraz korzystania z promocji.",
      },
      {
        type: "p",
        text: "Obowiązki Klienta. Klient odpowiada za bezpieczeństwo danych logowania (login, hasło). Klient zobowiązany jest nie udostępniać swojego konta osobom trzecim.",
      },
      {
        type: "p",
        text: "Usunięcie konta. Konto może zostać usunięte na żądanie Klienta (w terminie do 7 dni roboczych). Usunięcie konta nie wpływa na realizację zamówień złożonych przed jego usunięciem.",
      },
      {
        type: "p",
        text: "Newsletter. Newsletter jest dobrowolny i można z niego zrezygnować w każdej chwili (poprzez link w stopce e-maila lub kontakt ze Sprzedawcą). Zgoda na newsletter może zostać wycofana bez podania przyczyny.",
      },
    ],
  },
  {
    id: "par-11",
    title: "§11. Ochrona danych osobowych (RODO)",
    blocks: [
      {
        type: "p",
        text: "Administrator danych. Administratorem danych osobowych jest Jędrzej Słomiak z siedzibą pod adresem: Życzliwa 13/4, 80-176 Gdańsk.",
      },
      {
        type: "p",
        text: "Cele przetwarzania danych. Dane przetwarzane są w celach: realizacji zamówień (art. 6 ust. 1 lit. b RODO), obsługi płatności i dostawy (art. 6 ust. 1 lit. b RODO), wypełnienia obowiązków księgowych i podatkowych (art. 6 ust. 1 lit. c RODO), marketingu (tylko za zgodą Klienta – art. 6 ust. 1 lit. a RODO), obsługi reklamacji i zwrotów (art. 6 ust. 1 lit. b RODO).",
      },
      {
        type: "p",
        text: "Odbiorcy danych. Dane mogą być przekazywane: operatorom płatności (np. Przelewy24), firmom kurierskim (np. InPost), dostawcom usług IT (np. hosting, oprogramowanie sklepu), organom państwowym (np. US, ZUS – jeśli wymagane przepisami prawa).",
      },
      {
        type: "p",
        text: "Okres przechowywania danych. Dane przechowywane są przez okres wymagany przepisami prawa (np. 5 lat dla celów podatkowych). Dane przetwarzane na podstawie zgody (np. marketing) przechowywane są do czasu wycofania zgody.",
      },
      {
        type: "p",
        text: "Prawa Klienta. Klient ma prawo do: dostępu do swoich danych, sprostowania danych, usunięcia danych („prawo do bycia zapomnianym”), ograniczenia przetwarzania, przenoszenia danych, wniesienia sprzeciwu (np. wobec marketingu), wniesienia skargi do Prezesa UODO.",
      },
      {
        type: "p",
        text: "Pliki cookies. Sklep wykorzystuje pliki cookies: niezbędne (do funkcjonowania Sklepu), analityczne (do statystyk, np. Google Analytics), marketingowe (tylko za zgodą Klienta). Klient może zarządzać cookies w ustawieniach przeglądarki lub za pomocą narzędzi dostępnych na stronie Sklepu. Brak zgody na cookies marketingowe nie ogranicza funkcjonalności Sklepu.",
      },
      {
        type: "p",
        text: "Polityka prywatności. Szczegółowe informacje na temat ochrony danych osobowych znajdują się w Polityce prywatności (Załącznik nr 2).",
      },
    ],
  },
  {
    id: "par-12",
    title: "§12. Zmiany regulaminu",
    blocks: [
      {
        type: "p",
        text: "Prawo do zmian. Sprzedawca może zmienić regulamin z ważnych przyczyn prawnych, organizacyjnych lub technicznych. Zmiany nie mogą pogarszać sytuacji Klientów, którzy złożyli zamówienia przed ich wprowadzeniem.",
      },
      {
        type: "p",
        text: "Obowiązywanie zmian. Do zamówień złożonych przed zmianą regulaminu stosuje się regulamin obowiązujący w dniu zakupu. Klienci posiadający konto zostaną poinformowani o zmianach e-mailem lub za pośrednictwem Sklepu.",
      },
      {
        type: "p",
        text: "Akceptacja zmian. Kontynuowanie korzystania ze Sklepu po zmianie regulaminu oznacza akceptację nowych warunków.",
      },
    ],
  },
  {
    id: "par-13",
    title: "§13. Postanowienia końcowe",
    blocks: [
      {
        type: "p",
        text: "Prawo właściwe. W sprawach nieuregulowanych w Regulaminie stosuje się prawo polskie i unijne. Dla Konsumentów z UE stosuje się również przepisy prawa kraju ich zamieszkania (jeśli są korzystniejsze).",
      },
      {
        type: "p",
        text: "Pierwszeństwo przepisów prawa. W przypadku sprzeczności z prawem pierwszeństwo mają przepisy prawa.",
      },
      {
        type: "p",
        text: "Wejście w życie. Regulamin obowiązuje od dnia publikacji na stronie Sklepu. Sprzedawca zastrzega sobie prawo do wprowadzania zmian technicznych (np. poprawek redakcyjnych) bez powiadamiania Klientów.",
      },
    ],
  },
  {
    id: "zalacznik-1",
    title: "Załącznik nr 1 – Formularz odstąpienia od umowy",
    blocks: [
      {
        type: "p",
        text: "Adresat: Jędrzej Słomiak, Życzliwa 13/4, 80-176 Gdańsk. E-mail: kontakt@trzywiatry.pl",
      },
      {
        type: "form",
        lines: [
          "Ja niżej podpisany/a niniejszym informuję o moim odstąpieniu od umowy sprzedaży następujących rzeczy:",
          "• ………………………………………………………………",
          "• ………………………………………………………………",
          "Numer zamówienia: ………………………………………………………………",
          "Data złożenia zamówienia: ………………………………………………………………",
          "Data odbioru towaru: ………………………………………………………………",
          "Imię i nazwisko konsumenta: ………………………………………………………………",
          "Adres konsumenta: ………………………………………………………………",
          "Numer konta bankowego do zwrotu środków (opcjonalnie): ………………………………………………………………",
          "Podpis konsumenta: ………………………………………………………………",
          "Data: ………………………………………………………………",
        ],
      },
    ],
  },
];

export const privacySections: LegalSection[] = [
  {
    id: "privacy-admin",
    title: "Administrator danych",
    blocks: [
      {
        type: "p",
        text: "Administratorem danych osobowych jest Jędrzej Słomiak z siedzibą pod adresem: Życzliwa 13/4, 80-176 Gdańsk.",
      },
    ],
  },
  {
    id: "privacy-cele",
    title: "Cele przetwarzania danych",
    blocks: [
      {
        type: "ul",
        items: [
          "realizacja zamówień (art. 6 ust. 1 lit. b RODO),",
          "obsługa płatności i dostawy (art. 6 ust. 1 lit. b RODO),",
          "wypełnienie obowiązków księgowych i podatkowych (art. 6 ust. 1 lit. c RODO),",
          "marketing (tylko za zgodą Klienta – art. 6 ust. 1 lit. a RODO),",
          "obsługa reklamacji i zwrotów (art. 6 ust. 1 lit. b RODO).",
        ],
      },
    ],
  },
  {
    id: "privacy-podstawa",
    title: "Podstawa prawna",
    blocks: [
      {
        type: "p",
        text: "Podstawą prawną przetwarzania danych jest art. 6 RODO (zgodnie z celami wymienionymi powyżej).",
      },
    ],
  },
  {
    id: "privacy-odbiorcy",
    title: "Odbiorcy danych",
    blocks: [
      {
        type: "ul",
        items: [
          "operatorzy płatności (np. Przelewy24),",
          "firmy kurierskie (np. InPost),",
          "dostawcy usług IT (np. hosting, oprogramowanie sklepu),",
          "organy państwowe (np. US, ZUS – jeśli wymagane przepisami prawa).",
        ],
      },
    ],
  },
  {
    id: "privacy-okres",
    title: "Okres przechowywania danych",
    blocks: [
      {
        type: "p",
        text: "Dane przechowywane są przez okres wymagany przepisami prawa (np. 5 lat dla celów podatkowych). Dane przetwarzane na podstawie zgody (np. marketing) przechowywane są do czasu wycofania zgody.",
      },
    ],
  },
  {
    id: "privacy-prawa",
    title: "Prawa Klienta",
    blocks: [
      {
        type: "ul",
        items: [
          "dostęp do swoich danych,",
          "sprostowanie danych,",
          "usunięcie danych („prawo do bycia zapomnianym”),",
          "ograniczenie przetwarzania,",
          "przenoszenie danych,",
          "wniesienie sprzeciwu (np. wobec marketingu),",
          "wniesienie skargi do Prezesa UODO (Urząd Ochrony Danych Osobowych).",
        ],
      },
    ],
  },
  {
    id: "privacy-cookies",
    title: "Pliki cookies",
    blocks: [
      {
        type: "ul",
        items: [
          "niezbędne (do funkcjonowania Sklepu),",
          "analityczne (do statystyk, np. Google Analytics),",
          "marketingowe (tylko za zgodą Klienta).",
        ],
      },
      {
        type: "p",
        text: "Klient może zarządzać cookies w ustawieniach przeglądarki lub za pomocą narzędzi dostępnych na stronie Sklepu. Brak zgody na cookies marketingowe nie ogranicza funkcjonalności Sklepu.",
      },
    ],
  },
];

export function renderLegalBlocks(blocks: Block[]): ReactNode {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "p":
        return (
          <p key={index} className="leading-relaxed text-czarny/75">
            {block.text}
          </p>
        );
      case "ul":
        return (
          <ul key={index} className="list-disc space-y-1.5 pl-5 leading-relaxed text-czarny/75">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        );
      case "ol":
        return (
          <ol key={index} className="list-decimal space-y-1.5 pl-5 leading-relaxed text-czarny/75">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ol>
        );
      case "table":
        return (
          <div key={index} className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm text-czarny/75">
              <thead>
                <tr className="border-b border-czarny/10 text-xs uppercase tracking-[0.08em] text-czarny/45">
                  {block.headers.map((header, headerIndex) => (
                    <th key={headerIndex} className="px-0 py-2 pr-6 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-czarny/6 last:border-0">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-0 py-2.5 pr-6 align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "note":
        return (
          <p key={index} className="text-sm leading-relaxed text-czarny/55">
            {block.text}
          </p>
        );
      case "form":
        return (
          <div
            key={index}
            className="space-y-2 border border-dashed border-czarny/15 bg-krem/40 px-4 py-5 font-mono text-sm leading-7 text-czarny/70"
          >
            {block.lines.map((line, lineIndex) => (
              <p key={lineIndex}>{line}</p>
            ))}
          </div>
        );
    }
  });
}
