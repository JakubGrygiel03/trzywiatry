import { SHIPPING_METHODS } from "@/lib/constants";
import type { ShippingMethod, ShippingMethodDef, StudioSettings } from "@/lib/types";

export const DEFAULT_SHIPPING_METHODS: ShippingMethodDef[] = [
  {
    id: "inpost",
    label: SHIPPING_METHODS.find((row) => row.id === "inpost")?.label ?? "Paczkomat InPost",
    priceInCents: SHIPPING_METHODS.find((row) => row.id === "inpost")?.priceInCents ?? 2000,
    enabled: true,
    hint: "Odbiór 24/7 — paczkomat wybierzesz na mapie.",
  },
  {
    id: "kurier",
    label: SHIPPING_METHODS.find((row) => row.id === "kurier")?.label ?? "Kurier",
    priceInCents: SHIPPING_METHODS.find((row) => row.id === "kurier")?.priceInCents ?? 3000,
    enabled: true,
    hint: "Dostawa pod wskazany adres.",
  },
  {
    id: "odbior",
    label: "Odbiór w pracowni",
    priceInCents: 0,
    enabled: false,
    hint: "Oddamy naczynie w Gdańsku — bez paczki.",
  },
];

export function shippingMethodsFrom(settings?: Pick<StudioSettings, "shippingMethods"> | null) {
  const saved = settings?.shippingMethods;
  return DEFAULT_SHIPPING_METHODS.map((fallback) => {
    const row = saved?.find((item) => item.id === fallback.id);
    if (!row) return fallback;
    return {
      ...fallback,
      label: row.label?.trim() || fallback.label,
      priceInCents: Number.isFinite(row.priceInCents) ? Math.max(0, Math.round(row.priceInCents)) : fallback.priceInCents,
      enabled: row.enabled !== false,
      hint: row.hint?.trim() || fallback.hint,
    };
  });
}

export function enabledShippingMethods(settings?: Pick<StudioSettings, "shippingMethods"> | null) {
  return shippingMethodsFrom(settings).filter((row) => row.enabled);
}

export function findShippingMethod(
  id: string | undefined,
  settings?: Pick<StudioSettings, "shippingMethods"> | null,
) {
  return shippingMethodsFrom(settings).find((row) => row.id === id);
}

export function shippingMethodLabel(
  id: string,
  settings?: Pick<StudioSettings, "shippingMethods"> | null,
) {
  return findShippingMethod(id, settings)?.label ?? id;
}

export function isEnabledShippingMethod(
  id: string,
  settings?: Pick<StudioSettings, "shippingMethods"> | null,
): id is ShippingMethod {
  return enabledShippingMethods(settings).some((row) => row.id === id);
}
