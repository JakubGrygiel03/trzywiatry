import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SiteSettingsProvider } from "@/components/cms/site-settings-provider";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { Footer } from "@/components/layout/footer";
import { ScrollToTopOnNavigate } from "@/components/layout/scroll-to-top-on-navigate";
import { SiteHeader } from "@/components/layout/site-header";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getSettings } from "@/lib/data/queries";

export default async function PublicLayout({ children }: { children: ReactNode }) {
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
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <CookieConsent />
        <Suspense fallback={null}>
          <ScrollToTopOnNavigate />
        </Suspense>
      </div>
    </SiteSettingsProvider>
  );
}
