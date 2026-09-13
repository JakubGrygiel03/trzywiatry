import Link from "next/link";
import { saveStudioSettings } from "@/app/actions/admin";
import { CmsTokenField } from "@/components/admin/cms-token-field";
import { ShopHubPhotoPicker } from "@/components/admin/shop-hub-photo-picker";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminField, AdminInput, AdminSelect } from "@/components/admin/ui/admin-field";
import { AdminFormActions } from "@/components/admin/ui/admin-form-actions";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { getSettings, getShopHubPhotoOptions } from "@/lib/data/queries";
import { buildVacationBannerMessage } from "@/lib/vacation-message";

export default async function ShopSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ zapisano?: string; blad?: string }>;
}) {
  const { zapisano, blad } = await searchParams;
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
        description="Banner, urlop, kod rabatowy, darmowa dostawa, warsztaty i zdjęcia na wejściu do sklepu."
      />

      {zapisano ? (
        <AdminAlert variant="success">Zapisano. Odśwież sklep — pasek u góry pokazuje aktualny tryb.</AdminAlert>
      ) : null}
      {blad ? <AdminAlert variant="error">{blad}</AdminAlert> : null}

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
            hint="W urlopie wpisz np. „Piec musiał ochłonąć” — daty dopiszą się same."
          >
            <CmsTokenField
              id="announcementText"
              name="announcementText"
              multiline
              defaultValue={settings.announcementText}
              tokens={["code", "freeShipping"]}
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

        <AdminFormSection title="Promocje i dostawa">
          <AdminField
            label="Kod rabatowy (banner, newsletter i kasa)"
            htmlFor="promoCode"
            hint="Zmiana tu podmienia {code} we wszystkich komponentach — nie wpisuj nazwy promocji w treść paska."
          >
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
          title="Zdjęcia na wejściu do sklepu"
          description="Kafelki „dwa sklepy” na /sklep. Wybierz jedno zdjęcie z katalogu danej półki."
        >
          <ShopHubPhotoPicker
            uzytkowaOptions={getShopHubPhotoOptions("uzytkowa")}
            pracowniaOptions={getShopHubPhotoOptions("pracownia")}
            initialUzytkowa={settings.shopHubUzytkowaImage}
            initialPracownia={settings.shopHubPracowniaImage}
          />
        </AdminFormSection>

        <AdminFormSection title="Moduły strony">
          <p className="text-sm text-czarny/55">
            Kolejność i teksty strony głównej edytujesz w{" "}
            <Link href="/admin/strona-glowna" className="text-czerwony underline-offset-2 hover:underline">
              Treści → Strona główna
            </Link>
            .
          </p>
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
