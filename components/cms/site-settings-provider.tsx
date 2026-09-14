"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultStudioSettings } from "@/lib/data/settings";
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
  return useContext(SiteSettingsContext) ?? defaultStudioSettings;
}
