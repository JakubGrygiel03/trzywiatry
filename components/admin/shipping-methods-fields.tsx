import { AdminField, AdminInput } from "@/components/admin/ui/admin-field";
import { shippingMethodsFrom } from "@/lib/shipping";
import type { StudioSettings } from "@/lib/types";

export function ShippingMethodsFields({ settings }: { settings: StudioSettings }) {
  const methods = shippingMethodsFrom(settings);

  return (
    <div className="space-y-4">
      {methods.map((method) => (
        <div key={method.id} className="grid gap-3 rounded-lg border border-czarny/8 bg-krem/40 p-4 sm:grid-cols-[1fr_140px]">
          <label className="flex items-start gap-3">
            <input type="hidden" name={`ship_${method.id}_enabled`} value="false" />
            <input
              type="checkbox"
              name={`ship_${method.id}_enabled`}
              value="true"
              defaultChecked={method.enabled}
              className="mt-1 accent-czerwony"
            />
            <span>
              <span className="block text-sm font-medium text-czarny">{method.label}</span>
              <span className="mt-0.5 block text-xs text-czarny/45">{method.hint}</span>
            </span>
          </label>
          <AdminField label="Cena (zł)" htmlFor={`ship_${method.id}_zl`}>
            <AdminInput
              id={`ship_${method.id}_zl`}
              name={`ship_${method.id}_zl`}
              type="number"
              min={0}
              step={1}
              defaultValue={Math.round(method.priceInCents / 100)}
            />
          </AdminField>
          <input type="hidden" name={`ship_${method.id}_label`} value={method.label} />
        </div>
      ))}
    </div>
  );
}
