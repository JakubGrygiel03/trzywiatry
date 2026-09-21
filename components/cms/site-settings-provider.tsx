"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultStudioSettings } from "@/lib/data/settings";
import type { StudioSettings } from "@/lib/types";

const SiteSettingsContext = createContext<StudioSettings | null>(null);
const PaymentsEnabledContext = createContext(false);

/** Passes admin CMS settings into client leaves (cart, checkout). */
export function SiteSettingsProvider({
  settings,
  paymentsEnabled = false,
  children,
}: {
  settings: StudioSettings;
  /** Server-side PAYMENTS_ENABLED gate — cart/checkout UI. */
  paymentsEnabled?: boolean;
  children: ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      <PaymentsEnabledContext.Provider value={paymentsEnabled}>{children}</PaymentsEnabledContext.Provider>
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext) ?? defaultStudioSettings;
}

export function usePaymentsEnabled() {
  return useContext(PaymentsEnabledContext);
}
