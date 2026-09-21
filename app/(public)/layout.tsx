import type { ReactNode } from "react";
import { Suspense } from "react";
import { connection } from "next/server";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SiteSettingsProvider } from "@/components/cms/site-settings-provider";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { Footer } from "@/components/layout/footer";
import { PrefetchWarmRoutes } from "@/components/layout/prefetch-warm-routes";
import { ScrollToTopOnNavigate } from "@/components/layout/scroll-to-top-on-navigate";
import { SiteHeader } from "@/components/layout/site-header";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getSettings } from "@/lib/data/queries";
import { resolvePaymentAccess } from "@/lib/payment-access";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  await connection();
  await ensureAtelierHydrated();
  const settings = getSettings();
  const announcementHidden = settings.announcementType === "hidden";
  const paymentAccess = await resolvePaymentAccess();

  return (
    <SiteSettingsProvider settings={settings} paymentAccess={paymentAccess}>
      <div
        className="site-shell flex min-h-screen w-full max-w-full flex-col"
        data-announcement={announcementHidden ? "off" : "on"}
      >
        <SiteHeader />
        <div className="site-frame flex min-h-0 flex-1 flex-col">
          <main className="min-w-0 max-w-full flex-1 overflow-x-clip">{children}</main>
          <Footer />
        </div>
        <CartDrawer />
        <CookieConsent />
        <Suspense fallback={null}>
          <ScrollToTopOnNavigate />
        </Suspense>
        <PrefetchWarmRoutes />
      </div>
    </SiteSettingsProvider>
  );
}
