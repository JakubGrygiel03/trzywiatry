import type { Metadata } from "next";
import type { ReactNode } from "react";
import { connection } from "next/server";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SiteSettingsProvider } from "@/components/cms/site-settings-provider";
import { Footer } from "@/components/layout/footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getSettings } from "@/lib/data/queries";
import { noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
  robots: noIndexRobots,
};

export default async function AccountLayout({ children }: { children: ReactNode }) {
  await connection();
  await ensureAtelierHydrated();
  const settings = getSettings();
  const announcementHidden = settings.announcementType === "hidden";

  return (
    <SiteSettingsProvider settings={settings}>
      <div
        className="site-shell flex min-h-screen flex-col"
        data-announcement={announcementHidden ? "off" : "on"}
      >
        <SiteHeader />
        <main className="flex-1 pt-6 pb-12 md:pt-8 md:pb-16">{children}</main>
        <Footer />
        <CartDrawer />
      </div>
    </SiteSettingsProvider>
  );
}
