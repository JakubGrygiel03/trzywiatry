# Trzy Wiatry

Sklep pracowni ceramiczno-drewnianej i rezerwacja warsztatów — Next.js App Router.

## Start lokalny

```bash
npm install
npm run dev
```

Wejdź na [http://localhost:3000](http://localhost:3000).

Panel CMS: `/admin/logowanie`. Logowanie wyłącznie z hasłem ustawionym w zmiennych środowiskowych (`.env.local` / Vercel) — nigdy nie commituj haseł ani kluczy.

## Co działa bez kluczy API

- Katalog z filtrem pojemności (80–400 ml+), domen i form
- Karty produktów, warianty szkliw, stany `Wyprzedane` / `Niski stan`
- Koszyk Zustand (persist), pakowanie prezentowe, licznik darmowej dostawy
- Kasa z walidacją Zod i sesją P24 w trybie demo
- Warsztaty z licznikiem miejsc i rezerwacją
- Formularze B2B (NIP), newsletter, kontakt
- Panel admina: KPI, magazyn, zamówienia, ustawienia bannera
- Formularz produktu z uploadem zdjęć (drag & drop, biblioteka, do 8 zdjęć)
- PWA: instalacja sklepu i panelu admina na telefonie / laptopie z poziomu przeglądarki

## Produkcja (Supabase / P24 / Resend)

1. Skopiuj `.env.example` → `.env.local` i uzupełnij klucze lokalnie (plik jest w `.gitignore`).
2. W Supabase uruchom `supabase/schema.sql`.
3. Podmień odczyty z `lib/data/*` na klienta z `lib/supabase/server.ts`.
4. Ustaw CRC Przelewy24 w env — webhook jest pod `/api/webhooks/p24`.

Ceny zawsze w **groszach** (`price_in_cents`). Nie używaj floatów do pieniędzy.
