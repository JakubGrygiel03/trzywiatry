"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { createCheckoutSession } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { SHIPPING_METHODS } from "@/lib/constants";
import { studioSettings } from "@/lib/data/settings";
import { formatPLN } from "@/lib/format";
import { cartGiftWrapCost, cartSubtotal, useCartStore } from "@/store/use-cart-store";

const initial = { ok: false, message: "" };

export function CheckoutForm({
  defaultEmail = "",
  defaultName = "",
}: {
  defaultEmail?: string;
  defaultName?: string;
}) {
  const items = useCartStore((state) => state.items);
  const hasGiftWrapping = useCartStore((state) => state.hasGiftWrapping);
  const giftMessage = useCartStore((state) => state.giftMessage);
  const clear = useCartStore((state) => state.clear);
  const [state, action, pending] = useActionState(createCheckoutSession, initial);
  const subtotal = cartSubtotal(items);
  const gift = cartGiftWrapCost(hasGiftWrapping);
  const thresholdLabel = formatPLN(studioSettings.freeShippingThresholdCents);
  const shippingHint =
    subtotal >= studioSettings.freeShippingThresholdCents
      ? `Darmowa dostawa od ${thresholdLabel} — kurier i InPost 0 zł.`
      : `Doliczymy koszt dostawy, jeśli nie osiągniesz ${thresholdLabel}.`;

  useEffect(() => {
    if (state.ok) clear();
  }, [state.ok, clear]);

  if (items.length === 0 && !state.ok) {
    return <p className="text-sm text-szary">Koszyk jest pusty.</p>;
  }

  if (state.ok) {
    return (
      <div className="rounded-[28px] bg-krem p-8">
        <p className="font-heading text-sm uppercase tracking-[0.14em] text-czerwony">Zamówienie przyjęte</p>
        <p className="mt-4 text-lg leading-relaxed">{state.message}</p>
        <p className="mt-3 text-sm text-czarny/60">
          Na podany e-mail poszło potwierdzenie złożenia zamówienia i startu realizacji. Status
          możesz dalej zmieniać w panelu admina — klient dostanie kolejnego maila.
        </p>
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
        <Field name="customerName" label="Imię i nazwisko" defaultValue={defaultName} />
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
            placeholder="np. anna@email.pl"
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
        <Field name="customerPhone" label="Telefon" type="tel" />
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
            defaultValue="inpost"
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
        <Field name="inpostLocker" label="Paczkomat InPost (opcjonalnie)" required={false} />
        <Field name="discountCode" label="Kod rabatowy" placeholder="WIOSNA" required={false} />
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
          {pending ? "Składam zamówienie…" : "Zamawiam i płacę (P24 / BLIK)"}
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
