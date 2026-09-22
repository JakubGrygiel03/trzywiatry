import Link from "next/link";
import { AccountTile, AccountTileBody, AccountTileHeader } from "@/components/account/account-tile";
import { SITE } from "@/lib/constants";
import { formatDate, formatPLN } from "@/lib/format";
import type { StudioSettings } from "@/lib/types";
import { buildVacationBannerMessage } from "@/lib/vacation-message";

const HELP_LINKS = [
  {
    href: "/dostawa-i-zwroty",
    label: "Dostawa i zwroty",
    hint: "InPost, kurier, pakowanie zero stłuczek",
  },
  {
    href: "/poradnik-pielegnacji",
    label: "Pielęgnacja ceramiki",
    hint: "Zmywarka, szok termiczny, formy gipsowe",
  },
  {
    href: "/faq",
    label: "FAQ",
    hint: "Czas realizacji, wymiary rękodzieła",
  },
  {
    href: "/kontakt",
    label: "Kontakt z pracownią",
    hint: "Pytania o zamówienie lub B2B",
  },
] as const;

export function AccountProfileCard({
  name,
  email,
  createdAt,
}: {
  name: string;
  email: string;
  createdAt: string;
}) {
  return (
    <AccountTile>
      <AccountTileHeader eyebrow="Profil" title="Twoje dane" />
      <AccountTileBody>
        <dl className="space-y-3 text-[14px]">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-czarny/6 pb-3">
            <dt className="text-czarny/45">Imię i nazwisko</dt>
            <dd className="font-medium text-czarny">{name}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-czarny/6 pb-3">
            <dt className="text-czarny/45">E-mail</dt>
            <dd className="break-all text-czarny">{email}</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-czarny/45">Konto od</dt>
            <dd className="text-czarny">{formatDate(createdAt)}</dd>
          </div>
        </dl>
      </AccountTileBody>
    </AccountTile>
  );
}

export function AccountStudioNotes({ settings }: { settings: StudioSettings }) {
  const freeShipping = formatPLN(settings.freeShippingThresholdCents);
  const giftWrap = formatPLN(settings.giftWrapPriceCents);
  const onVacation = settings.announcementType === "vacation";
  const vacationNote = onVacation ? buildVacationBannerMessage(settings) : null;

  return (
    <AccountTile>
      <AccountTileHeader eyebrow="Aktualności" title="Pracownia teraz" />
      <AccountTileBody>
        <ul className="space-y-3 text-[14px] leading-relaxed text-czarny/75">
          {vacationNote ? (
            <li className="rounded-2xl bg-czerwony/10 px-3.5 py-3 text-czerwony">{vacationNote}</li>
          ) : (
            <li>Zamówienia pakujemy i nadajemy na bieżąco z Gdańska.</li>
          )}
          <li>
            Darmowa dostawa od <strong className="text-czarny">{freeShipping}</strong>.
          </li>
          {settings.giftWrapEnabled ? (
            <li>
              Pakowanie na prezent: <strong className="text-czarny">{giftWrap}</strong> (pudełko, wstążka,
              bilecik).
            </li>
          ) : null}
          {settings.workshopsEnabled ? (
            <li>
              Warsztaty ceramiczne —{" "}
              <Link href="/warsztaty" className="text-czerwony underline underline-offset-2">
                zobacz terminy
              </Link>
            </li>
          ) : null}
        </ul>
      </AccountTileBody>
    </AccountTile>
  );
}

export function AccountHelpLinks() {
  return (
    <div className="space-y-4">
      <AccountTile>
        <AccountTileHeader
          eyebrow="Wsparcie"
          title="Pomoc i informacje"
          description="Wszystko, czego zwykle szukasz przy zamówieniu."
        />
        <ul className="divide-y divide-czarny/8">
          {HELP_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-krem/40 sm:px-7"
              >
                <span>
                  <span className="block font-heading text-[13px] uppercase tracking-[0.12em] text-czarny">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-[13px] text-czarny/50">{item.hint}</span>
                </span>
                <span className="mt-0.5 font-heading text-[12px] text-czerwony" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </AccountTile>

      <AccountTile>
        <AccountTileHeader eyebrow="Pracownia" title="Kontakt bezpośredni" />
        <AccountTileBody className="space-y-1.5 text-[14px] text-czarny/75">
          <p>
            <a href={`mailto:${SITE.email}`} className="text-czarny hover:text-czerwony">
              {SITE.email}
            </a>
          </p>
          <p>
            <a href={SITE.phoneHref} className="text-czarny hover:text-czerwony">
              {SITE.phone}
            </a>
          </p>
          <p className="text-czarny/55">{SITE.address}</p>
        </AccountTileBody>
      </AccountTile>
    </div>
  );
}
