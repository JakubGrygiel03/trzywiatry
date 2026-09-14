"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { createCheckoutSession, type CheckoutState } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { useSiteSettings } from "@/components/cms/site-settings-provider";
import { SHIPPING_METHODS } from "@/lib/constants";
import { formatPLN } from "@/lib/format";
import { cartGiftWrapCost, cartSubtotal, useCartStore } from "@/store/use-cart-store";

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

  if (items.length === 0 && !state.ok) {
    return <p className="text-sm text-szary">Koszyk jest pusty.</p>;
  }

  if (state.ok) {
    return (
      <div className="rounded-[28px] bg-krem p-8">
        <p className="font-heading text-sm uppercase tracking-[0.14em] text-czerwony">Zamówienie przyjęte</p>
        <p className="mt-4 text-lg leading-relaxed">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <input
        type="hidden"
        name="cart"
        value={JSON.stringify(items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })))}
      />
      <input type="hidden" name="hasGiftWrapping" value={String(hasGiftWrapping)} />
      <input type="hidden" name="giftMessage" value={giftMessage} />
      <div className="space-y-5">
        <Field name="customerName" label="Imię i nazwisko / Full name" defaultValue={defaultName} />
        <div className="space-y-2">
          <Label htmlFor="customerEmail">
            E-mail <span className="text-czerwony">*</span>
          </Label>
          <Input
            id="customerEmail"
            name="customerEmail"
            type="email"
            autoComplete="email"
            required
            defaultValue={defaultEmail}
            placeholder="you@email.com"
          />
          <p className="text-xs text-czarny/50">
            Na ten adres wyślemy potwierdzenie zamówienia
            {defaultEmail ? "." : ". Możesz też "}
            {!defaultEmail ? (
              <>
                <Link href="/konto/rejestracja" className="text-czerwony underline-offset-2 hover:underline">
                  założyć konto
                </Link>
                , żeby śledzić historię zakupów.
              </>
            ) : null}
          </p>
        </div>
        <Field name="customerPhone" label="Telefon / Phone" type="tel" placeholder="+48 123 456 789" />
        <Field name="street" label="Ulica i numer" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="postalCode" label="Kod pocztowy" placeholder="80-000" />
          <Field name="city" label="Miasto" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shippingMethod">Dostawa</Label>
          <select
            id="shippingMethod"
            name="shippingMethod"
            value={shippingMethod}
            onChange={(event) =>
              setShippingMethod(event.target.value as (typeof SHIPPING_METHODS)[number]["id"])
            }
            className="h-11 w-full rounded-2xl border border-czarny/10 bg-bialy px-4 text-sm"
          >
            {SHIPPING_METHODS.map((method) => (
              <option key={method.id} value={method.id}>
                {method.label} · {formatPLN(method.priceInCents)}
              </option>
            ))}
          </select>
          <p className="text-xs text-szary">{shippingHint}</p>
        </div>
        {shippingMethod === "inpost" ? (
          <Field name="inpostLocker" label="Paczkomat InPost (numer / nazwa)" />
        ) : null}
        <Field
          name="discountCode"
          label="Kod rabatowy"
          placeholder={settings.promoCode?.trim() || "kod z maila"}
          required={false}
        />
        <div className="space-y-2">
          <Label htmlFor="notes">Uwagi</Label>
          <Textarea id="notes" name="notes" />
        </div>
      </div>
      <aside className="h-fit space-y-4 rounded-[28px] bg-krem p-6">
        {items.map((item) => (
          <div key={item.variantId} className="flex justify-between gap-3 text-sm">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span className="font-heading">{formatPLN(item.unitPriceInCents * item.quantity)}</span>
          </div>
        ))}
        {hasGiftWrapping ? (
          <div className="flex justify-between text-sm">
            <span>Pakowanie prezentowe</span>
            <span className="font-heading">{formatPLN(gift)}</span>
          </div>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending
            ? "Składam zamówienie…"
            : paymentsLive
              ? "Zamawiam i płacę (P24 / BLIK)"
              : "Zamawiam"}
        </Button>
        {state.message ? <p className="text-sm text-czerwony">{state.message}</p> : null}
      </aside>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  defaultValue,
  required = true,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required ? <span className="text-czerwony"> *</span> : null}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
      />
    </div>
  );
}
