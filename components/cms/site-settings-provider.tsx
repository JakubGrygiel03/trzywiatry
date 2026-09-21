"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultStudioSettings } from "@/lib/data/settings";
import type { StudioSettings } from "@/lib/types";

type PaymentUiAccess = {
  /** Show “płatności niedostępne” to shoppers when false. */
  isPublic: boolean;
  /** This browser may start P24 (public or admin tester). */
  canPay: boolean;
  isTester: boolean;
};

const SiteSettingsContext = createContext<StudioSettings | null>(null);
const PaymentAccessContext = createContext<PaymentUiAccess>({
  isPublic: false,
  canPay: false,
  isTester: false,
});

/** Passes admin CMS settings into client leaves (cart, checkout). */
export function SiteSettingsProvider({
  settings,
  paymentAccess,
  children,
}: {
  settings: StudioSettings;
  paymentAccess?: PaymentUiAccess;
  children: ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      <PaymentAccessContext.Provider
        value={paymentAccess ?? { isPublic: false, canPay: false, isTester: false }}
      >
        {children}
      </PaymentAccessContext.Provider>
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext) ?? defaultStudioSettings;
}

export function usePaymentAccess() {
  return useContext(PaymentAccessContext);
}

/** @deprecated Prefer usePaymentAccess().canPay */
export function usePaymentsEnabled() {
  return useContext(PaymentAccessContext).canPay;
}
