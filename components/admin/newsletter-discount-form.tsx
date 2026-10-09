import { saveNewsletterDiscount } from "@/app/actions/admin-newsletter";
import { AdminField, AdminInput } from "@/components/admin/ui/admin-field";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import { formatNewsletterDiscount } from "@/lib/discount";

export function NewsletterDiscountForm({ percent }: { percent: number }) {
  return (
    <form action={saveNewsletterDiscount}>
      <AdminFormSection
        title="Rabat za zapis"
        description={`Jednorazowy kod TW-XXXXXX z zapisu na listę. Teraz ${formatNewsletterDiscount(percent)} towaru, bez dostawy.`}
      >
        <div className="flex flex-wrap items-end gap-3">
          <AdminField
            label="Procent zniżki"
            htmlFor="newsletterDiscountPercent"
            hint="5–30. Na naczyniach z niską marżą trzymaj bliżej 10."
            className="w-40"
          >
            <AdminInput
              id="newsletterDiscountPercent"
              name="newsletterDiscountPercent"
              type="number"
              min={5}
              max={30}
              defaultValue={percent}
            />
          </AdminField>
          <button
            type="submit"
            className="rounded-lg bg-czarny px-3.5 py-2 text-xs font-medium text-bialy transition hover:bg-czerwony"
          >
            Zapisz rabat
          </button>
        </div>
      </AdminFormSection>
    </form>
  );
}
