import type { BlogPost } from "@/lib/types";

export const blogPosts: BlogPost[] = [
  {
    id: "post-nazwa",
    title: "Nazwa Trzy Wiatry",
    slug: "nazwa-trzy-wiatry",
    excerpt: "Krótka historia naszej nazwy — i jak logo z kartki weszło na ceramikę.",
    subtitle: "Krótka historia naszej nazwy.",
    author: "Jędrzej",
    category: "Uncategorized",
    content:
      "Nazwa Trzy Wiatry przyszła do nas naturalnie — z domu, w którym niemal zawsze wieje z trzech stron.",
    coverImage: "/brand/photos/blog/logo-szkice.png",
    status: "published",
    publishedAt: "2026-03-11T10:00:00+01:00",
    blocks: [
      {
        type: "paragraph",
        text: "Nazwa Trzy Wiatry pojawiła się u nas niemal sama. Nie szukaliśmy jej na siłę — po prostu pewnego dnia było jasne, że tak właśnie trzeba nazwać to, co robimy w domu i przy kole.",
      },
      {
        type: "paragraph",
        text: "Pracownia mieści się w naszym domu. Domie, w którym niemal zawsze wieje z trzech stron. Czasem delikatnie, czasem tak, że drzwi same się uchylają. I właśnie stąd — z tego wiatru, który jest stałym gościem — wzięła się nazwa.",
      },
      {
        type: "paragraph",
        text: "Trzy wiatry. Trzy osoby przy stole. Trzy kierunki, z których przychodzi powietrze. Proste, prawdziwe i nasze.",
      },
      {
        type: "paragraph",
        text: "Dlatego kiedy ktoś pyta, skąd ta nazwa, odpowiadamy uczciwie: stąd, że tak wieje.",
      },
      {
        type: "image",
        src: "/brand/photos/blog/logo-szkice.png",
        alt: "Szkice koncepcji logo Trzy Wiatry na kartce",
        caption: "pierwsze koncepcje naszego logo",
      },
      {
        type: "paragraph",
        text: "Z logo było… trochę inaczej, chociaż w sumie też bardzo „po naszemu”. Czyli powoli, bez pośpiechu i z dużą ilością prób po drodze. Najpierw pojawiało się tylko na kartkach – luźne szkice, jakieś zawijasy, próby uchwycenia tego, jak właściwie wygląda wiatr. No bo jak narysować coś, czego nie widać?",
      },
      {
        type: "paragraph",
        text: "Pamiętam te wieczory, kiedy siedzieliśmy razem – całą rodziną – i rozmawialiśmy o tym, czy wiatr powinien być bardziej miękki, czy może bardziej dynamiczny. Czy linie mają być spokojne, czy raczej „poszarpane”. Trochę filozofii, trochę śmiechu, dużo rysowania. I zero presji.",
      },
      {
        type: "paragraph",
        text: "Przez długi czas nasze „logo” żyło głównie na ceramice – rysowane igłą, trochę za każdym razem inaczej. Każdy egzemplarz był trochę inny, trochę niedoskonały, ale bardzo nasz.",
      },
      {
        type: "image",
        src: "/brand/photos/blog/logo-ceramika-2022.jpg",
        alt: "Znak Trzy Wiatry wydrapany na stopce ceramiki, 2022",
        caption: "Po raz pierwszy na naszej ceramice",
      },
      {
        type: "paragraph",
        text: "Z czasem znak urosł razem z nami. Przestał być tylko rysunkiem na dnie naczynia — zaczął żyć też na stronie, na kartkach i w rozmowach z ludźmi, którzy wpadają do pracowni.",
      },
      {
        type: "paragraph",
        text: "Żeby spiąć to w spójną identyfikację, współpracowaliśmy też ze studiem Dwa Wiatry. Szarości, brązy, ceglane odcienie — kolory, które znamy z gliny, drewna i pieca.",
      },
      {
        type: "paragraph",
        text: "Dziś Trzy Wiatry to nadal ten sam dom i ten sam wiatr. Tylko że znak jest już pewniejszy — a my wiemy, że warto było rysować go długo, powoli i we troje.",
      },
    ],
  },
  {
    id: "post-skurcz",
    title: "Skurcz gliny",
    slug: "skurcz-gliny",
    excerpt:
      "Nie wystarczy policzyć, trzeba jeszcze przetestować. Czyli jaki jest skurcz gliny po wypale.",
    subtitle:
      "Nie wystarczy policzyć, trzeba jeszcze przetestować. Czyli jaki jest skurcz gliny po wypale.",
    author: "Jędrzej",
    category: "Technologia",
    content:
      "Glina kurczy się przy suszeniu i przy wypale. Liczymy skurcz całkowity, a potem sprawdzamy go na własnym testerze.",
    coverImage: "/brand/photos/blog/skurcz-wykres-betongrau.png",
    status: "published",
    publishedAt: "2025-12-28T10:00:00+01:00",
    blocks: [
      {
        type: "heading",
        text: "Dlaczego glina się kurczy?",
      },
      {
        type: "paragraph",
        text: "Glina kurczy się w dwóch etapach: **podczas suszenia** i **podczas wypału**.",
      },
      {
        type: "paragraph",
        text: "Przy suszeniu woda odparowuje, a cząstki gliny „zapadają się” w miejsca, które wcześniej zajmowała woda. Stąd ryzyko pęknięć, jeśli suszymy zbyt szybko albo nierówno.",
      },
      {
        type: "paragraph",
        text: "Po wyschnięciu w masie zostają drobne kanaliki — kapilary. Dzięki nim glina jest chłonna i szkliwo może się do niej „przykleić”.",
      },
      {
        type: "paragraph",
        text: "Przy wypale (u nas często okolice **1250°C**) kapilary się zamykają, gazy uchodzą, a naczynie staje się znacznie mniej chłonne i — po prostu — mniejsze.",
      },
      {
        type: "heading",
        text: "Gdzie znaleźć informacje o skurczu gliny?",
      },
      {
        type: "paragraph",
        text: "Informacje zwykle są na opakowaniu masy ceramicznej. Szukajcie zwłaszcza:",
      },
      {
        type: "list",
        items: ["dry shrinkage,", "firing shrinkage."],
      },
      {
        type: "paragraph",
        text: "Warto też poszukać **karty katalogowej** w Google (np. „Beton 2002 clay datasheet”) albo zapytać sklep, w którym kupiliście masę.",
      },
      {
        type: "heading",
        text: "Jak obliczyć skurcz całkowity?",
      },
      {
        type: "paragraph",
        text: "Posłużę się przykładem masy **Betongrau** firmy Sibelco. Na karcie mamy skurcz przy suszeniu **5,8%** oraz skurcz przy wypale **9,5%** w **1250°C**.",
      },
      {
        type: "image",
        src: "/brand/photos/blog/skurcz-wykres-betongrau.png",
        alt: "Wykres skurczu i absorpcji wody masy Betongrau",
        caption: "karta katalogowa masy Betongrau",
      },
      {
        type: "paragraph",
        text: "Możemy łatwo policzyć, co to oznacza w praktyce.",
      },
      {
        type: "list",
        items: [
          "Najpierw, po wyschnięciu, glina kurczy się o 5,8%, więc zostaje nam: **100% − 5,8% = 94,2%** pierwotnego rozmiaru",
          "Następnie, podczas wypału, zmniejsza się o kolejne 9,5%, czyli: **94,2% − 9,5% = 85,25%**",
          "To oznacza, że na końcu otrzymujemy **85,25% pierwotnego rozmiaru**.",
          "Całkowity skurcz wynosi więc: **100% − 85,25% = 14,75%**",
        ],
      },
      {
        type: "paragraph",
        text: "Można to też zapisać prostym wzorem:",
      },
      {
        type: "formula",
        text: "Skurcz całkowity % = (1 − (1 − S suszenia) × (1 − S wypału)) × 100",
      },
      {
        type: "paragraph",
        text: "Uwaga: ważna jest kolejność — najpierw uwzględniamy skurcz przy suszeniu, a potem przy wypalaniu (procenty działają na to, co zostało).",
      },
      {
        type: "heading",
        text: "To o ile mam zrobić wyższy kubek?",
      },
      {
        type: "paragraph",
        text: "Kiedy mamy już obliczony całkowity skurcz, możemy ustalić, jak duży powinien być wyrób na początku, żeby po wypale miał konkretny wymiar.",
      },
      {
        type: "paragraph",
        text: "Liczymy „w drugą stronę”: zaczynamy od końcowego (mniejszego) rozmiaru i odwracamy procent skurczu.",
      },
      {
        type: "formula",
        text: "Ile razy większe = 1 / (100% − Skurcz całkowity %)",
      },
      {
        type: "paragraph",
        text: "Przykład:",
      },
      {
        type: "list",
        items: [
          "Chcę, żeby mój kubek miał po wypale na 1250°C wysokość **10 cm**.",
          "Obliczam skurcz całkowity: **≈ 14,75%**",
          "Następnie wyliczam, ile razy większy musi być początkowy wymiar: **1 ÷ (100% − 14,75%) ≈ 1,17**",
          "Na koniec mnożę: **10 cm × 1,17 = 11,7 cm**",
          "Czyli kubek powinien mieć na początku około **11,7 cm wysokości**, żeby po wypale osiągnąć 10 cm.",
        ],
      },
      {
        type: "heading",
        text: "Jak obliczyć objętość po wypale?",
      },
      {
        type: "paragraph",
        text: "Opisany wcześniej skurcz dotyczy **wymiaru liniowego**, czyli np. wysokości kubka. Jeśli jednak chcemy obliczyć **objętość**, musimy uwzględnić to trzykrotnie. Dlaczego?",
      },
      {
        type: "paragraph",
        text: "W skrócie: objętość zależy od trzech wymiarów.",
      },
      {
        type: "paragraph",
        text: "Dla przykładu — kostka o boku 1 cm ma objętość:",
      },
      {
        type: "formula",
        text: "1 cm × 1 cm × 1 cm = 1 cm³",
      },
      {
        type: "paragraph",
        text: "Jeśli zwiększymy długość boku dwa razy (do 2 cm), to objętość nie rośnie dwa razy, tylko aż osiem razy:",
      },
      {
        type: "formula",
        text: "2 cm × 2 cm × 2 cm = 8 cm³",
      },
      {
        type: "paragraph",
        text: "Dzieje się tak dlatego, że każdy z trzech wymiarów rośnie osobno, więc długość boku podnosimy do potęgi trzeciej.",
      },
      {
        type: "link",
        prefix: "Jeśli to nadal nie jest do końca jasne, warto obejrzeć film:",
        href: "https://www.youtube.com/results?search_query=What+Happens+If+We+Throw+an+Elephant+From+a+Skyscraper+Life+%26+Size+1",
        label: "What Happens If We Throw an Elephant From a Skyscraper? Life & Size 1",
      },
      {
        type: "paragraph",
        text: "Dlatego przy obliczaniu objętości musimy uwzględnić ten efekt w odpowiednim wzorze:",
      },
      {
        type: "formula",
        text: "Ile razy większa objętość = 1 / (100% − Skurcz całkowity %)³",
      },
      {
        type: "paragraph",
        text: "Szybki przykład:",
      },
      {
        type: "list",
        items: [
          "Załóżmy, że chcę uzyskać kubek o objętości **300 ml**.",
          "Korzystam ze wzoru: **1 ÷ (100% − 14,75%)³ ≈ 1,61**",
          "To oznacza, że początkowa objętość musi być 1,61 razy większa.",
          "Liczymy: **300 ml × 1,61 = 483 ml**",
          "Czyli na początku naczynie powinno mieć około **483 ml** pojemności, żeby po skurczu zostało 300 ml.",
          "Sporo, prawda?",
        ],
      },
      {
        type: "heading",
        text: "Testy!",
      },
      {
        type: "paragraph",
        text: "Okazuje się jednak, że same obliczenia to nie wszystko. Zrobiłem kafelek testowy, który w chwili formowania z wilgotnej gliny miał wymiar **100 × 50 mm**. Po wypale okazało się jednak, że jego długość wynosi **88,5 mm**, co oznacza skurcz **11,5%**, a nie **14,7%**, jak wynikało z wcześniejszych obliczeń.",
      },
      {
        type: "image",
        src: "/brand/photos/blog/skurcz-tester-suwmiarka.png",
        alt: "Pomiar kafłka testowego suwmiarką Mitutoyo",
        caption: "pomiar testera po wypale",
      },
      {
        type: "paragraph",
        text: "Może to wynikać z tego, że glina, której użyłem, była już trochę bardziej podsuszona niż masa świeżo wyjęta z paczki. Możliwe też, że wpływ miało lekkie wypaczenie testera — widać je nawet na zdjęciu.",
      },
      {
        type: "paragraph",
        text: "Niezależnie od przyczyny, bardzo ważne jest, żeby robić własne testy mas ceramicznych. Dzięki temu można lepiej poznać ich właściwości i mieć większą pewność, jak będą się zachowywać w praktyce. Gdy później powtórzyłem testy, otrzymany wynik był już znacznie bliższy obliczonym **14,7%**.",
      },
      {
        type: "heading",
        text: "Czemu znajomość skurczu jest istotna?",
      },
      {
        type: "paragraph",
        text: "Kiedy tworzymy prace na zamówienie albo takie, które muszą pasować do elementów z innych materiałów (np. metalu czy drewna), bardzo ważne jest, żeby końcowe wymiary były dokładnie takie, jak trzeba.",
      },
      {
        type: "image",
        src: "/brand/photos/blog/skurcz-umywalka.png",
        alt: "Umywalka ceramiczna lepiona ręcznie",
        caption: "Umywalka lepiona ręcznie",
      },
      {
        type: "paragraph",
        text: "Dobrym przykładem jest umywalka, którą zrobiłem w zeszłym roku. Wiedząc, jaki odpływ będzie do niej użyty, dokładnie obliczyłem skurcz gliny podczas wypału. Dzięki temu w dniu montażu wszystko idealnie do siebie pasowało i nie było potrzeby niczego szlifować ani poprawiać.",
      },
    ],
  },
  {
    id: "post-walcarka",
    title: "Walcarka do gliny DIY",
    slug: "walcarka-do-gliny-diy",
    excerpt: "Jak samodzielnie zbudować walcarkę do gliny?",
    subtitle: "Jak samodzielnie zbudować walcarkę do gliny?",
    author: "Jędrzej",
    category: "Narzędzia",
    content:
      "Ozdoby świąteczne z płatów gliny, bolące nadgarstki i pomysł na własną walcarkę ze sklejki oraz rur PVC wypełnionych cementem.",
    coverImage: "/brand/photos/blog/walcarka-szkic-rama.png",
    status: "published",
    publishedAt: "2025-10-27T10:00:00+01:00",
    blocks: [
      {
        type: "heading",
        text: "Skąd ten pomysł?",
      },
      {
        type: "paragraph",
        text: "W ciągu ostatnich tygodni zająłem się robieniem ozdób świątecznych. Większość z nich była wykonana z płatów rozwałkowanej gliny. Udało mi się dorwać wałek z kuchni, ale muszę przyznać, że zrobienie dużego i równego placka z gliny wymagało sporo czasu, a po kilku bolały już nadgarstki. Postanowiłem więc poszukać jakiegoś innego rozwiązania, bo wiele razy widziałem w pracowniach specjalne stoły do walcowania. Okazało się jednak, że na chwilę obecną cena takiego urządzenia jest poza moim zasięgiem więc postanowiłem skonstruować coś samemu.",
      },
      {
        type: "heading",
        text: "Poszukiwania rozwiązania.",
      },
      {
        type: "paragraph",
        text: "Natrafiłem na kilka filmów w których pokazana była walcarka składająca się z dwóch wałków pracujących równolegle, połączonych linką. Po krótkim poszukiwaniu udało mi się znaleźć filmik sprzed 9 lat z genialnym projektem na taką walcarkę:",
      },
      {
        type: "link",
        href: "https://ceramicartsnetwork.org/daily/article/DIY-Project-How-to-Make-Your-Very-Own-Slab-Roller",
        label: "DIY Project: How to Make Your Very Own Slab Roller | Dale Savoie",
      },
      {
        type: "paragraph",
        text: "Po obejrzeniu, postanowiłem rozrysować jak może to wyglądać w moim przypadku, żeby mieć pełną świadomość sposobu działania.",
      },
      {
        type: "heading",
        text: "Mój projekt.",
      },
      {
        type: "image-row",
        images: [
          {
            src: "/brand/photos/blog/walcarka-szkic-rama.png",
            alt: "Szkic ramy stołu walcarki do gliny",
          },
          {
            src: "/brand/photos/blog/walcarka-szkic-mechanizm.png",
            alt: "Szkic mechanizmu: regulacja wysokości, prowadzenie linki, rury PVC",
          },
        ],
      },
      {
        type: "paragraph",
        text: "Jak widzicie projekt składa się z mocnej ramy, do której dodajemy wycięte arkusze sklejki jak stół, a przy okazji do regulacji grubości płata. Jako rolka służą nam tutaj dwie rury kanalizacyjne wypełnione cementem (po to żeby bardziej wszystko utwardzić). Rury są połączone stalową linką, która jest zabezpieczona na końcach.",
      },
      {
        type: "paragraph",
        text: "Jak już wszystko rozpisałem, to była pora na listę zakupów, wyszło:",
      },
      {
        type: "list",
        items: [
          "rury kanalizacyjne,",
          "beton szybkowiążący,",
          "linka stalowa,",
          "zaciski do linki,",
          "śruby rzymskie,",
          "sklejka i na stół i drewno na ramę – na to akurat miałem jeszcze trochę resztek ze starych projektów.",
        ],
      },
      {
        type: "paragraph",
        text: "Efekty mojej budowy dodam niebawem…",
      },
    ],
  },
];
