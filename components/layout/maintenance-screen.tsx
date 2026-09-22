import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SITE } from "@/lib/constants";

/** In-page lock for /sklep, /koszyk, /zamowienie, /kolekcje — site chrome stays. */
export function MaintenanceScreen() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-krem px-6 py-16">
      <meta name="robots" content="noindex, nofollow" />
      <div className="w-full max-w-md rounded-[2rem] border border-czarny/8 bg-bialy px-8 py-10 text-center shadow-[0_28px_70px_-32px_rgb(1_1_1_/_0.45)]">
        <div className="flex justify-center">
          <Logo priority />
        </div>
        <p className="mt-8 font-heading text-[10px] uppercase tracking-[0.24em] text-czerwony">
          Sklep
        </p>
        <h1 className="mt-3 font-heading text-2xl uppercase leading-[1.15] tracking-[0.06em] text-czarny md:text-3xl">
          Przerwa techniczna
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-czarny/65">
          Katalog i zamówienia są chwilowo zamknięte — inwentaryzacja albo nowy wypust. Reszta strony działa.
        </p>
        <p className="mt-4 text-sm text-szary">
          Pytania:{" "}
          <a href={`mailto:${SITE.email}`} className="text-czerwony underline-offset-2 hover:underline">
            {SITE.email}
          </a>
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-full bg-czerwony px-5 py-3 font-heading text-[11px] uppercase tracking-[0.18em] text-bialy hover:bg-ceglany"
        >
          Wróć na stronę główną
        </Link>
      </div>
    </div>
  );
}
