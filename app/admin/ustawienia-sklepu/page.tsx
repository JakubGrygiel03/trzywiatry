import { saveStudioSettings } from "@/app/actions/admin";
import { HeroPhotoPicker } from "@/components/admin/hero-photo-picker";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminFormActions } from "@/components/admin/ui/admin-form-actions";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { getHeroPhotoOptions, getSettings } from "@/lib/data/queries";
import { buildVacationBannerMessage } from "@/lib/vacation-message";

export default async function ShopSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ zapisano?: string }>;
}) {
  const { zapisano } = await searchParams;
  const settings = getSettings();
  const vacationPreview = buildVacationBannerMessage({
    ...settings,
    announcementType: "vacation",
    announcementText:
      settings.announcementType === "vacation"
        ? settings.announcementText
        : "Piec musiał ochłonąć",
  });

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Ustawienia sklepu"
        description="Banner, newsletter, zdjęcia w hero, urlop, darmowa dostawa i widoczność warsztatów."
      />

      {zapisano ? (
        <AdminAlert variant="success">Zapisano. Odśwież sklep — pasek u góry pokazuje aktualny tryb.</AdminAlert>
      ) : null}

      <form action={saveStudioSettings} className="mt-6 space-y-6">
        <AdminFormSection title="Pasek ogłoszeń" description="Widoczny na całej stronie sklepu.">
          <AdminField label="Tryb bannera" htmlFor="announcementType">
            <AdminSelect id="announcementType" name="announcementType" defaultValue={settings.announcementType}>
              <option value="promo">Promocja</option>
              <option value="vacation">Urlop / przerwa twórcza</option>
              <option value="hidden">Ukryty</option>
            </AdminSelect>
          </AdminField>

          <AdminField
            label="Treść bannera"
            htmlFor="announcementText"
            hint="W trybie urlopu wpisz np. „Piec musiał ochłonąć” — daty dopiszą się automatycznie."
          >
            <AdminTextarea
              id="announcementText"
              name="announcementText"
              defaultValue={settings.announcementText}
              placeholder="Piec musiał ochłonąć"
            />
          </AdminField>
        </AdminFormSection>

        <AdminFormSection title="Urlop — daty">
          <div className="grid gap-5 sm:grid-cols-3">
            <AdminField label="Od" htmlFor="vacationStart">
              <AdminInput id="vacationStart" name="vacationStart" type="date" defaultValue={settings.vacationStartDate ?? ""} />
            </AdminField>
            <AdminField label="Do" htmlFor="vacationEnd">
              <AdminInput id="vacationEnd" name="vacationEnd" type="date" defaultValue={settings.vacationEndDate ?? ""} />
            </AdminField>
            <AdminField label="Wysyłka od" htmlFor="vacationDispatch">
              <AdminInput
                id="vacationDispatch"
                name="vacationDispatch"
                type="date"
                defaultValue={settings.vacationDispatchDate ?? ""}
              />
            </AdminField>
          </div>
          <div className="rounded-lg bg-czerwony px-4 py-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-bialy/80">Podgląd paska urlopowego</p>
            <p className="mt-2 text-xs leading-relaxed text-bialy">{vacationPreview}</p>
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Newsletter na stronie"
          description="Belka terracotta na dole strony głównej. {code} w treści zamienia się na kod rabatowy."
        >
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-czarny/8 bg-krem/40 p-4">
            <input
              type="checkbox"
              name="newsletterEnabled"
              value="true"
              defaultChecked={settings.newsletterEnabled}
              className="mt-0.5 accent-czerwony"
            />
            <span className="text-sm">
              <span className="font-medium text-czarny">Pokazuj belkę newslettera</span>
              <span className="mt-1 block text-xs text-czarny/45">
                Wyłączone = brak paska −15% na stronie głównej. Zapis w MailerLite nadal działa, jeśli ktoś ma stary formularz.
              </span>
            </span>
          </label>
          <AdminField label="Etykieta nad tytułem" htmlFor="newsletterEyebrow">
            <AdminInput
              id="newsletterEyebrow"
              name="newsletterEyebrow"
              defaultValue={settings.newsletterEyebrow}
            />
          </AdminField>
          <AdminField label="Tytuł" htmlFor="newsletterTitle">
            <AdminInput id="newsletterTitle" name="newsletterTitle" defaultValue={settings.newsletterTitle} />
          </AdminField>
          <AdminField
            label="Tekst belki"
            htmlFor="newsletterBody"
            hint="Wpisz {code}, żeby wstawić kod z pola „Kod rabatowy” poniżej."
          >
            <AdminTextarea
              id="newsletterBody"
              name="newsletterBody"
              defaultValue={settings.newsletterBody}
            />
          </AdminField>
          <div className="grid gap-5 sm:grid-cols-2">
            <AdminField label="Etykieta formularza" htmlFor="newsletterFormLabel">
              <AdminInput
                id="newsletterFormLabel"
                name="newsletterFormLabel"
                defaultValue={settings.newsletterFormLabel}
              />
            </AdminField>
            <AdminField label="Przycisk" htmlFor="newsletterButtonLabel">
              <AdminInput
                id="newsletterButtonLabel"
                name="newsletterButtonLabel"
                defaultValue={settings.newsletterButtonLabel}
              />
            </AdminField>
          </div>
        </AdminFormSection>

        <AdminFormSection title="Promocje i dostawa">
          <AdminField label="Kod rabatowy (banner i newsletter)" htmlFor="promoCode">
            <AdminInput id="promoCode" name="promoCode" defaultValue={settings.promoCode} />
          </AdminField>
          <AdminField label="Próg darmowej dostawy (grosze)" htmlFor="freeShipping" hint="Np. 30000 = 300 zł (jak w regulaminie)">
            <AdminInput
              id="freeShipping"
              name="freeShipping"
              type="number"
              defaultValue={settings.freeShippingThresholdCents}
            />
          </AdminField>
        </AdminFormSection>

        <AdminFormSection
          title="Zdjęcia w hero"
          description="Kolejność kliknięć = kolejność kadrów na stronie głównej. Puste = automatycznie bestsellery."
        >
          <HeroPhotoPicker options={getHeroPhotoOptions()} initialSlots={settings.heroSlots ?? []} />
        </AdminFormSection>

        <AdminFormSection title="Moduły strony">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-czarny/8 bg-krem/40 p-4">
            <input
              type="checkbox"
              name="workshopsEnabled"
              value="true"
              defaultChecked={settings.workshopsEnabled}
              className="mt-0.5 accent-czerwony"
            />
            <span className="text-sm">
              <span className="font-medium text-czarny">Pokazuj warsztaty na stronie</span>
              <span className="mt-1 block text-xs text-czarny/45">
                Wyłączone = brak w menu, hero i stopce. Włącz, gdy wrócą terminy przy kole.
              </span>
            </span>
          </label>
        </AdminFormSection>

        <AdminFormActions submitLabel="Zapisz ustawienia" cancelHref="/admin" cancelLabel="← Pulpit" />
      </form>
    </div>
  );
}
