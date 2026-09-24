"use client";

import { CheckoutDiscount, type AppliedDiscount } from "@/components/checkout/checkout-discount";
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
import { P24HandoffNotice } from "@/components/checkout/p24-handoff-notice";
import { useSiteSettings } from "@/components/cms/site-settings-provider";
import { SHIPPING_METHODS } from "@/lib/constants";
import { formatPLN } from "@/lib/format";
import { beginP24Handoff, endP24Handoff, goToP24 } from "@/lib/p24-handoff";
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
  const [state, action, pending] = useActionState(createCheckoutSession, initial);
  const [shippingMethod, setShippingMethod] = useState<(typeof SHIPPING_METHODS)[number]["id"]>("inpost");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [locker, setLocker] = useState("");
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);
  const [email, setEmail] = useState(defaultEmail);
  const settings = useSiteSettings();
  const subtotal = cartSubtotal(items);
  const gift = cartGiftWrapCost(hasGiftWrapping, settings.giftWrapPriceCents, settings.giftWrapEnabled);
  const thresholdLabel = formatPLN(settings.freeShippingThresholdCents);
  const shippingHint =
    subtotal >= settings.freeShippingThresholdCents
      ? `Darmowa dostawa od ${thresholdLabel} — kurier i InPost 0 zł.`
      : `Doliczymy koszt dostawy, jeśli nie osiągniesz ${thresholdLabel}.`;

  useEffect(() => {
    if (!state.ok || !state.redirectTo) return;
    const url = state.redirectTo;
    const toP24 = url.includes("przelewy24") || url.includes("trnRequest");
    if (toP24) {
      goToP24(url);
      return;
    }
    endP24Handoff();
    window.location.assign(url);
  }, [state.ok, state.redirectTo]);

  useEffect(() => {
    if (!state.ok && state.message) endP24Handoff();
  }, [state.ok, state.message]);

  if (pending) {
    return paymentsLive ? (
      <P24HandoffNotice />
    ) : (
      <SurfaceTile>
        <SurfaceTileBody className="sm:py-8">
          <p className="font-heading text-sm uppercase tracking-[0.14em] text-czerwony">Zapisuję zamówienie</p>
          <p className="mt-4 text-lg leading-relaxed">Chwilę… składamy zamówienie w pracowni.</p>
        </SurfaceTileBody>
      </SurfaceTile>
    );
  }

  if (state.ok) {
    const toPayment = Boolean(state.redirectTo?.includes("przelewy24") || state.redirectTo?.includes("trnRequest"));
    if (toPayment) return <P24HandoffNotice />;
    return (
      <SurfaceTile>
        <SurfaceTileBody className="sm:py-8">
          <p className="font-heading text-sm uppercase tracking-[0.14em] text-czerwony">Zamówienie przyjęte</p>
          <p className="mt-4 text-lg leading-relaxed">{state.message}</p>
        </SurfaceTileBody>
      </SurfaceTile>
    );
  }

  if (items.length === 0) {
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

  return (
    <form
      action={action}
      className="grid gap-4 md:gap-5 lg:grid-cols-[1.2fr_0.8fr]"
      noValidate
      onSubmit={() => {
        if (paymentsLive) beginP24Handoff();
      }}
    >
      <input
        type="hidden"
        name="cart"
        value={JSON.stringify(items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })))}
      />
      <input type="hidden" name="hasGiftWrapping" value={String(settings.giftWrapEnabled && hasGiftWrapping)} />
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
              onValueChange={setEmail}
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
            <CheckoutDiscount
              goodsCents={subtotal}
              customerEmail={email}
              applied={discount}
              onApplied={setDiscount}
            />
          </SurfaceTileBody>
        </SurfaceTile>
      </div>

      <CheckoutPayBox
        items={items}
        giftCents={gift}
        discountCode={discount?.code}
        discountCents={discount?.amountCents ?? 0}
        pending={pending}
        paymentsLive={paymentsLive}
        message={state.message}
      />
    </form>
  );
}
