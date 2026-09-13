"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StudioSettings } from "@/lib/types";

const SiteSettingsContext = createContext<StudioSettings | null>(null);

/** Passes admin CMS settings into client leaves (cart, checkout). */
export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: StudioSettings;
  children: ReactNode;
}) {
  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const settings = useContext(SiteSettingsContext);
  if (!settings) {
    throw new Error("useSiteSettings must be used under SiteSettingsProvider.");
  }
  return settings;
}
