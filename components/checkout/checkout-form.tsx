"use client";

import { CheckoutField } from "@/components/checkout/checkout-field";
import { CheckoutPayBox } from "@/components/checkout/checkout-pay-box";
import { CheckoutShipping } from "@/components/checkout/checkout-shipping";
import { EmailField } from "@/components/forms/email-field";
import { PhoneField } from "@/components/forms/phone-field";
import { TextField } from "@/components/forms/text-field";
import { Label, Textarea } from "@/components/ui/field";
import { SurfaceTile, SurfaceTileBody, SurfaceTileHeader } from "@/components/ui/surface-tile";
import { useActionState, useEffect, useState } from "react";
import { createCheckoutSession, type CheckoutState } from "@/app/actions/checkout";
import { useSiteSettings } from "@/components/cms/site-settings-provider";
import { SHIPPING_METHODS } from "@/lib/constants";
import { formatPLN } from "@/lib/format";
import { cartGiftWrapCost, cartSubtotal, useCartStore } from "@/store/use-cart-store";
import Link from "next/link";
import dynamic from "next/dynamic";

const creamField =
  "h-12 rounded-2xl border-czarny/8 bg-krem placeholder:text-czarny/35 focus:border-czerwony focus:bg-bialy";

const InpostLockerPicker = dynamic(
  () =>
    import("@/components/checkout/inpost-locker-picker").then((mod) => ({
      default: mod.InpostLockerPicker,
    })),
  {
    ssr: false,
    loading: () => <p className="text-sm text-czarny/50">Ładowanie paczkomatów…</p>,
  },
);

const initial: CheckoutState = { ok: false, message: "" };

export function CheckoutForm({
  defaultEmail = "",
  defaultName = "",
  paymentsLive = false,
}: {
  defaultEmail?: string;
  defaultName?: string;
  paymentsLive?: boolean;
}) {
  const items = useCartStore((state) => state.items);
  const hasGiftWrapping = useCartStore((state) => state.hasGiftWrapping);
  const giftMessage = useCartStore((state) => state.giftMessage);
  const clear = useCartStore((state) => state.clear);
  const [state, action, pending] = useActionState(createCheckoutSession, initial);
  const [shippingMethod, setShippingMethod] = useState<(typeof SHIPPING_METHODS)[number]["id"]>("inpost");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [locker, setLocker] = useState("");
  const settings = useSiteSettings();
  const subtotal = cartSubtotal(items);
  const gift = cartGiftWrapCost(hasGiftWrapping, settings.giftWrapPriceCents);
  const thresholdLabel = formatPLN(settings.freeShippingThresholdCents);
  const shippingHint =
    subtotal >= settings.freeShippingThresholdCents
      ? `Darmowa dostawa od ${thresholdLabel} — kurier i InPost 0 zł.`
      : `Doliczymy koszt dostawy, jeśli nie osiągniesz ${thresholdLabel}.`;

  useEffect(() => {
    if (!state.ok || !state.redirectTo) return;
    clear();
    window.location.assign(state.redirectTo);
  }, [state.ok, state.redirectTo, clear]);

  // Safety net — CheckoutGate usually catches empty carts first.
  if (items.length === 0 && !state.ok) {
    return (
      <SurfaceTile>
        <SurfaceTileBody className="space-y-4">
          <p className="text-sm text-czarny/50">Koszyk jest pusty.</p>
          <Link href="/sklep" className="text-sm text-czerwony underline-offset-2 hover:underline">
            Przejdź do sklepu
          </Link>
        </SurfaceTileBody>
      </SurfaceTile>
    );
  }

  if (state.ok) {
    return (
      <SurfaceTile>
        <SurfaceTileBody className="sm:py-8">
          <p className="font-heading text-sm uppercase tracking-[0.14em] text-czerwony">
            Zamówienie przyjęte
          </p>
          <p className="mt-4 text-lg leading-relaxed">{state.message}</p>
        </SurfaceTileBody>
      </SurfaceTile>
    );
  }

  return (
    <form action={action} className="grid gap-4 md:gap-5 lg:grid-cols-[1.2fr_0.8fr]" noValidate>
      <input
        type="hidden"
        name="cart"
        value={JSON.stringify(items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })))}
      />
      <input type="hidden" name="hasGiftWrapping" value={String(hasGiftWrapping)} />
      <input type="hidden" name="giftMessage" value={giftMessage} />

      <div className="space-y-4 md:space-y-5">
        <SurfaceTile>
          <SurfaceTileHeader eyebrow="Dane" title="Dostawa" />
          <SurfaceTileBody className="space-y-5">
            <TextField
              name="customerName"
              label="Imię i nazwisko / Full name"
              defaultValue={defaultName}
              inputClassName={creamField}
              labelClassName="text-czerwony/80"
            />
            <EmailField
              name="customerEmail"
              label="E-mail"
              defaultValue={defaultEmail}
              placeholder="jan@example.pl"
              inputClassName={creamField}
              labelClassName="text-czerwony/80"
              hint={
                defaultEmail
                  ? "Na ten adres wyślemy potwierdzenie zamówienia."
                  : undefined
              }
            />
            {!defaultEmail ? (
              <p className="-mt-3 text-xs text-czarny/50">
                Na ten adres wyślemy potwierdzenie. Możesz też{" "}
                <Link href="/konto/rejestracja" className="text-czerwony underline-offset-2 hover:underline">
                  założyć konto
                </Link>
                , żeby śledzić historię zakupów.
              </p>
            ) : null}
            <PhoneField
              name="customerPhone"
              label="Telefon / Phone"
              inputClassName={creamField}
              labelClassName="text-czerwony/80"
            />
            <CheckoutField name="street" label="Ulica i numer" />
            <div className="grid gap-5 sm:grid-cols-2">
              <CheckoutField
                name="postalCode"
                label="Kod pocztowy"
                placeholder="80-000"
                value={postalCode}
                onChange={setPostalCode}
              />
              <CheckoutField name="city" label="Miasto" value={city} onChange={setCity} />
            </div>
          </SurfaceTileBody>
        </SurfaceTile>

        <SurfaceTile>
          <SurfaceTileHeader eyebrow="Wysyłka" title="Sposób dostawy" />
          <SurfaceTileBody className="space-y-5">
            <CheckoutShipping value={shippingMethod} onChange={setShippingMethod} hint={shippingHint} />
            {shippingMethod === "inpost" ? (
              <InpostLockerPicker postalCode={postalCode} city={city} value={locker} onChange={setLocker} />
            ) : null}
          </SurfaceTileBody>
        </SurfaceTile>

        <SurfaceTile>
          <SurfaceTileHeader eyebrow="Dodatki" title="Uwagi i kod" />
          <SurfaceTileBody className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-czerwony/80">
                Uwagi
              </Label>
              <Textarea
                id="notes"
                name="notes"
                className="min-h-28 rounded-2xl border-czarny/8 bg-krem placeholder:text-czarny/35 focus:border-czerwony focus:bg-bialy"
              />
            </div>
            <CheckoutField
              name="discountCode"
              label="Kod rabatowy (opcjonalnie)"
              hint="Tylko jeśli masz kod z maila — nie jest wymagany."
              required={false}
            />
          </SurfaceTileBody>
        </SurfaceTile>
      </div>

      <CheckoutPayBox
        items={items}
        giftCents={gift}
        pending={pending}
        paymentsLive={paymentsLive}
        message={state.message}
      />
    </form>
  );
}
